/* The Joy Ride: the coaster track is painted into island.webp; this script
   sends a painted cart around it. The island bundle renders two full-board
   layers (part 0 behind the rides, part 1 in front) and calls
   JC_COASTER(el, part) for each. Coordinates are the island's 1600 x 893 board. */
(function(){
  "use strict";
  var W = 1600, H = 893, NS = "http://www.w3.org/2000/svg";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CART_SRC = new URL("./images/coaster-cart.webp?v=1", document.baseURI).href;
  var CART_W = 58;                       // cart width on the board, in px

  /* centre line of the painted rails, traced from island.webp */
  var TRACK = [[312,464],[300,456],[289,447],[282,438],[278,429],[278,420],[272,410],[280,385],[300,352],[340,322],[400,302],[460,290],[512,286],[528,282],[542,276],[555,270],[568,264],[583,259],[598,255],[616,253],[634,252],[653,252],[673,252],[692,252],[710,250],[728,248],[744,245],[761,241],[778,238],[795,235],[813,233],[830,234],[847,236],[864,240],[880,246],[895,253],[910,261],[923,268],[937,275],[950,280],[965,284],[980,286],[999,285],[1020,282],[1044,277],[1068,272],[1092,268],[1116,265],[1138,263],[1157,264],[1174,267],[1189,272],[1205,277],[1220,283],[1236,289],[1252,294],[1270,300],[1288,306],[1304,312],[1321,318],[1336,325],[1349,332],[1361,339],[1372,347],[1381,356],[1388,364],[1394,373],[1400,382],[1404,391],[1407,401],[1410,410],[1412,419],[1413,428],[1414,438],[1414,447],[1412,456],[1410,465],[1408,474],[1403,483],[1398,492],[1391,500],[1382,508],[1371,516],[1359,523],[1346,531],[1333,538],[1320,544],[1308,551],[1297,558],[1287,565],[1278,572],[1270,578],[1262,585],[1253,592],[1244,599],[1235,605],[1224,611],[1213,617],[1200,622],[1187,627],[1172,631],[1157,635],[1140,638],[1124,641],[1108,644],[1093,647],[1078,650],[1064,654],[1050,658],[1036,662],[1022,666],[1008,670],[994,674],[979,678],[964,681],[948,684],[932,686],[916,688],[899,690],[883,691],[866,691],[849,690],[833,689],[816,687],[800,685],[784,682],[768,679],[753,676],[737,674],[721,672],[705,670],[688,669],[671,669],[653,668],[634,668],[616,668],[597,668],[578,667],[560,665],[542,662],[526,659],[511,654],[497,649],[485,643],[474,637],[464,630],[456,623],[448,615],[442,607],[436,599],[431,592],[427,584],[423,576],[420,568],[416,560],[413,553],[409,545],[405,538],[401,531],[396,524],[390,517],[383,510],[375,503],[364,496],[352,488],[339,481],[325,473]];
  var FRONT_Y = 560;                     // lower than this, the cart passes in front of the rides

  function spline(pts){                  // closed Catmull-Rom through the traced points
    var n = pts.length, d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 0; i < n; i++){
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
           (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0] + " " + p2[1];
    }
    return d + "Z";
  }
  var D = spline(TRACK), S = null;
  function sample(){
    if (S) return S;
    var svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
    p.setAttribute("d", D); svg.appendChild(p); document.body.appendChild(svg);
    var L = p.getTotalLength(), step = 3, pts = [];
    for (var s = 0; s < L; s += step){ var g = p.getPointAtLength(s); pts.push({ x: g.x, y: g.y }); }
    svg.remove();
    return (S = { pts: pts, L: L, step: step });
  }

  var carEls = [null, null], running = false;
  window.JC_COASTER = function(el, part){
    if (!el) return;
    part = part ? 1 : 0; sample();
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%" style="display:block;overflow:visible" aria-hidden="true">' +
      // invisible hit strip over the painted rails, so the track opens the Joy Ride card
      '<path class="jc-track-glow" d="' + D + '" fill="none" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="jc-track-hit" d="' + D + '" fill="none" stroke="transparent" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g class="jc-cart"><image href="' + CART_SRC + '" x="' + (-CART_W / 2) + '" y="' + (-CART_W * .92) + '" width="' + CART_W + '" height="' + CART_W + '" preserveAspectRatio="xMidYMax meet"/></g>' +
      '</svg>';
    var hit = el.querySelector(".jc-track-hit"); if (hit){ hit.style.pointerEvents = "stroke"; hit.style.cursor = "pointer"; }
    carEls[part] = el.querySelector(".jc-cart");
    carEls[part].style.pointerEvents = "auto"; carEls[part].style.cursor = "pointer";
    // hovering the track or the cart lights up the whole loop, like the other rides
    [hit, carEls[part]].forEach(function(t){
      t.addEventListener("mouseenter", function(){ document.documentElement.classList.add("jc-coaster-hover"); });
      t.addEventListener("mouseleave", function(){ document.documentElement.classList.remove("jc-coaster-hover"); });
    });
    if (!running){ running = true; requestAnimationFrame(tick); }
  };

  var pos = 0, last = 0;
  function at(s){
    var d = S, n = d.pts.length, f = ((s % d.L) + d.L) % d.L / d.step, i = Math.floor(f) % n, j = (i + 1) % n, t = f - Math.floor(f);
    var a = d.pts[i], b = d.pts[j];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
  }
  function tick(now){
    var dt = last ? Math.min(64, now - last) : 16; last = now;
    if (!reduced){
      var here = at(pos), ahead = at(pos + 9), slope = (ahead.y - here.y) / 9;
      pos += dt * (0.075 + Math.max(-.03, Math.min(.06, slope * .2)));   // a little faster downhill
    }
    // average the heading over a short stretch so the cart doesn't jitter on small wiggles
    var p = at(pos), q1 = at(pos - 10), q2 = at(pos + 10), ang = Math.atan2(q2.y - q1.y, q2.x - q1.x) * 180 / Math.PI;
    var left = Math.abs(ang) > 90, rot = left ? ang - 180 : ang;
    rot = Math.max(-28, Math.min(28, rot));
    var tf = "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + rot.toFixed(1) + ")" + (left ? " scale(-1 1)" : "");
    var front = p.y > FRONT_Y;
    for (var k = 0; k < 2; k++){
      var c = carEls[k]; if (!c || !c.isConnected) continue;
      c.setAttribute("transform", tf);
      c.style.display = (front ? 1 : 0) === k ? "" : "none";
    }
    requestAnimationFrame(tick);
  }
})();
