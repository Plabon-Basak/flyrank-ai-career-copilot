# AI Career Copilot - Project Instructions

## Project Overview
AI Career Copilot is an AI-powered career assistant that analyzes resumes against job descriptions and provides actionable feedback.

## Technology Stack
- HTML5
- CSS3
- JavaScript
- Google Gemini API

## Coding Conventions
- Use clean, readable, and maintainable code.
- Use meaningful variable and function names.
- Keep HTML, CSS, and JavaScript organized.
- Follow responsive design principles.
- Handle API errors gracefully.
- Never expose API keys or secrets in frontend source code.

## Development Guidelines
- Keep the user interface simple and accessible.
- Validate user inputs.
- Provide clear feedback for errors and loading states.
- Avoid unnecessary dependencies.
- Test changes before considering tasks complete.

## AI Assistant Guidelines
- Inspect existing files before making changes.
- Explain significant architectural decisions.
- Avoid unrelated modifications.
- Update README.md when project functionality changes.

## Project-Specific Rules

1. Keep profile validation and normalization in `validation.js`. Do not put validation rules directly inside DOM event handlers in `script.js`.

2. Trim all profile string values before validation. The required fields are `fullName`, `email`, `targetRole`, `experienceLevel`, and `workArrangement`. The `skills` field is optional.

3. Experience levels must use only `Student`, `Entry-level`, `Mid-level`, or `Senior`. Work arrangements must use only `Remote`, `Hybrid`, or `On-site`. Keep these allowed values centralized in `validation.js`.

4. Whenever validation or normalization logic changes, add or update tests in `tests/validation.test.js` and run `node --test`. Do not consider the change complete if tests fail.

5. Never save a profile to localStorage when `validateProfile()` reports `isValid: false`. Use the existing versioned storage key `aiCareerCopilot.careerProfile.v1`.
