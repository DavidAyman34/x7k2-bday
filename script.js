"use strict";

/* =========================================================
   EDIT ME: everything personal lives in this block
   ========================================================= */
const CONFIG = {
  herName: "Mokmok",
  herFullName: "Monica",
  birthYear: 1998,
  // Opens on Nov 8, 2026 at 00:00 Cairo time (UTC+2 in November)
  unlockAt: Date.UTC(2026, 10, 7, 22, 0, 0),
  // Our start date: 5 December 2025 (month is 0-based, so 11 = December)
  togetherSince: new Date(2025, 11, 5),
  // SHA-256 of "05122025" (DDMMYYYY). Change it by hashing a new code.
  passwordHash: "98dd37fe18b59c8f6a53cf7b8905fc98351e63c6464ddbde37be7a2739329386",
  // Open https://your-site/?preview=mokmok to skip the countdown lock (for testing)
  previewKey: "mokmok",
  fromName: "" // put your name here if you want it under the letter
};

// Photos AND videos: put the files in the "images" folder and list them here.
//   caption = the short title under the picture
//   message = your personal note, shown when she taps the photo/video
// Videos are detected by the file ending (.mp4, .webm, .mov, .m4v).
// Any file that is missing is simply skipped, so you can list more than you upload.
const MEMORIES = [
  { src: "images/photo1.jpg", caption: "Where it all began \u{1F972}",
    message: "The day everything started to make sense. I didn't know it yet, but you were already my whole world. \u{1F979}" },
  { src: "images/photo2.jpg", caption: "My favorite smile \u{1F60D}",
    message: "This smile fixes my worst days. I'd do anything to keep it on your face. \u{1F496}" },
  { src: "images/photo3.jpg", caption: "Us, being us \u{1F495}",
    message: "No filters, no acting, just us. This is my favorite version of life. \u{1F970}" },
  { src: "images/photo4.jpg", caption: "Just another perfect day ✨",
    message: "Any day is perfect when you're in it. Even the boring ones. \u{1F90D}" },
  { src: "images/video1.mp4", caption: "Our little movie \u{1F3AC}",
    message: "Press play and fall in love with us all over again. \u{1F49E}" },
  { src: "images/photo5.jpg", caption: "You, always you \u{1F339}",
    message: "I could look at this picture all day and still not get enough of you. \u{1F60D}" },
  { src: "images/photo6.jpg", caption: "Home is wherever you are \u{1F3E1}",
    message: "I finally understood what 'home' means when I met you. \u{1F90D}" },
  { src: "images/video2.mp4", caption: "Replay this one \u{1F3A5}",
    message: "Some moments deserve to be watched again and again. This is one of them. \u{1F970}" },
  { src: "images/photo7.jpg", caption: "My heart, in one picture \u{1F496}",
    message: "If you ever wonder where my heart is, it's right here, with you. \u{1F497}" },
  { src: "images/photo8.jpg", caption: "And many more to come \u{1F970}",
    message: "This is only the beginning. I have so many more memories I want to make with you. \u{1F496}" }
];

// [emoji, title, text on the back of the card]
const REASONS = [
  ["\u{1FAF6}", "You're always on my side", "Right or wrong, win or lose, I never have to wonder where you stand. You're my person. \u{1F90D}"],
  ["\u{1F54A}️", "You never nag", "You give me space and trust, and somehow that makes me want to be better for you. \u{1F970}"],
  ["☁️", "No drama. Ever.", "With you, everything ends in understanding. The peace lives where you are. \u{1F49E}"],
  ["\u{1F496}", "Your big heart", "You give so generously and never keep score. I'm so lucky I get to be loved by you. \u{1F979}"],
  ["\u{1F338}", "Your tenderness", "The way you care is quiet and constant, and it reaches me every single time. \u{1F90D}"],
  ["\u{1F9F8}", "Your steadiness", "In a noisy world you stay calm and strong, and I lean on that more than you know. \u{1F917}"],
  ["\u{1F52E}", "You understand me", "Half the time you get what I mean before I even find the words. How do you do that? \u{1F97A}"],
  ["\u{1F512}", "Only you", "Out of everyone in the whole world, I'd choose you again. And again. And again. \u{1F498}"]
];

