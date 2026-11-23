/* The Joy Ride: the coaster track is painted into island.webp; this script
   sends a painted cart around it. The island bundle renders two full-board
   layers (part 0 behind the rides, part 1 in front) and calls
   JC_COASTER(el, part) for each. Coordinates are the island's 1600 x 893 board. */
(function(){
  "use strict";
  var W = 1600, H = 893, NS = "http://www.w3.org/2000/svg";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CART_SRC = new URL("./images/coaster-cart.webp?v=3", document.baseURI).href;
  var TRACK_SRC = new URL("./images/track-layer.webp?v=4", document.baseURI).href;
  var CART_W = 58;                       // cart width on the board, in px

  /* centre line of the painted rails, traced from island.webp */
  var TRACK = [[305,474],[292,467],[279,457],[272,444],[270,431],[275,421],[275,410],[290,390],[314,365],[350,343],[407,327],[464,316],[515,313],[536,307],[552,299],[564,291],[576,285],[589,280],[602,276],[618,272],[634,269],[653,267],[673,266],[693,266],[712,265],[730,264],[748,262],[765,259],[781,258],[798,255],[814,253],[828,252],[844,252],[860,253],[876,255],[892,259],[908,265],[922,270],[937,275],[950,280],[965,285],[980,289],[1000,291],[1022,292],[1047,291],[1071,290],[1095,288],[1118,286],[1139,284],[1155,284],[1170,284],[1185,286],[1201,288],[1217,291],[1234,295],[1251,299],[1269,303],[1288,307],[1304,311],[1322,316],[1338,321],[1352,327],[1365,332],[1378,340],[1389,348],[1399,356],[1407,364],[1416,373],[1424,384],[1430,394],[1436,403],[1442,414],[1447,424],[1450,436],[1453,451],[1452,465],[1451,474],[1448,490],[1441,504],[1434,518],[1422,531],[1410,542],[1395,553],[1381,560],[1367,568],[1352,576],[1339,581],[1329,586],[1320,592],[1311,598],[1302,604],[1295,609],[1287,616],[1277,623],[1268,632],[1256,640],[1244,647],[1230,655],[1215,661],[1200,667],[1183,671],[1165,674],[1147,676],[1131,677],[1115,679],[1100,681],[1086,684],[1074,687],[1060,692],[1046,696],[1032,701],[1018,705],[1004,710],[987,714],[971,717],[954,720],[937,722],[920,723],[902,725],[884,725],[865,724],[847,722],[830,719],[812,716],[796,713],[779,708],[763,704],[749,700],[734,697],[718,695],[703,693],[687,692],[670,693],[652,693],[634,694],[616,695],[596,696],[576,695],[556,693],[537,690],[519,686],[502,679],[487,672],[475,663],[464,654],[454,643],[447,632],[441,621],[437,610],[433,601],[429,593],[425,585],[422,577],[419,569],[414,561],[411,554],[407,546],[403,539],[399,532],[395,525],[389,518],[382,511],[373,506],[362,500],[349,493],[335,488],[320,482]];
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
      // the painted rails, cut out of island.webp, so the ride gets the same sticker outline as the others
      (part ? "" : '<image class="jc-track-art" href="' + TRACK_SRC + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>') +
      '<path class="jc-track-hit" d="' + D + '" fill="none" stroke="transparent" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g class="jc-cart"><image href="' + CART_SRC + '" x="' + (-CART_W / 2) + '" y="' + (-CART_W * .92) + '" width="' + CART_W + '" height="' + CART_W + '" preserveAspectRatio="xMidYMax meet"/></g>' +
      '</svg>';
    var hit = el.querySelector(".jc-track-hit"); if (hit){ hit.style.pointerEvents = "stroke"; hit.style.cursor = "pointer"; }
    carEls[part] = el.querySelector(".jc-cart");
    carEls[part].style.pointerEvents = "auto"; carEls[part].style.cursor = "pointer";
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
