/* The letter arrives in an envelope. Tap it: the flap lifts, the postcard slides
   out and grows, then the words write themselves on, one at a time. */
(function(){
  "use strict";
  var mail = document.getElementById("mail"); if (!mail) return;
  var env = mail.querySelector(".env"), btn = mail.querySelector(".mail__open"), letter = mail.querySelector(".letter");
  var sparks = mail.querySelector(".mail__sparks");
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = "closed";

  /* wrap every word so it can be written in */
  var words = [];
  [].forEach.call(letter.querySelectorAll("p"), function(p){
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function(t){
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function(part){
        if (!part) return;
        if (/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span"); w.className = "w"; w.textContent = part; frag.appendChild(w); words.push(w);
      });
      t.replaceWith(frag);
    });
  });

  function box(el){ var r = el.getBoundingClientRect(), m = mail.getBoundingClientRect(); return { x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height }; }

  /* where the letter sits while it's tucked inside the envelope */
  function tucked(rise){
    letter.style.transition = "none"; letter.style.transform = "none";
    var e = box(env), L = box(letter), s = e.w * .84 / L.w;
    var top = e.y + e.h * .1 - rise;
    var visible = (e.y + e.h - 14 - top) / s;                        // letter px still above the envelope's bottom edge
    return { t: "translate(0," + (top - L.y).toFixed(1) + "px) scale(" + s.toFixed(4) + ")", clip: "inset(0 0 " + Math.max(0, L.h - visible).toFixed(1) + "px 0)" };
  }
  function place(){
    if (state !== "closed") return;
    mail.style.height = (box(env).y + box(env).h + 64) + "px";
    var p = tucked(0); letter.style.transform = p.t; letter.style.clipPath = p.clip;
  }

  function burst(){
    if (reduced) return;
    var cols = ["#e9809c", "#f79c09", "#0588c4", "#35a468", "#f9ce88", "#e2562c"], e = box(env), html = "";
    for (var i = 0; i < 26; i++){
      var a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 170;
      html += '<i style="left:' + (e.x + e.w / 2) + 'px;top:' + (e.y + e.h * .45) + 'px;--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d - 40).toFixed(0) + 'px;--c:' + cols[i % cols.length] + ';--s:' + (.5 + Math.random() * .9).toFixed(2) + ';--t:' + (Math.random() * .25).toFixed(2) + 's">✦</i>';
    }
    sparks.innerHTML = html;
  }

  function open(){
    if (state !== "closed") return;
    state = "opening"; btn.setAttribute("aria-expanded", "true"); btn.disabled = true;
    var T = reduced ? [0, 0, 0, 0] : [0, 650, 1650, 2500];
    mail.classList.add("is-flap");
    burst();
    setTimeout(function(){                                   // slide out of the envelope
      mail.classList.add("is-rising");
      var p = tucked(0), q;
      void letter.offsetWidth;
      letter.style.transform = p.t; letter.style.clipPath = p.clip; void letter.offsetWidth;
      q = tucked(box(env).h * .82);
      letter.style.transform = p.t; letter.style.clipPath = p.clip; void letter.offsetWidth;
      letter.style.transition = ""; letter.style.transform = q.t; letter.style.clipPath = q.clip;
    }, T[1]);
    setTimeout(function(){                                   // the envelope drops away, the card comes forward
      mail.classList.add("is-out");
      letter.style.transform = "none"; letter.style.clipPath = "inset(0 0 0 0)";
      mail.style.height = (letter.offsetTop + letter.offsetHeight + 24) + "px";
    }, T[2]);
    setTimeout(function(){                                   // write the words
      state = "open"; mail.classList.add("is-open");
      var per = reduced ? 0 : Math.min(38, 5200 / words.length);
      words.forEach(function(w, i){ w.style.transitionDelay = (i * per / 1000).toFixed(3) + "s"; });
      setTimeout(function(){ mail.classList.add("is-writing"); }, 30);
      setTimeout(function(){ letter.style.clipPath = ""; }, 100);
    }, T[3]);
  }

  btn.addEventListener("click", open);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(place);
  addEventListener("load", place);
  var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){
    if (state === "closed") place(); else if (state === "open") mail.style.height = (letter.offsetTop + letter.offsetHeight + 24) + "px";
  }, 150); });
})();
