# Core Math Context Anchor

This module is the headless mathematical engine for SOSC Maths.

- Public API lives in `src/core/math/index.ts`.
- React, Mafs, MathLive elements, DOM APIs, and browser state are forbidden here.
- MathJS access is isolated behind `evaluate/mathJsAdapter.ts`.
- Normalization is an explicit ordered pipeline in `normalize/normalizeExpression.ts`.
- Graph-expression semantics live in `graph/` and must remain UI-library agnostic.

If a future assistant needs to evaluate or normalize math, read only:

1. `index.ts`
2. `normalize/normalizeExpression.ts`
3. The specific adapter/parser file related to the requested behavior
