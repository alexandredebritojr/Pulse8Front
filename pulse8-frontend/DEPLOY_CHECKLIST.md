# Checklist de Deploy - Frontend Pulse8

## ✅ Pré-Deploy (Verificações Locais)

### 1. Build Local
- [x] `npm run build` executado com sucesso
- [x] Sem erros de compilação críticos
- [ ] Testar build localmente com `npm start`

### 2. Variáveis de Ambiente
Configure no Render as seguintes variáveis:

```
NEXT_PUBLIC_BACKEND_URL=https://pulse8-api.onrender.com
BACKEND_URL=https://pulse8-api.onrender.com
```

### 3. CORS no Backend (CRÍTICO)
⚠️ **AÇÃO NECESSÁRIA**: Atualizar o backend para aceitar requisições do frontend no Render.

No arquivo `Program.cs` do backend, adicionar o domínio do Render na política CORS:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000", 
            "https://localhost:3000",
            "https://seu-frontend.onrender.com" // ADICIONAR AQUI
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

Ou melhor ainda, usar variável de ambiente:
```csharp
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins")
    .Get<string[]>() ?? new[] { "http://localhost:3000", "https://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

E adicionar no `appsettings.json`:
```json
"AllowedOrigins": [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://seu-frontend.onrender.com"
]
```

### 4. Configuração do Render

#### Frontend (Web Service - Node.js)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start -- -p $PORT`
- **Node Version**: 18.x ou 20.x
- **Port**: Automático via `$PORT`

#### Variáveis de Ambiente no Render
- `NEXT_PUBLIC_BACKEND_URL` = `https://pulse8-api.onrender.com`
- `BACKEND_URL` = `https://pulse8-api.onrender.com`
- `NODE_ENV` = `production` (opcional, Render define automaticamente)

### 5. Testes Pós-Deploy

Após o deploy, verificar:

1. **Homepage**
   - [ ] Página inicial carrega sem erros
   - [ ] Console do navegador sem erros críticos

2. **Login**
   - [ ] Página de login carrega
   - [ ] Login funciona corretamente
   - [ ] Token é armazenado no localStorage

3. **Chamadas de API**
   - [ ] Chamadas para `/api/auth/login` funcionam
   - [ ] Chamadas para `/api/auth/me` funcionam
   - [ ] Outras chamadas de API funcionam (events, guests, etc.)

4. **CORS**
   - [ ] Sem erros de CORS no console do navegador
   - [ ] Requisições são aceitas pelo backend

### 6. Problemas Conhecidos

#### Warnings (Não críticos)
- Alguns warnings de ESLint sobre hooks (`react-hooks/exhaustive-deps`)
- Alguns warnings sobre imagens sem `alt` prop
- Esses warnings não impedem o deploy

#### Ajustes Realizados
- ✅ Rotas de API configuradas com `export const dynamic = 'force-dynamic'`
- ✅ URLs do backend configuradas via variáveis de ambiente
- ✅ Fallback para localhost em desenvolvimento

### 7. Rollback

Se algo der errado:
1. Reverter para commit anterior
2. Verificar logs do Render
3. Verificar variáveis de ambiente
4. Verificar CORS no backend

## 📝 Notas

- O frontend usa Next.js 14 com App Router
- Build gera páginas estáticas e dinâmicas automaticamente
- Rotas de API (`/api/*`) sempre são renderizadas dinamicamente
- Certifique-se de que o backend está acessível publicamente no Render antes do deploy do frontend

