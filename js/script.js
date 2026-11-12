
const slides = [...document.querySelectorAll(".slide")];
const previousButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const fullscreenButton = document.getElementById("fullscreen");
const counter = document.getElementById("counter");

const video = document.getElementById("video-player");
const videoStatus = document.getElementById("video-status");
const videoFiles = ["videos/video1.mp4", "videos/video2.mp4"];
const videoSlideIndex = slides.length - 1;

const virusLayer = document.getElementById("virus-layer");

const virusGifs = [
  "https://miro.medium.com/0*RA38PzdJipiQExCP.gif",
  "https://miro.medium.com/1*0tfkWrWCeG5gR2tGozNrHg.gif",
  "https://64.media.tumblr.com/994de0f6d0f8fe4e44c9d8afbf74606e/tumblr_nhsqnhRfUj1u79o2lo1_640.gif"
];

let currentSlide = 0;
let currentVideo = 0;
let virusTimeout;
let burstTimeout;
let removeTimeout;
let activeVirusWindows = [];
let gifIndex = 0;

const virusSlides = new Set();
const slideOrder = slides.map((_, i) => i)
  .filter(i => i !== videoSlideIndex)
  .sort(() => Math.random() - 0.5);

slideOrder.forEach(i => {
  if (Math.random() < 0.48 &&
      !virusSlides.has(i - 1) &&
      !virusSlides.has(i + 1)) {
    virusSlides.add(i);
  }
});

function stopVideo() {
  video.pause();
  video.currentTime = 0;
}

function loadVideo(number) {
  currentVideo = number;
  video.src = videoFiles[number];
  video.load();

  videoStatus.textContent =
    `VIDEO ${number + 1} // REPRODUCIENDO`;

  video.play().catch(() => {
    videoStatus.textContent =
      `VIDEO ${number + 1} // PULSA REPRODUCIR`;
  });
}

video.addEventListener("ended", () => {
  if (currentSlide === videoSlideIndex) {
    loadVideo((currentVideo + 1) % videoFiles.length);
  }
});

video.addEventListener("play", () => {
  videoStatus.textContent =
    `VIDEO ${currentVideo + 1} // REPRODUCIENDO`;
});

function clearVirusBurst() {
  clearTimeout(virusTimeout);
  clearTimeout(burstTimeout);
  clearTimeout(removeTimeout);

  activeVirusWindows.forEach(item => item.remove());
  activeVirusWindows = [];

  document.body.classList.remove("hacked");
}

function createWindow(gif, x, y, width, rotation, layer) {
  const popup = document.createElement("img");

  popup.className = "virus-window";
  popup.src = gif;
  popup.alt = "";
  popup.draggable = false;

  popup.style.width = `${width}px`;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.zIndex = String(layer);
  popup.style.transform = `rotate(${rotation}deg)`;

  virusLayer.appendChild(popup);
  activeVirusWindows.push(popup);

  requestAnimationFrame(() => popup.classList.add("spawn"));
}

function createCluster(side, gif) {
  const width = Math.min(210, window.innerWidth * 0.19);
  const height = Math.min(145, window.innerHeight * 0.19);

  const left = side === "left"
    ? 12
    : window.innerWidth - width - 12;

  const top = side === "upper"
    ? 35
    : window.innerHeight - height - 35;

  const amount = 10;

  for (let i = 0; i < amount; i++) {
    const column = i % 3;
    const row = Math.floor(i / 3);

    const x = Math.max(
      5,
      Math.min(window.innerWidth - width - 5,
        left + column * 24 + Math.random() * 16)
    );

    const y = Math.max(
      25,
      Math.min(window.innerHeight - height - 25,
        top + row * 19 + Math.random() * 12)
    );

    createWindow(
      gif,
      x,
      y,
      width,
      Math.random() * 4 - 2,
      50 + i
    );
  }
}

function createVirusBurst() {
  if (
    document.hidden ||
    currentSlide === videoSlideIndex ||
    !virusSlides.has(currentSlide)
  ) {
    scheduleVirusBurst();
    return;
  }

  clearVirusBurst();

  document.body.classList.add("hacked");

  const firstGif = virusGifs[gifIndex % virusGifs.length];
  const secondGif = virusGifs[(gifIndex + 1) % virusGifs.length];
  const thirdGif = virusGifs[(gifIndex + 2) % virusGifs.length];

  gifIndex++;

  createCluster("left", firstGif);
  createCluster("upper", secondGif);
  createCluster("right", thirdGif);

  burstTimeout = setTimeout(() => {
    activeVirusWindows.forEach(popup => {
      popup.classList.remove("spawn");
      popup.classList.add("vanish");
    });

    document.body.classList.remove("hacked");

    removeTimeout = setTimeout(() => {
      activeVirusWindows.forEach(popup => popup.remove());
      activeVirusWindows = [];
    }, 450);

  }, 2500);

  scheduleVirusBurst();
}

function scheduleVirusBurst() {
  clearTimeout(virusTimeout);

  if (
    currentSlide === videoSlideIndex ||
    !virusSlides.has(currentSlide)
  ) return;

  const delay = 7000 + Math.random() * 8000;

  virusTimeout = setTimeout(createVirusBurst, delay);
}

function showSlide(position) {
  clearVirusBurst();

  slides[currentSlide].classList.remove("active");

  currentSlide = (position + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");

  counter.textContent =
    `${currentSlide + 1} / ${slides.length}`;

  if (currentSlide === videoSlideIndex) {
    loadVideo(0);
  } else {
    stopVideo();
    scheduleVirusBurst();
  }
}

nextButton.addEventListener("click", () => {
  showSlide(currentSlide + 1);
});

previousButton.addEventListener("click", () => {
  showSlide(currentSlide - 1);
});

document.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") {
    showSlide(currentSlide + 1);
  }

  if (event.key === "ArrowLeft") {
    showSlide(currentSlide - 1);
  }
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {}
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearVirusBurst();
  } else {
    scheduleVirusBurst();
  }
});

showSlide(0);
