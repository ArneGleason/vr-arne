# AGENTS

This repository is designed so different agents, sessions, or model versions can resume work without relying on chat history.

## Working agreement

- Read `MEMORY.md` before making meaningful changes.
- Update `MEMORY.md` after any notable decision, milestone, or blocker.
- Prefer small, reversible changes.
- Record decisions in `docs/decisions/` when the choice affects architecture, tooling, or workflow.
- Keep setup instructions current in `docs/setup.md`.

## Current stack preference

- Framework: A-Frame
- XR path: WebXR
- Device target: Meta Quest 3
- Deployment model: static web app

If changing the framework or XR stack, add a decision note first and update `MEMORY.md`.

## Durable context rules

- `MEMORY.md` is the source of truth for current project state.
- `README.md` is for humans landing in the repo.
- `docs/decisions/` holds short ADR-style notes for important choices.
- Avoid hiding project-critical knowledge only in code comments or commit messages.

## Suggested session loop

1. Read `README.md` and `MEMORY.md`.
2. Scan `docs/` for recent decisions.
3. Make the smallest useful change.
4. Update `MEMORY.md` with:
   - what changed
   - what still blocks progress
   - the next best step

## Web-first guidance

- Prefer static assets and simple hosting when possible.
- Preserve compatibility with Quest Browser first.
- Treat desktop browser support as a convenience, not the primary target.
- If adding dependencies or a build system, record why the extra complexity is worth it.
- If native-only Quest features become necessary, document the gap before proposing a non-web migration.

## Multi-agent coordination

- Claim a task clearly in `MEMORY.md` if multiple agents may work in parallel.
- Do not rewrite broad repo conventions casually.
- If a task depends on assumptions, write them down.
- If something fails experimentally, capture the failure and what was learned.

## Good memory entries

Prefer concise updates that include:

- date
- current objective
- last known working state
- blockers
- next steps
