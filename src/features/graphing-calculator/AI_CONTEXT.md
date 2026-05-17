# Graphing Calculator Context Anchor

The graphing calculator is split into three layers:

1. `src/core/math/graph/` parses expression semantics without React, Mafs, or MathLive.
2. `hooks/useGraphingCalculator.ts` coordinates UI state and input registry behavior.
3. `ui/` renders sidebar controls and Mafs canvas.

Future assistants should not place math parsing or MathJS logic inside React components.
