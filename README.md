POCKET-PLANET

Build a world. Give it an atmosphere. Leave your mark.

Pocket Planet is an interactive space sandbox where you can customize three fictional worlds, inspect them in 3D, experiment with meteor impacts, and explore real space imagery and ISS video streams.

It began as a small CSS solar system and grew into a browser project combining procedural textures, 3D rendering, interactive experiments, and real astronomy content.

Built for Hack Club StarDance with HTML, CSS, JavaScript, and Three.js.

Features · Run locally · Controls · How it works · Credits

<!-- Add a verified live-demo link and a current screenshot here before sharing. -->

Features

Experience

What you can do

Your own worlds

Select Rog, Ember, or Frost; change its name, colour, and rocky, gas, or frozen surface.

Layered 3D rings

Choose Saturn-style bands, a thin ring, or double rings, with independent ring colours.

Companion moons

Adjust a moon's colour, size, orbit radius, and orbital speed.

Atmosphere and weather

Add an atmospheric glow, change cloud coverage, and enable occasional storm glows with adjustable strength.

Day and night

Move the sunlight around your planet and compare its illuminated and shadowed sides.

Meteor experiments

Choose an impact point and meteor size. Rocky and icy worlds retain craters; gas worlds show a cloud burst.

Cinematic viewing

Drag to inspect your creation, reset the camera, or enter fullscreen where supported.

A window to Earth

Open the ISS viewer and choose between Sen and NASA broadcast options.

Deep-space discovery

Open the telescope archive to explore eight credited Webb observations, zoom images, and visit their official sources.

Explorer Missions

Unlock three achievement badges through world-building experiments.

Keep your creations

Save settings in your browser, download a planet postcard, and export or restore a JSON universe backup.

Your customizations also appear on the planets in the solar-system view.

Try this first

Select Rog and give it a new name and colour.

Add double rings and a moon to unlock Ring Architect.

Enable atmosphere, add clouds, and try storms in Night view.

Switch to a rocky or icy surface, choose an impact point, and launch a meteor.

Open Expand view to inspect the result, then download a postcard.

Return to the solar system and explore the ISS viewer or telescope archive.

Run locally

What you need

A current browser with JavaScript and WebGL support, such as Chrome, Edge, or Firefox.

An internet connection for Three.js, remote images, fonts, and video streams.

A local HTTP server: choose either option below.

No npm install, build step, backend, or API key is required for this version.

Keep index.html, style.css, and script.js together in the same project folder. Download and extract the repository ZIP, or clone the repository, before starting.

Option 1 — VS Code and Live Server

Open the project folder in Visual Studio Code.

Install Live Server by Ritwick Dey.

In the Explorer panel, right-click index.html.

Select Open with Live Server.

Open the resulting HTTP address in a regular browser tab.

Keep editing the files in VS Code and save changes to refresh the preview.

Option 2 — Python 3

Open a terminal inside the project folder.

On Windows with the Python launcher installed:

py -m http.server 8000 --bind 127.0.0.1

On macOS or Linux:

python3 -m http.server 8000 --bind 127.0.0.1

Visit http://127.0.0.1:8000/. Leave the terminal running while you explore. Press Ctrl+C to stop the server.

These are local development servers. See the Python server documentation for details.

Use an http:// or https:// address. Double-clicking the HTML file opens it through file://, which can interfere with module loading and embedded video playback. A regular browser tab is preferable to an editor's integrated preview for testing streams and fullscreen.

Controls

Action

Control

Open a world

Click a planet, or focus it with Tab and press Enter or Space.

Make a planet easier to select

Move the pointer into the solar system, or use Pause planets.

Inspect the 3D preview

Drag the planet view.

Restore the camera angle

Select Reset view or double-click the preview.

Enter cinematic viewing

Select Expand view.

Leave fullscreen

Select Exit view or press Esc in a supported desktop browser.

Run a meteor experiment

Choose an impact point, select a size, and launch. Esc cancels targeting or an active flight.

Return to the overview

