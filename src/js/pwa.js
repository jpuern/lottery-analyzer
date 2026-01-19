/**
 * PWA Handler - Registro do Service Worker e Install Prompt
 */

let deferredPrompt;

/**
 * Inicializa o PWA
 */
export function initPWA() {
    registerServiceWorker();
    setupInstallPrompt();
    setupUpdateHandler();
    
    console.log('📱 PWA inicializado');
}

/**
 * Registra o Service Worker
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker registrado:', registration.scope);
            
            // Verificar atualizações
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🔄 Nova versão do Service Worker encontrada');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
        }
    }
}

/**
 * Configura o prompt de instalação
 */
function setupInstallPrompt() {
    // Capturar evento de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📲 App pode ser instalado');
        
        // Prevenir prompt automático
        e.preventDefault();
        
        // Salvar evento para usar depois
        deferredPrompt = e;
        
        // Mostrar botão de instalar
        showInstallButton();
    });
    
    // Detectar quando foi instalado
    window.addEventListener('appinstalled', () => {
        console.log('✅ App instalado com sucesso!');
        hideInstallButton();
        deferredPrompt = null;
        
        // Analytics (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'app_installed');
        }
    });
}

/**
 * Mostra o botão de instalar
 */
function showInstallButton() {
    // Verificar se já existe o botão
    let installBtn = document.getElementById('installAppBtn');
    
    if (!installBtn) {
        // Criar botão flutuante
        installBtn = document.createElement('button');
        installBtn.id = 'installAppBtn';
        installBtn.className = 'install-app-btn';
        installBtn.innerHTML = `
            <span class="install-app-btn__icon">📲</span>
            <span class="install-app-btn__text">Instalar App</span>
        `;
        installBtn.addEventListener('click', installApp);
        document.body.appendChild(installBtn);
    }
    
    installBtn.classList.add('show');
}

/**
 * Esconde o botão de instalar
 */
function hideInstallButton() {
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        installBtn.classList.remove('show');
    }
}

/**
 * Instala o app
 */
async function installApp() {
    if (!deferredPrompt) {
        console.log('❌ Prompt de instalação não disponível');
        return;
    }
    
    // Mostrar prompt
    deferredPrompt.prompt();
    
    // Esperar resposta
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📲 Usuário escolheu: ${outcome}`);
    
    // Limpar
    deferredPrompt = null;
    hideInstallButton();
}

/**
 * Configura handler de atualização
 */
function setupUpdateHandler() {
    // Recarregar quando nova versão estiver pronta
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

/**
 * Mostra notificação de atualização
 */
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <p>🔄 Nova versão disponível!</p>
        <button onclick="window.location.reload()">Atualizar</button>
        <button onclick="this.parentElement.remove()">Depois</button>
    `;
    document.body.appendChild(notification);
}

/**
 * Verifica se está rodando como PWA
 */
export function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}
