/**
 * Renderer
 * Renderização de componentes na interface
 */

import { DOM } from './domElements.js';
import { getAllStrategies } from '../config/strategyConfig.js';
import { getTemperatureIcon } from '../analysis/temperatureAnalyzer.js';
import { padNumber } from '../utils/helpers.js';

/**
 * Renderiza os cards de estratégias
 * @param {Function} onSelect - Callback de seleção
 */
export function renderStrategies(onSelect) {
    const strategies = getAllStrategies();
    const container = DOM.strategiesGrid();
    
    container.innerHTML = strategies.map(strategy => `
        <div class="strategy-card ${strategy.id === 'balanced' ? 'selected' : ''}" 
             data-strategy="${strategy.id}">
            <input type="radio" name="strategy" value="${strategy.id}" 
                   ${strategy.id === 'balanced' ? 'checked' : ''}>
            <div class="strategy-card__check">✓</div>
            <div class="strategy-card__icon">${strategy.icon}</div>
            <h4 class="strategy-card__title">${strategy.name}${strategy.recommended ? ' (Recomendada)' : ''}</h4>
            <p class="strategy-card__description">${strategy.description}</p>
            <div class="strategy-card__tags">
                ${strategy.tags.map(tag => `
                    <span class="tag tag--${tag.type}">${tag.text}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners
    container.querySelectorAll('.strategy-card').forEach(card => {
        card.addEventListener('click', () => {
            const strategyId = card.dataset.strategy;
            onSelect(strategyId, card);
        });
    });
}

/**
 * Renderiza os resultados da análise
 * @param {Object} result - Resultado da geração
 * @param {Object} analysis - Dados da análise
 * @param {Object} config - Configuração atual
 */
export function renderResults(result, analysis, config) {
    renderStrategyUsed(result.strategy);
    renderLotteryInfo(config, analysis.totalContests);
    renderGeneratedNumbers(result.sequence, analysis.temperature, config.cssClass);
    renderCompositionBar(result.composition, result.sequence.length);
    renderStats(analysis.totalContests, result.composition, result.includedPairs.length);
    renderTemperatureAnalysis(analysis);
    renderPairs(analysis.pairs, result.includedPairs);
    renderTriplets(analysis.triplets);
    renderDelayedNumbers(analysis.sortedDelay, result.sequence);
}

/**
 * Renderiza a estratégia utilizada
 * @param {Object} strategy - Configuração da estratégia
 */
function renderStrategyUsed(strategy) {
    DOM.strategyUsed().innerHTML = `
        <h3>${strategy.icon} ${strategy.name}</h3>
        <p>${strategy.description}</p>
    `;
}

/**
 * Renderiza informações da loteria
 * @param {Object} config - Configuração
 * @param {number} totalContests - Total de concursos
 */
function renderLotteryInfo(config, totalContests) {
    DOM.lotteryInfo().innerHTML = `
        <span>Loteria: <strong>${config.name}</strong></span>
        <span>Concursos: <strong>${config.firstContest} até ${config.lastContest}</strong></span>
        <span>Analisados: <strong>${totalContests}</strong></span>
    `;
}

/**
 * Renderiza os números gerados
 * @param {Array} sequence - Sequência de números
 * @param {Object} temperature - Classificação de temperatura
 * @param {string} cssClass - Classe CSS da loteria
 */
function renderGeneratedNumbers(sequence, temperature, cssClass) {
    DOM.generatedNumbers().innerHTML = sequence.map((num, index) => {
        const temp = temperature[num];
        const tempIcon = getTemperatureIcon(temp);
        return `
            <div class="number-ball number-ball--${cssClass}" 
                 style="animation-delay: ${index * 0.1}s">
                ${padNumber(num)}
                <span class="number-ball__temp number-ball__temp--${temp}">${tempIcon}</span>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza a barra de composição
 * @param {Object} composition - Composição da sequência
 * @param {number} total - Total de números
 */
function renderCompositionBar(composition, total) {
    const hotPct = ((composition.hot / total) * 100).toFixed(0);
    const neutralPct = ((composition.neutral / total) * 100).toFixed(0);
    const coldPct = ((composition.cold / total) * 100).toFixed(0);
    
    let html = '';
    if (composition.hot > 0) {
        html += `<div class="composition-bar__segment composition-bar__segment--hot" style="width: ${hotPct}%">${composition.hot}</div>`;
    }
    if (composition.neutral > 0) {
        html += `<div class="composition-bar__segment composition-bar__segment--neutral" style="width: ${neutralPct}%">${composition.neutral}</div>`;
    }
    if (composition.cold > 0) {
        html += `<div class="composition-bar__segment composition-bar__segment--cold" style="width: ${coldPct}%">${composition.cold}</div>`;
    }
    
    DOM.compositionBar().innerHTML = html;
}

/**
 * Renderiza estatísticas
 * @param {number} totalContests - Total de concursos
 * @param {Object} composition - Composição
 * @param {number} pairsCount - Quantidade de duplas
 */
function renderStats(totalContests, composition, pairsCount) {
    DOM.statContests().textContent = totalContests.toLocaleString();
    DOM.statHot().textContent = `${composition.hot} números`;
    DOM.statCold().textContent = `${composition.cold} números`;
    DOM.statPairs().textContent = `${pairsCount} dupla(s)`;
}

/**
 * Renderiza análise de temperatura
 * @param {Object} analysis - Dados da análise
 */
function renderTemperatureAnalysis(analysis) {
    const maxFreq = analysis.sortedFrequency[0].count;
    
    DOM.temperatureAnalysis().innerHTML = analysis.sortedFrequency.slice(0, 15).map(item => {
        const temp = analysis.temperature[item.num];
        const tempIcon = getTemperatureIcon(temp);
        const width = ((item.count / maxFreq) * 100).toFixed(0);
        
        return `
            <div class="freq-bar">
                <span class="freq-bar__num">${padNumber(item.num)}</span>
                <div class="freq-bar__container">
                    <div class="freq-bar__fill freq-bar__fill--${temp}" style="width: ${width}%"></div>
                </div>
                <span class="freq-bar__count">${item.count}x</span>
                <span class="freq-bar__badge freq-bar__badge--${temp}">${tempIcon}</span>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza duplas frequentes
 * @param {Array} pairs - Lista de duplas
 * @param {Array} includedPairs - Duplas incluídas na sequência
 */
function renderPairs(pairs, includedPairs) {
    const includedKeys = includedPairs.map(p => p.pair);
    
    DOM.topPairs().innerHTML = pairs.slice(0, 10).map(item => {
        const isIncluded = includedKeys.includes(item.pair);
        const className = isIncluded ? 'stat-item stat-item--highlighted' : 'stat-item';
        return `<span class="${className}">${item.pair} (${item.count}x)${isIncluded ? ' ✓' : ''}</span>`;
    }).join('') || '<span class="stat-item">Sem dados suficientes</span>';
}

/**
 * Renderiza trincas frequentes
 * @param {Array} triplets - Lista de trincas
 */
function renderTriplets(triplets) {
    DOM.topTriplets().innerHTML = triplets.slice(0, 8).map(item => `
        <span class="stat-item">${item.triplet} (${item.count}x)</span>
    `).join('') || '<span class="stat-item">Sem dados suficientes</span>';
}

/**
 * Renderiza números atrasados
 * @param {Array} sortedDelay - Lista ordenada por atraso
 * @param {Array} sequence - Sequência gerada
 */
function renderDelayedNumbers(sortedDelay, sequence) {
    DOM.delayedNumbers().innerHTML = sortedDelay.slice(0, 10).map(item => {
        const isSelected = sequence.includes(item.num);
        const className = isSelected ? 'stat-item stat-item--cold' : 'stat-item';
        return `<span class="${className}">${padNumber(item.num)} (${item.delay} conc.)${isSelected ? ' ✓' : ''}</span>`;
    }).join('');
}
