"use strict";
/* Decryption helpers (browser and Node).
   File format:  12-byte IV  +  AES-256-GCM ciphertext  +  16-byte tag
   Key:          PBKDF2-SHA256(passphrase, salt, iterations) -> 32 bytes   */
(function (root) {
  const subtle = () => (root.crypto || globalThis.crypto).subtle;
  const enc = new TextEncoder();

  function b64decode(s) {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function b64encode(u8) {
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }

  async function deriveRaw(passphrase, saltB64, iterations) {
    const base = await subtle().importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveBits"]);
    const bits = await subtle().deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: b64decode(saltB64), iterations },
      base, 256
    );
    return new Uint8Array(bits);
  }

  function importKey(raw) {
    return subtle().importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  }

  // Returns an ArrayBuffer, or throws if the key is wrong / the file was changed.
  function decrypt(key, data) {
    const u = data instanceof Uint8Array ? data : new Uint8Array(data);
    return subtle().decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.subarray(12));
  }

  const Vault = { b64decode, b64encode, deriveRaw, importKey, decrypt };
  root.Vault = Vault;
  if (typeof module !== "undefined" && module.exports) module.exports = Vault;
})(typeof self !== "undefined" ? self : globalThis);
