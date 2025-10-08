# Frontend Requirements

This document contains the full frontend requirements for the MaxTekn / H&H coding challenge.

Scope
- Responsive dashboard UI that queries the data warehouse and displays the following per-user metrics:
  - High BPM
  - Low BPM
  - Average Confidence
  - BPM Standard Deviation
  - Name and search-by-name functionality
  - Pipeline performance panel (ingest/processing latency, job success/fail counts)

Acceptance Criteria
- Dashboard shows users by name and required aggregates.
- Search by name returns the correct user's stats and highlights selected user.
- Dashboard displays pipeline performance metrics and aggregate statistics for the dataset.
- UI is responsive and Section 508 (WCAG) compliant for desktop, tablet and mobile.
- Frontend has unit tests and snapshot tests for primary views.

Implementation Guidance
- Provide an API client that calls the backend `user_heart_agg` endpoint; tests should mock responses for deterministic results.
- Use modern frontend stack (React/Vite is already present) and component-level tests (React Testing Library / Jest).
- Accessibility: include axe-core based checks as part of the test suite.
- Keep authentication/authorization pluggable; integration points documented but secrets managed outside the repo.

CI Requirements
- Frontend CI job must run linting, unit tests, coverage, and accessibility checks. Coverage target: maintain project-wide >=90% where possible.

Developer prompts (examples)
- "Goal: implement dashboard view that lists all users and shows aggregates from `/api/user_heart_agg`. Inputs: mocked API. Acceptance: snapshot + accessibility checks pass."
- "Goal: implement search component to query by name. Inputs: small user list. Acceptance: correct selection and rendering of user stats."

Design & 508 Guidance
- Ensure color contrast, keyboard navigability, semantic HTML, and ARIA attributes where necessary.
- Test with screen readers and keyboard-only navigation in CI/manual checks.

Files to update
- `README.md` — include frontend run and test instructions.
- `Approach.md` — include frontend development approach and roles.

---
