/**
 * Pairs Analyzer
 * Análise de duplas e trincas frequentes
 */

/**
 * Analisa duplas frequentes
 * @param {Array} results - Resultados dos concursos
 * @param {number} limit - Limite de resultados
 * @returns {Array} Duplas mais frequentes
 */
export function analyzePairs(results, limit = 20) {
    const pairs = {};
    
    results.forEach(result => {
        const dezenas = result.dezenas.map(d => parseInt(d)).sort((a, b) => a - b);
        
        for (let i = 0; i < dezenas.length; i++) {
            for (let j = i + 1; j < dezenas.length; j++) {
                const pairKey = `${dezenas[i]}-${dezenas[j]}`;
                pairs[pairKey] = (pairs[pairKey] || 0) + 1;
            }
        }
    });
    
    return Object.entries(pairs)
        .map(([pair, count]) => ({ pair, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Analisa trincas frequentes
 * @param {Array} results - Resultados dos concursos
 * @param {number} limit - Limite de resultados
 * @returns {Array} Trincas mais frequentes
 */
export function analyzeTriplets(results, limit = 15) {
    const triplets = {};
    
    results.forEach(result => {
        const dezenas = result.dezenas.map(d => parseInt(d)).sort((a, b) => a - b);
        
        for (let i = 0; i < dezenas.length; i++) {
            for (let j = i + 1; j < dezenas.length; j++) {
                for (let k = j + 1; k < dezenas.length; k++) {
                    const tripletKey = `${dezenas[i]}-${dezenas[j]}-${dezenas[k]}`;
                    triplets[tripletKey] = (triplets[tripletKey] || 0) + 1;
                }
            }
        }
    });
    
    return Object.entries(triplets)
        .map(([triplet, count]) => ({ triplet, count }))
        .filter(t => t.count > 1)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Encontra duplas incluídas em uma sequência
 * @param {Array} sequence - Sequência de números
 * @param {Array} topPairs - Lista de duplas frequentes
 * @returns {Array} Duplas encontradas na sequência
 */
export function findIncludedPairs(sequence, topPairs) {
    return topPairs.filter(pair => {
        const [n1, n2] = pair.pair.split('-').map(Number);
        return sequence.includes(n1) && sequence.includes(n2);
    });
}
