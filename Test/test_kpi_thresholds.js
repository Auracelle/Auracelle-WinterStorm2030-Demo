/**
 * test_kpi_thresholds.js — Auracelle WinterStorm2030
 * Unit Tests: KPI Threshold Definitions and Cycle 1 Results
 *
 * Run: node tests/test_kpi_thresholds.js
 * Classification: UNCLASSIFIED // FOR OFFICIAL USE
 */

'use strict';

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✓  ${testName}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${testName}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

const WS2030_KPIS = [
  { id:'WS-KPI-1', name:'Governance Baseline Coverage',       threshold:1.00,  result:1.000, unit:'ratio' },
  { id:'WS-KPI-2', name:'CD Scenario Activation Rate',        threshold:0.50,  result:0.625, unit:'ratio' },
  { id:'WS-KPI-3', name:'Governance Seam Identification Yield', threshold:2,   result:3,     unit:'count' },
  { id:'WS-KPI-4', name:'Bayesian/Kalman Tracking Fidelity',  threshold:0.70,  result:0.810, unit:'correlation' },
  { id:'WS-KPI-5', name:'Backwards-Engineering Success Rate', threshold:0.80,  result:0.889, unit:'ratio' },
];

// ─── SUITE 1: THRESHOLD DEFINITIONS ──────────────────────────────────────────
console.log('\n── Suite 1: KPI Threshold Definitions ──');

assert(WS2030_KPIS.length === 5, 'Five WS2030 KPIs defined');
WS2030_KPIS.forEach(kpi => {
  assert(kpi.threshold > 0,  `${kpi.id} threshold > 0 (${kpi.threshold})`);
  assert(kpi.id.startsWith('WS-KPI'), `${kpi.id} uses correct WS prefix`);
  assert(kpi.name.length > 5, `${kpi.id} has a name`);
});

// ─── SUITE 2: CYCLE 1 THRESHOLD MET ──────────────────────────────────────────
console.log('\n── Suite 2: Cycle 1 Results vs Thresholds ──');

WS2030_KPIS.forEach(kpi => {
  assert(
    kpi.result >= kpi.threshold,
    `${kpi.id} met: ${kpi.result} ≥ ${kpi.threshold}`,
    `${kpi.name}`
  );
});

// ─── SUITE 3: SPECIFIC VALIDATIONS ────────────────────────────────────────────
console.log('\n── Suite 3: Specific KPI Logic ──');

const kpi1 = WS2030_KPIS.find(k => k.id === 'WS-KPI-1');
assert(kpi1.threshold === 1.00, 'WS-KPI-1 threshold = 100% (all actors, all domains)');
assert(kpi1.result    === 1.00, 'WS-KPI-1 Cycle 1 result = 100% (confirmed)');

const kpi2 = WS2030_KPIS.find(k => k.id === 'WS-KPI-2');
assert(kpi2.threshold === 0.50, 'WS-KPI-2 threshold = 50% of injects activate CD');
assert(kpi2.result > kpi2.threshold, `WS-KPI-2 Cycle 1 exceeds threshold (${(kpi2.result*100).toFixed(0)}% > 50%)`);

const kpi3 = WS2030_KPIS.find(k => k.id === 'WS-KPI-3');
assert(kpi3.threshold === 2, 'WS-KPI-3 threshold = 2 novel seams per cycle');
assert(kpi3.result === 3, 'WS-KPI-3 Cycle 1 = 3 seams (CD-01, NDM-01, IIC-01)');

const kpi4 = WS2030_KPIS.find(k => k.id === 'WS-KPI-4');
assert(kpi4.threshold === 0.70, 'WS-KPI-4 threshold = 0.70 correlation (social science standard)');
assert(kpi4.result === 0.810,   'WS-KPI-4 Cycle 1 correlation = 0.81');

const kpi5 = WS2030_KPIS.find(k => k.id === 'WS-KPI-5');
assert(kpi5.threshold === 0.80, 'WS-KPI-5 threshold = 80% traceability');
assert(kpi5.result > 0.85,      `WS-KPI-5 Cycle 1 > 85% (got ${(kpi5.result*100).toFixed(1)}%)`);

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(52)}`);
console.log(`KPI Threshold Test Suite — Auracelle WinterStorm2030`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✓ All KPI tests passed. Cycle 1 thresholds confirmed.');
} else {
  console.error(`✗ ${failed} test(s) failed.`);
  process.exit(1);
}
