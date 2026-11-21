/* Make a wish: a painted birthday cake with candles. Sweep the cursor (or a
   finger) across a flame to blow it out. All out = your wish is on its way. */
(function(){
  "use strict";
  var stage = document.querySelector(".cake__stage"), box = document.getElementById("cake-candles"), hint = document.getElementById("cake-hint");
  if (!stage || !box) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ~30 small candles spread over the top disc (ellipse centre, radii as % of the cake image) */
  var CX = 47.4, CY = 20.4, RX = 18.5, RY = 9.6, SPOTS = [];
  [[-.62, 5], [-.3, 7], [0, 8], [.3, 6], [.6, 4]].forEach(function(row){
    var dy = row[0], n = row[1], half = Math.sqrt(1 - dy * dy) * .86;
    for (var i = 0; i < n; i++){
      var dx = n === 1 ? 0 : -half + 2 * half * i / (n - 1);
      SPOTS.push([CX + dx * RX + (Math.random() - .5) * .8, CY + dy * RY + (Math.random() - .5) * .5]);
    }
  });
  box.innerHTML = SPOTS.map(function(p, i){
    return '<span class="candle" style="left:' + p[0] + '%;top:' + p[1] + '%;z-index:' + Math.round(p[1] * 10) + ';--d:' + (-i * .23).toFixed(2) + 's">' +
      '<img class="candle__stick" src="assets/img/candle.webp" alt="" draggable="false">' +
      '<span class="candle__flame"><img src="assets/img/flame.webp" alt="" draggable="false"></span>' +
      '<span class="candle__smoke"></span></span>';
  }).join("");
  var candles = [].slice.call(box.querySelectorAll(".candle"));

  /* confetti over the whole screen */
  function rainConfetti(){
    var cv = document.createElement("canvas"); cv.className = "confetti-rain"; document.body.appendChild(cv);
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight, g = cv.getContext("2d");
    cv.width = W * dpr; cv.height = H * dpr; g.scale(dpr, dpr);
    var cols = ["#e9809c", "#f79c09", "#0588c4", "#35a468", "#e2562c", "#f9ce88", "#93c6d7", "#fffaf0"], bits = [];
    for (var i = 0; i < 260; i++){
      var fromSide = i % 3 === 0, left = i % 2 === 0;
      bits.push({ x: fromSide ? (left ? -10 : W + 10) : Math.random() * W, y: fromSide ? H * (.2 + Math.random() * .5) : -20 - Math.random() * H * .6,
        vx: fromSide ? (left ? 1 : -1) * (4 + Math.random() * 7) : (Math.random() - .5) * 2, vy: fromSide ? -4 - Math.random() * 6 : 1 + Math.random() * 3,
        w: 6 + Math.random() * 7, h: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[i % cols.length], round: Math.random() < .25 });
    }
    var t0 = performance.now();
    (function frame(now){
      var t = now - t0; g.clearRect(0, 0, W, H);
      bits.forEach(function(b){
        b.vy += .12; b.vx *= .99; b.x += b.vx + Math.sin((now / 300) + b.r) * .6; b.y += b.vy; b.r += b.vr;
        g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.globalAlpha = Math.max(0, Math.min(1, (4200 - t) / 800)); g.fillStyle = b.c;
        if (b.round){ g.beginPath(); g.arc(0, 0, b.h / 2, 0, Math.PI * 2); g.fill(); } else g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r * 2)) + 1);
        g.restore();
      });
      if (t < 4200) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  function lit(){ return candles.filter(function(c){ return !c.classList.contains("is-out"); }); }
  function blow(c){
    if (c.classList.contains("is-out")) return;
    c.classList.add("is-out");
    var left = lit().length;
    if (!left){
      hint.textContent = "Your wish is on its way. ";
      var again = document.createElement("button"); again.type = "button"; again.className = "cake__again"; again.textContent = "Light them again";
      again.addEventListener("click", relight); hint.appendChild(again);
      if (!reduced) rainConfetti();
    } else {
      hint.textContent = left === 1 ? "One more…" : left + " candles to go.";
    }
  }
  function relight(){
    candles.forEach(function(c, i){ setTimeout(function(){ c.classList.remove("is-out"); }, reduced ? 0 : i * 30); });
    hint.textContent = "Move across the candles to blow them out.";
  }
  window.JOY = window.JOY || {}; window.JOY.relightCake = relight;

  /* a quick pass close to a flame puts it out; a slow hover just makes it lean */
  var last = null;
  stage.addEventListener("pointermove", function(e){
    var now = performance.now(), speed = 0;
    if (last){ speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(8, now - last.t); }
    last = { x: e.clientX, y: e.clientY, t: now };
    candles.forEach(function(c){
      if (c.classList.contains("is-out")) return;
      var f = c.querySelector(".candle__flame").getBoundingClientRect();
      var cx = f.left + f.width / 2, cy = f.top + f.height * .6, d = Math.hypot(e.clientX - cx, e.clientY - cy);
      var reach = Math.max(26, f.width * 2.2);
      if (d < reach && (speed > .35 || e.pointerType === "touch")) blow(c);
      else if (d < reach * 2.2){
        var lean = Math.max(-1, Math.min(1, (cx - e.clientX) / (reach * 2.2)));
        c.style.setProperty("--lean", (lean * 18).toFixed(1) + "deg");
      } else c.style.setProperty("--lean", "0deg");
    });
  });
  stage.addEventListener("pointerleave", function(){ last = null; candles.forEach(function(c){ c.style.setProperty("--lean", "0deg"); }); });
  // keyboard and screen-reader friendly way to blow them all out
  stage.setAttribute("role", "button"); stage.setAttribute("tabindex", "0"); stage.setAttribute("aria-label", "Birthday cake. Press Enter to blow out the candles.");
  stage.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); candles.forEach(function(c, i){ setTimeout(function(){ blow(c); }, i * 120); }); } });
})();
