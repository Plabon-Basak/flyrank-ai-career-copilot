# AI-Assisted Workflow Comparison

## Objective

This experiment compared two AI-assisted approaches to building a Career Profile Settings Form. Both implementations were developed independently from the same `main` branch using separate Git branches: `workflow-vague` and `workflow-precise`.

## Round 1: Vague Prompt

The first round used a single instruction: "Create a career profile settings form for this project."

The AI generated `index.html`, `styles.css`, and `script.js`, and modified the README. The implementation included professional information fields, career preferences, responsive styling, client-side validation, localStorage persistence, success notifications, and cancel/reset behavior.

Manual browser checks confirmed that the form loaded, accepted input, rejected invalid submissions, saved valid data, restored saved data after refresh, and supported reset behavior. However, validation logic was coupled to the application script, and no automated tests were provided.

## Round 2: Precise Prompt

The second round started in a fresh AI chat and on a separate branch based on `main`. The prompt specified required fields, validation rules, accessibility expectations, technical constraints, file structure, and verification requirements.

The AI created a separate `validation.js` module and `tests/validation.test.js`. Validation now trims input, checks required fields, verifies email format, and restricts experience and work-arrangement values to supported options.

The test suite was independently executed with `node --test`: seven tests passed and zero failed. Browser verification also covered invalid submissions, persistence, reload restoration, success feedback, and reset behavior.

## Comparison and Review

The precise workflow produced a more modular and testable implementation. Separating validation from DOM manipulation made the logic easier to inspect and test. Explicit accessibility requirements also guided the implementation toward semantic form controls, associated labels, keyboard focus states, ARIA error descriptions, and live feedback.

The main weakness identified in Round 1 review was the absence of independently testable validation logic and automated tests. This was a maintainability and verification gap, not a confirmed runtime defect. Round 2 addressed it with a reusable validation module and seven automated tests.

Both implementations passed their respective manual browser checks. Automated verification was available only in Round 2, so the evidence is stronger for its validation logic. Exact review-time measurements were not recorded; therefore, no numerical time-saving claim is made.

## Conclusion

The experiment showed that a precise prompt with repository inspection, planning, explicit constraints, and verification requirements produced a more maintainable and verifiable result than a single vague instruction. AI-generated code still required human review and independent testing.


