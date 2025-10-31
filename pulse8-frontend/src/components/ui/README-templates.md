# 🎨 Sistema de Templates Base

Este sistema permite manter consistência visual em todas as telas do sistema, seguindo o padrão estabelecido pelo `EventForm`.

## 📋 Componentes Base Disponíveis

### 1. `BaseForm` - Formulário Simples
Para formulários sem sidebar (como login, configurações simples).

```tsx
import BaseForm from '@/components/ui/base-form'

export default function MyForm() {
  const mainContent = (
    <Card>
      <CardContent>
        {/* Seus campos aqui */}
      </CardContent>
    </Card>
  )

  return (
    <BaseForm
      mode="create"
      title="Nova Entidade"
      subtitle="Adicione uma nova entidade"
      backUrl="/entities"
      isSaving={isSaving}
      error={error}
      onSubmit={handleSubmit}
    >
      {mainContent}
    </BaseForm>
  )
}
```

### 2. `BaseFormWithSidebar` - Formulário com Sidebar
Para formulários complexos com configurações e informações adicionais.

```tsx
import BaseFormWithSidebar from '@/components/ui/base-form-with-sidebar'

export default function MyComplexForm() {
  const mainContent = (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Campos principais */}
      </CardContent>
    </Card>
  )

  const sidebarContent = (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Configurações */}
        </CardContent>
      </Card>
      
      {mode === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Atuais</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Info atual */}
          </CardContent>
        </Card>
      )}
    </>
  )

  return (
    <BaseFormWithSidebar
      mode="edit"
      title="Editar Entidade"
      subtitle="Atualize as informações"
      backUrl="/entities"
      isSaving={isSaving}
      error={error}
      onSubmit={handleSubmit}
      mainContent={mainContent}
      sidebarContent={sidebarContent}
    />
  )
}
```

### 3. `BaseDetailPage` - Página de Detalhes
Para páginas de visualização de entidades.

```tsx
import BaseDetailPage from '@/components/ui/base-detail-page'

export default function MyDetailPage() {
  const content = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Conteúdo principal */}
      </div>
      <div>
        {/* Sidebar com informações */}
      </div>
    </div>
  )

  return (
    <BaseDetailPage
      title="Detalhes da Entidade"
      subtitle="Informações completas"
      backUrl="/entities"
      editUrl="/entities/123/edit"
      onDelete={handleDelete}
      isLoading={isLoading}
      error={error}
    >
      {content}
    </BaseDetailPage>
  )
}
```

## 🎯 Vantagens do Sistema

### ✅ **Consistência Visual**
- Todas as telas seguem o mesmo padrão
- Header padronizado com botão voltar
- Botões de ação sempre no mesmo local
- Layout responsivo consistente

### ✅ **Manutenibilidade**
- Mudanças no template afetam todas as telas
- Código reutilizável
- Menos duplicação de código

### ✅ **Desenvolvimento Rápido**
- Templates prontos para uso
- Foco apenas no conteúdo específico
- Estrutura já definida

## 🔄 Migração de Telas Existentes

### Passo 1: Identificar o Tipo
- **Formulário simples** → `BaseForm`
- **Formulário com sidebar** → `BaseFormWithSidebar`
- **Página de detalhes** → `BaseDetailPage`

### Passo 2: Extrair Conteúdo
- Separar o conteúdo específico da estrutura
- Manter apenas os campos e lógica de negócio

### Passo 3: Aplicar Template
- Usar o template apropriado
- Passar as props necessárias
- Testar a funcionalidade

## 📝 Exemplo Prático: RoleForm

**Antes (código duplicado):**
```tsx
// 100+ linhas de estrutura repetida
<div className="space-y-6">
  <div className="flex items-center gap-4">
    <Button variant="outline" size="icon">
      <ArrowLeft className="h-4 w-4" />
    </Button>
    <div>
      <h1 className="text-3xl font-bold">Nova Função</h1>
      <p className="text-gray-600">Adicione uma nova função</p>
    </div>
  </div>
  {/* ... mais estrutura repetida */}
</div>
```

**Depois (usando template):**
```tsx
// Apenas 20 linhas focadas no conteúdo
return (
  <BaseFormWithSidebar
    mode={mode}
    title={getTitle()}
    subtitle={getSubtitle()}
    backUrl={getBackUrl()}
    isSaving={isSaving}
    error={error}
    onSubmit={handleSubmit}
    mainContent={mainContent}
    sidebarContent={sidebarContent}
  />
)
```

## 🚀 Próximos Passos

1. **Migrar telas existentes** para usar os templates
2. **Criar novos templates** conforme necessário
3. **Documentar padrões** específicos do projeto
4. **Treinar equipe** no uso dos templates

## 📚 Referências

- `EventForm.tsx` - Padrão original
- `RoleForm.tsx` - Exemplo de migração
- `RevenueForm.tsx` - Outro exemplo



