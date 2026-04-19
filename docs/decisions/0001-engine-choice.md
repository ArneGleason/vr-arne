# Decision 0001: Use Unity for the first prototype

- Date: 2026-04-19
- Status: superseded

## Context

We want the fastest credible path to a playable Meta Quest 3 prototype while keeping future options open.

## Decision

Use Unity 6 LTS with OpenXR and the Meta XR All-in-One SDK for the first iteration.

## Why

- Best balance of speed and platform support
- Mature Quest workflow
- Large example ecosystem
- Easier onboarding for quick prototyping

## Consequences

- We accept Unity-specific project metadata and larger repo footprint.
- We should add a Unity `.gitignore` before committing the engine project.
- If the prototype succeeds, we can revisit engine choice later with real constraints in hand.

## Superseded by

See `0002-web-first-direction.md` for the active direction.
