/**
 * My Games
 * Seção para salvar e conferir os jogos do usuário
 */

import { DOM } from './domElements.js';
import { getLotteryConfig } from '../config/lotteryConfig.js';
import { getFixedGames } from '../config/myGamesConfig.js';
import { fetchContest } from '../services/apiService.js';
import { getGamesText, saveGamesText, getLastLottery, setLastLottery } from '../services/gamesStorage.js';
import { readHistory } from '../services/historyCache.js';
import { parseGames, checkGame } from '../analysis/gameChecker.js';
import { padNumber, formatCurrency, formatDate, debounce } from '../utils/helpers.js';

// Quantidade de concursos recentes sugeridos no campo "Concurso"
const CONTEST_OPTIONS_COUNT = 5;

// Concursos já buscados nesta sessão, por loteria: { [lotteryType]: Map<numero, concurso> }
const contestsCache = {};

/**
 * Inicializa a seção "Conferir Meus Jogos"
 * Se houver jogos fixos ou salvos, já confere contra o último concurso
 */
export function initMyGames() {
    const lotterySelect = DOM.myGamesLottery();
    const input = DOM.myGamesInput();

    const lastLottery = getLastLottery();
    if (lastLottery && getLotteryConfig(lastLottery)) {
        lotterySelect.value = lastLottery;
    }
    loadGamesFor(lotterySelect.value);

    lotterySelect.addEventListener('change', () => {
        setLastLottery(lotterySelect.value);
        loadGamesFor(lotterySelect.value);
        DOM.myGamesContest().value = '';
        DOM.myGamesResults().innerHTML = '';
        loadContestOptions(lotterySelect.value);
    });

    // Escolher um concurso da lista (ou digitar e sair do campo) já confere
    const contestInput = DOM.myGamesContest();
    contestInput.addEventListener('change', handleCheck);
    contestInput.addEventListener('input', (event) => {
        if (event.inputType === 'insertReplacementText' || event.inputType === undefined) {
            handleCheck();
        }
    });

    input.addEventListener('input', debounce(() => {
        saveGamesText(lotterySelect.value, input.value);
        updateHint();
    }, 300));

    DOM.checkGamesBtn().addEventListener('click', handleCheck);

    if (getGameGroups(lotterySelect.value).length > 0) {
        handleCheck();
    } else {
        loadContestOptions(lotterySelect.value);
    }
}

function loadGamesFor(lotteryType) {
    DOM.myGamesInput().value = getGamesText(lotteryType);
    updateHint();
}

/**
 * Monta os grupos de jogos a conferir: blocos fixos + jogos digitados
 * @param {string} lotteryType - Tipo da loteria
 * @returns {Array<{name: string, games: Array<Object>}>} Grupos com jogos
 */
function getGameGroups(lotteryType) {
    const config = getLotteryConfig(lotteryType);
    const groups = getFixedGames(lotteryType).map(block => ({
        name: block.name,
        games: parseGames(block.games, config)
    }));

    const typedGames = parseGames(DOM.myGamesInput().value, config);
    if (typedGames.length > 0) {
        groups.push({ name: groups.length > 0 ? 'Outros jogos' : 'Meus jogos', games: typedGames });
    }

    return groups.filter(group => group.games.length > 0);
}

/**
 * Atualiza a dica abaixo do campo com a contagem de jogos fixos e válidos
 */
function updateHint() {
    const lotteryType = DOM.myGamesLottery().value;
    const config = getLotteryConfig(lotteryType);
    const games = parseGames(DOM.myGamesInput().value, config);
    const valid = games.filter(g => !g.error).length;
    const fixedBlocks = getFixedGames(lotteryType);
    const allowed = config.betMin === config.betMax
        ? `${config.betMin} dezenas`
        : `${config.betMin} a ${config.betMax} dezenas`;

    const fixedText = fixedBlocks.length > 0
        ? `Jogos fixos: ${fixedBlocks.map(b => `${b.name} (${parseGames(b.games, config).length})`).join(', ')}. `
        : '';

    DOM.myGamesHint().textContent = fixedText + (games.length === 0
        ? `Digite ${allowed} de ${padNumber(config.min)} a ${config.max} por linha. Qualquer separador serve.`
        : `${valid} de ${games.length} jogo(s) extra(s) válido(s) · ${config.name}: ${allowed} por jogo`);
}