const LETTER = [
  "My Mokmok \u{1F90D}\u{1F339}",
  "",
  "Happy birthday, my love! \u{1F382}✨",
  "",
  "Today is YOUR day, and honestly it's my favorite day of the whole year, because it's the day the world got you. \u{1F979}",
  "",
  "I tried so hard to find the perfect words for this letter, and I couldn't, because no words are big enough. So I'll just tell you the truth, straight from my heart:",
  "",
  "I love you. \u{1F496} I love every little thing about you.",
  "I love how big your heart is, how gentle you are, and how steady you stay when everything around us gets loud. \u{1F90D}",
  "I love that you understand me even when I say nothing at all. \u{1F97A}",
  "",
  "You are always on my side. Always. \u{1FAF6}",
  "You never nag, you never pick fights, you never make me feel small. You are my peace, my calm, my safe place. \u{1F3E1}\u{1F497}",
  "Do you know how rare you are? I do. And I never take it for granted, not for a single day.",
  "",
  "Ever since December 5th, even my most ordinary days turned into my favorites, just because you're in them. \u{1F319}☀️",
  "",
  "And I want you to hear this clearly: I don't want anyone else in this world. Not now, not ever. \u{1F512}",
  "It's you. It has always been you. Every morning, every storm, every boring Tuesday, I choose you. \u{1F49E}",
  "",
  "My promise to you on your birthday: I'll keep choosing you, keep showing up, and keep trying to deserve the way you love me. \u{1F339}",
  "",
  "Happy birthday, my Mokmok. Thank you for being mine. \u{1F90D}\u{1F382}"
].join("\n");

const WISH_TEXT = "Whatever you wished for, I'll do everything I can to make it come true. And me? I wished for you. Again. \u{1F970}";

/* =========================================================
   Code below: no need to touch
   ========================================================= */
const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, "0");
const safeGet = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
const safeSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } };

function show(id) {
  ["#lock", "#gate", "#site"].forEach((s) => $(s).classList.toggle("hidden", s !== id));
  window.scrollTo(0, 0);
}

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function ordinal(n) {
  const v = n % 100;
  const suf = ["th", "st", "nd", "rd"];
  return n + (suf[(v - 20) % 10] || suf[v] || suf[0]);
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- floating hearts ---------- */
const FLOATERS = ["♥", "\u{1F496}", "\u{1F497}", "✨", "\u{1F339}", "\u{1F495}", "\u{1F338}", "\u{1F90D}"];
let heartsTimer = null;
function startHearts() {
  if (heartsTimer) return;
  const layer = $("#hearts");
  heartsTimer = setInterval(() => {
    if (document.hidden) return;
    const h = document.createElement("span");
    h.className = "fheart";
    h.textContent = FLOATERS[Math.floor(Math.random() * FLOATERS.length)];
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 14 + Math.random() * 22 + "px";
    const dur = 8 + Math.random() * 8;
    h.style.animationDuration = dur + "s";
    layer.appendChild(h);
    setTimeout(() => h.remove(), dur * 1000 + 200);
  }, 800);
}

/* ---------- bursts and confetti ---------- */
function burstAt(x, y, n, spread) {
  const icons = ["❤️", "\u{1F496}", "\u{1F497}", "\u{1F495}", "✨"];
  for (let i = 0; i < n; i++) {
    const h = document.createElement("span");
    h.className = "burst";
    h.textContent = icons[Math.floor(Math.random() * icons.length)];
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.fontSize = 14 + Math.random() * 20 + "px";
    const a = Math.random() * Math.PI * 2;
    const d = spread * (0.45 + Math.random() * 0.55);
    h.style.setProperty("--x", Math.cos(a) * d + "px");
    h.style.setProperty("--y", Math.sin(a) * d + "px");
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1600);
  }
}

function confetti(n) {
  const pieces = ["\u{1F389}", "✨", "\u{1F496}", "\u{1F339}", "\u{1F388}", "\u{1F497}", "⭐", "\u{1F38A}"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("span");
    c.className = "confetti";
    c.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    c.style.left = Math.random() * 100 + "vw";
    c.style.fontSize = 14 + Math.random() * 20 + "px";
    const dur = 2.8 + Math.random() * 2.5;
    c.style.animationDuration = dur + "s";
    c.style.animationDelay = Math.random() * 1 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), (dur + 1.2) * 1000);
  }
}

