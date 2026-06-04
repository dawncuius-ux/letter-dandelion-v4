const POSTER_VERSION = "V5";
const POSTER_RANDOM_SEED = 20260603;
const RENDER_CONFIG = {
  maxPixelDensity: 1.5,
  frameRate: 45,
};
const RAY_COUNT = 294;
const FLOATING_SEED_COUNT = 64;
const WASH_PATCH_COUNT = 56;
const LIGHT_STREAK_COUNT = 18;
const PAPER_FIBER_COUNT = 260;
const LIGHT_LEAK_COUNT = 5;
const TEXTURE_GRAIN_COUNT = {
  light: 3100,
  blue: 2300,
  warm: 420,
};
const SCENE_LAYOUT = {
  coreX: 0.49,
  coreY: 0.48,
  stemStartX: 0.34,
  stemStartY: 1.04,
};
const NAME_STYLE = {
  fontSize: 11,
  hitWidthPerChar: 14,
  hitHeight: 11,
};
const RAY_BANDS = {
  inner: {
    threshold: 0.16,
    shellPower: 0.9,
    radius: [0.118, 0.136],
    end: [0.965, 1],
    alpha: [30, 86],
    weight: [0.9, 1.62],
    glyphSize: [5.5, 7.5],
    jitter: [0.992, 1.008],
  },
  middle: {
    threshold: 0.85,
    shellPower: 0.7,
    radius: [0.128, 0.144],
    end: [0.975, 1],
    alpha: [38, 108],
    weight: [1.05, 1.9],
    glyphSize: [6.2, 8.8],
    jitter: [0.992, 1.008],
  },
  outer: {
    shellPower: 0.51,
    radius: [0.138, 0.15],
    end: [0.982, 1],
    alpha: [42, 118],
    weight: [1.12, 2.12],
    glyphSize: [7.2, 10],
    jitter: [0.995, 1.006],
  },
};
const RAY_LONG_VARIATION = {
  chance: 0.02,
  scale: [1.005, 1.018],
};
const TERMINAL_STYLE = {
  glowSize: [5.2, 10.4],
  glowAlpha: [54, 112],
  fluffCount: [2, 5],
  fluffLength: [2.4, 5.4],
  fluffDotSize: [0.65, 1.5],
  fluffSpread: [0.8, 2.4],
};
const OVEREXPOSED_GLOW = {
  coreHalo: 68,
  terminalHotCore: 1.46,
  floatingSeedBoost: 1.05,
  sparkChance: 0.36,
};
const SPHERE_LAYOUT = {
  goldenAngle: Math.PI * (3 - Math.sqrt(5)),
  thetaJitter: 0.035,
  zJitter: 0.012,
  labelDepthLimit: 0.82,
};
const ROTATION = {
  dragSensitivity: 0.012,
  perspective: 0.68,
  depthScale: 0.92,
  dragThreshold: 4,
};
const WIND = {
  swayAmp: [2.2, 7.4],
  swaySpeed: [0.42, 0.92],
  focusDim: 0.22,
  focusedBoost: 1.22,
};
const FLOATING_SEED = {
  speed: [0.012, 0.034],
  sway: [9, 26],
  length: [14, 32],
  alpha: [30, 88],
};
const RELEASE = {
  duration: 5600,
  distanceX: 0.46,
  distanceY: -0.32,
  sway: 42,
  detachEnd: 0.28,
};
const NAME_PLACEHOLDERS = [
  "林知夏",
  "周予安",
  "陈星野",
  "沈清和",
  "许明川",
  "顾南枝",
  "梁书言",
  "宋云舟",
  "陆时微",
  "程以宁",
  "姜叙白",
  "何景澄",
  "苏念初",
  "温予川",
  "乔沐阳",
  "唐见月",
  "裴青禾",
  "谢闻舟",
  "白若川",
  "顾长风",
];

const rays = [];
const floatingSeeds = [];
const washPatches = [];
const lightStreaks = [];
const paperFibers = [];
const lightLeaks = [];
const textureGrains = [];
const nameLabels = [];
const messages = createMessages();
const CHARACTER_POOL = Array.from("谢念愿风光行远明亮顺遂安新花星梦海hopegratitude");

let coreX = 0;
let coreY = 0;
let sceneUnit = 0;
let stemStartX = 0;
let stemStartY = 0;
let staticBackgroundLayer;
let backgroundWashLayer;
let textureLayer;
let terminalGlowSprite;
let coreGlowSprite;
let rotationY = 0;
let isRotatingView = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartRotationY = 0;
let dragMoved = false;
let activeLabel = null;
let hoverLabel = null;
let panelEl;
let endingEl;
let releaseButton;

function setup() {
  const mount = document.getElementById("poster");
  document.documentElement.dataset.posterVersion = POSTER_VERSION;
  const canvas = createCanvas(mount.clientWidth, mount.clientHeight);
  canvas.parent("poster");
  pixelDensity(Math.min(window.devicePixelRatio || 1, RENDER_CONFIG.maxPixelDensity));
  frameRate(RENDER_CONFIG.frameRate);
  panelEl = document.getElementById("message-panel");
  endingEl = document.getElementById("ending-panel");
  releaseButton = document.getElementById("release-button");
  releaseButton.addEventListener("click", () => {
    if (activeLabel) {
      releaseLabel(activeLabel);
    }
    closeMessagePanel();
  });
  window.__letterDandelion = {
    version: POSTER_VERSION,
    get rotationY() {
      return rotationY;
    },
  };
  cursor("grab");
  initializeScene();
  syncDebugState();
}

