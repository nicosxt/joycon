/* The Joy Ride: a roller coaster that loops around the whole island.
   The island bundle renders two full-board layers for it (part 0 behind the
   rides, part 1 in front) and calls JC_COASTER(el, part) for each. Board
   coordinates are the island's 1600 x 893 space. */
(function(){
  "use strict";
  var W = 1600, H = 893, NS = "http://www.w3.org/2000/svg", INK = "#42434b";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ground loop, clockwise, hugging the inside of the island's grassy edge */
  var GROUND = [
    [340, 430], [372, 340], [450, 300], [560, 272], [680, 262], [800, 258], [920, 270],
    [1040, 262], [1150, 270], [1212, 318], [1238, 405], [1262, 492], [1318, 572], [1330, 640],
    [1250, 684], [1120, 700], [980, 706], [840, 708], [700, 708], [560, 708], [450, 694],
    [378, 650], [338, 580], [322, 505]
  ];
  var FRONT_Y = 585;   // ground points lower than this are in front of the rides

  function spline(pts){                       // closed Catmull-Rom -> cubic Bezier path
    var n = pts.length, d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 0; i < n; i++){
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
           (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0] + " " + p2[1];
    }
    return d + "Z";
  }

  /* sample the loop once: ground point, lifted track point, front/back */
  var S = null;
  function sample(){
    if (S) return S;
    var svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
    p.setAttribute("d", spline(GROUND)); svg.appendChild(p); document.body.appendChild(svg);
    var L = p.getTotalLength(), step = 4, pts = [];
    for (var s = 0; s < L; s += step){
      var g = p.getPointAtLength(s), u = s / L;
      var lift = 34 + 20 * Math.sin(u * Math.PI * 2 * 5) + 26 * Math.max(0, Math.sin(u * Math.PI * 2 - 1.2)) ;
      pts.push({ gx: g.x, gy: g.y, x: g.x, y: g.y - lift, front: g.y > FRONT_Y, s: s });
    }
    svg.remove();
    S = { pts: pts, L: L, step: step };
    return S;
  }

  function polyline(arr){ return arr.map(function(q, i){ return (i ? "L" : "M") + q.x.toFixed(1) + " " + q.y.toFixed(1); }).join(" "); }
  function groundline(arr){ return arr.map(function(q, i){ return (i ? "L" : "M") + q.gx.toFixed(1) + " " + q.gy.toFixed(1); }).join(" "); }

  /* split the loop into runs of the same layer, with a little overlap so the joins don't gap */
  function runs(pts, front){
    var out = [], cur = null, n = pts.length;
    var start = 0; while (start < n && pts[start].front === pts[(start - 1 + n) % n].front) start++;   // begin at a layer change
    if (start >= n) start = 0;
    for (var k = 0; k <= n; k++){
      var q = pts[(start + k) % n];
      if (q.front === front){ if (!cur){ cur = []; var pr = pts[(start + k - 1 + n) % n]; cur.push(pr); } cur.push(q); }
      else if (cur){ cur.push(q); out.push(cur); cur = null; }
    }
    if (cur) out.push(cur);
    return out;
  }

  var CART =
    '<g class="jc-cart">' +
      '<ellipse cx="0" cy="6" rx="22" ry="4" fill="rgba(66,67,75,.18)"/>' +
      // riders, arms up
      '<g stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round">' +
        '<path d="M-13 -14 l-4 -9 M-9 -14 l3 -9" /><path d="M3 -14 l-3 -10 M8 -14 l4 -9" />' +
      '</g>' +
      '<circle cx="-11" cy="-15" r="5" fill="#f3c9a8" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<circle cx="5" cy="-15" r="5" fill="#c98f6b" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<path d="M-16 -19 q5 -5 10 0" fill="#5b3a29"/><path d="M0 -19 q5 -6 10 0" fill="#2a2420"/>' +
      // the car
      '<path d="M-24 -10 Q-26 2 -18 4 L18 4 Q26 2 25 -12 L19 -12 Q17 -6 10 -6 L-14 -6 Q-19 -6 -20 -10 Z" fill="#e9809c" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M-17 -2 L17 -2" stroke="#fbf3df" stroke-width="2" stroke-linecap="round" opacity=".8"/>' +
      '<circle cx="-12" cy="5" r="3.2" fill="#f9ce88" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<circle cx="12" cy="5" r="3.2" fill="#f9ce88" stroke="' + INK + '" stroke-width="1.6"/>' +
    '</g>';

  var layers = [null, null], carEls = [null, null], running = false;

  window.JC_COASTER = function(el, part){
    if (!el) return;
    part = part ? 1 : 0;
    var d = sample(), pts = d.pts, front = !!part;
    var html = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="jc-coaster" width="100%" height="100%" style="display:block;overflow:visible">';
    runs(pts, front).forEach(function(run){
      html += '<path d="' + groundline(run) + '" fill="none" stroke="rgba(66,67,75,.14)" stroke-width="10" stroke-linecap="round"/>';
      // supports every ~56px
      for (var i = 0; i < run.length; i += 14){
        var q = run[i];
        html += '<path d="M' + q.x.toFixed(1) + ' ' + (q.y + 4).toFixed(1) + ' L' + q.gx.toFixed(1) + ' ' + q.gy.toFixed(1) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
                '<path d="M' + q.x.toFixed(1) + ' ' + (q.y + 4).toFixed(1) + ' L' + q.gx.toFixed(1) + ' ' + q.gy.toFixed(1) + '" stroke="#d6e9f1" stroke-width="1.6" stroke-linecap="round"/>';
      }
      var t = polyline(run);
      html += '<path d="' + t + '" fill="none" stroke="' + INK + '" stroke-width="24" stroke-dasharray="3.5 10" stroke-linecap="butt"/>' +   // ties
              '<path class="jc-track" d="' + t + '" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path d="' + t + '" fill="none" stroke="#b9dcec" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path d="' + t + '" fill="none" stroke="#eef8fc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -1.6)"/>';
    });
    html += CART + '</svg>';
    el.innerHTML = html;
    [].forEach.call(el.querySelectorAll(".jc-track"), function(p){ p.style.pointerEvents = "stroke"; p.style.cursor = "pointer"; });
    layers[part] = el; carEls[part] = el.querySelector(".jc-cart");
    if (!running){ running = true; requestAnimationFrame(tick); }
  };

  var pos = 0, last = 0;
  function at(s){
    var d = S, n = d.pts.length, f = ((s % d.L) + d.L) % d.L / d.step, i = Math.floor(f) % n, j = (i + 1) % n, t = f - Math.floor(f);
    var a = d.pts[i], b = d.pts[j];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI, front: t < .5 ? a.front : b.front };
  }
  function tick(now){
    var dt = last ? Math.min(64, now - last) : 16; last = now;
    if (!reduced){
      // a little gravity: faster going downhill, slower climbing
      var here = at(pos), ahead = at(pos + 8), slope = (ahead.y - here.y) / 8;
      pos += dt * (0.11 + Math.max(-.05, Math.min(.09, slope * .25)));
    }
    var p = at(pos), flip = Math.abs(p.ang) > 90;
    var tf = "translate(" + p.x.toFixed(1) + " " + (p.y - 5).toFixed(1) + ") rotate(" + (flip ? p.ang - 180 : p.ang).toFixed(1) + ")" + (flip ? " scale(-1.5 1.5)" : " scale(1.5)");
    for (var k = 0; k < 2; k++){
      var c = carEls[k]; if (!c || !c.isConnected) continue;
      c.setAttribute("transform", tf);
      c.style.display = (p.front ? 1 : 0) === k ? "" : "none";
    }
    requestAnimationFrame(tick);
  }
})();
