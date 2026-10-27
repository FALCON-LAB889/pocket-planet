const sizes = [1, 1, 2, 3, 4];

function randomPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const starField = document.getElementById("star-field");

for (let i = 0; i < 90; i++) {
    const star = document.createElement("span");
    star.className = "star";

    if (i % 4 === 0) star.classList.add("fading");
    if (i % 9 === 1) star.classList.add("sparkle");

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    const size = 1 + Math.random() * 2;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.animationDuration = 2 + Math.random() * 4 + "s";
    star.style.animationDelay = -Math.random() * 8 + "s";

    starField.appendChild(star);
}


/* planet defaults and storage */


const defaults = {
    rog: {
        name: "Planet Rog",
        description: "A quiet world with purple skies.",
        color: "#8758ff",
        surface: "smooth",
        ring: false,
        ringStyle: "saturn",
        ringColor: "#e8c99b",
        moon: false,
        moonSize: 40,
        moonColor: "#d8dbeb"
    },
    ember: {
        name: "Planet Ember",
        description: "A warm world of glowing stone.",
        color: "#f58232",
        surface: "rocky",
        ring: false,
        ringStyle: "saturn",
        ringColor: "#e8c99b",
        moon: false,
        moonSize: 40,
        moonColor: "#d8dbeb"
    },
    frost: {
        name: "Planet Frost",
        description: "A cold world beneath pale blue skies.",
        color: "#64c9f4",
        surface: "smooth",
        ring: false,
        ringStyle: "saturn",
        ringColor: "#e8c99b",
        moon: false,
        moonSize: 40,
        moonColor: "#d8dbeb"
    }
};

const worlds = Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, { ...value }])
);

const storeKey = "pocket-planet-classic-v1";
const isColor = value =>
    typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || "null");

    if (saved && typeof saved === "object") {
        for (const key of Object.keys(worlds)) {
            const item = saved[key];
            if (!item || typeof item !== "object") continue;

            if (typeof item.name === "string") {
                worlds[key].name =
                    item.name.trim().slice(0, 30) || defaults[key].name;
            }
            if (isColor(item.color)) worlds[key].color = item.color;
            if (["smooth", "rocky", "bands"].includes(item.surface)) {
                worlds[key].surface = item.surface;
            }
            if (typeof item.ring === "boolean") worlds[key].ring = item.ring;
            if (["saturn", "thin", "double"].includes(item.ringStyle)) {
                worlds[key].ringStyle = item.ringStyle;
            }
            if (isColor(item.ringColor)) worlds[key].ringColor = item.ringColor;
            if (typeof item.moon === "boolean") worlds[key].moon = item.moon;
            if (Number.isFinite(item.moonSize)) {
                worlds[key].moonSize =
                    Math.max(20, Math.min(80, item.moonSize));
            }
            if (isColor(item.moonColor)) worlds[key].moonColor = item.moonColor;
        }
    }
} catch (error) {
    // The page can still run if saved data is unavailable.
}


/* dom elements */


const homeView = document.getElementById("home-view");
const customizer = document.getElementById("customizer");
const planetName = document.getElementById("planet-name");
const planetDescription = document.getElementById("planet-description");
const nameInput = document.getElementById("name-input");
const colorInput = document.getElementById("color-input");
const surfaceInput = document.getElementById("surface-input");
const ringInput = document.getElementById("ring-input");
const ringStyleInput = document.getElementById("ring-style-input");
const ringColorInput = document.getElementById("ring-color-input");
const moonInput = document.getElementById("moon-input");
const moonSizeInput = document.getElementById("moon-size-input");
const moonSizeValue = document.getElementById("moon-size-value");
const moonColorInput = document.getElementById("moon-color-input");
const saveStatus = document.getElementById("save-status");
const preview = document.getElementById("planet-preview");

let currentKey = "rog";
let lastButton = null;
let updateThree = () => {};
let resizeThree = () => {};

function persist() {
    try {
        localStorage.setItem(storeKey, JSON.stringify(worlds));
        return true;
    } catch (error) {
        return false;
    }
}

function shade(hex, amount) {
    const channels = [1, 3, 5].map(
        at => parseInt(hex.slice(at, at + 2), 16)
    );

    return "#" + channels.map(n =>
        Math.round(
            n + (amount >= 0 ? (255 - n) * amount : n * amount)
        ).toString(16).padStart(2, "0")
    ).join("");
}

