/**
 * Game Checker
 * Conferência dos jogos do usuário contra um concurso sorteado
 */

/**
 * Converte o texto digitado em jogos (um jogo por linha)
 * Aceita qualquer separador entre as dezenas: espaço, vírgula, hífen, ponto...
 * e um rótulo opcional antes de ":" (ex.: "Jogo 1: 01 02 03...")
 * @param {string} text - Texto com os jogos
 * @param {Object} config - Configuração da loteria
 * @returns {Array<Object>} Lista de { line, numbers, error }
 */
export function parseGames(text, config) {
    return text
        .split('\n')
        .map(raw => raw.trim())
        .filter(raw => raw.length > 0)
        .map((raw, index) => {
            const line = index + 1;
            const numbersText = raw.includes(':') ? raw.slice(raw.indexOf(':') + 1) : raw;
            const numbers = (numbersText.match(/\d+/g) || []).map(n => parseInt(n, 10));
            return { line, numbers: [...numbers].sort((a, b) => a - b), error: validateGame(numbers, config) };
        });
}

/**
 * Valida um jogo de acordo com as regras da loteria
 * @param {Array<number>} numbers - Dezenas do jogo
 * @param {Object} config - Configuração da loteria
 * @returns {string|null} Mensagem de erro ou null se válido
 */
function validateGame(numbers, config) {
    const outOfRange = numbers.filter(n => n < config.min || n > config.max);
    if (outOfRange.length > 0) {
        return `Dezena(s) fora de ${config.min}-${config.max}: ${outOfRange.join(', ')}`;
    }

    if (new Set(numbers).size !== numbers.length) {
        return 'Há dezenas repetidas';
    }

    if (numbers.length < config.betMin || numbers.length > config.betMax) {
        const allowed = config.betMin === config.betMax
            ? `${config.betMin}`
            : `de ${config.betMin} a ${config.betMax}`;
        return `${numbers.length} dezenas — a ${config.name} aceita ${allowed}`;
    }

    return null;
}

/**
 * Confere um jogo contra as dezenas sorteadas
 * @param {Array<number>} numbers - Dezenas do jogo
 * @param {Object} contest - Concurso retornado pela API
 * @param {Object} config - Configuração da loteria
 * @returns {Object} { hits, hitNumbers, prizes, totalPrize }
 */
export function checkGame(numbers, contest, config) {
    const drawn = new Set(contest.dezenas.map(d => parseInt(d, 10)));
    const hitNumbers = numbers.filter(n => drawn.has(n));
    const hits = hitNumbers.length;
    const tiers = getPrizeTiers(contest);

    // Timemania: o apostador marca 10 dezenas e é premiado pelos acertos entre elas
    // Demais loterias: aposta com mais dezenas = todas as combinações simples possíveis
    const prizes = config.betMin === config.betMax
        ? prizesForSimpleBet(hits, tiers)
        : prizesForMultipleBet(numbers.length, hits, config.drawSize, tiers);

    const totalPrize = prizes.reduce((sum, p) => sum + p.count * p.value, 0);

    return { hits, hitNumbers, prizes, totalPrize };
}

/**
 * Extrai as faixas de premiação por número de acertos
 * @param {Object} contest - Concurso retornado pela API
 * @returns {Object} { [acertos]: valorPremio }
 */
function getPrizeTiers(contest) {
    const tiers = {};
    (contest.premiacoes || []).forEach(p => {
        const match = /^(\d+)\s+acertos?/i.exec(p.descricao || '');
        if (match) {
            tiers[parseInt(match[1], 10)] = p.valorPremio || 0;
        }
    });
    return tiers;
}

function prizesForSimpleBet(hits, tiers) {
    return hits in tiers ? [{ hits, count: 1, value: tiers[hits] }] : [];
}

/**
 * Calcula os prêmios de uma aposta múltipla (ex.: Lotofácil com 16+ dezenas)
 * Uma aposta com k dezenas equivale a C(k, d) apostas simples; com h acertos,
 * C(h, j) * C(k - h, d - j) dessas apostas têm exatamente j acertos.
 */
function prizesForMultipleBet(betSize, hits, drawSize, tiers) {
    const prizes = [];
    Object.keys(tiers)
        .map(Number)
        .sort((a, b) => b - a)
        .forEach(tierHits => {
            const count = binomial(hits, tierHits) * binomial(betSize - hits, drawSize - tierHits);
            if (count > 0) {
                prizes.push({ hits: tierHits, count, value: tiers[tierHits] });
            }
        });
    return prizes;
}

function binomial(n, k) {
    if (k < 0 || k > n) return 0;
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result = (result * (n - k + i)) / i;
    }
    return Math.round(result);
}
