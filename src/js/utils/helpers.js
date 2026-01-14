/**
 * Helpers
 * Funções utilitárias gerais
 */

/**
 * Formata número com zero à esquerda
 * @param {number} num - Número a formatar
 * @param {number} length - Comprimento desejado
 * @returns {string} Número formatado
 */
export function padNumber(num, length = 2) {
    return String(num).padStart(length, '0');
}

/**
 * Formata número com separador de milhares
 * @param {number} num - Número a formatar
 * @returns {string} Número formatado
 */
export function formatNumber(num) {
    return num.toLocaleString('pt-BR');
}

export function formatCurrency(value) {
    if (!value || value === 0) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

export function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        // Tentar diferentes formatos de data
        let date;
        
        if (dateString.includes('/')) {
            // Formato DD/MM/YYYY
            const parts = dateString.split('/');
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateString.includes('-')) {
            // Formato YYYY-MM-DD
            date = new Date(dateString);
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
            return dateString; // Retorna original se não conseguir parsear
        }
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
}

/**
 * Gera um número aleatório entre min e max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatório
 */
export function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Embaralha um array (Fisher-Yates)
 * @param {Array} array - Array a embaralhar
 * @returns {Array} Array embaralhado
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Remove duplicatas de um array
 * @param {Array} array - Array com possíveis duplicatas
 * @returns {Array} Array sem duplicatas
 */
export function uniqueArray(array) {
    return [...new Set(array)];
}

/**
 * Debounce de função
 * @param {Function} func - Função a executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
