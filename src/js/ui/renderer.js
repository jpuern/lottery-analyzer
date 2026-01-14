/**
 * Renderer
 * Renderização de componentes na interface
 */

import { DOM } from './domElements.js';
import { getAllStrategies } from '../config/strategyConfig.js';
import { getTemperatureIcon } from '../analysis/temperatureAnalyzer.js';
import { padNumber, formatCurrency, formatDate } from '../utils/helpers.js';

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
export function renderResults(result, analysis, config, recentResults) {
    renderStrategyUsed(result.strategy);
    renderLotteryInfo(config, analysis.totalContests);
    renderGeneratedNumbers(result.sequence, analysis.temperature, config.cssClass);
    renderCompositionBar(result.composition, result.sequence.length);
    renderStats(analysis.totalContests, result.composition, result.includedPairs.length);
    renderTemperatureAnalysis(analysis);
    renderPairs(analysis.pairs, result.includedPairs);
    renderTriplets(analysis.triplets);
    renderDelayedNumbers(analysis.sortedDelay, result.sequence);
    renderRecentContests(recentResults, config.cssClass, analysis.temperature);
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
/**
 * Renderiza os últimos 10 concursos
 */
function renderRecentContests(results, cssClass, temperature) {
    const container = DOM.recentContests();
    if (!container || !results || results.length === 0) {
        if (container) {
            container.innerHTML = '<p class="text-muted">Nenhum concurso disponível</p>';
        }
        return;
    }
    
    // Ordenar por concurso (maior para menor) e pegar os 10 primeiros
    const sortedResults = [...results].sort((a, b) => 
        parseInt(b.concurso) - parseInt(a.concurso)
    );
    
    const last10 = sortedResults.slice(0, 10);
    
    // O primeiro é o mais recente - mostrar info do próximo concurso
    const mostRecent = last10[0];
    const nextContestInfo = getNextContestInfo(mostRecent);
    
    // Header com próximo concurso
    let headerHtml = '';
    if (nextContestInfo) {
        headerHtml = `
            <div class="next-contest-info">
                <div class="next-contest-info__header">
                    <span class="next-contest-info__icon">🎯</span>
                    <span class="next-contest-info__title">Próximo Concurso: ${nextContestInfo.numero}</span>
                </div>
                <div class="next-contest-info__details">
                    <div class="next-contest-info__item">
                        <span class="next-contest-info__label">💰 Prêmio Estimado:</span>
                        <span class="next-contest-info__value next-contest-info__value--prize">
                            ${nextContestInfo.valorEstimado}
                        </span>
                    </div>
                    ${nextContestInfo.valorAcumulado !== 'R$ 0,00' ? `
                        <div class="next-contest-info__item">
                            <span class="next-contest-info__label">📈 Valor Acumulado:</span>
                            <span class="next-contest-info__value next-contest-info__value--accumulated">
                                ${nextContestInfo.valorAcumulado}
                            </span>
                        </div>
                    ` : ''}
                    ${nextContestInfo.dataProximoConcurso ? `
                        <div class="next-contest-info__item">
                            <span class="next-contest-info__label">📅 Data do Sorteio:</span>
                            <span class="next-contest-info__value">
                                ${nextContestInfo.dataProximoConcurso}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Cards dos concursos
    const contestsHtml = last10.map(contest => {
        const dezenas = contest.dezenas.map(d => parseInt(d)).sort((a, b) => a - b);
        const data = formatDate(contest.data);
        const premio = getPremioInfo(contest);
        const acumulado = contest.acumulou || false;
        
        return `
            <div class="contest-card">
                <div class="contest-card__header">
                    <span class="contest-card__number">
                        🎱 Concurso ${contest.concurso}
                    </span>
                    <span class="contest-card__date">
                        📅 ${data}
                        ${acumulado ? '<span class="contest-card__accumulated">Acumulou</span>' : ''}
                    </span>
                </div>
                
                <div class="contest-card__numbers">
                    ${dezenas.map(num => {
                        const temp = temperature[num];
                        const tempClass = temp === 'hot' ? 'is-hot' : temp === 'cold' ? 'is-cold' : '';
                        return `
                            <span class="contest-card__ball contest-card__ball--${cssClass} ${tempClass}">
                                ${padNumber(num)}
                            </span>
                        `;
                    }).join('')}
                </div>
                
                <div class="contest-card__footer">
                    <span class="contest-card__prize">
                        💰 ${premio.valor}
                    </span>
                    <span class="contest-card__winners">
                        ${premio.ganhadores}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = headerHtml + contestsHtml;
}

/**
 * Extrai informações do próximo concurso
 */
function getNextContestInfo(contest) {
    if (!contest) return null;
    
    const proximoConcurso = parseInt(contest.concurso) + 1;
    
    // Tentar pegar valores do próximo concurso
    const valorEstimado = contest.valorEstimadoProximoConcurso || 
                          contest.valorEstimadoConcursoEspecial || 
                          0;
    
    const valorAcumulado = contest.valorAcumuladoProximoConcurso || 
                           contest.valorAcumuladoConcursoEspecial ||
                           contest.valorAcumulado ||
                           0;
    
    const dataProximo = contest.dataProximoConcurso || null;
    
    return {
        numero: proximoConcurso,
        valorEstimado: formatCurrency(valorEstimado),
        valorAcumulado: formatCurrency(valorAcumulado),
        dataProximoConcurso: dataProximo ? formatDate(dataProximo) : null,
        acumulou: contest.acumulou || false
    };
}

/**
 * Extrai informações de prêmio do concurso
 */
function getPremioInfo(contest) {
    let valorPremio = 0;
    let numGanhadores = 0;
    
    if (contest.premiacoes && contest.premiacoes.length > 0) {
        const premioPrincipal = contest.premiacoes[0];
        valorPremio = premioPrincipal.valorPremio || 0;
        numGanhadores = premioPrincipal.ganhadores || 0;
    } else if (contest.valorArrecadado) {
        valorPremio = contest.valorArrecadado;
    }
    
    return {
        valor: formatCurrency(valorPremio),
        ganhadores: numGanhadores > 0 
            ? `🏆 <strong>${numGanhadores}</strong> ganhador${numGanhadores > 1 ? 'es' : ''}`
            : '😢 Sem ganhadores'
    };
}