const { chromium } = require('playwright');

function requireE2EEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function testLogin() {
  console.log('🧪 Testando login manual...');

  const browser = await chromium.launch({
    headless: false, // Modo visível para debug
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Ir para login
    console.log('📱 Acessando página de login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Capturar tela de login
    await page.screenshot({ path: 'test-login-page.png', fullPage: true });
    console.log('✅ Screenshot da página de login salvo');

    // Preencher formulário
    console.log('🔐 Preenchendo formulário...');
    await page.fill('input[name="email"]', requireE2EEnv('E2E_ADMIN_EMAIL'));
    await page.fill('input[name="password"]', requireE2EEnv('E2E_ADMIN_PASSWORD'));

    // Capturar antes do login
    await page.screenshot({ path: 'test-before-login.png', fullPage: true });
    console.log('✅ Screenshot antes do login salvo');

    // Clicar em login
    console.log('🚀 Clicando em login...');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    console.log('⏳ Aguardando redirecionamento...');
    await page.waitForTimeout(5000);

    // Verificar URL atual
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);

    // Capturar após login
    await page.screenshot({ path: 'test-after-login.png', fullPage: true });
    console.log('✅ Screenshot após login salvo');

    // Tentar acessar dashboard
    console.log('🏠 Tentando acessar dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const dashboardUrl = page.url();
    console.log(`📍 URL do dashboard: ${dashboardUrl}`);

    // Capturar dashboard
    await page.screenshot({ path: 'test-dashboard.png', fullPage: true });
    console.log('✅ Screenshot do dashboard salvo');

    // Tentar acessar eventos
    console.log('📅 Tentando acessar eventos...');
    await page.goto('http://localhost:3000/events');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const eventsUrl = page.url();
    console.log(`📍 URL dos eventos: ${eventsUrl}`);

    // Capturar eventos
    await page.screenshot({ path: 'test-events.png', fullPage: true });
    console.log('✅ Screenshot dos eventos salvo');

    console.log('\n🎉 Teste concluído! Verifique as imagens:');
    console.log('- test-login-page.png');
    console.log('- test-before-login.png');
    console.log('- test-after-login.png');
    console.log('- test-dashboard.png');
    console.log('- test-events.png');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

testLogin().catch(console.error);










