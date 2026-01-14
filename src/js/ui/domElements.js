/**
 * DOM Elements
 * Referências aos elementos do DOM
 */

export const DOM = {
    // Configurações
    lotteryType: () => document.getElementById('lotteryType'),
    selectionMode: () => document.querySelector('input[name="selectionMode"]:checked'),
    selectionModeRadios: () => document.querySelectorAll('input[name="selectionMode"]'),
    ultimosConfig: () => document.getElementById('ultimosConfig'),
    intervaloConfig: () => document.getElementById('intervaloConfig'),
    lastContests: () => document.getElementById('lastContests'),
    contestStart: () => document.getElementById('contestStart'),
    contestEnd: () => document.getElementById('contestEnd'),
    numbersToGenerate: () => document.getElementById('numbersToGenerate'),
    
    // Estratégias
    strategiesGrid: () => document.getElementById('strategiesGrid'),
    customConfig: () => document.getElementById('customConfig'),
    
    // Sliders
    hotWeight: () => document.getElementById('hotWeight'),
    coldWeight: () => document.getElementById('coldWeight'),
    pairsWeight: () => document.getElementById('pairsWeight'),
    tripletsWeight: () => document.getElementById('tripletsWeight'),
    randomWeight: () => document.getElementById('randomWeight'),
    hotValue: () => document.getElementById('hotValue'),
    coldValue: () => document.getElementById('coldValue'),
    pairsValue: () => document.getElementById('pairsValue'),
    tripletsValue: () => document.getElementById('tripletsValue'),
    randomValue: () => document.getElementById('randomValue'),
    
    // Botões
    analyzeBtn: () => document.getElementById('analyzeBtn'),
    regenerateBtn: () => document.getElementById('regenerateBtn'),
    regenerateBtnInline: () => document.getElementById('regenerateBtnInline'),
    
    // Feedback
    loader: () => document.getElementById('loader'),
    error: () => document.getElementById('error'),
    results: () => document.getElementById('results'),
    
    // Resultados
    strategyUsed: () => document.getElementById('strategyUsed'),
    lotteryInfo: () => document.getElementById('lotteryInfo'),
    generatedNumbers: () => document.getElementById('generatedNumbers'),
    compositionBar: () => document.getElementById('compositionBar'),
    statContests: () => document.getElementById('statContests'),
    statHot: () => document.getElementById('statHot'),
    statCold: () => document.getElementById('statCold'),
    statPairs: () => document.getElementById('statPairs'),
    
    // Análise
    temperatureAnalysis: () => document.getElementById('temperatureAnalysis'),
    topPairs: () => document.getElementById('topPairs'),
    topTriplets: () => document.getElementById('topTriplets'),
    delayedNumbers: () => document.getElementById('delayedNumbers')
};
