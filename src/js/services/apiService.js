/**
 * API Service
 * Serviço para comunicação com a API de loterias
 */

import { readHistory, writeHistory, mergeHistory, lastContestNumber } from './historyCache.js';

// Acima disso, é mais rápido baixar o histórico inteiro do que concurso por concurso
const MAX_MISSING_CONTESTS = 15;

/**
 * Busca os resultados de uma loteria específica
 * Usa o histórico em cache e baixa só os concursos que faltam
 * @param {string} apiUrl - URL da API
 * @returns {Promise<Array>} Lista de resultados
 */
export async function fetchLotteryResults(apiUrl) {
    const history = readHistory(apiUrl);

    if (!history) {
        const results = await fetchAllResults(apiUrl);
        writeHistory(apiUrl, results);
        return results;
    }

    let latest;
    try {
        latest = await fetchContest(apiUrl, 'latest');
    } catch (error) {
        // Sem conexão: usar o que já está em cache
        console.warn('Usando histórico em cache:', error.message);
        return history;
    }

    const cachedLast = lastContestNumber(history);
    const missingCount = Number(latest.concurso) - cachedLast - 1;

    let updated;
    if (missingCount > MAX_MISSING_CONTESTS) {
        updated = await fetchAllResults(apiUrl);
    } else {
        const missingNumbers = Array.from({ length: Math.max(missingCount, 0) }, (_, i) => cachedLast + 1 + i);
        const missing = await Promise.all(missingNumbers.map(n => fetchContest(apiUrl, n)));
        updated = mergeHistory(history, [...missing, latest]);
    }

    writeHistory(apiUrl, updated);
    return updated;
}

/**
 * Baixa o histórico completo de uma loteria
 * @param {string} apiUrl - URL da API
 * @returns {Promise<Array>} Lista de resultados
 */
async function fetchAllResults(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        throw new Error('Não foi possível conectar à API. Verifique sua conexão.');
    }
}

/**
 * Filtra resultados por modo de seleção
 * @param {Array} results - Todos os resultados
 * @param {string} mode - Modo de seleção ('ultimos' ou 'intervalo')
 * @param {Object} options - Opções de filtro
 * @returns {Array} Resultados filtrados
 */
export function filterResults(results, mode, options) {
    // Ordenar por número do concurso (do menor para o maior)
    const sortedResults = [...results].sort((a, b) => 
        parseInt(a.concurso) - parseInt(b.concurso)
    );
    
    if (mode === 'ultimos') {
        const { lastN = 100 } = options;
        return sortedResults.slice(-lastN);
    } else {
        const { start = 1, end = 100 } = options;
        return sortedResults.filter(r => {
            const concurso = parseInt(r.concurso);
            return concurso >= start && concurso <= end;
        });
    }
}

/**
 * Busca um concurso específico (ou o mais recente)
 * @param {string} apiUrl - URL da API da loteria
 * @param {number|string} contest - Número do concurso ou 'latest'
 * @returns {Promise<Object>} Resultado do concurso
 */
export async function fetchContest(apiUrl, contest = 'latest') {
    let response;
    try {
        response = await fetch(`${apiUrl}/${contest}`);
    } catch (error) {
        console.error('Erro ao buscar concurso:', error);
        throw new Error('Não foi possível conectar à API. Verifique sua conexão.');
    }

    if (!response.ok) {
        throw new Error(contest === 'latest'
            ? `Erro ao buscar o último concurso (HTTP ${response.status})`
            : `Concurso ${contest} não encontrado`);
    }

    return response.json();
}
