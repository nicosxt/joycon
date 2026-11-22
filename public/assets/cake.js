/* Make a wish: a painted birthday cake with JOY CON candles.
   Sweep the cursor (or a finger) across a flame to blow it out. */
(function(){
  "use strict";
  var stage = document.querySelector(".cake__stage"), box = document.getElementById("cake-candles"), hint = document.getElementById("cake-hint");
  if (!stage || !box) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The candles are painted into the cake (cake.webp); these are the tips of their wicks, as % of the art. Each gets a painted flame. */
  var CANDLES = [
    {id:"w1", left:25.4044, top:1.5625},
    {id:"w2", left:30.6250, top:2.4089},
    {id:"w3", left:35.1471, top:2.0833},
    {id:"w4", left:41.7279, top:2.2135},
    {id:"w5", left:47.6838, top:2.5391},
    {id:"w6", left:56.0294, top:2.2786},
    {id:"w7", left:61.8382, top:2.5391},
    {id:"w8", left:66.8382, top:2.0182},
    {id:"w9", left:72.4632, top:2.1484},
    {id:"w10", left:75.0735, top:2.7344},
    {id:"w11", left:79.0441, top:2.2135}
  ];

  box.innerHTML = CANDLES.map(function(c, i){
    return '<span class="candle candle--cut candle--wick" style="left:' + c.left + '%;top:' + c.top + '%">' +
      '<span class="candle__light" style="--d:' + (-i * .23).toFixed(2) + 's">' +
        '<span class="candle__flame"><img src="assets/img/flame.webp?v=3" alt="" draggable="false"></span>' +
        '<span class="candle__smoke"></span></span></span>';
  }).join("");

  var lights = [].slice.call(box.querySelectorAll(".candle__light"));

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

  function lit(){ return lights.filter(function(c){ return !c.classList.contains("is-out"); }); }
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
    lights.forEach(function(c, i){ setTimeout(function(){ c.classList.remove("is-out"); }, reduced ? 0 : i * 30); });
    hint.textContent = "Move across the candles to blow them out.";
  }
  window.JOY = window.JOY || {}; window.JOY.relightCake = relight;

  var last = null;
  stage.addEventListener("pointermove", function(e){
    var now = performance.now(), speed = 0;
    if (last){ speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(8, now - last.t); }
    last = { x: e.clientX, y: e.clientY, t: now };
    lights.forEach(function(c){
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
  stage.addEventListener("pointerleave", function(){ last = null; lights.forEach(function(c){ c.style.setProperty("--lean", "0deg"); }); });
  stage.setAttribute("role", "button"); stage.setAttribute("tabindex", "0"); stage.setAttribute("aria-label", "Birthday cake. Press Enter to blow out the candles.");
  stage.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); lights.forEach(function(c, i){ setTimeout(function(){ blow(c); }, i * 120); }); } });
})();
