AFRAME.registerComponent("flight-demo", {
  init() {
    this.rightHand = document.querySelector("#right-hand");
    this.navSurface = document.querySelector("#nav-surface");
    this.playfield = document.querySelector("#playfield");
    this.ship = document.querySelector("#ship");
    this.shipShadow = document.querySelector("#ship-shadow");
    this.tractorBeam = document.querySelector("#tractor-beam");
    this.targetMarker = document.querySelector("#target-marker");
    this.tutorialSteer = document.querySelector("#tutorial-steer");
    this.tutorialTractor = document.querySelector("#tutorial-tractor");
    this.tutorialThrow = document.querySelector("#tutorial-throw");
    this.tutorialThrowTarget = document.querySelector("#tutorial-throw-target");
    this.tutorialThrowRing = document.querySelector("#tutorial-throw-ring");
    this.tutorialThrowText = document.querySelector("#tutorial-throw-text");
    this.markerRoot = document.querySelector("#ground-markers");
    this.dynamicRoot = document.querySelector("#dynamic-objects");

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

    this.boulders = [];
    this.nextBoulderId = 1;
    this.heldBoulder = null;
    this.triggerHeld = false;
    this.wasTriggerPressed = false;

    this.tutorialStage = "steer";
    this.tutorialThrowOutroTime = 0;

    this.tempWorldA = new THREE.Vector3();
    this.tempWorldB = new THREE.Vector3();
    this.tempLocal = new THREE.Vector3();
    this.tempBeamMid = new THREE.Vector3();
    this.tempBeamDir = new THREE.Vector3();

    this.buildGroundMarkers();
    this.bindDesktopControls();
    this.bindTriggerEvents();
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
    this.boulders = this.boulders.filter((boulder) => {
      const shouldRemove = boulder.row === row && boulder.state === "ground";

      if (shouldRemove) {
        boulder.el.remove();
        return false;
      }

      return true;
    });

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

  createBoulder(row, segmentIndex, x, z, scaleSeed) {
    const boulder = document.createElement("a-entity");
    const rockMain = document.createElement("a-sphere");
    const rockSide = document.createElement("a-sphere");
    const shadow = document.createElement("a-circle");
    const scale = 0.26 + this.randomFromSeed(scaleSeed) * 0.16;

    boulder.object3D.position.set(x, 0.02, z);
    boulder.object3D.rotation.y = THREE.MathUtils.degToRad(
      this.randomFromSeed(scaleSeed + 8) * 360
    );

    rockMain.setAttribute("position", "0 0.16 0");
    rockMain.setAttribute("radius", `${scale}`);
    rockMain.setAttribute("scale", "1.18 0.84 1");
    rockMain.setAttribute("color", "#8e877d");
    rockMain.setAttribute("material", "shader: flat");

    rockSide.setAttribute("position", `${scale * 0.32} 0.12 ${-scale * 0.14}`);
    rockSide.setAttribute("radius", `${scale * 0.52}`);
    rockSide.setAttribute("scale", "1 0.82 1.1");
    rockSide.setAttribute("color", "#a29a90");
    rockSide.setAttribute("material", "shader: flat");

    shadow.setAttribute("position", "0 0 0");
    shadow.setAttribute("rotation", "-90 0 0");
    shadow.setAttribute("radius", `${scale * 0.88}`);
    shadow.setAttribute("color", "#2b3620");
    shadow.setAttribute("material", "shader: flat; transparent: true; opacity: 0.16");

    boulder.appendChild(shadow);
    boulder.appendChild(rockMain);
    boulder.appendChild(rockSide);
    row.appendChild(boulder);

    this.boulders.push({
      id: this.nextBoulderId++,
      el: boulder,
      row,
      state: "ground",
      velocity: new THREE.Vector3(),
      spin: new THREE.Vector3(
        (this.randomFromSeed(scaleSeed + 1) - 0.5) * 2,
        (this.randomFromSeed(scaleSeed + 2) - 0.5) * 4,
        (this.randomFromSeed(scaleSeed + 3) - 0.5) * 2
      ),
    });
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

    streamBankLeft.setAttribute("position", `${centerX - width * 0.58} 0.016 0`);
    streamBankLeft.setAttribute("width", `${width * 0.3}`);
    streamBankLeft.setAttribute("height", "0.015");
    streamBankLeft.setAttribute("depth", `${segmentDepth * 1.05}`);
    streamBankLeft.setAttribute("color", "#8bb56b");
    streamBankLeft.setAttribute("material", "shader: flat");

    streamBankRight.setAttribute("position", `${centerX + width * 0.58} 0.016 0`);
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
    streamHighlight.setAttribute(
      "material",
      "shader: flat; transparent: true; opacity: 0.5"
    );

    meadowPatch.setAttribute(
      "position",
      `${centerX + Math.sin(segmentIndex * 0.7) * 1.25} 0.012 ${(this.randomFromSeed(segmentIndex + 90) - 0.5) * 0.35}`
    );
    meadowPatch.setAttribute("rotation", "-90 0 0");
    meadowPatch.setAttribute(
      "radius",
      `${0.18 + this.randomFromSeed(segmentIndex + 33) * 0.24}`
    );
    meadowPatch.setAttribute("color", "#77ad5a");
    meadowPatch.setAttribute(
      "material",
      "shader: flat; transparent: true; opacity: 0.55"
    );

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

    const boulderSideA = this.randomFromSeed(segmentIndex + 120) > 0.5 ? -1 : 1;
    const boulderSideB = this.randomFromSeed(segmentIndex + 121) > 0.5 ? -1 : 1;
    const streamEdge = width * 0.72;
    const boulderX1 =
      centerX + boulderSideA * (streamEdge + 0.85 + this.randomFromSeed(segmentIndex + 122) * 1.1);
    const boulderZ1 = (this.randomFromSeed(segmentIndex + 123) - 0.5) * 0.54;
    this.createBoulder(row, segmentIndex, boulderX1, boulderZ1, segmentIndex + 130);

    if (this.randomFromSeed(segmentIndex + 124) > 0.38) {
      const boulderX2 =
        centerX +
        boulderSideB * (streamEdge + 1.05 + this.randomFromSeed(segmentIndex + 125) * 1.25);
      const boulderZ2 = (this.randomFromSeed(segmentIndex + 126) - 0.5) * 0.5;
      this.createBoulder(row, segmentIndex, boulderX2, boulderZ2, segmentIndex + 140);
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

  bindTriggerEvents() {
    if (this.rightHand) {
      ["triggerdown", "mousedown", "gripdown"].forEach((eventName) => {
        this.rightHand.addEventListener(eventName, () => this.setTriggerHeld(true));
      });

      ["triggerup", "mouseup", "gripup"].forEach((eventName) => {
        this.rightHand.addEventListener(eventName, () => this.setTriggerHeld(false));
      });
    }

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.setTriggerHeld(true);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.setTriggerHeld(false);
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

    this.targetMarker.object3D.position.set(this.shipTarget.x, -0.08, this.shipTarget.z);
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

  setTriggerHeld(isHeld) {
    if (this.triggerHeld === isHeld) {
      return;
    }

    this.triggerHeld = isHeld;

    if (isHeld) {
      this.onTriggerPress();
    } else {
      this.onTriggerRelease();
    }
  },

  onTriggerPress() {
    if (!this.heldBoulder) {
      this.tryAcquireBoulder();
    }
  },

  onTriggerRelease() {
    if (this.heldBoulder) {
      this.launchHeldBoulder();
    }
  },

  pollTriggerControls() {
    const trackedController =
      this.rightHand?.components?.["tracked-controls"]?.controller ||
      this.rightHand?.components?.["tracked-controls-webxr"]?.controller;
    const gamepad = trackedController?.gamepad;
    const buttons = gamepad?.buttons;
    const triggerPressed = Boolean(buttons?.[0]?.pressed || buttons?.[1]?.pressed);

    if (triggerPressed !== this.wasTriggerPressed) {
      this.setTriggerHeld(triggerPressed);
    }

    this.wasTriggerPressed = triggerPressed;
  },

  tryAcquireBoulder() {
    if (!this.ship || !this.playfield) {
      return;
    }

    const shipWorld = this.ship.object3D.getWorldPosition(this.tempWorldA);
    let bestBoulder = null;
    let bestDistance = 1.2;

    this.boulders.forEach((boulder) => {
      if (boulder.state !== "ground") {
        return;
      }

      const worldPosition = boulder.el.object3D.getWorldPosition(this.tempWorldB);
      const distance = shipWorld.distanceTo(worldPosition);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestBoulder = boulder;
      }
    });

    if (!bestBoulder) {
      return;
    }

    const worldPosition = bestBoulder.el.object3D.getWorldPosition(this.tempWorldB);
    this.dynamicRoot.object3D.worldToLocal(this.tempLocal.copy(worldPosition));
    bestBoulder.el.object3D.position.copy(this.tempLocal);
    this.dynamicRoot.appendChild(bestBoulder.el);
    bestBoulder.state = "held";
    bestBoulder.velocity.set(0, 0, 0);
    this.heldBoulder = bestBoulder;

    if (this.tutorialStage === "tractor") {
      this.tutorialStage = "throw";
      this.tutorialTractor?.setAttribute("visible", "false");
      this.tutorialThrow?.setAttribute("visible", "true");
    }
  },

  launchHeldBoulder() {
    if (!this.heldBoulder) {
      return;
    }

    const lateralVelocity = this.shipPosition.x - this.previousShipPosition.x;
    this.heldBoulder.state = "thrown";
    this.heldBoulder.velocity.set(lateralVelocity * 22, 2.6, -10.8);
    this.heldBoulder = null;
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
        this.tutorialStage = "tractor";
        this.tutorialSteer.setAttribute("visible", "false");
        this.tutorialTractor?.setAttribute("visible", "true");
      }
    }
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

  updateHeldBoulder(deltaSeconds) {
    if (!this.heldBoulder) {
      if (this.tractorBeam) {
        this.tractorBeam.setAttribute("visible", "false");
      }

      return;
    }

    const holdTarget = new THREE.Vector3(
      this.shipPosition.x,
      this.shipPosition.y - 0.27,
      this.shipPosition.z + 0.04
    );
    const currentPosition = this.heldBoulder.el.object3D.position;
    const catchUp = 1 - Math.exp(-deltaSeconds * 8);
    currentPosition.lerp(holdTarget, catchUp);
    this.heldBoulder.el.object3D.rotation.x += deltaSeconds * this.heldBoulder.spin.x;
    this.heldBoulder.el.object3D.rotation.y += deltaSeconds * this.heldBoulder.spin.y;
    this.heldBoulder.el.object3D.rotation.z += deltaSeconds * this.heldBoulder.spin.z;

    if (this.tractorBeam) {
      const beamStart = new THREE.Vector3(
        this.shipPosition.x,
        this.shipPosition.y - 0.04,
        this.shipPosition.z + 0.01
      );
      const beamEnd = currentPosition;

      this.tempBeamMid.copy(beamStart).lerp(beamEnd, 0.5);
      this.tempBeamDir.copy(beamEnd).sub(beamStart);

      this.tractorBeam.setAttribute("visible", "true");
      this.tractorBeam.object3D.position.copy(this.tempBeamMid);
      this.tractorBeam.object3D.scale.set(1, this.tempBeamDir.length() / 0.5, 1);
      this.tractorBeam.object3D.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        this.tempBeamDir.clone().normalize()
      );
    }
  },

  registerThrowHit() {
    if (this.tutorialStage !== "throw" || !this.tutorialThrow) {
      return;
    }

    this.tutorialStage = "done";
    this.tutorialThrowOutroTime = 0.32;
  },

  updateThrownBoulders(deltaSeconds) {
    const gravity = 5.4;

    this.boulders = this.boulders.filter((boulder) => {
      if (boulder.state !== "thrown") {
        return true;
      }

      boulder.velocity.y -= gravity * deltaSeconds;
      boulder.el.object3D.position.addScaledVector(boulder.velocity, deltaSeconds);
      boulder.el.object3D.rotation.x += deltaSeconds * boulder.spin.x * 2;
      boulder.el.object3D.rotation.y += deltaSeconds * boulder.spin.y * 2;
      boulder.el.object3D.rotation.z += deltaSeconds * boulder.spin.z * 2;

      if (
        this.tutorialStage === "throw" &&
        this.tutorialThrowTarget &&
        this.tutorialThrow?.getAttribute("visible")
      ) {
        const boulderPosition = boulder.el.object3D.getWorldPosition(this.tempWorldA);
        const targetPosition = this.tutorialThrowTarget.object3D.getWorldPosition(
          this.tempWorldB
        );

        if (boulderPosition.distanceTo(targetPosition) < 0.55) {
          boulder.el.remove();
          this.registerThrowHit();
          return false;
        }
      }

      const expired =
        boulder.el.object3D.position.y < -0.4 ||
        boulder.el.object3D.position.z < this.bounds.minZ - 3;

      if (expired) {
        boulder.el.remove();
        return false;
      }

      return true;
    });
  },

  updateTutorialOutro(deltaSeconds) {
    if (this.tutorialThrowOutroTime <= 0 || !this.tutorialThrow) {
      return;
    }

    this.tutorialThrowOutroTime = Math.max(this.tutorialThrowOutroTime - deltaSeconds, 0);
    const progress = 1 - this.tutorialThrowOutroTime / 0.32;
    const scale = 1 + progress * 1.2;
    const opacity = Math.max(1 - progress, 0);

    this.tutorialThrow.object3D.scale.set(scale, scale, scale);

    if (this.tutorialThrowTarget) {
      this.tutorialThrowTarget.setAttribute(
        "material",
        `shader: flat; emissive: #f4d35e; emissiveIntensity: ${0.65 + progress * 0.35}; transparent: true; opacity: ${opacity}`
      );
    }

    if (this.tutorialThrowRing) {
      this.tutorialThrowRing.setAttribute(
        "material",
        `shader: flat; transparent: true; opacity: ${opacity}`
      );
    }

    if (this.tutorialThrowText) {
      this.tutorialThrowText.setAttribute("opacity", `${opacity}`);
    }

    if (this.tutorialThrowOutroTime === 0) {
      this.tutorialThrow.setAttribute("visible", "false");
    }
  },

  tick(_time, delta) {
    const deltaSeconds = Math.min(delta / 1000, 0.05);

    this.updateTargetFromController();
    this.pollTriggerControls();
    this.updateShip(deltaSeconds);
    this.updateGround(deltaSeconds);
    this.updateHeldBoulder(deltaSeconds);
    this.updateThrownBoulders(deltaSeconds);
    this.updateTutorialOutro(deltaSeconds);

    if (this.targetMarker) {
      const pulse = 1 + Math.sin(performance.now() / 180) * 0.08;
      this.targetMarker.object3D.scale.set(pulse, pulse, pulse);
    }
  },
});
