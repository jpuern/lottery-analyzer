/**
 * Tabs
 * Navegação entre as abas "Conferir Jogos" e "Analisar e Gerar"
 */

/**
 * Inicializa as abas
 * A aba inicial vem do hash da URL (#conferir, #analisar); sem hash, abre a primeira
 */
export function initTabs() {
    const tabs = [...document.querySelectorAll('.tabs__tab')];

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab.dataset.tab));

        // Navegação por teclado (setas) entre as abas
        tab.addEventListener('keydown', (event) => {
            const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
            if (!offset) return;
            const next = tabs[(index + offset + tabs.length) % tabs.length];
            selectTab(next.dataset.tab);
            next.focus();
        });
    });

    window.addEventListener('hashchange', () => selectTab(getTabFromHash(), { updateHash: false }));

    selectTab(getTabFromHash() || tabs[0].dataset.tab, { updateHash: false });
}

/**
 * Seleciona uma aba
 * @param {string} name - Nome da aba (data-tab)
 * @param {Object} options - { updateHash }
 */
export function selectTab(name, { updateHash = true } = {}) {
    const tabs = document.querySelectorAll('.tabs__tab');
    if (![...tabs].some(tab => tab.dataset.tab === name)) return;

    tabs.forEach(tab => {
        const isSelected = tab.dataset.tab === name;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
    });

    if (updateHash) {
        history.replaceState(null, '', `#${name}`);
    }
}

function getTabFromHash() {
    return location.hash.slice(1);
}
