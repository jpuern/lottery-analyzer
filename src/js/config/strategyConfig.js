/**
 * Strategy Configuration
 * Configurações das estratégias de geração
 */

export const STRATEGY_CONFIG = {
    balanced: {
        id: 'balanced',
        name: 'Equilibrada',
        icon: '⚖️',
        description: 'Combina números quentes, neutros e frios de forma balanceada, usando análise de duplas e trincas.',
        weights: { hot: 40, cold: 25, pairs: 20, triplets: 10, random: 5 },
        distribution: { hot: 0.40, neutral: 0.35, cold: 0.25 },
        tags: [
            { text: '40% Quentes', type: 'hot' },
            { text: '35% Neutros', type: 'neutral' },
            { text: '25% Frios', type: 'cold' }
        ],
        recommended: true
    },
    hot: {
        id: 'hot',
        name: 'Números Quentes',
        icon: '🔥',
        description: 'Prioriza números com maior frequência recente. Ideal para quem acredita em "sequências quentes".',
        weights: { hot: 70, cold: 5, pairs: 15, triplets: 5, random: 5 },
        distribution: { hot: 0.70, neutral: 0.20, cold: 0.10 },
        tags: [
            { text: '70% Quentes', type: 'hot' },
            { text: '20% Neutros', type: 'neutral' },
            { text: '10% Frios', type: 'cold' }
        ]
    },
    cold: {
        id: 'cold',
        name: 'Números Frios (Atrasados)',
        icon: '❄️',
        description: 'Foca em números que estão "devendo" aparecer. Baseado na Lei dos Grandes Números.',
        weights: { hot: 10, cold: 60, pairs: 15, triplets: 10, random: 5 },
        distribution: { hot: 0.15, neutral: 0.25, cold: 0.60 },
        tags: [
            { text: '60% Frios', type: 'cold' },
            { text: '25% Neutros', type: 'neutral' },
            { text: '15% Quentes', type: 'hot' }
        ]
    },
    pairs: {
        id: 'pairs',
        name: 'Padrões (Duplas/Trincas)',
        icon: '👥',
        description: 'Prioriza números que frequentemente saem juntos. Analisa correlações entre dezenas.',
        weights: { hot: 15, cold: 10, pairs: 45, triplets: 25, random: 5 },
        distribution: { hot: 0.35, neutral: 0.40, cold: 0.25 },
        tags: [
            { text: '50% Duplas', type: 'pairs' },
            { text: '30% Trincas', type: 'triplets' },
            { text: '20% Freq.', type: 'balanced' }
        ]
    },
    cycles: {
        id: 'cycles',
        name: 'Análise de Ciclos',
        icon: '🔄',
        description: 'Identifica padrões cíclicos de aparecimento. Números que seguem intervalos regulares.',
        weights: { hot: 25, cold: 30, pairs: 20, triplets: 15, random: 10 },
        distribution: { hot: 0.30, neutral: 0.40, cold: 0.30 },
        tags: [
            { text: 'Ciclo Médio', type: 'balanced' },
            { text: 'Tendência', type: 'hot' },
            { text: 'Regularidade', type: 'neutral' }
        ]
    },
    custom: {
        id: 'custom',
        name: 'Personalizada',
        icon: '🎛️',
        description: 'Configure manualmente os pesos de cada fator: quentes, frios, duplas, trincas e atraso.',
        weights: { hot: 30, cold: 20, pairs: 25, triplets: 15, random: 10 },
        distribution: { hot: 0.33, neutral: 0.34, cold: 0.33 },
        tags: [
            { text: 'Customizável', type: 'balanced' }
        ]
    }
};

/**
 * Retorna a configuração de uma estratégia específica
 * @param {string} strategyId - ID da estratégia
 * @returns {Object} Configuração da estratégia
 */
export function getStrategyConfig(strategyId) {
    return STRATEGY_CONFIG[strategyId] || STRATEGY_CONFIG.balanced;
}

/**
 * Retorna todas as estratégias disponíveis
 * @returns {Array} Lista de estratégias
 */
export function getAllStrategies() {
    return Object.values(STRATEGY_CONFIG);
}
