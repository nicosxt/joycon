/* Proof of Joy as a fridge door: polaroids, handwritten notes, star stickers
   and fortune cookies, scattered without overlapping and draggable anywhere.
   Content comes from data/proof.js (JOY.gallery, JOY.posts). */
(function(){
  "use strict";
  var board = document.getElementById("fridge"); if (!board) return;
  var J = window.JOY || {}, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var clean = function(s){ return String(s || "").replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim(); };   // drop "[placeholder]" text
  var real = function(s){ return !!clean(s) && clean(s) !== "."; };

  var FRAMES = ["check", "scallop", "stripe", "wavy", "dots", "band"];
  var NOTES = ["sticky", "lined", "card", "kraft"];
  var STAR_COLS = ["#e9809c", "#f79c09", "#0588c4", "#35a468", "#f9ce88", "#93c6d7", "#e2562c", "#f3c3c6"];

  function polaroid(p, i){
    var cap = [real(p.ride) ? p.ride : "", real(p.date) ? p.date : ""].filter(Boolean).join(" · ");
    var more = real(p.caption) ? '<span class="pol__more">' + esc(clean(p.caption)) + '</span>' : "";
    return '<figure class="fz fz--photo frame--' + FRAMES[i % FRAMES.length] + '">' +
      '<div class="pol"><div class="pol__img">' +
        (p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" width="480" height="640" loading="lazy" decoding="async" draggable="false">' : '<span class="pol__blank"></span>') +
      '</div><figcaption class="pol__cap">' + esc(cap) + more + '</figcaption></div></figure>';
  }
  function note(s, i){
    var who = [real(s.name) ? s.name : "", real(s.handle) ? s.handle : ""].filter(Boolean).join(" ");
    return '<article class="fz fz--note note--' + NOTES[i % NOTES.length] + '" aria-label="Note' + (who ? " from " + esc(who) : "") + '">' +
      '<p class="note__text">' + esc(s.text || s.pull) + '</p>' +
      (who ? '<p class="note__by">— ' + esc(who) + '</p>' : "") +
      (s.sample ? '<span class="note__sample">sample</span>' : "") +
      '</article>';
  }
  function star(i){
    var c = STAR_COLS[i % STAR_COLS.length];
    return '<span class="fz fz--star" aria-hidden="true"><svg viewBox="0 0 60 60"><path d="M30 4 L37 21 L56 22 L41 34 L46 53 L30 42 L14 53 L19 34 L4 22 L23 21Z" fill="' + c + '" stroke="#fffdf7" stroke-width="5" stroke-linejoin="round"/></svg></span>';
  }
  function cookie(q, i){
    return '<div class="fz fz--cookie">' +
      '<button type="button" class="cookie" aria-expanded="false" aria-label="Fortune cookie. Open it.">' +
        '<span class="cookie__half cookie__half--l"></span><span class="cookie__half cookie__half--r"></span>' +
      '</button>' +
      '<p class="fortune" aria-live="polite"><span class="fortune__q">“' + esc(q) + '”</span><span class="fortune__lucky">Lucky numbers 1 · 16 · 17 · 27</span></p>' +
    '</div>';
  }

  var gallery = J.gallery || [], posts = J.posts || [];
  var quotes = (J.fortunes || posts.map(function(p){ return p.pull; })).filter(Boolean);
  var html = "", gi = 0, si = 0;
  var order = J.proofOrder || gallery.map(function(p){ return p.id; }).concat(posts.map(function(p){ return p.id; }));
  var byId = {}; gallery.forEach(function(p){ byId[p.id] = ["p", p]; }); posts.forEach(function(p){ byId[p.id] = ["s", p]; });
  order.forEach(function(id){ var e = byId[id]; if (!e) return; html += e[0] === "p" ? polaroid(e[1], gi++) : note(e[1], si++); });
  quotes.forEach(function(q, i){ html += cookie(q, i); });
  for (var k = 0; k < 4; k++) html += star(k);
  board.innerHTML = html;
  var items = [].slice.call(board.querySelectorAll(".fz"));

  /* ---------- scatter without overlap ---------- */
  var seed = 7;
  function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  /* desktop: the hand-arranged composition (centres on a 2000-wide board, rotation) */
  var PRESET = {
    photo:  [[1190, 350, -3], [420, 315, -2], [1630, 965, -3], [1280, 920, -2], [442, 840, 1], [850, 990, 0]],   // p1..p6
    note:   [[1500, 262, 4], [1695, 432, 2], [830, 582, 2], [810, 205, -4]],                                        // s1..s4
    cookie: [[272, 595, -10], [950, 400, -15], [1412, 537, 10], [1792, 710, 5]],
    star:   [[255, 78, -12], [172, 550, 8], [1745, 90, 14], [1080, 645, -6]]
  };
  function presetLayout(W){
    var k = W / 2000, bottom = 0, seen = { photo: 0, note: 0, cookie: 0, star: 0 };
    board.style.setProperty("--s", Math.min(1.12, W / 1180).toFixed(3));
    items.forEach(function(el){ el.style.transform = "none"; });
    items.forEach(function(el){
      var kind = el.classList.contains("fz--photo") ? "photo" : el.classList.contains("fz--note") ? "note" : el.classList.contains("fz--cookie") ? "cookie" : "star";
      var p = PRESET[kind][seen[kind]++ % PRESET[kind].length];
      el._w = el.offsetWidth; el._h = el.offsetHeight;
      el._x = p[0] * k - el._w / 2; el._y = p[1] * k - el._h / 2; el._r = p[2];
      bottom = Math.max(bottom, el._y + el._h);
    });
    items.forEach(function(el){ el._y += 12; set(el); });
    board.style.height = Math.ceil(bottom + 40) + "px";
  }
  function layout(){
    seed = 7;
    if (board.clientWidth >= 900){ presetLayout(board.clientWidth); return; }
    board.style.removeProperty("--s");
    var W = board.clientWidth, pad = W < 600 ? 10 : 22, placed = [];
    items.forEach(function(el){ el.style.transform = "none"; el._w = el.offsetWidth; el._h = el.offsetHeight; });
    var big = items.filter(function(el){ return !el.classList.contains("fz--star") && !el.classList.contains("fz--cookie"); });
    var area = items.reduce(function(a, el){ return a + (el._w + pad) * (el._h + pad); }, 0);
    var H = Math.max(520, area / W * (W < 600 ? 1.45 : 1.75));
    function fits(x, y, w, h){
      if (x < 4 || y < 4 || x + w > W - 4 || y + h > H - 4) return false;
      for (var i = 0; i < placed.length; i++){ var b = placed[i];
        if (x < b.x + b.w + pad && x + w + pad > b.x && y < b.y + b.h + pad && y + h + pad > b.y) return false; }
      return true;
    }
    function place(el, maxRot){
      var r = (rnd() * 2 - 1) * maxRot, rad = Math.abs(r) * Math.PI / 180;
      var w = el._w * Math.cos(rad) + el._h * Math.sin(rad), h = el._w * Math.sin(rad) + el._h * Math.cos(rad);
      for (var grow = 0; grow < 40; grow++){
        var best = null, bestD = -1;
        for (var t = 0; t < 500 && (!best || t < 160); t++){
          var x = 4 + rnd() * (W - w - 8), y = 4 + rnd() * (H - h - 8);
          if (!fits(x, y, w, h)) continue;
          var d = Infinity, cx = x + w / 2, cy = y + h / 2;
          placed.forEach(function(b){ var dx = cx - (b.x + b.w / 2), dy = cy - (b.y + b.h / 2); d = Math.min(d, dx * dx + dy * dy); });
          d = Math.min(d, Math.pow(Math.min(cx, W - cx) * 2.2, 2));    // keep things off the very edges
          if (d > bestD){ bestD = d; best = { x: x, y: y }; }
        }
        if (best){
          placed.push({ x: best.x, y: best.y, w: w, h: h });
          // position the unrotated box so its rotated bounds land on (x, y)
          el._x = best.x + (w - el._w) / 2; el._y = best.y + (h - el._h) / 2; el._r = r;
          return;
        }
        H += 80;
      }
    }
    big.forEach(function(el){ place(el, el.classList.contains("fz--note") ? 6 : 5); });
    items.filter(function(el){ return el.classList.contains("fz--cookie"); }).forEach(function(el){ place(el, 18); });
    items.filter(function(el){ return el.classList.contains("fz--star"); }).forEach(function(el){ place(el, 30); });
    var bottom = placed.reduce(function(m, b){ return Math.max(m, b.y + b.h); }, 0);
    board.style.height = Math.ceil(bottom + 16) + "px";
    items.forEach(set);
  }
  function set(el){ el.style.left = el._x + "px"; el.style.top = el._y + "px"; el.style.transform = "rotate(" + el._r.toFixed(2) + "deg)"; }

  /* ---------- drag and drop ---------- */
  var z = 10;
  function startDrag(el, px, py){
    var bw = board.clientWidth, bh = board.clientHeight, ox = px - el._x, oy = py - el._y;
    el.style.zIndex = ++z; el.classList.add("is-dragging");
    return {
      move: function(x, y){
        el._x = Math.max(-el._w * .3, Math.min(bw - el._w * .7, x - ox));
        el._y = Math.max(-10, Math.min(bh - el._h * .5, y - oy));
        el.style.left = el._x + "px"; el.style.top = el._y + "px";
      },
      end: function(){ el.classList.remove("is-dragging"); }
    };
  }
  function local(e){ var r = board.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  items.forEach(function(el){
    var drag = null, start = null, moved = false;
    // mouse and pen: drag straight away
    el.addEventListener("pointerdown", function(e){
      if (e.pointerType === "touch" || e.button !== 0) return;
      var p = local(e); start = p; moved = false;
      drag = startDrag(el, p.x, p.y); el.setPointerCapture(e.pointerId); e.preventDefault();
    });
    el.addEventListener("pointermove", function(e){
      if (!drag) return; var p = local(e);
      if (!moved && Math.hypot(p.x - start.x, p.y - start.y) < 4) return;
      moved = true; drag.move(p.x, p.y);
    });
    el.addEventListener("pointerup", function(){ if (drag){ drag.end(); drag = null; el._moved = moved; } });
    // touch: press and hold briefly so the page can still scroll past the board
    var hold = null, tdrag = null, t0 = null;
    el.addEventListener("touchstart", function(e){
      if (e.touches.length > 1) return; var t = e.touches[0]; t0 = local(t);
      hold = setTimeout(function(){ tdrag = startDrag(el, t0.x, t0.y); el.classList.add("is-lifted"); if (navigator.vibrate) navigator.vibrate(8); }, 200);
    }, { passive: true });
    el.addEventListener("touchmove", function(e){
      if (tdrag){ e.preventDefault(); var p = local(e.touches[0]); tdrag.move(p.x, p.y); el._moved = true; return; }
      var p2 = local(e.touches[0]); if (hold && Math.hypot(p2.x - t0.x, p2.y - t0.y) > 8){ clearTimeout(hold); hold = null; }
    }, { passive: false });
    function tend(){ clearTimeout(hold); hold = null; if (tdrag){ tdrag.end(); tdrag = null; el.classList.remove("is-lifted"); } }
    el.addEventListener("touchend", tend); el.addEventListener("touchcancel", tend);
    el.addEventListener("contextmenu", function(e){ if (tdrag || el.classList.contains("is-lifted")) e.preventDefault(); });
  });

  /* ---------- fortune cookies ---------- */
  board.querySelectorAll(".fz--cookie").forEach(function(wrap){
    var btn = wrap.querySelector(".cookie"), slip = wrap.querySelector(".fortune");
    // listen on the wrapper: pointer capture during drag retargets the click there
    wrap.addEventListener("click", function(e){
      if (wrap._moved){ wrap._moved = false; e.preventDefault(); return; }   // that was a drag, not a tap
      var open = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open); btn.setAttribute("aria-label", open ? "Fortune cookie, open. Close it." : "Fortune cookie. Open it.");
      if (open){
        wrap.style.zIndex = ++z;
        // keep the slip inside the board
        slip.style.setProperty("--nudge", "0px");
        var bw = board.clientWidth, sw = slip.offsetWidth, cx = wrap._x + wrap._w / 2;
        var left = cx - sw / 2, nudge = left < 6 ? 6 - left : (left + sw > bw - 6 ? bw - 6 - left - sw : 0);
        slip.style.setProperty("--nudge", nudge + "px");
      }
    });
  });

  /* ---------- go ---------- */
  var lastW = 0, rt;
  function relayout(){ var w = board.clientWidth; if (Math.abs(w - lastW) < 40) return; lastW = w; layout(); }
  function boot(){ lastW = board.clientWidth; layout(); }
  var imgs = [].slice.call(board.querySelectorAll("img"));
  // sizes are fixed by CSS, so layout doesn't need to wait for images; fonts can change note heights though
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot);
  addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(relayout, 200); });
  if (reduced) board.classList.add("is-still");
})();
