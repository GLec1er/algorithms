import test from 'node:test';
import assert from 'node:assert/strict';
import {exportBackup,parseBackup} from '../src/backup.ts';
const ids=['a','b','c'],today='2026-10-19';
const progress={version:2,startedOn:'2026-10-16',completed:['b'],firstCompletions:{a:null,b:'2026-10-19',c:'2026-10-16'}};
test('backup round-trip preserves unmarked history, dates and undated completions',()=>{
 assert.deepEqual(parseBackup(exportBackup(progress),ids,today),progress);
});
test('invalid, future and conflicting records are rejected without mutating current progress',()=>{
 const initial=JSON.stringify(progress);
 const invalid=[null,{}, {...progress,version:3},{...progress,startedOn:'2026-02-30'}, {...progress,startedOn:'2026-10-20'}, {...progress,completed:['unknown']}, {...progress,completed:['b','b']}, {...progress,completed:['a'],firstCompletions:{}}, {...progress,firstCompletions:{b:'2026-10-20'}}, {...progress,firstCompletions:{b:'2026-02-30'}}, {...progress,firstCompletions:{b:'2026-10-15'}}, {...progress,firstCompletions:{unknown:null}}, {...progress,firstCompletions:{b:42}}];
 for(const value of invalid)assert.throws(()=>parseBackup(JSON.stringify({format:'algorithms-lab-progress',version:1,progress:value}),ids,today));
 assert.throws(()=>parseBackup('{broken',ids,today));
 assert.equal(JSON.stringify(progress),initial);
});
test('unrelated formats and oversized imports are rejected',()=>{
 assert.throws(()=>parseBackup(JSON.stringify({format:'another-app',version:1,progress}),ids,today));
 assert.throws(()=>parseBackup(' '.repeat(1000001),ids,today));
});
