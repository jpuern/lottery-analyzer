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
        cssClass: 'mega-sena',
        drawSize: 6,
        betMin: 6,
        betMax: 20
    },
    lotofacil: {
        name: 'Lotofácil',
        api: 'https://loteriascaixa-api.herokuapp.com/api/lotofacil',
        min: 1,
        max: 25,
        defaultNumbers: 15,
        cssClass: 'lotofacil',
        drawSize: 15,
        betMin: 15,
        betMax: 20
    },
    quina: {
        name: 'Quina',
        api: 'https://loteriascaixa-api.herokuapp.com/api/quina',
        min: 1,
        max: 80,
        defaultNumbers: 5,
        cssClass: 'quina',
        drawSize: 5,
        betMin: 5,
        betMax: 15
    },
    timemania: {
        name: 'Timemania',
        api: 'https://loteriascaixa-api.herokuapp.com/api/timemania',
        min: 1,
        max: 80,
        defaultNumbers: 7,
        cssClass: 'timemania',
        drawSize: 7,
        betMin: 10,
        betMax: 10
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
