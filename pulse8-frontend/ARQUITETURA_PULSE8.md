# 🏗️ Arquitetura do Sistema Pulse8

## 📊 Diagrama de Módulos

```
┌─────────────────────────────────────────────────────────────────┐
│                        PULSE8 SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│  🔐 AUTHENTICATION LAYER                                       │
│  ├── Login/Logout                                              │
│  ├── User Management                                           │
│  ├── Role & Permissions                                       │
│  └── Session Control                                           │
├─────────────────────────────────────────────────────────────────┤
│  📱 PRESENTATION LAYER (Next.js 14 + TypeScript)              │
│  ├── Dashboard                                                 │
│  ├── Events Management                                         │
│  ├── Guests Management                                         │
│  ├── Finance Management                                        │
│  ├── Team Management                                           │
│  ├── Marketing Tools                                           │
│  ├── Reports & Analytics                                      │
│  └── Settings & Admin                                          │
├─────────────────────────────────────────────────────────────────┤
│  🔧 BUSINESS LOGIC LAYER                                        │
│  ├── Event Processing                                          │
│  ├── Guest Check-in System                                     │
│  ├── Financial Calculations                                    │
│  ├── Report Generation                                         │
│  ├── Notification System                                       │
│  └── Data Validation                                           │
├─────────────────────────────────────────────────────────────────┤
│  💾 DATA LAYER (Mock APIs)                                     │
│  ├── User Data                                                 │
│  ├── Event Data                                                │
│  ├── Guest Data                                                │
│  ├── Financial Data                                            │
│  ├── Team Data                                                 │
│  └── Report Data                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Fluxo de Navegação

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   LOGIN     │───▶│  DASHBOARD   │───▶│   EVENTS    │
└─────────────┘    └──────────────┘    └─────────────┘
                           │                    │
                           ▼                    ▼
                   ┌──────────────┐    ┌─────────────┐
                   │   GUESTS     │    │  FINANCE    │
                   └──────────────┘    └─────────────┘
                           │                    │
                           ▼                    ▼
                   ┌──────────────┐    ┌─────────────┐
                   │    TEAM      │    │  MARKETING  │
                   └──────────────┘    └─────────────┘
                           │                    │
                           ▼                    ▼
                   ┌──────────────┐    ┌─────────────┐
                   │  REPORTS     │    │  SETTINGS   │
                   └──────────────┘    └─────────────┘
```

