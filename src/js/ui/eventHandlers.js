/**
 * Event Handlers
 * Gerenciamento de eventos da interface
 */

import { DOM } from './domElements.js';
import { getLotteryConfig } from '../config/lotteryConfig.js';
import { renderStrategies } from './renderer.js';
import { updateSliderValue } from './uiHelpers.js';

let currentStrategy = 'balanced';

/**
 * Inicializa todos os event listeners
 * @param {Function} onAnalyze - Callback para análise
 * @param {Function} onRegenerate - Callback para regenerar
 */
export function initEventListeners(onAnalyze, onRegenerate) {
    // Modo de seleção
    DOM.selectionModeRadios().forEach(radio => {
        radio.addEventListener('change', handleSelectionModeChange);
    });
    
    // Tipo de loteria
    DOM.lotteryType().addEventListener('change', handleLotteryTypeChange);
    
    // Sliders
    initSliderListeners();
    
    // Botões
    DOM.analyzeBtn().addEventListener('click', onAnalyze);
    DOM.regenerateBtn().addEventListener('click', onRegenerate);
    DOM.regenerateBtnInline().addEventListener('click', onRegenerate);
    
    // Renderizar estratégias
    renderStrategies(handleStrategySelect);
}

/**
 * Handler para mudança de modo de seleção
 * @param {Event} event - Evento de change
 */
function handleSelectionModeChange(event) {
    const isUltimos = event.target.value === 'ultimos';
    DOM.ultimosConfig().style.display = isUltimos ? 'block' : 'none';
    DOM.intervaloConfig().style.display = isUltimos ? 'none' : 'flex';
}

/**
 * Handler para mudança de tipo de loteria
 * @param {Event} event - Evento de change
 */
function handleLotteryTypeChange(event) {
    const config = getLotteryConfig(event.target.value);
    if (config) {
        DOM.numbersToGenerate().value = config.defaultNumbers;
    }
}

/**
 * Handler para seleção de estratégia
 * @param {string} strategyId - ID da estratégia selecionada
 * @param {HTMLElement} cardElement - Elemento do card clicado
 */
function handleStrategySelect(strategyId, cardElement) {
    currentStrategy = strategyId;
    
    // Atualizar visual
    document.querySelectorAll('.strategy-card').forEach(card => {
        card.classList.remove('selected');
    });
    cardElement.classList.add('selected');
    
    // Mostrar/ocultar config customizada
    const customConfig = DOM.customConfig();
    if (strategyId === 'custom') {
        customConfig.classList.add('show');
    } else {
        customConfig.classList.remove('show');
    }
}

/**
 * Inicializa listeners dos sliders
 */
function initSliderListeners() {
    const sliders = [
        { slider: DOM.hotWeight, display: DOM.hotValue },
        { slider: DOM.coldWeight, display: DOM.coldValue },
        { slider: DOM.pairsWeight, display: DOM.pairsValue },
        { slider: DOM.tripletsWeight, display: DOM.tripletsValue },
        { slider: DOM.randomWeight, display: DOM.randomValue }
    ];
    
    sliders.forEach(({ slider, display }) => {
        const sliderEl = slider();
        const displayEl = display();
        if (sliderEl && displayEl) {
            sliderEl.addEventListener('input', () => {
                updateSliderValue(sliderEl, displayEl);
            });
        }
    });
}

/**
 * Retorna a estratégia atualmente selecionada
 * @returns {string} ID da estratégia
 */
export function getCurrentStrategy() {
    return currentStrategy;
}

/**
 * Retorna os pesos customizados dos sliders
 * @returns {Object} Pesos customizados
 */
export function getCustomWeights() {
    return {
        hot: parseInt(DOM.hotWeight().value),
        cold: parseInt(DOM.coldWeight().value),
        pairs: parseInt(DOM.pairsWeight().value),
        triplets: parseInt(DOM.tripletsWeight().value),
        random: parseInt(DOM.randomWeight().value)
    };
}
