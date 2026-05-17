# SOSC Maths Assessment System

The SOSC Maths Assessment System is a robust framework for creating, delivering, and grading mathematical tests. It supports randomization, adaptive routing, real-time proctoring, and standalone portable exports.

## 1. Dynamic Test Manifest
All assessments are defined by a JSON manifest (`DynamicTestManifest`) following the `mathgraph-test-v1` schema.

- **Engine Config:** Specifies versions for math processing and grading.
- **Randomization:** Defines global variables (integers, decimals, choices, or derived expressions) used for question templates.
- **Questions:** Array of `DynamicQuestion` objects containing prompts (Markdown/LaTeX), answers, grading rules, and hints.
- **Flow:** Defines the starting question and navigation mode (linear or adaptive).
- **Rubric:** Maps questions to specific skills and defines mastery thresholds.

## 2. Mathematical Logic & Grading
The system centralizes all math logic in `src/lib/mathUtils.ts`.

### Normalization
Input from MathLive (LaTeX) is normalized via `processForMathJs` to ensure compatibility with MathJS. It handles:
- LaTeX trigonometry (`\sin^2(x)`)
- Numeric fractions (`\frac{1}{2}`)
- Constants (`\pi`, `\infty`)
- Log bases (`\log_{10}`)

### Grading Modes
- **Numeric Exact:** Strict numerical comparison.
- **Numeric Tolerance:** Comparison with absolute or relative error bounds.
- **Symbolic Exact:** String comparison of normalized expressions.
- **Symbolic Equivalence:** Uses `math.simplify` to check if `(student) - (correct)` simplifies to zero.
- **Symbolic Sampled:** Evaluates both student and correct expressions at multiple points to verify identity if simplification fails.

## 3. Randomization Engine
Randomization is seeded to ensure reproducibility and consistency for each student.
- **Seeding:** Each attempt generates a unique seed (or uses a fixed one).
- **Resolution:** Variables are resolved in topological order (handling dependencies in derived variables).
- **Interpolation:** Prompt strings and answers use `{{variable_name}}` syntax for real-time substitution.

## 4. Test Runner & Delivery
The `StandaloneTestRunner` handles the student experience:
- **Timer:** Integrated countdown with auto-submit.
- **Adaptive Flow:** Redirects students to different questions based on their performance (Correct, Incorrect, or Assisted).
- **Hints:** Progressive levels of assistance with configurable mark penalties.
- **Tab Tracking:** Monitors if a student leaves the page or loses focus, flagging potential academic integrity issues.

## 5. Reporting & Analytics
Upon completion, the system generates a `TestSubmission` report:
- **Rubric Scoring:** Calculates performance by skill and assigns "Mastery Bands".
- **Transcript:** Detailed log of every response, time taken, and hint usage.
- **Audit Log:** Visibility events captured during the session.

## 6. Authoring Workflow
The **Test Creator** provides a professional studio environment:
- **3-Pane Layout:** Question List (Left), Editor (Center), Live Sample Preview (Right).
- **Resolved Preview:** Shows exactly what the student will see after variable substitution.
- **Health Guard:** Real-time validation for broken logic, circular variables, or missing grading configs.
- **Standalone Export:** Bundles the entire engine and manifest into a single `.html` file via `npx vite build && tsx scripts/buildStandaloneTest.ts`.

## 7. Teacher Start Sync (Optional)
Supports synchronized starts via the `TeacherSessionPage`:
- Uses Server-Sent Events (SSE) to broadcast the "GO" signal.
- Students wait in a lobby until the teacher releases the test.

---

## Technical Constraints & Debt
- **Symbolic Exhaustion:** `math.simplify` is not exhaustive; complex identities rely on the Sampling fallback.
- **Bundle Size:** Standalone HTML exports are ~2MB as they include the full React + MathLive + MathJS stack.
- **Sync Volatility:** Teacher sessions are in-memory; restarting the server clears active join codes.
