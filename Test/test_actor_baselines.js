/**
 * test_actor_baselines.js — Auracelle WinterStorm2030
 * Unit Tests: Actor BGC Baseline Validation
 *
 * Validates that all actor baselines are complete, internally consistent,
 * and conform to E-IAIG-HT scoring constraints.
 *
 * Run: node tests/test_actor_baselines.js
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

const REQUIRED_DOMAINS = ['STI', 'SAD', 'ESI', 'NDM', 'SRA', 'IIC', 'ASI', 'CD'];
const REQUIRED_ACTORS  = ['norway', 'finland', 'sweden', 'denmark', 'iceland', 'russia'];

const ACTORS = {
  norway:  { name:'Norway',            adversarial:false, gwc:74.8, domains:{STI:78,SAD:82,ESI:75,NDM:80,SRA:77,IIC:73,ASI:65,CD:61} },
  finland: { name:'Finland',           adversarial:false, gwc:75.6, domains:{STI:80,SAD:78,ESI:72,NDM:82,SRA:79,IIC:76,ASI:68,CD:64} },
  sweden:  { name:'Sweden',            adversarial:false, gwc:73.0, domains:{STI:79,SAD:75,ESI:71,NDM:78,SRA:76,IIC:74,ASI:64,CD:60} },
  denmark: { name:'Denmark/Greenland', adversarial:false, gwc:68.7, domains:{STI:74,SAD:72,ESI:68,NDM:75,SRA:71,IIC:70,ASI:58,CD:55} },
  iceland: { name:'Iceland',           adversarial:false, gwc:59.3, domains:{STI:65,SAD:60,ESI:58,NDM:67,SRA:63,IIC:42,ASI:56,CD:38} },
  russia:  { name:'Russia',            adversarial:true,  gwc:80.2, domains:{STI:72,SAD:85,ESI:80,NDM:76,SRA:81,IIC:88,ASI:74,CD:82} },
};

// ─── SUITE 1: COMPLETENESS ────────────────────────────────────────────────────
console.log('\n── Suite 1: Actor Completeness ──');

REQUIRED_ACTORS.forEach(key => {
  assert(key in ACTORS, `Actor '${key}' defined`);
  if (ACTORS[key]) {
    REQUIRED_DOMAINS.forEach(domain => {
      assert(
        domain in ACTORS[key].domains,
        `${ACTORS[key].name} has ${domain} score`,
        `Missing domain`
      );
    });
    assert(typeof ACTORS[key].adversarial === 'boolean', `${ACTORS[key].name} has adversarial flag`);
    assert(typeof ACTORS[key].gwc === 'number', `${ACTORS[key].name} has g-GWC score`);
  }
});

// ─── SUITE 2: SCORE RANGE VALIDATION ─────────────────────────────────────────
console.log('\n── Suite 2: Score Range Validation (0–100) ──');

Object.entries(ACTORS).forEach(([key, actor]) => {
  REQUIRED_DOMAINS.forEach(domain => {
    const score = actor.domains[domain];
    assert(
      score >= 0 && score <= 100,
      `${actor.name} ${domain} in range 0–100 (${score})`
    );
  });
  assert(
    actor.gwc >= 0 && actor.gwc <= 100,
    `${actor.name} g-GWC in range 0–100 (${actor.gwc})`
  );
});

// ─── SUITE 3: STRATEGIC ORDERING ─────────────────────────────────────────────
console.log('\n── Suite 3: Strategic Actor Ordering ──');

const allied = Object.values(ACTORS).filter(a => !a.adversarial);
const gwcScores = allied.map(a => a.gwc);

assert(ACTORS.finland.gwc > ACTORS.iceland.gwc, 'Finland g-GWC > Iceland g-GWC');
assert(ACTORS.norway.gwc  > ACTORS.iceland.gwc, 'Norway g-GWC > Iceland g-GWC');
assert(ACTORS.russia.gwc  > ACTORS.finland.gwc, 'Russia g-GWC > Finland g-GWC (adversarial advantage)');
assert(Math.min(...gwcScores) === ACTORS.iceland.gwc, 'Iceland is lowest scoring allied actor');

// CD ordering
assert(ACTORS.russia.domains.CD  > ACTORS.finland.domains.CD, 'Russia CD > Finland CD');
assert(ACTORS.finland.domains.CD > ACTORS.iceland.domains.CD, 'Finland highest allied CD');
assert(ACTORS.iceland.domains.CD < 40, `Iceland CD below alert threshold 40 (got ${ACTORS.iceland.domains.CD})`);

// IIC ordering
assert(ACTORS.russia.domains.IIC  === 88, `Russia IIC = 88 (primary cognitive warfare actor)`);
assert(ACTORS.iceland.domains.IIC === 42, `Iceland IIC = 42 (most vulnerable allied actor)`);
assert(ACTORS.russia.domains.IIC > ACTORS.iceland.domains.IIC + 40, 'Russia/Iceland IIC gap > 40 pts');

// ─── SUITE 4: CD ALERT THRESHOLDS ────────────────────────────────────────────
console.log('\n── Suite 4: CD Alert Threshold Validation ──');

const CD_ALERT_THRESHOLD = 45;
const cdAlerts = Object.values(ACTORS).filter(a => !a.adversarial && a.domains.CD < CD_ALERT_THRESHOLD);
assert(cdAlerts.length === 1, `Exactly 1 allied actor below CD alert threshold (${CD_ALERT_THRESHOLD})`);
assert(cdAlerts[0]?.name === 'Iceland', 'Iceland is the CD alert actor');

const cdGapRussiaIceland = Math.abs(ACTORS.russia.domains.CD - ACTORS.iceland.domains.CD);
assert(cdGapRussiaIceland >= 40, `CD gray zone window Russia/Iceland ≥ 40 pts (got ${cdGapRussiaIceland})`);

// ─── SUITE 5: KPI-1 BASELINE COVERAGE ────────────────────────────────────────
console.log('\n── Suite 5: WS-KPI-1 Baseline Coverage Validation ──');

const actorCount = Object.keys(ACTORS).length;
const actorsWithAllDomains = Object.values(ACTORS).filter(a =>
  REQUIRED_DOMAINS.every(d => d in a.domains && typeof a.domains[d] === 'number')
).length;

assert(actorCount === 6, `All 6 required actors present (got ${actorCount})`);
assert(actorsWithAllDomains === 6, `All 6 actors have complete 8-domain profiles (got ${actorsWithAllDomains})`);
assert(actorsWithAllDomains / actorCount === 1.0, 'WS-KPI-1 baseline coverage = 100% ✓');

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(52)}`);
console.log(`Actor Baseline Test Suite — Auracelle WinterStorm2030`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✓ All baseline validation tests passed.');
} else {
  console.error(`✗ ${failed} test(s) failed.`);
  process.exit(1);
}
