/**
 * Temperature Analyzer
 * Classificação de números por "temperatura" (quentes, neutros, frios)
 */

/**
 * Classifica números por temperatura baseado na frequência
 * @param {Object} frequency - Dados de frequência
 * @param {number} avgFrequency - Média de frequência
 * @param {number} stdDev - Desvio padrão
 * @returns {Object} Classificação de temperatura
 */
export function classifyTemperature(frequency, avgFrequency, stdDev) {
    const temperature = {};
    const hotThreshold = avgFrequency + (stdDev * 0.5);
    const coldThreshold = avgFrequency - (stdDev * 0.5);
    
    for (let num in frequency) {
        if (frequency[num] >= hotThreshold) {
            temperature[num] = 'hot';
        } else if (frequency[num] <= coldThreshold) {
            temperature[num] = 'cold';
        } else {
            temperature[num] = 'neutral';
        }
    }
    
    return temperature;
}

/**
 * Agrupa números por temperatura
 * @param {Object} temperature - Classificação de temperatura
 * @param {Array} sortedFrequency - Frequência ordenada
 * @returns {Object} Números agrupados por temperatura
 */
export function groupByTemperature(temperature, sortedFrequency) {
    const hotNumbers = [];
    const neutralNumbers = [];
    const coldNumbers = [];
    
    sortedFrequency.forEach(item => {
        const temp = temperature[item.num];
        if (temp === 'hot') {
            hotNumbers.push(item.num);
        } else if (temp === 'cold') {
            coldNumbers.push(item.num);
        } else {
            neutralNumbers.push(item.num);
        }
    });
    
    return { hotNumbers, neutralNumbers, coldNumbers };
}

/**
 * Conta a composição de temperaturas em uma sequência
 * @param {Array} sequence - Sequência de números
 * @param {Object} temperature - Classificação de temperatura
 * @returns {Object} Composição da sequência
 */
export function countComposition(sequence, temperature) {
    return {
        hot: sequence.filter(n => temperature[n] === 'hot').length,
        neutral: sequence.filter(n => temperature[n] === 'neutral').length,
        cold: sequence.filter(n => temperature[n] === 'cold').length
    };
}

/**
 * Retorna o ícone de temperatura
 * @param {string} temp - Tipo de temperatura
 * @returns {string} Emoji correspondente
 */
export function getTemperatureIcon(temp) {
    const icons = {
        hot: '🔥',
        cold: '❄️',
        neutral: '⚡'
    };
    return icons[temp] || '⚡';
}
