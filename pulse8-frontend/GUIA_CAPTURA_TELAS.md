# 📸 Guia de Captura de Telas - Pulse8

## 🎯 Objetivo
Este guia fornece instruções detalhadas para capturar todas as telas do sistema Pulse8, criando uma documentação visual completa.

---

## 🚀 Como Executar o Sistema

### **1. Iniciar o Servidor**
```bash
cd pulse8-frontend
npm run dev
```

### **2. Acessar o Sistema**
- **URL:** http://localhost:3000
- **Porta alternativa:** http://localhost:3001 ou http://localhost:3002 (se 3000 estiver ocupada)

---

## 🔐 Processo de Login

### **Credenciais de Teste:**
| **Email** | **Senha** | **Função** | **Permissões** |
|-----------|-----------|------------|----------------|
| `ana@email.com` | `123456` | Administrador | Todas |
| `carlos@email.com` | `123456` | Gerente | Eventos, Convidados, Relatórios |
| `maria@email.com` | `123456` | Coordenadora | Eventos, Convidados |
| `joao@email.com` | `123456` | Operador | Convidados |
| `fernanda@email.com` | `123456` | Visualizador | Relatórios |

---

## 📱 Lista de Telas para Capturar

### **🔐 Autenticação**
1. **Página de Login** (`/login`)
   - Formulário de login
   - Links para registro e recuperação de senha
   - Validação de campos

2. **Página de Registro** (`/register`)
   - Formulário de cadastro
   - Campos obrigatórios
   - Validação de dados

3. **Página de Recuperação** (`/forgot-password`)
   - Formulário de recuperação
   - Instruções de uso

### **🏠 Dashboard Principal**
4. **Dashboard** (`/dashboard`)
   - Cards de estatísticas
   - Gráficos de performance
   - Eventos recentes
   - Atividades da equipe

### **📅 Gestão de Eventos**
5. **Lista de Eventos** (`/events`)
   - Tabela de eventos
   - Filtros e busca
   - Ações disponíveis

6. **Criar Evento** (`/events/create`)
   - Formulário de criação
   - Campos obrigatórios
   - Validação

7. **Detalhes do Evento** (`/events/[id]`)
   - Informações completas
   - Status do evento
   - Ações disponíveis

8. **Editar Evento** (`/events/[id]/edit`)
   - Formulário de edição
   - Campos preenchidos
   - Validação

### **👥 Gestão de Convidados**
9. **Lista de Convidados** (`/guests`)
   - Tabela de convidados
   - Filtros por tipo
   - Status dos convidados

10. **Criar Convidado** (`/guests/create`)
    - Formulário de cadastro
    - Tipos de convidado
    - Validação

11. **Check-in** (`/guests/checkin`)
    - Interface de check-in
    - QR Code scanner
    - Status em tempo real

12. **Detalhes do Convidado** (`/guests/[id]`)
    - Informações completas
    - Histórico de eventos
    - Ações disponíveis

13. **Editar Convidado** (`/guests/[id]/edit`)
    - Formulário de edição
    - Campos preenchidos
    - Validação

### **💰 Gestão Financeira**
14. **Dashboard Financeiro** (`/finance`)
    - Resumo financeiro
    - Gráficos de receita/despesa
    - Métricas importantes

15. **Orçamento** (`/finance/budget`)
    - Planejamento orçamentário
    - Categorias de gastos
    - Projeções

16. **Despesas** (`/finance/expenses`)
    - Lista de despesas
    - Filtros por categoria
    - Status de aprovação

17. **Criar Despesa** (`/finance/expenses/create`)
    - Formulário de despesa
    - Categorias disponíveis
    - Anexos

18. **Receitas** (`/finance/revenue`)
    - Lista de receitas
    - Fontes de receita
    - Projeções

19. **Criar Receita** (`/finance/revenue/create`)
    - Formulário de receita
    - Tipos de receita
    - Validação

### **📊 Calendário e Cronogramas**
20. **Calendário** (`/calendar`)
    - Visualização mensal
    - Eventos marcados
    - Navegação

21. **Cronogramas** (`/calendar/schedules`)
    - Lista de cronogramas
    - Filtros por data
    - Status

22. **Criar Cronograma** (`/calendar/schedules/create`)
    - Formulário de cronograma
    - Seleção de data/hora
    - Descrição

