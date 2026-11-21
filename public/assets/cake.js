/* Make a wish: a painted birthday cake with candles. Sweep the cursor (or a
   finger) across a flame to blow it out. All out = your wish is on its way. */
(function(){
  "use strict";
  var stage = document.querySelector(".cake__stage"), box = document.getElementById("cake-candles"), hint = document.getElementById("cake-hint");
  if (!stage || !box) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* where each candle stands on the cake's top disc, as % of the cake image (base point) */
  var SPOTS = [[38, 8.6], [50, 7.4], [62, 8.6], [32, 13.2], [44, 14.2], [56, 14.2], [68, 13.2]];
  box.innerHTML = SPOTS.map(function(p, i){
    return '<span class="candle" style="left:' + p[0] + '%;top:' + p[1] + '%;z-index:' + Math.round(p[1] * 10) + ';--d:' + (-i * .23).toFixed(2) + 's">' +
      '<img class="candle__stick" src="assets/img/candle.webp" alt="" draggable="false">' +
      '<span class="candle__flame"><img src="assets/img/flame.webp" alt="" draggable="false"></span>' +
      '<span class="candle__smoke"></span></span>';
  }).join("");
  var candles = [].slice.call(box.querySelectorAll(".candle"));

  function lit(){ return candles.filter(function(c){ return !c.classList.contains("is-out"); }); }
  function blow(c){
    if (c.classList.contains("is-out")) return;
    c.classList.add("is-out");
    var left = lit().length;
    if (!left){
      hint.textContent = "Your wish is on its way. ";
      var again = document.createElement("button"); again.type = "button"; again.className = "cake__again"; again.textContent = "Light them again";
      again.addEventListener("click", relight); hint.appendChild(again);
      if (window.JOY && window.JOY.confetti && !reduced) window.JOY.confetti();
    } else {
      hint.textContent = left === 1 ? "One more…" : left + " candles to go.";
    }
  }
  function relight(){
    candles.forEach(function(c, i){ setTimeout(function(){ c.classList.remove("is-out"); }, reduced ? 0 : i * 90); });
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
