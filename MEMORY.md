# MEMORY

## Project

- Name: `vr-arne`
- Date started: 2026-04-19
- Target device: Meta Quest 3
- Current framework choice: A-Frame
- XR stack: WebXR
- Repo state: scaffolded documentation, static web app starter in progress

## Goal

Create a small experimental VR app that is easy to resume across different agents and sessions.

## Current status

- Repository docs scaffolded
- Durable agent workflow established through `AGENTS.md`
- Git repo initialized
- Framework choice changed from native-first to web-first
- Static WebXR starter added under `web/`
- GitHub Pages deployment setup in progress
- Quest controller and viewpoint alignment fix applied by moving camera and controllers into a shared rig with explicit `local-floor` WebXR space

## Why web first

- Easiest path to sharing a prototype by URL
- Lower install friction for testers
- Simple deployment to static hosting
- Good fit for learning and fast iteration before deciding whether native features are necessary

## Immediate next steps

1. Test the starter locally in a desktop browser.
2. Push the repo to GitHub.
3. Verify GitHub Pages publishing works.
4. Confirm immersive VR entry works on Quest 3.
5. Pick the first tiny app concept.
6. Verify controller alignment feels correct on-device.

## Open questions

- Should the first interaction use controllers only, or should we try hand tracking early if browser support allows?
- Which static host do we want to standardize on for sharing previews?
- What is the first tiny app concept we want to validate?

## Working conventions

- Update this file whenever state meaningfully changes.
- Keep entries short and factual.
- Add decision notes for changes to tools, architecture, or workflow.

## Activity log

### 2026-04-19

- Chose Unity 6 LTS + OpenXR + Meta XR All-in-One SDK as the initial framework.
- Added `README.md`, `AGENTS.md`, and `MEMORY.md`.
- Planned repository structure for durable multi-agent collaboration.
- Initialized git in the repo.
- Switched the active direction to A-Frame + WebXR for easier link-based sharing.
- Added a minimal A-Frame starter app under `web/`.
- Prepared the repo for GitHub Pages deployment.
- Adjusted the scene rig so Quest headset and controller tracking share the same floor-relative origin.
