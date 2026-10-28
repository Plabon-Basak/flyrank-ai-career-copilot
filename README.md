# AI Career Copilot

AI Career Copilot is a client-side career assistant for job seekers. The current application provides a Career Profile Settings form for storing profile information locally in the browser.

## Features

- Career profile settings with required and optional fields
- Accessible field-level validation feedback
- Browser localStorage persistence
- Reset-to-last-saved behavior
- Responsive HTML and CSS interface
- Node.js built-in validation tests

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js `node:test` for validation tests

## Run the Application

No package installation or backend is required.

1. Clone or download this repository.
2. Open the project directory.
3. Start a local static server, for example:

   ```powershell
   python -m http.server 8000
   ```

4. Visit `http://localhost:8000/index.html` in a modern browser.

Opening `index.html` directly can work, but serving it over a local HTTP server is recommended for consistent browser behavior.

## Run Tests

Requires Node.js 18 or newer. From the project root, run:

```powershell
node --test
```

## Storage

The profile is saved under the consistent localStorage key:

```text
aiCareerCopilot.careerProfile.v1
```

No profile information is sent to a backend or external API.

## Security

API credentials must never be committed to the repository. Future integrations should keep secrets outside frontend source code.