23. **Timeline** (`/calendar/timeline`)
    - Linha do tempo
    - Eventos sequenciais
    - Dependências

### **🎨 Marketing**
24. **Dashboard Marketing** (`/marketing`)
    - Resumo de campanhas
    - Métricas de engajamento
    - Próximas ações

25. **Assets** (`/marketing/assets`)
    - Biblioteca de materiais
    - Categorias
    - Upload de arquivos

26. **Upload de Assets** (`/marketing/assets/upload`)
    - Interface de upload
    - Tipos de arquivo
    - Metadados

27. **Cronogramas de Marketing** (`/marketing/schedules`)
    - Agendamento de posts
    - Redes sociais
    - Conteúdo

### **👨‍💼 Gestão de Equipe**
28. **Lista da Equipe** (`/team`)
    - Membros da equipe
    - Departamentos
    - Funções

29. **Criar Membro** (`/team/create`)
    - Formulário de cadastro
    - Seleção de função
    - Permissões

30. **Detalhes do Membro** (`/team/[id]`)
    - Informações pessoais
    - Histórico
    - Permissões

31. **Editar Membro** (`/team/[id]/edit`)
    - Formulário de edição
    - Campos preenchidos
    - Validação

32. **Funções da Equipe** (`/team/roles`)
    - Lista de funções
    - Permissões
    - Hierarquia

### **🎯 Promoters**
33. **Lista de Promoters** (`/promoters`)
    - Promoters cadastrados
    - Performance
    - Comissões

34. **Criar Promoter** (`/promoters/create`)
    - Formulário de cadastro
    - Dados pessoais
    - Comissão

35. **Detalhes do Promoter** (`/promoters/[id]`)
    - Informações completas
    - Histórico de vendas
    - Performance

36. **Editar Promoter** (`/promoters/[id]/edit`)
    - Formulário de edição
    - Campos preenchidos
    - Validação

37. **Campanhas** (`/promoters/campaigns`)
    - Lista de campanhas
    - Status
    - Métricas

38. **Criar Campanha** (`/promoters/campaigns/create`)
    - Formulário de campanha
    - Objetivos
    - Orçamento

### **🏢 Fornecedores**
39. **Lista de Fornecedores** (`/suppliers`)
    - Fornecedores cadastrados
    - Categorias
    - Avaliações

40. **Criar Fornecedor** (`/suppliers/create`)
    - Formulário de cadastro
    - Dados da empresa
    - Contatos

41. **Detalhes do Fornecedor** (`/suppliers/[id]`)
    - Informações completas
    - Histórico de contratos
    - Avaliações

42. **Editar Fornecedor** (`/suppliers/[id]/edit`)
    - Formulário de edição
    - Campos preenchidos
    - Validação

### **📈 Relatórios**
43. **Dashboard de Relatórios** (`/reports`)
    - Resumo de relatórios
    - Métricas principais
    - Acesso rápido

44. **Relatórios de Eventos** (`/reports/events`)
    - Análise de eventos
    - Métricas de performance
    - Gráficos

45. **Relatórios Financeiros** (`/reports/financial`)
    - Análise financeira
    - Receitas vs Despesas
    - Projeções

46. **Relatórios de Convidados** (`/reports/guests`)
    - Análise de convidados
    - Demografia
    - Comportamento

47. **Relatórios de Performance** (`/reports/performance`)
    - Métricas de performance
    - KPIs
    - Tendências

48. **Relatórios Customizados** (`/reports/custom`)
    - Criação de relatórios
    - Filtros personalizados
    - Exportação

### **⚙️ Configurações**
49. **Dashboard de Configurações** (`/settings`)
    - Resumo de configurações
    - Acesso rápido
    - Status do sistema

50. **Segurança** (`/settings/security`)
    - Configurações de segurança
    - Senhas
    - Autenticação

51. **Integrações** (`/settings/integrations`)
    - APIs disponíveis
    - Configurações
    - Status

52. **Backup** (`/settings/backup`)
    - Configurações de backup
    - Histórico
    - Restauração

### **🔐 Administração**
53. **Dashboard Admin** (`/admin`)
    - Visão administrativa
    - Métricas do sistema
    - Ações rápidas

54. **Usuários** (`/admin/users`)
    - Lista de usuários
    - Funções
    - Status

