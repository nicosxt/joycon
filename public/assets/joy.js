/* Find Your Joy: six questions, a type of joy, the rides made for it,
   and a shareable admission ticket drawn on a canvas (1080 x 1350, Instagram portrait). */
(function(){
  "use strict";
  var J = window.JOY || {}, root = document.getElementById("sorter");
  if (!root || !J.sort) return;
  var Q = J.sort, picks = [], step = 0;
  var INK = "#34302c";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function joy(id){ return (J.joyTypes || []).filter(function(t){ return t.id === id; })[0] || { id: id, label: id, color: "#e6d6b6", blurb: "" }; }

  function ask(){
    var q = Q[step];
    root.innerHTML =
      '<div class="sorter__card">' +
        '<div class="sorter__progress" aria-hidden="true">' + Q.map(function(_, i){ return '<i class="' + (i < step ? "done" : i === step ? "now" : "") + '"></i>'; }).join("") + '</div>' +
        '<p class="sorter__count">Question ' + (step + 1) + ' of ' + Q.length + '</p>' +
        '<h2 class="sorter__q" tabindex="-1">' + esc(q.q) + '</h2>' +
        '<div class="sorter__answers">' + q.a.map(function(a, i){
          return '<button type="button" class="sorter__a" data-i="' + i + '"><span class="sorter__key" aria-hidden="true">' + "ABC"[i] + '</span>' + esc(a[0]) + '</button>'; }).join("") + '</div>' +
        (step > 0 ? '<button type="button" class="linkish sorter__back">&larr; Back</button>' : '') +
      '</div>';
    var h = root.querySelector(".sorter__q"); if (step > 0) h.focus({ preventScroll: true });
  }

  function result(){
    var tally = {}, best = null;
    picks.forEach(function(id){ tally[id] = (tally[id] || 0) + 1; if (!best || tally[id] >= tally[best]) best = id; });
    var t = joy(best);
    var rides = [];
    (J.days || []).forEach(function(d){ d.blocks.forEach(function(b){ if (b.joy === best) rides.push({ name: b.title, when: d.tab + ", " + b.time, where: b.where }); }); });
    var recipes = (J.prototypedRides || []).filter(function(r){ return r.joy === best && r.url; });
    if (!rides.length) (J.days || []).forEach(function(d){ d.blocks.forEach(function(b){ if (b.spot === "safari" || b.spot === "city") rides.push({ name: b.title, when: d.tab + ", " + b.time, where: b.where }); }); });
    var no = String(Math.floor(100 + Math.random() * 900)).padStart(4, "0");

    root.innerHTML =
      '<div class="sorter__result">' +
        '<div class="sorter__reveal" style="--joy:' + esc(t.color) + '">' +
          '<p class="eyebrow">Your joy</p>' +
          '<h2 class="sorter__joy">' + esc(t.label) + '</h2>' +
          '<p class="lede">' + esc(t.blurb) + '</p>' +
          '<h3 class="sorter__h">Rides made for you</h3>' +
          '<ul class="sorter__rides">' + rides.map(function(r){ return '<li><strong>' + esc(r.name) + '</strong><span>' + esc(r.when) + ' · ' + esc(r.where) + '</span></li>'; }).join("") + '</ul>' +
          (recipes.length ? '<p class="sorter__recipes">Try it at home: ' + recipes.map(function(r){ return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>'; }).join(", ") + ', from the Cookbook for Connection.</p>' : '') +
          '<p class="sorter__again"><button type="button" class="linkish" id="again">Take it again</button></p>' +
        '</div>' +
        '<div class="sorter__ticketbox">' +
          '<label class="field" for="t-name"><span>Name on your ticket</span><input class="input" id="t-name" maxlength="22" autocomplete="given-name" placeholder="Your first name"></label>' +
          '<canvas id="ticket" width="1080" height="1350" role="img" aria-label="Your JoyCon ticket: ' + esc(t.label) + '"></canvas>' +
          '<div class="sorter__actions"><button type="button" class="btn btn--gold" id="share">Share your ticket</button><button type="button" class="btn btn--ghost" id="dl">Download</button></div>' +
          '<p class="sorter__hint">Post it to your story and tag a friend who needs this joy too.</p>' +
          '<div class="sorter__cta">' + J.ctaHTML("btn--big") + '</div>' +
        '</div>' +
      '</div>';

    var cv = document.getElementById("ticket"), name = document.getElementById("t-name");
    function redraw(){ draw(cv, t, name.value.trim(), no); }
    var fonts = document.fonts ? Promise.all(["150px 'Patrick Hand SC'", "100px 'Patrick Hand'", "40px 'Patrick Hand SC'"].map(function(f){ return document.fonts.load(f); })).catch(function(){}) : Promise.resolve();
    redraw(); fonts.then(redraw);
    name.addEventListener("input", redraw);
    document.getElementById("again").addEventListener("click", function(){ picks = []; step = 0; ask(); root.scrollIntoView({ behavior: "smooth", block: "start" }); });
    document.getElementById("dl").addEventListener("click", function(){ save(cv, false); });
    document.getElementById("share").addEventListener("click", function(){ save(cv, true); });
    if (window.JOY.confetti) window.JOY.confetti();
    root.querySelector(".sorter__joy").setAttribute("tabindex", "-1");
    root.querySelector(".sorter__joy").focus({ preventScroll: true });
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function save(cv, share){
    cv.toBlob(function(blob){
      var file = new File([blob], "joycon-ticket.png", { type: "image/png" });
      if (share && navigator.canShare && navigator.canShare({ files: [file] })){
        navigator.share({ files: [file], title: "My JoyCon ticket", text: "Found my joy. JoyCon, Jan 16 to 17, San Francisco." }).catch(function(){});
        return;
      }
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "joycon-ticket.png";
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }, "image/png");
  }

  /* ---------- the ticket ---------- */
  function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function balloon(c, x, y, r, col){
    c.strokeStyle = "rgba(52,48,44,.55)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + r * 1.2); c.quadraticCurveTo(x - 12, y + r * 2.4, x + 4, y + r * 3.6); c.stroke();
    c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.ellipse(x, y, r, r * 1.18, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,248,232,.5)"; c.beginPath(); c.ellipse(x - r * .38, y - r * .45, r * .17, r * .3, -.5, 0, 7); c.fill();
  }
  function wrap(c, text, x, y, maxW, lh){
    var words = text.split(" "), line = "";
    words.forEach(function(w){ var t = line ? line + " " + w : w; if (c.measureText(t).width > maxW && line){ c.fillText(line, x, y); line = w; y += lh; } else line = t; });
    if (line) c.fillText(line, x, y);
  }
  function draw(cv, t, name, no){
    var c = cv.getContext("2d"), W = 1080, H = 1350;
    var bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#d4ab74"); bg.addColorStop(.55, "#e6c896"); bg.addColorStop(1, "#4f8582");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(248,231,184,.55)"; c.beginPath(); c.arc(870, 170, 90, 0, 7); c.fill();
    balloon(c, 120, 170, 46, "#c98a7e"); balloon(c, 210, 110, 34, "#8fa877"); balloon(c, 960, 360, 40, "#6f93b0");
    /* hills */
    c.fillStyle = "#a3b47f"; c.strokeStyle = INK; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, 1180); c.quadraticCurveTo(300, 1090, 560, 1150); c.quadraticCurveTo(820, 1210, 1080, 1120); c.lineTo(1080, 1350); c.lineTo(0, 1350); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#7f9a62"; c.beginPath(); c.moveTo(0, 1270); c.quadraticCurveTo(360, 1210, 700, 1260); c.quadraticCurveTo(900, 1290, 1080, 1250); c.lineTo(1080, 1350); c.lineTo(0, 1350); c.closePath(); c.fill(); c.stroke();

    /* ticket body */
    var x = 110, y = 190, w = 860, h = 1000, stubY = y + 650;
    function sp(px){ try { c.letterSpacing = px + "px"; } catch (e) {} }
    c.save(); c.translate(540, 690); c.rotate(-.03); c.translate(-540, -690);
    c.fillStyle = "rgba(52,48,44,.25)"; rr(c, x + 6, y + 22, w, h, 40); c.fill();
    c.fillStyle = "#faf1df"; rr(c, x, y, w, h, 40); c.fill();
    c.save(); rr(c, x, y, w, h, 40); c.clip(); c.fillStyle = t.color; c.fillRect(x, stubY, w, h); c.restore();
    c.strokeStyle = INK; c.lineWidth = 5; rr(c, x, y, w, h, 40); c.stroke();
    c.setLineDash([14, 14]); c.lineWidth = 4; c.beginPath(); c.moveTo(x + 40, stubY); c.lineTo(x + w - 40, stubY); c.stroke(); c.setLineDash([]);
    [[x, stubY], [x + w, stubY]].forEach(function(p){ c.fillStyle = "#e3c58f"; c.beginPath(); c.arc(p[0], p[1], 28, 0, 7); c.fill(); c.lineWidth = 5; c.stroke(); });
    c.strokeStyle = "rgba(196,98,63,.35)"; c.lineWidth = 3; rr(c, x + 28, y + 28, w - 56, stubY - y - 56, 24); c.stroke();

    c.textAlign = "center"; c.fillStyle = INK;
    sp(8); c.font = "30px 'Patrick Hand SC', cursive"; c.fillText("ADMIT ONE · NO. " + no, 540, y + 92); sp(0);
    c.font = "150px 'Patrick Hand SC', cursive"; sp(3);
    c.fillStyle = INK; c.fillText("JoyCon", 540, y + 262); sp(0);
    c.fillStyle = INK; c.font = "42px 'Patrick Hand SC', cursive"; c.fillText("a theme park for connection", 540, y + 340);
    c.font = (name.length > 14 ? 76 : 100) + "px 'Patrick Hand', cursive"; c.fillText(name || "You", 540, y + 470);
    c.fillStyle = "#5e5850"; sp(5); c.font = "30px 'Patrick Hand SC', cursive"; c.fillText("JAN 16 TO 17, 2027 · SAN FRANCISCO", 540, y + 548);
    c.fillText("RIDES ALL WEEKEND", 540, y + 590); sp(0);
    /* stub */
    c.fillStyle = INK; sp(8); c.font = "30px 'Patrick Hand SC', cursive"; c.fillText("MY JOY", 540, stubY + 76); sp(0);
    c.font = "124px 'Patrick Hand SC', cursive"; c.fillText(t.label, 540, stubY + 196);
    c.font = "38px 'Patrick Hand SC', cursive"; wrap(c, t.blurb, 540, stubY + 260, 680, 44);
    c.restore();
    c.textAlign = "center"; c.fillStyle = "#faf1df"; sp(8); c.font = "30px 'Patrick Hand SC', cursive"; c.fillText("FIND YOURS AT JOYCON", 540, 1316); sp(0);
  }

  root.addEventListener("click", function(e){
    var a = e.target.closest(".sorter__a");
    if (a){ picks[step] = Q[step].a[+a.getAttribute("data-i")][1]; a.classList.add("is-picked"); step++; setTimeout(function(){ step < Q.length ? ask() : result(); }, 220); return; }
    if (e.target.closest(".sorter__back")){ step = Math.max(0, step - 1); picks.length = step; ask(); }
  });
  root.addEventListener("keydown", function(e){
    if (step >= Q.length || !root.querySelector(".sorter__answers")) return;
    var k = "abc".indexOf(e.key.toLowerCase()); var btn = root.querySelectorAll(".sorter__a")[k];
    if (btn && !/input|textarea/i.test(e.target.tagName)) btn.click();
  });
  ask();
})();
