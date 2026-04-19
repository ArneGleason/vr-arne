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
    this.tutorialFireRing = document.querySelector("#tutorial-fire-ring");
    this.tutorialFireCount = document.querySelector("#tutorial-fire-count");
    this.tutorialFireText = document.querySelector("#tutorial-fire-text");
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
    this.tutorialFireHitsRemaining = 10;
    this.tutorialFireOutroTime = 0;
    this.tempProjectileWorld = new THREE.Vector3();
    this.tempTutorialWorld = new THREE.Vector3();

    this.buildGroundMarkers();
    this.bindDesktopControls();
    this.bindFireControls();
    this.updateTargetMarker();
  },

  buildGroundMarkers() {
    const rowCount = 16;

    for (let index = 0; index < rowCount; index += 1) {
      const row = document.createElement("a-entity");
      row.object3D.position.set(0, -0.1, this.bounds.maxZ - index * this.rowSpacing);
      row.dataset.segmentIndex = String(index);
      this.populateRow(row, index);

      this.markerRoot.appendChild(row);
      this.scrollRows.push(row);
    }
  },

  randomFromSeed(seed) {
    const raw = Math.sin(seed * 127.1) * 43758.5453123;
    return raw - Math.floor(raw);
  },

  streamCenterX(segmentIndex) {
    return (
      Math.sin(segmentIndex * 0.42) * 1.2 +
      Math.sin(segmentIndex * 0.18 + 1.4) * 0.65
    );
  },

  streamWidth(segmentIndex) {
    return 1 + 0.28 * (Math.sin(segmentIndex * 0.37 + 0.8) + 1) * 0.5;
  },

  clearRow(row) {
    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }
  },

  createTree(segmentIndex, side, offsetIndex) {
    const tree = document.createElement("a-entity");
    const trunk = document.createElement("a-cylinder");
    const canopyLow = document.createElement("a-sphere");
    const canopyHigh = document.createElement("a-sphere");
    const canopySide = document.createElement("a-sphere");
    const scale = 0.9 + this.randomFromSeed(segmentIndex * 5.1 + offsetIndex) * 1.1;
    const spread = 3 + this.randomFromSeed(segmentIndex * 3.7 + offsetIndex + 20) * 1.35;
    const x = side * spread;
    const z = (this.randomFromSeed(segmentIndex * 9.3 + offsetIndex + 7) - 0.5) * 0.55;
    const yaw = this.randomFromSeed(segmentIndex * 2.6 + offsetIndex + 40) * 360;

    tree.object3D.position.set(x, 0, z);
    tree.object3D.rotation.y = THREE.MathUtils.degToRad(yaw);
    tree.object3D.scale.setScalar(scale);

    trunk.setAttribute("position", "0 0.24 0");
    trunk.setAttribute("radius", "0.06");
    trunk.setAttribute("height", "0.48");
    trunk.setAttribute("color", "#7a5230");
    trunk.setAttribute("material", "shader: flat");

    canopyLow.setAttribute("position", "0 0.5 0");
    canopyLow.setAttribute("radius", "0.22");
    canopyLow.setAttribute("color", "#5a9940");
    canopyLow.setAttribute("material", "shader: flat");

    canopyHigh.setAttribute("position", "0.03 0.72 0.03");
    canopyHigh.setAttribute("radius", "0.19");
    canopyHigh.setAttribute("color", "#7cbc60");
    canopyHigh.setAttribute("material", "shader: flat");

    canopySide.setAttribute("position", "-0.11 0.56 0.02");
    canopySide.setAttribute("radius", "0.17");
    canopySide.setAttribute("color", "#4d853a");
    canopySide.setAttribute("material", "shader: flat");

    tree.appendChild(trunk);
    tree.appendChild(canopyLow);
    tree.appendChild(canopyHigh);
    tree.appendChild(canopySide);

    return tree;
  },

  populateRow(row, segmentIndex) {
    this.clearRow(row);

    const stream = document.createElement("a-box");
    const streamHighlight = document.createElement("a-box");
    const streamBankLeft = document.createElement("a-box");
    const streamBankRight = document.createElement("a-box");
    const meadowPatch = document.createElement("a-circle");
    const centerX = this.streamCenterX(segmentIndex);
    const width = this.streamWidth(segmentIndex);
    const segmentDepth = this.rowSpacing * 1.3;

    stream.setAttribute("position", `${centerX} 0.018 0`);
    stream.setAttribute("width", `${width}`);
    stream.setAttribute("height", "0.045");
    stream.setAttribute("depth", `${segmentDepth}`);
    stream.setAttribute("color", "#5fb6d9");
    stream.setAttribute("material", "shader: flat");

    streamBankLeft.setAttribute(
      "position",
      `${centerX - width * 0.58} 0.016 0`
    );
    streamBankLeft.setAttribute("width", `${width * 0.3}`);
    streamBankLeft.setAttribute("height", "0.015");
    streamBankLeft.setAttribute("depth", `${segmentDepth * 1.05}`);
    streamBankLeft.setAttribute("color", "#8bb56b");
    streamBankLeft.setAttribute("material", "shader: flat");

    streamBankRight.setAttribute(
      "position",
      `${centerX + width * 0.58} 0.016 0`
    );
    streamBankRight.setAttribute("width", `${width * 0.3}`);
    streamBankRight.setAttribute("height", "0.015");
    streamBankRight.setAttribute("depth", `${segmentDepth * 1.05}`);
    streamBankRight.setAttribute("color", "#8bb56b");
    streamBankRight.setAttribute("material", "shader: flat");

    streamHighlight.setAttribute(
      "position",
      `${centerX - width * 0.08} 0.038 ${-segmentDepth * 0.08}`
    );
    streamHighlight.setAttribute("width", `${width * 0.42}`);
    streamHighlight.setAttribute("height", "0.01");
    streamHighlight.setAttribute("depth", `${segmentDepth * 0.55}`);
    streamHighlight.setAttribute("color", "#c8f1ff");
    streamHighlight.setAttribute("material", "shader: flat; transparent: true; opacity: 0.5");

    meadowPatch.setAttribute(
      "position",
      `${centerX + Math.sin(segmentIndex * 0.7) * 1.25} 0.012 ${(this.randomFromSeed(segmentIndex + 90) - 0.5) * 0.35}`
    );
    meadowPatch.setAttribute("rotation", "-90 0 0");
    meadowPatch.setAttribute("radius", `${0.18 + this.randomFromSeed(segmentIndex + 33) * 0.24}`);
    meadowPatch.setAttribute("color", "#77ad5a");
    meadowPatch.setAttribute("material", "shader: flat; transparent: true; opacity: 0.55");

    row.appendChild(stream);
    row.appendChild(streamBankLeft);
    row.appendChild(streamBankRight);
    row.appendChild(streamHighlight);
    row.appendChild(meadowPatch);

    const leftTreeCount = this.randomFromSeed(segmentIndex + 11) > 0.35 ? 1 : 0;
    const rightTreeCount = this.randomFromSeed(segmentIndex + 17) > 0.28 ? 1 : 0;
    const extraTree = this.randomFromSeed(segmentIndex + 29) > 0.72;

    for (let index = 0; index < leftTreeCount; index += 1) {
      row.appendChild(this.createTree(segmentIndex, -1, index));
    }

    for (let index = 0; index < rightTreeCount; index += 1) {
      row.appendChild(this.createTree(segmentIndex, 1, index + 3));
    }

    if (extraTree) {
      const side = this.randomFromSeed(segmentIndex + 51) > 0.5 ? -1 : 1;
      row.appendChild(this.createTree(segmentIndex, side, 7));
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

  registerTutorialFireHit() {
    if (this.tutorialStage !== "fire" || !this.tutorialFire) {
      return;
    }

    this.tutorialFireHitsRemaining -= 1;

    if (this.tutorialFireCount) {
      this.tutorialFireCount.setAttribute(
        "value",
        `${Math.max(this.tutorialFireHitsRemaining, 0)}`
      );
    }

    if (this.tutorialFireTarget) {
      const flashScale =
        1 + (10 - Math.max(this.tutorialFireHitsRemaining, 0)) * 0.015;
      this.tutorialFireTarget.object3D.scale.set(
        flashScale,
        flashScale,
        flashScale
      );
    }

    if (this.tutorialFireHitsRemaining <= 0) {
      this.tutorialStage = "done";
      this.tutorialFireOutroTime = 0.32;
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
        const nextSegmentIndex =
          Number.parseInt(row.dataset.segmentIndex || "0", 10) + this.scrollRows.length;
        row.dataset.segmentIndex = String(nextSegmentIndex);
        this.populateRow(row, nextSegmentIndex);
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
        const projectilePosition = projectile.el.object3D.getWorldPosition(
          this.tempProjectileWorld
        );
        const fireTargetPosition = this.tutorialFireTarget.object3D.getWorldPosition(
          this.tempTutorialWorld
        );

        if (projectilePosition.distanceTo(fireTargetPosition) < 0.46) {
          projectile.lifetime = 0;
          this.registerTutorialFireHit();
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

    if (this.tutorialFireOutroTime > 0 && this.tutorialFire) {
      this.tutorialFireOutroTime = Math.max(this.tutorialFireOutroTime - deltaSeconds, 0);
      const progress = 1 - this.tutorialFireOutroTime / 0.32;
      const scale = 1 + progress * 1.2;
      this.tutorialFire.object3D.scale.set(scale, scale, scale);

      const opacity = Math.max(1 - progress, 0);

      if (this.tutorialFireTarget) {
        this.tutorialFireTarget.setAttribute(
          "material",
          `shader: flat; emissive: #7fe7ff; emissiveIntensity: ${0.85 + progress * 0.4}; transparent: true; opacity: ${opacity}`
        );
      }

      if (this.tutorialFireRing) {
        this.tutorialFireRing.setAttribute(
          "material",
          `shader: flat; transparent: true; opacity: ${opacity}`
        );
      }

      if (this.tutorialFireCount) {
        this.tutorialFireCount.setAttribute("opacity", `${opacity}`);
      }

      if (this.tutorialFireText) {
        this.tutorialFireText.setAttribute("opacity", `${opacity}`);
      }

      if (this.tutorialFireOutroTime === 0) {
        this.tutorialFire.setAttribute("visible", "false");
      }
    }
  },
});
