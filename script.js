import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js
function generateStarfield() {
  const container = document.getElementById("starfield-bg");
  if (!container) return;

  for (let i = 0; i < 75; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    const size = 1 + Math.random() * 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = (0.2 + Math.random() * 0.8).toFixed(2);
    container.appendChild(star);
  }
}
generateStarfield();
function createProceduralTexture(type, baseColorHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 256);

  if (type === "rocky") {
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = 4 + Math.random() * 18;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.stroke();
    }
  } else if (type === "gas") {
    for (let y = 0; y < 256; y += 8) {
      const alpha = 0.1 + Math.random() * 0.35;
      ctx.fillStyle = y % 16 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, y, 512, 8 + Math.random() * 4);
    }
  } else if (type === "frozen") {
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 256);
      ctx.lineTo(Math.random() * 512, Math.random() * 256);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
const planetData = {
  rog: {
    name: "Planet ROG",
    desc: "A rocky world with violet basalt formations.",
    color: "#8758ff",
    surface: "rocky",
    ring: false,
    ringStyle: "bands",
    ringColor: "#e8c99b",
    moon: false,
    moonColor: "#c4c9d2",
    moonScale: 1.0
  },
  ember: {
    name: "Planet EMBER",
    desc: "A volcanic planet with swirling thermal bands.",
    color: "#f58232",
    surface: "gas",
    ring: false,
    ringStyle: "bands",
    ringColor: "#e8c99b",
    moon: false,
    moonColor: "#c4c9d2",
    moonScale: 1.0
  },
  frost: {
    name: "Planet FROST",
    desc: "A sub-zero world covered in glacial ice sheets.",
    color: "#64c9f4",
    surface: "frozen",
    ring: false,
    ringStyle: "bands",
    ringColor: "#e8c99b",
    moon: false,
    moonColor: "#c4c9d2",
    moonScale: 1.0
  }
};

let currentPlanet = "rog";
let moonAngle = 0;

const homeView = document.getElementById("home-view");
const customizer = document.getElementById("customizer");
const planetName = document.getElementById("planet-name");
const planetDesc = document.getElementById("planet-description");

const previewContainer = document.getElementById("planet-preview");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 4.8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(360, 360);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

if (previewContainer) {
  previewContainer.appendChild(renderer.domElement);
}

const planetMaterial = new THREE.MeshStandardMaterial({
  color: "#8758ff",
  roughness: 0.75,
  metalness: 0.1
});

const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), planetMaterial);
scene.add(planetMesh);

const ringMaterial = new THREE.MeshStandardMaterial({
  color: "#e8c99b",
  side: THREE.DoubleSide,
  roughness: 0.8
});
const ringMesh = new THREE.Mesh(new THREE.RingGeometry(1.3, 2.0, 64), ringMaterial);
ringMesh.rotation.x = Math.PI / 2.5;
ringMesh.visible = false;
scene.add(ringMesh);

const moonMaterial = new THREE.MeshStandardMaterial({
  color: "#c4c9d2",
  roughness: 0.9
});
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), moonMaterial);
moonMesh.visible = false;
scene.add(moonMesh);

const primaryLight = new THREE.DirectionalLight(0xffffff, 2.2);
primaryLight.position.set(3, 3, 4);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(primaryLight, ambientLight);
const controls = new TrackballControls(camera, renderer.domElement);
controls.noZoom = true;
controls.noPan = true;
controls.rotateSpeed = 2.0;

function updateSolarSystemMap() {
  Object.keys(planetData).forEach((key) => {
    const data = planetData[key];
    const mapNode = document.getElementById(`${key}-planet`);
    if (!mapNode) return;

    mapNode.style.backgroundColor = data.color;
    mapNode.style.boxShadow = `0 0 12px ${data.color}`;

    const label = mapNode.querySelector(".planet-label");
    if (label) {
      label.textContent = data.name;
    }

    let ringEl = mapNode.querySelector(".map-ring-overlay");
    if (data.ring) {
      if (!ringEl) {
        ringEl = document.createElement("span");
        ringEl.className = "map-ring-overlay";
        mapNode.appendChild(ringEl);
      }
      ringEl.style.borderColor = data.ringColor;
    } else if (ringEl) {
      ringEl.remove();
    }

    let moonEl = mapNode.querySelector(".map-moon-overlay");
    if (data.moon) {
      if (!moonEl) {
        moonEl = document.createElement("span");
        moonEl.className = "map-moon-overlay";
        mapNode.appendChild(moonEl);
      }
      moonEl.style.backgroundColor = data.moonColor;
    } else if (moonEl) {
      moonEl.remove();
    }
  });
}

