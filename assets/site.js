(function () {
  "use strict";

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Footer year
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // Inquiry form
  var form = document.getElementById("inquiry");
  if (!form) return;

  var errorBox = document.getElementById("form-error");
  var done = document.getElementById("form-done");
  var submitBtn = form.querySelector('button[type="submit"]');
  form.elements.started.value = String(Date.now());

  // Preselect event type from ?event=Wedding
  var params = new URLSearchParams(window.location.search);
  var preset = params.get("event");
  if (preset) {
    var radio = form.querySelector('input[name="event"][value="' + preset.replace(/"/g, "") + '"]');
    if (radio) radio.checked = true;
  }

  // Dates in the past are not bookable
  var dateInput = form.elements.date;
  var today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function collect() {
    var data = {};
    ["name", "contact", "date", "venue", "count", "budget", "inspiration", "notes", "source", "company", "started"].forEach(function (key) {
      data[key] = (form.elements[key].value || "").trim();
    });
    var ev = form.querySelector('input[name="event"]:checked');
    data.event = ev ? ev.value : "";
    data.needs = Array.prototype.map.call(form.querySelectorAll('input[name="needs"]:checked'), function (c) { return c.value; });
    return data;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    var data = collect();

    var missing = [];
    [["name", "your name"], ["contact", "an email or phone number"], ["date", "the date"], ["venue", "the town or venue"]].forEach(function (pair) {
      var el = form.elements[pair[0]];
      var bad = !data[pair[0]];
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) missing.push(pair[1]);
    });
    if (!data.event) missing.splice(2, 0, "the event type");

    if (missing.length) {
      showError("Please add " + missing.join(", ").replace(/, ([^,]*)$/, " and $1") + ".");
      var firstBad = form.querySelector('[aria-invalid="true"]') || form.querySelector('input[name="event"]');
      if (firstBad) firstBad.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; });
      })
      .then(function (result) {
        if (!result.ok) throw new Error(result.body && result.body.error ? result.body.error : "send_failed");
        var first = data.name.split(/\s+/)[0] || "friend";
        done.querySelector("[data-first-name]").textContent = first;
        form.hidden = true;
        done.hidden = false;
        done.focus();
      })
      .catch(function () {
        showError("That didn't go through. Please message me on Instagram at @thelittleflowersblooms and I'll get right back to you.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send inquiry";
      });
  });
})();
