AFRAME.registerComponent("flight-demo", {
  init() {
    this.rightHand = document.querySelector("#right-hand");
    this.navSurface = document.querySelector("#nav-surface");
    this.ship = document.querySelector("#ship");
    this.targetMarker = document.querySelector("#target-marker");
    this.markerRoot = document.querySelector("#ground-markers");

    this.bounds = {
      minX: -3.4,
      maxX: 3.4,
      minZ: -21.5,
      maxZ: -6.5,
    };

    this.shipTarget = new THREE.Vector3(0, 0.65, -11);
    this.shipPosition = new THREE.Vector3(0, 0.65, -11);
    this.previousShipPosition = this.shipPosition.clone();

    this.scrollRows = [];
    this.rowSpacing = 1.6;
    this.scrollSpeed = 3.8;

    this.buildGroundMarkers();
    this.bindDesktopControls();
    this.updateTargetMarker();
  },

  buildGroundMarkers() {
    const palette = ["#f7ede2", "#f4d35e", "#9ad1d4"];
    const rowCount = 12;

    for (let index = 0; index < rowCount; index += 1) {
      const row = document.createElement("a-entity");
      const lanePositions = [-2.4, 0, 2.4];

      row.object3D.position.set(
        0,
        0.05,
        this.bounds.maxZ - index * this.rowSpacing
      );

      lanePositions.forEach((x, laneIndex) => {
        const marker = document.createElement("a-box");
        marker.setAttribute("position", `${x} 0 0`);
        marker.setAttribute("width", laneIndex === 1 ? "0.65" : "0.45");
        marker.setAttribute("height", "0.05");
        marker.setAttribute("depth", "0.7");
        marker.setAttribute("color", palette[(index + laneIndex) % palette.length]);
        marker.setAttribute("material", "shader: flat");
        row.appendChild(marker);
      });

      const centerStripe = document.createElement("a-box");
      centerStripe.setAttribute("position", "0 0 -0.52");
      centerStripe.setAttribute("width", "0.16");
      centerStripe.setAttribute("height", "0.03");
      centerStripe.setAttribute("depth", "0.65");
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

  setTarget(x, z) {
    const clampedX = THREE.MathUtils.clamp(x, this.bounds.minX, this.bounds.maxX);
    const clampedZ = THREE.MathUtils.clamp(z, this.bounds.minZ, this.bounds.maxZ);

    this.shipTarget.set(clampedX, 0.65, clampedZ);
    this.updateTargetMarker();
  },

  updateTargetMarker() {
    if (!this.targetMarker) {
      return;
    }

    this.targetMarker.object3D.position.set(
      this.shipTarget.x,
      0.08,
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

  tick(time, delta) {
    const deltaSeconds = Math.min(delta / 1000, 0.05);

    this.updateTargetFromController();
    this.updateShip(deltaSeconds);
    this.updateGround(deltaSeconds);

    if (this.targetMarker) {
      const pulse = 1 + Math.sin(time / 180) * 0.08;
      this.targetMarker.object3D.scale.set(pulse, pulse, pulse);
    }
  },
});
