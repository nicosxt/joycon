/* Painted clouds that drift around and above the island, page-wide (never
   clipped by the island frame). Drag any cloud to move it. */
(function(){
  "use strict";
  var hero = document.getElementById("island"); if (!hero) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* [image, width as % of page width, x as % of page width, y relative to the island's top in island heights, drift seconds] */
  var CLOUDS = [
    ["cloud-1", 19, 1,   -0.30, 70],    // above the island, in the left margin beside the joy teaser
    ["cloud-2", 13, 82,  -0.40, 85],    // above, right margin
    ["cloud-3", 17, 44,  -0.06, 95],    // just over the island's sky
    ["cloud-4", 12, 86,  0.10,  75],
    ["cloud-5", 16, -3,  0.30,  90],
    ["cloud-2", 10, 17,  0.04,  80],
    ["cloud-3", 15, 80,  0.62,  100],
    ["cloud-1", 13, 3,   1.06,  88]
  ];

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

  place();
  addEventListener("load", place);
  var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(place, 150); });
  if (window.ResizeObserver) new ResizeObserver(function(){ place(); }).observe(document.body);
  if (reduced) layer.classList.add("is-still");
})();