/* ---------- lock countdown ---------- */
let lockTimer = null;
function runLockCountdown() {
  const tick = () => {
    const left = CONFIG.unlockAt - Date.now();
    if (left <= 0) { clearInterval(lockTimer); start(); return; }
    const p = parts(left);
    $("#lcD").textContent = p.d;
    $("#lcH").textContent = pad2(p.h);
    $("#lcM").textContent = pad2(p.m);
    $("#lcS").textContent = pad2(p.s);
  };
  tick();
  lockTimer = setInterval(tick, 1000);
}

/* ---------- gate ---------- */
function setupGate() {
  const form = $("#gateForm");
  const msg = $("#gateMsg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let digits = $("#pw").value.replace(/\D/g, "");
    if (digits.length === 7) digits = "0" + digits; // 5122025 -> 05122025
    let hash = "";
    try {
      hash = await sha256(digits);
    } catch (err) {
      msg.textContent = "Your browser can't check the code here. Try Chrome or Safari.";
      return;
    }
    if (hash === CONFIG.passwordHash) {
      safeSet("ok", "1");
      msg.textContent = "";
      openSite(true);
    } else {
      msg.textContent = "Hmm, not quite. Think of the day it all began \u{1F970}";
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    }
  });
}

/* ---------- site ---------- */
let built = false;
function openSite(userGesture) {
  show("#site");
  if (!built) { built = true; buildSite(); }
  startHearts();
  $("#music").classList.remove("hidden");
  setTimeout(() => confetti(70), 300);
  if (userGesture) playMusic();
}

function buildSite() {
  $("#herName").textContent = CONFIG.herName;
  const age = new Date(CONFIG.unlockAt).getUTCFullYear() - CONFIG.birthYear;
  $("#ageLine").textContent = "Today the world celebrates your " + ordinal(age) + " year, and I celebrate you. \u{1F970}";
  $("#sinceText").textContent = CONFIG.togetherSince.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  buildGallery();
  buildCards();
  startTogetherCounter();
  setupWish();
  setupLetter();
  setupFinale();
  setupReveal();

  // tap anywhere for a little shower of hearts
  document.addEventListener("click", (e) => {
    if ($("#site").classList.contains("hidden")) return;
    if (e.target.closest("button, input, figure, .lightbox, a")) return;
    burstAt(e.clientX, e.clientY, 7, 80);
  });
}

function startTogetherCounter() {
  const tick = () => {
    const p = parts(Date.now() - CONFIG.togetherSince.getTime());
    $("#tgD").textContent = p.d;
    $("#tgH").textContent = pad2(p.h);
    $("#tgM").textContent = pad2(p.m);
    $("#tgS").textContent = pad2(p.s);
  };
  tick();
  setInterval(tick, 1000);
}

const isVideo = (src) => /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src);
let songWasPlaying = false;

function openLightbox(m) {
  const box = $("#lbMedia");
  box.textContent = "";
  let el;
  if (isVideo(m.src)) {
    el = document.createElement("video");
    el.src = m.src;
    el.controls = true;
    el.autoplay = true;
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    // pause the song while a video plays, so the two don't overlap
    const song = $("#song");
    songWasPlaying = !song.paused;
    if (songWasPlaying) { song.pause(); $("#music").classList.remove("playing"); }
  } else {
    el = document.createElement("img");
    el.src = m.src;
    el.alt = m.caption;
  }
  box.appendChild(el);
  $("#lbCap").textContent = m.caption;
  $("#lbMsg").textContent = m.message || "";
  $("#lightbox").classList.remove("hidden");
}

function closeLightbox() {
  const box = $("#lbMedia");
  const v = box.querySelector("video");
  if (v) v.pause();
  box.textContent = "";
  $("#lightbox").classList.add("hidden");
  if (songWasPlaying) {
    songWasPlaying = false;
    $("#song").play().then(() => $("#music").classList.add("playing")).catch(() => {});
  }
}

