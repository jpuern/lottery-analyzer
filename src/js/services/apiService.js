/**
 * API Service
 * Serviço para comunicação com a API de loterias
 */

/**
 * Busca os resultados de uma loteria específica
 * @param {string} apiUrl - URL da API
 * @returns {Promise<Array>} Lista de resultados
 */
export async function fetchLotteryResults(apiUrl) {
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
