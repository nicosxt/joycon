/* Painted clouds that drift around and above the island, page-wide (never
   clipped by the island frame). Drag any cloud to move it. */
(function(){
  "use strict";
  var hero = document.getElementById("island"); if (!hero) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* [image, width as % of page width, x as % of page width, y relative to the island's top in island heights, drift seconds] */
  var CLOUDS = [
    ["cloud-1", 28.5, 1,   -0.30, 70],    // above the island, in the left margin beside the joy teaser
    ["cloud-2", 19.5, 82,  -0.40, 85],    // above, right margin
    ["cloud-3", 25.5, 44,  -0.12, 95]     // just over the top of the island
  ];
  /* only the clouds above the island: nothing drifts across the island itself */

  /* a soft blue sky from the top of the page down to the island's middle, multiplied into the paper */
  var wash = document.createElement("div"); wash.className = "sky-wash"; wash.setAttribute("aria-hidden", "true");
  document.body.insertBefore(wash, document.body.firstChild);

  var layer = document.createElement("div");
  layer.className = "sky-clouds"; layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  var items = CLOUDS.map(function(c, i){
    var el = document.createElement("div");
    el.className = "sky-cloud";
    el.style.setProperty("--drift", c[4] + "s"); el.style.setProperty("--delay", (-i * 13) + "s");
    el.innerHTML = '<img src="assets/img/' + c[0] + '.webp" alt="" draggable="false">';
    layer.appendChild(el);
    return { el: el, w: c[1], x: c[2], y: c[3], moved: false, px: 0, py: 0 };
  });

  function place(){
    var r = hero.getBoundingClientRect(), top = r.top + scrollY, W = document.documentElement.clientWidth;
    wash.style.height = Math.round(top + r.height * .5) + "px";
    items.forEach(function(it){
      it.el.style.width = (it.w / 100 * W) + "px";
      if (it.moved) return;
      it.px = it.x / 100 * W; it.py = top + it.y * r.height;
      it.el.style.left = it.px + "px"; it.el.style.top = it.py + "px";
    });
  }

  /* drag */
  items.forEach(function(it){
    var drag = null;
    it.el.addEventListener("pointerdown", function(e){
      if (e.button !== 0 && e.pointerType === "mouse") return;
      drag = { ox: e.pageX - it.px, oy: e.pageY - it.py };
      it.el.setPointerCapture(e.pointerId); it.el.classList.add("is-dragging"); e.preventDefault();
    });
    it.el.addEventListener("pointermove", function(e){
      if (!drag) return;
      it.px = e.pageX - drag.ox; it.py = Math.max(0, e.pageY - drag.oy); it.moved = true;
      it.el.style.left = it.px + "px"; it.el.style.top = it.py + "px";
    });
    function end(){ drag = null; it.el.classList.remove("is-dragging"); }
    it.el.addEventListener("pointerup", end); it.el.addEventListener("pointercancel", end);
  });

  /* drift left to right, forever: each cloud at its own gentle speed, wrapping back in from the left */
  var last = performance.now();
  function drift(now){
    var dt = Math.min(.05, (now - last) / 1000), W = document.documentElement.clientWidth; last = now;
    if (!reduced) items.forEach(function(it, i){
      if (it.el.classList.contains("is-dragging")) return;
      var w = it.el.offsetWidth;
      it.px += (10 + (i % 4) * 4) * dt; it.moved = true;
      if (it.px > W + 20) it.px = -w - 20;
      it.el.style.left = it.px + "px";
    });
    requestAnimationFrame(drift);
  }

  place();
  addEventListener("load", function(){ var keep = items.map(function(it){ return it.moved; }); items.forEach(function(it){ it.moved = false; }); place(); });
  var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(place, 150); });
  requestAnimationFrame(drift);
  if (reduced) layer.classList.add("is-still");
})();
