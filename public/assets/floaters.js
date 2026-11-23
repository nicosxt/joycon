/* The island's balloons, kites and hot-air balloon, lifted out of the island
   frame so they fly across the whole page. Same starting spots (relative to
   the island), same drift; drag them, or tap a balloon to pop it. */
(function(){
  "use strict";
  var frame = document.querySelector("#island iframe"); if (!frame) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SRC = { balloon: "island/images/balloon.webp?v=12", cluster: "island/images/balloon-cluster.webp?v=12", kite: "island/images/kite.webp?v=12", hotair: "island/images/hot-air-balloon.webp?v=12" };

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

  var SPARK_COLORS = ["#f79c09", "#e9806a", "#d4658f", "#7a5aa8", "#3f8f87", "#0588c4", "#f2d15c"];
  function burst(x, y, size){
    var n = 18;
    for (var i = 0; i < n; i++){
      var a = (i / n) * Math.PI * 2 + Math.random() * .5, d = size * (1.1 + Math.random() * 1.5), star = i % 3 === 0;
      var el = document.createElement("span"); el.className = "sky-spark" + (star ? " is-star" : "");
      el.style.left = x + "px"; el.style.top = y + "px"; el.style.color = SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0];
      el.style.setProperty("--sz", (star ? 12 : 5) + Math.random() * (star ? 8 : 5) + "px");
      layer.appendChild(el);
      var dx = Math.cos(a) * d, dy = Math.sin(a) * d, dur = 520 + Math.random() * 380;
      if (el.animate && !reduced){
        var an = el.animate([
          { transform: "translate(-50%,-50%) translate(0,0) scale(.3) rotate(0deg)", opacity: 1 },
          { transform: "translate(-50%,-50%) translate(" + dx * .75 + "px," + dy * .75 + "px) scale(1.15) rotate(" + (star ? 160 : 0) + "deg)", opacity: 1, offset: .6 },
          { transform: "translate(-50%,-50%) translate(" + dx + "px," + (dy + size * .5) + "px) scale(.2) rotate(" + (star ? 300 : 0) + "deg)", opacity: 0 }
        ], { duration: dur, easing: "cubic-bezier(.15,.7,.3,1)", fill: "forwards" });
        an.onfinish = function(e){ return function(){ e.remove(); }; }(el);
      } else setTimeout(function(e){ return function(){ e.remove(); }; }(el), 300);
    }
    var ring = document.createElement("span"); ring.className = "sky-ring"; ring.style.left = x + "px"; ring.style.top = y + "px"; ring.style.width = ring.style.height = size * .9 + "px"; layer.appendChild(ring);
    setTimeout(function(){ ring.remove(); }, 450);
  }
  function pop(it){
    if (it.popped) return; it.popped = true; it.el.style.opacity = "0";
    burst(it.x, it.y + it.size * .4, it.size);
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