function updatePlanetRender() {
  const p = planetData[currentPlanet];

  planetMaterial.color.set(p.color);
  if (planetMaterial.map) planetMaterial.map.dispose();
  planetMaterial.map = createProceduralTexture(p.surface, p.color);
  planetMaterial.needsUpdate = true;

  ringMesh.visible = p.ring;
  ringMaterial.color.set(p.ringColor);

  if (p.ringStyle === "thin") {
    ringMesh.geometry.dispose();
    ringMesh.geometry = new THREE.RingGeometry(1.4, 1.6, 64);
  } else if (p.ringStyle === "double") {
    ringMesh.geometry.dispose();
    ringMesh.geometry = new THREE.RingGeometry(1.2, 2.2, 64);
  } else {
    ringMesh.geometry.dispose();
    ringMesh.geometry = new THREE.RingGeometry(1.3, 2.0, 64);
  }

  moonMesh.visible = p.moon;
  moonMaterial.color.set(p.moonColor);
  moonMesh.scale.setScalar(p.moonScale);

  renderer.render(scene, camera);
  updateSolarSystemMap();
}

function bindSelectionEvents() {
  const triggers = document.querySelectorAll(".orbit-planet, .planet-select-btn");
  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.planet;
      if (key && planetData[key]) {
        openPlanetEditor(key);
      }
    });
  });
}

const backBtn = document.getElementById("back-button");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    customizer.hidden = true;
    homeView.hidden = false;
  });
}

function openPlanetEditor(key) {
  currentPlanet = key;
  const data = planetData[key];

  if (planetName) planetName.textContent = data.name;
  if (planetDesc) planetDesc.textContent = data.desc;

  const nameIn = document.getElementById("name-input");
  const colorIn = document.getElementById("color-input");
  const surfaceIn = document.getElementById("surface-input");
  const ringIn = document.getElementById("ring-input");
  const ringStyleIn = document.getElementById("ring-style-input");
  const ringColorIn = document.getElementById("ring-color-input");
  const moonIn = document.getElementById("moon-input");
  const moonColorIn = document.getElementById("moon-color-input");
  const moonSizeIn = document.getElementById("moon-size-input");
  const moonSizeVal = document.getElementById("moon-size-value");

  if (nameIn) nameIn.value = data.name;
  if (colorIn) colorIn.value = data.color;
  if (surfaceIn) surfaceIn.value = data.surface;
  if (ringIn) ringIn.checked = data.ring;
  if (ringStyleIn) ringStyleIn.value = data.ringStyle;
  if (ringColorIn) ringColorIn.value = data.ringColor;
  if (moonIn) moonIn.checked = data.moon;
  if (moonColorIn) moonColorIn.value = data.moonColor;
  if (moonSizeIn) moonSizeIn.value = data.moonScale;
  if (moonSizeVal) moonSizeVal.textContent = `${data.moonScale.toFixed(1)}x`;

  homeView.hidden = true;
  customizer.hidden = false;
  updatePlanetRender();
}

bindSelectionEvents();

const colorIn = document.getElementById("color-input");
if (colorIn) {
  colorIn.addEventListener("input", (e) => {
    planetData[currentPlanet].color = e.target.value;
    updatePlanetRender();
  });
}

const surfaceIn = document.getElementById("surface-input");
if (surfaceIn) {
  surfaceIn.addEventListener("change", (e) => {
    planetData[currentPlanet].surface = e.target.value;
    updatePlanetRender();
  });
}

const nameIn = document.getElementById("name-input");
if (nameIn) {
  nameIn.addEventListener("input", (e) => {
    const val = e.target.value || "Planet Node";
    planetData[currentPlanet].name = val;
    if (planetName) planetName.textContent = val;
    updateSolarSystemMap();
  });
}

const ringIn = document.getElementById("ring-input");
if (ringIn) {
  ringIn.addEventListener("change", (e) => {
    planetData[currentPlanet].ring = e.target.checked;
    updatePlanetRender();
  });
}

const ringStyleIn = document.getElementById("ring-style-input");
if (ringStyleIn) {
  ringStyleIn.addEventListener("change", (e) => {
    planetData[currentPlanet].ringStyle = e.target.value;
    updatePlanetRender();
  });
}

const ringColorIn = document.getElementById("ring-color-input");
if (ringColorIn) {
  ringColorIn.addEventListener("input", (e) => {
    planetData[currentPlanet].ringColor = e.target.value;
    updatePlanetRender();
  });
}

const moonIn = document.getElementById("moon-input");
if (moonIn) {
  moonIn.addEventListener("change", (e) => {
    planetData[currentPlanet].moon = e.target.checked;
    updatePlanetRender();
  });
}

