"use strict";

/* =========================================================
   Public settings only.
   Everything personal (letter, captions, photos, videos, our start date)
   is encrypted. It opens with the secret date + the full link.
   ========================================================= */
const CONFIG = {
  herName: "Mokmok",
  birthYear: 1998,
  // Victorville, CA = PST (UTC-8) on this date
  unlockAt: Date.UTC(2026, 10, 8, 8, 0, 0),
  // Open https://your-site/?preview=mokmok to skip the countdown lock (for testing)
  previewKey: "mokmok"
};

const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, "0");
const safeGet = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
const safeSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } };
const safeDel = (k) => { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } };
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };

let KEY = null;   // AES key, in memory only
let DATA = null;  // decrypted content
let META = null;  // vault.json (salt, iterations, content file name)
let TOGETHER = null;

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

/* ---------- vault: fetch + decrypt ---------- */
async function fetchBuf(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error("Could not load " + path + " (" + r.status + ")");
  return r.arrayBuffer();
}

async function getMeta() {
  if (!META) {
    const r = await fetch("vault.json?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error("vault.json " + r.status);
    META = await r.json();
  }
  return META;
}

// Throws {bad:true} when the key is wrong, any other error means a network problem.
async function openVault(raw) {
  const meta = await getMeta();
  const buf = await fetchBuf(meta.content);
  let plain;
  try {
    const key = await Vault.importKey(raw);
    plain = await Vault.decrypt(key, buf);
    KEY = key;
  } catch (e) {
    const err = new Error("wrong key");
    err.bad = true;
    throw err;
  }
  DATA = JSON.parse(new TextDecoder().decode(plain));
}

const blobCache = new Map();
function blobUrl(path, mime) {
  if (!blobCache.has(path)) {
    const p = fetchBuf(path)
      .then((buf) => Vault.decrypt(KEY, buf))
      .then((plain) => URL.createObjectURL(new Blob([plain], { type: mime })))
      .catch((e) => { blobCache.delete(path); throw e; });
    blobCache.set(path, p);
  }
  return blobCache.get(path);
}

// the secret part of the link: https://site/#k=...
function getSecret() {
  const m = /[#&]k=([A-Za-z0-9_-]+)/.exec(location.hash);
  if (m) { lsSet("s", m[1]); return m[1]; }
  return lsGet("s") || "";
}

/* ---------- floating hearts (all red) ---------- */
const FLOATERS = ["❤️", "∞", "🌹", "❤️", "∞", "❤️"];
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
  const icons = ["❤️", "❤️", "🌹", "∞", "❤️"];
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
  const pieces = ["🎉", "❤️", "🌹", "🎈", "❤️", "∞", "⭐", "🎊"];
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
  const btn = form.querySelector("button");
  let busy = false;

  const fail = (text) => {
    msg.textContent = text;
    form.classList.remove("shake");
    void form.offsetWidth;
    form.classList.add("shake");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    const secret = getSecret();
    if (!secret) {
      msg.textContent = "Please open the exact link I sent you, the whole thing 💌";
      return;
    }
    let digits = $("#pw").value.replace(/\D/g, "");
    if (digits.length === 7) digits = "0" + digits; // day without its leading zero
    busy = true;
    btn.disabled = true;
    msg.textContent = "Opening… 🔐";
    try {
      const meta = await getMeta();
      const raw = await Vault.deriveRaw(digits + "|" + secret, meta.salt, meta.iter);
      await openVault(raw);
      safeSet("vk", Vault.b64encode(raw));
      msg.textContent = "";
      openSite(true);
    } catch (err) {
      if (err && err.bad) fail("Hmm, not quite. Think of the day it all began 🥰");
      else fail("Can't load right now. Check your connection and try again 📶");
    } finally {
      busy = false;
      btn.disabled = false;
    }
  });
}

