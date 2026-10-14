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

// Put your photos in the "images" folder and list them here.
// Any photo that is missing is simply skipped.
const PHOTOS = [
  { src: "images/photo1.jpg", caption: "Where it all began" },
  { src: "images/photo2.jpg", caption: "My favorite smile" },
  { src: "images/photo3.jpg", caption: "Us, being us" },
  { src: "images/photo4.jpg", caption: "Just another perfect day" },
  { src: "images/photo5.jpg", caption: "You, always you" },
  { src: "images/photo6.jpg", caption: "Home is wherever you are" },
  { src: "images/photo7.jpg", caption: "My heart, in one picture" },
  { src: "images/photo8.jpg", caption: "And many more to come" }
];

const REASONS = [
  ["You're always on my side", "Right or wrong, win or lose, I never have to wonder where you stand."],
  ["You never nag", "You give me space and trust, and somehow that makes me want to be better."],
  ["No drama. Ever.", "With you, disagreements end in understanding. The peace lives where you are."],
  ["Your big heart", "You give so generously and never keep score."],
  ["Your tenderness", "The way you care is quiet and constant, and it reaches me every single time."],
  ["Your steadiness", "In a noisy world you stay calm and strong, and I lean on that more than you know."],
  ["You understand me", "Half the time you get what I mean before I even find the words."],
  ["Only you", "Out of everyone in the world, I would choose you again. And again."]
];

const LETTER = [
  "My Mokmok,",
  "",
  "Happy birthday, my love. Twenty-eight looks beautiful on you, but honestly, everything does.",
  "",
  "I never know how to say this the way it lives inside me, so I'll say it plainly: I love every single thing about you. Your big heart, your tenderness, your steadiness, the way you understand me even when I don't explain myself.",
  "",
  "You are always on my side. Always. You never nag, you never start fights, you never make me feel like I have to earn peace, because you are the peace. Do you know how rare that is? I do, and I never take it for granted, not for a single day.",
  "",
  "Since December 5th my days have a different shape. The ordinary ones became my favorites, just because you're in them.",
  "",
  "And I mean this with my whole heart: I don't want anyone else in this world. Not a different life, not a different version of this story. Just you. Every morning, every storm, every boring Tuesday.",
  "",
  "So here's my promise on your birthday: I will keep choosing you, keep showing up, and keep trying to deserve the way you love me.",
  "",
  "Happy birthday, Monica. Thank you for being mine."
].join("\n");

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
let heartsTimer = null;
function startHearts() {
  if (heartsTimer) return;
  const layer = $("#hearts");
  heartsTimer = setInterval(() => {
    if (document.hidden) return;
    const h = document.createElement("span");
    h.className = "fheart";
    h.textContent = Math.random() > 0.3 ? "♥" : "❤";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 12 + Math.random() * 20 + "px";
    const dur = 9 + Math.random() * 9;
    h.style.animationDuration = dur + "s";
    layer.appendChild(h);
    setTimeout(() => h.remove(), dur * 1000 + 200);
  }, 1100);
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
      msg.textContent = "Hmm, not quite. Think of the day it all began ♥";
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
  if (userGesture) playMusic();
}

function buildSite() {
  $("#herName").textContent = CONFIG.herName;
  const age = new Date(CONFIG.unlockAt).getUTCFullYear() - CONFIG.birthYear;
  $("#ageLine").textContent = "Today the world celebrates your " + ordinal(age) + " year, and I celebrate you.";
  $("#sinceText").textContent = CONFIG.togetherSince.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  buildGallery();
  buildCards();
  startTogetherCounter();
  setupLetter();
  setupFinale();
  setupReveal();
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

function buildGallery() {
  const gal = $("#gallery");
  const section = $("#story");
  const check = () => { if (!gal.children.length) section.classList.add("hidden"); };
  PHOTOS.forEach((p) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = p.caption;
    img.addEventListener("error", () => { fig.remove(); check(); });
    img.src = p.src;
    const cap = document.createElement("figcaption");
    cap.textContent = p.caption;
    fig.append(img, cap);
    fig.addEventListener("click", () => {
      $("#lbImg").src = p.src;
      $("#lbImg").alt = p.caption;
      $("#lbCap").textContent = p.caption;
      $("#lightbox").classList.remove("hidden");
    });
    gal.appendChild(fig);
  });
  $("#lightbox").addEventListener("click", () => $("#lightbox").classList.add("hidden"));
}

function buildCards() {
  const wrap = $("#cards");
  REASONS.forEach((r, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML =
      '<div class="card-inner">' +
      '<div class="face front"><span class="num"></span><span class="title"></span></div>' +
      '<div class="face back"></div></div>';
    card.querySelector(".num").textContent = "#" + (i + 1);
    card.querySelector(".title").textContent = r[0];
    card.querySelector(".back").textContent = r[1];
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    wrap.appendChild(card);
  });
}

/* ---------- letter (typewriter) ---------- */
function setupLetter() {
  const el = $("#letterText");
  let typer = null;
  const finish = () => {
    clearInterval(typer);
    el.textContent = LETTER + (CONFIG.fromName ? "\n\nForever yours,\n" + CONFIG.fromName : "\n\nForever yours");
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
      el.textContent = LETTER.slice(0, i);
      if (i >= LETTER.length) finish();
    }, 32);
  });
  $("#skipLetter").addEventListener("click", finish);
}

/* ---------- finale ---------- */
function setupFinale() {
  $("#loveBtn").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 46; i++) {
      const h = document.createElement("span");
      h.className = "burst";
      h.textContent = Math.random() > 0.5 ? "❤" : "♥";
      h.style.left = cx + "px";
      h.style.top = cy + "px";
      h.style.color = Math.random() > 0.5 ? "#f0a6b8" : "#d96b8a";
      h.style.fontSize = 14 + Math.random() * 22 + "px";
      const a = Math.random() * Math.PI * 2;
      const d = 90 + Math.random() * 190;
      h.style.setProperty("--x", Math.cos(a) * d + "px");
      h.style.setProperty("--y", Math.sin(a) * d + "px");
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1600);
    }
    $("#loveBtn").classList.add("hidden");
    $("#loveText").classList.remove("hidden");
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
