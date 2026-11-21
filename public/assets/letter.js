/* The letter arrives in an envelope. Tap it: the flap lifts, the letter slides
   out and grows, and the words fade in. Click the open letter to fold it back. */
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

  /* One timeline, played forwards to open and backwards to close.
     Steps (ms): flap lifts, card slides out of the pocket, envelope drops and card comes forward, text fades in. */
  var T = reduced ? [0, 0, 0, 0] : [0, 160, 400, 560], timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, ms)); }
  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
  function openHeight(){ return (letter.offsetTop + letter.offsetHeight + 24) + "px"; }

  function open(){
    if (state === "open" || state === "opening") return;
    clearTimers(); state = "opening";
    btn.setAttribute("aria-expanded", "true"); btn.disabled = true;
    mail.classList.add("is-flap"); burst();
    later(function(){                                    // slide up out of the pocket
      mail.classList.add("is-rising");
      var q = tucked(box(env).h * .82), p = tucked(0);
      letter.style.transform = p.t; letter.style.clipPath = p.clip; void letter.offsetWidth;
      letter.style.transition = ""; letter.style.transform = q.t; letter.style.clipPath = q.clip;
    }, T[1]);
    later(function(){                                    // envelope drops away, card comes forward
      mail.classList.add("is-out");
      letter.style.transform = "none"; letter.style.clipPath = "inset(0 0 0 0)";
      mail.style.height = openHeight();
    }, T[2]);
    later(function(){                                    // the words fade in
      state = "open"; mail.classList.add("is-open", "is-writing");
      letter.setAttribute("title", "Click to fold the letter back into its envelope");
      later(function(){ letter.style.clipPath = ""; }, 60);
    }, T[3]);
  }

  function close(){
    if (state !== "open") return;
    clearTimers(); state = "closing";
    letter.removeAttribute("title");
    mail.classList.remove("is-writing", "is-open");     // the words fade out
    // measure the in-pocket positions with the card at rest, then glide back to them
    var q = tucked(box(env).h * .82), p = tucked(0);
    letter.style.transform = "none"; letter.style.clipPath = "inset(0 0 0 0)"; void letter.offsetWidth;
    letter.style.transition = "";
    later(function(){                                    // envelope comes back, card shrinks above its pocket
      mail.classList.remove("is-out");
      letter.style.transform = q.t; letter.style.clipPath = q.clip;
      mail.style.height = (box(env).y + box(env).h + 64) + "px";
    }, reduced ? 0 : 120);
    later(function(){                                    // card slides back into the pocket
      letter.style.transform = p.t; letter.style.clipPath = p.clip;
    }, reduced ? 0 : 360);
    later(function(){ mail.classList.remove("is-rising"); }, reduced ? 0 : 600);   // flap back in front
    later(function(){                                    // flap closes
      mail.classList.remove("is-flap");
      state = "closed"; btn.disabled = false; btn.setAttribute("aria-expanded", "false");
    }, reduced ? 0 : 640);
  }

  letter.addEventListener("click", function(e){ if (state === "open" && !e.target.closest("a")) close(); });
  letter.addEventListener("keydown", function(e){ if (state === "open" && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); close(); } });
  btn.addEventListener("click", open);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(place);
  addEventListener("load", place);
  var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){
    if (state === "closed") place(); else if (state === "open") mail.style.height = openHeight();
  }, 150); });
})();
