import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

const options = {
  key: fs.readFileSync('/etc/ssl/private/jira-dashboard.key'),
  cert: fs.readFileSync('/etc/ssl/certs/jira-dashboard.crt'),
};

// 🔧 PROXY para requisicoes da API
async function proxyRequest(targetUrl, req, res) {
  const protocol = targetUrl.startsWith('https') ? https : http;

  try {
    const url = new URL(targetUrl);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: url.hostname,
      },
      rejectUnauthorized: false, // ⚠️ Para SSL auto-assinado da Jira
    };

    // ✅ Repassar Authorization do usuário
    if (req.headers.authorization) {
      options.headers['authorization'] = req.headers.authorization;
      console.log('✅ Auth header repassado ao proxy');
    }

    return new Promise((resolve, reject) => {
      const proxyReq = protocol.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        proxyRes.on('end', resolve);
        proxyRes.on('error', reject);
      });

      proxyReq.on('error', reject);

      // Repassar body se existir
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
    });
  } catch (error) {
    console.error('❌ Erro no proxy:', error.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy error', details: error.message }));
  }
}

const server = https.createServer(options, async (req, res) => {
  // ✅ ADICIONAR HEADERS DE CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 🔧 PROXY para requisições de API
  if (req.url.startsWith('/api/jira/')) {
    const jiraPath = req.url.replace('/api/jira', '');
    const targetUrl = `https://superlogica.atlassian.net${jiraPath}`;
    console.log(`📡 Proxying: ${req.method} ${req.url} -> ${targetUrl}`);
    await proxyRequest(targetUrl, req, res);
    return;
  }

  // 📄 Servir arquivos estáticos
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);

  if (!filePath.startsWith(distDir)) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(distDir, 'index.html'), (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(3000, () => {
  console.log('✅ HTTPS rodando em https://3.83.28.223:3000');
  console.log('✅ Proxy ativo para requisições de API');
  console.log('📁 Dist:', distDir);
});
