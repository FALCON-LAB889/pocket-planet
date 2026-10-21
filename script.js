// Stars, planet selection, and navigation.
const starField = document.getElementById("star-field");
const starCount = 80;

for (let i = 0; i < starCount; i++) {
  const star = document.createElement("span");
  star.className = "star";
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";

  const size = 1 + Math.random() * 2;
  star.style.width = size + "px";
  star.style.height = size + "px";
  star.style.animationDuration = 2 + Math.random() * 3 + "s";
  star.style.animationDelay = -Math.random() * 8 + "s";

  if (i % 4 === 0) star.classList.add("star--fading");
  if (i % 8 === 1) star.classList.add("star--sparkle");
  starField.appendChild(star);
}

const planets = {
  rog: { name: "Planet Rog", description: "A quiet world with purple skies." },
  ember: { name: "Planet Ember", description: "A fiery world with glowing volcanic landscapes." },
  frost: { name: "Planet Frost", description: "An icy world beneath pale blue skies." },
};

const planetName = document.getElementById("planet-name");
const planetDescription = document.getElementById("planet-description");
const planetTargets = document.querySelectorAll(".orbit-planet[data-planet]");
const solarSystem = document.getElementById("solar-system");
const planetSelection = document.getElementById("planet-selection");
const customizer = document.getElementById("customizer");
const backButton = document.getElementById("back-button");

let lastSelectedPlanet;
let selectedPlanetKey = "rog";
const nameInput = document.getElementById("name-input");
const telescopeLauncher = document.getElementById("telescope-button");
const homeView = document.getElementById("home-view");
const pauseSystemButton = document.getElementById("pause-system-button");

pauseSystemButton.addEventListener("click", function () {
  const paused = solarSystem.classList.toggle("is-manually-paused");
  pauseSystemButton.setAttribute("aria-pressed", String(paused));
  pauseSystemButton.textContent = paused ? "Resume planets" : "Pause planets";
});

const guideLink = document.getElementById("guide-link");
guideLink.addEventListener("click", function () {
  document.getElementById("explorer-guide").open = true;
});

document.querySelector(".brand").addEventListener("click", function (event) {
  if (!customizer.hidden) {
    event.preventDefault();
    backButton.click();
    homeView.scrollIntoView({ block: "start" });
  }
});

function syncWorldLabel(key) {
  const label = document.querySelector('[data-world-label="' + key + '"]');
  if (label) label.textContent = planets[key].name;
}

function updateModalState() {
  document.body.classList.toggle(
    "has-modal",
    Boolean(document.querySelector("dialog[open]")),
  );
}

new MutationObserver(updateModalState).observe(document.body, {
  subtree: true,
  attributes: true,
  attributeFilter: ["open"],
});
updateModalState();

planetTargets.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedPlanet = planets[button.dataset.planet];
    selectedPlanetKey = button.dataset.planet;
    nameInput.value = selectedPlanet.name;
    planetName.textContent = selectedPlanet.name;
    planetDescription.textContent = selectedPlanet.description;

    lastSelectedPlanet = button;
    solarSystem.hidden = true;
    planetSelection.hidden = true;
    customizer.hidden = false;
    homeView.hidden = true;
    telescopeLauncher.hidden = true;

    nameInput.focus();
    customizer.scrollIntoView({ block: "start" });
  });

  button.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      button.click();
    }
  });
});

backButton.addEventListener("click", function () {
  customizer.hidden = true;
  solarSystem.hidden = false;
  planetSelection.hidden = false;
  telescopeLauncher.hidden = false;
  homeView.hidden = false;
  if (lastSelectedPlanet) lastSelectedPlanet.focus();
});

// ISS Stream Handler
(function () {
  const station = document.getElementById("iss-button");
  const dialog = document.getElementById("iss-dialog");
  const status = document.getElementById("iss-status");
  const retry = document.getElementById("iss-retry");
  const audio = document.getElementById("iss-audio");
  const provider = document.getElementById("iss-provider");
  const sourceLink = document.getElementById("iss-source");
  const feeds = {
    sen: { id: "fO9e9jnhYK8", name: "Sen" },
    nasa: { id: "awQzjn72bI0", name: "NASA" },
  };
  let player = null;
  let apiPromise = null;
  let attempt = 0;
  let playbackTimer;
  let opener = station;

  function loadPlayerAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (resolve, reject) {
      const timer = setTimeout(function () {
        apiPromise = null;
        reject(new Error("Player library timed out"));
      }, 15000);
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        clearTimeout(timer);
        resolve();
        if (typeof previousReady === "function") previousReady();
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = function () {
        clearTimeout(timer);
        apiPromise = null;
        tag.remove();
        reject(new Error("Player library could not load"));
      };
      document.head.appendChild(tag);
    });
    return apiPromise;
  }

  function stopPlayer() {
    clearTimeout(playbackTimer);
    audio.disabled = true;
    audio.textContent = "Enable sound";
    if (player) {
      player.destroy();
      player = null;
    }
    document.querySelector(".iss-screen").replaceChildren();
    const mount = document.createElement("div");
    mount.id = "iss-video";
    document.querySelector(".iss-screen").appendChild(mount);
  }

  async function connect() {
    const request = ++attempt;
    const feed = feeds[provider.value];
    sourceLink.href = "https://www.youtube.com/watch?v=" + feed.id;
    stopPlayer();
    status.textContent = "Connecting to " + feed.name + "'s YouTube stream…";
    try {
      await loadPlayerAPI();
      if (!dialog.open || request !== attempt) return;
      const vars = { autoplay: 1, playsinline: 1, controls: 1 };
      if (location.protocol === "https:" || location.protocol === "http:")
        vars.origin = location.origin;
      player = new YT.Player("iss-video", {
        videoId: feed.id,
        playerVars: vars,
        events: {
          onReady: function (event) {
            if (!dialog.open || request !== attempt) return;
            const iframe = event.target.getIframe();
            iframe.title = feed.name + " ISS camera stream";
            iframe.setAttribute(
              "allow",
              "autoplay; encrypted-media; picture-in-picture; fullscreen",
            );
            iframe.setAttribute(
              "referrerpolicy",
              "strict-origin-when-cross-origin",
            );
            event.target.mute();
            event.target.playVideo();
            audio.disabled = false;
            status.textContent =
              "Player ready. If it does not start automatically, press Play.";
          },
          onStateChange: function (event) {
            if (!dialog.open || request !== attempt) return;
            if (event.data === 1) {
              clearTimeout(playbackTimer);
              status.textContent =
                feed.name +
                " stream playing · Check the video labels for live or recorded views.";
            } else if (event.data === 2) {
              clearTimeout(playbackTimer);
              status.textContent = "Video paused · Press Play to continue.";
            } else if (event.data === 3)
              status.textContent = "Buffering " + feed.name + "'s stream…";
            else if (event.data === 0) {
              clearTimeout(playbackTimer);
              status.textContent =
                "This broadcast has ended. Check NASA's current viewing links below.";
            }
          },
          onAutoplayBlocked: function () {
            if (!dialog.open || request !== attempt) return;
            clearTimeout(playbackTimer);
            status.textContent =
              "Your browser blocked autoplay. Press Play in the video to start.";
          },
          onError: function (event) {
            if (!dialog.open || request !== attempt) return;
            clearTimeout(playbackTimer);
            const messages = {
              100: "This stream is unavailable or has been removed. Check NASA's current viewing links.",
              101: "The provider has disabled embedding. Use Open official stream.",
              150: "The provider has disabled embedding. Use Open official stream.",
              153: "YouTube could not identify this website. Open Pocket Planet with VS Code Live Server rather than double-clicking the HTML file.",
            };
            status.textContent =
              messages[event.data] ||
              "Playback error " +
                event.data +
                ". Try Reconnect or Open official stream.";
          },
        },
      });
      playbackTimer = setTimeout(function () {
        if (dialog.open && request === attempt)
          status.textContent =
            "If the player is still blank, try Reconnect or Open official stream. Network or browser settings may block playback.";
      }, 20000);
    } catch (error) {
      if (dialog.open && request === attempt)
        status.textContent =
          "Could not load YouTube. Check your connection, then reconnect or open the official stream.";
    }
  }

  station.addEventListener("click", function () {
    const cardButton = document.getElementById("mission-iss-button");
    opener = document.activeElement === cardButton ? cardButton : station;
    if (!dialog.open) dialog.showModal();
    connect();
  });
  retry.addEventListener("click", connect);
  provider.addEventListener("change", connect);
  audio.addEventListener("click", function () {
    if (!player) return;
    if (player.isMuted()) {
      player.unMute();
      audio.textContent = "Mute sound";
    } else {
      player.mute();
      audio.textContent = "Enable sound";
    }
  });
  dialog.addEventListener("close", function () {
    ++attempt;
    stopPlayer();
    opener.focus();
  });
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
})();