## 🔐 Sistema de Permissões

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ROLES & PERMISSIONS                    │
├─────────────────────────────────────────────────────────────────┤
│  👑 ADMIN (ana@email.com)                                      │
│  ├── All Permissions                                           │
│  ├── User Management                                           │
│  ├── System Settings                                           │
│  └── Audit Access                                              │
├─────────────────────────────────────────────────────────────────┤
│  👨‍💼 MANAGER (carlos@email.com)                               │
│  ├── Events Management                                         │
│  ├── Guests Management                                         │
│  ├── Reports Access                                            │
│  └── Team Coordination                                         │
├─────────────────────────────────────────────────────────────────┤
│  👩‍💼 COORDINATOR (maria@email.com)                            │
│  ├── Events Coordination                                       │
│  ├── Guests Management                                         │
│  └── Marketing Tools                                           │
├─────────────────────────────────────────────────────────────────┤
│  👷 OPERATOR (joao@email.com)                                  │
│  ├── Guest Check-in                                            │
│  ├── Basic Operations                                          │
│  └── Event Support                                             │
├─────────────────────────────────────────────────────────────────┤
│  👁️ VIEWER (fernanda@email.com)                                │
│  ├── Reports Only                                              │
│  ├── Read-only Access                                          │
│  └── Analytics View                                            │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Estrutura de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│  🎨 UI COMPONENTS                                              │
│  ├── Button, Input, Card                                       │
│  ├── Modal, Dropdown, Table                                    │
│  ├── Form, Calendar, Chart                                     │
│  └── Icons, Badges, Alerts                                     │
├─────────────────────────────────────────────────────────────────┤
│  🏗️ LAYOUT COMPONENTS                                          │
│  ├── Header (Navigation + User Menu)                          │
│  ├── Sidebar (Main Navigation)                                │
│  ├── Footer (System Info)                                      │
│  └── Breadcrumbs (Page Navigation)                             │
├─────────────────────────────────────────────────────────────────┤
│  📄 PAGE COMPONENTS                                            │
│  ├── Dashboard (Stats + Charts)                                │
│  ├── Events (List + Forms)                                    │
│  ├── Guests (Management + Check-in)                           │
│  ├── Finance (Budget + Expenses)                              │
│  ├── Team (Members + Roles)                                   │
│  ├── Marketing (Assets + Schedules)                           │
│  ├── Reports (Analytics + Export)                             │
│  └── Settings (Configuration + Admin)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   CLIENT    │───▶│   CONTEXT    │───▶│   MOCK API  │
│  (React)    │    │   (State)    │    │   (Data)    │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  COMPONENTS │◀───│   HOOKS      │◀───│   TYPES     │
│  (UI)       │    │  (Logic)     │    │ (Interface) │
└─────────────┘    └──────────────┘    └─────────────┘
```

## 🎨 Design System

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESIGN SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│  🎨 COLORS                                                     │
│  ├── Primary: Indigo (#4F46E5)                                │
│  ├── Secondary: Gray (#6B7280)                                │
│  ├── Success: Green (#10B981)                                │
│  ├── Warning: Yellow (#F59E0B)                               │
│  └── Error: Red (#EF4444)                                    │
├─────────────────────────────────────────────────────────────────┤
│  📝 TYPOGRAPHY                                                 │
│  ├── Headings: Inter/Sans-serif                               │
│  ├── Body: System fonts                                       │
│  ├── Code: Monospace                                          │
│  └── Sizes: 12px - 48px                                       │
├─────────────────────────────────────────────────────────────────┤
│  📐 SPACING                                                    │
│  ├── xs: 4px, sm: 8px, md: 16px                              │
│  ├── lg: 24px, xl: 32px, 2xl: 48px                           │
│  └── 3xl: 64px, 4xl: 96px                                    │
├─────────────────────────────────────────────────────────────────┤
│  🎯 COMPONENTS                                                 │
│  ├── Buttons (Primary, Secondary, Ghost)                      │
│  ├── Forms (Input, Select, Checkbox)                          │
│  ├── Cards (Default, Elevated, Outlined)                      │
│  ├── Tables (Sortable, Filterable, Paginated)                 │
│  └── Modals (Confirmation, Form, Info)                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Tecnologias e Dependências

```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                            │
├─────────────────────────────────────────────────────────────────┤
│  🖥️ FRONTEND                                                  │
│  ├── Next.js 14.2.4 (React Framework)                         │
│  ├── TypeScript 5.5.4 (Type Safety)                           │
│  ├── Tailwind CSS 3.4.12 (Styling)                            │
│  └── Radix UI (Component Library)                              │
├─────────────────────────────────────────────────────────────────┤
│  🎨 UI/UX                                                      │
│  ├── Lucide React (Icons)                                     │
│  ├── Class Variance Authority (Component Variants)            │
│  ├── clsx (Conditional Classes)                               │
│  └── tailwind-merge (Class Merging)                           │
├─────────────────────────────────────────────────────────────────┤
│  🔧 DEVELOPMENT                                               │
│  ├── ESLint (Code Linting)                                    │
│  ├── TypeScript (Static Typing)                               │
│  ├── Next.js (Build System)                                   │
│  └── Node.js (Runtime)                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Métricas e Performance

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE METRICS                         │
├─────────────────────────────────────────────────────────────────┤
│  ⚡ LOADING TIMES                                              │
│  ├── Initial Load: ~2-3s                                      │
│  ├── Page Navigation: ~500ms                                  │
│  ├── Component Render: ~100ms                                 │
│  └── API Response: ~200ms                                     │
├─────────────────────────────────────────────────────────────────┤
│  📱 RESPONSIVENESS                                             │
│  ├── Mobile: < 768px                                          │
│  ├── Tablet: 768px - 1024px                                   │
│  ├── Desktop: > 1024px                                        │
│  └── Large: > 1440px                                          │
├─────────────────────────────────────────────────────────────────┤
│  🎯 USER EXPERIENCE                                            │
│  ├── Navigation: Intuitive                                    │
│  ├── Forms: User-friendly                                      │
│  ├── Feedback: Immediate                                       │
│  └── Accessibility: WCAG 2.1                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

*Arquitetura do Sistema Pulse8 - Event Production Management*