Select Back to solar system.

View help

Open the Flight Handbook.

Saving, backups, and postcards

Automatic saving: planet settings and earned mission badges are stored in this browser when local storage is available. They do not automatically sync across browsers, devices, or site addresses.

Universe backup: download a JSON file containing the saved settings for your three worlds.

Restore: select a supported backup, then choose Replace worlds & restore. This replaces the current three worlds and reloads the page. Download a fresh backup first if you want to keep both versions.

Postcard: download a PNG image of the current planet view. A postcard is an image, not a restorable settings file.

Universe backups contain planet settings; they do not include the separate mission-badge record or observation log. Clearing browser site data removes locally saved progress.

How it works

Pocket Planet combines two complementary views: a CSS solar system for navigating between worlds and a Three.js scene for detailed customization.

Procedural surfaces: canvas-generated textures give rocky, gas, and frozen worlds their different appearances.

3D composition: sphere meshes, layered ring geometry, lighting, and TrackballControls create an inspectable planet rather than a flat preview image.

Impact geometry: solid-world meteor impacts modify the surface geometry and appearance to leave persistent craters. Each world keeps its latest 16 craters.

Atmosphere rendering: a shader creates the rim glow; a separate cloud layer controls cloud coverage. Storms add short, localized light effects.

Shared settings: each world has its own appearance and moon settings, reflected in both the editor and solar-system overview.

Rendering lifecycle: the preview animation loop pauses when the editor or browser tab is hidden, or a dialog is open. Reduced-motion preferences limit decorative animation and storm effects.

External content: video and gallery controls run separately from the 3D preview. Published images include source links and credits.

The project uses Three.js 0.180.0 through an import map, with its matching TrackballControls addon.

Project files

File

Purpose

index.html

Page structure, customization controls, dialogs, handbook, and import map.

style.css

Space-themed interface, responsive layouts, solar-system animation, and interaction states.

script.js

Navigation, 3D rendering, experiments, persistence, exports, video playback, and image loading.

README.md

Setup instructions, features, controls, and credits.

LICENSE

Project code licence.

Troubleshooting

Problem

What to check

The page looks unstyled

Keep style.css next to index.html and check the stylesheet filename and path.

The 3D preview does not load

Use a local HTTP server, check internet access, and inspect the browser console for the exact error. Confirm that WebGL is available.

A stream fails or buffers

Try the other provider, retry playback, or use the official source link. Check the player's quality settings if available.

Video works in a browser but not inside VS Code

Open the same HTTP address in a regular browser tab.

Fullscreen is unavailable

Browser support and embedding restrictions vary. Try a regular browser tab; the normal preview remains usable.

Saved worlds appear missing

Check that you are using the same browser and site address, or restore a previously downloaded backup.

Scope and external services

The planets are fictional. Sizes, orbital paths, meteor effects, and timings are artistic choices, not a scientific simulation. The ISS path and telescope movement are decorative, not real-time position tracking.

The telescope launcher uses a Hubble photograph; the archive contains published Webb observations. These are credited astronomy images, not a live telescope feed.

ISS video availability depends on the broadcast provider, YouTube, the connection, and browser playback policies. Sen and NASA offer different broadcast options, but both embedded players use YouTube. The project does not rebroadcast video, guarantee continuous footage, or force a particular playback resolution.

Credits

Three.js and its TrackballControls addon for 3D rendering and interaction.

Space Grotesk via Google Fonts for interface typography.

Sen, NASA, and the YouTube IFrame Player API for embedded broadcast viewing.

NASA's ISS illustration for the station launcher.

NASA's Hubble release photograph for the telescope launcher.

NASA's Webb image collection and the contributors credited with each gallery observation.

External images, fonts, broadcasts, and libraries retain their respective licences and usage terms. Project code licensing is described in LICENSE.

Feedback

Found a bug? Open an issue with the browser and device you used, the steps to reproduce it, and any browser-console error. Suggestions that improve exploration, accessibility, or performance are welcome.
