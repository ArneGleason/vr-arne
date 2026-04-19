# MEMORY

## Project

- Name: `vr-arne`
- Date started: 2026-04-19
- Target device: Meta Quest 3
- Current framework choice: A-Frame
- XR stack: WebXR
- Repo state: live GitHub Pages prototype with first scrolling-flight interaction pass

## Goal

Create a small experimental VR app that is easy to resume across different agents and sessions.

## Current status

- Repository docs scaffolded
- Durable agent workflow established through `AGENTS.md`
- Git repo initialized
- Framework choice changed from native-first to web-first
- Static WebXR starter added under `web/`
- GitHub Pages deployment working from `main`
- Quest controller and viewpoint alignment fix applied by moving camera and controllers into a shared rig with explicit `local-floor` WebXR space
- Prototype shifted toward a forward-scrolling shooter feel with pointer-guided ship movement over a moving ground lane
- Playfield perspective retuned so the lane begins near the player and fades into fog instead of reading as a distant horizon
- Near-edge placement retuned so the steerable strip and ship can come back to the player's feet without the curved masking wall clipping the left side
- Added a metallic flying-saucer ship shape, basic trigger-fired projectiles, and a slightly wider/deeper play strip
- Saucer proportions refined with a lower dome and shadow, and firing input made more robust with extra Quest button handling plus gamepad polling
- Visual pass continues with the lower saucer band lifted slightly and projectile ground-glow decals added as cheap light spill
- The helper text is evolving into a two-step in-world tutorial: steer to a marker first, then shoot a target to clear the second prompt
- The abstract field is being replaced with a looping pastoral scene using a meandering stream and varied lightweight trees, and the fire tutorial hit test now compares world-space positions
- The fire tutorial target now counts down from 10 hits before playing a brief blow-away outro, and the pastoral terrain visuals have been made much more obvious
- The core interaction is shifting from unlimited firing to a hold-to-tractor and release-to-throw boulder loop, with tutorial stages for movement, pickup, and a static throw target
- The boulders have been reduced toward projectile scale, tractor pickup is being made more visibly readable, and release now uses a visible launched shot for clearer feedback
- Added explicit asset cache-busting and a visible build label to diagnose Quest Browser serving stale JS/CSS

## Why web first

- Easiest path to sharing a prototype by URL
- Lower install friction for testers
- Simple deployment to static hosting
- Good fit for learning and fast iteration before deciding whether native features are necessary

## Immediate next steps

1. Test the new scrolling-flight motion on Quest 3.
2. Tune the ship catch-up speed and tabletop playfield scale on-device.
3. Verify that holding trigger tractors up one nearby small boulder with readable suction motion and releasing launches a visible shot cleanly.
4. Verify the three-step tutorial flow feels clear: move, pick up, throw at static target.
5. Add the moving target variant once the base tractor-and-throw loop feels good.

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
- Replaced the cube test with a first shooter-style motion prototype: ship steering plus scrolling ground markers.
- Verified the live GitHub Pages deployment on Quest 3 and fixed the initial controller/view alignment issue.
- Pulled the playfield back toward the player's feet and added fog plus soft masking to keep the space self-contained.
- Extended the near steering range to the player's toes and removed the curved masking wall that was visibly cutting into the left side.
- Replaced the ship with a saucer silhouette, widened the play area slightly, and added simple trigger-fired photon-style projectiles.
- Lowered the saucer dome for a better UFO profile, added a simple ground shadow, and expanded firing input support for Quest controllers.
- Lifted the inner saucer band so it reads above the rim and added a fake light spill under projectiles to test the look and performance.
- Started replacing static instructions with a staged tutorial that responds to steering and firing.
- Replaced the abstract scrolling markers with procedural pastoral terrain segments and corrected the tutorial fire-hit detection to use matching coordinate space.
- Expanded the tutorial fire target into a 10-hit countdown objective with a quick outro and made the pastoral terrain much more visually pronounced.
- Replaced the projectile-firing mechanic with a first tractor-and-throw boulder loop and retargeted the tutorial toward movement, pickup, and throwing.
- Tightened the tractor-and-throw feedback by shrinking the pickup boulders and making release emit a clearly visible launched shot.
- Added a versioned asset URL and visible build marker after repeated reports of Quest Browser showing stale builds.
