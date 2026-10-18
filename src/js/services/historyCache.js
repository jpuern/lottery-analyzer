/**
 * History Cache
 * Guarda o histórico de concursos no localStorage para não baixar tudo a cada análise
 */

const STORAGE_PREFIX = 'loterias-pro:historico:';

// Os concursos mais recentes são guardados completos (prêmios, próximo concurso...)
// porque aparecem na seção "Últimos Concursos"; os demais só com o necessário para a análise
export const FULL_RECENT_CONTESTS = 10;

/**
 * Lê o histórico salvo de uma loteria
 * @param {string} key - Identificador da loteria (URL da API)
 * @returns {Array|null} Concursos salvos, ordenados do menor para o maior
 */
export function readHistory(key) {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + key));
        return Array.isArray(data) && data.length > 0 ? data : null;
    } catch {
        return null;
    }
}

/**
 * Salva o histórico de uma loteria
 * @param {string} key - Identificador da loteria (URL da API)
 * @param {Array} results - Concursos
 */
export function writeHistory(key, results) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(compactHistory(results)));
    } catch (error) {
        // Sem espaço ou storage bloqueado: o app continua funcionando, só sem cache
        console.warn('Não foi possível salvar o histórico em cache:', error);
    }
}

/**
 * Ordena os concursos e mantém completos apenas os mais recentes
 * @param {Array} results - Concursos
 * @returns {Array} Concursos compactados
 */
export function compactHistory(results) {
    const sorted = sortByContest(results);
    const fullFrom = sorted.length - FULL_RECENT_CONTESTS;

    return sorted.map((contest, index) => index >= fullFrom
        ? contest
        : { concurso: contest.concurso, data: contest.data, dezenas: contest.dezenas });
}

/**
 * Junta concursos novos ao histórico, substituindo concursos repetidos
 * @param {Array} history - Histórico salvo
 * @param {Array} newContests - Concursos novos
 * @returns {Array} Histórico atualizado, ordenado
 */
export function mergeHistory(history, newContests) {
    const byNumber = new Map(history.map(contest => [Number(contest.concurso), contest]));
    newContests.forEach(contest => byNumber.set(Number(contest.concurso), contest));
    return sortByContest([...byNumber.values()]);
}

/**
 * Retorna o número do último concurso do histórico
 * @param {Array} history - Histórico ordenado
 * @returns {number} Número do concurso
 */
export function lastContestNumber(history) {
    return Number(history[history.length - 1].concurso);
}

function sortByContest(results) {
    return [...results].sort((a, b) => Number(a.concurso) - Number(b.concurso));
}
