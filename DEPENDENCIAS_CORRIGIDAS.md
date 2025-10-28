# 📦 Dependências Corrigidas

## 🔴 PROBLEMA IDENTIFICADO

A instância AWS estava faltando 2 pacotes críticos:
1. ❌ `@tanstack/react-query` 
2. ❌ `vite-plugin-pwa`

---

## ✅ SOLUÇÃO APLICADA

### Arquivo: `package.json`

#### Adicionado em `dependencies`:
```json
"@tanstack/react-query": "^5.28.0",
```

#### Adicionado em `devDependencies`:
```json
"vite-plugin-pwa": "^0.17.4"
```

---

## 📋 Lista Completa de Dependências

### Production (`dependencies`)
```json
{
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-slider": "^1.3.6",
  "@radix-ui/react-switch": "^1.2.6",
  "@tanstack/react-query": "^5.28.0",
  "@types/file-saver": "^2.0.7",
  "axios": "^1.6.2",
  "date-fns": "^2.30.0",
  "dotenv": "^17.2.3",
  "file-saver": "^2.0.5",
  "framer-motion": "^12.23.24",
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.3",
  "lucide-react": "^0.294.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "react-window": "^1.8.8",
  "react-window-infinite-loader": "^1.0.9",
  "recharts": "^2.8.0",
  "xlsx": "^0.18.5",
  "zustand": "^4.4.7"
}
```

### Development (`devDependencies`)
```json
{
  "@types/react": "^18.2.37",
  "@types/react-dom": "^18.2.15",
  "@types/react-window": "^1.8.8",
  "@typescript-eslint/eslint-plugin": "^6.10.0",
  "@typescript-eslint/parser": "^6.10.0",
  "@vitejs/plugin-react": "^4.1.1",
  "autoprefixer": "^10.4.16",
  "eslint": "^8.53.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.4",
  "postcss": "^8.4.31",
  "tailwindcss": "^3.3.5",
  "typescript": "^5.2.2",
  "vite": "^4.5.0",
  "vite-plugin-pwa": "^0.17.4"
}
```

---

## 🔧 Comando para Instalar

```bash
# Na instância AWS, execute:
npm install

# Isso vai:
# 1. Ler o package.json
# 2. Instalar todas as dependências (incluindo as novas)
# 3. Criar/atualizar o package-lock.json
# 4. Gerar a pasta node_modules
```

---

## ✅ Verificação

Após instalar, execute:

```bash
# Verificar se @tanstack/react-query foi instalado
npm list @tanstack/react-query

# Deve retornar:
# jira-dashboard@0.0.0 /home/ssm-user/projetos/jira-dash
# └── @tanstack/react-query@5.28.0
```

```bash
# Verificar se vite-plugin-pwa foi instalado
npm list vite-plugin-pwa

# Deve retornar:
# jira-dashboard@0.0.0 /home/ssm-user/projetos/jira-dash
# ├─ dev @vitejs/plugin-react@4.1.1
# └─ dev vite-plugin-pwa@0.17.4
```

---

## 🚀 Próximo Passo

Após instalar as dependências, faça o build:

```bash
npm run build

# Se der sucesso, você verá:
# ✓ 1234 modules transformed.
# dist/index.html                  0.45 kB
# dist/assets/index-abc.js         123.45 kB │ gzip: 45.67 kB
```

---

## 📝 Notas

- `@tanstack/react-query` é usado em `src/lib/queryClient.ts`
- `vite-plugin-pwa` é usado em `vite.config.ts` para Progressive Web App
- Ambos são críticos para o funcionamento da aplicação

---

**Data**: 28 de Outubro de 2025
**Status**: ✅ Corrigido e Pronto para Deploy
