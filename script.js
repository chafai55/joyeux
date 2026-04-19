const HER_NAME = "Yaaasmin"; // 💖 change this

/* -------- CANVAS -------- */
const bg = document.getElementById("bg");
const bgCtx = bg.getContext("2d");

const heartCanvas = document.getElementById("heartCanvas");
const heartCtx = heartCanvas.getContext("2d");

bg.width = heartCanvas.width = window.innerWidth;
bg.height = heartCanvas.height = window.innerHeight;

/* -------- AUDIO (FIXED) -------- */
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

let audioCtx, analyser, source, dataArray;
let playing = false;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  source = audioCtx.createMediaElementSource(music);
  analyser = audioCtx.createAnalyser();

  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

/* Button control */
musicBtn.onclick = async () => {
  try {
    if (!audioCtx) initAudio();

    await audioCtx.resume();

    if (music.paused) {
      await music.play();
      playing = true;
      musicBtn.textContent = "🔇 Mute";
    } else {
      music.pause();
      playing = false;
      musicBtn.textContent = "🔊 Music";
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Music failed. Make sure music.mp3 is in the same folder.");
  }
};

/* Auto start music on first click (browser-safe) */
document.addEventListener("click", () => {
  if (!playing) {
    musicBtn.click();
  }
}, { once: true });

/* -------- GALAXY BACKGROUND -------- */
let stars = [];
let shootingStars = [];

function initGalaxy() {
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * bg.width,
      y: Math.random() * bg.height,
      size: Math.random() * 2
    });
  }
}

function drawGalaxy() {
  bgCtx.fillStyle = "black";
  bgCtx.fillRect(0, 0, bg.width, bg.height);

  stars.forEach(s => {
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    bgCtx.fillStyle = "white";
    bgCtx.fill();
  });

  if (Math.random() < 0.02) {
    shootingStars.push({
      x: Math.random() * bg.width,
      y: 0,
      vx: 4,
      vy: 4,
      life: 100
    });
  }

  shootingStars.forEach((s, i) => {
    s.x += s.vx;
    s.y += s.vy;
    s.life--;

    bgCtx.strokeStyle = "white";
    bgCtx.beginPath();
    bgCtx.moveTo(s.x, s.y);
    bgCtx.lineTo(s.x - 20, s.y - 20);
    bgCtx.stroke();

    if (s.life <= 0) shootingStars.splice(i, 1);
  });
}

/* -------- BEAT DETECTION -------- */
function getBeat() {
  if (!analyser) return 1;

  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  return sum / dataArray.length / 50;
}

/* -------- HEART -------- */
let showHeart = false;

function drawHeart() {
  let beat = getBeat();
  let scale = 10 + beat * 20;

  heartCtx.beginPath();

  for (let i = 0; i < Math.PI * 2; i += 0.02) {
    let x = 16 * Math.pow(Math.sin(i), 3);
    let y =
      13 * Math.cos(i) -
      5 * Math.cos(2 * i) -
      2 * Math.cos(3 * i) -
      Math.cos(4 * i);

    let dx = heartCanvas.width / 2 + x * scale;
    let dy = heartCanvas.height / 2 - y * scale;

    if (i === 0) heartCtx.moveTo(dx, dy);
    else heartCtx.lineTo(dx, dy);
  }

  heartCtx.shadowBlur = 30;
  heartCtx.shadowColor = "hotpink";
  heartCtx.strokeStyle = "pink";
  heartCtx.stroke();
}

/* -------- EXPLOSION -------- */
let explosionParticles = [];

function createExplosion() {
  for (let i = 0; i < 120; i++) {
    explosionParticles.push({
      x: heartCanvas.width / 2,
      y: heartCanvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 100
    });
  }
}

/* -------- TYPEWRITER -------- */
function typeWriter(el, text) {
  el.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      el.innerHTML += text[i];
      i++;
      setTimeout(type, 50);
    } else {
      createExplosion(); // 💥
    }
  }

  type();
}

/* -------- SCENES -------- */
let scene = 0;
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const replayBtn = document.getElementById("replayBtn");

function updateScene() {
  showHeart = false;
  subtitleEl.innerText = "";

  if (scene === 4) {
    showHeart = true;
    replayBtn.style.display = "inline-block";

    titleEl.innerText = "Happy Birthday ❤️";

    setTimeout(() => {
      typeWriter(subtitleEl, `${HER_NAME}, you are my favorite story 🌸`);
    }, 500);
  } else {
    titleEl.innerText = "";
    subtitleEl.innerText = [
      "In a world full of randomness...",
      "Something beautiful started to grow...",
      "And then... you came into my life",
      "You made everything brighter"
    ][scene];
  }
}

/* -------- ANIMATION LOOP -------- */
function animate() {
  bgCtx.clearRect(0, 0, bg.width, bg.height);
  heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

  drawGalaxy();

  if (showHeart) drawHeart();

  explosionParticles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    heartCtx.fillStyle = `hsl(${Math.random()*360},80%,70%)`;
    heartCtx.fillRect(p.x, p.y, 3, 3);

    if (p.life <= 0) explosionParticles.splice(i, 1);
  });

  requestAnimationFrame(animate);
}

/* -------- INTERACTION -------- */
document.addEventListener("click", () => {
  if (scene < 4) {
    scene++;
    updateScene();
  }
});

replayBtn.onclick = () => {
  scene = 0;
  replayBtn.style.display = "none";
  updateScene();
};

/* -------- INIT -------- */
initGalaxy();
updateScene();
animate();
music.addEventListener("play", () => {
  console.log("MUSIC IS PLAYING ✅");
});

music.addEventListener("error", (e) => {
  console.log("AUDIO ERROR ❌", e);
});
music.volume = 1;
music.muted = false;