function renderSolar() {
    for (const key of Object.keys(worlds)) {
        const w = worlds[key];
        const planet = document.querySelector(
            `.orbit-planet[data-planet="${key}"]`
        );

        planet.style.setProperty("--planet-color", w.color);
        planet.style.setProperty(
            "--planet-light",
            shade(w.color, .55)
        );
        planet.style.setProperty(
            "--planet-dark",
            shade(w.color, -.72)
        );
        planet.style.setProperty("--ring-color", w.ringColor);
        planet.style.setProperty("--moon-color", w.moonColor);
        planet.style.setProperty(
            "--moon-size",
            Math.round(5 + w.moonSize / 10) + "px"
        );

        planet.dataset.style = w.surface;
        planet.classList.toggle("has-ring", w.ring);
        planet.classList.toggle("has-moon", w.moon);
        planet.classList.toggle(
            "ring-thin",
            w.ringStyle === "thin"
        );
        planet.classList.toggle(
            "ring-double",
            w.ringStyle === "double"
        );
        planet.setAttribute(
            "aria-label",
            `Customize ${w.name}`
        );

        document.querySelector(
            `[data-choose="${key}"]`
        ).textContent = w.name;
    }
}

function updateControls() {
    const w = worlds[currentKey];

    planetName.textContent = w.name;
    planetDescription.textContent = w.description;
    nameInput.value = w.name;
    colorInput.value = w.color;
    surfaceInput.value = w.surface;
    ringInput.checked = w.ring;
    ringStyleInput.value = w.ringStyle;
    ringColorInput.value = w.ringColor;
    moonInput.checked = w.moon;
    moonSizeInput.value = String(w.moonSize);
    moonSizeValue.value = w.moonSize + "%";
    moonColorInput.value = w.moonColor;

    ringStyleInput.disabled = !w.ring;
    ringColorInput.disabled = !w.ring;
    moonSizeInput.disabled = !w.moon;
    moonColorInput.disabled = !w.moon;

    updateThree();
}

function openPlanet(key, button) {
    currentKey = key;
    lastButton = button;

    homeView.hidden = true;
    customizer.hidden = false;
    saveStatus.textContent = "";

    updateControls();
    requestAnimationFrame(resizeThree);
    nameInput.focus();
}

document.querySelectorAll(
    "[data-planet], [data-choose]"
).forEach(button => {
    button.addEventListener("click", () => {
        openPlanet(
            button.dataset.planet || button.dataset.choose,
            button
        );
    });
});

document.getElementById("back-button").addEventListener(
    "click",
    () => {
        customizer.hidden = true;
        homeView.hidden = false;
        if (lastButton) lastButton.focus();
    }
);

function changed() {
    const w = worlds[currentKey];

    w.name = nameInput.value.trim() || defaults[currentKey].name;
    w.color = colorInput.value;
    w.surface = surfaceInput.value;
    w.ring = ringInput.checked;
    w.ringStyle = ringStyleInput.value;
    w.ringColor = ringColorInput.value;
    w.moon = moonInput.checked;
    w.moonSize = Number(moonSizeInput.value);
    w.moonColor = moonColorInput.value;

    planetName.textContent = w.name;
    moonSizeValue.value = w.moonSize + "%";

    ringStyleInput.disabled = !w.ring;
    ringColorInput.disabled = !w.ring;
    moonSizeInput.disabled = !w.moon;
    moonColorInput.disabled = !w.moon;

    renderSolar();
    updateThree();
    persist();
    saveStatus.textContent = "";
}

[
    nameInput,
    colorInput,
    surfaceInput,
    ringInput,
    ringStyleInput,
    ringColorInput,
    moonInput,
    moonSizeInput,
    moonColorInput
].forEach(input => input.addEventListener("input", changed));

document.getElementById("save-button").addEventListener(
    "click",
    () => {
        nameInput.value = worlds[currentKey].name;

        saveStatus.textContent = persist()
            ? "Saved! Your planet will be here when you return."
            : "Could not save on this device. Keep this tab open to keep your changes.";
    }
);

renderSolar();


/* three.js preview */