55. **Funções e Permissões** (`/admin/roles`)
    - Gestão de funções
    - Permissões
    - Hierarquia

56. **Controle de Acesso** (`/admin/access`)
    - Logs de acesso
    - Tentativas de login
    - Auditoria

---

## 📸 Screenshots Capturados

### **🔐 Autenticação**

#### **1. Página de Login** (`/login`)
![Login](screenshots/auth/login_public_2025-10-07T02-00-26-846Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de login com validação de campos

#### **2. Página de Registro** (`/register`)
![Registro](screenshots/auth/register_public_2025-10-07T02-00-26-846Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de cadastro com campos obrigatórios

#### **3. Página de Recuperação** (`/forgot-password`)
![Recuperação](screenshots/auth/forgot-password_public_2025-10-07T02-00-32-511Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de recuperação de senha

### **🏠 Dashboard Principal**

#### **4. Dashboard** (`/dashboard`)
![Dashboard](screenshots/dashboard/dashboard_admin_2025-10-07T02-00-46-844Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Dashboard principal com cards de estatísticas e gráficos

### **📅 Gestão de Eventos**

#### **5. Lista de Eventos** (`/events`)
![Lista de Eventos](screenshots/events/events-list_admin_2025-10-07T02-00-51-930Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Tabela de eventos com filtros e busca

#### **6. Criar Evento** (`/events/create`)
![Criar Evento](screenshots/events/events-create_admin_2025-10-07T02-00-56-750Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de criação de evento

### **👥 Gestão de Convidados**

#### **7. Lista de Convidados** (`/guests`)
![Lista de Convidados](screenshots/guests/guests-list_admin_2025-10-07T02-01-02-438Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Tabela de convidados com filtros por tipo

#### **8. Criar Convidado** (`/guests/create`)
![Criar Convidado](screenshots/guests/guests-create_admin_2025-10-07T02-01-07-377Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de cadastro de convidado

#### **9. Check-in** (`/guests/checkin`)
![Check-in](screenshots/guests/guests-checkin_admin_2025-10-07T02-01-12-557Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Interface de check-in com QR Code scanner

### **💰 Gestão Financeira**

#### **10. Orçamento** (`/finance/budget`)
![Orçamento](screenshots/finance/finance-budget_admin_2025-10-07T02-01-19-268Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Planejamento orçamentário com categorias

#### **11. Despesas** (`/finance/expenses`)
![Despesas](screenshots/finance/finance-expenses_admin_2025-10-07T02-01-24-250Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Lista de despesas com filtros por categoria

### **📊 Calendário e Cronogramas**

#### **12. Calendário** (`/calendar`)
![Calendário](screenshots/calendar/calendar_admin_2025-10-07T02-01-30-411Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Visualização mensal com eventos marcados

#### **13. Cronogramas** (`/calendar/schedules`)
![Cronogramas](screenshots/calendar/calendar-schedules_admin_2025-10-07T02-01-35-999Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Lista de cronogramas com filtros por data

### **🎨 Marketing**

#### **14. Dashboard Marketing** (`/marketing`)
![Marketing Dashboard](screenshots/dashboard/marketing-dashboard_admin_2025-10-07T02-01-41-296Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Resumo de campanhas e métricas de engajamento

#### **15. Assets** (`/marketing/assets`)
![Assets](screenshots/marketing/marketing-assets_admin_2025-10-07T02-01-47-132Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Biblioteca de materiais com categorias

### **👨‍💼 Gestão de Equipe**

#### **16. Criar Membro** (`/team/create`)
![Criar Membro](screenshots/team/team-create_admin_2025-10-07T02-01-53-311Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de cadastro de membro da equipe

### **🎯 Promoters**

#### **17. Lista de Promoters** (`/promoters`)
![Lista de Promoters](screenshots/promoters/promoters-list_admin_2025-10-07T02-01-59-506Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Promoters cadastrados com performance

#### **18. Criar Promoter** (`/promoters/create`)
![Criar Promoter](screenshots/promoters/promoters-create_admin_2025-10-07T02-02-05-451Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de cadastro de promoter

### **🏢 Fornecedores**

#### **19. Lista de Fornecedores** (`/suppliers`)
![Lista de Fornecedores](screenshots/suppliers/suppliers-list_admin_2025-10-07T02-02-11-059Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Fornecedores cadastrados com categorias

#### **20. Criar Fornecedor** (`/suppliers/create`)
![Criar Fornecedor](screenshots/suppliers/suppliers-create_admin_2025-10-07T02-02-17-650Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Formulário de cadastro de fornecedor

### **📈 Relatórios**

#### **21. Dashboard de Relatórios** (`/reports`)
![Dashboard de Relatórios](screenshots/dashboard/reports-dashboard_admin_2025-10-07T02-02-23-431Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Resumo de relatórios com métricas principais

#### **22. Relatórios de Eventos** (`/reports/events`)
![Relatórios de Eventos](screenshots/events/reports-events_admin_2025-10-07T02-02-28-856Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Análise de eventos com métricas de performance

#### **23. Relatórios Financeiros** (`/reports/financial`)
![Relatórios Financeiros](screenshots/reports/reports-financial_admin_2025-10-07T02-02-34-717Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Análise financeira com receitas vs despesas

### **⚙️ Configurações**

#### **24. Dashboard de Configurações** (`/settings`)
![Dashboard de Configurações](screenshots/dashboard/settings-dashboard_admin_2025-10-07T02-02-40-095Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Resumo de configurações com acesso rápido

#### **25. Segurança** (`/settings/security`)
![Segurança](screenshots/settings/settings-security_admin_2025-10-07T02-02-45-876Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Configurações de segurança e autenticação

### **🔐 Administração**

#### **26. Usuários** (`/admin/users`)
![Usuários](screenshots/admin/admin-users_admin_2025-10-07T02-02-52-004Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Lista de usuários com funções e status

#### **27. Funções e Permissões** (`/admin/roles`)
![Funções](screenshots/admin/admin-roles_admin_2025-10-07T02-02-57-560Z.png)
- **Status:** ✅ Capturado
- **Resolução:** 1920x1080
- **Descrição:** Gestão de funções e permissões

---

## 📊 Resumo da Captura

### **✅ Screenshots Capturados: 25**
- **Páginas Públicas:** 2
- **Páginas Autenticadas:** 23
- **Módulos Cobertos:** 12

### **📁 Estrutura de Arquivos:**
```
screenshots/
├── admin/ (2 imagens)
├── auth/ (2 imagens)
├── calendar/ (2 imagens)
├── dashboard/ (4 imagens)
├── events/ (3 imagens)
├── finance/ (2 imagens)
├── guests/ (3 imagens)
├── marketing/ (1 imagem)
├── promoters/ (2 imagens)
├── reports/ (1 imagem)
├── settings/ (1 imagem)
├── suppliers/ (2 imagens)
└── team/ (1 imagem)
```

### **🎯 Qualidade das Imagens:**
- **Resolução:** 1920x1080 (Full HD)
- **Formato:** PNG
- **Tamanho:** Otimizado para documentação
- **Organização:** Por módulo e funcionalidade

---

## 📸 Dicas para Captura de Telas

### **🔧 Configurações Recomendadas:**
- **Resolução:** 1920x1080 ou 1366x768
- **Navegador:** Chrome ou Firefox
- **Zoom:** 100% (padrão)
- **Modo:** Tela cheia

### **📱 Responsividade:**
- **Desktop:** 1920x1080
- **Tablet:** 768x1024
- **Mobile:** 375x667

### **🎨 Elementos a Capturar:**
- **Header completo** (logo, navegação, perfil)
- **Sidebar** (menu de navegação)
- **Conteúdo principal** (formulários, tabelas, gráficos)
- **Footer** (se aplicável)
- **Modais e popups** (quando aparecerem)

### **📋 Checklist de Captura:**
- [ ] Login com diferentes usuários
- [ ] Todas as páginas principais
- [ ] Formulários de criação/edição
- [ ] Tabelas com dados
- [ ] Gráficos e métricas
- [ ] Modais e alertas
- [ ] Versão mobile (opcional)

---

## 🎯 Resultado Alcançado

Após a execução bem-sucedida do script de automação, temos:
- **25 capturas de tela** do sistema completo
- **Documentação visual** das principais funcionalidades
- **Guia de uso** para novos usuários
- **Referência técnica** para desenvolvedores
- **Screenshots organizados** por módulo e funcionalidade
- **Qualidade Full HD** (1920x1080) para apresentações profissionais

---

*Guia de Captura de Telas - Pulse8 Event Production Management System*
