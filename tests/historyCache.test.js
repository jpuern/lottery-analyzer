import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactHistory, mergeHistory, lastContestNumber, FULL_RECENT_CONTESTS } from '../src/js/services/historyCache.js';

const makeContest = (concurso) => ({
    concurso,
    data: '01/01/2026',
    dezenas: ['01', '02'],
    premiacoes: [{ descricao: '15 acertos', valorPremio: 1 }]
});

test('compactHistory ordena e mantém completos só os concursos recentes', () => {
    const history = Array.from({ length: 30 }, (_, i) => makeContest(30 - i));
    const compact = compactHistory(history);

    assert.equal(compact[0].concurso, 1);
    assert.equal(compact.at(-1).concurso, 30);
    assert.equal(compact.filter(c => c.premiacoes).length, FULL_RECENT_CONTESTS);
    assert.deepEqual(compact[0], { concurso: 1, data: '01/01/2026', dezenas: ['01', '02'] });
});

test('mergeHistory adiciona concursos novos e substitui repetidos', () => {
    const history = [makeContest(1), makeContest(2)];
    const updated = mergeHistory(history, [{ ...makeContest(2), data: 'nova' }, makeContest(3)]);

    assert.deepEqual(updated.map(c => c.concurso), [1, 2, 3]);
    assert.equal(updated[1].data, 'nova');
    assert.equal(lastContestNumber(updated), 3);
});