function syncDebugState() {
  document.documentElement.dataset.rotationY = rotationY.toFixed(4);
}

function initializeScene() {
  randomSeed(POSTER_RANDOM_SEED);
  noiseSeed(POSTER_RANDOM_SEED);
  rays.length = 0;
  floatingSeeds.length = 0;
  washPatches.length = 0;
  lightStreaks.length = 0;
  paperFibers.length = 0;
  lightLeaks.length = 0;
  textureGrains.length = 0;
  nameLabels.length = 0;

  const widthScale = width < 720 ? 1.24 : 1.12;
  sceneUnit = min(width * widthScale, height * 1.58);
  coreX = width * SCENE_LAYOUT.coreX;
  coreY = height * SCENE_LAYOUT.coreY;
  stemStartX = width * SCENE_LAYOUT.stemStartX;
  stemStartY = height * SCENE_LAYOUT.stemStartY;

  for (let i = 0; i < RAY_COUNT; i += 1) {
    rays.push(createRay(pickRayBand(random()), i));
  }

  for (let i = 0; i < FLOATING_SEED_COUNT; i += 1) {
    floatingSeeds.push(createFloatingSeed(i));
  }

  createBackgroundWash();
  renderBackgroundWashLayer();
  createTextureGrains();
  renderStaticBackgroundLayer();
  removeGraphicsLayer(backgroundWashLayer);
  backgroundWashLayer = null;
  renderTextureLayer();
  renderGlowSprites();

  const labelSeeds = createReadableNameSeeds();
  for (let i = 0; i < messages.length; i += 1) {
    const seed = labelSeeds[i];
    const local = createNameLocal(seed);
    nameLabels.push({
      message: messages[i],
      local,
      windAxis: createWindAxis(local),
      windAmp: random(WIND.swayAmp[0] * 0.7, WIND.swayAmp[1] * 0.9),
      windSpeed: random(WIND.swaySpeed[0], WIND.swaySpeed[1]),
      windPhase: random(TWO_PI),
      windPhase2: random(TWO_PI),
      release: null,
      angle: seed.angle,
      alpha: seed.alpha,
    });
  }

  closeMessagePanel();
}

function pickRayBand(roll) {
  if (roll < RAY_BANDS.inner.threshold) {
    return "inner";
  }
  if (roll < RAY_BANDS.middle.threshold) {
    return "middle";
  }
  return "outer";
}

function createRay(band, index) {
  const config = RAY_BANDS[band];
  const shell = pow(random(), config.shellPower);
  let radius = sceneUnit * lerp(config.radius[0], config.radius[1], shell);

  if (random() < RAY_LONG_VARIATION.chance) {
    radius *= random(RAY_LONG_VARIATION.scale[0], RAY_LONG_VARIATION.scale[1]);
  }

  const lengthJitter = random(config.jitter[0], config.jitter[1]);
  const direction = createSphereDirection(index, RAY_COUNT);
  const localX = direction.x * radius * lengthJitter;
  const localY = direction.y * radius * lengthJitter;
  const localZ = direction.z * radius * lengthJitter;
  const local = createVector(localX, localY, localZ);

  return {
    local,
    windAxis: createWindAxis(local),
    windAmp: random(WIND.swayAmp[0], WIND.swayAmp[1]),
    windSpeed: random(WIND.swaySpeed[0], WIND.swaySpeed[1]),
    windPhase: random(TWO_PI),
    windPhase2: random(TWO_PI),
    start: random(0.018, 0.12),
    end: random(config.end[0], config.end[1]),
    alpha: random(config.alpha[0], config.alpha[1]),
    weight: random(config.weight[0], config.weight[1]),
    glyph: CHARACTER_POOL[index % CHARACTER_POOL.length],
    glyphSize: random(config.glyphSize[0], config.glyphSize[1]),
    glyphRot: random(-0.45, 0.45),
    terminal: createTerminalStyle(),
  };
}

function createWindAxis(local) {
  const axis = createVector(-local.y, local.x, random(-0.24, 0.24) * local.mag());
  if (axis.magSq() < 0.001) {
    axis.set(1, 0, 0);
  }
  axis.normalize();
  return axis;
}

function createFloatingSeed(index) {
  const escaped = index < FLOATING_SEED_COUNT * 0.68;
  const side = random() > 0.35 ? 1 : -1;
  const startX = escaped
    ? random(width * 0.5, width * 1.03)
    : random(width * 0.38, width * 0.65);
  const startY = escaped
    ? random(height * -0.08, height * 0.48)
    : random(height * 0.22, height * 0.52);
  return {
    x: startX,
    y: startY,
    driftScale: escaped ? random(0.18, 0.42) * side : random(0.16, 0.28),
    liftScale: escaped ? random(0.12, 0.28) : random(0.1, 0.18),
    phase: random(TWO_PI),
    speed: random(FLOATING_SEED.speed[0], FLOATING_SEED.speed[1]),
    sway: random(FLOATING_SEED.sway[0], FLOATING_SEED.sway[1]),
    length: random(FLOATING_SEED.length[0], FLOATING_SEED.length[1]),
    alpha: random(FLOATING_SEED.alpha[0], FLOATING_SEED.alpha[1]),
    glyph: CHARACTER_POOL[(index * 7) % CHARACTER_POOL.length],
    terminal: createTerminalStyle(),
  };
}

