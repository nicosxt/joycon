/* A brass magnifying glass you can drag anywhere on the page.
   The lens shows a live copy of the page under it, enlarged, and bent
   through an SVG displacement filter so it reads like a fisheye lens. */
(function(){
  "use strict";
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
  mag.innerHTML =
    '<div class="magnifier__lens" style="left:' + (LX - R) + 'px;top:' + (LY - R) + 'px;width:' + D + 'px;height:' + D + 'px">' +
      '<div class="magnifier__fx"><div class="magnifier__view"></div></div><div class="magnifier__glass"></div>' +
    '</div>' +
    '<img class="magnifier__img" src="assets/img/magnifier.webp" alt="" width="' + IMG_W + '" height="' + IMG_H + '" draggable="false">';
  document.body.appendChild(mag);
  var view = mag.querySelector(".magnifier__view");

  var copy = null, lastClone = 0;
  function reclone(){
    var r = main.getBoundingClientRect();
    copy = main.cloneNode(true);
    // ids stay: some sections are styled by id, and getElementById still finds the
    // originals first because the magnifier sits at the end of <body>
    copy.setAttribute("inert", "");
    [].forEach.call(copy.querySelectorAll("iframe"), function(f){ var d = document.createElement("div"); d.style.cssText = "width:100%;height:100%;background:var(--c-dutch)"; f.replaceWith(d); });
    [].forEach.call(copy.querySelectorAll("img[loading]"), function(im){ im.loading = "eager"; });
    [].forEach.call(copy.querySelectorAll(".reveal"), function(el){ el.classList.add("in"); });
    copy.style.cssText = "position:absolute;margin:0;left:" + (r.left + scrollX) + "px;top:" + (r.top + scrollY) + "px;width:" + r.width + "px";
    view.replaceChildren(copy); lastClone = Date.now();
  }

  var x = 0, y = 0, moved = false;
  function render(){
    mag.style.transform = "translate(" + x + "px," + y + "px)";
    var px = x + LX, py = y + LY;                    // page point under the lens centre
    view.style.transform = "translate(" + (R - ZOOM * px) + "px," + (R - ZOOM * py) + "px) scale(" + ZOOM + ")";
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
    drag = { ox: e.pageX - x, oy: e.pageY - y }; mag.setPointerCapture(e.pointerId); mag.classList.add("is-dragging"); e.preventDefault();
  });
  mag.addEventListener("pointermove", function(e){
    if (!drag) return;
    var maxX = document.documentElement.scrollWidth - IMG_W * .6;
    x = Math.max(-IMG_W * .3, Math.min(maxX, e.pageX - drag.ox)); y = Math.max(0, e.pageY - drag.oy);
    moved = true; render();
  });
  function end(){ drag = null; mag.classList.remove("is-dragging"); }
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
