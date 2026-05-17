import { calculateResult, createMathFunction } from '../mathUtils';

/**
 * Simple test harness for mathUtils.
 */

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

const tests: TestCase[] = [];

function describe(name: string, fn: () => void) {
  console.log(`\n--- ${name} ---`);
  fn();
}

function it(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertNear(actual: any, expected: number, tolerance = 1e-10, message: string) {
  const n = Number(actual);
  if (isNaN(n) || Math.abs(n - expected) > tolerance) {
    throw new Error(`Assertion Failed: ${message}\n  Actual:   ${actual}\n  Expected: ${expected} (tol: ${tolerance})`);
  }
}

// 1. RADIANS (DEFAULT)
describe("Radians Mode (Default)", () => {
  it("should calculate basic trig in radians", () => {
    assertNear(calculateResult('sin(pi / 2)'), 1, 1e-10, "sin(pi/2)");
    assertNear(calculateResult('cos(0)'), 1, 1e-10, "cos(0)");
    assertNear(calculateResult('tan(pi / 4)'), 1, 1e-10, "tan(pi/4)");
  });

  it("should calculate inverse trig in radians", () => {
    assertNear(calculateResult('asin(1)'), Math.PI / 2, 1e-10, "asin(1)");
    assertNear(calculateResult('acos(0)'), Math.PI / 2, 1e-10, "acos(0)");
    assertNear(calculateResult('atan(1)'), Math.PI / 4, 1e-10, "atan(1)");
  });
  it("should handle the π symbol literal", () => {
    assertNear(calculateResult('π'), Math.PI, 1e-10, "π literal");
    assertNear(calculateResult('2 * π'), 2 * Math.PI, 1e-10, "2 * π");
    assertNear(calculateResult('sin(π / 2)'), 1, 1e-10, "sin(π / 2)");
  });
});

// 2. DEGREES MODE
describe("Degrees Mode", () => {
  it("should calculate basic trig in degrees", () => {
    assertNear(calculateResult('sin(90)', { angleMode: 'deg' }), 1, 1e-10, "sin(90)");
    assertNear(calculateResult('cos(60)', { angleMode: 'deg' }), 0.5, 1e-10, "cos(60)");
    assertNear(calculateResult('tan(45)', { angleMode: 'deg' }), 1, 1e-10, "tan(45)");
  });

  it("should calculate inverse trig in degrees", () => {
    assertNear(calculateResult('asin(1)', { angleMode: 'deg' }), 90, 1e-10, "asin(1)");
    assertNear(calculateResult('acos(0)', { angleMode: 'deg' }), 90, 1e-10, "acos(0)");
    assertNear(calculateResult('atan(1)', { angleMode: 'deg' }), 45, 1e-10, "atan(1)");
    assertNear(calculateResult('atan2(1, 1)', { angleMode: 'deg' }), 45, 1e-10, "atan2(1,1)");
  });

  it("should handle aliases in degrees mode", () => {
    assertNear(calculateResult('arcsin(1)', { angleMode: 'deg' }), 90, 1e-10, "arcsin(1)");
    assertNear(calculateResult('arccos(0)', { angleMode: 'deg' }), 90, 1e-10, "arccos(0)");
    assertNear(calculateResult('arctan(1)', { angleMode: 'deg' }), 45, 1e-10, "arctan(1)");
  });
});

// 3. GRAPH FUNCTION COMPILATION
describe("Graph Function Compilation", () => {
  it("should compile and evaluate functions in degrees", () => {
    const fn = createMathFunction('sin(x)', 'x', { angleMode: 'deg' })!;
    assertNear(fn(90), 1, 1e-10, "fn(90) in deg");
    assertNear(fn(180), 0, 1e-10, "fn(180) in deg");
  });

  it("should compile and evaluate functions in radians", () => {
    const fn = createMathFunction('sin(x)', 'x', { angleMode: 'rad' })!;
    assertNear(fn(Math.PI / 2), 1, 1e-10, "fn(pi/2) in rad");
  });

  it("should compile and evaluate inverse functions in degrees", () => {
    const fn = createMathFunction('asin(x)', 'x', { angleMode: 'deg' })!;
    assertNear(fn(1), 90, 1e-10, "fn(1) in deg");
  });
});

// 4. TRIG POWERS
describe("Trig Powers", () => {
  it("should handle trig powers in degrees", () => {
    assertNear(calculateResult('sin^2(90)', { angleMode: 'deg' }), 1, 1e-10, "sin^2(90)");
    assertNear(calculateResult('\\sin^2(90)', { angleMode: 'deg' }), 1, 1e-10, "\\sin^2(90)");
    assertNear(calculateResult('cos^2(60)', { angleMode: 'deg' }), 0.25, 1e-10, "cos^2(60)");
  });
});

// 5. UNIT AWARENESS
describe("Unit Awareness", () => {
  it("should respect explicit units regardless of mode", () => {
    // MathJS supports units like 'deg' or 'rad'
    assertNear(calculateResult('sin(90 deg)', { angleMode: 'rad' }), 1, 1e-10, "sin(90 deg) in rad mode");
    assertNear(calculateResult('sin(90 deg)', { angleMode: 'deg' }), 1, 1e-10, "sin(90 deg) in deg mode");
    assertNear(calculateResult('sin(1.57079632679 rad)', { angleMode: 'deg' }), 1, 1e-8, "sin(pi/2 rad) in deg mode");
  });
});

// RUNNER
async function runAll() {
  console.log("=== MathGraph Pro MathUtils Test Suite ===\n");
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ PASS: ${test.name}`);
      passed++;
    } catch (e: any) {
      console.log(`❌ FAIL: ${test.name}`);
      console.log(`   ${e.message}`);
      failed++;
    }
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runAll();