function createTerminalStyle() {
  const fluff = [];
  const fluffTotal = floor(random(TERMINAL_STYLE.fluffCount[0], TERMINAL_STYLE.fluffCount[1] + 1));

  for (let i = 0; i < fluffTotal; i += 1) {
    fluff.push({
      angle: random(TWO_PI),
      length: random(TERMINAL_STYLE.fluffLength[0], TERMINAL_STYLE.fluffLength[1]),
      spread: random(TERMINAL_STYLE.fluffSpread[0], TERMINAL_STYLE.fluffSpread[1]),
      dotSize: random(TERMINAL_STYLE.fluffDotSize[0], TERMINAL_STYLE.fluffDotSize[1]),
      alpha: random(26, 74),
    });
  }

  return {
    glowSize: random(TERMINAL_STYLE.glowSize[0], TERMINAL_STYLE.glowSize[1]),
    glowAlpha: random(TERMINAL_STYLE.glowAlpha[0], TERMINAL_STYLE.glowAlpha[1]),
    sparkStrength: random() < OVEREXPOSED_GLOW.sparkChance ? random(0.58, 1) : random(0.08, 0.32),
    sparkAngle: random(TWO_PI),
    fluff,
  };
}

function createSphereDirection(index, total) {
  const z = constrain(
    1 - ((index + 0.5) / total) * 2 + random(-SPHERE_LAYOUT.zJitter, SPHERE_LAYOUT.zJitter),
    -0.98,
    0.98
  );
  const planarRadius = sqrt(max(0, 1 - z * z));
  const theta = index * SPHERE_LAYOUT.goldenAngle + random(-SPHERE_LAYOUT.thetaJitter, SPHERE_LAYOUT.thetaJitter);

  return createVector(cos(theta) * planarRadius, sin(theta) * planarRadius, z);
}

function createNameLocal(seed) {
  const radius = sceneUnit * seed.radius;
  const z = constrain(sceneUnit * seed.z, -radius * SPHERE_LAYOUT.labelDepthLimit, radius * SPHERE_LAYOUT.labelDepthLimit);
  const planarRadius = sqrt(max(0, radius * radius - z * z));

  return createVector(cos(seed.angle) * planarRadius, sin(seed.angle) * planarRadius, z);
}

function createProjectionContext() {
  return {
    cosY: cos(rotationY),
    sinY: sin(rotationY),
    perspectiveDistance: sceneUnit * ROTATION.perspective,
  };
}

function projectLocalPoint(local, amount = 1, projection = createProjectionContext()) {
  const localX = local.x * amount;
  const localY = local.y * amount;
  const localZ = local.z * amount;
  const rotatedX = localX * projection.cosY + localZ * projection.sinY;
  const rotatedZ = localZ * projection.cosY - localX * projection.sinY;
  const scale =
    projection.perspectiveDistance /
    (projection.perspectiveDistance + rotatedZ * ROTATION.depthScale);

  return {
    x: coreX + rotatedX * scale,
    y: coreY + localY * scale,
    z: rotatedZ,
    scale,
  };
}

function getAnimatedRayLocal(ray, amount) {
  const t = millis() * 0.001;
  const wave =
    sin(t * ray.windSpeed + ray.windPhase) +
    sin(t * ray.windSpeed * 0.57 + ray.windPhase2) * 0.42;
  const offset = wave * ray.windAmp * amount * amount;

  return createVector(
    ray.local.x + ray.windAxis.x * offset,
    ray.local.y + ray.windAxis.y * offset,
    ray.local.z + ray.windAxis.z * offset
  );
}

function getFocusLabel() {
  return activeLabel || hoverLabel;
}

function getFocusMultiplier() {
  return getFocusLabel() ? WIND.focusDim : 1;
}

function depthVisibility(z) {
  const ballRadius = sceneUnit * RAY_BANDS.outer.radius[1] * 1.08;
  return constrain(map(z, -ballRadius, ballRadius, 1.16, 0.42), 0.36, 1.16);
}

function createTextureGrains() {
  addTextureGrains(TEXTURE_GRAIN_COUNT.light, [255, 255, 255], [4, 16]);
  addTextureGrains(TEXTURE_GRAIN_COUNT.blue, [32, 112, 188], [2, 8]);
  addTextureGrains(TEXTURE_GRAIN_COUNT.warm, [255, 238, 210], [2, 9]);
}

