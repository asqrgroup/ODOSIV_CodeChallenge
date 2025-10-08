# Accessibility (Section 508 / WCAG) Requirements

This document contains accessibility requirements and testing guidance for the dashboard.

Requirements
- Compliance: Section 508 (WCAG 2.1 AA) minimum. Document any deviations and reasons.
- Responsive: verify on desktop, tablet, and mobile layouts.
- Keyboard navigation: all interactive elements reachable and usable by keyboard only.
- Screen reader compatibility: ensure meaningful landmark roles, headings, and ARIA where necessary.
- Color contrast: all text and UI elements meet contrast ratios per WCAG.

Testing
- Automated accessibility checks with axe-core integrated into frontend tests.
- Manual spot checks with VoiceOver (macOS), NVDA/JAWS where possible.
- Include accessibility checks in CI and block merges on critical failures.

Documentation
- Record accessibility testing results and remediation steps in PRs and in `Scans.md` when appropriate.

Developer prompts (examples)
- "Goal: add axe-core tests to dashboard page; Acceptance: no axe critical/serious violations in CI."

---
