/**
 * Sequence Generator
 * Geração de sequências otimizadas baseadas em análise
 */

import { getStrategyConfig } from '../config/strategyConfig.js';
import { findIncludedPairs } from './pairsAnalyzer.js';
import { countComposition } from './temperatureAnalyzer.js';

/**
 * Gera uma sequência otimizada baseada na estratégia selecionada
 * @param {Object} analysis - Dados da análise
 * @param {number} count - Quantidade de números a gerar
 * @param {Object} config - Configuração da loteria
 * @param {string} strategyId - ID da estratégia
 * @param {Object} customWeights - Pesos customizados (opcional)
 * @returns {Object} Resultado da geração
 */
export function generateSequence(analysis, count, config, strategyId, customWeights = null) {
    const strategy = getStrategyConfig(strategyId);
    const weights = customWeights || strategy.weights;
    const distribution = strategyId === 'custom' 
        ? calculateCustomDistribution(customWeights)
        : strategy.distribution;
    
    // Calcular quantos de cada temperatura
    const hotCount = Math.round(count * distribution.hot);
    const coldCount = Math.round(count * distribution.cold);
    const neutralCount = count - hotCount - coldCount;
    
    // Calcular scores para cada número
    const scores = calculateScores(analysis, config, weights);
    
    // Adicionar fator de aleatoriedade
    addRandomFactor(scores, weights.random);
    
    // Selecionar números respeitando distribuição
    const selected = selectNumbers(
        analysis,
        scores,
        { hotCount, coldCount, neutralCount },
        count,
        weights
    );
    
    // Ordenar resultado
    const finalSequence = selected.slice(0, count).sort((a, b) => a - b);
    
    // Identificar duplas incluídas
    const includedPairs = findIncludedPairs(finalSequence, analysis.pairs);
    
    // Contar composição
    const composition = countComposition(finalSequence, analysis.temperature);
    
    return {
        sequence: finalSequence,
        composition,
        includedPairs,
        strategy
    };
}

/**
 * Calcula scores para cada número baseado nos pesos
 * @param {Object} analysis - Dados da análise
 * @param {Object} config - Configuração da loteria
 * @param {Object} weights - Pesos da estratégia
 * @returns {Object} Scores calculados
 */
function calculateScores(analysis, config, weights) {
    const scores = {};
    const maxFreq = Math.max(...Object.values(analysis.frequency));
    const maxDelay = Math.max(...analysis.sortedDelay.map(d => d.delay));
    
    for (let i = config.min; i <= config.max; i++) {
        scores[i] = 0;
        
        // Peso de números quentes (frequência)
        scores[i] += (analysis.frequency[i] / maxFreq) * weights.hot;
        
        // Peso de números frios (atraso)
        const delayInfo = analysis.sortedDelay.find(d => d.num === i);
        if (delayInfo && maxDelay > 0) {
            scores[i] += (delayInfo.delay / maxDelay) * weights.cold;
        }
    }
    
    // Bônus para números em duplas frequentes
    analysis.pairs.slice(0, 30).forEach((item, index) => {
        const [n1, n2] = item.pair.split('-').map(Number);
        const bonus = ((30 - index) / 30) * weights.pairs * 0.5;
        scores[n1] += bonus;
        scores[n2] += bonus;
    });
    
    // Bônus para números em trincas frequentes
    analysis.triplets.slice(0, 15).forEach((item, index) => {
        const nums = item.triplet.split('-').map(Number);
        const bonus = ((15 - index) / 15) * weights.triplets * 0.3;
        nums.forEach(n => scores[n] += bonus);
    });
    
    return scores;
}

/**
 * Adiciona fator de aleatoriedade aos scores
 * @param {Object} scores - Scores calculados
 * @param {number} randomWeight - Peso de aleatoriedade
 */
function addRandomFactor(scores, randomWeight) {
    const randomFactor = randomWeight / 100;
    for (let num in scores) {
        scores[num] += Math.random() * randomFactor * 50;
    }
}

/**
 * Seleciona números respeitando a distribuição de temperaturas
 * @param {Object} analysis - Dados da análise
 * @param {Object} scores - Scores calculados
 * @param {Object} counts - Contagem por temperatura
 * @param {number} totalCount - Total de números a selecionar
 * @param {Object} weights - Pesos da estratégia
 * @returns {Array} Números selecionados
 */
function selectNumbers(analysis, scores, counts, totalCount, weights) {
    const selected = [];
    
    // Selecionar quentes
    const hotCandidates = analysis.hotNumbers
        .map(n => ({ num: n, score: scores[n] }))
        .sort((a, b) => b.score - a.score);
    
    for (let i = 0; i < counts.hotCount && i < hotCandidates.length; i++) {
        if (!selected.includes(hotCandidates[i].num)) {
            selected.push(hotCandidates[i].num);
        }
    }
    
    // Selecionar frios
    const coldCandidates = analysis.coldNumbers
        .map(n => ({ num: n, score: scores[n] }))
        .sort((a, b) => b.score - a.score);
    
    for (let i = 0; i < counts.coldCount && i < coldCandidates.length; i++) {
        if (!selected.includes(coldCandidates[i].num)) {
            selected.push(coldCandidates[i].num);
        }
    }
    
    // Selecionar neutros
    const neutralCandidates = analysis.neutralNumbers
        .map(n => ({ num: n, score: scores[n] }))
        .sort((a, b) => b.score - a.score);
    
    for (let i = 0; i < counts.neutralCount && i < neutralCandidates.length; i++) {
        if (!selected.includes(neutralCandidates[i].num)) {
            selected.push(neutralCandidates[i].num);
        }
    }
    
    // Completar com duplas frequentes se necessário
    if (selected.length < totalCount && weights.pairs > 0) {
        for (const pair of analysis.pairs) {
            if (selected.length >= totalCount) break;
            const [n1, n2] = pair.pair.split('-').map(Number);
            if (!selected.includes(n1) && selected.length < totalCount) {
                selected.push(n1);
            }
            if (!selected.includes(n2) && selected.length < totalCount) {
                selected.push(n2);
            }
        }
    }
    
    // Completar com melhores scores restantes
    const allScored = Object.entries(scores)
        .map(([num, score]) => ({ num: parseInt(num), score }))
        .sort((a, b) => b.score - a.score);
    
    for (const item of allScored) {
        if (selected.length >= totalCount) break;
        if (!selected.includes(item.num)) {
            selected.push(item.num);
        }
    }
    
    return selected;
}

/**
 * Calcula distribuição customizada baseada nos pesos
 * @param {Object} weights - Pesos customizados
 * @returns {Object} Distribuição calculada
 */
function calculateCustomDistribution(weights) {
    if (!weights) {
        return { hot: 0.33, neutral: 0.34, cold: 0.33 };
    }
    
    const total = weights.hot + weights.cold;
    if (total === 0) {
        return { hot: 0.33, neutral: 0.34, cold: 0.33 };
    }
    
    const hotRatio = weights.hot / (total + 50);
    const coldRatio = weights.cold / (total + 50);
    const neutralRatio = 1 - hotRatio - coldRatio;
    
    return { hot: hotRatio, neutral: neutralRatio, cold: coldRatio };
}