function createBackgroundWash() {
  for (let i = 0; i < WASH_PATCH_COUNT; i += 1) {
    const cool = random() > 0.28;
    washPatches.push({
      x: random(width),
      y: random(height),
      w: random(width * 0.035, width * 0.18),
      h: random(height * 0.025, height * 0.14),
      alpha: cool ? random(2, 7) : random(2, 8),
      rgb: cool ? [20, 102, 180] : [236, 252, 255],
      rotation: random(-0.42, 0.42),
      pieces: floor(random(5, 13)),
    });
  }

  for (let i = 0; i < LIGHT_STREAK_COUNT; i += 1) {
    lightStreaks.push({
      x: random(width * 0.02, width * 0.98),
      y: random(-height * 0.12, height * 0.86),
      length: random(height * 0.18, height * 0.72),
      width: random(1.1, 4.4),
      alpha: random(5, 15),
      drift: random(-0.055, 0.055),
    });
  }

  for (let i = 0; i < PAPER_FIBER_COUNT; i += 1) {
    const pale = random() > 0.45;
    paperFibers.push({
      x: random(width),
      y: random(height),
      length: random(width * 0.018, width * 0.11),
      angle: random(-0.22, 0.22) + (random() > 0.72 ? HALF_PI : 0),
      weight: random(0.22, 0.72),
      alpha: pale ? random(3, 12) : random(2, 7),
      rgb: pale ? [255, 255, 255] : [24, 104, 180],
    });
  }

  for (let i = 0; i < LIGHT_LEAK_COUNT; i += 1) {
    lightLeaks.push({
      x: random(width * -0.05, width * 1.05),
      y: i < 2 ? random(height * 0.62, height * 1.04) : random(height * -0.04, height * 0.36),
      w: random(width * 0.1, width * 0.28),
      h: random(height * 0.08, height * 0.22),
      alpha: random(8, 20),
      warm: random() > 0.42,
    });
  }
}

function renderBackgroundWashLayer() {
  removeGraphicsLayer(backgroundWashLayer);
  backgroundWashLayer = createGraphics(width, height);
  backgroundWashLayer.pixelDensity(pixelDensity());
  backgroundWashLayer.clear();
  backgroundWashLayer.noStroke();

  backgroundWashLayer.drawingContext.filter = "blur(11px)";
  for (const patch of washPatches) {
    backgroundWashLayer.push();
    backgroundWashLayer.translate(patch.x, patch.y);
    backgroundWashLayer.rotate(patch.rotation);
    for (let i = 0; i < patch.pieces; i += 1) {
      const pieceX = randomFromSeed(patch.x + i * 17.13, -patch.w * 0.38, patch.w * 0.38);
      const pieceY = randomFromSeed(patch.y + i * 23.71, -patch.h * 0.38, patch.h * 0.38);
      const pieceW = patch.w * randomFromSeed(patch.w + i * 11.4, 0.36, 0.88);
      const pieceH = patch.h * randomFromSeed(patch.h + i * 19.9, 0.3, 0.82);
      backgroundWashLayer.fill(patch.rgb[0], patch.rgb[1], patch.rgb[2], patch.alpha);
      backgroundWashLayer.ellipse(pieceX, pieceY, pieceW, pieceH);
    }
    backgroundWashLayer.pop();
  }

  backgroundWashLayer.drawingContext.filter = "blur(24px)";
  backgroundWashLayer.blendMode(SCREEN);
  for (const leak of lightLeaks) {
    const rgb = leak.warm ? [255, 246, 206] : [236, 252, 255];
    backgroundWashLayer.fill(rgb[0], rgb[1], rgb[2], leak.alpha);
    backgroundWashLayer.ellipse(leak.x, leak.y, leak.w, leak.h);
  }

  backgroundWashLayer.drawingContext.filter = "blur(8px)";
  backgroundWashLayer.blendMode(SCREEN);
  for (const streak of lightStreaks) {
    for (let i = 0; i < 4; i += 1) {
      const ratio = i / 3;
      backgroundWashLayer.stroke(255, 255, 255, streak.alpha * (1 - ratio) * 0.34);
      backgroundWashLayer.strokeWeight(streak.width * (1 + ratio * 1.7));
      backgroundWashLayer.line(
        streak.x + streak.drift * streak.length * ratio,
        streak.y + streak.length * ratio * 0.08,
        streak.x + streak.drift * streak.length,
        streak.y + streak.length
      );
    }
  }
  backgroundWashLayer.blendMode(BLEND);

  backgroundWashLayer.drawingContext.filter = "blur(0.6px)";
  for (const fiber of paperFibers) {
    const dx = cos(fiber.angle) * fiber.length;
    const dy = sin(fiber.angle) * fiber.length;
    backgroundWashLayer.stroke(fiber.rgb[0], fiber.rgb[1], fiber.rgb[2], fiber.alpha);
    backgroundWashLayer.strokeWeight(fiber.weight);
    backgroundWashLayer.line(fiber.x - dx * 0.5, fiber.y - dy * 0.5, fiber.x + dx * 0.5, fiber.y + dy * 0.5);
  }
  backgroundWashLayer.drawingContext.filter = "none";
}

function renderStaticBackgroundLayer() {
  removeGraphicsLayer(staticBackgroundLayer);
  staticBackgroundLayer = createGraphics(width, height);
  staticBackgroundLayer.pixelDensity(pixelDensity());
  staticBackgroundLayer.noStroke();

  for (let y = 0; y < height; y += 2) {
    const t = map(y, 0, height, 0, 1);
    const c = lerpColor(color(39, 150, 224), color(214, 243, 255), t);
    staticBackgroundLayer.fill(c);
    staticBackgroundLayer.rect(0, y, width, 2);
  }

  if (backgroundWashLayer) {
    staticBackgroundLayer.image(backgroundWashLayer, 0, 0, width, height);
  }

  for (let y = height * 0.48; y < height; y += 3) {
    const t = map(y, height * 0.48, height, 0, 1);
    staticBackgroundLayer.fill(255, 255, 255, pow(t, 1.55) * 48);
    staticBackgroundLayer.rect(0, y, width, 3);
  }
}