// Three.js 3D Preview Engine
async function initializePlanetPreview() {
  const THREE = await import("three");
  const { TrackballControls } = await import(
    "three/addons/controls/TrackballControls.js"
  );

  const preview = document.getElementById("planet-preview");
  const colorInput = document.getElementById("color-input");
  const ringInput = document.getElementById("ring-input");
  const ringColorInput = document.getElementById("ring-color-input");
  const ringStyleInput = document.getElementById("ring-style-input");

  const planetRingStyles = { rog: "bands", ember: "bands", frost: "bands" };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const downloadButton = document.getElementById("download-planet-button");
  const downloadStatus = document.getElementById("download-status");

  downloadButton.addEventListener("click", function () {
    downloadButton.disabled = true;
    downloadStatus.textContent = "Creating your postcard…";

    try {
      const card = document.createElement("canvas");
      card.width = 1200;
      card.height = 900;
      const ctx = card.getContext("2d");

      if (!ctx) throw new Error("Image creation is unavailable.");

      const sky = ctx.createLinearGradient(0, 0, 1200, 900);
      sky.addColorStop(0, "#080d24");
      sky.addColorStop(0.5, "#191332");
      sky.addColorStop(1, "#06202a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, card.width, card.height);

      for (let i = 0; i < 100; i++) {
        const x = (i * 137.51) % card.width;
        const y = (i * 83.79) % card.height;
        ctx.fillStyle = i % 4 === 0 ? "#bce7ff" : "#ffffff80";
        ctx.beginPath();
        ctx.arc(x, y, i % 5 === 0 ? 2 : 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.textAlign = "center";
      ctx.fillStyle = "#bce7ff";
      ctx.font = "20px Arial";
      ctx.fillText("P O C K E T   P L A N E T", 600, 75);

      drawPreview();
      const source = renderer.domElement;
      const scale = Math.min(1000 / source.width, 600 / source.height);
      const width = source.width * scale;
      const height = source.height * scale;

      ctx.drawImage(
        source,
        (card.width - width) / 2,
        120 + (600 - height) / 2,
        width,
        height,
      );

      const name = planets[selectedPlanetKey].name;
      let fontSize = 48;
      ctx.font = `${fontSize}px Arial`;

      while (ctx.measureText(name).width > 1050 && fontSize > 20) {
        fontSize -= 2;
        ctx.font = `${fontSize}px Arial`;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillText(name, 600, 790);

      ctx.fillStyle = "#a9bbd0";
      ctx.font = "20px Arial";
      ctx.fillText("A tiny universe, made by me.", 600, 838);

      card.toBlob(function (blob) {
        downloadButton.disabled = false;
        if (!blob) {
          downloadStatus.textContent = "Could not create the image. Please try again.";
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const filename =
          name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "my-planet";

        link.href = url;
        link.download = filename + "-postcard.png";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
        downloadStatus.textContent = "Postcard created. Check your browser downloads.";
      }, "image/png");
    } catch (error) {
      console.error("Postcard export failed:", error);
      downloadButton.disabled = false;
      downloadStatus.textContent = "Could not create the postcard. Please try again.";
    }
  });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  preview.appendChild(renderer.domElement);
  camera.position.set(0, 0, 4.7);

  const controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2.5;
  controls.noZoom = true;
  controls.noPan = true;
  controls.staticMoving = true;

  controls.addEventListener("change", function () {
    renderer.render(scene, camera);
  });

  function resetView() {
    controls.reset();
    drawPreview();
  }

  renderer.domElement.addEventListener("dblclick", resetView);
  document.getElementById("reset-view-button").addEventListener("click", resetView);

  const material = new THREE.MeshStandardMaterial({
    color: "#8758ff",
    roughness: 0.8,
    metalness: 0,
  });
  const planetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 128, 96),
    material,
  );
  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;
  scene.add(planetMesh);

  // Atmosphere and Clouds Setup
  const planetAtmospheres = { rog: false, ember: false, frost: false };
  const planetCloudCoverage = { rog: 35, ember: 35, frost: 35 };

  const atmospherePanel = document.createElement("fieldset");
  atmospherePanel.className = "editor-fieldset";
  atmospherePanel.innerHTML = `
    <legend>04 / Atmosphere</legend>
    <label class="toggle-row" for="atmosphere-input">
        <span>Add atmosphere</span>
        <input type="checkbox" id="atmosphere-input">
    </label>
    <label for="cloud-coverage-input">Cloud coverage</label>
    <input type="range" id="cloud-coverage-input" min="0" max="100" step="1" value="35" disabled>
    <output id="cloud-coverage-value" for="cloud-coverage-input">35%</output>
    <label class="toggle-row" for="storm-input">
        <span>Enable storms</span>
        <input type="checkbox" id="storm-input">
    </label>
    <label for="storm-strength-input">Storm strength</label>
    <input type="range" id="storm-strength-input" min="0" max="100" step="5" value="35" disabled>
    <output id="storm-strength-value" for="storm-strength-input">35%</output>
    <p class="field-help">Enable atmosphere and add clouds to see storms.</p>
    <p class="field-help">Set coverage to zero for just the blue atmosphere.</p>
  `;

  document.getElementById("save-status").before(atmospherePanel);

  const atmosphereInput = document.getElementById("atmosphere-input");
  const cloudCoverageInput = document.getElementById("cloud-coverage-input");
  const cloudCoverageValue = document.getElementById("cloud-coverage-value");
  cloudCoverageInput.style.width = "100%";
  cloudCoverageInput.style.accentColor = "#9cddff";

  const cloudCanvas = document.createElement("canvas");
  cloudCanvas.width = 512;
  cloudCanvas.height = 256;
  const cloudContext = cloudCanvas.getContext("2d");
  let cloudSeed = 47;

  function cloudRandom() {
    cloudSeed = (Math.imul(cloudSeed, 1664525) + 1013904223) >>> 0;
    return cloudSeed / 4294967296;
  }

  for (let i = 0; i < 180; i++) {
    const x = cloudRandom() * 512;
    const y = 16 + cloudRandom() * 224;
    const radius = 8 + cloudRandom() * 25;

    for (const offset of [-512, 0, 512]) {
      cloudContext.save();
      cloudContext.translate(x + offset, y);
      cloudContext.scale(1.5, 0.65);

      const patch = cloudContext.createRadialGradient(0, 0, 0, 0, 0, radius);
      patch.addColorStop(0, "rgba(255,255,255,0.85)");
      patch.addColorStop(0.4, "rgba(255,255,255,0.55)");
      patch.addColorStop(1, "rgba(255,255,255,0)");

      cloudContext.fillStyle = patch;
      cloudContext.fillRect(-radius, -radius, radius * 2, radius * 2);
      cloudContext.restore();
    }
  }

  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  cloudTexture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.wrapS = THREE.RepeatWrapping;
  const cloudImage = cloudCanvas.toDataURL();

  const cloudMaterial = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    depthWrite: false,
    roughness: 1,
    opacity: 0.85,
    alphaTest: 0.005,
  });

  const cloudCutoff = { value: 0.45 };
  cloudMaterial.onBeforeCompile = function (shader) {
    shader.uniforms.cloudCutoff = cloudCutoff;
    shader.fragmentShader =
      "uniform float cloudCutoff;\n" +
      shader.fragmentShader.replace(
        "#include <alphatest_fragment>",
        "diffuseColor.a = smoothstep(cloudCutoff, cloudCutoff + 0.20, diffuseColor.a);\n#include <alphatest_fragment>",
      );
  };

  const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 48), cloudMaterial);
  const atmosphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.055, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#78caff") } },
      vertexShader: `
            varying vec3 surfaceNormal;
            varying vec3 viewDirection;
            void main() {
                vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
                surfaceNormal = normalize(normalMatrix * normal);
                viewDirection = -viewPosition.xyz;
                gl_Position = projectionMatrix * viewPosition;
            }
        `,
      fragmentShader: `
            uniform vec3 glowColor;
            varying vec3 surfaceNormal;
            varying vec3 viewDirection;
            void main() {
                float facing = abs(dot(normalize(surfaceNormal), normalize(viewDirection)));
                float rim = pow(1.0 - facing, 2.5);
                gl_FragColor = vec4(glowColor, rim * 0.55);
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }
        `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  atmosphereMesh.renderOrder = 1;
  cloudMesh.visible = false;
  atmosphereMesh.visible = false;
  planetMesh.add(cloudMesh, atmosphereMesh);

  function syncMenuAtmosphere(key) {
    const smallPlanet = document.getElementById(key + "-planet");
    let clouds = smallPlanet.querySelector(".menu-atmosphere-clouds");

    if (!clouds) {
      clouds = document.createElement("span");
      clouds.className = "menu-atmosphere-clouds";
      clouds.setAttribute("aria-hidden", "true");
      clouds.style.cssText = `
            position: absolute;
            inset: 0;
            border-radius: 50%;
            pointer-events: none;
            z-index: 2;
            background: url("${cloudImage}") center / cover;
        `;
      smallPlanet.appendChild(clouds);
    }

    clouds.hidden = !planetAtmospheres[key] || planetCloudCoverage[key] === 0;
    clouds.style.opacity = String((planetCloudCoverage[key] / 100) * 0.8);
    if (planetAtmospheres[key]) {
      smallPlanet.style.boxShadow += ", 0 0 18px #78caff90";
    }
  }

  function updateAtmosphere(key) {
    const saveMessage = document.getElementById("save-status");
    if (atmospherePanel.nextElementSibling !== saveMessage) {
      saveMessage.before(atmospherePanel);
    }

    const enabled = planetAtmospheres[key];
    const coverage = planetCloudCoverage[key];

    atmosphereInput.checked = enabled;
    cloudCoverageInput.disabled = !enabled;
    cloudCoverageInput.value = coverage;
    cloudCoverageValue.textContent = coverage + "%";

    atmosphereMesh.visible = enabled;
    cloudMesh.visible = enabled && coverage > 0;
    cloudCutoff.value = (1 - coverage / 100) * 0.7;
    updateStormControls();
  }

  atmosphereInput.addEventListener("change", function () {
    planetAtmospheres[selectedPlanetKey] = atmosphereInput.checked;
    updateAtmosphere(selectedPlanetKey);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  cloudCoverageInput.addEventListener("input", function () {
    planetCloudCoverage[selectedPlanetKey] = Number(cloudCoverageInput.value);
    updateAtmosphere(selectedPlanetKey);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  // Meteor System
  const moonInput = document.getElementById("moon-input");
  let meteorAimButton = document.getElementById("meteor-aim-button");
  if (!meteorAimButton) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "editor-fieldset";
    fieldset.innerHTML =
      '<legend>03 / Meteor experiment</legend><button type="button" id="meteor-aim-button" aria-pressed="false">Choose impact point</button><button type="button" id="meteor-launch-button" disabled>Launch meteor</button><p id="meteor-status" class="field-help" role="status"></p>';
    document.querySelector(".settings-panel").appendChild(fieldset);
    meteorAimButton = fieldset.querySelector("#meteor-aim-button");
  }

  const meteorLaunchButton = document.getElementById("meteor-launch-button");
  const meteorStatus = document.getElementById("meteor-status");
  const meteorPanel = meteorAimButton.closest("fieldset") || meteorAimButton.parentElement;
  const meteorActions = document.createElement("div");
  meteorActions.className = "preview-actions";
  meteorAimButton.before(meteorActions);
  meteorActions.append(meteorAimButton, meteorLaunchButton);

  const existingSaveStatus = document.getElementById("save-status");
  if (
    meteorPanel.tagName === "FIELDSET" &&
    existingSaveStatus?.parentElement === meteorPanel.parentElement
  ) {
    existingSaveStatus.before(meteorPanel);
  }

  const extraMeteorControls = document.createElement("div");
  extraMeteorControls.innerHTML =
    '<label for="meteor-size-input">Meteor size</label><select id="meteor-size-input"><option value="small">Small</option><option value="medium" selected>Medium</option><option value="large">Large</option></select><div class="preview-actions"><button type="button" id="meteor-centre-button">Target centre</button><button type="button" id="meteor-reset-button">Clear impacts</button></div><p class="field-help">A visual experiment, not to scale. Rocky and icy worlds keep craters; gas worlds show a cloud burst. The latest 16 craters stay saved on each world.</p>';
  meteorPanel.appendChild(extraMeteorControls);

  const meteorSizeInput = document.getElementById("meteor-size-input");
  const meteorResetButton = document.getElementById("meteor-reset-button");
  const meteorCentreButton = document.getElementById("meteor-centre-button");

  const meteorPresets = {
    small: { radius: 0.12, depth: 0.035, scale: 0.75 },
    medium: { radius: 0.18, depth: 0.06, scale: 1 },
    large: { radius: 0.25, depth: 0.085, scale: 1.3 },
  };

  const planetCraters = { rog: [], ember: [], frost: [] };
  const impactGeometries = {
    rog: planetMesh.geometry,
    ember: planetMesh.geometry.clone(),
    frost: planetMesh.geometry.clone(),
  };

  const geometrySignatures = {};
  const craterDesigns = {};
  let meteorAiming = false;
  let meteorTarget = null;
  let meteorFlight = null;
  const meteorRaycaster = new THREE.Raycaster();
  const meteorPointer = new THREE.Vector2();
  let meteorSeed = 91;

  function meteorRandom() {
    meteorSeed = (Math.imul(meteorSeed, 1664525) + 1013904223) >>> 0;
    return meteorSeed / 4294967296;
  }

  function meteorTexture(kind) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = kind === "trail" ? 64 : 256;
    const ctx = canvas.getContext("2d");

    if (kind === "rock" || kind === "heat") {
      ctx.fillStyle = kind === "rock" ? "#706357" : "#000000";
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < (kind === "rock" ? 2200 : 30); i++) {
        const x = meteorRandom() * 256, y = meteorRandom() * 256;
        if (kind === "rock") {
          const shade = Math.floor(55 + meteorRandom() * 100);
          ctx.fillStyle = `rgb(${shade},${shade * 0.88},${shade * 0.72})`;
          ctx.fillRect(x, y, 2 + meteorRandom() * 4, 2 + meteorRandom() * 4);
        } else {
          ctx.fillStyle = "#ffc278";
          ctx.fillRect(x, y, 2, 3 + meteorRandom() * 7);
        }
      }
    } else {
      const pixels = ctx.createImageData(canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const nx = x / canvas.width, ny = (y / canvas.height - 0.5) * 2;
          const opacity =
            kind === "trail"
              ? Math.pow(nx, 1.4) * Math.exp((-ny * ny) / (0.006 + nx * 0.065)) * Math.min(1, (1 - nx) * 16)
              : Math.pow(Math.max(0, 1 - Math.hypot(nx * 2 - 1, ny)), 2.5);
          const index = (y * canvas.width + x) * 4;
          pixels.data[index] = 255;
          pixels.data[index + 1] = kind === "trail" ? 90 + nx * 150 : 205;
          pixels.data[index + 2] = kind === "trail" ? 20 + nx * 170 : 135;
          pixels.data[index + 3] = opacity * 255;
        }
      }
      ctx.putImageData(pixels, 0, 0);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const rockTexture = meteorTexture("rock");
  const meteorGeometry = new THREE.IcosahedronGeometry(0.065, 2);
  const rockPositions = meteorGeometry.attributes.position;
  for (let i = 0; i < rockPositions.count; i++) {
    const x = rockPositions.getX(i), y = rockPositions.getY(i), z = rockPositions.getZ(i);
    const roughness = 1 + 0.13 * Math.sin(x * 170 + y * 93) * Math.cos(z * 141);
    rockPositions.setXYZ(i, x * roughness, y * roughness, z * roughness);
  }
  meteorGeometry.computeVertexNormals();

  const meteorMesh = new THREE.Mesh(
    meteorGeometry,
    new THREE.MeshStandardMaterial({
      map: rockTexture,
      bumpMap: rockTexture,
      bumpScale: 0.008,
      emissiveMap: meteorTexture("heat"),
      emissive: "#ff812c",
      emissiveIntensity: 2.5,
      roughness: 0.95,
    }),
  );

  const glowTexture = meteorTexture("glow");
  const meteorGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.55,
    }),
  );

  const meteorTrail = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: meteorTexture("trail"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  const impactFlash = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  const impactWave = new THREE.Mesh(
    new THREE.RingGeometry(0.075, 0.085, 64),
    new THREE.MeshBasicMaterial({
      color: "#ffb668",
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );

  const impactLight = new THREE.PointLight(0xff9d45, 0, 1.8, 2);
  const debrisCount = 36;
  const debrisPositions = new Float32Array(debrisCount * 3);
  const debrisGeometry = new THREE.BufferGeometry();
  debrisGeometry.setAttribute("position", new THREE.BufferAttribute(debrisPositions, 3));

  const impactDebris = new THREE.Points(
    debrisGeometry,
    new THREE.PointsMaterial({
      map: glowTexture,
      size: 0.035,
      color: "#ffc78e",
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  impactDebris.frustumCulled = false;

  const fragmentCount = 12;
  const fragments = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.012, 0),
    new THREE.MeshStandardMaterial({ color: "#78665c", roughness: 1 }),
    fragmentCount,
  );
  fragments.frustumCulled = false;
  const fragmentDummy = new THREE.Object3D();

  const impactMarker = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.0025, 8, 40),
    new THREE.MeshBasicMaterial({ color: "#ffb56b" }),
  );

  planetMesh.add(impactMarker);
  scene.add(
    meteorMesh,
    meteorGlow,
    meteorTrail,
    impactFlash,
    impactWave,
    impactLight,
    impactDebris,
    fragments,
  );

  const meteorObjects = [
    meteorMesh,
    meteorGlow,
    meteorTrail,
    impactFlash,
    impactWave,
    impactDebris,
    fragments,
  ];

  meteorObjects.forEach((object) => { object.visible = false; });
  impactMarker.visible = false;

  function craterSignature(key) {
    return planetSurfaces[key] + JSON.stringify(planetCraters[key]);
  }

  function rebuildImpactGeometry(key) {
    const signature = craterSignature(key);
    const geometry = impactGeometries[key];
    if (geometrySignatures[key] === signature) return geometry;

    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const normal = new THREE.Vector3();
    const craters = (planetSurfaces[key] === "gas" ? [] : planetCraters[key]).map((crater) => ({
      normal: new THREE.Vector3(...crater.normal),
      preset: meteorPresets[crater.size],
    }));

    for (let i = 0; i < positions.count; i++) {
      normal.fromBufferAttribute(positions, i).normalize();
      let radius = 1, scorch = 0;
      for (const crater of craters) {
        const angle = Math.acos(THREE.MathUtils.clamp(normal.dot(crater.normal), -1, 1));
        const preset = crater.preset;
        const distance = angle / preset.radius;
        if (distance > 1.4) continue;
        const bowl = distance < 1 ? Math.pow(1 - distance * distance, 2) : 0;
        const rim = Math.exp(-Math.pow((distance - 0.96) / 0.15, 2));
        radius += -preset.depth * bowl + preset.depth * 0.26 * rim;
        scorch = Math.max(scorch, 0.25 * Math.exp(-distance * distance * 1.8));
      }
      positions.setXYZ(
        i,
        normal.x * Math.max(0.8, radius),
        normal.y * Math.max(0.8, radius),
        normal.z * Math.max(0.8, radius),
      );
      colors.fill(1 - scorch, i * 3, i * 3 + 3);
    }
    positions.needsUpdate = true;
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometrySignatures[key] = signature;
    return geometry;
  }

  function getImpactDesign(key) {
    const base = surfaceDesigns[planetSurfaces[key]];
    if (planetSurfaces[key] === "gas" || !planetCraters[key].length) return base;
    const signature = craterSignature(key);
    if (craterDesigns[key]?.signature === signature) return craterDesigns[key];

    if (craterDesigns[key]) {
      craterDesigns[key].texture.dispose();
      craterDesigns[key].bumpTexture.dispose();
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(base.texture.image, 0, 0);

    for (const crater of planetCraters[key]) {
      const [nx, ny, nz] = crater.normal;
      const longitude = (Math.atan2(nz, -nx) + Math.PI * 2) % (Math.PI * 2);
      const latitude = Math.acos(THREE.MathUtils.clamp(ny, -1, 1));
      const radius = meteorPresets[crater.size].radius;
      const rx = (radius * 512) / (Math.PI * 2 * Math.max(0.12, Math.sin(latitude)));
      const ry = (radius * 256) / Math.PI;

      for (const offset of [-512, 0, 512]) {
        ctx.save();
        ctx.translate((longitude / (Math.PI * 2)) * 512 + offset, (latitude / Math.PI) * 256);
        ctx.scale(rx, ry);
        const shade = ctx.createRadialGradient(-0.15, -0.15, 0, 0, 0, 1.4);
        shade.addColorStop(0, "#77716d");
        shade.addColorStop(0.5, "#66615e");
        shade.addColorStop(0.66, "#b4ada5");
        shade.addColorStop(0.74, "#e4d9c8");
        shade.addColorStop(0.86, "rgba(95,84,74,0.35)");
        shade.addColorStop(1, "rgba(95,84,74,0)");
        ctx.fillStyle = shade;
        ctx.fillRect(-1.5, -1.5, 3, 3);
        ctx.restore();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    return (craterDesigns[key] = { signature, texture, bumpTexture, image: canvas.toDataURL() });
  }

  function setMeteorAiming(active) {
    meteorAiming = active;
    controls.noRotate = active || !!meteorFlight;
    renderer.domElement.style.cursor = active ? "crosshair" : "grab";
    meteorAimButton.textContent = active ? "Cancel aiming" : "Choose impact point";
    meteorAimButton.setAttribute("aria-pressed", String(active));
  }

  function stopMeteor() {
    meteorFlight = null;
    meteorObjects.forEach((object) => { object.visible = false; });
    impactLight.intensity = 0;
    meteorAimButton.disabled = false;
    meteorSizeInput.disabled = false;
    meteorResetButton.disabled = false;
    meteorCentreButton.disabled = false;
    meteorLaunchButton.disabled = !meteorTarget;
    controls.noRotate = meteorAiming;
  }

  function clearMeteorTarget() {
    meteorTarget = null;
    setMeteorAiming(false);
    stopMeteor();
    impactMarker.visible = false;
    meteorStatus.textContent = "Rotate your planet, then choose an impact point.";
    drawPreview();
  }

  function selectMeteorTarget(pointer) {
    camera.updateMatrixWorld();
    planetMesh.updateWorldMatrix(true, false);
    meteorRaycaster.setFromCamera(pointer, camera);
    const hit = meteorRaycaster.intersectObject(planetMesh, false)[0];

    if (!hit) {
      meteorStatus.textContent = "Click directly on the planet, inside its outline.";
      return;
    }

    meteorTarget = planetMesh.worldToLocal(hit.point.clone());
    const normal = meteorTarget.clone().normalize();
    impactMarker.position.copy(meteorTarget).addScaledVector(normal, 0.015);
    impactMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    impactMarker.visible = true;
    setMeteorAiming(false);
    meteorLaunchButton.disabled = false;
    meteorStatus.textContent = "Target locked. Choose a meteor size, then launch.";
    drawPreview();
  }

  meteorAimButton.addEventListener("click", () => {
    if (meteorFlight) return;
    setMeteorAiming(!meteorAiming);
    meteorStatus.textContent = meteorAiming
      ? "Click or tap your planet. Escape cancels aiming."
      : "Aiming cancelled. You can rotate again.";
  });

  meteorCentreButton.addEventListener("click", () => {
    if (!meteorFlight) selectMeteorTarget(new THREE.Vector2(0, 0));
  });

  renderer.domElement.addEventListener(
    "pointerdown",
    (event) => {
      if (!meteorAiming || event.button !== 0) return;
      event.stopImmediatePropagation();
      const bounds = renderer.domElement.getBoundingClientRect();
      meteorPointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      selectMeteorTarget(meteorPointer);
    },
    { capture: true },
  );

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !customizer.hidden &&
      !document.querySelector("dialog[open]") &&
      (meteorAiming || meteorFlight)
    )
      clearMeteorTarget();
  });

  backButton.addEventListener("click", clearMeteorTarget);
  meteorResetButton.addEventListener("click", () => {
    clearMeteorTarget();
    planetCraters[selectedPlanetKey] = [];
    updatePlanetSurface(selectedPlanetKey);
    updateMenuPlanet(selectedPlanetKey);
    saveSettings();
    meteorStatus.textContent = "This world's impact craters have been cleared.";
    drawPreview();
  });

  function applyMeteorImpact(flight) {
    if (flight.impacted) return;
    flight.impacted = true;

    if (planetSurfaces[flight.key] !== "gas") {
      planetCraters[flight.key].push({
        normal: flight.localNormal.toArray(),
        size: flight.size,
      });
      planetCraters[flight.key] = planetCraters[flight.key].slice(-16);
      updatePlanetSurface(flight.key);
      updateMenuPlanet(flight.key);
      saveSettings();
    }
    impactMarker.visible = false;
    meteorTarget = null;
    meteorStatus.textContent =
      planetSurfaces[flight.key] === "gas"
        ? "Cloud burst — gas worlds have no solid surface crater."
        : "Impact! Fragments scatter; a crater remains.";
  }

  meteorLaunchButton.addEventListener("click", () => {
    if (!meteorTarget || meteorFlight) return;
    setMeteorAiming(false);
    planetMesh.updateWorldMatrix(true, false);
    const destination = planetMesh.localToWorld(meteorTarget.clone());
    const normal = destination
      .clone()
      .sub(planetMesh.getWorldPosition(new THREE.Vector3()))
      .normalize();
    const side = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    side.addScaledVector(normal, -side.dot(normal)).normalize();

    if (side.lengthSq() < 0.01) side.set(0, 1, 0).cross(normal).normalize();
    const across = normal.clone().cross(side).normalize();
    const start = destination
      .clone()
      .addScaledVector(normal, 1.6)
      .addScaledVector(side, -1.05)
      .addScaledVector(across, 0.35);

    const direction = destination.clone().sub(start).normalize();
    const view = camera.position.clone().sub(destination).normalize();
    const trailUp = view.clone().cross(direction).normalize();
    const trailNormal = direction.clone().cross(trailUp).normalize();

    meteorTrail.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(direction, trailUp, trailNormal),
    );

    const size = meteorSizeInput.value;
    const scale = meteorPresets[size].scale;
    meteorMesh.scale.setScalar(scale);
    meteorGlow.scale.setScalar(0.23 * scale);
    meteorTrail.scale.set(0.85 * scale, 0.2 * scale, 1);
    impactFlash.position.copy(destination).addScaledVector(normal, 0.04);
    impactWave.position.copy(destination).addScaledVector(normal, 0.025);
    impactWave.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    const velocities = Array.from({ length: debrisCount }, () => {
      const angle = meteorRandom() * Math.PI * 2;
      const spread = 0.2 + meteorRandom() * 0.65;
      return normal
        .clone()
        .multiplyScalar(0.15 + meteorRandom() * 0.45)
        .addScaledVector(side, Math.cos(angle) * spread)
        .addScaledVector(across, Math.sin(angle) * spread)
        .multiplyScalar(scale);
    });

    meteorFlight = {
      key: selectedPlanetKey,
      size,
      scale,
      start,
      destination,
      normal,
      localNormal: meteorTarget.clone().normalize(),
      direction,
      velocities,
      elapsed: 0,
      previousTime: null,
      impacted: false,
    };

    if (reducedMotion.matches) {
      applyMeteorImpact(meteorFlight);
      stopMeteor();
      meteorStatus.textContent =
        planetSurfaces[selectedPlanetKey] === "gas"
          ? "Cloud impact recorded. Motion effects are reduced."
          : "Crater formed. Motion effects are reduced.";
      drawPreview();
      return;
    }

    meteorAimButton.disabled =
      meteorSizeInput.disabled =
      meteorResetButton.disabled =
      meteorCentreButton.disabled =
      meteorLaunchButton.disabled =
        true;
    controls.noRotate = true;
    meteorMesh.visible = meteorGlow.visible = meteorTrail.visible = true;
    meteorMesh.position.copy(start);
    meteorGlow.position.copy(start);
    meteorTrail.position.copy(start).addScaledVector(direction, -0.42 * scale);
    meteorStatus.textContent = "Meteor approaching… Escape cancels the flight.";
    drawPreview();
  });

  function updateMeteor(time) {
    if (!meteorFlight) return false;
    const flight = meteorFlight;
    const delta =
      flight.previousTime === null
        ? 0
        : Math.min(50, Math.max(0, time - flight.previousTime));
    flight.previousTime = time;
    flight.elapsed += delta;
    const flightDuration = 1450;

    if (flight.elapsed < flightDuration) {
      const progress = flight.elapsed / flightDuration;
      meteorMesh.position.lerpVectors(
        flight.start,
        flight.destination,
        progress * (0.8 + progress * 0.2),
      );
      meteorMesh.rotation.x += delta * 0.003;
      meteorMesh.rotation.y += delta * 0.002;
      meteorGlow.position.copy(meteorMesh.position);
      meteorTrail.position
        .copy(meteorMesh.position)
        .addScaledVector(flight.direction, -0.42 * flight.scale);
      impactLight.position.copy(meteorMesh.position);
      impactLight.intensity = 0.65;
    } else {
      applyMeteorImpact(flight);
      meteorMesh.visible = meteorGlow.visible = meteorTrail.visible = false;
      const seconds = (flight.elapsed - flightDuration) / 1000;
      if (seconds > 1.45) {
        stopMeteor();
        meteorStatus.textContent =
          planetSurfaces[flight.key] === "gas"
            ? "Cloud burst complete. Try a rocky or icy surface for lasting craters."
            : `Crater saved on ${planets[flight.key].name}. Rotate to inspect its rim.`;
        return true;
      }
      impactFlash.visible = seconds < 0.25;
      impactFlash.scale.setScalar((0.32 + seconds * 1.6) * flight.scale);
      impactFlash.material.opacity = Math.max(0, 0.85 * (1 - seconds / 0.25));
      impactWave.visible = seconds < 0.6;
      impactWave.scale.setScalar(1 + seconds * 8 * flight.scale);
      impactWave.material.opacity = Math.max(0, 0.42 * (1 - seconds / 0.6));
      impactLight.position.copy(flight.destination).addScaledVector(flight.normal, 0.18);
      impactLight.intensity = 2.6 * Math.exp(-seconds * 7);
      impactDebris.visible = true;
      impactDebris.material.opacity = Math.max(0, 0.85 * (1 - seconds / 1.45));
      fragments.visible = true;

      for (let i = 0; i < debrisCount; i++) {
        const point = flight.destination
          .clone()
          .addScaledVector(flight.normal, 0.035)
          .addScaledVector(flight.velocities[i], seconds)
          .addScaledVector(flight.normal, -0.12 * seconds * seconds);
        debrisPositions.set(point.toArray(), i * 3);

        if (i < fragmentCount) {
          fragmentDummy.position.copy(point);
          fragmentDummy.rotation.set(seconds * (i + 1), seconds * 3, i);
          fragmentDummy.scale.setScalar(
            Math.max(0, 1 - seconds / 1.45) * (0.5 + (i % 4) * 0.3) * flight.scale,
          );
          fragmentDummy.updateMatrix();
          fragments.setMatrixAt(i, fragmentDummy.matrix);
        }
      }
      debrisGeometry.attributes.position.needsUpdate = true;
      fragments.instanceMatrix.needsUpdate = true;
    }
    return true;
  }

  // Moon Controls & Lighting Setup
  const planetMoons = { rog: false, ember: false, frost: false };
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: "#c4c9d2",
    roughness: 1,
    metalness: 0,
  });

  const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 24), moonMaterial);
  moonMesh.position.set(2.1, 0.5, 0);
  moonMesh.castShadow = true;
  moonMesh.receiveShadow = true;
  moonMesh.visible = false;
  scene.add(moonMesh);

  const moonOptions = {
    rog: { size: 1, distance: 2.1, speed: 1, angle: 0 },
    ember: { size: 1, distance: 2.1, speed: 1, angle: 0 },
    frost: { size: 1, distance: 2.1, speed: 1, angle: 0 },
  };

  let lastMoonTime = null;
  const moonSizeInput = document.getElementById("moon-size-input");
  const moonDistanceInput = document.getElementById("moon-distance-input");
  const moonSpeedInput = document.getElementById("moon-speed-input");
  const moonSizeValue = document.getElementById("moon-size-value");
  const moonDistanceValue = document.getElementById("moon-distance-value");
  const moonSpeedValue = document.getElementById("moon-speed-value");

  function placeMoon(key) {
    const settings = moonOptions[key];
    const orbitZ = Math.sin(settings.angle) * settings.distance;
    const tilt = Math.PI / 10;
    moonMesh.position.set(
      Math.cos(settings.angle) * settings.distance,
      orbitZ * Math.sin(tilt),
      orbitZ * Math.cos(tilt),
    );
  }

  function applyMoonOptions(key) {
    const settings = moonOptions[key];
    moonMesh.scale.setScalar(settings.size);
    placeMoon(key);

    moonSizeInput.value = settings.size;
    moonDistanceInput.value = settings.distance;
    moonSpeedInput.value = settings.speed;

    moonSizeValue.textContent = settings.size.toFixed(1) + "×";
    moonDistanceValue.textContent = settings.distance.toFixed(1) + "× planet radius";
    moonSpeedValue.textContent =
      settings.speed.toFixed(2) + "× · " + (12 / settings.speed).toFixed(1) + " seconds per orbit";

    for (const input of [moonSizeInput, moonDistanceInput, moonSpeedInput]) {
      input.disabled = !planetMoons[key];
    }
  }

  function changeMoonOptions() {
    const settings = moonOptions[selectedPlanetKey];
    settings.size = Number(moonSizeInput.value);
    settings.distance = Number(moonDistanceInput.value);
    settings.speed = Number(moonSpeedInput.value);

    applyMoonOptions(selectedPlanetKey);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  }

  for (const input of [moonSizeInput, moonDistanceInput, moonSpeedInput]) {
    input.style.width = "100%";
    input.style.accentColor = "#bce7ff";
    input.addEventListener("input", changeMoonOptions);
  }

  const moonColors = { rog: "#c4c9d2", ember: "#c4c9d2", frost: "#c4c9d2" };
  const moonColorInput = document.getElementById("moon-color-input");

  moonColorInput.addEventListener("input", function () {
    moonColors[selectedPlanetKey] = moonColorInput.value;
    moonMaterial.color.set(moonColorInput.value);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  const ringMesh = new THREE.Group();
  const ringBands = [];
  for (let i = 0; i < 40; i++) {
    if (i === 24 || i === 25) continue;
    const innerRadius = 1.15 + i * 0.014;
    const shade = 0.58 + (0.32 * (Math.sin(i * 1.7) + 1)) / 2;
    const bandMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e8c99b").multiplyScalar(shade),
      side: THREE.DoubleSide,
      roughness: 0.95,
    });
    const band = new THREE.Mesh(
      new THREE.RingGeometry(innerRadius, innerRadius + 0.011, 128),
      bandMaterial,
    );
    band.castShadow = true;
    band.receiveShadow = true;
    ringMesh.add(band);
    ringBands.push({ mesh: band, material: bandMaterial, shade: shade, index: i });
  }

  ringMesh.rotation.order = "ZXY";
  ringMesh.rotation.set(-1.12, 0, 0.35);
  ringMesh.visible = false;
  planetMesh.add(ringMesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const sunlight = new THREE.DirectionalLight(0xfff4e6, 2.2);
  sunlight.position.set(-3, 3, 4);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  Object.assign(sunlight.shadow.camera, {
    left: -2.5, right: 3.5, top: 2.5, bottom: -2.5, near: 0.1, far: 15,
  });
  sunlight.shadow.normalBias = 0.02;
  sunlight.shadow.bias = -0.0002;
  scene.add(sunlight);

  const planetLightAngles = { rog: 315, ember: 315, frost: 315 };
  const daylightPanel = document.createElement("fieldset");
  daylightPanel.className = "editor-fieldset";
  daylightPanel.innerHTML = `
    <legend>05 / Lighting preview</legend>
    <label for="sun-angle-input">Sunlight angle</label>
    <input type="range" id="sun-angle-input" min="0" max="359" step="1" value="315">
    <output id="sun-angle-value" for="sun-angle-input">315°</output>
    <div class="preview-actions">
        <button type="button" id="day-view-button">Day view</button>
        <button type="button" id="night-view-button">Night view</button>
    </div>
    <p class="field-help">Move the light around your world. Day and Night reset the viewing angle.</p>
  `;

  document.getElementById("download-status").after(daylightPanel);

  const sunAngleInput = document.getElementById("sun-angle-input");
  const sunAngleValue = document.getElementById("sun-angle-value");
  sunAngleInput.style.width = "100%";
  sunAngleInput.style.accentColor = "#ffc875";

  function updateDaylight(key) {
    const degrees = planetLightAngles[key];
    const radians = (degrees * Math.PI) / 180;
    sunlight.position.set(Math.sin(radians) * 5, 1.5, Math.cos(radians) * 5);
    sunAngleInput.value = degrees;
    sunAngleValue.textContent = degrees + "°";
  }

  sunAngleInput.addEventListener("input", function () {
    planetLightAngles[selectedPlanetKey] = Number(sunAngleInput.value);
    updateDaylight(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  function chooseLightingView(degrees) {
    planetLightAngles[selectedPlanetKey] = degrees;
    updateDaylight(selectedPlanetKey);
    controls.reset();
    drawPreview();
    saveSettings();
  }

  document.getElementById("day-view-button").addEventListener("click", function () { chooseLightingView(0); });
  document.getElementById("night-view-button").addEventListener("click", function () { chooseLightingView(180); });

  const previewColors = { rog: "#8758ff", ember: "#f58232", frost: "#64c9f4" };
  const planetRings = { rog: false, ember: false, frost: false };
  const ringColors = { rog: "#e8c99b", ember: "#e8c99b", frost: "#e8c99b" };
  const surfaceInput = document.getElementById("surface-input");
  const planetSurfaces = { rog: "rocky", ember: "gas", frost: "frozen" };

  function createSurface(type) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const width = canvas.width, height = canvas.height;

    let seed = { rocky: 107, gas: 211, frozen: 313 }[type];
    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    ctx.fillStyle = type === "frozen" ? "#eeeeee" : "#dddddd";
    ctx.fillRect(0, 0, width, height);

    if (type === "rocky") {
      for (let i = 0; i < 5000; i++) {
        const shade = Math.floor(170 + random() * 65);
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.fillRect(random() * width, random() * height, 2, 2);
      }
      for (let i = 0; i < 90; i++) {
        const x = random() * width, y = random() * height, radius = 2 + random() * 12;
        for (const offset of [-width, 0, width]) {
          const crater = ctx.createRadialGradient(x + offset, y, 0, x + offset, y, radius);
          crater.addColorStop(0, "#777777");
          crater.addColorStop(0.65, "#a5a5a5");
          crater.addColorStop(0.85, "#eeeeee");
          crater.addColorStop(1, "rgba(220,220,220,0)");
          ctx.fillStyle = crater;
          ctx.beginPath();
          ctx.arc(x + offset, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === "gas") {
      for (let y = -8; y < height + 8; y++) {
        const shade = Math.round(205 + 28 * Math.sin(y * 0.17) + 15 * Math.sin(y * 0.43));
        ctx.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const wave = 3 * Math.sin((x / width) * Math.PI * 4) + 1.5 * Math.sin((x / width) * Math.PI * 6);
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      const storm = ctx.createRadialGradient(165, 150, 1, 165, 150, 26);
      storm.addColorStop(0, "#a0a0a0");
      storm.addColorStop(0.65, "#c2c2c2");
      storm.addColorStop(1, "rgba(225,225,225,0)");
      ctx.save();
      ctx.translate(165, 150);
      ctx.scale(1.6, 0.6);
      ctx.translate(-165, -150);
      ctx.fillStyle = storm;
      ctx.fillRect(139, 124, 52, 52);
      ctx.restore();
    } else {
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = `rgba(255,255,255,${random() * 0.3})`;
        ctx.fillRect(random() * width, random() * height, 5, 5);
      }
      ctx.lineCap = "round";
      for (let i = 0; i < 40; i++) {
        let x = random() * width, y = random() * height;
        ctx.strokeStyle = "#a6a6a6";
        ctx.lineWidth = 1 + random();
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let step = 0; step < 7; step++) {
          x += (random() - 0.5) * 32;
          y += 4 + random() * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.colorSpace = THREE.NoColorSpace;
    bumpTexture.wrapS = THREE.RepeatWrapping;
    return { texture, bumpTexture, image: canvas.toDataURL() };
  }

  const surfaceDesigns = {
    rocky: createSurface("rocky"),
    gas: createSurface("gas"),
    frozen: createSurface("frozen"),
  };

  function updatePlanetSurface(key) {
    const type = planetSurfaces[key];
    const design = getImpactDesign(key);
    planetMesh.geometry = rebuildImpactGeometry(key);
    material.vertexColors = true;
    material.map = design.texture;
    material.bumpMap = design.bumpTexture;
    material.bumpScale = { rocky: 0.055, gas: 0.003, frozen: 0.018 }[type];
    material.roughness = type === "frozen" ? 0.45 : 0.9;
    material.needsUpdate = true;
  }

  moonMaterial.map = surfaceDesigns.rocky.texture;
  moonMaterial.bumpMap = surfaceDesigns.rocky.bumpTexture;
  moonMaterial.bumpScale = 0.012;
  moonMaterial.needsUpdate = true;

  const saveStatus = document.getElementById("save-status");
  const storageKey = "pocket-planet-settings-v1";
  const missionStorageKey = "pocket-planet-missions-v1";
  const completedMissions = { rings: false, frozen: false, impact: false };

  try {
    const savedMissions = JSON.parse(localStorage.getItem(missionStorageKey));
    for (const name of Object.keys(completedMissions)) {
      completedMissions[name] = savedMissions?.[name] === true;
    }
  } catch {}

  function updateMissions() {
    const worlds = Object.keys(planets);
    const conditions = {
      rings: worlds.some((k) => planetRings[k] && planetRingStyles[k] === "double" && planetMoons[k]),
      frozen: worlds.some((k) => planetSurfaces[k] === "frozen" && planetAtmospheres[k] && planetCloudCoverage[k] >= 60),
      impact: worlds.some((k) => planetCraters[k].length >= 3),
    };

    let newlyCompleted = false;
    for (const name of Object.keys(completedMissions)) {
      if (conditions[name] && !completedMissions[name]) {
        completedMissions[name] = true;
        newlyCompleted = true;
      }
      const card = document.getElementById("mission-" + name);
      const status = document.getElementById("mission-" + name + "-status");
      if (card && status) {
        card.classList.toggle("is-complete", completedMissions[name]);
        status.textContent = completedMissions[name] ? "Badge unlocked ✓" : "Not completed";
      }
    }

    const total = Object.values(completedMissions).filter(Boolean).length;
    const progress = document.getElementById("mission-progress");
    const counter = document.getElementById("mission-count");
    if (progress) progress.value = total;
    const message = total + " of 3 completed";
    if (counter && counter.textContent !== message) counter.textContent = message;

    if (newlyCompleted) {
      try { localStorage.setItem(missionStorageKey, JSON.stringify(completedMissions)); } catch {}
    }
  }

  const planetStorms = {
    rog: { enabled: false, strength: 35 },
    ember: { enabled: false, strength: 35 },
    frost: { enabled: false, strength: 35 },
  };
  const stormLight = new THREE.PointLight(0xb8dfff, 0, 0.9, 2);
  planetMesh.add(stormLight);

  let stormStartedAt = null;
  let nextStormTime = 0;

  function resetStorm() {
    stormLight.intensity = 0;
    stormStartedAt = null;
    nextStormTime = performance.now() + 1200;
  }

  function updateStorm(time) {
    const previous = stormLight.intensity;
    const settings = planetStorms[selectedPlanetKey];

    if (!settings.enabled || !cloudMesh.visible || settings.strength === 0 || reducedMotion.matches) {
      resetStorm();
      return previous > 0;
    }

    if (stormStartedAt === null && time >= nextStormTime) {
      stormStartedAt = time;
      stormLight.position
        .set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.6, 1)
        .applyQuaternion(camera.quaternion)
        .normalize()
        .multiplyScalar(1.15);
    }

    if (stormStartedAt !== null) {
      const progress = (time - stormStartedAt) / 900;
      if (progress >= 1) {
        stormLight.intensity = 0;
        stormStartedAt = null;
        nextStormTime = time + 4000 + Math.random() * 4000;
      } else {
        stormLight.intensity = Math.sin(progress * Math.PI) ** 2 * (settings.strength / 100) * 0.65;
      }
    }

    return stormLight.intensity !== previous;
  }

  const stormInput = document.getElementById("storm-input");
  const stormStrengthInput = document.getElementById("storm-strength-input");
  const stormStrengthValue = document.getElementById("storm-strength-value");

  function updateStormControls() {
    resetStorm();
    const settings = planetStorms[selectedPlanetKey];
    const cloudsAvailable = planetAtmospheres[selectedPlanetKey] && planetCloudCoverage[selectedPlanetKey] > 0;

    stormInput.checked = settings.enabled;
    stormInput.disabled = !cloudsAvailable;
    stormStrengthInput.value = settings.strength;
    stormStrengthInput.disabled = !cloudsAvailable || !settings.enabled;
    stormStrengthValue.textContent = settings.strength + "%";
  }

  stormInput.addEventListener("change", function () {
    planetStorms[selectedPlanetKey].enabled = stormInput.checked;
    updateStormControls();
    saveSettings();
  });

  stormStrengthInput.addEventListener("input", function () {
    planetStorms[selectedPlanetKey].strength = Number(stormStrengthInput.value);
    updateStormControls();
    saveSettings();
  });

  function saveSettings() {
    updateMissions();
    const worlds = {};
    for (const key of Object.keys(planets)) {
      worlds[key] = {
        name: planets[key].name,
        color: previewColors[key],
        surface: planetSurfaces[key],
        ring: planetRings[key],
        ringStyle: planetRingStyles[key],
        ringColor: ringColors[key],
        moon: planetMoons[key],
        moonColor: moonColors[key],
        moonSize: moonOptions[key].size,
        moonDistance: moonOptions[key].distance,
        moonSpeed: moonOptions[key].speed,
        craters: planetCraters[key],
        atmosphere: planetAtmospheres[key],
        cloudCoverage: planetCloudCoverage[key],
        storm: planetStorms[key],
        lightAngle: planetLightAngles[key],
      };
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, worlds }));
      saveStatus.textContent = "Saved in this browser.";
    } catch {
      saveStatus.textContent = "Changes work for this visit; browser saving is unavailable.";
    }
  }

  function restoreSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || saved.version !== 1 || !saved.worlds) return;
      const isColor = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

      for (const key of Object.keys(planets)) {
        const world = saved.worlds[key];
        if (!world || typeof world !== "object") continue;

        if (world.storm && typeof world.storm === "object") {
          planetStorms[key].enabled = world.storm.enabled === true;
          const strength = world.storm.strength;
          if (typeof strength === "number" && Number.isFinite(strength)) {
            planetStorms[key].strength = Math.max(0, Math.min(100, strength));
          }
        }

        if (typeof world.name === "string" && world.name.trim()) {
          planets[key].name = world.name.trim().slice(0, 30);
        }
        if (isColor(world.color)) previewColors[key] = world.color;
        if (isColor(world.ringColor)) ringColors[key] = world.ringColor;
        if (["rocky", "gas", "frozen"].includes(world.surface)) planetSurfaces[key] = world.surface;
        if (["bands", "thin", "double"].includes(world.ringStyle)) planetRingStyles[key] = world.ringStyle;
        if (typeof world.ring === "boolean") planetRings[key] = world.ring;
        if (typeof world.moon === "boolean") planetMoons[key] = world.moon;
        if (isColor(world.moonColor)) moonColors[key] = world.moonColor;

        for (const [savedName, optionName, min, max] of [
          ["moonSize", "size", 0.6, 1.6],
          ["moonDistance", "distance", 2.1, 3.2],
          ["moonSpeed", "speed", 0.25, 2],
        ]) {
          const value = world[savedName];
          if (typeof value === "number" && Number.isFinite(value)) {
            moonOptions[key][optionName] = Math.max(min, Math.min(max, value));
          }
        }

        if (typeof world.lightAngle === "number" && Number.isFinite(world.lightAngle)) {
          planetLightAngles[key] = Math.round(Math.max(0, Math.min(359, world.lightAngle)));
        }
        if (typeof world.atmosphere === "boolean") planetAtmospheres[key] = world.atmosphere;
        if (typeof world.cloudCoverage === "number" && Number.isFinite(world.cloudCoverage)) {
          planetCloudCoverage[key] = Math.round(Math.max(0, Math.min(100, world.cloudCoverage)));
        }

        if (Array.isArray(world.craters)) {
          planetCraters[key] = world.craters
            .slice(-16)
            .filter(
              (c) =>
                c && Object.hasOwn(meteorPresets, c.size) &&
                Array.isArray(c.normal) && c.normal.length === 3 &&
                c.normal.every((v) => typeof v === "number" && Number.isFinite(v)) &&
                Math.hypot(...c.normal) > 0.5 && Math.hypot(...c.normal) < 1.5,
            )
            .map((c) => ({ size: c.size, normal: new THREE.Vector3(...c.normal).normalize().toArray() }));
        }
      }
      saveStatus.textContent = "Your saved worlds have been restored.";
    } catch {
      saveStatus.textContent = "Changes work for this visit; saved settings could not be loaded.";
    }
  }

  function drawPreview() {
    const width = preview.clientWidth;
    const height = preview.clientHeight;
    if (width === 0 || height === 0) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    const moonReach = moonOptions[selectedPlanetKey].distance + 0.18 * moonOptions[selectedPlanetKey].size + 0.3;
    const viewDistance = planetMoons[selectedPlanetKey]
      ? Math.max(6.5, moonReach / Math.tan((camera.fov * Math.PI) / 360))
      : 4.7;

    camera.position.setLength(viewDistance / Math.min(camera.aspect, 1));
    camera.updateProjectionMatrix();
    controls.handleResize();
    renderer.render(scene, camera);
  }

  function updateMenuPlanet(key) {
    const smallPlanet = document.getElementById(key + "-planet");
    let menuMoon = smallPlanet.querySelector(".menu-moon");

    if (!menuMoon) {
      menuMoon = document.createElement("span");
      menuMoon.className = "menu-moon";
      menuMoon.setAttribute("aria-hidden", "true");
      smallPlanet.appendChild(menuMoon);
    }

    menuMoon.hidden = !planetMoons[key];
    const settings = moonOptions[key];
    menuMoon.style.width = 18 * settings.size + "%";
    menuMoon.style.height = 18 * settings.size + "%";
    const planetWidth = parseFloat(getComputedStyle(smallPlanet).width) || 38;
    menuMoon.style.setProperty("--moon-distance", (planetWidth / 2) * settings.distance + "px");
    menuMoon.style.animationDuration = 12 / settings.speed + "s";
    menuMoon.style.background = `radial-gradient(circle at 30% 30%, #ffffff, ${moonColors[key]} 55%, #1d2438)`;

    const color = previewColors[key];
    smallPlanet.style.background = `radial-gradient(circle at 30% 30%, #ffffff, ${color}, #090d25)`;
    smallPlanet.style.boxShadow = `0 0 12px ${color}`;

    const surface = smallPlanet.querySelector(".planet-surface");
    const design = getImpactDesign(key);
    surface.style.background = `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 40%, rgba(0, 0, 0, 0.75)), url("${design.image}") center / cover, ${color}`;
    surface.style.backgroundBlendMode = "normal, multiply";

    smallPlanet.classList.toggle("has-ring", planetRings[key]);
    smallPlanet.dataset.ringStyle = planetRingStyles[key];
    const ringColor = new THREE.Color(ringColors[key]);
    smallPlanet.style.setProperty("--ring-color", ringColors[key]);
    smallPlanet.style.setProperty("--ring-light", "#" + ringColor.clone().lerp(new THREE.Color("#ffffff"), 0.3).getHexString());
    smallPlanet.style.setProperty("--ring-dark", "#" + ringColor.clone().multiplyScalar(0.5).getHexString());

    syncMenuAtmosphere(key);
  }

  function updateRingStyle(key) {
    const style = planetRingStyles[key];
    for (const band of ringBands) {
      if (style === "thin") band.mesh.visible = band.index >= 30;
      else if (style === "double") band.mesh.visible = band.index < 8 || band.index >= 30;
      else band.mesh.visible = true;
    }
  }

  function updateRingColor(color) {
    for (const band of ringBands) {
      band.material.color.set(color).multiplyScalar(band.shade);
    }
  }

  function showSelectedPreview(key) {
    clearMeteorTarget();
    selectedPlanetKey = key;
    updateAtmosphere(key);
    updateDaylight(key);
    planetName.textContent = planets[key].name;
    syncWorldLabel(key);
    planetDescription.textContent = planets[key].description;
    nameInput.value = planets[key].name;
    ringStyleInput.value = planetRingStyles[key];
    updateRingStyle(key);
    surfaceInput.value = planetSurfaces[key];
    updatePlanetSurface(key);

    moonInput.checked = planetMoons[key];
    moonMesh.visible = planetMoons[key];
    applyMoonOptions(key);
    lastMoonTime = null;
    moonColorInput.value = moonColors[key];
    moonMaterial.color.set(moonColors[key]);
    colorInput.value = previewColors[key];
    material.color.set(previewColors[key]);
    ringInput.checked = planetRings[key];
    ringMesh.visible = planetRings[key];
    ringColorInput.value = ringColors[key];
    updateRingColor(ringColors[key]);
    ringStyleInput.disabled = !planetRings[key];
    ringColorInput.disabled = !planetRings[key];

    updateMenuPlanet(key);
    drawPreview();
  }

  document.querySelectorAll(".orbit-planet[data-planet]").forEach(function (button) {
    button.addEventListener("click", function () {
      showSelectedPreview(button.dataset.planet);
    });
  });

  const resizeObserver = new ResizeObserver(drawPreview);
  resizeObserver.observe(preview);

  nameInput.addEventListener("input", function () {
    const newName = nameInput.value.trim() || "Unnamed planet";
    planets[selectedPlanetKey].name = newName;
    planetName.textContent = newName;
    const planetTarget = document.getElementById(selectedPlanetKey + "-planet");
    planetTarget.setAttribute("aria-label", "Customize " + newName);
    syncWorldLabel(selectedPlanetKey);
    saveSettings();
  });

  colorInput.addEventListener("input", function () {
    previewColors[selectedPlanetKey] = colorInput.value;
    material.color.set(colorInput.value);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  ringInput.addEventListener("change", function () {
    planetRings[selectedPlanetKey] = ringInput.checked;
    ringMesh.visible = ringInput.checked;
    ringStyleInput.disabled = !ringInput.checked;
    ringColorInput.disabled = !ringInput.checked;
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  ringColorInput.addEventListener("input", function () {
    ringColors[selectedPlanetKey] = ringColorInput.value;
    updateRingColor(ringColorInput.value);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  restoreSettings();
  updateMissions();
  for (const button of planetTargets) {
    const key = button.dataset.planet;
    button.setAttribute("aria-label", "Customize " + planets[key].name);
    updateMenuPlanet(key);
    syncWorldLabel(key);
  }
  showSelectedPreview(selectedPlanetKey);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let animationFrame = null;
  function previewIsActive() {
    return !customizer.hidden && !document.hidden && !document.querySelector("dialog[open]");
  }

  function updateRotation(time = 0) {
    animationFrame = null;
    controls.enabled = previewIsActive();
    if (!controls.enabled) return;

    animationFrame = requestAnimationFrame(updateRotation);
    controls.update();
    const meteorChanged = updateMeteor(time);
    const stormChanged = updateStorm(time);
    const moonMoving = moonMesh.visible && !reducedMotion.matches;
    const moonDelta = lastMoonTime === null ? 0 : Math.max(0, (time - lastMoonTime) / 1000);
    lastMoonTime = time;

    if (moonMoving) {
      const settings = moonOptions[selectedPlanetKey];
      settings.angle = (settings.angle + ((moonDelta * Math.PI * 2) / 12) * settings.speed) % (Math.PI * 2);
      placeMoon(selectedPlanetKey);
    }

    const cloudsMoving = cloudMesh.visible && !reducedMotion.matches;
    if (cloudsMoving) cloudMesh.rotation.y = time / 60000;

    if (meteorChanged || moonMoving || cloudsMoving || stormChanged) {
      renderer.render(scene, camera);
    }
  }

  function updatePreviewActivity() {
    lastMoonTime = null;
    controls.enabled = previewIsActive();
    if (controls.enabled && animationFrame === null) {
      animationFrame = requestAnimationFrame(updateRotation);
    } else if (!controls.enabled && animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
      if (meteorFlight) meteorFlight.previousTime = null;
    }
  }

  new MutationObserver(updatePreviewActivity).observe(customizer, { attributes: true, attributeFilter: ["hidden"] });
  new MutationObserver(updatePreviewActivity).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  document.addEventListener("visibilitychange", updatePreviewActivity);
  updatePreviewActivity();

  moonInput.addEventListener("change", function () {
    planetMoons[selectedPlanetKey] = moonInput.checked;
    moonMesh.visible = moonInput.checked;
    applyMoonOptions(selectedPlanetKey);
    lastMoonTime = null;
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  ringStyleInput.addEventListener("change", function () {
    planetRingStyles[selectedPlanetKey] = ringStyleInput.value;
    updateRingStyle(selectedPlanetKey);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  surfaceInput.addEventListener("change", function () {
    planetSurfaces[selectedPlanetKey] = surfaceInput.value;
    updatePlanetSurface(selectedPlanetKey);
    updateMenuPlanet(selectedPlanetKey);
    drawPreview();
    saveSettings();
  });

  solarSystem.addEventListener("pointerenter", function () { solarSystem.classList.add("is-paused"); });
  solarSystem.addEventListener("pointerleave", function () { solarSystem.classList.remove("is-paused"); });
  backButton.addEventListener("click", function () {
    solarSystem.classList.toggle("is-paused", solarSystem.matches(":hover"));
  });

  ["rog", "ember", "frost"].forEach(function (key) {
    const planet = document.getElementById(key + "-planet");
    const label = planet.querySelector(".planet-label") || document.createElement("span");
    label.className = "planet-label";
    label.setAttribute("aria-hidden", "true");
    planet.appendChild(label);

    function updateLabel() {
      label.textContent = planets[key].name;
      planet.setAttribute("aria-label", "Customize " + planets[key].name);
    }

    updateLabel();
    planet.addEventListener("pointerenter", updateLabel);
    planet.addEventListener("focus", updateLabel);
    nameInput.addEventListener("input", updateLabel);
  });
}

initializePlanetPreview()
  .then(function () {
    document.querySelectorAll(".editor-fieldset").forEach(function (fieldset) { fieldset.disabled = false; });
    document.getElementById("reset-view-button").disabled = false;
    document.getElementById("download-planet-button").disabled = false;
    document.getElementById("preview-status").hidden = true;
    if (!customizer.hidden) nameInput.focus();
  })
  .catch(function (error) {
    console.error("Could not initialize the 3D planet preview:", error);
    document.getElementById("preview-status").textContent = "3D error: " + error.message;
  });

// Space Gallery & Telescope Handler
(function () {
  const button = document.getElementById("telescope-button");
  const dialog = document.getElementById("telescope-dialog");
  const target = document.getElementById("telescope-target");
  let image = document.getElementById("telescope-image");
  const caption = document.getElementById("telescope-caption");
  const launchStatus = document.getElementById("telescope-launch-status");
  const photo = document.getElementById("telescope-photo");
  const photoFallback = document.getElementById("telescope-photo-fallback");

  function showPhotoFallback() {
    photo.hidden = true;
    photoFallback.hidden = false;
  }

  photo.addEventListener("error", showPhotoFallback);
  if (photo.complete && !photo.naturalWidth) showPhotoFallback();
  const status = document.getElementById("telescope-status");

  const observations = [
    ["carina", "Cosmic Cliffs", "2022/07/STScI-01GA6KKWG229B16K4Q38CH3BXS.png", "cosmic-cliffs-in-the-carina-nebula-nircam-image", "NASA, ESA, CSA, STScI"],
    ["pillars", "Pillars of Creation", "2022/10/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png", "pillars-of-creation-nircam-image", "NASA, ESA, CSA, STScI; processing: Joseph DePasquale, Anton Koekemoer, Alyssa Pagan"],
    ["cartwheel", "Cartwheel Galaxy", "2022/08/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png", "cartwheel-galaxy-nircam-and-miri-composite-image", "NASA, ESA, CSA, STScI, Webb ERO Production Team"],
    ["southern-ring", "Southern Ring Nebula", "2022/07/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png", "southern-ring-nebula-nircam-image", "NASA, ESA, CSA, STScI"],
    ["quintet", "Stephan’s Quintet", "2022/07/STScI-01G8H49RQ0E48YDM8WKW9PP5XS.png", "stephans-quintet-nircam-and-miri-composite-image", "NASA, ESA, CSA, STScI"],
    ["deep-field", "Webb’s First Deep Field", "2022/07/STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png", "webbs-first-deep-field-nircam-image", "NASA, ESA, CSA, STScI"],
    ["jupiter", "Jupiter", "2023/10/STScI-01HCX1B69H5ZEF6S18S0F6PM1V.png", "jupiter-nircam-image", "NASA, ESA, CSA, STScI, Ricardo Hueso (UPV), Imke de Pater (UC Berkeley), Thierry Fouchet (Observatory of Paris), Leigh Fletcher (University of Leicester), Michael Wong (UC Berkeley), Joseph DePasquale (STScI)"],
    ["neptune", "Neptune", "2022/09/STScI-01GCCVKJAMF8RJ79STAVK4CXQA.png", "neptune-nircam", "NASA, ESA, CSA, STScI; processing: Joseph DePasquale, Naomi Rowe-Gurney"],
  ];

  const zoom = document.getElementById("telescope-zoom");
  const retry = document.getElementById("telescope-retry");
  let imageTimer;
  let openingTimer;
  let opener = button;
  let loadedKey = null;
  const map = document.getElementById("observation-map");
  const count = document.getElementById("discovery-count");
  const progress = document.getElementById("discovery-progress");
  const discoveryKey = "pocket-planet-observations-v1";
  const validKeys = new Set(observations.map((item) => item[0]));
  let explored = new Set();

  try {
    const saved = JSON.parse(localStorage.getItem(discoveryKey) || "[]");
    if (Array.isArray(saved)) explored = new Set(saved.filter((key) => validKeys.has(key)));
  } catch {}

  function updateMap() {
    map.querySelectorAll("[data-target]").forEach(function (point) {
      point.setAttribute("aria-pressed", String(point.dataset.target === target.value));
      point.classList.toggle("is-explored", explored.has(point.dataset.target));
    });
    count.textContent = explored.size + " of 8 observations explored";
    progress.value = explored.size;
  }

  function recordObservation() {
    if (!loadedKey || !dialog.open) return;
    explored.add(loadedKey);
    try { localStorage.setItem(discoveryKey, JSON.stringify([...explored])); } catch {}
    updateMap();
  }

  map.addEventListener("click", function (event) {
    const point = event.target.closest("button[data-target]");
    if (!point || !map.contains(point)) return;
    target.value = point.dataset.target;
    target.dispatchEvent(new Event("change", { bubbles: true }));
  });

  updateMap();
  let version = 0;

  function observe() {
    const item = observations.find((row) => row[0] === target.value);
    if (!item) return;

    button.style.setProperty("--telescope-angle", -35 + target.selectedIndex * 15 + "deg");
    clearTimeout(imageTimer);
    loadedKey = null;
    updateMap();
    const request = ++version;

    const picture = new Image();
    picture.decoding = "async";
    picture.id = "telescope-image";
    picture.alt = item[1] + ", observed by the James Webb Space Telescope";
    picture.hidden = true;

    image.replaceWith(picture);
    image = picture;

    zoom.disabled = true;
    zoom.textContent = "Zoom image";
    zoom.setAttribute("aria-pressed", "false");
    status.textContent = "Loading " + item[1] + "…";

    const heading = document.createElement("strong");
    heading.textContent = item[1];
    const credit = document.createElement("p");
    credit.textContent = "Credit: " + item[4];

    const source = document.createElement("a");
    source.textContent = "View official source";
    source.href = "https://science.nasa.gov/asset/webb/" + item[3] + "/";
    source.target = "_blank";
    source.rel = "noopener noreferrer";

    caption.replaceChildren(heading, credit, source);

    picture.onload = function () {
      if (request !== version) return;
      clearTimeout(imageTimer);
      picture.hidden = false;
      zoom.disabled = false;
      loadedKey = item[0];
      recordObservation();
      status.textContent = "Published Webb observation · Infrared colours mapped into visible light.";
    };

    picture.onerror = function () {
      if (request !== version) return;
      clearTimeout(imageTimer);
      status.textContent = "Image could not load. Try another target or open the official source.";
    };

    imageTimer = setTimeout(function () {
      if (request !== version || !dialog.open) return;
      status.textContent = "The image is taking longer to load. You can retry, choose another observation, or open its official source.";
    }, 12000);

    picture.src = "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/" + item[2] + "/jcr:content/renditions/cq5dam.web.1280.1280.png";
  }

  function finishAiming() {
    clearTimeout(openingTimer);
    openingTimer = undefined;
    button.disabled = false;
    button.classList.remove("is-aiming");
  }

  button.addEventListener("click", function () {
    if (dialog.open || button.disabled || document.querySelector("dialog[open]")) return;
    button.disabled = true;
    button.classList.add("is-aiming");
    const cardButton = document.getElementById("mission-telescope-button");
    opener = document.activeElement === cardButton ? cardButton : button;
    launchStatus.textContent = "Aiming telescope…";
    observe();

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    openingTimer = setTimeout(function () {
      finishAiming();
      if (document.querySelector("dialog[open]")) return;
      try {
        dialog.showModal();
        dialog.scrollTop = 0;
        target.focus();
        recordObservation();
        launchStatus.textContent = "Space image gallery opened.";
      } catch (error) {
        launchStatus.textContent = "The gallery could not open. Please try again.";
        console.error("Could not open the telescope gallery:", error);
      }
    }, delay);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && openingTimer !== undefined) {
      finishAiming();
      ++version;
      clearTimeout(imageTimer);
      launchStatus.textContent = "Telescope aiming cancelled.";
      button.focus();
    }
  });

  document.getElementById("iss-button").addEventListener("click", finishAiming);
  window.addEventListener("pagehide", function () {
    finishAiming();
    clearTimeout(imageTimer);
    ++version;
  });

  target.addEventListener("change", observe);
  retry.addEventListener("click", observe);

  zoom.addEventListener("click", function () {
    const expanded = image.classList.toggle("is-zoomed");
    zoom.textContent = expanded ? "Fit image" : "Zoom image";
    zoom.setAttribute("aria-pressed", String(expanded));
  });

  dialog.addEventListener("close", function () {
    finishAiming();
    clearTimeout(imageTimer);
    ++version;
    launchStatus.textContent = "Space image gallery closed.";
    opener.focus();
  });

  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
})();

document.getElementById("mission-iss-button").addEventListener("click", function () {
  document.getElementById("iss-button").click();
});
document.getElementById("mission-telescope-button").addEventListener("click", function () {
  document.getElementById("telescope-button").click();
});

// JSON Backup Exporter
(function () {
  const button = document.getElementById("download-backup-button");
  const status = document.getElementById("backup-status");

  button.addEventListener("click", function () {
    try {
      const savedText = localStorage.getItem("pocket-planet-settings-v1");
      if (!savedText) {
        status.textContent = "Customize a planet first, then download your backup.";
        return;
      }

      const saved = JSON.parse(savedText);
      if (!saved || saved.version !== 1 || !saved.worlds || typeof saved.worlds !== "object" || Array.isArray(saved.worlds)) {
        status.textContent = "Saved settings could not be recognized. Change a planet setting and try again.";
        return;
      }

      const json = JSON.stringify(saved, null, 2);
      const file = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = "pocket-planet-backup-" + date + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      status.textContent = "Backup download requested. Keep the JSON file safe.";
    } catch (error) {
      console.error("Universe backup failed:", error);
      status.textContent = "Could not create a backup. Saved data may be unreadable or browser storage unavailable.";
    }
  });
})();

// Fullscreen Stage View
(function () {
  const stage = document.getElementById("immersive-stage");
  const button = document.getElementById("immersive-button");
  const status = document.getElementById("immersive-status");

  if (!document.fullscreenEnabled || !stage.requestFullscreen) {
    button.disabled = true;
    status.textContent = "Fullscreen is unavailable in this browser.";
    return;
  }

  button.addEventListener("click", async function () {
    status.textContent = "";
    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else {
        const previewStatus = document.getElementById("preview-status");
        if (!previewStatus.hidden) {
          status.textContent = "Wait for the 3D preview to load first.";
          return;
        }
        await stage.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen view failed:", error);
      status.textContent = "Could not open fullscreen. Try a regular browser tab.";
    }
  });

  document.addEventListener("fullscreenchange", function () {
    const expanded = document.fullscreenElement === stage;
    button.textContent = expanded ? "Exit view" : "Expand view";
    button.setAttribute("aria-pressed", String(expanded));
  });
})();

// JSON Backup Importer
(function () {
  const input = document.getElementById("restore-file-input");
  const button = document.getElementById("restore-backup-button");
  const status = document.getElementById("restore-status");

  let pendingBackup = null;
  let readAttempt = 0;

  function isObject(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function isBackup(data) {
    if (!isObject(data) || data.version !== 1 || !isObject(data.worlds)) return false;
    return ["rog", "ember", "frost"].every(function (key) {
      const world = data.worlds[key];
      return isObject(world) &&
        typeof world.name === "string" && world.name.trim().length > 0 && world.name.length <= 30 &&
        typeof world.color === "string" && /^#[0-9a-f]{6}$/i.test(world.color) &&
        ["rocky", "gas", "frozen"].includes(world.surface);
    });
  }

  input.addEventListener("change", async function () {
    const attempt = ++readAttempt;
    pendingBackup = null;
    button.disabled = true;

    const file = input.files[0];
    if (!file) {
      status.textContent = "Choose a backup file to begin.";
      return;
    }

    if (file.size > 256 * 1024) {
      status.textContent = "Choose a backup smaller than 256 KB.";
      return;
    }

    status.textContent = "Checking backup…";
    try {
      const data = JSON.parse(await file.text());
      if (attempt !== readAttempt) return;

      if (!isBackup(data)) {
        status.textContent = "This is not a supported Pocket Planet backup.";
        return;
      }

      pendingBackup = data;
      button.disabled = false;
      status.textContent = "Backup ready. Restoring will replace your three worlds.";
    } catch {
      if (attempt === readAttempt) {
        status.textContent = "Could not read this file. Choose a valid JSON backup.";
      }
    }
  });

  button.addEventListener("click", function () {
    if (!pendingBackup) return;
    try {
      localStorage.setItem("pocket-planet-settings-v1", JSON.stringify(pendingBackup));
      button.disabled = true;
      window.location.reload();
    } catch {
      status.textContent = "Restore failed. Browser storage may be unavailable.";
    }
  });
})();