/**
 * Handler de Doações
 */

// ⚠️ CONFIGURE SUAS INFORMAÇÕES AQUI
const PIX_CONFIG = {
    // Sua chave PIX (email, CPF, telefone ou chave aleatória)
    key: 'd9c59f3f-8bac-4b6b-99d6-8040057a3a3c',
    
    // Nome do recebedor (aparece no app do banco)
    name: 'João Pedro da Costa Ribeiro',
    
    // Cidade
    city: 'Russas-CE',
    
    // URL da imagem do QR Code (opcional - pode gerar em sites como qrcode-pix.com)
    // Deixe null para usar QR Code genérico
    qrCodeUrl: 'src/assets/qrcode-pix.png'
};

// URL do site para compartilhamento
const SITE_URL = 'https://analisador-loterias.vercel.app/';
const SITE_NAME = 'Analisador de Loterias Pro';

/**
 * Inicializa handlers de doação
 */
export function initDonationHandlers() {
    const donationBtns = document.querySelectorAll('.donation-btn');
    const customDonationBtn = document.getElementById('customDonation');
    const modal = document.getElementById('donationModal');
    const closeBtn = document.getElementById('closeDonationModal');
    const overlay = document.getElementById('donationModalOverlay');
    const copyBtn = document.getElementById('copyPixKey');
    const pixKeyInput = document.getElementById('pixKey');
    const shareWhatsapp = document.getElementById('shareWhatsapp');
    const shareTelegram = document.getElementById('shareTelegram');
    
    // Configurar chave PIX
    if (pixKeyInput) {
        pixKeyInput.value = PIX_CONFIG.key;
    }
    
    // Configurar QR Code se tiver URL personalizada
    if (PIX_CONFIG.qrCodeUrl) {
        const qrImage = document.getElementById('qrCodeImage');
        if (qrImage) {
            qrImage.src = PIX_CONFIG.qrCodeUrl;
        }
    }
    
    // Botões de valor predefinido
    donationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            openDonationModal(value);
        });
    });
    
    // Botão de valor customizado
    if (customDonationBtn) {
        customDonationBtn.addEventListener('click', () => {
            const value = prompt('Digite o valor da doação (R$):');
            if (value && !isNaN(value) && parseFloat(value) > 0) {
                openDonationModal(value);
            }
        });
    }
    
    // Fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDonationModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeDonationModal);
    }
    
    // Copiar chave PIX
    if (copyBtn) {
        copyBtn.addEventListener('click', copyPixKey);
    }
    
    // Compartilhar
    if (shareWhatsapp) {
        shareWhatsapp.addEventListener('click', (e) => {
            e.preventDefault();
            shareOnWhatsapp();
        });
    }
    
    if (shareTelegram) {
        shareTelegram.addEventListener('click', (e) => {
            e.preventDefault();
            shareOnTelegram();
        });
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDonationModal();
        }
    });
}

/**
 * Abre o modal de doação
 */
function openDonationModal(value) {
    const modal = document.getElementById('donationModal');
    const valueDisplay = document.getElementById('donationValue');
    
    if (modal && valueDisplay) {
        const formattedValue = parseFloat(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        valueDisplay.textContent = formattedValue;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Fecha o modal de doação
 */
function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Copia a chave PIX
 */
async function copyPixKey() {
    const pixKeyInput = document.getElementById('pixKey');
    const feedback = document.getElementById('copiedFeedback');
    
    if (!pixKeyInput) return;
    
    try {
        await navigator.clipboard.writeText(pixKeyInput.value);
        
        if (feedback) {
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        }
    } catch (err) {
        // Fallback para navegadores antigos
        pixKeyInput.select();
        document.execCommand('copy');
        
        if (feedback) {
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        }
    }
}

/**
 * Compartilha no WhatsApp
 */
function shareOnWhatsapp() {
    const text = `🎲 Descobri esse app incrível para analisar loterias! Usa estatísticas e estratégias para gerar números. Confira: ${SITE_URL}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

/**
 * Compartilha no Telegram
 */
function shareOnTelegram() {
    const text = `🎲 Descobri esse app incrível para analisar loterias!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}
