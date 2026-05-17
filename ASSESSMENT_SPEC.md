# MathGraph Pro: Assessment & Test Creation Specification

## Overview
This document specifies the requirements for a standalone, auto-grading assessment system integrated with the MathGraph Pro mathematical engine.

## Core Mathematical Engine
The system must utilize the logic defined in `src/lib/mathUtils.ts`.
- **Normalization:** `processForMathJs()` must be used to handle LaTeX/MathLive artifacts.
- **Evaluation:** `evaluateSafely()` using MathJS for symbolic and numeric comparison.
- **Equivalence Rule:** Two answers are equivalent if `evaluateSafely(ans1 - ans2) === 0` (symbolic subtraction) or if their numeric forms match within a tolerance.

## Test Features & Requirements
1. **Teacher Sync:** A mechanism (likely via WebSockets or a shared state) to trigger the "Start" event for all connected clients.
2. **Security & Monitoring:**
    - Tab Visibility API tracking: Log time spent 'hidden' vs 'visible'.
    - Auto-submission on timer expiry.
3. **Dynamic Content:**
    - Support for variables (e.g., `let a = random(1, 10)`).
    - Question templates that inject these variables into LaTeX.
4. **Adaptive Logic:**
    - Each question maps to a rubric skill (e.g., "Linear Equations").
    - If a student fails a "Level 2" question, the next question should be a "Level 1" hint or prerequisite.
5. **Progressive Hints:**
    - Level 1: Conceptual tip.
    - Level 2: Methodological clue.
    - Level 3: Final answer reveal (marks question as 'assisted').
6. **Output & Grader:**
    - Student submission generates a structured JSON/HTML payload.
    - System converts this to a PDF using standard layout.
    - PDF includes "Rubric Alignment" (e.g., "Student demonstrated 80% mastery in Algebra II").

## Standalone HTML Requirement
The "Test Creator" should export a single `.html` file containing:
- MathLive (CDN).
- MathJS (CDN).
- The normalized `mathUtils.ts` logic.
- A JSON 'Test Manifest' defining the questions.
- A runtime script to manage the timer, UI, and submission.
