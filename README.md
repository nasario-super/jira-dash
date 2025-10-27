# Dashboard Executivo Jira

Um dashboard executivo moderno e responsivo para visualização de dados do Jira, incluindo projetos, sprints, cards, incidentes e métricas de performance da equipe.

## 🚀 Funcionalidades

- **Métricas Principais (KPIs)**: Total de issues abertas, concluídas, taxa de conclusão, tempo médio de resolução, velocity e issues em atraso
- **Visualizações Gráficas**: Gráficos de burndown, issues por status/tipo, velocity do time, distribuição por prioridade
- **Filtros Avançados**: Filtro por projeto, sprint, tipo de issue, status, responsável, prioridade e período
- **Atividade Recente**: Lista das últimas issues atualizadas com links diretos para o Jira
- **Layout Responsivo**: Interface adaptável para desktop, tablet e mobile
- **Integração Completa**: Conecta-se diretamente à API do Jira Cloud

## 🛠️ Stack Tecnológica

- **Frontend**: React 18+ com TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **API**: Axios para integração com Jira REST API
- **Estado**: React Context API e hooks customizados
- **Roteamento**: React Router v6
- **Build**: Vite

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Jira Cloud com permissões de API
- Token de API do Jira

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd jira-dashboard
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   
   Copie o arquivo de exemplo:
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas credenciais do Jira:
   ```env
   VITE_JIRA_DOMAIN=sua-empresa.atlassian.net
   VITE_JIRA_EMAIL=seu-email@empresa.com
   VITE_JIRA_API_TOKEN=seu-token-aqui
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔧 Configuração do Jira

### 1. Criar Token de API

1. Acesse [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Clique em "Create API token"
3. Dê um nome para o token (ex: "Dashboard Jira")
4. Copie o token gerado
5. Cole o token no arquivo `.env`

### 2. Verificar Permissões

Certifique-se de que sua conta tem acesso aos projetos que deseja visualizar no dashboard.

### 3. Configurar Variáveis

```env
# Domínio do seu Jira (sem https://)
VITE_JIRA_DOMAIN=minha-empresa.atlassian.net

# Email da sua conta Jira
VITE_JIRA_EMAIL=meu-email@empresa.com

# Token de API gerado
VITE_JIRA_API_TOKEN=ATATT3xFfGF0...
```

## 📊 Funcionalidades do Dashboard

### Métricas Principais
- **Issues Abertas**: Total de issues não concluídas
- **Concluídas (Mês)**: Issues concluídas no mês atual
- **Taxa de Conclusão**: Percentual de issues concluídas
- **Tempo Médio**: Tempo médio de resolução em dias
- **Velocity Atual**: Story points concluídos na sprint ativa
- **Em Atraso**: Issues com data de vencimento passada

### Gráficos Disponíveis
- **Issues por Status**: Gráfico de pizza mostrando distribuição por status
- **Issues por Tipo**: Gráfico de barras com tipos de issue (Story, Task, Bug, etc.)
- **Velocity do Time**: Comparação entre sprints com story points planejados vs concluídos
- **Burndown Chart**: Progresso da sprint atual vs. ideal
- **Atividade Recente**: Lista das últimas 20 issues atualizadas

### Filtros Disponíveis
- **Projetos**: Multi-seleção de projetos
- **Sprints**: Filtro por sprints ativas/fechadas
- **Tipos**: Story, Task, Bug, Epic, Incident
- **Status**: To Do, In Progress, In Review, Done, etc.
- **Responsáveis**: Filtro por pessoa atribuída
- **Prioridades**: Highest, High, Medium, Low, Lowest
- **Período**: Filtro por data de criação

## 🎨 Personalização

### Cores e Tema
As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#0052CC',    // Azul Jira
      success: '#36B37E',    // Verde
      warning: '#FFAB00',    // Amarelo
      danger: '#DE350B',     // Vermelho
      // ... outras cores
    }
  }
}
```

### Adicionando Novas Métricas
1. Edite `src/services/dataTransform.ts`
2. Adicione sua lógica de cálculo
3. Atualize os tipos em `src/types/jira.types.ts`
4. Crie o componente de visualização

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

### Deploy no Vercel
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

### Deploy no Netlify
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🔒 Segurança

- **Credenciais**: Nunca commite o arquivo `.env` no repositório
- **Token de API**: Mantenha seu token seguro e não o compartilhe
- **Permissões**: Use contas com permissões mínimas necessárias
- **HTTPS**: Sempre use HTTPS em produção

## 🐛 Troubleshooting

### Erro de Conexão
- Verifique se as credenciais estão corretas no `.env`
- Confirme se o domínio está correto (sem https://)
- Teste o token de API no Jira

### Dados Não Carregam
- Verifique as permissões da conta no Jira
- Confirme se há projetos/boards acessíveis
- Verifique o console do navegador para erros

### Performance Lenta
- O dashboard carrega todos os dados de uma vez
- Para grandes volumes, considere implementar paginação
- Use filtros para reduzir a quantidade de dados

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Verifique a documentação do Jira API
- Consulte a documentação do React e TypeScript

---

**Desenvolvido com ❤️ para melhorar a visibilidade dos projetos Jira**