function renderTextureLayer() {
  removeGraphicsLayer(textureLayer);
  textureLayer = createGraphics(width, height);
  textureLayer.pixelDensity(pixelDensity());
  textureLayer.clear();
  textureLayer.noStroke();

  for (const grain of textureGrains) {
    textureLayer.fill(grain.rgb[0], grain.rgb[1], grain.rgb[2], grain.alpha);
    textureLayer.rect(grain.x, grain.y, grain.size, grain.size);
  }
}

function renderGlowSprites() {
  removeGraphicsLayer(terminalGlowSprite);
  removeGraphicsLayer(coreGlowSprite);
  terminalGlowSprite = createGlowSprite(96, [
    [0, "rgba(255,255,255,0.86)"],
    [0.1, "rgba(255,255,255,0.62)"],
    [0.3, "rgba(255,250,220,0.14)"],
    [0.62, "rgba(255,248,212,0.035)"],
    [1, "rgba(255,248,212,0)"],
  ]);
  coreGlowSprite = createGlowSprite(160, [
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(255,255,255,0.94)"],
    [0.42, "rgba(255,248,218,0.32)"],
    [0.72, "rgba(255,248,218,0.1)"],
    [1, "rgba(255,248,218,0)"],
  ]);
}

function createGlowSprite(size, stops) {
  const sprite = createGraphics(size, size);
  sprite.pixelDensity(pixelDensity());
  sprite.clear();
  const ctx = sprite.drawingContext;
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);

  for (const [offset, colorValue] of stops) {
    gradient.addColorStop(offset, colorValue);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

function removeGraphicsLayer(layer) {
  if (layer && typeof layer.remove === "function") {
    layer.remove();
  }
}

function addTextureGrains(count, rgb, alphaRange) {
  for (let i = 0; i < count; i += 1) {
    textureGrains.push({
      x: random(width),
      y: random(height),
      rgb,
      alpha: random(alphaRange[0], alphaRange[1]),
      size: rgb[0] > 240 ? random(0.6, 1.55) : random(0.45, 1.1),
    });
  }
}

function draw() {
  drawStaticBackground();
  drawStem();
  drawSharpDandelion();
  drawFloatingSeeds();
  drawNameLabels();
  drawTextureOverlay();
}

function drawStaticBackground() {
  if (staticBackgroundLayer) {
    image(staticBackgroundLayer, 0, 0, width, height);
    return;
  }

  drawSky();
  drawMottledBackground();
  drawMist();
}

function drawSky() {
  noStroke();
  for (let y = 0; y < height; y += 2) {
    const t = map(y, 0, height, 0, 1);
    const c = lerpColor(color(39, 150, 224), color(214, 243, 255), t);
    fill(c);
    rect(0, y, width, 2);
  }
}

function drawMottledBackground() {
  if (backgroundWashLayer) {
    image(backgroundWashLayer, 0, 0, width, height);
  }
}

function randomFromSeed(seed, minValue, maxValue) {
  const n = sin(seed * 12.9898) * 43758.5453;
  return lerp(minValue, maxValue, n - floor(n));
}

function drawMist() {
  noStroke();
  for (let y = height * 0.48; y < height; y += 3) {
    const t = map(y, height * 0.48, height, 0, 1);
    fill(255, 255, 255, pow(t, 1.55) * 48);
    rect(0, y, width, 3);
  }
}

function drawStem() {
  noFill();
  stroke(219, 255, 238, 190);
  strokeWeight(1.75);
  bezier(
    stemStartX,
    stemStartY,
    lerp(stemStartX, coreX, 0.28) - 20,
    lerp(stemStartY, coreY, 0.28),
    lerp(stemStartX, coreX, 0.72) - 8,
    lerp(stemStartY, coreY, 0.72),
    coreX,
    coreY
  );
}

function drawSharpDandelion() {
  push();

  const projection = createProjectionContext();
  const focusMultiplier = getFocusMultiplier();
  const orderedRays = rays
    .map((ray) => ({
      ray,
      startPoint: projectLocalPoint(getAnimatedRayLocal(ray, ray.start), ray.start, projection),
      endPoint: projectLocalPoint(getAnimatedRayLocal(ray, ray.end), ray.end, projection),
    }))
    .sort((a, b) => b.endPoint.z - a.endPoint.z);

  for (const item of orderedRays) {
    const { ray, startPoint, endPoint } = item;
    const visibility = depthVisibility(endPoint.z);
    const alpha = ray.alpha * 0.82 * visibility * focusMultiplier;
    stroke(255, 255, 255, alpha);
    strokeWeight(ray.weight * 1.18 * endPoint.scale);
    line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

    drawRayTerminal(ray, endPoint, visibility * focusMultiplier);

    noStroke();
    push();
    translate(endPoint.x, endPoint.y);
    rotate(ray.glyphRot);
    textAlign(CENTER, CENTER);
    textFont("Noto Sans SC");
    textSize(ray.glyphSize * endPoint.scale);
    fill(255, 255, 255, ray.alpha * 1.08 * visibility * focusMultiplier);
    text(ray.glyph, 0, 0);
    pop();
  }

  drawCoreBloom();

  pop();
}

function drawRayTerminal(ray, endPoint, visibility) {
  const scale = endPoint.scale;
  const glowAlpha = ray.terminal.glowAlpha * visibility;

  drawTerminalBloomAura(endPoint, ray.terminal, glowAlpha, scale);

  for (const fluff of ray.terminal.fluff) {
    const sx = endPoint.x + cos(fluff.angle) * fluff.spread * scale;
    const sy = endPoint.y + sin(fluff.angle) * fluff.spread * scale;
    const ex = endPoint.x + cos(fluff.angle) * (fluff.spread + fluff.length) * scale;
    const ey = endPoint.y + sin(fluff.angle) * (fluff.spread + fluff.length) * scale;

    stroke(255, 255, 255, fluff.alpha * visibility);
    strokeWeight(max(0.38, 0.62 * scale));
    line(sx, sy, ex, ey);
    noStroke();
    fill(255, 255, 255, fluff.alpha * 1.25 * visibility);
    circle(ex, ey, fluff.dotSize * scale);
  }

  drawTerminalHotCore(endPoint, ray.terminal, glowAlpha, scale);
}

function drawCoreBloom() {
  drawGlowImage(coreGlowSprite, coreX, coreY, OVEREXPOSED_GLOW.coreHalo * 1.18, 92);

  push();
  blendMode(ADD);
  noStroke();
  fill(255, 255, 245, 82);
  circle(coreX, coreY, 9);
  fill(255, 255, 255, 188);
  circle(coreX, coreY, 10.5);
  blendMode(BLEND);
  pop();
}

function drawTerminalBloomAura(endPoint, terminal, glowAlpha, scale) {
  const radius = terminal.glowSize * scale;
  const strength = constrain(glowAlpha / 255, 0, 1);
  if (strength <= 0.018) {
    return;
  }

  drawGlowImage(terminalGlowSprite, endPoint.x, endPoint.y, radius * 3.8, min(72, glowAlpha * 0.24));
  drawTerminalSpark(endPoint.x, endPoint.y, radius, glowAlpha, terminal.sparkAngle, terminal.sparkStrength);
}

function drawTerminalHotCore(endPoint, terminal, glowAlpha, scale) {
  const radius = terminal.glowSize * scale;
  const strength = constrain(glowAlpha / 255, 0, 1);
  if (strength <= 0.012) {
    return;
  }

  push();
  blendMode(ADD);
  noStroke();
  fill(255, 255, 255, min(188, 42 + glowAlpha * OVEREXPOSED_GLOW.terminalHotCore * 0.5));
  circle(endPoint.x, endPoint.y, max(1.15, radius * 0.3));
  blendMode(BLEND);
  pop();
}

function drawGlowImage(sprite, x, y, size, alpha) {
  if (!sprite || alpha <= 0 || size <= 0) {
    return;
  }

  push();
  blendMode(ADD);
  imageMode(CENTER);
  tint(255, alpha);
  image(sprite, x, y, size, size);
  noTint();
  blendMode(BLEND);
  pop();
}

function drawTerminalSpark(x, y, radius, glowAlpha, angle, strength) {
  if (strength < 0.5 || glowAlpha < 22) {
    return;
  }

  const alpha = glowAlpha * strength * 0.14;
  strokeCap(ROUND);
  stroke(255, 255, 255, alpha);
  strokeWeight(max(0.32, radius * 0.055));
  drawSparkLine(x, y, angle, radius * lerp(1.5, 3.8, strength));

  stroke(255, 255, 255, alpha * 0.62);
  strokeWeight(max(0.24, radius * 0.035));
  drawSparkLine(x, y, angle + HALF_PI, radius * lerp(0.9, 2.2, strength));
}

function drawSparkLine(x, y, angle, length) {
  const dx = cos(angle) * length;
  const dy = sin(angle) * length;
  line(x - dx * 0.5, y - dy * 0.5, x + dx * 0.5, y + dy * 0.5);
}

function drawFloatingSeeds() {
  const t = millis() * 0.001;
  const focusMultiplier = getFocusLabel() ? 0.42 : 1;

  for (const seed of floatingSeeds) {
    const drift = (t * seed.speed + seed.phase * 0.07) % 1;
    const x = seed.x + drift * width * seed.driftScale + sin(t * 0.72 + seed.phase) * seed.sway;
    const y = seed.y - drift * height * seed.liftScale + cos(t * 0.53 + seed.phase) * seed.sway * 0.45;
    const alpha = seed.alpha * focusMultiplier * sin(drift * PI) * OVEREXPOSED_GLOW.floatingSeedBoost;
    const angle = -0.75 + sin(t * 0.6 + seed.phase) * 0.18;
    const start = {
      x: x - cos(angle) * seed.length,
      y: y - sin(angle) * seed.length,
    };

    stroke(255, 255, 255, alpha * 0.58);
    strokeWeight(0.75);
    line(start.x, start.y, x, y);

    drawRayTerminal(
      { terminal: seed.terminal },
      { x, y, scale: 0.72 },
      alpha / 82
    );

    noStroke();
    fill(255, 255, 255, alpha * 0.82);
    textFont("Noto Sans SC");
    textAlign(CENTER, CENTER);
    textSize(8.5);
    text(seed.glyph, x + 2, y - 1);
  }
}

function drawTexture() {
  noStroke();
  for (const grain of textureGrains) {
    fill(grain.rgb[0], grain.rgb[1], grain.rgb[2], grain.alpha);
    rect(grain.x, grain.y, grain.size, grain.size);
  }
}

function drawTextureOverlay() {
  if (textureLayer) {
    image(textureLayer, 0, 0, width, height);
    return;
  }

  drawTexture();
}

function drawNameLabels() {
  push();
  textFont("Noto Sans SC");
  textAlign(CENTER, CENTER);
  const projectedLabels = getProjectedLabels("draw");

  noFill();

  for (const item of projectedLabels) {
    const { label, startPoint, lineEndPoint, endPoint } = item;
    const selected = getFocusLabel() === label;
    const dim = getFocusLabel() && !selected ? WIND.focusDim : 1;
    const visibility = depthVisibility(endPoint.z);
    const alpha = (selected ? 210 : label.alpha * 0.42 * visibility) * dim * item.alphaMultiplier;
    stroke(255, 255, 255, alpha);
    strokeWeight((selected ? 1.75 : 1) * endPoint.scale);
    line(startPoint.x, startPoint.y, lineEndPoint.x, lineEndPoint.y);
  }

  noStroke();

  for (const item of projectedLabels) {
    const { label, endPoint } = item;
    const selected = getFocusLabel() === label;
    const dim = getFocusLabel() && !selected ? WIND.focusDim : 1;
    const visibility = depthVisibility(endPoint.z);
    textSize(NAME_STYLE.fontSize * endPoint.scale * (selected ? 1.1 : 1));
    fill(255, 255, 255, (selected ? 255 : label.alpha * visibility) * dim * item.alphaMultiplier);
    text(label.message.label, endPoint.x, endPoint.y);
  }

  pop();
}

function mouseMoved() {
  if (isMessagePanelOpen()) {
    cursor(ARROW);
    return;
  }
  if (!isPointerInCanvas()) {
    return;
  }
  hoverLabel = findLabelAt(mouseX, mouseY);
  cursor(hoverLabel ? HAND : "grab");
}

function mousePressed() {
  if (isMessagePanelOpen()) {
    return true;
  }
  if (mouseButton !== LEFT || !isPointerInCanvas()) {
    return true;
  }

  isRotatingView = true;
  dragMoved = false;
  dragStartX = mouseX;
  dragStartY = mouseY;
  dragStartRotationY = rotationY;
  cursor("grabbing");
  return false;
}

function mouseDragged() {
  if (isMessagePanelOpen()) {
    return true;
  }
  if (!isRotatingView) {
    return true;
  }

  const dx = mouseX - dragStartX;
  const dy = mouseY - dragStartY;
  dragMoved = dragMoved || abs(dx) > ROTATION.dragThreshold || abs(dy) > ROTATION.dragThreshold;
  rotationY = dragStartRotationY + dx * ROTATION.dragSensitivity;
  syncDebugState();
  hoverLabel = null;
  cursor("grabbing");
  return false;
}

function mouseReleased() {
  if (isMessagePanelOpen() && !isRotatingView) {
    return true;
  }
  if (!isRotatingView) {
    return true;
  }

  isRotatingView = false;

  if (!dragMoved) {
    const label = findLabelAt(mouseX, mouseY);
    if (label) {
      activeLabel = label;
      showMessagePanel(label.message);
    }
  }

  hoverLabel = findLabelAt(mouseX, mouseY);
  cursor(hoverLabel ? HAND : "grab");
  return false;
}

function isPointerInCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function isMessagePanelOpen() {
  return panelEl && !panelEl.classList.contains("is-hidden");
}

function findLabelAt(x, y) {
  const projectedLabels = getProjectedLabels("hit");

  for (const item of projectedLabels) {
    const { label, endPoint } = item;
    const hitWidth = label.message.label.length * NAME_STYLE.hitWidthPerChar * endPoint.scale;
    const hitHeight = NAME_STYLE.hitHeight * endPoint.scale;
    if (abs(x - endPoint.x) < hitWidth / 2 && abs(y - endPoint.y) < hitHeight) {
      return label;
    }
  }
  return null;
}

function getProjectedLabels(mode) {
  const projection = createProjectionContext();
  const projectedLabels = nameLabels
    .map((label) => projectLabel(label, projection))
    .filter((item) => item && !(mode === "hit" && item.label.release));

  return projectedLabels.sort((a, b) =>
    mode === "hit" ? a.endPoint.z - b.endPoint.z : b.endPoint.z - a.endPoint.z
  );
}

function projectLabel(label, projection) {
  const animatedLocal = getAnimatedRayLocal(label, 1);
  let startPoint = projectLocalPoint(animatedLocal, 0.12, projection);
  let lineEndPoint = projectLocalPoint(animatedLocal, 0.96, projection);
  let endPoint = projectLocalPoint(animatedLocal, 1, projection);
  let alphaMultiplier = 1;

  if (label.release) {
    const progress = getReleaseProgress(label);
    if (progress >= 1) {
      return null;
    }

    const drift = easeInOutSine(progress);
    const detach = smoothStep(0, RELEASE.detachEnd, progress);
    const fade = smoothStep(0.18, 1, progress);
    const originalStart = { ...startPoint };
    const originalLineEnd = { ...lineEndPoint };
    const originalEnd = { ...endPoint };
    const windOffsetX =
      width * label.release.distanceX * drift +
      sin(millis() * 0.0018 + label.release.phase) * RELEASE.sway * drift +
      sin(progress * PI * 1.35 + label.release.gustPhase) * width * 0.035 * drift;
    const windOffsetY =
      height * label.release.distanceY * drift -
      sin(progress * PI) * height * 0.045 +
      cos(millis() * 0.0015 + label.release.phase) * RELEASE.sway * 0.36 * drift;
    const dx = originalLineEnd.x - originalStart.x;
    const dy = originalLineEnd.y - originalStart.y;
    const length = max(1, sqrt(dx * dx + dy * dy));
    const seedLength = label.release.seedLength * endPoint.scale * (1 - progress * 0.2);

    endPoint = {
      ...endPoint,
      x: originalEnd.x + windOffsetX,
      y: originalEnd.y + windOffsetY,
    };
    lineEndPoint = {
      ...lineEndPoint,
      x: lerp(originalLineEnd.x, endPoint.x, detach),
      y: lerp(originalLineEnd.y, endPoint.y, detach),
    };
    const detachedStart = {
      x: endPoint.x - (dx / length) * seedLength,
      y: endPoint.y - (dy / length) * seedLength,
    };
    startPoint = {
      ...startPoint,
      x: lerp(originalStart.x, detachedStart.x, detach),
      y: lerp(originalStart.y, detachedStart.y, detach),
    };
    alphaMultiplier = pow(1 - fade, 1.18);
  }

  return {
    label,
    startPoint,
    lineEndPoint,
    endPoint,
    alphaMultiplier,
  };
}

function getReleaseProgress(label) {
  if (!label.release) {
    return 0;
  }
  return constrain((millis() - label.release.startedAt) / RELEASE.duration, 0, 1);
}

function easeInOutSine(value) {
  return -(cos(PI * value) - 1) / 2;
}

function smoothStep(edge0, edge1, value) {
  const t = constrain((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function releaseLabel(label) {
  if (label.release) {
    return;
  }

  const sideBias = label.local.x < 0 ? 1.08 : 0.92;
  label.release = {
    startedAt: millis(),
    phase: random(TWO_PI),
    gustPhase: random(TWO_PI),
    distanceX: RELEASE.distanceX * random(0.82, 1.18) * sideBias,
    distanceY: RELEASE.distanceY * random(0.82, 1.12),
    seedLength: random(30, 42),
  };
}

function showMessagePanel(message) {
  document.getElementById("message-author").textContent = message.author;
  document.getElementById("message-text").textContent = message.detail;
  endingEl.classList.add("is-hidden");
  panelEl.classList.remove("is-hidden");
}

function closeMessagePanel() {
  activeLabel = null;
  hoverLabel = null;
  if (panelEl) {
    panelEl.classList.add("is-hidden");
  }
  if (endingEl) {
    endingEl.classList.add("is-hidden");
  }
}

function createMessages() {
  return NAME_PLACEHOLDERS.map((name, index) => ({
    author: `第 ${String(index + 1).padStart(2, "0")} 位同事`,
    label: name,
    detail: `${name}，愿你前路明亮，去更辽阔的地方，继续被喜欢的事和喜欢你的人围绕。`,
  }));
}

function createReadableNameSeeds() {
  return [
    { angle: -2.86, radius: 0.123, z: -0.048, alpha: 206 },
    { angle: -2.56, radius: 0.146, z: 0.062, alpha: 224 },
    { angle: -2.23, radius: 0.113, z: -0.092, alpha: 232 },
    { angle: -1.92, radius: 0.146, z: 0.032, alpha: 226 },
    { angle: -1.58, radius: 0.117, z: 0.088, alpha: 236 },
    { angle: -1.25, radius: 0.149, z: -0.036, alpha: 216 },
    { angle: -0.92, radius: 0.122, z: 0.106, alpha: 224 },
    { angle: -0.58, radius: 0.144, z: -0.07, alpha: 218 },
    { angle: -0.22, radius: 0.116, z: 0.044, alpha: 232 },
    { angle: 0.14, radius: 0.15, z: -0.112, alpha: 214 },
    { angle: 0.48, radius: 0.121, z: 0.076, alpha: 226 },
    { angle: 0.82, radius: 0.141, z: -0.026, alpha: 220 },
    { angle: 1.16, radius: 0.113, z: 0.118, alpha: 236 },
    { angle: 1.5, radius: 0.146, z: -0.058, alpha: 218 },
    { angle: 1.84, radius: 0.119, z: 0.052, alpha: 230 },
    { angle: 2.18, radius: 0.149, z: -0.098, alpha: 214 },
    { angle: 2.5, radius: 0.126, z: 0.034, alpha: 224 },
    { angle: 2.78, radius: 0.143, z: 0.092, alpha: 210 },
    { angle: -3.08, radius: 0.111, z: -0.022, alpha: 218 },
    { angle: 3.02, radius: 0.152, z: -0.082, alpha: 202 },
  ];
}

function windowResized() {
  const mount = document.getElementById("poster");
  resizeCanvas(mount.clientWidth, mount.clientHeight);
  initializeScene();
}
