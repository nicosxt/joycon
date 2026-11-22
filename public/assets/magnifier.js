/* A brass magnifying glass you can drag anywhere on the page.
   The lens shows a live copy of the page under it, enlarged, and bent
   through an SVG displacement filter so it reads like a fisheye lens. */
(function(){
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var home = document.getElementById("mag-home"), main = document.querySelector("main");
  if (!home || !main) return;

  var IMG_W = 300, IMG_H = Math.round(300 * 627 / 640);      // magnifier.webp is 640 x 627
  var LX = IMG_W * .2712, LY = IMG_H * .2738, R = IMG_W * .247; // lens centre and radius on the image
  var D = Math.round(R * 2), ZOOM = 1.45;

  /* fisheye displacement map: sample closer to the centre the nearer you are to it */
  var POW = 1.6, maxShift = 0, map = document.createElement("canvas"); map.width = map.height = D;
  (function(){
    var g = map.getContext("2d"), img = g.createImageData(D, D), shifts = [];
    for (var y = 0; y < D; y++) for (var x = 0; x < D; x++){
      var dx = (x + .5 - D / 2) / (D / 2), dy = (y + .5 - D / 2) / (D / 2), rn = Math.hypot(dx, dy), sx = 0, sy = 0;
      if (rn < 1 && rn > 0){ var s = (Math.pow(rn, POW) - rn) * (D / 2); sx = s * dx / rn; sy = s * dy / rn; }
      shifts.push(sx, sy); maxShift = Math.max(maxShift, Math.abs(sx), Math.abs(sy));
    }
    var S = maxShift * 2.05;
    for (var i = 0; i < D * D; i++){
      img.data[i * 4] = Math.round(128 + shifts[i * 2] / S * 255);
      img.data[i * 4 + 1] = Math.round(128 + shifts[i * 2 + 1] / S * 255);
      img.data[i * 4 + 2] = 128; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0); map._scale = S;
  })();
  var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true"); svg.style.position = "absolute";
  svg.innerHTML = '<filter id="mag-fisheye" filterUnits="userSpaceOnUse" x="0" y="0" width="' + D + '" height="' + D + '" color-interpolation-filters="sRGB">' +
    '<feImage href="' + map.toDataURL() + '" x="0" y="0" width="' + D + '" height="' + D + '" preserveAspectRatio="none" result="m"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="m" scale="' + map._scale.toFixed(2) + '" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(svg);

  /* the magnifier */
  var mag = document.createElement("div");
  mag.className = "magnifier"; mag.setAttribute("aria-hidden", "true");
  mag.style.width = IMG_W + "px"; mag.style.height = IMG_H + "px";
  mag.innerHTML = '<div class="magnifier__body">' +
    '<div class="magnifier__lens" style="left:' + (LX - R) + 'px;top:' + (LY - R) + 'px;width:' + D + 'px;height:' + D + 'px">' +
      '<div class="magnifier__fx"><div class="magnifier__view"></div></div><div class="magnifier__glass"></div>' +
    '</div>' +
    '<img class="magnifier__img" src="assets/img/magnifier.webp" alt="" width="' + IMG_W + '" height="' + IMG_H + '" draggable="false">' +
    '<div class="magnifier__sparkles" style="left:' + (LX - R * 1.35) + 'px;top:' + (LY - R * 1.35) + 'px;width:' + (R * 2.7) + 'px;height:' + (R * 2.7) + 'px">' + sparkles() + '</div>' +
    '</div>';
  /* white sparkles that twinkle in and around the lens while it is over "Find your joy" */
  function sparkles(){
    var h = "", n = 22;
    for (var i = 0; i < n; i++){
      var a = i * 2.399, r = i % 3 ? 14 + (i * 23) % 34 : 40 + (i * 11) % 12;     // most inside the glass, every third one out past the rim
      var sz = 12 + (i * 7) % 16;
      h += '<i style="left:' + (50 + r * Math.cos(a)).toFixed(1) + '%;top:' + (50 + r * Math.sin(a)).toFixed(1) + '%;--s:' + sz + 'px;--d:' + (1.1 + (i % 5) * .25).toFixed(2) + 's;animation-delay:' + (-(i * .37) % 1.6).toFixed(2) + 's"></i>';
    }
    return h;
  }
  document.body.appendChild(mag);
  var view = mag.querySelector(".magnifier__view"), bodyEl = mag.querySelector(".magnifier__body"), fx = mag.querySelector(".magnifier__fx");
  /* grabbing tilts the glass 10° more upright, pivoting on the end of the handle */
  var PX = IMG_W * .955, PY = IMG_H * .955, rot = 0, rotTo = 0;
  bodyEl.style.transformOrigin = PX + "px " + PY + "px";

  var copy = null, lastClone = 0;
  function reclone(){
    var r = main.getBoundingClientRect();
    copy = main.cloneNode(true);
    // ids stay: some sections are styled by id, and getElementById still finds the
    // originals first because the magnifier sits at the end of <body>
    copy.setAttribute("inert", "");
    // the island lives in an iframe; snapshot its live document into a shadow root so it magnifies too
    var origFrames = main.querySelectorAll("iframe");
    [].forEach.call(copy.querySelectorAll("iframe"), function(f, i){
      var d = document.createElement("div"), src = origFrames[i], doc = null;
      d.style.cssText = "position:absolute;inset:0;transform:translateZ(0);overflow:hidden";   // transform: fixed children anchor here
      try { doc = src && src.contentDocument; } catch (e) {}
      if (doc && doc.body){
        var root = d.attachShadow({ mode: "open" });
        [].forEach.call(doc.querySelectorAll('link[rel="stylesheet"], style'), function(n){
          var c = n.cloneNode(true); if (c.tagName === "LINK") c.href = n.href; root.appendChild(c);
        });
        var host = document.createElement("style");
        host.textContent = ":host{display:block}.jc-island-snap{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}";
        root.appendChild(host);
        var wrap = document.createElement("div"); wrap.className = "jc-island-snap " + (doc.documentElement.className || "");
        var body = doc.body.cloneNode(true);
        [].forEach.call(body.querySelectorAll("script"), function(s){ s.remove(); });
        while (body.firstChild) wrap.appendChild(body.firstChild);
        root.appendChild(wrap);
      }
      f.replaceWith(d);
    });
    [].forEach.call(copy.querySelectorAll("img[loading]"), function(im){ im.loading = "eager"; });
    [].forEach.call(copy.querySelectorAll(".reveal"), function(el){ el.classList.add("in"); });
    copy.style.cssText = "position:absolute;margin:0;left:" + (r.left + scrollX) + "px;top:" + (r.top + scrollY) + "px;width:" + r.width + "px";
    view.replaceChildren(copy); lastClone = Date.now();
  }

  var x = 0, y = 0, moved = false;
  function render(){
    mag.style.transform = "translate(" + x + "px," + y + "px)";
    bodyEl.style.transform = "rotate(" + rot.toFixed(2) + "deg)";
    fx.style.transform = "rotate(" + (-rot).toFixed(2) + "deg)";       // keep the magnified view upright
    var a = rot * Math.PI / 180, dx = LX - PX, dy = LY - PY;
    var px = x + PX + dx * Math.cos(a) - dy * Math.sin(a), py = y + PY + dx * Math.sin(a) + dy * Math.cos(a);   // page point under the lens centre
    view.style.transform = "translate(" + (R - ZOOM * px) + "px," + (R - ZOOM * py) + "px) scale(" + ZOOM + ")";
    joyCheck(px, py);
  }
  /* is the lens over the "Find your joy" button? then the magnified button turns rainbow and sparkles */
  var joyBtn = document.querySelector('.joy-teaser a[href="/joy"]');
  function joyCheck(px, py){
    if (!joyBtn) return;
    var b = joyBtn.getBoundingClientRect(), l = b.left + scrollX, t = b.top + scrollY, rr = R / ZOOM * 1.1;
    var nx = Math.max(l, Math.min(px, l + b.width)), ny = Math.max(t, Math.min(py, t + b.height));
    mag.classList.toggle("is-joy", b.width > 0 && Math.hypot(px - nx, py - ny) < rr);
  }
  var spinning = false;
  function spin(){
    if (spinning) return; spinning = true;
    (function step(){
      rot += (rotTo - rot) * .28;
      if (Math.abs(rotTo - rot) < .05) rot = rotTo;
      render();
      if (rot !== rotTo) requestAnimationFrame(step); else spinning = false;
    })();
  }
  /* start with the lens over the word "you" in the heading */
  function home_(){
    var h = document.getElementById("jt-h"), cx, cy;
    var tn = h && [].filter.call(h.childNodes, function(n){ return n.nodeType === 3 && /\byou\b/.test(n.textContent); })[0];
    if (tn){
      var i = tn.textContent.search(/\byou\b/), rg = document.createRange(); rg.setStart(tn, i); rg.setEnd(tn, i + 3);
      var b = rg.getBoundingClientRect(); cx = b.left + b.width / 2 + scrollX; cy = b.top + b.height * .55 + scrollY;
    } else { var r = home.getBoundingClientRect(); cx = r.left + r.width / 2 + scrollX; cy = r.top + r.height / 2 + scrollY; }
    x = cx - LX; y = cy - LY; render();
  }

  /* drag */
  var drag = null;
  mag.addEventListener("pointerdown", function(e){
    if (e.button !== 0 && e.pointerType === "mouse") return;
    reclone();                                        // always fresh: the page may have changed since
    drag = { ox: e.pageX - x, oy: e.pageY - y }; rotTo = reduced ? 0 : 10; spin();
    try { mag.setPointerCapture(e.pointerId); } catch (err) {}
    mag.classList.add("is-dragging"); e.preventDefault();
  });
  mag.addEventListener("pointermove", function(e){
    if (!drag) return;
    var maxX = document.documentElement.scrollWidth - IMG_W * .6;
    x = Math.max(-IMG_W * .3, Math.min(maxX, e.pageX - drag.ox)); y = Math.max(0, e.pageY - drag.oy);
    moved = true; render();
  });
  function end(){ drag = null; mag.classList.remove("is-dragging"); rotTo = 0; spin(); }
  mag.addEventListener("pointerup", end); mag.addEventListener("pointercancel", end);

  function boot(){ reclone(); home_(); mag.classList.add("is-ready"); }
  /* keep the copy in step when the page changes height (letter opening, images, fridge) */
  if (window.ResizeObserver){
    var ro; new ResizeObserver(function(){ clearTimeout(ro); ro = setTimeout(function(){ if (drag) return; reclone(); if (!moved) home_(); else render(); }, 250); }).observe(main);
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(boot, 300); });
  var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ reclone(); if (!moved) home_(); else render(); }, 200); });
  addEventListener("load", function(){ reclone(); if (!moved) home_(); else render(); });
})();
