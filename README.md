# Pocket Planet

A small universe you can make your own. Select a planet, customize its 3D appearance, then return to see it orbit the sun. Visit the ISS mission window to watch Earth through Sen or NASA's official video player.

Built as a learning project for Hack Club StarDance using HTML, CSS, JavaScript, and Three.js.

## Explore

- Select Rog, Ember, or Frost directly in the solar system. Hover pauses planet movement so selection is easier.
- Rename each world and change its colour or surface: rocky, gas, or frozen.
- Add a moon and choose from three ring styles with separate ring colours.
- Drag the 3D preview to inspect every side, then reset the view.
- Keep your customizations in the browser with localStorage when available.
- Open the slowly orbiting ISS to select Sen or NASA footage, reconnect, or toggle sound.
- Use the on-page guide and keyboard controls to navigate.

## Run locally

1. Download or clone the repository.
2. Keep `index.html`, `style.css`, and `script.js` in the same folder.
3. Open that folder in VS Code and start Live Server from `index.html`.
4. Use the HTTP address it opens in Edge, Chrome, or another full browser.

An internet connection is required for Three.js, the station image, and the video streams. Opening the HTML directly through `file://` can block module loading and YouTube embeds. VS Code's integrated browser may not play video even when a full browser does.
