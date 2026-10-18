/**
 * Games Storage
 * Persistência dos jogos do usuário no localStorage
 */

const STORAGE_KEY = 'loterias-pro:meus-jogos';
const LAST_LOTTERY_KEY = 'loterias-pro:meus-jogos:ultima-loteria';

/**
 * Lê todos os jogos salvos, agrupados por loteria
 * Os jogos são guardados como o texto digitado (um jogo por linha)
 * @returns {Object} { [lotteryType]: string }
 */
function readAll() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeAll(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Não foi possível salvar os jogos:', error);
    }
}

/**
 * Retorna o texto dos jogos salvos de uma loteria
 * @param {string} lotteryType - Tipo da loteria
 * @returns {string} Jogos, um por linha
 */
export function getGamesText(lotteryType) {
    return readAll()[lotteryType] || '';
}

/**
 * Salva o texto dos jogos de uma loteria
 * @param {string} lotteryType - Tipo da loteria
 * @param {string} text - Jogos, um por linha
 */
export function saveGamesText(lotteryType, text) {
    const data = readAll();
    data[lotteryType] = text;
    writeAll(data);
}

export function getLastLottery() {
    try {
        return localStorage.getItem(LAST_LOTTERY_KEY);
    } catch {
        return null;
    }
}

export function setLastLottery(lotteryType) {
    try {
        localStorage.setItem(LAST_LOTTERY_KEY, lotteryType);
    } catch {
        // Ignorar: preferência apenas de conveniência
    }
}
