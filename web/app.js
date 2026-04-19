AFRAME.registerComponent("flight-demo", {
  init() {
    this.rightHand = document.querySelector("#right-hand");
    this.navSurface = document.querySelector("#nav-surface");
    this.ship = document.querySelector("#ship");
    this.shipShadow = document.querySelector("#ship-shadow");
    this.targetMarker = document.querySelector("#target-marker");
    this.tutorialSteer = document.querySelector("#tutorial-steer");
    this.tutorialFire = document.querySelector("#tutorial-fire");
    this.tutorialFireTarget = document.querySelector("#tutorial-fire-target");
    this.markerRoot = document.querySelector("#ground-markers");
    this.projectileRoot = document.querySelector("#projectiles");

    this.bounds = {
      minX: -4.4,
      maxX: 4.4,
      minZ: -12.5,
      maxZ: 0.8,
    };

    this.shipTarget = new THREE.Vector3(0, 0.45, -2.2);
    this.shipPosition = new THREE.Vector3(0, 0.45, -2.2);
    this.previousShipPosition = this.shipPosition.clone();

    this.scrollRows = [];
    this.rowSpacing = 0.95;
    this.scrollSpeed = 3.8;
    this.projectiles = [];
    this.lastFireTime = 0;
    this.fireCooldownMs = 180;
    this.wasTriggerPressed = false;
    this.tutorialStage = "steer";

    this.buildGroundMarkers();
    this.bindDesktopControls();
    this.bindFireControls();
    this.updateTargetMarker();
  },

  buildGroundMarkers() {
    const palette = ["#f7ede2", "#f4d35e", "#9ad1d4"];
    const rowCount = 16;

    for (let index = 0; index < rowCount; index += 1) {
      const row = document.createElement("a-entity");
      const lanePositions = [-3.1, 0, 3.1];

      row.object3D.position.set(0, -0.1, this.bounds.maxZ - index * this.rowSpacing);

      lanePositions.forEach((x, laneIndex) => {
        const marker = document.createElement("a-box");
        marker.setAttribute("position", `${x} 0 0`);
        marker.setAttribute("width", laneIndex === 1 ? "0.75" : "0.52");
        marker.setAttribute("height", "0.05");
        marker.setAttribute("depth", "0.6");
        marker.setAttribute("color", palette[(index + laneIndex) % palette.length]);
        marker.setAttribute("material", "shader: flat");
        row.appendChild(marker);
      });

      const centerStripe = document.createElement("a-box");
      centerStripe.setAttribute("position", "0 0 -0.45");
      centerStripe.setAttribute("width", "0.16");
      centerStripe.setAttribute("height", "0.03");
      centerStripe.setAttribute("depth", "0.55");
      centerStripe.setAttribute("color", "#17324d");
      centerStripe.setAttribute("material", "shader: flat");
      row.appendChild(centerStripe);

      this.markerRoot.appendChild(row);
      this.scrollRows.push(row);
    }
  },

  bindDesktopControls() {
    if (!this.navSurface) {
      return;
    }

    this.navSurface.addEventListener("click", (event) => {
      const hitPoint = event.detail?.intersection?.point;

      if (hitPoint) {
        this.setTarget(hitPoint.x, hitPoint.z);
      }
    });
  },

  bindFireControls() {
    if (this.rightHand) {
      [
        "triggerdown",
        "mousedown",
        "abuttondown",
        "bbuttondown",
        "xbuttondown",
        "ybuttondown",
        "gripdown",
        "thumbstickdown",
      ].forEach((eventName) => {
        this.rightHand.addEventListener(eventName, () => {
          this.fireProjectile();
        });
      });
    }

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.fireProjectile();
      }
    });
  },

  setTarget(x, z) {
    const clampedX = THREE.MathUtils.clamp(x, this.bounds.minX, this.bounds.maxX);
    const clampedZ = THREE.MathUtils.clamp(z, this.bounds.minZ, this.bounds.maxZ);

    this.shipTarget.set(clampedX, 0.45, clampedZ);
    this.updateTargetMarker();
  },

  updateTargetMarker() {
    if (!this.targetMarker) {
      return;
    }

    this.targetMarker.object3D.position.set(
      this.shipTarget.x,
      -0.08,
      this.shipTarget.z
    );
  },

  updateTargetFromController() {
    const raycaster = this.rightHand?.components?.raycaster;
    const intersections = raycaster?.intersections || [];
    const navHit = intersections.find(
      (intersection) => intersection.object?.el === this.navSurface
    );

    if (navHit?.point) {
      this.setTarget(navHit.point.x, navHit.point.z);
    }
  },

  updateShip(deltaSeconds) {
    if (!this.ship) {
      return;
    }

    const catchUp = 1 - Math.exp(-deltaSeconds * 4.2);
    this.previousShipPosition.copy(this.shipPosition);
    this.shipPosition.lerp(this.shipTarget, catchUp);
    this.ship.object3D.position.copy(this.shipPosition);

    const lateralVelocity = this.shipPosition.x - this.previousShipPosition.x;
    const forwardVelocity = this.shipPosition.z - this.previousShipPosition.z;

    this.ship.object3D.rotation.set(
      THREE.MathUtils.degToRad(forwardVelocity * -180),
      0,
      THREE.MathUtils.degToRad(lateralVelocity * -220)
    );

    if (this.shipShadow) {
      this.shipShadow.object3D.position.set(
        this.shipPosition.x,
        -0.11,
        this.shipPosition.z + 0.02
      );

      const shadowStretch = 1 + Math.min(Math.abs(lateralVelocity) * 8, 0.18);
      this.shipShadow.object3D.scale.set(shadowStretch, 1, 1.04);
    }

    if (this.tutorialStage === "steer" && this.tutorialSteer) {
      const steerTarget = this.tutorialSteer.object3D.position;
      const distanceToSteerGoal = this.shipPosition.distanceTo(steerTarget);

      if (distanceToSteerGoal < 0.55) {
        this.tutorialStage = "fire";
        this.tutorialSteer.setAttribute("visible", "false");

        if (this.tutorialFire) {
          this.tutorialFire.setAttribute("visible", "true");
        }
      }
    }
  },

  pollFireControls() {
    const trackedController =
      this.rightHand?.components?.["tracked-controls"]?.controller ||
      this.rightHand?.components?.["tracked-controls-webxr"]?.controller;
    const gamepad = trackedController?.gamepad;
    const buttons = gamepad?.buttons;
    const triggerPressed = Boolean(
      buttons?.[0]?.pressed || buttons?.[1]?.pressed || buttons?.[4]?.pressed
    );

    if (triggerPressed && !this.wasTriggerPressed) {
      this.fireProjectile();
    }

    this.wasTriggerPressed = triggerPressed;
  },

  fireProjectile() {
    if (!this.ship || !this.projectileRoot) {
      return;
    }

    const now = performance.now();

    if (now - this.lastFireTime < this.fireCooldownMs) {
      return;
    }

    this.lastFireTime = now;

    const projectile = document.createElement("a-entity");
    const bolt = document.createElement("a-sphere");
    const glow = document.createElement("a-sphere");
    const groundGlow = document.createElement("a-circle");

    projectile.object3D.position.copy(this.ship.object3D.position);
    projectile.object3D.position.y += 0.08;
    projectile.object3D.position.z -= 0.22;

    bolt.setAttribute("radius", "0.08");
    bolt.setAttribute("color", "#7fe7ff");
    bolt.setAttribute(
      "material",
      "shader: flat; emissive: #7fe7ff; emissiveIntensity: 0.9"
    );

    glow.setAttribute("radius", "0.14");
    glow.setAttribute("color", "#7fe7ff");
    glow.setAttribute(
      "material",
      "shader: flat; transparent: true; opacity: 0.28"
    );

    groundGlow.setAttribute("radius", "0.18");
    groundGlow.setAttribute("rotation", "-90 0 0");
    groundGlow.setAttribute("position", "0 -0.5 0");
    groundGlow.setAttribute("color", "#a7f3ff");
    groundGlow.setAttribute(
      "material",
      "shader: flat; transparent: true; opacity: 0.22"
    );

    projectile.appendChild(groundGlow);
    projectile.appendChild(glow);
    projectile.appendChild(bolt);
    this.projectileRoot.appendChild(projectile);

    this.projectiles.push({
      el: projectile,
      groundGlow,
      velocity: new THREE.Vector3(0, 0, -10.5),
      lifetime: 1.6,
    });
  },

  updateGround(deltaSeconds) {
    const loopLength = this.rowSpacing * this.scrollRows.length;

    this.scrollRows.forEach((row) => {
      row.object3D.position.z += this.scrollSpeed * deltaSeconds;

      if (row.object3D.position.z > this.bounds.maxZ + this.rowSpacing) {
        row.object3D.position.z -= loopLength;
      }
    });
  },

  updateProjectiles(deltaSeconds) {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.lifetime -= deltaSeconds;
      projectile.el.object3D.position.addScaledVector(
        projectile.velocity,
        deltaSeconds
      );

      if (projectile.groundGlow) {
        const remaining = Math.max(projectile.lifetime / 1.6, 0);
        projectile.groundGlow.object3D.position.y = -0.5;
        projectile.groundGlow.setAttribute(
          "material",
          `shader: flat; transparent: true; opacity: ${0.1 + remaining * 0.18}`
        );
        const glowScale = 0.9 + (1 - remaining) * 0.6;
        projectile.groundGlow.object3D.scale.set(glowScale, glowScale, glowScale);
      }

      if (
        this.tutorialStage === "fire" &&
        this.tutorialFireTarget &&
        this.tutorialFire?.getAttribute("visible")
      ) {
        const projectilePosition = projectile.el.object3D.position;
        const fireTargetPosition = this.tutorialFireTarget.object3D.getWorldPosition(
          new THREE.Vector3()
        );

        if (projectilePosition.distanceTo(fireTargetPosition) < 0.46) {
          this.tutorialStage = "done";
          this.tutorialFire.setAttribute("visible", "false");
        }
      }

      const expired =
        projectile.lifetime <= 0 ||
        projectile.el.object3D.position.z < this.bounds.minZ - 3;

      if (expired) {
        projectile.el.remove();
        return false;
      }

      return true;
    });
  },

  tick(time, delta) {
    const deltaSeconds = Math.min(delta / 1000, 0.05);

    this.updateTargetFromController();
    this.pollFireControls();
    this.updateShip(deltaSeconds);
    this.updateGround(deltaSeconds);
    this.updateProjectiles(deltaSeconds);

    if (this.targetMarker) {
      const pulse = 1 + Math.sin(time / 180) * 0.08;
      this.targetMarker.object3D.scale.set(pulse, pulse, pulse);
    }
  },
});
