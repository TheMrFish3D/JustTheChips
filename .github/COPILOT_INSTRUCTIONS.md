# Copilot Instructions

You are GitHub Copilot working on an HTML/JavaScript/React application.

Guiding principles
- Never update or edit `docs/initial-spec.md`. That file is canonical; treat it as read-only.
- Always keep the development plan (`docs/development-plan.md`) up to date in every PR. When you complete or add work, update the plan accordingly.
- If you find an under-implemented area or technical debt, add an item to the development plan and open an issue for it.
- For each new item added to the development plan, create a corresponding GitHub issue.
- Prefer small, independently reviewable PRs. Each task should be about the size of one Copilot run.

Project context
- Stack: Vite + React + TypeScript. No backend initially. Calculations run client-side.
- Architecture and requirements are defined by `docs/initial-spec.md` and `docs/initial-architecture.md`.

How to implement tasks
- Before coding, read `docs/initial-spec.md` once to understand requirements. Do not modify it.
- Follow the development plan order unless a dependency requires reordering; if so, update the plan.
- Include or update unit tests with each change. Keep public behavior consistent with the spec.
- Validate inputs and guard against edge cases (division by zero, rpm/feed clamping).

Deliverables per PR
- Code changes following standards.
- Updated tests.
- Updated `docs/development-plan.md` reflecting any new tasks or changes.
- New or updated issues for any plan items added.
