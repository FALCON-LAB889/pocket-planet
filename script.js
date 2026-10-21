import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

// Basic Starfield Generator
const starField = document.getElementById("star-field");
for (let i = 0; i < 60; i++) {
  const star = document.createElement("span");
  star.className = "star";
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.width = star.style.height = (1 + Math.random() * 2) + "px";
  starField.appendChild(star);
}

// Global World Data
const planets = {
  rog: { name: "Planet Rog", desc: "A quiet purple gas/rock world.", color: "#8758ff", surface: "rocky", ring: false, moon: false },
  ember: { name: "Planet Ember", desc: "A molten volcanic planet.", color: "#f58232", surface: "gas", ring: false, moon: false },
  frost: { name: "Planet Frost", desc: "A frozen icy expanse.", color: "#64c9f4", surface: "frozen", ring: false, moon: false }
};

let currentPlanet = "rog";
const customizer = document.getElementById("customizer");
const homeView = document.getElementById("home-view");
const planetName = document.getElementById("planet-name");

// Solar system orbit toggles & clicks
document.querySelectorAll(".orbit-planet").forEach(btn => {
  btn.addEventListener("click", () => selectPlanet(btn.dataset.planet));
});

document.getElementById("back-button").addEventListener("click", () => {
  customizer.hidden = true;
  homeView.hidden = false;
});

function selectPlanet(key) {
  currentPlanet = key;
  planetName.textContent = planets[key].name;
  document.getElementById("name-input").value = planets[key].name;
  document.getElementById("color-input").value = planets[key].color;
  document.getElementById("surface-input").value = planets[key].surface;
  document.getElementById("ring-input").checked = planets[key].ring;
  document.getElementById("moon-input").checked = planets[key].moon;
  
  homeView.hidden = true;
  customizer.hidden = false;
  updateMesh();
}

// 3D Scene Initialization
const preview = document.getElementById("planet-preview");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(400, 400);
preview.appendChild(renderer.domElement);

const material = new THREE.MeshStandardMaterial({ color: "#8758ff", roughness: 0.8 });
const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
scene.add(planetMesh);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 3, 4);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.2));

const controls = new TrackballControls(camera, renderer.domElement);
controls.noZoom = controls.noPan = true;

function updateMesh() {
  const p = planets[currentPlanet];
  material.color.set(p.color);
  renderer.render(scene, camera);
}

// Input Handlers
document.getElementById("color-input").addEventListener("input", (e) => {
  planets[currentPlanet].color = e.target.value;
  updateMesh();
});

document.getElementById("name-input").addEventListener("input", (e) => {
  planets[currentPlanet].name = e.target.value || "My Planet";
  planetName.textContent = planets[currentPlanet].name;
});

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  planetMesh.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();

// ISS Dialog
const issDialog = document.getElementById("iss-dialog");
document.getElementById("iss-button").onclick = () => issDialog.showModal();
document.getElementById("mission-iss-button").onclick = () => issDialog.showModal();

// Telescope Gallery
const teleDialog = document.getElementById("telescope-dialog");
document.getElementById("telescope-button").onclick = () => teleDialog.showModal();
document.getElementById("mission-telescope-button").onclick = () => teleDialog.showModal();

const webbImages = {
  carina: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01GA6KKWG229B16K4Q38CH3BXS.png",
  pillars: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/10/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png",
  cartwheel: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/08/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png",
  "deep-field": "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png"
};

document.getElementById("telescope-target").addEventListener("change", (e) => {
  document.getElementById("telescope-image").src = webbImages[e.target.value] || "";
});