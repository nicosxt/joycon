/* A gentle 3D tilt that follows the cursor (the same feel as the Agartha residencies cards):
   the side nearest the pointer dips away, up to MAX degrees, and it eases flat again on leave.
   Mouse and pen only; touch screens and reduced-motion keep things still. */
(function(){
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var TARGETS = [["#mail", 5], [".site-footer > .wrap", 3]];   // [selector, max tilt in degrees]

  function bind(el, max){
    el.classList.add("tilt");
    el.addEventListener("pointermove", function(e){
      if (e.pointerType === "touch") return;
      var r = el.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2;
      var ry = (e.clientX - r.left - cx) / cx * max, rx = (cy - (e.clientY - r.top)) / cy * max;
      el.style.transform = "perspective(1000px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    });
    el.addEventListener("pointerleave", function(){ el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"; });
  }
  function init(){ TARGETS.forEach(function(t){ [].forEach.call(document.querySelectorAll(t[0]), function(el){ bind(el, t[1]); }); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
