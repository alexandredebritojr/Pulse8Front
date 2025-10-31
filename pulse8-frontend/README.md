# Pulse8 Frontend

Sistema de gestão de produção de eventos - Frontend Next.js

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de UI
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query** - Cache e estado do servidor
- **Axios** - Cliente HTTP
- **NextAuth.js** - Autenticação

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   └── globals.css
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Shadcn/ui)
│   ├── forms/            # Componentes de formulário
│   ├── layout/           # Componentes de layout
│   └── modules/          # Componentes específicos por módulo
├── lib/                  # Utilitários e configurações
│   ├── api/             # Cliente HTTP e configurações
│   ├── auth/            # Configurações de autenticação
│   ├── utils/           # Funções utilitárias
│   └── validations/      # Schemas Zod
├── hooks/               # Custom hooks
├── types/               # Definições TypeScript
├── stores/              # Estado global (Zustand)
└── constants/           # Constantes da aplicação
```

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.local.example .env.local
   ```

4. Execute o projeto em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📋 Módulos do Sistema

### 1. **Administração & Acesso**
- Gestão de organizações
- Gestão de usuários
- Roles e permissões

### 2. **Eventos**
- Criação e gestão de eventos
- Templates de eventos
- Calendário de eventos

### 3. **Orçamento & Financeiro**
- Orçamentos
- Despesas
- Receitas
- Relatórios financeiros

### 4. **Calendário & Cronogramas**
- Cronogramas de eventos
- Calendário visual
- Cronograma de postagens

### 5. **Marketing & Conteúdo**
- Assets de marketing
- Campanhas
- Conteúdo
- Analytics

### 6. **Equipe & RH**
- Gestão de pessoas
- Funções
- Escalas
- Relatórios de RH

### 7. **Promoters & Campanhas**
- Gestão de promoters
- Campanhas
- Performance

### 8. **Convidados & Check-in**
- Gestão de convidados
- Check-in/Check-out
- QR Codes
- Relatórios de presença

### 9. **Fornecedores**
- Gestão de fornecedores
- Categorias
- Contratos

### 10. **Relatórios & Dashboards**
- Dashboard principal
- Relatórios financeiros
- Relatórios de presença
- Relatórios de marketing

### 11. **Configurações & Integrações**
- Configurações gerais
- Integrações
- Notificações
- Segurança

### 12. **Auditoria & Segurança**
- Logs de auditoria
- Eventos de segurança
- Conformidade

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o projeto em modo de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Executa a build de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica os tipos TypeScript

## 🌐 URLs de Desenvolvimento

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5000

## 📝 Próximos Passos

1. Configurar autenticação com NextAuth.js
2. Implementar componentes base do design system
3. Criar páginas do dashboard
4. Implementar integração com APIs
5. Adicionar testes unitários e E2E
6. Configurar deploy e CI/CD

