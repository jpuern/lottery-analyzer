/**
 * Frequency Analyzer
 * Análise de frequência dos números
 */

/**
 * Analisa a frequência de cada número nos concursos
 * @param {Array} results - Resultados dos concursos
 * @param {Object} config - Configuração da loteria
 * @returns {Object} Dados de frequência
 */
export function analyzeFrequency(results, config) {
    const frequency = {};
    const recentFrequency = {};
    const lastAppearance = {};
    const appearanceGaps = {};
    
    const totalContests = results.length;
    const recentThreshold = Math.floor(totalContests * 0.2);
    
    // Inicializar estruturas
    for (let i = config.min; i <= config.max; i++) {
        frequency[i] = 0;
        recentFrequency[i] = 0;
        lastAppearance[i] = -1;
        appearanceGaps[i] = [];
    }
    
    // Analisar cada concurso
    results.forEach((result, index) => {
        const dezenas = result.dezenas.map(d => parseInt(d)).sort((a, b) => a - b);
        
        dezenas.forEach(num => {
            // Calcular gap desde última aparição
            if (lastAppearance[num] >= 0) {
                appearanceGaps[num].push(index - lastAppearance[num]);
            }
            
            frequency[num]++;
            lastAppearance[num] = index;
            
            // Frequência recente (últimos 20%)
            if (index >= totalContests - recentThreshold) {
                recentFrequency[num]++;
            }
        });
    });
    
    // Calcular atraso atual
    const delay = {};
    for (let num in lastAppearance) {
        delay[num] = totalContests - 1 - lastAppearance[num];
    }
    
    // Calcular ciclo médio
    const avgCycle = {};
    for (let num in appearanceGaps) {
        const gaps = appearanceGaps[num];
        avgCycle[num] = gaps.length > 0 
            ? gaps.reduce((a, b) => a + b, 0) / gaps.length 
            : totalContests;
    }
    
    // Ordenar por frequência
    const sortedFrequency = Object.entries(frequency)
        .map(([num, count]) => ({ num: parseInt(num), count }))
        .sort((a, b) => b.count - a.count);
    
    // Ordenar por atraso
    const sortedDelay = Object.entries(delay)
        .map(([num, delayCount]) => ({ num: parseInt(num), delay: delayCount }))
        .sort((a, b) => b.delay - a.delay);
    
    return {
        frequency,
        recentFrequency,
        sortedFrequency,
        delay,
        sortedDelay,
        avgCycle,
        totalContests
    };
}

/**
 * Calcula estatísticas de frequência
 * @param {Object} frequency - Dados de frequência
 * @returns {Object} Estatísticas calculadas
 */
export function calculateFrequencyStats(frequency) {
    const values = Object.values(frequency);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
    );
    
    return {
        average: avg,
        standardDeviation: stdDev,
        max: Math.max(...values),
        min: Math.min(...values)
    };
}
