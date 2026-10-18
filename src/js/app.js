/**
 * App
 * Módulo principal da aplicação
 */

import { getLotteryConfig } from './config/lotteryConfig.js';
import { fetchLotteryResults, filterResults } from './services/apiService.js';
import { analyzeFrequency, calculateFrequencyStats } from './analysis/frequencyAnalyzer.js';
import { analyzePairs, analyzeTriplets } from './analysis/pairsAnalyzer.js';
import { classifyTemperature, groupByTemperature } from './analysis/temperatureAnalyzer.js';
import { generateSequence } from './analysis/sequenceGenerator.js';
import { DOM } from './ui/domElements.js';
import { initEventListeners, getCurrentStrategy, getCustomWeights } from './ui/eventHandlers.js';
import { renderResults } from './ui/renderer.js';
import { showLoader, showError, hideError, showResults, hideResults, getFormValues } from './ui/uiHelpers.js';
import { initDonationHandlers } from './ui/donationHandler.js';
import { initMyGames } from './ui/myGames.js';
import { initTabs } from './ui/tabs.js';
import { initPWA } from './pwa.js';


// Estado global da aplicação
let appState = {
    analysis: null,
    config: null,
    allResults: null,
    filteredResults: null
};

/**
 * Inicializa a aplicação
 */
function init() {
    console.log('🎲 Analisador de Loterias Pro - Inicializado');
    initTabs();
    initEventListeners(handleAnalyze, handleRegenerate);
    initDonationHandlers();
    initMyGames();
    initPWA();
}

/**
 * Handler principal para análise
 */
async function handleAnalyze() {
    const formValues = getFormValues();
    const lotteryConfig = getLotteryConfig(formValues.lotteryType);
    
    if (!lotteryConfig) {
        showError('Loteria não encontrada');
        return;
    }
    
    // Validar quantidade de números
    if (formValues.numbersToGenerate > lotteryConfig.max) {
        formValues.numbersToGenerate = lotteryConfig.max;
    }
    
    showLoader(true);
    hideError();
    hideResults();
    
    try {
        // Buscar dados da API
        const allResults = await fetchLotteryResults(lotteryConfig.api);
        
        // Filtrar resultados
        const filterOptions = formValues.selectionMode === 'ultimos'
            ? { lastN: formValues.lastN }
            : { start: formValues.start, end: formValues.end };
        
        const filteredResults = filterResults(allResults, formValues.selectionMode, filterOptions);
        
        if (filteredResults.length === 0) {
            throw new Error('Nenhum concurso encontrado no intervalo especificado');
        }
        
        // Realizar análise completa
        const analysis = performFullAnalysis(filteredResults, lotteryConfig);
        
        // Guardar estado
        appState.analysis = analysis;
        appState.allResults = allResults;
        appState.filteredResults = filteredResults;
        appState.config = {
            ...lotteryConfig,
            numbersToGenerate: formValues.numbersToGenerate,
            firstContest: filteredResults[0].concurso,
            lastContest: filteredResults[filteredResults.length - 1].concurso
        };
        
        // Gerar e exibir resultados
        const strategy = getCurrentStrategy();
        const customWeights = strategy === 'custom' ? getCustomWeights() : null;
        const result = generateSequence(analysis, formValues.numbersToGenerate, lotteryConfig, strategy, customWeights);
        
        renderResults(result, analysis, appState.config, allResults);
        showResults();
        
    } catch (error) {
        console.error('Erro na análise:', error);
        showError(error.message);
    } finally {
        showLoader(false);
    }
}

/**
 * Handler para regenerar sequência
 */
function handleRegenerate() {
    if (!appState.analysis || !appState.config) {
        showError('Execute uma análise primeiro');
        return;
    }
    
    const strategy = getCurrentStrategy();
    const customWeights = strategy === 'custom' ? getCustomWeights() : null;
    const result = generateSequence(
        appState.analysis,
        appState.config.numbersToGenerate,
        appState.config,
        strategy,
        customWeights
    );
    
    renderResults(result, appState.analysis, appState.config, appState.allResults);
}

/**
 * Realiza análise completa dos dados
 * @param {Array} results - Resultados filtrados
 * @param {Object} config - Configuração da loteria
 * @returns {Object} Dados da análise
 */
function performFullAnalysis(results, config) {
    // Análise de frequência
    const frequencyData = analyzeFrequency(results, config);
    const frequencyStats = calculateFrequencyStats(frequencyData.frequency);
    
    // Classificação de temperatura
    const temperature = classifyTemperature(
        frequencyData.frequency,
        frequencyStats.average,
        frequencyStats.standardDeviation
    );
    
    // Adicionar temperatura aos dados de frequência ordenados
    const sortedFrequencyWithTemp = frequencyData.sortedFrequency.map(item => ({
        ...item,
        temp: temperature[item.num]
    }));
    
    // Agrupar por temperatura
    const temperatureGroups = groupByTemperature(temperature, frequencyData.sortedFrequency);
    
    // Análise de duplas e trincas
    const pairs = analyzePairs(results);
    const triplets = analyzeTriplets(results);
    
    return {
        ...frequencyData,
        sortedFrequency: sortedFrequencyWithTemp,
        temperature,
        ...temperatureGroups,
        pairs,
        triplets,
        stats: frequencyStats
    };
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
