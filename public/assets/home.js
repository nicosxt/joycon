/* JoyCon home page: marquee bulbs, the SF park illustration, balloons and birds, bunting. */
(function(){
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var INK = "#2a2420";

  var bulbs = document.getElementById("bulbs"), hasSky = !!document.getElementById("skyline");
  function placeBulbs(){
    var w = bulbs.offsetWidth, h = bulbs.offsetHeight, per = 2 * (w + h), n = Math.floor(per / 30), html = "";
    for (var i = 0; i < n; i++){
      var d = i * per / n, x, y;
      if (d < w){ x = d; y = 0; } else if (d < w + h){ x = w; y = d - w; } else if (d < 2 * w + h){ x = w - (d - w - h); y = h; } else { x = 0; y = h - (d - 2 * w - h); }
      x = Math.min(Math.max(x, 14), w - 14); y = Math.min(Math.max(y, 14), h - 14);
      html += '<i style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px"></i>';
    }
    bulbs.innerHTML = html;
  }

  /* SF as a storybook park: hand inked, stippled, dusk palette */
  function skyline(){
    var N = INK, SW = 2.2;
    var G = ["#e9809c","#f79c09","#35a468","#0588c4","#e9809c","#e2562c"], petals = "", cx = 1130, cy = 146, R = 84;
    function p(r, a){ return (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    for (var i = 0; i < 12; i++){
      var a1 = i / 12 * Math.PI * 2, a2 = (i + 1) / 12 * Math.PI * 2;
      petals += '<path d="M' + p(R, a1) + ' A' + R + ' ' + R + ' 0 0 1 ' + p(R, a2) + ' L' + p(R * .38, a2) + ' A' + (R * .38) + ' ' + (R * .38) + ' 0 0 0 ' + p(R * .38, a1) + 'Z" fill="' + G[i % 6] + '" opacity=".92"/>';
      petals += '<path d="M' + p(R * .38, a1) + ' L' + p(R, a1) + '" stroke="' + N + '" stroke-width="1.4"/>';
      var gx = cx + (R + 11) * Math.cos(a1 + .26), gy = cy + (R + 11) * Math.sin(a1 + .26);
      petals += '<g transform="translate(' + gx.toFixed(1) + ' ' + gy.toFixed(1) + ')"><path d="M-7 -2 h14 v8 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3Z" fill="' + G[(i + 2) % 6] + '" stroke="' + N + '" stroke-width="1.6"/><path d="M-8 -2 q8 -7 16 0" fill="#f9ce88" stroke="' + N + '" stroke-width="1.6"/></g>';
    }
    /* painted ladies, muted */
    var ladies = "", cols = ["#e9809c","#35a468","#f9ce88","#e9809c","#716759","#e2562c"];
    for (var k = 0; k < 6; k++){
      var x = 610 + k * 50, y = 240;
      ladies += '<g stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round">' +
        '<path d="M' + x + ' ' + (y + 124) + ' V' + y + ' l25 -28 l25 28 V' + (y + 124) + 'Z" fill="' + cols[k] + '"/>' +
        '<path d="M' + (x - 3) + ' ' + y + ' h56" stroke-width="2.6"/>' +
        '<rect x="' + (x + 8) + '" y="' + (y + 14) + '" width="11" height="19" rx="5.5" fill="#f9ce88"/><rect x="' + (x + 31) + '" y="' + (y + 14) + '" width="11" height="19" rx="5.5" fill="#f9ce88"/>' +
        '<path d="M' + (x + 6) + ' ' + (y + 46) + ' h38 v20 h-38Z" fill="#f9ce88"/><path d="M' + (x + 25) + ' ' + (y + 46) + ' v20" stroke-width="1.4"/>' +
        '<path d="M' + (x + 17) + ' ' + (y + 124) + ' v-28 a8 8 0 0 1 16 0 v28" fill="#716759"/></g>';
    }
    /* lollipop trees and cypress cones, like the park map */
    function tree(x, y, s, c){ c = c || "#35a468";
      return '<g stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round" stroke-linecap="round"><path d="M' + x + ' ' + y + ' v' + (-14 * s) + '"/>' +
        '<path d="M' + (x - 17 * s) + ' ' + (y - 24 * s) + ' a17 17 0 0 1 8 -22 a14 14 0 0 1 22 -6 a16 16 0 0 1 12 22 a14 14 0 0 1 -10 18 h-24 a10 10 0 0 1 -8 -12Z" fill="' + c + '"/>' +
        '<path d="M' + (x - 4 * s) + ' ' + (y - 38 * s) + ' q6 -4 12 2" fill="none" stroke-width="1.3" opacity=".6"/></g>'; }
    function cone(x, y, s){ return '<g stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round"><path d="M' + x + ' ' + y + ' l' + (-11 * s) + ' 0 l' + (11 * s) + ' ' + (-50 * s) + ' l' + (11 * s) + ' ' + (50 * s) + 'Z" fill="#317b51"/></g>'; }
    function flowers(x0, x1, y, n){ var f = "", fc = ["#e9809c","#f79c09","#e9809c","#f5e4c3","#e9809c"];
      for (var i = 0; i < n; i++){ var fx = x0 + (x1 - x0) * ((i * 37) % n) / n, fy = y + ((i * 13) % 9); f += '<circle cx="' + fx.toFixed(1) + '" cy="' + fy + '" r="' + (2.4 + (i % 3)) + '" fill="' + fc[i % 5] + '" stroke="' + N + '" stroke-width=".9"/>'; }
      return f; }
    var svg =
    '<svg viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice">' +
      '<defs>' +
        '<pattern id="stip" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="' + N + '" opacity=".28"/><circle cx="6.5" cy="6" r=".7" fill="' + N + '" opacity=".2"/></pattern>' +
        '<pattern id="stip2" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" fill="' + N + '" opacity=".35"/></pattern>' +
        '<linearGradient id="bay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0588c4"/><stop offset="1" stop-color="#116890"/></linearGradient>' +
      '</defs>' +
      /* bay */
      '<path d="M0 238 H620 V360 H0Z" fill="url(#bay)"/>' +
      '<g stroke="#e6d1ad" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".55"><path d="M40 262 q10 -5 20 0 t20 0"/><path d="M180 286 q10 -5 20 0 t20 0"/><path d="M330 258 q10 -5 20 0 t20 0"/><path d="M90 316 q10 -5 20 0 t20 0"/><path d="M450 300 q10 -5 20 0 t20 0"/></g>' +
      /* marin headland */
      '<path d="M-20 238 Q10 196 60 210 L70 238Z" fill="#f79c09" stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round"/>' +
      /* golden gate, terracotta */
      '<g stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round">' +
        '<path d="M74 238 V112 h14 V238 M244 238 V112 h14 V238" fill="#e2562c"/>' +
        '<path d="M74 140 h14 M244 140 h14 M74 176 h14 M244 176 h14" stroke-width="1.5"/>' +
      '</g>' +
      '<g fill="none" stroke="#e2562c" stroke-width="3"><path d="M-20 128 Q81 214 166 210 T420 128"/></g>' +
      '<g stroke="#e2562c" stroke-width="1.2" opacity=".85">' + (function(){ var s = ""; for (var x = 96; x < 244; x += 12){ var t = (x - 81) / 170, yy = 128 + 82 * (1 - Math.pow(2 * t - 1, 2)) * .98; s += '<path d="M' + x + ' ' + yy.toFixed(1) + ' V204"/>'; } return s; })() + '</g>' +
      '<path d="M-20 204 H470" stroke="' + N + '" stroke-width="7" stroke-linecap="round"/><path d="M-20 204 H470" stroke="#e2562c" stroke-width="4.4" stroke-linecap="round"/>' +
      '<g class="fog" fill="#f5e4c3" opacity=".78"><ellipse cx="60" cy="230" rx="140" ry="16"/><ellipse cx="260" cy="236" rx="160" ry="14"/><ellipse cx="420" cy="230" rx="120" ry="12"/></g>' +
      /* far hills, stippled */
      '<path d="M380 270 Q520 172 680 222 T980 200 T1440 208 V360 H380Z" fill="#35a468"/>' +
      '<path d="M380 270 Q520 172 680 222 T980 200 T1440 208 V360 H380Z" fill="url(#stip)" stroke="' + N + '" stroke-width="' + SW + '"/>' +
      /* coit tower */
      '<g stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round"><path d="M470 360 V140 L496 62 L522 140 V360Z" fill="#e6d1ad"/><path d="M548 232 Q575 198 602 232" fill="#35a468"/><rect x="566" y="142" width="22" height="94" rx="2" fill="#f5e4c3"/><rect x="561" y="134" width="32" height="11" rx="4" fill="#f5e4c3"/><path d="M571 152 v14 M577 152 v14 M583 152 v14" stroke-width="1.4"/></g>' +
      cone(1010, 236, .9) + cone(1030, 232, 1.1) + cone(1250, 232, 1) + cone(1272, 236, .8) +
      /* wheel */
      '<g stroke="' + N + '" stroke-width="4" stroke-linecap="round"><path d="M1130 146 L1088 328 M1130 146 L1172 328"/></g>' +
      '<g class="wheel"><circle cx="1130" cy="146" r="' + (R + 3) + '" fill="#f9ce88" stroke="' + N + '" stroke-width="' + SW + '"/>' + petals +
        '<circle cx="1130" cy="146" r="' + R + '" fill="none" stroke="' + N + '" stroke-width="' + SW + '"/><circle cx="1130" cy="146" r="' + (R * .38) + '" fill="none" stroke="' + N + '" stroke-width="1.4"/>' +
        '<circle cx="1130" cy="146" r="24" fill="#f79c09" stroke="' + N + '" stroke-width="' + SW + '"/><circle cx="1130" cy="146" r="7" fill="#f9ce88" stroke="' + N + '" stroke-width="1.4"/></g>' +
      /* near hill */
      '<path d="M-10 330 Q200 282 420 306 T900 300 T1450 290 V360 H-10Z" fill="#35a468"/>' +
      '<path d="M-10 330 Q200 282 420 306 T900 300 T1450 290 V360 H-10Z" fill="url(#stip2)" opacity=".55" stroke="' + N + '" stroke-width="' + SW + '"/>' +
      ladies +
      tree(960, 312, 1, "#35a468") + tree(1002, 316, .85, "#35a468") + tree(1300, 304, 1.1, "#35a468") + tree(1350, 310, .9, "#35a468") + tree(1408, 306, 1, "#35a468") +
      tree(420, 312, .9, "#35a468") + tree(152, 326, .8, "#35a468") + tree(196, 330, .7, "#35a468") +
      /* cable car */
      '<g stroke="' + N + '" stroke-width="' + SW + '" stroke-linejoin="round"><path d="M240 304 L380 272" stroke-width="1.6"/><g transform="translate(272 270) rotate(-12)"><rect x="0" y="0" width="68" height="32" rx="7" fill="#e2562c"/><rect x="0" y="-5" width="68" height="7" rx="3" fill="#e6d1ad"/><rect x="7" y="7" width="54" height="11" rx="2" fill="#f9ce88"/><path d="M20 7 v11 M34 7 v11 M48 7 v11" stroke-width="1.3"/><rect x="-4" y="29" width="76" height="6" rx="3" fill="#f79c09"/></g></g>' +
      /* flower beds + path */
      flowers(40, 440, 334, 26) + flowers(880, 1420, 324, 30) +
      '<path d="M0 352 Q360 326 720 346 T1440 340 V360 H0Z" fill="#317b51" stroke="' + N + '" stroke-width="' + SW + '"/>' +
      '<path d="M0 347 C240 332 420 351 720 342 S1200 328 1440 345" fill="none" stroke="#f9ce88" stroke-width="3" stroke-dasharray="1 11" stroke-linecap="round"/>' +
    '</svg>';
    document.getElementById("skyline").innerHTML = svg;
  }

  /* balloons rising, birds crossing */
  function air(canvas){
    var ctx = canvas.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2), W, H, birds = [], balloons = [];
    var BC = ["#e9809c","#f79c09","#35a468","#0588c4","#e9809c","#116890","#e2562c"];
    function size(){ W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener("resize", size);
    function flock(){ var y = H * (.12 + Math.random() * .22), n = 3 + Math.floor(Math.random() * 3); for (var i = 0; i < n; i++) birds.push({ x: -40 - i * 30, y: y + (i % 2) * 14 - i * 4, v: 1.1 + Math.random() * .3, ph: Math.random() * 6 }); }
    function spawn(initial){
      var side = Math.random() < .5 ? Math.random() * .26 : .74 + Math.random() * .24;
      var gold = !initial && Math.random() < .12;
      balloons.push({ x: side * W, y: initial ? H * (.2 + Math.random() * .8) : H + 40, v: .22 + Math.random() * .28, r: 13 + Math.random() * 9, c: gold ? "#f79c09" : BC[Math.floor(Math.random() * BC.length)], gold: gold, ph: Math.random() * 6 });
    }
    function drawBird(b, t){
      var flap = Math.sin(t / 110 + b.ph) * 5;
      ctx.save(); ctx.translate(b.x, b.y); ctx.strokeStyle = INK; ctx.lineWidth = 1.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-9, -flap * .6); ctx.quadraticCurveTo(-4, -4 - flap, 0, 0); ctx.quadraticCurveTo(4, -4 - flap, 9, -flap * .6); ctx.stroke();
      ctx.restore();
    }
    function drawBalloon(b, t){
      var x = b.x + Math.sin(t / 1600 + b.ph) * 10, y = b.y, r = b.r;
      ctx.save(); ctx.translate(x, y);
      ctx.strokeStyle = "rgba(42,36,32,.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, r * 1.2 + 4); for (var i = 1; i < 6; i++) ctx.lineTo(Math.sin(t / 700 + i + b.ph) * 3, r * 1.2 + 4 + i * 9); ctx.stroke();
      ctx.fillStyle = b.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 1.18, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-3, r * 1.18); ctx.lineTo(3, r * 1.18); ctx.lineTo(0, r * 1.18 + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(250,243,228,.55)"; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .45, r * .18, r * .32, -.5, 0, 7); ctx.fill();
      if (b.gold){ var tw = .5 + .5 * Math.sin(t / 180 + b.ph); ctx.fillStyle = "rgba(255,250,225," + tw.toFixed(2) + ")"; ctx.font = "14px serif"; ctx.fillText("\u2726", r * .5, -r * .7); }
      ctx.restore();
      b.sx = x;
    }
    var count = W < 760 ? 3 : 6, pops = [];
    /* tap a balloon to pop it. Gold ones are lucky. */
    canvas.parentNode.addEventListener("click", function(e){
      if (e.target.closest("a, button")) return;
      var rc = canvas.getBoundingClientRect(), px = e.clientX - rc.left, py = e.clientY - rc.top;
      for (var i = balloons.length - 1; i >= 0; i--){
        var b = balloons[i], bx = b.sx == null ? b.x : b.sx;
        if (Math.pow((px - bx) / (b.r + 8), 2) + Math.pow((py - b.y) / (b.r * 1.18 + 8), 2) <= 1){
          balloons.splice(i, 1);
          for (var k = 0; k < 10; k++){ var a = k / 10 * Math.PI * 2; pops.push({ x: bx, y: b.y, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6, c: b.c, life: 1 }); }
          if (b.gold && window.JOY && window.JOY.confetti) window.JOY.confetti();
          return;
        }
      }
    });
    canvas.parentNode.addEventListener("mousemove", function(e){
      var rc = canvas.getBoundingClientRect(), px = e.clientX - rc.left, py = e.clientY - rc.top, over = false;
      balloons.forEach(function(b){ var bx = b.sx == null ? b.x : b.sx; if (Math.pow((px - bx) / (b.r + 8), 2) + Math.pow((py - b.y) / (b.r * 1.18 + 8), 2) <= 1) over = true; });
      canvas.parentNode.style.cursor = over ? "pointer" : "";
    });
    for (var i = 0; i < count; i++) spawn(true);
    if (reduced){ balloons.forEach(function(b){ drawBalloon(b, 0); }); return; }
    var visible = true, next = 800, last = 0;
    new IntersectionObserver(function(e){ visible = e[0].isIntersecting; }).observe(canvas);
    (function frame(t){
      requestAnimationFrame(frame); if (!visible) return;
      var dt = Math.min(t - last, 60); last = t; ctx.clearRect(0, 0, W, H);
      balloons.forEach(function(b){ b.y -= b.v * dt / 16; drawBalloon(b, t); });
      pops = pops.filter(function(p){ return p.life > 0; });
      pops.forEach(function(p){ p.x += p.vx; p.y += p.vy; p.vy += .08; p.life -= .035; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1; });
      balloons = balloons.filter(function(b){ return b.y > -80; });
      while (balloons.length < count) spawn(false);
      next -= dt; if (next < 0){ flock(); next = 10000 + Math.random() * 7000; }
      birds = birds.filter(function(b){ return b.x < W + 60; });
      birds.forEach(function(b){ b.x += b.v * dt / 16; b.y += Math.sin(t / 500 + b.ph) * .2; drawBird(b, t); });
    })(0);
  }

  /* flagline: a sagging, tilted string of pennants that rolls left to right as you scroll */
  (function(){
    var lines = [].slice.call(document.querySelectorAll(".flagline")); if (!lines.length) return;
    var cols = ["#e2562c", "#f79c09", "#35a468", "#0588c4", "#e9809c"], STEP = 62, SPEED = .3, FW = 44, FH = 58;
    function flagSVG(c, i){                // painted pennant sprites, one per palette colour
      return '<img src="assets/img/pennant-' + (cols.indexOf(c) + 1) + '.webp" alt="" draggable="false" style="animation-delay:' + (-(i % 7) * .35).toFixed(2) + 's">';
    }
    function curve(el){                       // string: higher on the right, sagging in the middle
      var W = el.offsetWidth, yl = 10, yr = 18, sag = Math.min(46, W * .035);
      return { W: W, y: function(x){ var t = x / W; return yl + (yr - yl) * t + sag * Math.sin(Math.PI * t); },
               a: function(x){ var t = x / W; return Math.atan(((yr - yl) + sag * Math.PI * Math.cos(Math.PI * t)) / W) * 180 / Math.PI; } };
    }
    function build(){
      lines.forEach(function(el){
        var c = curve(el), n = Math.ceil((c.W + STEP * 2) / STEP / cols.length) * cols.length, html = "", d = "";
        for (var x = 0; x <= c.W; x += 20) d += (x ? " L" : "M") + x + " " + c.y(x).toFixed(1);
        d += " L" + c.W + " " + c.y(c.W).toFixed(1);
        for (var i = 0; i < n; i++) html += '<span class="flagline__flag">' + flagSVG(cols[i % cols.length], i) + '</span>';
        el.innerHTML = '<svg class="flagline__string" width="' + c.W + '" height="60" viewBox="0 0 ' + c.W + ' 60"><path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2"/></svg>' + html;
        el._c = c; el._n = n; el._flags = [].slice.call(el.querySelectorAll(".flagline__flag"));
      });
      roll();
    }
    function roll(){
      var base = reduced ? 0 : scrollY * SPEED;
      lines.forEach(function(el){
        var c = el._c, span = el._n * STEP, off = base + (el._drag || 0); if (!c) return;
        el._flags.forEach(function(f, i){
          var x = ((i * STEP + off) % span + span) % span - STEP;
          f.style.transform = "translate(" + (x - FW / 2).toFixed(1) + "px," + c.y(x).toFixed(1) + "px) rotate(" + c.a(x).toFixed(2) + "deg)";
        });
      });
    }
    var ticking = false;
    addEventListener("scroll", function(){ if (!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; roll(); }); } }, { passive: true });
    /* grab any pennant and slide the whole string left or right: the string eases after your hand,
       and keeps gliding a little when you let go, slowing to a stop */
    lines.forEach(function(el){
      var start = null, target = 0, vel = 0, lastX = 0, lastT = 0, running = false;
      el._drag = el._drag || 0;
      function loop(){
        if (start){ el._drag += (target - el._drag) * .2; }          // follow the hand with a soft lag
        else { target += vel; vel *= .88; el._drag += (target - el._drag) * .2; }   // coast after release
        roll();
        if (start || Math.abs(vel) > .05 || Math.abs(target - el._drag) > .3) requestAnimationFrame(loop);
        else { el._drag = target; roll(); running = false; }
      }
      function kick(){ if (!running){ running = true; requestAnimationFrame(loop); } }
      el.addEventListener("pointerdown", function(e){
        if (!e.target.closest(".flagline__flag")) return;
        target = el._drag; vel = 0;
        start = { x: e.clientX, d: el._drag }; lastX = e.clientX; lastT = performance.now();
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        el.classList.add("is-dragging"); e.preventDefault(); kick();
      });
      el.addEventListener("pointermove", function(e){
        if (!start) return;
        var now = performance.now(), dt = Math.max(8, now - lastT);
        vel = vel * .6 + ((e.clientX - lastX) / dt * 16) * .4;      // px per frame, smoothed
        lastX = e.clientX; lastT = now;
        target = start.d + (e.clientX - start.x);
      });
      function end(){
        if (!start) return; start = null; el.classList.remove("is-dragging");
        if (performance.now() - lastT > 90) vel = 0;                  // held still before letting go: no fling
        vel = Math.max(-24, Math.min(24, vel * .6)); kick();
      }
      el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    });
    var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(build, 150); });
    build();
  })();

  /* nav appears once the island scrolls away */
  (function(){
    var isl = document.getElementById("island"), hdr = document.getElementById("site-header");
    if (!isl || !hdr) return;
    function check(){ hdr.classList.toggle("show", isl.getBoundingClientRect().bottom < 140); }
    addEventListener("scroll", check, { passive: true }); addEventListener("resize", check); check();
  })();

  /* countdown to the gates */
  (function(){
    var el = document.getElementById("countdown"); if (!el) return;
    var open = new Date("2027-01-16T08:45:00-08:00"), end = new Date("2027-01-17T17:00:00-08:00"), now = new Date();
    var days = Math.ceil((open - now) / 864e5);
    el.textContent = now > end ? "Thanks for riding. See you next year." : now >= open ? "The park is open." : days === 1 ? "Gates open tomorrow." : "Gates open in " + days + " days";
    el.hidden = false;
  })();

  if (hasSky){
    skyline(); air(document.getElementById("air"));
    placeBulbs(); addEventListener("resize", placeBulbs);
    if (document.fonts) document.fonts.ready.then(placeBulbs);
  }

  /* make a wish: write it on the paper, tick it into the wishing box. Nothing is stored or sent. */
  (function(){
    var form = document.getElementById("wish"), input = document.getElementById("wish-text"), count = document.getElementById("wish-count"), box = document.getElementById("wishbox");
    if (!form) return;
    var n = 0, busy = false;
    function sync(){ form.classList.toggle("is-empty", !input.value); }
    input.addEventListener("input", sync); sync();
    form.addEventListener("submit", function(e){
      e.preventDefault();
      if (busy) return;
      if (!input.value.trim()){ form.classList.remove("is-nudge"); void form.offsetWidth; form.classList.add("is-nudge"); input.focus(); return; }
      busy = true; input.blur();
      // aim the folded paper at the slot in the box's lid
      var pr = form.getBoundingClientRect(), br = box.getBoundingClientRect();
      form.style.setProperty("--to-x", (br.left + br.width * .52 - (pr.left + pr.width / 2)).toFixed(0) + "px");
      form.style.setProperty("--to-y", (br.top + br.height * .2 - (pr.top + pr.height / 2)).toFixed(0) + "px");
      form.classList.add("is-sending");
      setTimeout(function(){ box.classList.add("is-catching"); }, reduced ? 0 : 650);
      setTimeout(function(){
        n++; input.value = ""; sync();
        form.classList.remove("is-sending"); form.classList.add("is-fresh");
        box.classList.remove("is-catching");
        count.textContent = n === 1 ? "Your wish is in the box. Now blow out the candles." : n + " wishes in the box. Blow out the candles for luck.";
        if (window.JOY && window.JOY.relightCake) window.JOY.relightCake();
        setTimeout(function(){ form.classList.remove("is-fresh"); busy = false; }, 500);
      }, reduced ? 50 : 1150);
    });
  })();

  var fin = document.getElementById("finale"), fired = false;
  if (fin) fin.addEventListener("mouseover", function(e){
    if (fired || !e.target.closest(".btn")) return; fired = true; window.JOY.confetti(); setTimeout(function(){ fired = false; }, 3000);
  });
})();
