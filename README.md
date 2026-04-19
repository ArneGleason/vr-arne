# vr-arne

Starter repository for a web-first Meta Quest 3 VR prototype.

## Why this stack

This project starts with:

- A-Frame
- WebXR
- Static web hosting
- GitHub for source control

The initial direction is web-first so people can open a link in the Quest browser instead of installing a native app. This gives us the fastest path to sharing prototypes, gathering feedback, and iterating on ideas.

## Repo goals

- Keep project context durable across agent sessions
- Make it easy for multiple agents or future model versions to resume work
- Prototype a VR app for Meta Quest 3
- Preserve architectural decisions in plain markdown

## Recommended initial setup

1. Run a local static web server from the repo.
2. Open the site in a desktop browser for quick iteration.
3. Open the hosted site or local HTTPS tunnel in Meta Quest Browser.
4. Confirm immersive VR entry works on Quest 3.
5. Add one meaningful interaction and iterate.

## Repository structure

- `AGENTS.md`: instructions for agents working in this repo
- `MEMORY.md`: durable project memory and current state
- `docs/setup.md`: local environment notes and bring-up checklist
- `docs/decisions/`: short architecture decisions
- `web/`: static WebXR app

## First milestone

Build a minimal Quest 3 browser experience with:

- head tracking
- hand controllers
- immersive VR entry from the browser
- one interactable object

## Local development

Serve the `web/` directory with any static server. For example:

```bash
cd web
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

For actual headset testing, use HTTPS on a host such as GitHub Pages, Netlify, or Cloudflare Pages, or use a secure local tunnel.

## Publishing

This repo is set up to publish the `web/` directory with GitHub Pages through GitHub Actions.

Expected project site URL:

`https://arnegleason.github.io/vr-arne/`

## Why web first

- Easiest way to share with other people
- Small deployment surface
- Low friction for experiments
- Keeps the door open for a later native Quest app if the prototype needs more power or deeper device features
