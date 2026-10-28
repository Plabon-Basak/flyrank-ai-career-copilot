# AI Career Copilot

An AI-powered career assistant that helps job seekers evaluate their resumes against job descriptions.

## Project Overview

AI Career Copilot aims to provide actionable feedback through AI-powered resume analysis.

## Planned Features

- Resume and job description analysis
- ATS-style compatibility scoring
- Missing skills identification
- Resume improvement suggestions

## Planned Technology Stack

- HTML
- CSS
- JavaScript
- Google Gemini API

## Project Status

Currently in the environment setup and project planning phase.

## Author

Plabon Basak

## Getting Started

Open `index.html` directly in a modern browser, or serve the project locally with:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

The career profile settings page includes responsive professional information and career preference forms. Valid data is stored locally in the browser between visits.

### Development Planning

1. Clone the repository.
2. Review the project overview and roadmap in this README.
3. Review `CLAUDE.md` for the planned technology stack, coding conventions, and development guidelines.
4. Wait for the implementation phase to begin before following application-specific setup instructions.

### Future Requirements

When implementation starts, the project will require a modern web browser and the planned HTML, CSS, JavaScript, and Google Gemini API integration. A Node.js toolchain should only be added if the implementation adopts one.

Any future Gemini API integration must keep API credentials outside frontend source code and follow the security guidance below.

## Roadmap

- [ ] Create the responsive user interface
- [ ] Implement resume input
- [ ] Implement job description input
- [ ] Integrate AI-powered analysis
- [ ] Generate ATS-style compatibility feedback
- [ ] Identify missing skills
- [ ] Provide resume improvement suggestions

## Security

API credentials must never be committed to the repository. Any future backend integration must keep secrets in environment variables.
