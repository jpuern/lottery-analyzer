import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterResults } from '../src/js/services/apiService.js';

const results = [3, 1, 5, 2, 4].map(concurso => ({ concurso: String(concurso), dezenas: [] }));

test('filterResults pega os últimos N concursos em ordem', () => {
    const filtered = filterResults(results, 'ultimos', { lastN: 2 });
    assert.deepEqual(filtered.map(r => r.concurso), ['4', '5']);
});

test('filterResults filtra por intervalo', () => {
    const filtered = filterResults(results, 'intervalo', { start: 2, end: 4 });
    assert.deepEqual(filtered.map(r => r.concurso), ['2', '3', '4']);
});