async function autoOpen() {
  const stored = safeGet("vk");
  if (!stored) return false;
  try {
    await openVault(Vault.b64decode(stored));
    return true;
  } catch (e) {
    safeDel("vk");
    return false;
  }
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
  $("#ageLine").textContent = "Today the world celebrates your " + ordinal(age) + " year, and I celebrate you. 🥰";
  const [y, m, d] = DATA.togetherSince.split("-").map(Number);
  TOGETHER = new Date(y, m - 1, d);
  $("#sinceText").textContent = TOGETHER.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

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
    const p = parts(Date.now() - TOGETHER.getTime());
    $("#tgD").textContent = p.d;
    $("#tgH").textContent = pad2(p.h);
    $("#tgM").textContent = pad2(p.m);
    $("#tgS").textContent = pad2(p.s);
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- gallery + lightbox (photos and videos) ---------- */
let songWasPlaying = false;
let lbToken = 0;

function buildGallery() {
  const gal = $("#gallery");
  const section = $("#story");
  const check = () => { if (!gal.children.length) section.classList.add("hidden"); };

  DATA.memories.forEach((m) => {
    const fig = document.createElement("figure");
    fig.style.aspectRatio = String(m.ratio); // reserves the space while the thumbnail decrypts
    const img = document.createElement("img");
    img.alt = m.caption;
    img.decoding = "async";
    img.addEventListener("load", () => img.classList.add("ready"));
    fig.appendChild(img);
    if (m.kind === "video") {
      fig.classList.add("is-video");
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
    blobUrl(m.thumb, "image/jpeg").then((u) => { img.src = u; }).catch(() => { fig.remove(); check(); });
  });

  $("#lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox" || e.target.id === "lbClose") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#lightbox").classList.contains("hidden")) closeLightbox();
  });
}

async function openLightbox(m) {
  const token = ++lbToken;
  const box = $("#lbMedia");
  box.textContent = "";
  $("#lbCap").textContent = m.caption;
  $("#lbMsg").textContent = m.message || "";
  $("#lightbox").classList.remove("hidden");

  // the small version is already decrypted, so something shows right away
  const preview = document.createElement("img");
  preview.className = "lb-thumb";
  preview.alt = m.caption;
  box.appendChild(preview);
  const loading = document.createElement("p");
  loading.className = "lb-loading";
  loading.textContent = "Loading… 🔐";
  box.appendChild(loading);
  try { preview.src = await blobUrl(m.thumb, "image/jpeg"); } catch (e) { /* ignore */ }
  if (token !== lbToken) return;

  let url;
  try { url = await blobUrl(m.full, m.mime); }
  catch (e) { loading.textContent = "Couldn't load this one 📶"; return; }
  if (token !== lbToken) return;

  box.textContent = "";
  if (m.kind === "video") {
    const v = document.createElement("video");
    v.src = url;
    if (preview.src) v.poster = preview.src; // shows a frame until it starts
    v.controls = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    box.appendChild(v);
    // pause the song while a video plays, so the two don't overlap
    const song = $("#song");
    songWasPlaying = !song.paused;
    if (songWasPlaying) { song.pause(); $("#music").classList.remove("playing"); }
    v.play().catch(() => { /* the viewer can press play */ });
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.alt = m.caption;
    box.appendChild(img);
  }
}

function closeLightbox() {
  lbToken++;
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

/* ---------- reason cards ---------- */
function buildCards() {
  const wrap = $("#cards");
  DATA.reasons.forEach((r) => {
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
    $("#candles").textContent = "💨";
    $("#wishHint").classList.add("hidden");
    const t = $("#wishText");
    t.textContent = DATA.wish;
    t.classList.remove("hidden");
    const b = cake.getBoundingClientRect();
    burstAt(b.left + b.width / 2, b.top + b.height / 2, 30, 200);
    confetti(60);
  });
}

/* ---------- letter (typewriter) ---------- */
function setupLetter() {
  const el = $("#letterText");
  const full = DATA.letter + "\n\nForever yours ❤️" + (DATA.fromName ? "\n" + DATA.fromName : "");
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
async function start() {
  getSecret(); // remembers the secret from the link right away
  if (!preview && Date.now() < CONFIG.unlockAt) { show("#lock"); runLockCountdown(); startHearts(); return; }
  if (await autoOpen()) { openSite(false); return; }
  show("#gate");
  startHearts();
}
setupGate();
setupMusic();
start();
