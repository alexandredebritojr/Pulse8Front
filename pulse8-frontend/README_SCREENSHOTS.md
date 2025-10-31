# 📸 Captura Automática de Screenshots - Pulse8

## 🎯 Objetivo
Este script automatiza a captura de todas as telas do sistema Pulse8, organizando-as por módulo e tipo de usuário.

---

## 🚀 Como Usar

### **1. Pré-requisitos**
- ✅ Node.js 18+ instalado
- ✅ Servidor Pulse8 rodando (`npm run dev`)
- ✅ Acesso a http://localhost:3000

### **2. Execução Automática (Recomendado)**
```powershell
# Execute o script PowerShell
.\setup-screenshots.ps1
```

### **3. Execução Manual**
```bash
# Instalar Playwright
npm install playwright
npx playwright install chromium

# Executar captura
node capture-screenshots.js
```

---

## 📁 Estrutura de Saída

```
screenshots/
├── auth/                    # Páginas de autenticação
│   ├── login_admin_2024-01-15T10-30-00-000Z.png
│   ├── register_admin_2024-01-15T10-30-00-000Z.png
│   └── forgot-password_admin_2024-01-15T10-30-00-000Z.png
├── dashboard/              # Dashboard principal
│   ├── dashboard_admin_2024-01-15T10-30-00-000Z.png
│   ├── dashboard_manager_2024-01-15T10-30-00-000Z.png
│   └── dashboard_coordinator_2024-01-15T10-30-00-000Z.png
├── events/                 # Gestão de eventos
│   ├── events-list_admin_2024-01-15T10-30-00-000Z.png
│   ├── events-create_admin_2024-01-15T10-30-00-000Z.png
│   └── events-detail_admin_2024-01-15T10-30-00-000Z.png
├── guests/                 # Gestão de convidados
├── finance/                # Gestão financeira
├── calendar/               # Calendário e cronogramas
├── marketing/              # Marketing
├── team/                   # Gestão de equipe
├── promoters/              # Promoters
├── suppliers/              # Fornecedores
├── reports/                # Relatórios
├── settings/               # Configurações
└── admin/                  # Administração
```

---

## 👥 Tipos de Usuário Capturados

| **Tipo** | **Email** | **Permissões** | **Screenshots** |
|----------|-----------|----------------|-----------------|
| **Admin** | ana@email.com | Todas | ✅ Todas as páginas |
| **Manager** | carlos@email.com | Eventos, Convidados, Relatórios | ✅ Páginas permitidas |
| **Coordinator** | maria@email.com | Eventos, Convidados | ✅ Páginas permitidas |
| **Operator** | joao@email.com | Convidados | ✅ Páginas permitidas |
| **Viewer** | fernanda@email.com | Relatórios | ✅ Páginas permitidas |

---

## 📱 Páginas Capturadas

### **🔐 Autenticação (3 páginas)**
- Login
- Registro
- Recuperação de senha

### **🏠 Dashboard (1 página)**
- Dashboard principal

### **📅 Eventos (4 páginas)**
- Lista de eventos
- Criar evento
- Detalhes do evento
- Editar evento

### **👥 Convidados (5 páginas)**
- Lista de convidados
- Criar convidado
- Check-in
- Detalhes do convidado
- Editar convidado

### **💰 Financeiro (6 páginas)**
- Dashboard financeiro
- Orçamento
- Despesas
- Criar despesa
- Receitas
- Criar receita

### **📊 Calendário (4 páginas)**
- Calendário
- Cronogramas
- Criar cronograma
- Timeline

### **🎨 Marketing (4 páginas)**
- Dashboard marketing
- Assets
- Upload de assets
- Cronogramas de marketing

### **👨‍💼 Equipe (5 páginas)**
- Lista da equipe
- Criar membro
- Detalhes do membro
- Editar membro
- Funções da equipe

### **🎯 Promoters (6 páginas)**
- Lista de promoters
- Criar promoter
- Detalhes do promoter
- Editar promoter
- Campanhas
- Criar campanha

### **🏢 Fornecedores (4 páginas)**
- Lista de fornecedores
- Criar fornecedor
- Detalhes do fornecedor
- Editar fornecedor

### **📈 Relatórios (6 páginas)**
- Dashboard de relatórios
- Relatórios de eventos
- Relatórios financeiros
- Relatórios de convidados
- Relatórios de performance
- Relatórios customizados

### **⚙️ Configurações (4 páginas)**
- Dashboard de configurações
- Segurança
- Integrações
- Backup

### **🔐 Administração (4 páginas)**
- Dashboard admin
- Usuários
- Funções e permissões
- Controle de acesso

**Total: 56+ screenshots organizados por módulo e usuário**

---

## ⚙️ Configurações

### **Resolução das Screenshots:**
- **Desktop:** 1920x1080
- **Full Page:** Captura página completa
- **Animations:** Desabilitadas para consistência

### **Nomenclatura:**
```
{nome-da-pagina}_{tipo-usuario}_{timestamp}.png
```

### **Exemplo:**
```
dashboard_admin_2024-01-15T10-30-00-000Z.png
events-list_manager_2024-01-15T10-30-00-000Z.png
```

---

## 🔧 Troubleshooting

### **Problemas Comuns:**

1. **Servidor não está rodando**
   ```bash
   npm run dev
   ```

2. **Playwright não instalado**
   ```bash
   npm install playwright
   npx playwright install chromium
   ```

3. **Erro de permissão**
   ```bash
   # Windows
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Timeout na captura**
   - Verifique se o servidor está respondendo
   - Aumente o timeout no script se necessário

### **Logs:**
- ✅ Sucesso: `✅ Capturado: caminho/arquivo.png`
- ❌ Erro: `❌ Erro ao capturar: mensagem`
- 🔐 Login: `🔐 Fazendo login como Admin...`

---

## 📊 Estatísticas

### **Screenshots por Módulo:**
- **Autenticação:** 3
- **Dashboard:** 1
- **Eventos:** 4
- **Convidados:** 5
- **Financeiro:** 6
- **Calendário:** 4
- **Marketing:** 4
- **Equipe:** 5
- **Promoters:** 6
- **Fornecedores:** 4
- **Relatórios:** 6
- **Configurações:** 4
- **Administração:** 4

### **Total:** 56+ screenshots

### **Tempo Estimado:**
- **Captura completa:** ~5-10 minutos
- **Por usuário:** ~1-2 minutos
- **Por página:** ~5-10 segundos

---

## 🎉 Resultado

Após a execução, você terá:
- ✅ **56+ screenshots** organizados por módulo
- ✅ **Múltiplas perspectivas** (diferentes usuários)
- ✅ **Documentação visual** completa
- ✅ **Estrutura organizada** para apresentações

---

*Script de Captura Automática - Pulse8 Event Production Management System*