/**
 * Busca o concurso e confere todos os jogos
 */
async function handleCheck() {
    const lotteryType = DOM.myGamesLottery().value;
    const config = getLotteryConfig(lotteryType);
    const groups = getGameGroups(lotteryType);
    const resultsEl = DOM.myGamesResults();
    const button = DOM.checkGamesBtn();

    saveGamesText(lotteryType, DOM.myGamesInput().value);
    setLastLottery(lotteryType);

    if (groups.length === 0) {
        resultsEl.innerHTML = '<p class="my-games__message">Adicione pelo menos um jogo para conferir.</p>';
        return;
    }

    const contestNumber = parseInt(DOM.myGamesContest().value, 10);

    button.disabled = true;
    resultsEl.innerHTML = '<p class="my-games__message">Buscando resultado...</p>';

    try {
        const contest = contestNumber > 0
            ? await getContest(lotteryType, contestNumber)
            : await fetchContest(config.api, 'latest');
        rememberContest(lotteryType, contest);
        renderCheckResults(groups, contest, config);

        if (!(contestNumber > 0)) {
            loadContestOptions(lotteryType, Number(contest.concurso));
        }
    } catch (error) {
        resultsEl.innerHTML = `<p class="my-games__message my-games__message--error">❌ ${error.message}</p>`;
    } finally {
        button.disabled = false;
    }
}

/**
 * Preenche as sugestões do campo "Concurso" com os últimos concursos
 * @param {string} lotteryType - Tipo da loteria
 * @param {number} [latestNumber] - Número do último concurso, se já conhecido
 */
async function loadContestOptions(lotteryType, latestNumber) {
    const config = getLotteryConfig(lotteryType);

    try {
        if (!latestNumber) {
            const latest = await fetchContest(config.api, 'latest');
            rememberContest(lotteryType, latest);
            latestNumber = Number(latest.concurso);
        }

        const numbers = Array.from({ length: CONTEST_OPTIONS_COUNT }, (_, i) => latestNumber - i).filter(n => n > 0);
        const contests = await Promise.all(numbers.map(n => getContest(lotteryType, n).catch(() => null)));

        // A loteria pode ter mudado enquanto buscava
        if (DOM.myGamesLottery().value !== lotteryType) return;

        DOM.myGamesContestOptions().innerHTML = numbers.map((number, index) => {
            const date = contests[index] ? ` · ${formatDate(contests[index].data)}` : '';
            const latestTag = index === 0 ? ' (último)' : '';
            return `<option value="${number}" label="Concurso ${number}${date}${latestTag}"></option>`;
        }).join('');
    } catch (error) {
        console.warn('Não foi possível carregar os últimos concursos:', error.message);
    }
}

/**
 * Busca um concurso, usando o que já foi buscado ou o histórico em cache
 * @param {string} lotteryType - Tipo da loteria
 * @param {number} number - Número do concurso
 * @returns {Promise<Object>} Concurso
 */
async function getContest(lotteryType, number) {
    const cached = contestsCache[lotteryType]?.get(number);
    if (cached) return cached;

    // O histórico em cache só tem prêmios dos concursos mais recentes
    const config = getLotteryConfig(lotteryType);
    const fromHistory = (readHistory(config.api) || []).find(c => Number(c.concurso) === number);
    if (fromHistory?.premiacoes) {
        rememberContest(lotteryType, fromHistory);
        return fromHistory;
    }

    const contest = await fetchContest(config.api, number);
    rememberContest(lotteryType, contest);
    return contest;
}

function rememberContest(lotteryType, contest) {
    contestsCache[lotteryType] ??= new Map();
    contestsCache[lotteryType].set(Number(contest.concurso), contest);
}

/**
 * Renderiza o concurso sorteado e o resultado de cada grupo de jogos
 */