function buildGallery() {
  const gal = $("#gallery");
  const section = $("#story");
  const check = () => { if (!gal.children.length) section.classList.add("hidden"); };
  MEMORIES.forEach((m) => {
    const fig = document.createElement("figure");
    let media;
    if (isVideo(m.src)) {
      media = document.createElement("video");
      media.muted = true;
      media.playsInline = true;
      media.setAttribute("playsinline", "");
      media.preload = "metadata";
      media.src = m.src + "#t=0.1"; // shows the first frame as the cover
      fig.classList.add("is-video");
    } else {
      media = document.createElement("img");
      media.loading = "lazy";
      media.alt = m.caption;
      media.src = m.src;
    }
    media.addEventListener("error", () => { fig.remove(); check(); });
    fig.appendChild(media);
    if (isVideo(m.src)) {
      const play = document.createElement("span");
      play.className = "play";
      play.textContent = "▶";
      fig.appendChild(play);
    }
    const cap = document.createElement("figcaption");
    cap.textContent = m.caption;
    fig.appendChild(cap);
    fig.addEventListener("click", () => openLightbox(m));
    gal.appendChild(fig);
  });
  $("#lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox" || e.target.id === "lbClose") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#lightbox").classList.contains("hidden")) closeLightbox();
  });
}

function buildCards() {
  const wrap = $("#cards");
  REASONS.forEach((r) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML =
      '<div class="card-inner">' +
      '<div class="face front"><span class="emo"></span><span class="title"></span></div>' +
      '<div class="face back"></div></div>';
    card.querySelector(".emo").textContent = r[0];
    card.querySelector(".title").textContent = r[1];
    card.querySelector(".back").textContent = r[2];
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      const b = card.getBoundingClientRect();
      if (card.classList.contains("flipped")) burstAt(b.left + b.width / 2, b.top + b.height / 2, 6, 70);
    });
    wrap.appendChild(card);
  });
}

/* ---------- birthday wish ---------- */
function setupWish() {
  const cake = $("#cake");
  cake.addEventListener("click", () => {
    if (cake.classList.contains("done")) return;
    cake.classList.add("done");
    $("#candles").textContent = "\u{1F4A8}";
    $("#wishHint").classList.add("hidden");
    const t = $("#wishText");
    t.textContent = WISH_TEXT;
    t.classList.remove("hidden");
    const b = cake.getBoundingClientRect();
    burstAt(b.left + b.width / 2, b.top + b.height / 2, 30, 200);
    confetti(60);
  });
}

/* ---------- letter (typewriter) ---------- */
function setupLetter() {
  const el = $("#letterText");
  const full = LETTER + "\n\nForever yours \u{1F496}" + (CONFIG.fromName ? "\n" + CONFIG.fromName : "");
  const chars = Array.from(full); // keeps emojis whole while typing
  let typer = null;
  const finish = () => {
    clearInterval(typer);
    el.textContent = full;
    el.classList.remove("typing");
    $("#skipLetter").classList.add("hidden");
  };
  $("#openLetter").addEventListener("click", () => {
    $("#openLetter").classList.add("hidden");
    $("#letterBox").classList.remove("hidden");
    $("#skipLetter").classList.remove("hidden");
    el.classList.add("typing");
    let i = 0;
    typer = setInterval(() => {
      i += 1;
      el.textContent = chars.slice(0, i).join("");
      if (i >= chars.length) finish();
    }, 30);
  });
  $("#skipLetter").addEventListener("click", finish);
}

/* ---------- finale ---------- */
function setupFinale() {
  $("#loveBtn").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, 50, 220);
    confetti(80);
    $("#loveBtn").classList.add("hidden");
    $("#loveText").classList.remove("hidden");
    $("#loveEmoji").classList.remove("hidden");
  });
}

/* ---------- scroll reveal ---------- */
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  items.forEach((i) => io.observe(i));
}

/* ---------- music (put your song at song.mp3) ---------- */
function playMusic() {
  const a = $("#song");
  a.play().then(() => $("#music").classList.add("playing")).catch(() => { /* needs a tap */ });
}
function setupMusic() {
  const a = $("#song");
  const btn = $("#music");
  a.addEventListener("error", () => btn.classList.add("hidden"));
  btn.addEventListener("click", () => {
    if (a.paused) { a.play().then(() => btn.classList.add("playing")).catch(() => {}); }
    else { a.pause(); btn.classList.remove("playing"); }
  });
}

/* ---------- start ---------- */
const preview = new URLSearchParams(location.search).get("preview") === CONFIG.previewKey;
function start() {
  if (!preview && Date.now() < CONFIG.unlockAt) { show("#lock"); runLockCountdown(); startHearts(); }
  else if (safeGet("ok") === "1") { openSite(false); }
  else { show("#gate"); startHearts(); }
}
setupGate();
setupMusic();
start();
