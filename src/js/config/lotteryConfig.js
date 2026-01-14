/**
 * Lottery Configuration
 * Configurações das loterias disponíveis
 */

export const LOTTERY_CONFIG = {
    megasena: {
        name: 'Mega-Sena',
        api: 'https://loteriascaixa-api.herokuapp.com/api/megasena',
        min: 1,
        max: 60,
        defaultNumbers: 6,
        cssClass: 'mega-sena'
    },
    lotofacil: {
        name: 'Lotofácil',
        api: 'https://loteriascaixa-api.herokuapp.com/api/lotofacil',
        min: 1,
        max: 25,
        defaultNumbers: 15,
        cssClass: 'lotofacil'
    },
    quina: {
        name: 'Quina',
        api: 'https://loteriascaixa-api.herokuapp.com/api/quina',
        min: 1,
        max: 80,
        defaultNumbers: 5,
        cssClass: 'quina'
    },
    timemania: {
        name: 'Timemania',
        api: 'https://loteriascaixa-api.herokuapp.com/api/timemania',
        min: 1,
        max: 80,
        defaultNumbers: 7,
        cssClass: 'timemania'
    }
};

/**
 * Retorna a configuração de uma loteria específica
 * @param {string} type - Tipo da loteria
 * @returns {Object} Configuração da loteria
 */
export function getLotteryConfig(type) {
    return LOTTERY_CONFIG[type] || null;
}

/**
 * Retorna todas as loterias disponíveis
 * @returns {Array} Lista de loterias
 */
export function getAllLotteries() {
    return Object.keys(LOTTERY_CONFIG);
}
