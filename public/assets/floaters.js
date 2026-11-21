/* The island's balloons, kites and hot-air balloon, lifted out of the island
   frame so they fly across the whole page. Same starting spots (relative to
   the island), same drift; drag them, or tap a balloon to pop it. */
(function(){
  "use strict";
  var frame = document.querySelector("#island iframe"); if (!frame) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SRC = { balloon: "island/images/balloon.webp?v=9", cluster: "island/images/balloon-cluster.webp?v=9", kite: "island/images/kite.webp?v=9", hotair: "island/images/hot-air-balloon.webp?v=9" };

  var layer = document.createElement("div"); layer.className = "sky-floaters"; document.body.appendChild(layer);
  var items = [];
  function add(kind, w, hue, fx, fy, vx, vy){ items.push({ kind: kind, w: w, hue: hue, fx: fx, fy: fy, drift: vx, lift: vy, vx: vx, vy: vy, phase: Math.random() * 6.28 }); }
  // the island's own layout (fractions of the island frame)
  add("hotair", 92, 0, .42, .08, 9, 0); add("cluster", 70, 0, .24, .22, 14, -4); add("cluster", 58, 140, .86, .3, 11, -3);
  add("kite", 64, 0, .55, .2, 18, 0); add("kite", 52, 200, .12, .45, 16, 0);
  [0, 60, 130, 200, 260, 310, 30, 170].forEach(function(h, u){ add("balloon", 30 + u % 3 * 6, h, .08 + u * .12, .35 + (u * 37 % 50) / 100, 8 + u % 4 * 4, -(14 + u % 3 * 6)); });

  var placed = false;
  function frameBox(){ var r = frame.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
  function place(){
    var f = frameBox();
    items.forEach(function(it){
      if (!it.el){
        it.el = document.createElement("div"); it.el.className = "sky-floater kind-" + it.kind;
        it.el.innerHTML = '<img src="' + SRC[it.kind] + '" alt="" draggable="false"' + (it.hue ? ' style="filter:hue-rotate(' + it.hue + 'deg)"' : "") + '>';
        it.el.setAttribute("aria-hidden", "true");
        layer.appendChild(it.el); bind(it);
      }
      it.x = f.x + it.fx * f.w; it.y = f.y + it.fy * f.h;
    });
    placed = true;
  }

  function pop(it){
    if (it.popped) return; it.popped = true; it.el.style.opacity = "0";
    var b = document.createElement("span"); b.className = "sky-pop"; b.style.left = it.x + "px"; b.style.top = (it.y + it.size * .4) + "px"; layer.appendChild(b);
    setTimeout(function(){ b.remove(); }, 700);
    setTimeout(function(){ var f = frameBox(); it.popped = false; it.x = f.x + Math.random() * f.w; it.y = f.y + f.h + 40; it.el.style.opacity = ""; }, 3500);
  }
  function bind(it){
    var d = null;
    it.el.addEventListener("pointerdown", function(e){
      d = { ox: e.pageX - it.x, oy: e.pageY - it.y, lx: e.pageX, ly: e.pageY, lt: performance.now(), moved: 0 };
      it.dragging = true; it.el.setPointerCapture(e.pointerId); it.el.classList.add("is-grabbed"); e.preventDefault();
    });
    it.el.addEventListener("pointermove", function(e){
      if (!d) return; var now = performance.now(), dt = Math.max(1, now - d.lt) / 1000;
      it.vx = it.vx * .5 + (e.pageX - d.lx) / dt * .5; it.vy = it.vy * .5 + (e.pageY - d.ly) / dt * .5;
      d.moved += Math.abs(e.pageX - d.lx) + Math.abs(e.pageY - d.ly); d.lx = e.pageX; d.ly = e.pageY; d.lt = now;
      it.x = e.pageX - d.ox; it.y = e.pageY - d.oy;
    });
    function up(){
      if (!d) return; it.dragging = false; it.el.classList.remove("is-grabbed");
      if (d.moved < 6 && it.kind === "balloon") pop(it);
      it.vx = Math.max(-900, Math.min(900, it.vx)); it.vy = Math.max(-900, Math.min(900, it.vy)); d = null;
    }
    it.el.addEventListener("pointerup", up); it.el.addEventListener("pointercancel", up);
  }

  var last = performance.now();
  function tick(now){
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    var W = document.documentElement.clientWidth, top = 0, f = frameBox(), bottom = f.y + f.h + 80;
    var k = Math.max(.6, Math.min(1.4, W / 1440));
    items.forEach(function(it){
      if (!it.el) return;
      it.size = it.w * k;
      if (!it.dragging && !reduced){
        it.vx += (it.drift - it.vx) * Math.min(1, dt * .8); it.vy += (it.lift - it.vy) * Math.min(1, dt * .8);
        it.x += it.vx * dt; it.y += it.vy * dt;
        if (it.x > W + it.size) it.x = -it.size * 1.5;
        if (it.x < -it.size * 2) it.x = W + it.size;
        if (it.y < top - it.size * 2.5){ it.y = bottom; it.x = f.x + Math.random() * f.w * .9; }   // rose off the top of the page: start again below the island
        if (it.y > bottom + it.size * 2) it.y = f.y - it.size;
      }
      it.phase += dt;
      var bob = it.dragging ? 0 : Math.sin(it.phase * (it.kind === "kite" ? 1.6 : .9)) * (it.kind === "kite" ? 6 : 4);
      var rot = it.kind === "kite" ? Math.sin(it.phase * 1.3) * 10 + Math.max(-25, Math.min(25, it.vx * .15)) : Math.max(-18, Math.min(18, (it.vx - it.drift) * .05)) + Math.sin(it.phase * .7) * 3;
      it.el.style.width = it.size + "px";
      it.el.style.transform = "translate(" + (it.x - it.size / 2).toFixed(1) + "px," + (it.y + bob).toFixed(1) + "px) rotate(" + rot.toFixed(1) + "deg)";
    });
    requestAnimationFrame(tick);
  }
  function start(){ place(); requestAnimationFrame(tick); }
  if (document.readyState === "complete") start(); else addEventListener("load", start);
})();