function renderCheckResults(groups, contest, config) {
    const drawn = contest.dezenas.map(d => parseInt(d, 10)).sort((a, b) => a - b);
    const checkedGroups = groups.map(group => ({
        ...group,
        games: group.games.map(game => ({
            ...game,
            result: game.error ? null : checkGame(game.numbers, contest, config)
        }))
    }));

    const validResults = checkedGroups.flatMap(g => g.games).filter(g => g.result).map(g => g.result);
    const bestHits = validResults.length ? Math.max(...validResults.map(r => r.hits)) : 0;
    const totalPrize = validResults.reduce((sum, r) => sum + r.totalPrize, 0);
    const winners = validResults.filter(r => r.prizes.length > 0).length;

    DOM.myGamesResults().innerHTML = `
        <div class="my-games__contest">
            <div class="contest-card__header">
                <span class="contest-card__number">🎱 Concurso ${contest.concurso}</span>
                <span class="contest-card__date">📅 ${formatDate(contest.data)}</span>
            </div>
            <div class="contest-card__numbers">
                ${drawn.map(n => `<span class="contest-card__ball contest-card__ball--${config.cssClass}">${padNumber(n)}</span>`).join('')}
            </div>
        </div>

        <div class="my-games__summary">
            <span>Melhor jogo: <strong>${bestHits} acertos</strong></span>
            <span>Jogos premiados: <strong>${winners} de ${validResults.length}</strong></span>
            ${totalPrize > 0 ? `<span>Prêmio total: <strong class="my-games__prize">${formatCurrency(totalPrize)}</strong></span>` : ''}
        </div>

        ${checkedGroups.map(group => renderGroup(group, config, checkedGroups.length > 1)).join('')}
    `;
}

function renderGroup(group, config, showTitle) {
    const results = group.games.filter(g => g.result).map(g => g.result);
    const groupPrize = results.reduce((sum, r) => sum + r.totalPrize, 0);

    return `
        <div class="my-games__group">
            ${showTitle ? `
                <h3 class="my-games__group-title">
                    <span>${group.name}</span>
                    ${groupPrize > 0 ? `<span class="my-games__prize">${formatCurrency(groupPrize)}</span>` : ''}
                </h3>
            ` : ''}
            <div class="my-games__list">
                ${group.games.map(game => renderGame(game, config)).join('')}
            </div>
        </div>
    `;
}

function renderGame(game, config) {
    if (game.error) {
        return `
            <div class="my-game my-game--invalid">
                <div class="my-game__header">
                    <span class="my-game__title">Jogo ${game.line}</span>
                    <span class="my-game__error">⚠️ ${game.error}</span>
                </div>
            </div>
        `;
    }

    const { hits, hitNumbers, prizes } = game.result;
    const hitSet = new Set(hitNumbers);
    const isWinner = prizes.length > 0;

    return `
        <div class="my-game ${isWinner ? 'my-game--winner' : ''}">
            <div class="my-game__header">
                <span class="my-game__title">Jogo ${game.line}${game.numbers.length > config.drawSize && config.betMin !== config.betMax ? ` · ${game.numbers.length} dezenas` : ''}</span>
                <span class="my-game__hits">${hits} acerto${hits === 1 ? '' : 's'}</span>
            </div>
            <div class="contest-card__numbers">
                ${game.numbers.map(n => `
                    <span class="contest-card__ball my-game__ball ${hitSet.has(n) ? `contest-card__ball--${config.cssClass}` : 'my-game__ball--miss'}">${padNumber(n)}</span>
                `).join('')}
            </div>
            ${isWinner ? `<div class="my-game__prizes">${prizes.map(renderPrize).join('')}</div>` : ''}
        </div>
    `;
}

function renderPrize(prize) {
    const value = prize.value > 0 ? formatCurrency(prize.value * prize.count) : 'prêmio acumulado';
    const count = prize.count > 1 ? `${prize.count}× ` : '';
    return `<span class="stat-item stat-item--highlighted">🏆 ${count}${prize.hits} acertos · ${value}</span>`;
}
