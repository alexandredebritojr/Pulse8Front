const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configurações
const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './screenshots';
const VIEWPORT = { width: 1920, height: 1080 };

// Credenciais de teste
const CREDENTIALS = {
  admin: { email: 'ana@email.com', password: '123456', role: 'Admin' }
};

// Lista de páginas principais para capturar
const MAIN_PAGES = [
  // Autenticação
  { path: '/login', name: 'login', auth: false },
  { path: '/register', name: 'register', auth: false },
  { path: '/forgot-password', name: 'forgot-password', auth: false },
  
  // Dashboard
  { path: '/dashboard', name: 'dashboard', auth: true },
  
  // Eventos
  { path: '/events', name: 'events-list', auth: true },
  { path: '/events/create', name: 'events-create', auth: true },
  
  // Convidados
  { path: '/guests', name: 'guests-list', auth: true },
  { path: '/guests/create', name: 'guests-create', auth: true },
  { path: '/guests/checkin', name: 'guests-checkin', auth: true },
  
  // Financeiro
  { path: '/finance', name: 'finance-dashboard', auth: true },
  { path: '/finance/budget', name: 'finance-budget', auth: true },
  { path: '/finance/expenses', name: 'finance-expenses', auth: true },
  
  // Calendário
  { path: '/calendar', name: 'calendar', auth: true },
  { path: '/calendar/schedules', name: 'calendar-schedules', auth: true },
  
  // Marketing
  { path: '/marketing', name: 'marketing-dashboard', auth: true },
  { path: '/marketing/assets', name: 'marketing-assets', auth: true },
  
  // Equipe
  { path: '/team', name: 'team-list', auth: true },
  { path: '/team/create', name: 'team-create', auth: true },
  
  // Promoters
  { path: '/promoters', name: 'promoters-list', auth: true },
  { path: '/promoters/create', name: 'promoters-create', auth: true },
  
  // Fornecedores
  { path: '/suppliers', name: 'suppliers-list', auth: true },
  { path: '/suppliers/create', name: 'suppliers-create', auth: true },
  
  // Relatórios
  { path: '/reports', name: 'reports-dashboard', auth: true },
  { path: '/reports/events', name: 'reports-events', auth: true },
  { path: '/reports/financial', name: 'reports-financial', auth: true },
  
  // Configurações
  { path: '/settings', name: 'settings-dashboard', auth: true },
  { path: '/settings/security', name: 'settings-security', auth: true },
  
  // Administração
  { path: '/admin', name: 'admin-dashboard', auth: true },
  { path: '/admin/users', name: 'admin-users', auth: true },
  { path: '/admin/roles', name: 'admin-roles', auth: true }
];

async function createDirectories() {
  // Criar diretório principal
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  
  // Criar subdiretórios por módulo
  const modules = [
    'auth', 'dashboard', 'events', 'guests', 'finance', 
    'calendar', 'marketing', 'team', 'promoters', 
    'suppliers', 'reports', 'settings', 'admin'
  ];
  
  modules.forEach(module => {
    const dir = path.join(SCREENSHOTS_DIR, module);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

async function loginAndCapture(page, credentials) {
  console.log(`🔐 Fazendo login como ${credentials.role}...`);
  
  // Ir para a página de login
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Preencher formulário de login
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  
  // Clicar no botão de login
  await page.click('button[type="submit"]');
  
  // Aguardar redirecionamento
  try {
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log(`✅ Login realizado com sucesso como ${credentials.role}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro no login:`, error.message);
    return false;
  }
}

async function capturePage(page, pageInfo, credentials) {
  const { path: pagePath, name, auth } = pageInfo;
  
  try {
    console.log(`📸 Capturando: ${pagePath}`);
    
    // Navegar para a página
    await page.goto(`${BASE_URL}${pagePath}`);
    await page.waitForLoadState('networkidle');
    
    // Verificar se não foi redirecionado para login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log(`❌ Redirecionado para login ao acessar ${pagePath}`);
      return false;
    }
    
    // Aguardar carregamento completo
    await page.waitForTimeout(3000);
    
    // Determinar o diretório
    let moduleDir = 'auth';
    if (name.includes('dashboard')) moduleDir = 'dashboard';
    else if (name.includes('events')) moduleDir = 'events';
    else if (name.includes('guests')) moduleDir = 'guests';
    else if (name.includes('finance')) moduleDir = 'finance';
    else if (name.includes('calendar')) moduleDir = 'calendar';
    else if (name.includes('marketing')) moduleDir = 'marketing';
    else if (name.includes('team')) moduleDir = 'team';
    else if (name.includes('promoters')) moduleDir = 'promoters';
    else if (name.includes('suppliers')) moduleDir = 'suppliers';
    else if (name.includes('reports')) moduleDir = 'reports';
    else if (name.includes('settings')) moduleDir = 'settings';
    else if (name.includes('admin')) moduleDir = 'admin';
    
    // Nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${credentials.role.toLowerCase()}_${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, moduleDir, filename);
    
    // Capturar screenshot
    await page.screenshot({ 
      path: filepath, 
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log(`✅ Capturado: ${filepath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao capturar ${pagePath}:`, error.message);
    return false;
  }
}

async function captureAllScreenshots() {
  console.log('🚀 Iniciando captura de screenshots do Pulse8...');
  
  // Criar diretórios
  await createDirectories();
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Capturar páginas públicas primeiro
    console.log('\n📱 Capturando páginas públicas...');
    const publicPages = MAIN_PAGES.filter(page => !page.auth);
    
    for (const pageInfo of publicPages) {
      const context = await browser.newContext({ viewport: VIEWPORT });
      const page = await context.newPage();
      
      await capturePage(page, pageInfo, { role: 'Public' });
      await context.close();
    }
    
    // Capturar páginas autenticadas
    console.log('\n👤 Capturando páginas autenticadas...');
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    
    // Fazer login uma vez
    const loginSuccess = await loginAndCapture(page, CREDENTIALS.admin);
    
    if (loginSuccess) {
      // Capturar todas as páginas autenticadas na mesma sessão
      const authPages = MAIN_PAGES.filter(page => page.auth);
      
      for (const pageInfo of authPages) {
        const success = await capturePage(page, pageInfo, CREDENTIALS.admin);
        if (!success) {
          console.log(`⚠️ Falha ao capturar ${pageInfo.path}, continuando...`);
        }
      }
    } else {
      console.log('❌ Falha no login, pulando páginas autenticadas');
    }
    
    await context.close();
    
    console.log('\n🎉 Captura de screenshots concluída!');
    console.log(`📁 Screenshots salvos em: ${SCREENSHOTS_DIR}`);
    
  } catch (error) {
    console.error('❌ Erro durante a captura:', error);
  } finally {
    await browser.close();
  }
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificando se o servidor está rodando...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Servidor não está rodando!');
    console.log('💡 Execute: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Servidor está rodando!');
  await captureAllScreenshots();
}

// Executar
main().catch(console.error);










