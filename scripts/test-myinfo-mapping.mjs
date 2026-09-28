import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/singpass/myinfo.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { mapMyInfoToApplicant } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const value = (value) => ({ value });
const mapped = mapMyInfoToApplicant({
  residentialstatus: { desc: 'CITIZEN' },
  hdbownership: [
    { noofowners: value(2), outstandingloanbalance: value(400), monthlyloaninstalment: value(50) },
    { noofowners: value(1), outstandingloanbalance: value(0), monthlyloaninstalment: value(0) },
  ],
  noahistory: { noas: [{ yearofassessment: value('2025'), amount: value(5000), employment: value(4000), trade: value(1000), rent: value(0), interest: value(0), taxclearance: value('N') }] },
  cpfcontributions: { history: [{ date: value('2025-12-01'), amount: value(0), employer: value('TEST EMPLOYER') }] },
  vehicles: [{ vehicleno: value('TEST1') }, { vehicleno: value('TEST2') }],
});
assert.equal(mapped.hdbOwnership.length, 2);
assert.equal(mapped.hdbOwnership[1].outstandingLoanBalance, 0);
assert.equal(mapped.hdbOwnership[1].monthlyLoanInstalment, 0);
assert.equal(mapped.noticeOfAssessments[0].employment, 4000);
assert.equal(mapped.noticeOfAssessments[0].rent, 0);
assert.equal(mapped.cpfContributions[0].amount, 0);
assert.equal(mapped.vehicleNumbers.length, 2);
const unavailable = mapMyInfoToApplicant({ hdbownership: { unavailable: true }, cpfcontributions: { history: {} }, noahistory: { noas: null } });
assert.deepEqual(unavailable.hdbOwnership, []);
assert.deepEqual(unavailable.cpfContributions, []);
assert.deepEqual(unavailable.noticeOfAssessments, []);
assert.equal(mapMyInfoToApplicant({ residentialstatus: { desc: '' } }).residentialStatus, 'FOREIGNER');
assert.equal(mapMyInfoToApplicant({}).residentialStatus, undefined);
console.log('PASS: multiple HDB records, zero balances, detailed NOA, CPF, vehicles and unavailable data.');
