import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGames, checkGame } from '../src/js/analysis/gameChecker.js';
import { LOTTERY_CONFIG } from '../src/js/config/lotteryConfig.js';
import { FIXED_GAMES } from '../src/js/config/myGamesConfig.js';

const lotofacil = LOTTERY_CONFIG.lotofacil;

// Concurso 3806 da Lotofácil
const contest = {
    dezenas: ['04', '05', '06', '07', '08', '09', '11', '13', '16', '19', '20', '21', '23', '24', '25'],
    premiacoes: [
        { descricao: '15 acertos', valorPremio: 806564.34 },
        { descricao: '14 acertos', valorPremio: 2642.48 },
        { descricao: '13 acertos', valorPremio: 35 },
        { descricao: '12 acertos', valorPremio: 14 },
        { descricao: '11 acertos', valorPremio: 7 }
    ]
};

test('parseGames aceita qualquer separador e o rótulo "Jogo N:"', () => {
    const games = parseGames(
        'Jogo 1: 01 – 03 – 06 – 07 – 08 – 10 – 11 – 12 – 15 – 16 – 19 – 20 – 23 – 24 – 25\n' +
        '\n' +
        '25,24,23,21,20,19,13,11,9,8,7,6,5,4,1',
        lotofacil
    );

    assert.equal(games.length, 2);
    assert.deepEqual(games[0].numbers, [1, 3, 6, 7, 8, 10, 11, 12, 15, 16, 19, 20, 23, 24, 25]);
    assert.equal(games[0].error, null);
    assert.equal(games[1].line, 2);
    assert.deepEqual(games[1].numbers, [1, 4, 5, 6, 7, 8, 9, 11, 13, 19, 20, 21, 23, 24, 25]);
});

test('parseGames aponta jogos inválidos', () => {
    const [short, outOfRange, repeated] = parseGames('1 2 3\n' +
        '01 02 03 04 05 06 07 08 09 10 11 12 13 14 26\n' +
        '01 01 03 04 05 06 07 08 09 10 11 12 13 14 15', lotofacil);

    assert.match(short.error, /3 dezenas/);
    assert.match(outOfRange.error, /fora de 1-25: 26/);
    assert.match(repeated.error, /repetidas/);
});

test('checkGame conta acertos e prêmio de aposta simples', () => {
    const [game] = parseGames('04 05 06 07 08 09 11 13 16 19 20 21 23 24 01', lotofacil);
    const result = checkGame(game.numbers, contest, lotofacil);

    assert.equal(result.hits, 14);
    assert.deepEqual(result.prizes, [{ hits: 14, count: 1, value: 2642.48 }]);
    assert.equal(result.totalPrize, 2642.48);
});

test('checkGame desdobra apostas com mais de 15 dezenas', () => {
    // 16 dezenas com 13 acertos = 16 apostas simples: 3 com 13 acertos e 13 com 12
    const [game] = parseGames('01 02 03 04 05 06 07 08 09 11 13 16 19 20 21 23', lotofacil);
    const result = checkGame(game.numbers, contest, lotofacil);

    assert.equal(result.hits, 13);
    assert.deepEqual(result.prizes, [
        { hits: 13, count: 3, value: 35 },
        { hits: 12, count: 13, value: 14 }
    ]);
    assert.equal(result.totalPrize, 3 * 35 + 13 * 14);
});

test('checkGame sem premiação abaixo de 11 acertos', () => {
    const [game] = parseGames('01 02 03 05 08 09 10 11 13 14 16 18 20 23 25', lotofacil);
    const result = checkGame(game.numbers, contest, lotofacil);

    assert.equal(result.hits, 9);
    assert.deepEqual(result.prizes, []);
});

test('Timemania exige exatamente 10 dezenas', () => {
    const [game] = parseGames('1 2 3 4 5 6 7', LOTTERY_CONFIG.timemania);
    assert.match(game.error, /aceita 10/);
});

test('jogos fixos são todos válidos', () => {
    Object.entries(FIXED_GAMES).forEach(([lotteryType, blocks]) => {
        blocks.forEach(block => {
            const games = parseGames(block.games, LOTTERY_CONFIG[lotteryType]);
            assert.ok(games.length > 0, `${block.name} está vazio`);
            games.forEach(game => assert.equal(game.error, null, `${block.name}, jogo ${game.line}: ${game.error}`));
        });
    });
});
