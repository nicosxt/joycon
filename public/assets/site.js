/* JoyCon shared script: header, footer, page renderers, small delights.
   Content lives in /data. You shouldn't need to edit this file to change copy. */

(function(){
  "use strict";
  var J = window.JOY || {};
  var S = J.site || {};
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* ---------- helpers ---------- */
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
  function $(sel, root){ return (root || document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function joyType(id){ return (J.joyTypes || []).filter(function(t){ return t.id === id; })[0] || { id: id, label: id || "Joy", color: "#e6d6b6" }; }
  function tagHTML(id){ var t = joyType(id); return '<span class="tag" style="--tag:' + esc(t.color) + '">' + esc(t.label) + '</span>'; }
  function hash(str){ var h = 0; for (var i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) | 0; } return Math.abs(h); }
  var GLASS = ["#a5473a", "#3f5f86", "#3f7a6a", "#cf8f3c", "#c4767a", "#6b5a8c", "#e2b252"];

  function initials(name){
    var clean = String(name || "").replace(/"[^"]*"/g, "").trim().split(/\s+/);
    return ((clean[0] || "?")[0] + (clean.length > 1 ? clean[clean.length - 1][0] : "")).toUpperCase();
  }
  /* stained glass placeholder avatar */
  function avatarSVG(name){
    var h = hash(name || "joy"), n = 8, petals = "";
    for (var i = 0; i < n; i++){
      var a1 = (i / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
      var c = GLASS[(h + i) % GLASS.length];
      petals += '<path d="M50 50 L' + (50 + 50 * Math.cos(a1)).toFixed(1) + ' ' + (50 + 50 * Math.sin(a1)).toFixed(1) +
        ' A50 50 0 0 1 ' + (50 + 50 * Math.cos(a2)).toFixed(1) + ' ' + (50 + 50 * Math.sin(a2)).toFixed(1) + ' Z" fill="' + c + '" stroke="#34302c" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 100 100" role="img" aria-label="Illustrated placeholder for ' + esc(name) + '">' + petals +
      '<circle cx="50" cy="50" r="27" fill="#faf1df" stroke="#34302c" stroke-width="2.5"/>' +
      '<text x="50" y="58" text-anchor="middle" font-family="Patrick Hand SC, Patrick Hand, cursive" font-size="28" fill="#34302c">' + esc(initials(name)) + '</text></svg>';
  }
  /* joyful animal avatars, drawn in the island's style. data/people.js picks one per person. */
  var K = "#42434b";
  function eyes(y, dx){ dx = dx || 9; return '<g fill="' + K + '"><circle cx="' + (50 - dx) + '" cy="' + y + '" r="3.4"/><circle cx="' + (50 + dx) + '" cy="' + y + '" r="3.4"/></g><g fill="#fff"><circle cx="' + (51 - dx) + '" cy="' + (y - 1.2) + '" r="1.1"/><circle cx="' + (51 + dx) + '" cy="' + (y - 1.2) + '" r="1.1"/></g>'; }
  function cheeks(y, dx){ dx = dx || 15; return '<g fill="#f08c94" opacity=".55"><ellipse cx="' + (50 - dx) + '" cy="' + y + '" rx="5" ry="3"/><ellipse cx="' + (50 + dx) + '" cy="' + y + '" rx="5" ry="3"/></g>'; }
  function smile(y, w){ w = w || 5; return '<path d="M' + (50 - w) + ' ' + y + ' q' + w + ' ' + (w * .9) + ' ' + (w * 2) + ' 0" fill="none" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/>'; }
  var STK = ' stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"';
  var ANIMALS = {
    otter: ["#bfe0dc", '<circle cx="28" cy="40" r="7" fill="#a9774f"' + STK + '/><circle cx="72" cy="40" r="7" fill="#a9774f"' + STK + '/><ellipse cx="50" cy="56" rx="28" ry="25" fill="#b98a63"' + STK + '/><ellipse cx="50" cy="66" rx="14" ry="9" fill="#f1dcc0"' + STK + '/>' + eyes(52) + '<ellipse cx="50" cy="61" rx="4.5" ry="3" fill="' + K + '"/>' + smile(66, 4) + '<path d="M30 64 h-10 M31 69 l-9 3 M70 64 h10 M69 69 l9 3" stroke="' + K + '" stroke-width="1.4" stroke-linecap="round"/>'],
    unicorn: ["#e3dcf5", '<path d="M44 30 L50 6 L56 30Z" fill="#f6c86b"' + STK + '/><path d="M46 22 l8 -3 M47 15 l6 -2" stroke="' + K + '" stroke-width="1.4"/><path d="M33 36 l-4 -12 l12 7Z M67 36 l4 -12 l-12 7Z" fill="#fbf3df"' + STK + '/><circle cx="50" cy="56" r="26" fill="#fbf3df"' + STK + '/><path d="M26 50 q-6 -14 10 -20 q2 -8 12 -4 q-10 4 -8 14 q-8 2 -14 10Z" fill="#e98a9a"' + STK + '/><path d="M28 62 q-8 -6 -2 -14" fill="none" stroke="#a7a4e0" stroke-width="5" stroke-linecap="round"/>' + eyes(54) + cheeks(62) + smile(64)],
    bunny: ["#fde3b6", '<ellipse cx="40" cy="24" rx="7" ry="19" fill="#fbf3df"' + STK + ' transform="rotate(-10 40 24)"/><ellipse cx="60" cy="24" rx="7" ry="19" fill="#fbf3df"' + STK + ' transform="rotate(10 60 24)"/><ellipse cx="40" cy="25" rx="3" ry="12" fill="#f4b6c2" transform="rotate(-10 40 25)"/><ellipse cx="60" cy="25" rx="3" ry="12" fill="#f4b6c2" transform="rotate(10 60 25)"/><circle cx="50" cy="60" r="25" fill="#fbf3df"' + STK + '/>' + eyes(57) + cheeks(65) + '<path d="M47 63 h6 l-3 3Z" fill="#e98a9a"/>' + smile(68, 3.5)],
    fox: ["#fde3b6", '<path d="M26 44 L24 16 L44 32Z M74 44 L76 16 L56 32Z" fill="#f2a07b"' + STK + '/><path d="M24 40 Q26 28 50 28 Q74 28 76 40 Q76 64 50 80 Q24 64 24 40Z" fill="#f2a07b"' + STK + '/><path d="M28 50 Q40 56 50 66 Q60 56 72 50 Q70 66 50 80 Q30 66 28 50Z" fill="#fbf3df"' + STK + '/>' + eyes(48, 11) + '<ellipse cx="50" cy="68" rx="4" ry="3" fill="' + K + '"/>' + cheeks(58, 17)],
    songbird: ["#cfe6e4", '<path d="M44 30 q-2 -10 6 -12 M50 29 q2 -10 10 -9" fill="none" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/><circle cx="50" cy="56" r="27" fill="#f6c86b"' + STK + '/><path d="M60 60 q14 -2 12 12 q-12 0 -16 -6Z" fill="#e8a94a"' + STK + '/>' + eyes(50, 10) + '<path d="M45 58 L55 58 L50 66Z" fill="#f2a07b"' + STK + '/>' + cheeks(58, 17) + '<path d="M78 24 v14 a4 3 0 1 1 -2 -3 V26 l8 -2 v10" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>'],
    axolotl: ["#d7ecd9", '<g fill="none" stroke="#e98a9a" stroke-width="5" stroke-linecap="round"><path d="M24 44 l-12 -8 M22 52 l-14 0 M24 60 l-12 8 M76 44 l12 -8 M78 52 l14 0 M76 60 l12 8"/></g><ellipse cx="50" cy="56" rx="30" ry="23" fill="#f4b6c2"' + STK + '/>' + eyes(52, 13) + cheeks(60, 20) + '<path d="M38 62 q12 9 24 0" fill="none" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/>'],
    frog: ["#fbe0d0", '<circle cx="36" cy="38" r="11" fill="#9cc3a0"' + STK + '/><circle cx="64" cy="38" r="11" fill="#9cc3a0"' + STK + '/><ellipse cx="50" cy="60" rx="31" ry="21" fill="#9cc3a0"' + STK + '/><circle cx="36" cy="38" r="6" fill="#fbf3df"/><circle cx="64" cy="38" r="6" fill="#fbf3df"/>' + eyes(38, 14) + cheeks(62, 20) + '<path d="M34 62 q16 12 32 0" fill="none" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/>'],
    bear: ["#d9e7f0", '<circle cx="28" cy="36" r="10" fill="#c49a76"' + STK + '/><circle cx="72" cy="36" r="10" fill="#c49a76"' + STK + '/><circle cx="28" cy="36" r="4.5" fill="#f1dcc0"/><circle cx="72" cy="36" r="4.5" fill="#f1dcc0"/><circle cx="50" cy="58" r="27" fill="#c49a76"' + STK + '/><ellipse cx="50" cy="66" rx="12" ry="9" fill="#f1dcc0"' + STK + '/>' + eyes(53) + '<ellipse cx="50" cy="62" rx="4.5" ry="3" fill="' + K + '"/>' + smile(67, 3.5)],
    penguin: ["#fde3b6", '<circle cx="50" cy="56" r="28" fill="#4f566e"' + STK + '/><path d="M50 40 q-14 -6 -18 8 q-4 18 18 26 q22 -8 18 -26 q-4 -14 -18 -8Z" fill="#fbf3df"' + STK + '/>' + eyes(52, 8) + '<path d="M45 59 L55 59 L50 65Z" fill="#f2a07b"' + STK + '/>' + cheeks(61, 14)],
    hedgehog: ["#e3dcf5", '<path d="M18 62 l-4 -10 l8 -2 l-4 -10 l10 0 l-2 -11 l10 4 l2 -11 l9 7 l3 -10 l7 9 l6 -8 l4 11 l9 -5 l0 11 l10 -1 l-4 10 l9 3 l-6 9Z" fill="#a07a5e"' + STK + '/><ellipse cx="50" cy="62" rx="23" ry="20" fill="#f1dcc0"' + STK + '/>' + eyes(58, 8) + '<circle cx="50" cy="65" r="3.2" fill="' + K + '"/>' + cheeks(66, 14) + smile(70, 3)],
    duck: ["#cfe6e4", '<path d="M48 30 q0 -8 8 -8 q-2 6 -6 9" fill="#f6d36b"' + STK + '/><circle cx="50" cy="56" r="26" fill="#f6d36b"' + STK + '/>' + eyes(51, 10) + '<ellipse cx="50" cy="64" rx="12" ry="6" fill="#f2a07b"' + STK + '/><path d="M40 64 h20" stroke="' + K + '" stroke-width="1.4"/>' + cheeks(58, 17)],
    koala: ["#fde3b6", '<circle cx="26" cy="42" r="13" fill="#b9bcc6"' + STK + '/><circle cx="74" cy="42" r="13" fill="#b9bcc6"' + STK + '/><circle cx="26" cy="42" r="6" fill="#f4d6dc"/><circle cx="74" cy="42" r="6" fill="#f4d6dc"/><circle cx="50" cy="58" r="25" fill="#c9ccd5"' + STK + '/>' + eyes(53, 10) + '<ellipse cx="50" cy="62" rx="6" ry="8" fill="' + K + '"/>' + cheeks(64, 17)],
    seal: ["#fbe0d0", '<ellipse cx="50" cy="58" rx="29" ry="25" fill="#c9d4dc"' + STK + '/>' + eyes(52, 11) + '<ellipse cx="50" cy="60" rx="3.6" ry="2.6" fill="' + K + '"/><path d="M45 64 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/><path d="M32 60 h-10 M33 65 l-9 3 M68 60 h10 M67 65 l9 3" stroke="' + K + '" stroke-width="1.4" stroke-linecap="round"/>' + cheeks(62, 18)],
    cat: ["#d7ecd9", '<path d="M28 44 L27 20 L46 34Z M72 44 L73 20 L54 34Z" fill="#f6c86b"' + STK + '/><circle cx="50" cy="58" r="26" fill="#f6c86b"' + STK + '/><path d="M40 36 v8 M50 34 v8 M60 36 v8" stroke="#e8a94a" stroke-width="3" stroke-linecap="round"/>' + eyes(55) + '<path d="M47 61 h6 l-3 3Z" fill="#e98a9a"/><path d="M44 66 q3 3 6 0 q3 3 6 0" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>' + cheeks(64, 17)]
  };
  var ANIMAL_KEYS = Object.keys(ANIMALS);
  function animalSVG(kind, name){
    var a = ANIMALS[kind] || ANIMALS[ANIMAL_KEYS[hash(name || "joy") % ANIMAL_KEYS.length]];
    return '<svg viewBox="0 0 100 100" role="img" aria-label="Illustrated ' + esc(kind || "animal") + ' for ' + esc(name) + '"><circle cx="50" cy="50" r="50" fill="' + a[0] + '"/>' + a[1] + '</svg>';
  }
  function personPhoto(p){
    return p.photo ? '<img src="' + esc(p.photo) + '" alt="Portrait of ' + esc(p.short || p.name) + '" loading="lazy" width="240" height="240">' : animalSVG(p.animal, p.short || p.name);
  }
  /* illustrated placeholder snapshot for photos that haven't been added yet */
  function sceneSVG(seed, label){
    var skies = [["#ebc797","#d9a8a0"],["#b3c3cf","#e6e1d3"],["#c3b8cf","#e8cfc6"],["#bfd1b8","#f3e3b8"],["#ecd49c","#e6b48d"],["#c4d3a2","#e3e4c8"]];
    var s = skies[seed % skies.length], c1 = GLASS[seed % GLASS.length], c2 = GLASS[(seed + 3) % GLASS.length];
    return '<svg viewBox="0 0 300 300" role="img" aria-label="' + esc(label) + '">' +
      '<defs><linearGradient id="sky' + seed + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s[0] + '"/><stop offset="1" stop-color="' + s[1] + '"/></linearGradient></defs>' +
      '<rect width="300" height="300" fill="url(#sky' + seed + ')"/>' +
      '<circle cx="' + (70 + (seed * 37) % 160) + '" cy="80" r="30" fill="#f5e8c6" stroke="#34302c" stroke-width="2.5"/>' +
      '<path d="M0 210 Q60 150 120 200 T240 185 T300 195 V300 H0Z" fill="' + c1 + '" opacity=".85" stroke="#34302c" stroke-width="2.5"/>' +
      '<path d="M0 245 Q80 205 160 240 T300 230 V300 H0Z" fill="' + c2 + '" opacity=".9" stroke="#34302c" stroke-width="2.5"/>' +
      '<g stroke="#34302c" stroke-width="2.5" fill="#faf1df"><circle cx="120" cy="232" r="9"/><path d="M120 241 v26 M110 252 h20 M120 267 l-8 14 M120 267 l8 14"/>' +
      '<circle cx="168" cy="228" r="9"/><path d="M168 237 v26 M158 248 h20 M168 263 l-8 14 M168 263 l8 14"/></g>' +
      '<path d="M140 226 q4 -8 8 0" stroke="#a5473a" stroke-width="3" fill="none"/>' +
      '<text x="150" y="40" text-anchor="middle" font-family="DM Mono, monospace" font-size="12" letter-spacing="2" fill="#34302c">PHOTO COMING SOON</text></svg>';
  }

  J.util = { esc: esc, $: $, $all: $all, joyType: joyType, tagHTML: tagHTML, avatarSVG: avatarSVG, reduced: reduced };

  /* ---------- API (Google Apps Script) and Netlify Forms ---------- */
  J.api = function(payload){
    if (!S.apiUrl) return Promise.reject(new Error("not-configured"));
    return fetch(S.apiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(function(r){ return r.json(); })
      .then(function(d){ if (!d || d.ok !== true) throw new Error((d && d.error) || "Something went sideways."); return d; });
  };
  J.apiGet = function(params){
    if (!S.apiUrl) return Promise.reject(new Error("not-configured"));
    var q = Object.keys(params).map(function(k){ return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); }).join("&");
    return fetch(S.apiUrl + (S.apiUrl.indexOf("?") > -1 ? "&" : "?") + q).then(function(r){ return r.json(); });
  };
  /* Backup copy to Netlify Forms (works automatically when hosted on Netlify). */
  J.netlify = function(formName, data){
    var body = new URLSearchParams();
    body.append("form-name", formName);
    Object.keys(data).forEach(function(k){ if (typeof data[k] !== "object") body.append(k, data[k]); });
    return fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .then(function(r){ if (!r.ok) throw new Error("netlify " + r.status); return r; });
  };

  /* ---------- confetti ---------- */
  J.confetti = function(){
    if (reduced) return;
    var c = document.createElement("canvas"); c.id = "confetti"; c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    var ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    var bits = [], cols = GLASS.concat(["#faf1df"]);
    for (var i = 0; i < 140; i++){
      bits.push({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % cols.length], star: i % 7 === 0 });
    }
    var t0 = performance.now();
    (function frame(t){
      var el = t - t0; ctx.clearRect(0, 0, innerWidth, innerHeight);
      bits.forEach(function(b){
        b.vy += .38; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.globalAlpha = Math.max(0, 1 - el / 2200); ctx.fillStyle = b.c;
        if (b.star){ ctx.font = "18px serif"; ctx.fillText("✦", -6, 6); } else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      });
      if (el < 2200) requestAnimationFrame(frame); else c.remove();
    })(t0);
  };

  /* ---------- header + footer ---------- */
  var NAV = [
    ["why.html", "Why"], ["weekend.html", "The Weekend"], ["joy.html", "Find Your Joy"], ["community.html", "Community"], ["makers.html", "The Makers"]
  ];
  var page = (location.pathname.split("/").pop() || "index.html").replace(/\?.*/, "");
  if (page.indexOf(".") === -1) page = (page ? page + ".html" : "index.html");
  var cta = S.cta || { label: "Get tickets", url: "#" };
  var ctaAttrs = 'href="' + esc(cta.url) + '"' + (/^https?:/.test(cta.url) ? ' target="_blank" rel="noopener"' : "");
  /* "Save a seat" is a vintage ride ticket. Each one on a page is the next
     ticket off the roll, so the paper color rotates: salmon, mint, lilac. */
  var PAPERS = ["salmon", "mint", "lilac"], tixCount = 0;
  var ctaAria = function(label){ return esc(label + ", " + (S.dates || "") + (/^https?:/.test(cta.url) ? " (opens in a new tab)" : "")); };
  var tixHTML = function(cls, label){
    return '<a class="tix ' + cls + '" ' + ctaAttrs + ' aria-label="' + ctaAria(label) + '">' +
      '<span class="tix__paper" aria-hidden="true"><span class="tix__sheet"></span></span>' +
      '<span class="tix__print" aria-hidden="true"><span class="tix__label">' + esc(label) + '</span></span>' +
    '</a>';
  };
  J.ctaHTML = function(cls, label){ return tixHTML("tix--" + PAPERS[tixCount++ % PAPERS.length], label || cta.label); };
  /* compact version for the nav bar */
  J.ctaMiniHTML = function(extra){ return tixHTML("tix--mini tix--salmon " + (extra || ""), cta.label); };
  /* SVG filters for the torn paper edge and slightly worn ink, defined once per page */
  if (!document.getElementById("tix-filters")){
    document.body.insertAdjacentHTML("beforeend",
      '<svg id="tix-filters" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
        '<filter id="tix-edge" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
        '<filter id="tix-ink"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</svg>');
  }

  var header = $("#site-header");
  if (header){
    header.className = "site-header";
    header.innerHTML =
      '<div class="wrap nav">' +
        '<a class="brand" href="index.html" aria-label="JoyCon home">JoyCon<span class="brand__sub">a festival of joy · San Francisco</span></a>' +
        J.ctaMiniHTML("nav__cta-mobile") +
        '<button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu <span aria-hidden="true">✦</span></button>' +
        '<ul class="nav__links" id="nav-links">' +
          NAV.map(function(n){ return '<li><a href="' + n[0] + '"' + (page === n[0] ? ' aria-current="page"' : "") + '>' + n[1] + '</a></li>'; }).join("") +
        '</ul>' +
        J.ctaMiniHTML("nav__cta") +
      '</div>';
    var tog = $(".nav__toggle", header), links = $("#nav-links");
    tog.addEventListener("click", function(){
      var open = links.classList.toggle("is-open");
      tog.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (document.body.getAttribute("data-page") === "home"){
      var solid = function(){ header.classList.toggle("solid", scrollY > 40 || links.classList.contains("is-open")); };
      addEventListener("scroll", solid, { passive: true }); tog.addEventListener("click", solid); solid();
    }
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && links.classList.contains("is-open")){ links.classList.remove("is-open"); tog.setAttribute("aria-expanded", "false"); tog.focus(); }
    });
  }

  var footer = $("#site-footer");
  if (footer){
    var v = S.venue || {};
    var email = S.contactEmail ? '<a href="mailto:' + esc(S.contactEmail) + '">' + esc(S.contactEmail) + '</a>' : '<a href="contact.html">Write to us</a>';
    var socials = (S.socials || []).filter(function(s){ return s.url; }).map(function(s){ return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a></li>'; }).join("");
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="wrap">' +
        '<div class="footer__grid">' +
          '<div><p class="footer__mark">JoyCon</p><p style="margin:0 0 14px">' + esc(S.dates) + ' · ' + esc(S.city) + '</p><p class="footer__signoff">With joy and onwards.</p></div>' +
          '<div><p class="footer__h">Saturday HQ</p><p style="margin:0">' + esc(v.name) + '<br><a href="' + esc(v.mapUrl) + '" target="_blank" rel="noopener">' + esc(v.address) + '</a></p>' +
            '<p class="footer__h" style="margin-top:20px">Say hi</p><p style="margin:0">' + email + '</p></div>' +
          '<div><p class="footer__h">Around the park</p><ul class="footer__list">' +
            '<li><a href="weekend.html">The Weekend</a></li><li><a href="index.html#island">Island map</a></li><li><a href="joy.html">Find your joy</a></li><li><a href="community.html">Community Schedule</a></li>' + socials +
          '</ul></div>' +
          '<div><p class="footer__h">Guest services</p><ul class="footer__list">' +
            '<li><a href="pack.html">Pack for the park</a></li><li><a href="faq.html">FAQ</a></li><li><a href="contact.html">Contact</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer__fine"><span>A theme park for connection.</span><span>© 2027 JoyCon</span></div>' +
      '</div>';
  }

  /* ---------- reveal on scroll ---------- */
  function reveal(){
    var els = $all(".reveal:not(.in)");
    if (!("IntersectionObserver" in window) || reduced){ els.forEach(function(e){ e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function(e){ io.observe(e); });
  }
  J.reveal = reveal;

  /* ---------- home ---------- */
  function renderPrototyped(){
    var row = $("#rides-row"); if (!row) return;
    row.innerHTML = (J.prototypedRides || []).map(function(r, i){
      var t = joyType(r.joy);
      return '<article class="ticket reveal" tabindex="0" style="--band:' + esc(t.color) + '" aria-label="Ride: ' + esc(r.name) + '">' +
        '<div class="ticket__main"><h3 class="ticket__title">' + esc(r.name) + '</h3><p class="ticket__desc">' + esc(r.line) + '</p><div>' + tagHTML(r.joy) + '</div>' +
          (r.url ? '<a class="ticket__recipe" href="' + esc(r.url) + '" target="_blank" rel="noopener">Get the recipe &rarr;</a>' : '') + '</div>' +
        '<div class="ticket__stub" style="--stub:' + esc(t.color) + '" aria-hidden="true"><span class="ticket__admit">Admit one · No. ' + String(i + 1).padStart(3, "0") + '</span></div>' +
      '</article>';
    }).join("");
    $all(".ticket", row).forEach(function(tk){ tk.addEventListener("click", function(){ tk.classList.toggle("is-torn"); }); });
  }

  function renderProof(){
    var col = $("#collage"); if (!col) return;
    var gal = {}, posts = {};
    (J.gallery || []).forEach(function(p){ gal[p.id] = p; });
    (J.posts || []).forEach(function(p){ posts[p.id] = p; });
    var order = J.proofOrder || (J.gallery || []).map(function(p){ return p.id; }).concat((J.posts || []).map(function(p){ return p.id; }));
    var rots = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3.5, 2];
    col.innerHTML = order.map(function(id, i){
      var r = rots[i % rots.length], style = ' style="--r:' + r + 'deg;--tr:' + (-r) + 'deg"';
      var cls = "pin-item reveal" + (i % 3 === 1 ? " tack" : "");
      if (gal[id]){
        var p = gal[id];
        var img = p.image
          ? '<img src="' + esc(p.image) + '"' + (p.srcset ? ' srcset="' + esc(p.srcset) + '" sizes="(max-width:700px) 82vw, 280px"' : "") + ' alt="' + esc(p.alt) + '" loading="lazy" decoding="async" width="600" height="600">'
          : sceneSVG(i, "Placeholder illustration. " + (p.alt || ""));
        return '<div class="' + cls + '"' + style + '><figure class="polaroid" tabindex="0">' +
          '<div class="polaroid__img">' + img + '</div>' +
          '<figcaption><span class="cap-ride">' + esc(p.ride) + ', ' + esc(p.date) + '.</span><span class="cap-more">' + esc(p.caption) + '</span></figcaption>' +
          '</figure></div>';
      }
      if (posts[id]){
        var s = posts[id];
        var av = s.avatar ? '<img src="' + esc(s.avatar) + '" alt="" loading="lazy">' : avatarSVG(s.name);
        if (!s.text && s.screenshot){
          return '<div class="' + cls + '"' + style + '><div class="shot"><img src="' + esc(s.screenshot) + '" alt="Post by ' + esc(s.name) + '" loading="lazy"' + (s.screenshotWidth ? ' width="' + s.screenshotWidth + '" style="width:' + s.screenshotWidth + 'px"' : "") + '>' +
            (s.url ? '<p style="margin:8px 0 0"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">View original</a></p>' : "") + '</div></div>';
        }
        return '<div class="' + cls + '"' + style + '><article class="postcard" tabindex="0" aria-label="Post from ' + esc(s.name) + '">' +
          '<div class="stamp" aria-hidden="true">' + av + '</div><span class="postmark" aria-hidden="true"></span>' +
          '<div class="postcard__top"><div class="postcard__who"><span class="postcard__name">' + esc(s.name) + '</span><span class="postcard__handle">' + esc(s.handle) + '</span></div></div>' +
          '<p class="postcard__text">' + esc(s.text) + '</p>' +
          '<div class="postcard__foot"><span>' + esc(s.date) + '</span>' + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">View original</a>' : "") + '</div>' +
          (s.sample ? '<span class="sample-badge">sample</span>' : "") +
          '</article></div>';
      }
      return "";
    }).join("");
    /* tap to straighten on touch */
    $all(".pin-item", col).forEach(function(it){
      it.addEventListener("click", function(e){ if (e.target.closest("a")) return; it.classList.toggle("is-open"); });
    });

    var mq = $("#marquee");
    if (mq){
      var quotes = (J.posts || []).map(function(p){ return p.pull; }).filter(Boolean);
      if (!quotes.length){ mq.remove(); return; }
      var items = quotes.map(function(q){ return '<span class="marquee__item">“' + esc(q) + '”</span>'; }).join("");
      while (quotes.length < 6 && items.length < 2000){ items += items; quotes = quotes.concat(quotes); }
      mq.innerHTML = '<div class="marquee__track"><div style="display:flex">' + items + '</div><div style="display:flex" aria-hidden="true">' + items + '</div></div>';
    }
  }

  /* map path that draws itself as you scroll */
  function drawPath(){
    var path = $(".days__path"); if (!path) return;
    var len = path.getTotalLength();
    path.style.strokeDasharray = len + " " + len;
    if (reduced){ path.style.strokeDashoffset = 0; return; }
    var sec = path.closest("section");
    var ticking = false;
    function update(){
      ticking = false;
      var r = sec.getBoundingClientRect(), vh = innerHeight;
      var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .2)));
      path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
    }
    update();
    addEventListener("scroll", function(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
  }

  /* ---------- weekend ---------- */
  function renderWeekend(){
    var root = $("#weekend"); if (!root) return;
    var days = J.days || [];
    var tabs = '<div class="tabs" role="tablist" aria-label="Choose a day">' + days.map(function(d, i){
      return '<button class="tab" role="tab" id="tab-' + d.id + '" aria-controls="panel-' + d.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(d.tab) + '<small>Jan ' + (16 + i) + '</small></button>';
    }).join("") + '</div>';

    var panels = days.map(function(d, i){
      var head = '<div class="day-head"><div><p class="eyebrow">' + esc(d.date) + '</p><h2>' + esc(d.title) + '</h2><p class="lede">' + esc(d.theme) + '</p>' +
        (d.showJoyTypes ? '<ul class="joy-list" aria-label="Types of joy">' + (J.joyTypes || []).map(function(t){ return '<li>' + tagHTML(t.id) + '</li>'; }).join("") + '</ul>' : "") + '</div>' +
        (d.location ? '<div class="where-card"><p class="eyebrow" style="margin-bottom:6px">Where</p><strong>' + esc(d.location.name) + '</strong><span class="muted">' + esc(d.location.note) + '</span><br>' +
          '<a href="' + esc(d.location.mapUrl) + '" target="_blank" rel="noopener">' + esc(d.location.address) + ' (open map)</a></div>'
        : '<div class="where-card"><p class="eyebrow" style="margin-bottom:6px">Where</p><strong>All over San Francisco</strong><a href="community.html">Find rides on the Community Schedule</a></div>') +
        '</div>';
      var spirit = d.spirit ? '<aside class="spirit"><h3>The spirit of the day</h3><p>' + esc(d.spirit) + '</p></aside>' : "";
      var list = '<ol class="sched">' + d.blocks.map(function(b){
        var t = joyType(b.joy);
        var parts = String(b.time).split(" to ");
        var stub = parts.length > 1 ? '<span class="ticket__time">' + esc(parts[0]) + '</span><span>to</span><span class="ticket__time">' + esc(parts[1]) + '</span>' : '<span class="ticket__time">' + esc(b.time) + '</span>';
        return '<li class="ticket ticket--left reveal">' +
          '<div class="ticket__stub" style="--stub:' + esc(t.color) + '">' + stub + '</div>' +
          '<div class="ticket__main"><h3 class="ticket__title">' + esc(b.title) + '</h3><p class="ticket__desc">' + esc(b.desc) + '</p>' +
          '<div class="ticket__meta"><span class="pin">' + esc(b.where) + '</span>' + tagHTML(b.joy) + '</div>' +
          (b.link ? '<p style="margin:16px 0 0"><a class="btn btn--lemon btn--sm" href="' + esc(b.link.url) + '">' + esc(b.link.label) + '</a></p>' : "") +
          '</div></li>';
      }).join("") + '</ol>';
      return '<section class="day-panel" role="tabpanel" id="panel-' + d.id + '" aria-labelledby="tab-' + d.id + '"' + (i === 0 ? "" : " hidden") + ' tabindex="0">' + head + spirit + list + '</section>';
    }).join("");

    root.innerHTML = tabs + panels;
    var tabEls = $all('[role="tab"]', root);
    function select(i, focus){
      tabEls.forEach(function(t, j){
        var on = i === j; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tabEls[i].focus();
      history.replaceState(null, "", "#" + days[i].id);
      reveal();
    }
    tabEls.forEach(function(t, i){
      t.addEventListener("click", function(){ select(i); });
      t.addEventListener("keydown", function(e){
        if (e.key === "ArrowRight" || e.key === "ArrowLeft"){ e.preventDefault(); select((i + (e.key === "ArrowRight" ? 1 : -1) + tabEls.length) % tabEls.length, true); }
      });
    });
    var start = days.map(function(d){ return d.id; }).indexOf(location.hash.slice(1));
    if (start > 0) select(start);
  }

  /* ---------- pack ---------- */
  function renderPack(){
    var ul = $("#checklist"); if (!ul) return;
    var KEY = "joycon-pack-v1", saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
    var items = J.pack || [];
    ul.innerHTML = items.map(function(it, i){
      var id = "pk-" + i;
      return '<li><label class="check" for="' + id + '"><input type="checkbox" id="' + id + '" data-key="' + esc(it.item) + '"' + (saved[it.item] ? " checked" : "") + '>' +
        '<span class="box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 13l5 5L20 6"/></svg></span>' +
        '<span class="label"><span>' + esc(it.item) + '</span>' + (it.note ? '<small>' + esc(it.note) + '</small>' : "") + '</span></label></li>';
    }).join("");
    var prog = $("#pack-progress");
    function update(fromUser){
      var boxes = $all("input", ul), n = boxes.filter(function(b){ return b.checked; }).length;
      prog.textContent = n === boxes.length ? "All packed. See you at the gates." : n + " of " + boxes.length + " packed";
      if (fromUser && n === boxes.length) J.confetti();
    }
    ul.addEventListener("change", function(e){
      saved[e.target.getAttribute("data-key")] = e.target.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (err) {}
      update(true);
    });
    $("#pack-reset").addEventListener("click", function(){
      saved = {}; try { localStorage.removeItem(KEY); } catch (e) {}
      $all("input", ul).forEach(function(b){ b.checked = false; }); update(false);
    });
    update(false);
  }

  /* ---------- makers ---------- */
  function renderMakers(){
    var co = $("#cocreators");
    if (co) co.innerHTML = (J.cocreators || []).map(function(p){
      return '<article class="maker reveal"><div class="maker__photo">' + personPhoto(p) + '</div><div><h3>' + esc(p.name) + '</h3><p class="maker__joy">What brings ' + esc((p.short || p.name).split(" ")[0]) + ' joy</p><p>' + esc(p.bio) + '</p>' +
        (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">More about ' + esc((p.short || p.name).split(" ")[0]) + '</a>' : "") + '</div></article>';
    }).join("");
    var team = $("#team");
    if (team) team.innerHTML = (J.team || []).map(function(p){
      var name = p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.name) + '</a>' : esc(p.name);
      return '<li class="advisor reveal"><div class="maker__photo">' + personPhoto(p) + '</div><h3>' + name + '</h3><p class="role">' + esc(p.role) + '</p>' + (p.joy ? '<p class="joyline">' + esc(p.joy) + '</p>' : '') + '</li>';
    }).join("");
    var adv = $("#advisors");
    if (adv) adv.innerHTML = (J.advisors || []).map(function(p){
      var name = p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.name) + '</a>' : esc(p.name);
      return '<li class="advisor reveal"><div class="maker__photo">' + personPhoto(p) + '</div><h3>' + name + '</h3><p>' + esc(p.line) + '</p></li>';
    }).join("");
  }

  /* ---------- faq ---------- */
  function renderFAQ(){
    var f = $("#faq"); if (!f) return;
    f.innerHTML = (J.faq || []).map(function(x){ return '<details><summary>' + esc(x.q) + '</summary><div class="ans"><p>' + esc(x.a) + '</p></div></details>'; }).join("");
  }

  /* ---------- contact ---------- */
  function contactForm(){
    var form = $("#contact-form"); if (!form) return;
    var status = $("#contact-status");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      status.textContent = ""; status.className = "form-status";
      var bad = null;
      ["name", "email", "message"].forEach(function(n){
        var el = form.elements[n], ok = el.value.trim() && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !bad) bad = el;
      });
      if (bad){ status.textContent = "A couple of fields need a little love."; status.className = "form-status bad"; bad.focus(); return; }
      if (form.elements["bot-field"].value) return;
      var data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), topic: form.elements.topic.value, message: form.elements.message.value.trim() };
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending...";
      var jobs = [J.netlify("contact", data).then(function(){ return 1; }, function(){ return 0; })];
      if (S.apiUrl) jobs.push(J.api(Object.assign({ action: "contact" }, data)).then(function(){ return 1; }, function(){ return 0; }));
      Promise.all(jobs).then(function(res){
        if (res.some(Boolean)){
          $("#contact-panel").innerHTML = '<div class="done" tabindex="-1" id="contact-done"><p class="done__ticket">Message received</p><h2>Thank you, ' + esc(data.name.split(" ")[0]) + '.</h2><p class="lede" style="margin:0 auto">We read every note. Expect a reply from a real human soon.</p></div>';
          $("#contact-done").focus(); J.confetti();
        } else {
          btn.disabled = false; btn.textContent = "Send it";
          status.className = "form-status bad";
          status.innerHTML = "That didn't go through. Try again" + (S.contactEmail ? ', or email <a href="mailto:' + esc(S.contactEmail) + '">' + esc(S.contactEmail) + '</a>.' : " in a minute.");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    renderPrototyped(); renderProof(); drawPath(); renderWeekend(); renderPack(); renderMakers(); renderFAQ(); contactForm();
    $all("[data-cta]").forEach(function(el){ el.outerHTML = J.ctaHTML(el.getAttribute("data-cta"), el.textContent.trim() || null); });
    reveal();
  });
})();