async function startThree() {
    try {
        const THREE = await import("three");
        const { TrackballControls } = await import(
            "three/addons/controls/TrackballControls.js"
        );

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            42, 1, .1, 100
        );
        camera.position.z = 6.1;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        preview.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 1.1));

        const light = new THREE.DirectionalLight(
            0xffffff, 2.4
        );
        light.position.set(-3, 4, 5);
        scene.add(light);

        const planetMaterial = new THREE.MeshStandardMaterial({
            color: "#8758ff",
            roughness: .85
        });

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 48, 32),
            planetMaterial
        );
        scene.add(sphere);

        function textureFor(style) {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 256;

            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 512, 256);

            if (style === "rocky") {
                let seed = 51;
                const rand = () => {
                    seed = (seed * 1664525 + 1013904223) >>> 0;
                    return seed / 4294967296;
                };

                for (let i = 0; i < 100; i++) {
                    const x = rand() * 512;
                    const y = rand() * 256;
                    const r = 2 + rand() * 12;

                    ctx.fillStyle =
                        `rgba(50,50,50,${.08 + rand() * .22})`;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (style === "bands") {
                for (let y = 0; y < 256; y += 18) {
                    ctx.fillStyle =
                        y % 36 === 0 ? "#b4b4b4" : "#e1e1e1";
                    ctx.fillRect(0, y, 512, 7 + (y % 5));
                }
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            return texture;
        }

        const textures = {
            rocky: textureFor("rocky"),
            bands: textureFor("bands")
        };

        const ringGroup = new THREE.Group();
        ringGroup.rotation.set(-1.08, 0, .35);
        scene.add(ringGroup);

        let previousRingStyle = "";

        function buildRings(style) {
            for (const mesh of [...ringGroup.children]) {
                ringGroup.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }

            const bands = style === "thin"
                ? [[1.35, 1.42, .85]]
                : style === "double"
                    ? [
                        [1.32, 1.42, .78],
                        [1.64, 1.74, .58]
                    ]
                    : [
                        [1.28, 1.39, .74],
                        [1.43, 1.59, .42],
                        [1.64, 1.75, .65]
                    ];

            for (const [inside, outside, opacity] of bands) {
                const material = new THREE.MeshStandardMaterial({
                    color: "#e8c99b",
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity,
                    depthWrite: false,
                    roughness: .9
                });

                ringGroup.add(
                    new THREE.Mesh(
                        new THREE.RingGeometry(
                            inside, outside, 128
                        ),
                        material
                    )
                );
            }
        }

        const moonOrbit = new THREE.Group();
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: "#d8dbeb",
            roughness: 1
        });

        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(1, 24, 16),
            moonMaterial
        );
        moon.position.set(2.05, .22, 0);
        moonOrbit.add(moon);
        scene.add(moonOrbit);

        const controls = new TrackballControls(
            camera,
            renderer.domElement
        );
        controls.rotateSpeed = 3;
        controls.noPan = true;
        controls.noZoom = true;
        controls.staticMoving = true;

        updateThree = () => {
            const w = worlds[currentKey];

            planetMaterial.color.set(w.color);
            planetMaterial.map =
                textures[w.surface] || null;
            planetMaterial.needsUpdate = true;

            if (w.ringStyle !== previousRingStyle) {
                buildRings(w.ringStyle);
                previousRingStyle = w.ringStyle;
            }

            ringGroup.visible = w.ring;
            for (const band of ringGroup.children) {
                band.material.color.set(w.ringColor);
            }

            moonOrbit.visible = w.moon;
            moonMaterial.color.set(w.moonColor);
            moon.scale.setScalar(w.moonSize / 200);
        };

        resizeThree = () => {
            const width = preview.clientWidth;
            const height = preview.clientHeight;

            if (!width || !height) return;

            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            controls.handleResize();
            renderer.render(scene, camera);
        };

        if (typeof ResizeObserver !== "undefined") {
            new ResizeObserver(resizeThree).observe(preview);
        } else {
            window.addEventListener("resize", resizeThree);
        }

        updateThree();
        resizeThree();

        let lastFrame = performance.now();

        function animate(now) {
            requestAnimationFrame(animate);

            const delta = Math.min(
                (now - lastFrame) / 1000,
                .05
            );
            lastFrame = now;

            if (customizer.hidden) return;

            if (
                !window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
            ) {
                sphere.rotation.y += delta * .22;
                moonOrbit.rotation.z += delta * .35;
            }

            controls.update();
            renderer.render(scene, camera);
        }

        requestAnimationFrame(animate);
    } catch (error) {
        console.error("3D preview error:", error);
    }
}

startThree();
