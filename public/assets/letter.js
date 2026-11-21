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
    build();
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

  /* ---------- frame-by-frame timeline (Web Animations), played forwards to open, backwards to close ----------
     0.00  press: the envelope dips
     0.08  the flap peels up a touch, then swings open; its outside darkens as it turns away, its lining lights up
     0.30  flap passes behind the letter
     0.30  the letter slides up out of the pocket, with a little wobble as it clears
     0.62  the envelope drops away while the letter comes forward and settles
     1.00  open (the words then fade in) */
  var DUR = reduced ? 1 : 1100, anims = [], built = false;
  var flap = env.querySelector(".env__flap"), flapOut = env.querySelector(".env__flap-out"), flapIn = env.querySelector(".env__flap-in");
  var body = [env.querySelector(".env__inside"), env.querySelector(".env__front")];
  function openHeight(){ return (letter.offsetTop + letter.offsetHeight + 24) + "px"; }
  function closedHeight(){ return (box(env).y + box(env).h + 64) + "px"; }

  function build(){
    anims.forEach(function(a){ a.cancel(); }); anims = [];
    letter.style.transform = "none"; letter.style.clipPath = ""; letter.style.transition = "none";
    var e = box(env), p = tucked(0), q = tucked(e.h * .82); letter.style.transform = ""; letter.style.clipPath = "";
    var P = "perspective(1400px) ";
    var opts = { duration: DUR, fill: "both" };
    var drop = "translateY(70%) rotate(4deg)";
    body.forEach(function(el){
      anims.push(el.animate([
        { offset: 0,    transform: "none", opacity: 1 },
        { offset: .05,  transform: "translateY(3px) scale(.985)", opacity: 1, easing: "cubic-bezier(.3,1.6,.5,1)" },
        { offset: .12,  transform: "none", opacity: 1 },
        { offset: .62,  transform: "none", opacity: 1, easing: "cubic-bezier(.5,0,.8,.4)" },
        { offset: .92,  transform: drop, opacity: 0 },
        { offset: 1,    transform: drop, opacity: 0 }
      ], opts));
    });
    anims.push(flap.animate([
      { offset: 0,    transform: P + "rotateX(0deg)", zIndex: 4 },
      { offset: .05,  transform: P + "translateY(3px) scale(.985) rotateX(0deg)", zIndex: 4 },
      { offset: .10,  transform: P + "rotateX(-14deg)", zIndex: 4, easing: "cubic-bezier(.45,0,.2,1)" },
      { offset: .29,  transform: P + "rotateX(180deg)", zIndex: 4 },
      { offset: .30,  transform: P + "rotateX(180deg)", zIndex: 0 },
      { offset: .62,  transform: P + "rotateX(180deg)", zIndex: 0, opacity: 1, easing: "cubic-bezier(.5,0,.8,.4)" },
      { offset: .92,  transform: drop + " " + P + "rotateX(180deg)", zIndex: 0, opacity: 0 },
      { offset: 1,    transform: drop + " " + P + "rotateX(180deg)", zIndex: 0, opacity: 0 }
    ], opts));
    anims.push(flapOut.animate([{ offset: 0, filter: "brightness(1)" }, { offset: .1, filter: "brightness(1)" }, { offset: .2, filter: "brightness(.72)" }, { offset: 1, filter: "brightness(.72)" }], opts));
    anims.push(flapIn.animate([{ offset: 0, filter: "brightness(.6)" }, { offset: .2, filter: "brightness(.6)" }, { offset: .3, filter: "brightness(1)" }, { offset: 1, filter: "brightness(1)" }], opts));
    anims.push(letter.animate([
      { offset: 0,    transform: p.t, clipPath: p.clip },
      { offset: .28,  transform: p.t, clipPath: p.clip, easing: "cubic-bezier(.2,.75,.3,1)" },
      { offset: .56,  transform: q.t + " rotate(-1.6deg)", clipPath: q.clip, easing: "ease-in-out" },
      { offset: .64,  transform: q.t + " rotate(.7deg)", clipPath: q.clip, easing: "cubic-bezier(.3,1.25,.45,1)" },
      { offset: 1,    transform: "translate(0,0) scale(1) rotate(0deg)", clipPath: "inset(0px 0px 0px 0px)" }
    ], opts));
    anims.push(mail.animate([
      { offset: 0, height: closedHeight() }, { offset: .62, height: closedHeight(), easing: "cubic-bezier(.4,0,.2,1)" }, { offset: 1, height: openHeight() }
    ], opts));
    anims.forEach(function(a){ a.pause(); a.currentTime = 0; });
    built = true;
  }

  function run(dir, done){
    var left = anims.length;
    anims.forEach(function(a){
      a.playbackRate = dir;
      a.onfinish = function(){ if (--left === 0 && done) done(); };
      a.play();
    });
  }

  function open(){
    if (state !== "closed") return;
    if (!built) build();
    state = "opening"; btn.setAttribute("aria-expanded", "true"); btn.disabled = true;
    mail.classList.add("is-flap"); burst();
    run(1, function(){
      state = "open"; mail.classList.add("is-open", "is-writing");
      letter.setAttribute("title", "Click to fold the letter back into its envelope");
    });
  }

  function close(){
    if (state !== "open") return;
    state = "closing"; letter.removeAttribute("title");
    mail.classList.remove("is-writing", "is-open");          // words fade out first
    setTimeout(function(){
      run(-1, function(){
        state = "closed"; mail.classList.remove("is-flap");
        btn.disabled = false; btn.setAttribute("aria-expanded", "false");
      });
    }, reduced ? 0 : 160);
  }

  letter.addEventListener("click", function(e){ if (state === "open" && !e.target.closest("a")) close(); });
  letter.addEventListener("keydown", function(e){ if (state === "open" && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); close(); } });
  btn.addEventListener("click", open);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(place);
  addEventListener("load", place);
  var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){
    if (state === "closed") place();
    else if (state === "open"){ anims.forEach(function(a){ a.cancel(); }); anims = []; built = false; mail.style.height = openHeight(); }
  }, 150); });
})();
