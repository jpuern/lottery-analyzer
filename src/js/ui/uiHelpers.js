/**
 * UI Helpers
 * Funções auxiliares para manipulação da interface
 */

import { DOM } from './domElements.js';

/**
 * Mostra ou oculta o loader
 * @param {boolean} show - Se deve mostrar
 */
export function showLoader(show) {
    const loader = DOM.loader();
    const btn = DOM.analyzeBtn();
    
    loader.classList.toggle('show', show);
    btn.disabled = show;
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
export function showError(message) {
    const error = DOM.error();
    error.textContent = `❌ ${message}`;
    error.classList.add('show');
}

/**
 * Oculta mensagem de erro
 */
export function hideError() {
    DOM.error().classList.remove('show');
}

/**
 * Mostra a seção de resultados
 */
export function showResults() {
    DOM.results().classList.add('show');
    DOM.regenerateBtn().style.display = 'block';
}

/**
 * Oculta a seção de resultados
 */
export function hideResults() {
    DOM.results().classList.remove('show');
}

/**
 * Atualiza o valor exibido de um slider
 * @param {HTMLElement} slider - Elemento do slider
 * @param {HTMLElement} display - Elemento de display
 */
export function updateSliderValue(slider, display) {
    display.textContent = `${slider.value}%`;
}

/**
 * Obtém os valores do formulário de configuração
 * @returns {Object} Valores do formulário
 */
export function getFormValues() {
    const lotteryType = DOM.lotteryType().value;
    const selectionMode = DOM.selectionMode().value;
    let numbersToGenerate = parseInt(DOM.numbersToGenerate().value);
    
    // Validações
    if (numbersToGenerate < 1) numbersToGenerate = 1;
    if (numbersToGenerate > 20) numbersToGenerate = 20;
    
    const values = {
        lotteryType,
        selectionMode,
        numbersToGenerate
    };
    
    if (selectionMode === 'ultimos') {
        values.lastN = parseInt(DOM.lastContests().value) || 100;
    } else {
        values.start = parseInt(DOM.contestStart().value) || 1;
        values.end = parseInt(DOM.contestEnd().value) || 100;
    }
    
    return values;
}
