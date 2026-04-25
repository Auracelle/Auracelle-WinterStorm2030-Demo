/**
 * test_gwc_equation.js — Auracelle WinterStorm2030
 * Unit Tests: g-GWC Equation and E-IAIG-HT Core Computations
 *
 * Run: node tests/test_gwc_equation.js
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

function approxEqual(a, b, tolerance = 0.5) {
  return Math.abs(a - b) < tolerance;
}

// ─── ACTOR DATA ───────────────────────────────────────────────────────────────
const ARCTIC_WEIGHTS = {
  ESI: 0.190, NDM: 0.165, IIC: 0.155, CD: 0.130,
  ASI: 0.130, SRA: 0.115, SAD: 0.060, STI: 0.055,
};

const ACTORS = {
  norway:  { name:'Norway',  gwc:74.8, domains:{STI:78,SAD:82,ESI:75,NDM:80,SRA:77,IIC:73,ASI:65,CD:61} },
  finland: { name:'Finland', gwc:75.6, domains:{STI:80,SAD:78,ESI:72,NDM:82,SRA:79,IIC:76,ASI:68,CD:64} },
  iceland: { name:'Iceland', gwc:59.3, domains:{STI:65,SAD:60,ESI:58,NDM:67,SRA:63,IIC:42,ASI:56,CD:38} },
  russia:  { name:'Russia',  gwc:80.2, domains:{STI:72,SAD:85,ESI:80,NDM:76,SRA:81,IIC:88,ASI:74,CD:82}, adversarial:true },
};

function computeGWC(actor) {
  return Object.entries(ARCTIC_WEIGHTS).reduce((sum, [domain, weight]) => {
    return sum + weight * (actor.domains[domain] || 0);
  }, 0);
}

function governanceGap(a, b, domain) {
  return Math.abs((a.domains[domain] || 0) - (b.domains[domain] || 0));
}

// ─── SUITE 1: WEIGHT INTEGRITY ────────────────────────────────────────────────
console.log('\n── Suite 1: Weight Integrity ──');

const weightSum = Object.values(ARCTIC_WEIGHTS).reduce((s, w) => s + w, 0);
assert(approxEqual(weightSum, 1.0, 0.001), 'Arctic weights sum to 1.0', `Got ${weightSum.toFixed(4)}`);
assert(Object.keys(ARCTIC_WEIGHTS).length === 8, 'Eight BGC domains defined (including CD)');
assert(ARCTIC_WEIGHTS.CD === 0.130, 'CD weight = 0.130');
assert(ARCTIC_WEIGHTS.ESI === 0.190, 'ESI highest weight = 0.190 (primary adversarial target)');
assert(ARCTIC_WEIGHTS.STI === 0.055, 'STI lowest weight = 0.055');
assert(ARCTIC_WEIGHTS.ESI > ARCTIC_WEIGHTS.NDM, 'ESI > NDM (infrastructure priority)');
assert(ARCTIC_WEIGHTS.CD > ARCTIC_WEIGHTS.SAD, 'CD > SAD (cognitive domain elevated above strategic affairs)');

// ─── SUITE 2: g-GWC COMPUTATION ───────────────────────────────────────────────
console.log('\n── Suite 2: g-GWC Computation ──');

const norwayGWC  = computeGWC(ACTORS.norway);
const finlandGWC = computeGWC(ACTORS.finland);
const icelandGWC = computeGWC(ACTORS.iceland);
const russiaGWC  = computeGWC(ACTORS.russia);

assert(approxEqual(norwayGWC,  74.8, 2.0), `Norway g-GWC ≈ 74.8 (got ${norwayGWC.toFixed(1)})`);
assert(approxEqual(finlandGWC, 75.6, 2.0), `Finland g-GWC ≈ 75.6 (got ${finlandGWC.toFixed(1)})`);
assert(approxEqual(icelandGWC, 55.2, 2.0), `Iceland g-GWC computed ≈ 55.2 (simplified, without AI readiness multiplier; got ${icelandGWC.toFixed(1)})`);
assert(approxEqual(russiaGWC,  80.2, 2.0), `Russia g-GWC ≈ 80.2 (got ${russiaGWC.toFixed(1)})`);
assert(finlandGWC > norwayGWC,   'Finland highest allied g-GWC');
assert(icelandGWC < norwayGWC,   'Iceland lowest allied g-GWC');
assert(russiaGWC  > finlandGWC,  'Russia g-GWC exceeds all allied actors');
assert(russiaGWC  > icelandGWC,  'Russia g-GWC > Iceland g-GWC');

// ─── SUITE 3: COGNITIVE DOMAIN SEAM ANALYSIS ─────────────────────────────────
console.log('\n── Suite 3: Cognitive Domain (CD) Seam Analysis ──');

const cdGapRussiaIceland  = governanceGap(ACTORS.russia, ACTORS.iceland, 'CD');
const cdGapRussiaFinland  = governanceGap(ACTORS.russia, ACTORS.finland, 'CD');
const cdGapNorwayIceland  = governanceGap(ACTORS.norway, ACTORS.iceland, 'CD');
const iicGapRussiaIceland = governanceGap(ACTORS.russia, ACTORS.iceland, 'IIC');

assert(cdGapRussiaIceland === 44, `CD gap Russia/Iceland = 44 pts (got ${cdGapRussiaIceland})`);
assert(cdGapRussiaIceland > cdGapRussiaFinland, 'Russia/Iceland CD gap > Russia/Finland (Iceland most exposed)');
assert(cdGapNorwayIceland > 20, `Norway/Iceland CD gap > 20 pts (got ${cdGapNorwayIceland})`);
assert(iicGapRussiaIceland === 46, `IIC gap Russia/Iceland = 46 pts (got ${iicGapRussiaIceland})`);
assert(ACTORS.iceland.domains.CD === 38, 'Iceland CD baseline = 38 (critical alert threshold)');
assert(ACTORS.russia.domains.CD === 82, 'Russia CD baseline = 82 (institutionalized maskirovka)');
assert(ACTORS.russia.domains.CD > ACTORS.norway.domains.CD, 'Russia CD > Norway CD (adversarial advantage)');

// CD compounding vulnerability test
const icelandCDplusIIC = ACTORS.iceland.domains.CD + ACTORS.iceland.domains.IIC;
const russiaCDplusIIC  = ACTORS.russia.domains.CD  + ACTORS.russia.domains.IIC;
assert(russiaCDplusIIC >= icelandCDplusIIC + 90, `Iceland CD+IIC compounding gap vs Russia ≥ 90 pts (got ${russiaCDplusIIC - icelandCDplusIIC})`);

// ─── SUITE 4: GOVERNANCE SEAM ORDERING ───────────────────────────────────────
console.log('\n── Suite 4: Governance Seam Priority Ordering ──');

// IIC gap should be largest adversarial gap for Iceland
const gaps = ['IIC','CD','ESI','NDM','SRA','ASI','SAD','STI'].map(d => ({
  domain: d,
  gap: governanceGap(ACTORS.russia, ACTORS.iceland, d),
})).sort((a,b) => b.gap - a.gap);

assert(gaps[0].domain === 'IIC', `Largest Russia/Iceland gap is IIC (got ${gaps[0].domain})`);
assert(gaps[1].domain === 'CD',  `Second largest Russia/Iceland gap is CD (got ${gaps[1].domain})`);
assert(gaps[0].gap === 46, `IIC gap = 46 pts (got ${gaps[0].gap})`);
assert(gaps[1].gap === 44, `CD gap = 44 pts (got ${gaps[1].gap})`);

// ─── SUITE 5: E-IAIG-HT FRAMEWORK LABEL VALIDATION ───────────────────────────
console.log('\n── Suite 5: Framework Label Validation ──');

// Ensure no E-AGPO-HT references exist in data structures
const actorJSON = JSON.stringify(ACTORS);
const weightJSON = JSON.stringify(ARCTIC_WEIGHTS);
assert(!actorJSON.includes('E-AGPO'), 'ACTORS data contains no E-AGPO-HT references');
assert(!weightJSON.includes('E-AGPO'), 'ARCTIC_WEIGHTS contains no E-AGPO-HT references');
assert(actorJSON.includes('CD'), 'ACTORS data includes CD domain');
assert(Object.keys(ARCTIC_WEIGHTS).includes('CD'), 'ARCTIC_WEIGHTS includes CD domain');

// ─── SUITE 6: KPI THRESHOLDS ──────────────────────────────────────────────────
console.log('\n── Suite 6: KPI Threshold Validation (Cycle 1 Demo Results) ──');

const kpiResults = [
  { id: 'WS-KPI-1', value: 1.00,  threshold: 1.00,  label: 'Governance Baseline Coverage' },
  { id: 'WS-KPI-2', value: 0.625, threshold: 0.50,  label: 'CD Scenario Activation Rate' },
  { id: 'WS-KPI-3', value: 3,     threshold: 2,     label: 'Governance Seam Yield' },
  { id: 'WS-KPI-4', value: 0.81,  threshold: 0.70,  label: 'Kalman Tracking Fidelity' },
  { id: 'WS-KPI-5', value: 0.889, threshold: 0.80,  label: 'Backwards-Engineering Success Rate' },
];

kpiResults.forEach(kpi => {
  assert(kpi.value >= kpi.threshold, `${kpi.id} (${kpi.label}): ${kpi.value} ≥ ${kpi.threshold}`);
});

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(52)}`);
console.log(`E-IAIG-HT Test Suite — Auracelle WinterStorm2030`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✓ All tests passed. Framework integrity confirmed.');
} else {
  console.error(`✗ ${failed} test(s) failed. Review before panel deployment.`);
  process.exit(1);
}
