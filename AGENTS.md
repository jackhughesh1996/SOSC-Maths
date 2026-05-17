# Project Memory Bank: SOSC Maths (formerly MathGraph Pro)

## Consistency Checklist (Read before every task)
1. **Structural Change?** Update the `Component Architecture` section.
2. **Logic Refinement?** Check the `Mathematical Truths` section for impact.
3. **Task Completion?** Append a summary to the `Refactoring History`.
4. **Hack/Bypass?** Log it immediately in `Known Debt`.

## Core Identity
SOSC Maths is a high-fidelity, interactive mathematical tool designed for both symbolic calculation and robust data visualization. It prioritizes mathematical accuracy, intuitive input (LaTeX-based), fluid graphing performance, and AI-optimized modularity.

## Tech Stack
- **Framework:** React 18+ with Vite
- **Mathematical Evaluation:** [MathJS](https://mathjs.org/) (centralized behind the headless `src/core/math/` API; `src/lib/mathUtils.ts` remains a compatibility facade)
- **Mathematical Input:** [MathLive](https://cortexjs.io/mathlive/) (LaTeX-based editing with custom shortcuts)
- **Data Visualization:** [Mafs](https://mafs.dev/) (React-native SVG graphing library)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Mathematical Truths
- **Centralization:** All mathematical processing and evaluation MUST pass through the headless `src/core/math/` API. `src/lib/mathUtils.ts` is now a compatibility facade only. Do not import MathJS directly outside `src/core/math/evaluate/mathJsAdapter.ts`.
- **Processing Logic:** 
    - `normalizeForMathJs` / `processForMathJs`: Runs an explicit ordered transformation pipeline in `src/core/math/normalize/normalizationSteps.ts` for MathLive/LaTeX artifacts (e.g., `\ln` -> `log`, `\cdot` -> `*`).
    - `evaluateSafely`: Uses MathJS type-checking through `mathJsAdapter.ts` to force real-number evaluation for graphing, returning `NaN` as a fallback.
    - `parseGraphExpression`: Lives in `src/core/math/graph/` and converts expression rows into headless graph semantics (`function-x`, `function-y`, `point`, `constant`, `invalid`) without React or Mafs.
- **Assessment Grading:** Higher-level equivalence logic (simplification, sampling) lives in `src/assessment/grading/`. It uses the `src/core/math/` facade but adds pedagogical intelligence (tolerances, marking rules).
- **MathLive Options:** Global configurations (shortcuts, keyboard policy) are managed in `src/lib/mathfieldConfig.ts`.
- **Angular Evaluation:** Explicitly supported via `AngleMode` ('rad' | 'deg'). Evaluation mode is explicit and centralized in `src/core/math/evaluate/angleModeScope.ts`. Components may store UI state for 'rad'/'deg', but all trig and inverse-trig semantics must be applied through `calculateResult`, `createMathFunction`, and `evaluateSafely`. Components must not mutate global MathJS state or call MathJS evaluation APIs directly.

## Runtime Environment Rules
- **Port Constraint:** The application MUST run on port `3000`.
- **Host Binding:** The server MUST bind to `0.0.0.0`.
- **HMR Limitations:** Hot Module Replacement is disabled by the platform. Full page refreshes are expected after turn completions.
- **Full-Stack Pattern:** If server-side logic is added, use the Express + Vite middleware pattern as defined in the system instructions.

## Component Architecture
- **Core Math (`src/core/math/`):** Headless mathematical engine. Normalization, MathJS parsing/evaluation, angle-mode scope construction, and graph-expression parsing live here. `AI_CONTEXT.md` files act as context anchors for future AI assistants.
- **GraphingCalculator:** Public component export now delegates to `src/features/graphing-calculator/`. `useGraphingCalculator` coordinates expression state, angle mode, point plotting, and MathInput registry behavior. `GraphSidebar` owns expression controls, `GraphCanvas` owns Mafs rendering and responsive measurement, and `GraphToolbar` owns reset/fullscreen controls. Graph expression parsing is pure and centralized in `src/core/math/graph/parseGraphExpression.ts`.
- **ExpressionList / ExpressionItem:** UI components for managing mathematical inputs, handling dual-string updates.
- **AngleModeToggle:** Shared stateless UI control used by Calculator and GraphingCalculator for selecting RAD/DEG without owning mathematical semantics.
- **MathInput:** Encapsulates the MathfieldElement with synchronized LaTeX and ASCII-Math normalization.
- **FunctionDrawer:** Collapsible panel for quick insertion of mathematical functions into the active input.
- **StandaloneTestRunner:** Feature-rich assessment environment with timer, tab tracking, and adaptive flow.
- **TestCreatorPage:** Comprehensive teacher-facing editor for building `DynamicTestManifest` objects with settings, rubrics, variables, and adaptive logic.
- **TeacherSessionPage:** Management UI for broadcasting start signals and monitoring student connections.
- **StudentJoinPage:** Holding screen and logic for synchronized assessment entry.
- **assessmentServer.ts:** Express-based session manager with SSE for real-time start broadcasts.
- ** standalone-entry.ts:** Entry point for portable HTML tests, mounting the StandaloneTestRunner.
- ** buildStandaloneTest.ts:** Build script using `esbuild` and `@tailwindcss/cli` to package manifests into single-file HTML assessments.
- **Assessment Schema:** `/src/assessment/schema/DynamicTestTypes.ts` provides a type system and validator for the `mathgraph-test-v1` manifest format. Runtime-facing types include `ResolvedVariables`, `StudentIdentity`, `SubmitReason`, and `MonitoringSnapshot` to reduce `any` in assessment engine paths.

## Naming Conventions
- **Hooks:** Always use the `use` prefix (e.g., `useGraphBounds.ts`) and store in `src/hooks/`.
- **Utilities:** Feature-specific logic should be in `[name]Utils.ts` (e.g., `mathUtils.ts`) inside `src/lib/`.
- **Components:** Use **PascalCase** for component filenames and directory names (e.g., `ExpressionList.tsx`).
- **Types:** Shared interfaces should live in `src/types.ts` or a `src/types/` directory for complex models.

## Refactoring History
1. **Initial Integration:** Established Mathfield (input), MathJS (logic), and Mafs (view).
2. **Core Logic:** Implemented `mathUtils.ts` to bridge LaTeX input with JavaScript evaluation.
3. **Workspace Cleanup:** Deleted legacy scratchpad files (`test6.js` through `test9.js`) and resolved type-safety issues with Mathfield's private API access.
4. **Decomposition:** Split `GraphingCalculator.tsx` into smaller functional units (`ExpressionList`, `ExpressionItem`).
5. **Config Consolidation:** Extracted global MathLive overrides into `mathfieldConfig.ts` to prevent "too smart" default behaviors.
6. **Documentation-Code Linkage:** Implemented "Source of Truth" headers in core files and a "Consistency Checklist" in `AGENTS.md` to ensure the memory bank remains synchronized with code changes.
7. **Scaling Roadmap:** Documented the future transition to a multi-file `/memory-bank/` directory to handle increased complexity.
8. **Function Discovery & Reliability:** Implemented `FunctionDrawer` with plot-ready templates (`sin(x)`). Enhanced `mathUtils.ts` with robust LaTeX normalization, prioritized log base handling, and implicit function application (e.g., `sin pi` -> `sin(pi)`). Added numeric result indicators for constant expressions.
9. **Type-Safe Evaluation:** Refined `ParsedExpression` types to support a new `constant` category, resolving UI/Logic state conflicts.
10. **Normalization Robustness:** Hardened `processForMathJs` to handle mixed LaTeX/ASCII formats, ensuring log bases and technical brackets are processed in the correct architectural order. Handles implicit function application (e.g., `sin x` -> `sin(x)` and `sinx` -> `sin(x)`) more aggressively.
11. **Real-Number Enforcement:** Updated `evaluateSafely` to use native MathJS type-checking functions, ensuring complex numbers and units are treated as `NaN` to prevent graphing failures.
12. **UX Polish:** Updated `FunctionDrawer` to use fully "plot-ready" templates for all buttons (e.g., `\sin(x)`) and improved label clarity for inverse trig functions.
13. **Architectural Decoupling:** Separated mathematical display state (`latex`) from evaluation state (`evalText`) to resolve MathLive canonicalization issues. Updated `GraphingCalculator` to use functional state updates and `MathInput` to use `silenceNotifications` for stable synchronization.
14. **Assessment Schema:** Established the `DynamicTestManifest` type system and standalone validator to support randomized, adaptive tests.
15. **Grading Layer:** Implemented `assessmentGrader.ts` and `equivalence.ts` to provide robust auto-grading (symbolic and numeric) on top of the core math utility layer.
16. **Assessment Randomization:** Implemented seeded RNG and variable resolution logic in `randomization.ts` to support reproducible dynamic tests with interpolated templates.
17. **Assessment Runner Logic:** Implemented the core state machine (`TestRuntime`, `AdaptiveFlow`, `HintController`, `SubmissionBuilder`) for the test runner.
18. **Assessment Monitoring:** Implemented `TimerController` and `TabTracker` to handle test duration and audit visibility events.
19. **Assessment Runner UI:** Built the final visual `StandaloneTestRunner` with proctoring indicators, hint sequences, and structured results export.
20. **Reporting & Audit:** Implemented `SubmissionReport` and `rubricScoring.ts` to provide print-optimised assessment results and mastery-band alignment.
21. **Manifest Management:** Added `localStorage` persistence, JSON import/export, and side-loading demo capabilities to the Test Creator.
22. **Standalone HTML Export:** Implemented a build pipeline (`scripts/buildStandaloneTest.ts`) that bundles the runner, manifest, and engines into a single portable `.html` file for offline use.
23. **Teacher Start Sync:** Implemented a minimal Express + SSE backend to coordinate assessment starts. Includes holding screens for students and a management dashboard for teachers.
24. **Hardened Validation:** Implemented a comprehensive `Health Guard` validation engine that detects structural errors, circular variable dependencies, broken adaptive routes, and consistency issues. Integrated a dedicated validation panel into the Test Creator.
25. **Sample Library:** Created high-quality demo manifests for Linear Equations, Graphing, and Numeracy. Integrated a "Sample Library" into the Test Creator to demonstrate complex features like randomization, adaptive routing, and precision grading.
26. **Automated Testing:** Implemented a comprehensive test suite (`src/assessment/__tests__/assessmentEngine.test.ts`) covering normalization, grading, randomization, and rubric scoring. Added regression cases for complex LaTeX math artifacts.
27. **Teacher-Centric UX:** Re-architected the Test Creator into a three-pane professional studio layout. Implemented "Resolved Question Preview" for real-time variable substitution view, added teacher-friendly terminology for technical grading concepts, and integrated proactive guardrails for hint coverage and symbolic configuration.
28. **Centralized Angular Support:** Implemented explicit radians/degrees evaluation mode in `mathUtils.ts`. Updated scientific and graphing calculators with a shared `AngleModeToggle` while maintaining architectural centralization of mathematical logic.
29. **Graphing Calculator Fullscreen:** Added browser-native fullscreen capability to the `GraphingCalculator` using a new `useFullscreen` hook.
30. **Native-First Graph Controls:** Added a floating toolbar for Reset View and Fullscreen. Opted to preserve Mafs' native pan/zoom gestures rather than implementing a fully controlled viewport wrapper, ensuring high-quality scroll/pinch behavior on laptops and trackpads.
31. **Responsive Graph Scaling:** Implemented dynamic height measurement for the graph container using `useElementSize`. This ensures the `<Mafs />` component automatically adjusts to fill available space, resolving blank-space issues in fullscreen mode.
32. **AI-Optimized Core Math Refactor:** Introduced `src/core/math/` with a public API, context anchor, explicit normalization pipeline, MathJS adapter boundary, angle-mode scope construction, and compatibility re-exports from `src/lib/mathUtils.ts`.
33. **Graphing Feature Decomposition:** Moved graph expression semantics into `src/core/math/graph/` and split graphing UI/state into `src/features/graphing-calculator/` (`useGraphingCalculator`, `GraphSidebar`, `GraphCanvas`, `GraphToolbar`). `src/components/GraphingCalculator.tsx` is now a compatibility export.
34. **Assessment Core Decoupling:** Updated grading, equivalence, randomization, runtime, and submission building to use the `src/core/math/` facade and explicit assessment types (`ResolvedVariables`, `MonitoringSnapshot`, `SubmitReason`) instead of direct MathJS imports or central `any` contracts.
35. **Teacher Sync Type Safety:** Guarded `TeacherSessionPage` time-limit rendering against missing session polling data by defaulting `durationSeconds` before minute conversion.
36. **Firebase Hosting Automation:** Initialized Firebase Hosting configuration for the `sosc-maths` project and added GitHub Actions workflows for live and pull-request Firebase Hosting deployments.

## Active State & Roadmap

### Assessment Architecture (New)
The project is expanding into a specialized Assessment Platform.
- **Location:** `/src/assessment/`
- **Schemas:** `/src/assessment/schema/DynamicTestTypes.ts` defines the JSON manifest structure for adaptive, randomizable tests.
- **Validation:** High-fidelity recursive validation for manifest integrity, including cycle detection and referential checks.

### Known Debt
- **Graph Camera Control:** Reset View currently remounts Mafs to preserve native gestures. A future upgrade should either patch Mafs to expose `onViewBoxChange` / `onCameraChange`, or replace native Mafs gestures with a controlled viewport wrapper if manual zoom buttons become essential.
- **Type Bypasses:** Use of `(mf as any)` in `MathInput.tsx` and `mathfieldConfig.ts` to access MathLive configuration methods (`setOptions`, `getOptions`, `setValue`). This is due to version-specific variance in the `@types/mathlive` packages and the custom element bridge.
- **Normalization Limitations:** `processForMathJs` now handles common LaTeX/ASCII variations but still relies on complex regex. A formal parser-transformer would be the long-term solution.
- **Strict Type Rollout:** Core math and central assessment runtime paths have improved types, but several creator/sync UI files still need broader React typing cleanup before enabling full `strict` TypeScript project-wide.
- **Evaluation Sync:** While optimized with `evalText`, rapid typing still triggers full re-renders. Debouncing could be added if performance drops.
- **Bundle Size:** Standalone HTML exports are large (~2MB) due to the inclusion of React, MathLive, and MathJS engines.
- **Offline Fonts:** While Logic is offline, MathLive/Katex may still rely on CDN for specific mathematical fonts if not packaged.
- **Symbolic Equivalence:** The current simplification method uses `math.simplify`, which is powerful but not exhaustive. Complex trigonometric or logarithmic identities may require sampling fallback.
- **Sync Volatility:** Assessment sessions are stored in-memory. Restarting the dev server or production container will wipe all active sessions and join codes.

### Roadmap (Next Steps)
- **Parameter Sliders:** Support variable injection (e.g., `y = a*x^2`) with auto-generated UI sliders for the constant `a`.
- **Intersection Detection:** Implement numerical solvers to find and highlight intersection points between active functions.
- **Visual Refinement:** Add a "Glow" or "Shadow" effect to active plots for better visibility in dense graphs.
- **Export Capabilities:** Add a one-click "Copy as Image" or "Download SVG" feature using the underlying Mafs SVG node.

## Memory Bank Scaling
As the project grows, this single `AGENTS.md` file should be migrated to a `/memory-bank/` directory containing granular files:
- `active_state.md`: Goals, roadmap, and current task focus.
- `decision_log.md`: Justification for architectural and library choices.
- `system_patterns.md`: Technical constraints and project-wide rules.
For now, the single-file approach is maintained for maximum context injection efficiency.
