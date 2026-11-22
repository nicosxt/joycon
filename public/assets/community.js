/* Community Schedule: public list of approved rides + the "Add your ride" form. */
(function(){
  "use strict";
  var J = window.JOY, S = J.site, U = J.util, esc = U.esc, $ = U.$, $all = U.$all;
  var LINK_RE = /^https:\/\/(www\.)?(luma\.com|lu\.ma|partiful\.com)\/\S+$/i;

  /* times are stored as "HH:MM" 24h on Sunday Jan 17 */
  function fmt(t){
    var p = String(t).split(":"), h = +p[0], m = p[1] || "00";
    return (h % 12 || 12) + ":" + m + " " + (h < 12 ? "AM" : "PM");
  }
  function mins(t){ var p = String(t).split(":"); return (+p[0]) * 60 + (+p[1] || 0); }
  var SLOTS = []; for (var m = 8 * 60; m <= 14 * 60; m += 15){ SLOTS.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0")); }

  function opts(sel, list, first){
    sel.innerHTML = (first ? '<option value="">' + esc(first) + '</option>' : "") + list.map(function(o){ return '<option value="' + esc(o.v) + '">' + esc(o.l) + '</option>'; }).join("");
  }

  /* ---------- public list ---------- */
  var all = [], els = {};
  function host(link){ return /partiful/i.test(link) ? "Partiful" : "Luma"; }

  function card(r){
    var t = U.joyType(r.joyType);
    var where = r.spot ? esc(r.spot) : "Spot revealed on RSVP";
    var maps = r.spot && !/reveal/i.test(r.spot) ? ' <a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r.spot + ", " + r.neighborhood + ", San Francisco") + '" target="_blank" rel="noopener">map</a>' : "";
    return '<li class="ticket ticket--left ride-card reveal">' +
      '<div class="ticket__stub" style="--stub:' + esc(t.color) + '"><span class="ticket__time">' + fmt(r.start) + '</span><span>to</span><span class="ticket__time">' + fmt(r.end) + '</span></div>' +
      '<div class="ticket__main"><div>' +
        '<h3 class="ticket__title">' + esc(r.name) + '</h3><p class="host">Hosted by ' + esc(r.host) + '</p>' +
        '<p class="ticket__desc">' + esc(r.description) + '</p>' +
        '<div class="ticket__meta"><span class="pin">' + esc(r.neighborhood) + ' · ' + where + maps + '</span>' + U.tagHTML(r.joyType) +
          (r.capacity ? '<span>Up to ' + esc(r.capacity) + ' people</span>' : "") + '</div>' +
        '<div class="ride-actions"><a class="btn" href="' + esc(r.link) + '" target="_blank" rel="noopener">Sign up<span class="sr-only"> for ' + esc(r.name) + ' on ' + host(r.link) + ' (opens in a new tab)</span></a><span class="muted" aria-hidden="true" style="font-size:.85rem">on ' + host(r.link) + '</span></div>' +
      '</div>' +
      (r.imageUrl ? '<img class="ride-img" src="' + esc(r.imageUrl) + '" alt="" loading="lazy">' : "") +
      '</div></li>';
  }

  var EMPTY = '<div class="empty"><img class="ferris" src="assets/img/ferris-wheel.webp" alt="" width="160" height="183" style="margin:0 auto 12px">' +
    '<h3>The park is still being built.</h3><p class="lede" style="margin:0 auto 22px">No rides yet. Somebody has to be first.</p><a class="btn btn--big" href="#add">Add the first ride</a></div>';

  function render(){
    var box = $("#rides");
    if (!all.length){ box.innerHTML = EMPTY; els.count.textContent = ""; els.clear.hidden = true; return; }
    var q = els.q.value.trim().toLowerCase(), tm = els.time.value, hood = els.hood.value, joy = els.joy.value;
    var list = all.filter(function(r){
      if (tm === "morning" && mins(r.start) >= 720) return false;
      if (tm === "afternoon" && mins(r.end) <= 720) return false;
      if (hood && r.neighborhood !== hood) return false;
      if (joy && r.joyType !== joy) return false;
      if (q && [r.name, r.host, r.description, r.neighborhood, r.spot, U.joyType(r.joyType).label].join(" ").toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var filtered = q || tm || hood || joy;
    els.clear.hidden = !filtered;
    els.count.textContent = filtered ? "Showing " + list.length + " of " + all.length + " rides" : all.length + (all.length === 1 ? " ride" : " rides") + " on Sunday";
    if (!list.length){ box.innerHTML = '<div class="empty"><h3>No rides match that.</h3><p class="muted">Try another neighborhood or a different kind of joy.</p></div>'; return; }
    var html = "", lastHour = null;
    list.forEach(function(r){
      var h = Math.floor(mins(r.start) / 60);
      if (h !== lastHour){ if (lastHour !== null) html += "</ol>"; html += '<h3 class="hour">' + fmt(h + ":00") + '</h3><ol class="sched">'; lastHour = h; }
      html += card(r);
    });
    box.innerHTML = html + "</ol>";
    J.reveal();
  }

  function load(){
    var box = $("#rides");
    if (!S.apiUrl){ all = []; render(); return; }
    box.innerHTML = '<p class="muted">Loading rides...</p>';
    J.apiGet({ action: "rides" }).then(function(d){
      all = (d && d.rides || []).sort(function(a, b){ return mins(a.start) - mins(b.start) || mins(a.end) - mins(b.end); });
      var hoods = all.map(function(r){ return r.neighborhood; }).filter(function(v, i, a){ return v && a.indexOf(v) === i; }).sort();
      opts(els.hood, hoods.map(function(h){ return { v: h, l: h }; }), "Anywhere");
      render();
    }).catch(function(){ box.innerHTML = '<div class="empty"><h3>We couldn’t load the schedule.</h3><p class="muted">Give it a refresh in a minute.</p></div>'; });
  }

  /* ---------- form ---------- */
  var imageData = "";
  function setErr(id, msg){
    var el = $("#" + id), err = $("#" + id + "-err");
    if (el) el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
    return !msg;
  }
  function validate(f){
    var ok = true, first = null;
    function check(id, msg){ var good = setErr(id, msg); if (!good && !first) first = id; ok = ok && good; }
    check("r-name", f.name.value.trim() ? "" : "Give your ride a name.");
    check("r-host", f.host.value.trim() ? "" : "Who's hosting?");
    var s = f.start.value, e = f.end.value;
    check("r-start", s ? "" : "Pick a start time.");
    check("r-end", !e ? "Pick an end time." : (s && mins(e) <= mins(s) ? "End time needs to be after the start." : ""));
    check("r-hood", f.neighborhood.value ? "" : "Pick a neighborhood.");
    check("r-joy", f.joyType.value ? "" : "Pick the kind of joy.");
    var d = f.description.value.trim();
    check("r-desc", !d ? "Tell people what they're in for." : (d.length > 280 ? "Keep it to 280 characters." : ""));
    check("r-link", LINK_RE.test(f.link.value.trim()) ? "" : "Use a luma.com, lu.ma, or partiful.com link.");
    check("r-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()) ? "" : "We need an email in case we have a question.");
    if (first) $("#" + first).focus();
    return ok;
  }

  function shrink(file){
    return new Promise(function(res, rej){
      if (!file) return res("");
      if (!/^image\//.test(file.type)) return rej(new Error("That file isn't an image."));
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function(){
        var max = 1000, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        res(c.toDataURL("image/jpeg", .82));
      };
      img.onerror = function(){ rej(new Error("We couldn't read that image.")); };
      img.src = url;
    });
  }

  function initForm(){
    var f = $("#ride-form"); if (!f) return;
    if (!S.apiUrl) $("#api-notice").hidden = false;
    opts(f.start, SLOTS.slice(0, -1).map(function(t){ return { v: t, l: fmt(t) }; }), "Start time");
    opts(f.end, SLOTS.slice(1).map(function(t){ return { v: t, l: fmt(t) }; }), "End time");
    opts(f.neighborhood, (J.neighborhoods || []).map(function(n){ return { v: n, l: n }; }), "Pick one");
    opts(f.joyType, (J.joyTypes || []).map(function(t){ return { v: t.id, l: t.label + ". " + t.blurb }; }), "Pick one");

    f.start.addEventListener("change", function(){
      if (f.end.value && mins(f.end.value) <= mins(f.start.value)){
        var next = SLOTS[SLOTS.indexOf(f.start.value) + 4] || "14:00"; f.end.value = next;
      }
    });
    var cnt = $("#r-desc-count");
    f.description.addEventListener("input", function(){
      var n = f.description.value.length; cnt.textContent = n + " / 280"; cnt.classList.toggle("over", n > 260);
    });
    f.image.addEventListener("change", function(){
      var file = f.image.files[0], prev = $("#r-img-preview");
      shrink(file).then(function(d){ imageData = d; prev.hidden = !d; if (d){ prev.src = d; prev.alt = "Preview of your image"; } })
        .catch(function(err){ imageData = ""; prev.hidden = true; f.image.value = ""; $("#ride-status").textContent = err.message; });
    });

    f.addEventListener("submit", function(e){
      e.preventDefault();
      var st = $("#ride-status"); st.textContent = ""; st.className = "form-status";
      if (f["bot-field"].value) return;
      if (!validate(f)){ st.className = "form-status bad"; st.textContent = "A few things need a look before this ride can launch."; return; }
      if (!S.apiUrl){ st.className = "form-status bad"; st.textContent = "Submissions aren't connected yet. Please try again soon."; return; }
      var data = {
        name: f.name.value.trim(), host: f.host.value.trim(), start: f.start.value, end: f.end.value,
        neighborhood: f.neighborhood.value, spot: f.spot.value.trim(), description: f.description.value.trim(),
        joyType: f.joyType.value, capacity: f.capacity.value, link: f.link.value.trim(), email: f.email.value.trim()
      };
      var btn = $("button[type=submit]", f); btn.disabled = true; btn.textContent = "Launching...";
      J.netlify("ride-submission", data).catch(function(){});   /* backup copy, best effort */
      J.api(Object.assign({ action: "submitRide", image: imageData }, data)).then(function(){
        $("#ride-panel").innerHTML =
          '<div class="done" tabindex="-1" id="ride-done"><p class="done__ticket">Ride received · ' + esc(fmt(data.start)) + '</p>' +
          '<h2>' + esc(data.name) + ' is in the queue.</h2>' +
          '<p class="lede" style="margin:0 auto 24px">We’ll review it and it’ll appear on the schedule soon.</p>' +
          '<a class="btn btn--ghost" href="community.html#add" onclick="location.reload()">Add another ride</a></div>';
        $("#ride-done").focus(); J.confetti();
      }).catch(function(err){
        btn.disabled = false; btn.textContent = "Add my ride";
        st.className = "form-status bad"; st.textContent = (err && err.message && err.message !== "Failed to fetch") ? err.message : "That didn't go through. Try again in a minute.";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    els = { q: $("#f-q"), time: $("#f-time"), hood: $("#f-hood"), joy: $("#f-joy"), count: $("#results-count"), clear: $("#f-clear") };
    opts(els.joy, (J.joyTypes || []).map(function(t){ return { v: t.id, l: t.label }; }), "Any joy");
    ["input", "change"].forEach(function(ev){ $("#filters").addEventListener(ev, render); });
    els.clear.addEventListener("click", function(){ els.q.value = els.time.value = els.hood.value = els.joy.value = ""; render(); els.q.focus(); });
    initForm(); load();
  });
})();