const moonColorIn = document.getElementById("moon-color-input");
if (moonColorIn) {
  moonColorIn.addEventListener("input", (e) => {
    planetData[currentPlanet].moonColor = e.target.value;
    updatePlanetRender();
  });
}

const moonSizeIn = document.getElementById("moon-size-input");
const moonSizeVal = document.getElementById("moon-size-value");
if (moonSizeIn) {
  moonSizeIn.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    planetData[currentPlanet].moonScale = val;
    if (moonSizeVal) moonSizeVal.textContent = `${val.toFixed(1)}x`;
    updatePlanetRender();
  });
}

const resetCamBtn = document.getElementById("reset-view-button");
if (resetCamBtn) {
  resetCamBtn.addEventListener("click", () => {
    controls.reset();
  });
}

const exportBtn = document.getElementById("download-planet-button");
const downloadStatus = document.getElementById("download-status");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${planetData[currentPlanet].name.toLowerCase().replace(/\s+/g, "-")}-postcard.png`;
    link.href = dataURL;
    link.click();

    if (downloadStatus) {
      downloadStatus.textContent = "Postcard downloaded successfully!";
      setTimeout(() => { downloadStatus.textContent = ""; }, 3000);
    }
  });
}

const exportBackupBtn = document.getElementById("download-backup-button");
const restoreFileInput = document.getElementById("restore-file-input");
const restoreBackupBtn = document.getElementById("restore-backup-button");
const backupStatus = document.getElementById("backup-status");

if (exportBackupBtn) {
  exportBackupBtn.addEventListener("click", () => {
    const jsonStr = JSON.stringify(planetData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pocket-planet-backup.json";
    link.click();
    URL.revokeObjectURL(url);

    if (backupStatus) {
      backupStatus.textContent = "Backup JSON exported successfully!";
      setTimeout(() => { backupStatus.textContent = ""; }, 3000);
    }
  });
}

if (restoreFileInput && restoreBackupBtn) {
  restoreFileInput.addEventListener("change", () => {
    restoreBackupBtn.disabled = !restoreFileInput.files.length;
  });

  restoreBackupBtn.addEventListener("click", () => {
    const file = restoreFileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        Object.assign(planetData, importedData);
        updatePlanetRender();
        updateSolarSystemMap();
        if (backupStatus) {
          backupStatus.textContent = "System configuration restored!";
          setTimeout(() => { backupStatus.textContent = ""; }, 3000);
        }
      } catch (err) {
        if (backupStatus) backupStatus.textContent = "Error reading JSON backup file.";
      }
    };
    reader.readAsText(file);
  });
}

const pauseBtn = document.getElementById("pause-system-button");
const solarSys = document.getElementById("solar-system");
if (pauseBtn && solarSys) {
  pauseBtn.addEventListener("click", () => {
    const isPaused = solarSys.classList.toggle("is-paused");
    pauseBtn.textContent = isPaused ? "Resume Orbits" : "Freeze Orbits";
  });
}

function animateScene() {
  requestAnimationFrame(animateScene);
  controls.update();

  planetMesh.rotation.y += 0.003;

  if (planetData[currentPlanet].moon) {
    moonAngle += 0.015;
    const radius = 2.4;
    moonMesh.position.x = Math.cos(moonAngle) * radius;
    moonMesh.position.z = Math.sin(moonAngle) * radius;
    moonMesh.position.y = Math.sin(moonAngle * 0.5) * 0.4;
  }

  renderer.render(scene, camera);
}
animateScene();
updateSolarSystemMap();
const issDialog = document.getElementById("iss-dialog");
const issBtn = document.getElementById("iss-button");
const missionIssBtn = document.getElementById("mission-iss-button");

if (issBtn && issDialog) issBtn.onclick = () => issDialog.showModal();
if (missionIssBtn && issDialog) missionIssBtn.onclick = () => issDialog.showModal();

const teleDialog = document.getElementById("telescope-dialog");
const teleBtn = document.getElementById("telescope-button");
const missionTeleBtn = document.getElementById("mission-telescope-button");

if (teleBtn && teleDialog) teleBtn.onclick = () => teleDialog.showModal();
if (missionTeleBtn && teleDialog) missionTeleBtn.onclick = () => teleDialog.showModal();

const spaceArchive = {
  carina: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01GA6KKWG229B16K4Q38CH3BXS.png",
  pillars: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/10/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png",
  cartwheel: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/08/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png",
  "deep-field": "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png"
};

const teleSelect = document.getElementById("telescope-target");
if (teleSelect) {
  teleSelect.addEventListener("change", (e) => {
    const photo = document.getElementById("telescope-image");
    if (photo) photo.src = spaceArchive[e.target.value] || "";
  });
}
