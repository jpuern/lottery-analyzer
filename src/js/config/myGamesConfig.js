/**
 * My Games Configuration
 * Jogos fixos que são conferidos automaticamente, agrupados por loteria
 * Cada bloco é um texto com um jogo por linha (o prefixo "Jogo N:" é opcional)
 */

export const FIXED_GAMES = {
    lotofacil: [
        {
            name: 'Jogos atuais',
            games: `
                Jogo 1: 01 – 03 – 06 – 07 – 08 – 10 – 11 – 12 – 15 – 16 – 19 – 20 – 23 – 24 – 25
                Jogo 2: 02 – 03 – 05 – 07 – 09 – 10 – 13 – 14 – 15 – 17 – 19 – 20 – 21 – 23 – 24
                Jogo 3: 01 – 02 – 04 – 06 – 07 – 08 – 09 – 11 – 12 – 14 – 16 – 18 – 19 – 22 – 25
                Jogo 4: 03 – 04 – 05 – 06 – 08 – 10 – 12 – 13 – 15 – 17 – 18 – 20 – 21 – 22 – 23
            `
        },
        {
            name: 'Jogos antigos',
            games: `
                Jogo 1: 01, 02, 03, 05, 06, 09, 10, 11, 13, 14, 15, 18, 20, 24, 25
                Jogo 2: 03, 04, 06, 07, 08, 09, 12, 15, 16, 17, 18, 19, 21, 22, 23
                Jogo 3: 02, 03, 04, 06, 07, 11, 12, 13, 14, 15, 17, 20, 22, 23, 25
                Jogo 4: 01, 02, 04, 05, 07, 08, 11, 13, 19, 20, 21, 22, 23, 24, 25
            `
        }
    ]
};

/**
 * Retorna os blocos de jogos fixos de uma loteria
 * @param {string} lotteryType - Tipo da loteria
 * @returns {Array<{name: string, games: string}>} Blocos de jogos
 */
export function getFixedGames(lotteryType) {
    return FIXED_GAMES[lotteryType] || [];
}
