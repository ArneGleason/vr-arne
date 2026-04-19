# Decision 0002: Start web-first with A-Frame and WebXR

- Date: 2026-04-19
- Status: accepted

## Context

The project goal is not only to build a Quest 3 prototype, but to make it easy for other people to access and test. A browser-based experience reduces friction because people can open a URL instead of installing a native headset app.

## Decision

Use a static web app built with A-Frame and WebXR as the first implementation path.

## Why

- Simplest sharing model: send a link
- Easy deployment to static hosting
- Low setup cost for early experiments
- Good fit for quick Quest Browser testing
- Keeps the option open to move native later if the idea needs it

## Consequences

- We optimize for Quest Browser compatibility first.
- We should keep the initial app lightweight and interaction-focused.
- We accept browser-platform limits compared with a native Quest app.
- If the concept needs deeper device integration or higher performance, we can revisit a native implementation later.
