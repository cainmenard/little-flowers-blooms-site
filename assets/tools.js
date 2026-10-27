/* The Little Flower's Blooms: interactive tools
   - Flower meanings finder (/flowers)       #meanings
   - Wedding party counter (/plan)           #planner
   - Palette from a photo (/plan)            #palette
   - In season in Acadiana (/seasons)        #seasons
   Each tool only runs when its section is on the page. No prices anywhere:
   quotes go out in writing. Sources for the data are listed in README.md. */
(function () {
  "use strict";

  var frenchify = (window.LFB && window.LFB.frenchify) || function () {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // A flower name the shared script turns into a tap-for-French button
  function fl(f) { return '<span data-fr="' + esc(f.fr) + '">' + esc(f.en) + "</span>"; }
  function listText(items) {
    if (items.length < 2) return items.join("");
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  // Browser storage is a convenience only; every read and write can fail.
  var store = {
    get: function (key) { try { return JSON.parse(window.localStorage.getItem(key)); } catch (e) { return null; } },
    set: function (key, value) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }
  };

  /* ------------------------------------------------------------------ */
  /* Flowers                                                             */
  /* ------------------------------------------------------------------ */
  var F = {
    roses: { en: "Roses", fr: "roses" },
    sprayRoses: { en: "Spray roses", fr: "roses branchues" },
    gardenRoses: { en: "Garden roses", fr: "roses de jardin" },
    carnations: { en: "Carnations", fr: "œillets" },
    lisianthus: { en: "Lisianthus", fr: "lisianthus" },
    babysBreath: { en: "Baby's breath", fr: "gypsophile" },
    ranunculus: { en: "Ranunculus", fr: "renoncules" },
    peonies: { en: "Peonies", fr: "pivoines" },
    stock: { en: "Stock", fr: "giroflées" },
    hydrangeas: { en: "Hydrangeas", fr: "hortensias" },
    sweetPeas: { en: "Sweet peas", fr: "pois de senteur" },
    snapdragons: { en: "Snapdragons", fr: "mufliers" },
    zinnias: { en: "Zinnias", fr: "zinnias" },
    sunflowers: { en: "Sunflowers", fr: "tournesols" },
    daffodils: { en: "Daffodils", fr: "jonquilles" },
    tulips: { en: "Tulips", fr: "tulipes" },
    mums: { en: "Chrysanthemums", fr: "chrysanthèmes" },
    delphinium: { en: "Delphinium", fr: "delphiniums" },
    larkspur: { en: "Larkspur", fr: "pieds-d'alouette" },
    irises: { en: "Louisiana irises", fr: "iris de Louisiane" },
    anemones: { en: "Anemones", fr: "anémones" },
    eryngo: { en: "Blue thistle", fr: "panicaut" },
    eucalyptus: { en: "Eucalyptus", fr: "eucalyptus" },
    magnoliaLeaves: { en: "Magnolia leaves", fr: "feuilles de magnolia" },
    ivy: { en: "Ivy", fr: "lierre" },
    dustyMiller: { en: "Dusty miller", fr: "cinéraire maritime" },
    gardenias: { en: "Gardenias", fr: "gardénias" },
    camellias: { en: "Camellias", fr: "camélias" },
    dahlias: { en: "Dahlias", fr: "dahlias" },
    callas: { en: "Calla lilies", fr: "callas" },
    magnolias: { en: "Magnolias", fr: "magnolias" },
    poppies: { en: "Poppies", fr: "pavots" },
    hyacinths: { en: "Hyacinths", fr: "jacinthes" }
  };

  /* ------------------------------------------------------------------ */
  /* Seasons (Lafayette is in USDA zone 9; Baton Rouge data is close)    */
  /* garden: LSU AgCenter and LSU Botanic Gardens bloom times            */
  /* growers: FiftyFlowers wholesale availability chart                  */
  /* ------------------------------------------------------------------ */
  var MONTHS = [
    { name: "January", short: "Jan", garden: ["camellias"], growers: ["anemones", "daffodils", "hyacinths", "tulips", "ranunculus"] },
    { name: "February", short: "Feb", garden: ["camellias", "tulips"], growers: ["anemones", "daffodils", "hyacinths", "tulips", "ranunculus", "peonies"],
      note: "Valentine's Day is February 14. Book early for anything that week." },
    { name: "March", short: "Mar", garden: ["camellias", "daffodils", "irises", "tulips", "snapdragons", "stock", "sweetPeas", "larkspur", "poppies"],
      growers: ["anemones", "daffodils", "hyacinths", "tulips", "ranunculus", "peonies"],
      note: "Cool-season flowers start their big show in March and peak in April." },
    { name: "April", short: "Apr", garden: ["irises", "roses", "magnolias", "daffodils", "sweetPeas", "larkspur", "poppies", "snapdragons", "stock", "delphinium"],
      growers: ["peonies", "ranunculus", "anemones", "tulips", "hyacinths"],
      note: "April is Louisiana iris month, and spring is the best time of year for peonies." },
    { name: "May", short: "May", garden: ["magnolias", "gardenias", "roses", "sweetPeas", "larkspur", "delphinium"],
      growers: ["peonies", "ranunculus", "anemones", "tulips", "hyacinths"],
      note: "Magnolias peak and gardenias open. Mother's Day and graduation week fill up first." },
    { name: "June", short: "Jun", garden: ["roses", "sunflowers", "zinnias"], growers: ["peonies", "ranunculus", "hyacinths"],
      note: "Summer heat shortens vase life outdoors. For an outdoor ceremony, ask about sturdier picks." },
    { name: "July", short: "Jul", garden: ["sunflowers", "zinnias"], growers: ["peonies", "ranunculus", "hyacinths"],
      note: "The last month for peonies until fall." },
    { name: "August", short: "Aug", garden: ["sunflowers", "zinnias", "roses"], growers: ["ranunculus", "hyacinths"] },
    { name: "September", short: "Sep", garden: ["sunflowers", "zinnias", "roses", "mums"], growers: ["peonies"],
      note: "Zinnias put on their best show in September and October." },
    { name: "October", short: "Oct", garden: ["zinnias", "sunflowers", "roses", "mums", "camellias"], growers: ["anemones", "peonies", "ranunculus"],
      note: "Sasanqua camellias start blooming in mid-October." },
    { name: "November", short: "Nov", garden: ["roses", "mums", "camellias"], growers: ["anemones", "peonies", "ranunculus"] },
    { name: "December", short: "Dec", garden: ["camellias"], growers: ["anemones", "peonies", "ranunculus"],
      note: "December graduation week books up early." }
  ];
  var YEAR_ROUND = ["roses", "sprayRoses", "gardenRoses", "carnations", "lisianthus", "babysBreath", "hydrangeas", "eucalyptus"];

  function mothersDay(year) {
    var d = new Date(year, 4, 1);
    var firstSunday = 1 + ((7 - d.getDay()) % 7);
    return new Date(year, 4, firstSunday + 7);
  }
  // Roses and other red, pink and white flowers cost more and sell out in the
  // two weeks around these days (see the pricing guide's seasonality notes).
  function holidayNote(date) {
    var y = date.getFullYear();
    var days = [
      { name: "Valentine's Day", date: new Date(y, 1, 14) },
      { name: "Mother's Day", date: mothersDay(y) }
    ];
    for (var i = 0; i < days.length; i++) {
      var diff = Math.round((date - days[i].date) / 86400000);
      if (Math.abs(diff) <= 14) {
        return "That's within two weeks of " + days[i].name + ". Roses and other red, pink and white flowers cost more then and sell out early, so send your date soon.";
      }
    }
    return "";
  }
  function parseDate(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }
  // Flower names inside a sentence: lowercase, except proper names and the first word when asked
  function inline(f, cap) {
    var en = cap || /^Louisiana/.test(f.en) ? f.en : f.en.charAt(0).toLowerCase() + f.en.slice(1);
    return fl({ en: en, fr: f.fr });
  }
  function flowerList(ids, capFirst) { return listText(ids.map(function (id, i) { return inline(F[id], capFirst && i === 0); })); }
  function seasonSummary(monthIndex) {
    var m = MONTHS[monthIndex];
    return "<p><strong>In Louisiana gardens:</strong> " + flowerList(m.garden) + ".</p>" +
      "<p><strong>Best from growers:</strong> " + flowerList(m.growers) + ".</p>";
  }

  /* ------------------------------------------------------------------ */
  /* 1. Flower meanings finder                                           */
  /* Every meaning is quoted from Kate Greenaway's Language of Flowers   */
  /* (London, 1884), the best-known Victorian flower dictionary.         */
  /* ------------------------------------------------------------------ */
  var M = {
    rose: { en: "Red roses", fr: "roses rouges", entry: "Rose", says: "Love.", color: "#9B2D30" },
    redTulip: { en: "Red tulips", fr: "tulipes rouges", entry: "Tulip, Red", says: "Declaration of love.", color: "#B3343A" },
    forgetMeNot: { en: "Forget-me-nots", fr: "myosotis", entry: "Forget Me Not", says: "True love. Forget me not.", color: "#7C9CC9" },
    myrtle: { en: "Myrtle", fr: "myrte", entry: "Myrtle", says: "Love.", color: "#6E8366" },
    pinkCarnation: { en: "Pink carnations", fr: "œillets roses", entry: "Pink, Carnation", says: "Woman's love.", color: "#E3A6B4" },
    honeysuckle: { en: "Honeysuckle", fr: "chèvrefeuille", entry: "Honeysuckle", says: "Generous and devoted affection.", color: "#EAD49A" },
    heliotrope: { en: "Heliotrope", fr: "héliotrope", entry: "Heliotrope", says: "Devotion. Faithfulness.", color: "#8E79B5" },
    daisy: { en: "Garden daisies", fr: "marguerites", entry: "Daisy, Garden", says: "I share your sentiments.", color: "#F4F1E6" },
    jasmine: { en: "Jasmine", fr: "jasmin", entry: "Jasmine", says: "Amiability.", color: "#F6F3EA" },
    daffodil: { en: "Daffodils", fr: "jonquilles", entry: "Daffodil", says: "Regard.", color: "#EBC94F" },
    redCamellia: { en: "Red camellias", fr: "camélias rouges", entry: "Camellia Japonica, Red", says: "Unpretending excellence.", color: "#A8323A" },
    sweetPea: { en: "Sweet peas", fr: "pois de senteur", entry: "Sweet Pea", says: "Delicate pleasures.", color: "#D9A3C6" },
    sage: { en: "Garden sage", fr: "sauge", entry: "Sage, Garden", says: "Esteem.", color: "#9AA88F" },
    tulip: { en: "Tulips", fr: "tulipes", entry: "Tulip", says: "Fame.", color: "#E07A7A" },
    laurel: { en: "Bay laurel", fr: "laurier", entry: "Laurel", says: "Glory.", color: "#56704F" },
    oak: { en: "Oak leaves", fr: "feuilles de chêne", entry: "Oak Leaves", says: "Bravery.", color: "#7D8A4E" },
    basil: { en: "Sweet basil", fr: "basilic", entry: "Sweet Basil", says: "Good wishes.", color: "#5F8C4E",
      aside: "Careful: plain “Basil” in the same book means hatred." },
    ivy: { en: "Ivy", fr: "lierre", entry: "Ivy", says: "Fidelity. Marriage.", color: "#4F6A47" },
    gardenia: { en: "Gardenias", fr: "gardénias", entry: "Jasmine, Cape (the gardenia)", says: "Transport of joy.", color: "#F5F1E4" },
    redWhiteRoses: { en: "Red and white roses", fr: "roses rouges et blanches", entry: "Rose, White and Red together", says: "Unity.", color: "#C9545A",
      aside: "The meaning only works with both colors in the same bouquet." },
    zinnia: { en: "Zinnias", fr: "zinnias", entry: "Zinnia", says: "Thoughts of absent friends.", color: "#E2725B" },
    pansy: { en: "Pansies", fr: "pensées", entry: "Pansy", says: "Thoughts.", color: "#6E5AA0",
      aside: "The English name comes from the French pensée: a thought." },
    rosemary: { en: "Rosemary", fr: "romarin", entry: "Rosemary", says: "Remembrance.", color: "#7E9584" },
    chamomile: { en: "Chamomile", fr: "camomille", entry: "Camomile", says: "Energy in adversity.", color: "#F2E6B8" },
    mum: { en: "Chrysanthemums", fr: "chrysanthèmes", entry: "Chinese Chrysanthemum", says: "Cheerfulness under adversity.", color: "#E9B949" },
    lilyValley: { en: "Lily of the valley", fr: "muguet", entry: "Lily of the Valley", says: "Return of happiness.", color: "#F3F4EA",
      aside: "In France, sprigs of muguet are given on May 1 for luck." },
    whiteLily: { en: "White lilies", fr: "lys blancs", entry: "Lily, White", says: "Purity. Sweetness.", color: "#F5F2EA" },
    poppy: { en: "Red poppies", fr: "coquelicots", entry: "Poppy, Red", says: "Consolation.", color: "#C8403A" },
    ranunculus: { en: "Ranunculus", fr: "renoncules", entry: "Ranunculus", says: "You are radiant with charms.", color: "#F0A88E" },
    stock: { en: "Stock", fr: "giroflées", entry: "Stock", says: "Lasting beauty.", color: "#D9B8D0" }
  };
  var MESSAGES = {
    love: { label: "I love you", picks: {
      _: ["rose", "redTulip", "forgetMeNot"], mom: ["pinkCarnation", "honeysuckle", "heliotrope"],
      friend: ["daisy", "jasmine", "forgetMeNot"], couple: ["redWhiteRoses", "myrtle", "ivy"], teacher: ["daisy", "jasmine", "daffodil"] } },
    thanks: { label: "Thank you", picks: {
      _: ["daffodil", "redCamellia", "sweetPea"], teacher: ["sage", "daffodil", "redCamellia"],
      mom: ["honeysuckle", "sweetPea", "daffodil"], partner: ["sweetPea", "rose", "daffodil"] } },
    congrats: { label: "Congratulations", picks: {
      _: ["tulip", "laurel", "basil"], grad: ["laurel", "tulip", "oak"], couple: ["redWhiteRoses", "gardenia", "ivy"] } },
    thinking: { label: "Thinking of you", picks: {
      _: ["zinnia", "pansy", "forgetMeNot"], partner: ["forgetMeNot", "pansy", "rose"] } },
    getwell: { label: "Get well soon", picks: { _: ["mum", "lilyValley", "chamomile"] } },
    sympathy: { label: "With sympathy", picks: { _: ["rosemary", "whiteLily", "poppy"] } },
    birthday: { label: "Happy birthday", picks: {
      _: ["ranunculus", "stock", "basil"], friend: ["daisy", "ranunculus", "basil"],
      mom: ["stock", "pinkCarnation", "ranunculus"], partner: ["ranunculus", "rose", "stock"] } }
  };
  var RECIPIENTS = { partner: "my partner", mom: "my mom or grandmother", friend: "a friend", grad: "a graduate", teacher: "a teacher or coworker", couple: "a couple" };

  var meanings = $("#meanings");
  if (meanings) {
    var mForm = $("#meanings-form", meanings);
    var mOut = $("#meanings-result", meanings);
    var renderMeanings = function () {
      var msgKey = (mForm.querySelector('input[name="say"]:checked') || {}).value || "love";
      var toKey = (mForm.querySelector('input[name="to"]:checked') || {}).value || "partner";
      var msg = MESSAGES[msgKey];
      var ids = msg.picks[toKey] || msg.picks._;
      var cards = ids.map(function (id, i) {
        var f = M[id];
        return '<article class="mean-card" style="--d:' + (i * 90) + 'ms">' +
          '<span class="mean-dot" style="background:' + f.color + '" aria-hidden="true"></span>' +
          '<h4>' + fl(f) + "</h4>" +
          '<p class="mean-says">“' + esc(f.says) + "”</p>" +
          '<p class="mean-src">Greenaway, 1884: ' + esc(f.entry) + "</p>" +
          (f.aside ? '<p class="mean-aside">' + esc(f.aside) + "</p>" : "") +
          "</article>";
      }).join("");
      var names = ids.map(function (id) { return M[id].en.toLowerCase(); });
      var event = toKey === "grad" ? "Graduation" : (msgKey === "sympathy" ? "Other" : "Birthday or gift");
      var note = "From the flower meanings finder: I want to say “" + msg.label + "” to " + RECIPIENTS[toKey] + ". " +
        "Suggested: " + ids.map(function (id) { return M[id].en.toLowerCase() + " (" + M[id].says.replace(/\.$/, "") + ")"; }).join(", ") + ".";
      var href = "/inquire?event=" + encodeURIComponent(event) + "&needs=Bouquets&notes=" + encodeURIComponent(note);
      mOut.innerHTML =
        '<div class="mean-cards">' + cards + "</div>" +
        '<div class="mean-foot">' +
          '<p class="mean-sum">A wrapped bouquet of ' + esc(listText(names)) + " says “" + esc(msg.label) + "” in the old language of flowers. If one is out of season that week, I'll swap in a flower with a similar meaning.</p>" +
          '<a class="btn" href="' + esc(href) + '">Order this bouquet</a>' +
        "</div>";
      frenchify(mOut);
      if (!reduceMotion) {
        mOut.classList.remove("is-fresh");
        void mOut.offsetWidth;
        mOut.classList.add("is-fresh");
      }
    };
    mForm.addEventListener("change", renderMeanings);
    renderMeanings();
  }

  /* ------------------------------------------------------------------ */
  /* 2 and 3. Plan page: wedding party counter + palette from a photo    */
  /* ------------------------------------------------------------------ */
  var planner = $("#planner");
  var palette = $("#palette");
  var PLAN_KEY = "lfb-plan-v1";
  var plan = Object.assign({
    bridesmaids: 4, flowerGirls: 1, groomsmen: 5, otherBouts: 2, corsages: 4,
    toss: false, altar: "pair", delivery: "delivery", teardown: false, style: "Not sure yet", date: "", colors: []
  }, store.get(PLAN_KEY) || {});
  var LIMITS = { bridesmaids: 15, flowerGirls: 4, groomsmen: 16, otherBouts: 12, corsages: 12 };
  var DEFAULT_BLOOMS = ["#EBD5CD", "#F6F3EE", "#CBD2C3", "#E3B9AE", "#DDD5CC"];

  function pieces() {
    var list = [{ kind: "bouquet", big: true, n: 1, label: "bridal bouquet", many: "bridal bouquets" }];
    if (plan.toss) list.push({ kind: "bouquet", small: true, n: 1, label: "toss bouquet", many: "toss bouquets" });
    list.push({ kind: "bouquet", n: plan.bridesmaids, label: "bridesmaid bouquet", many: "bridesmaid bouquets" });
    list.push({ kind: "bouquet", small: true, n: plan.flowerGirls, label: "flower girl bouquet", many: "flower girl bouquets" });
    list.push({ kind: "bout", n: plan.groomsmen + plan.otherBouts, label: "boutonniere", many: "boutonnieres" });
    list.push({ kind: "corsage", n: plan.corsages, label: "corsage", many: "corsages" });
    if (plan.altar === "pair") list.push({ kind: "altar", n: 2, label: "altar arrangement", many: "altar arrangements" });
    if (plan.altar === "large") list.push({ kind: "altar", big: true, n: 1, label: "large altar arrangement", many: "large altar arrangements" });
    return list.filter(function (p) { return p.n > 0; });
  }
  function bloomColors() {
    var keep = (plan.colors || []).filter(function (c) { return c.keep !== false && c.family !== "neutral"; });
    return keep.length ? keep.map(function (c) { return c.hex; }) : DEFAULT_BLOOMS;
  }
  function savePlan() { store.set(PLAN_KEY, plan); }

  function planLines() {
    var lines = pieces().map(function (p) { return plural(p.n, p.label, p.many); });
    if (plan.delivery === "delivery") lines.push("Delivery, altar placement and help pinning boutonnieres");
    else lines.push("Pickup in Lafayette");
    if (plan.teardown) lines.push("Teardown and vessel pickup after the reception");
    return lines;
  }
  function needsFor() {
    var kinds = {};
    pieces().forEach(function (p) { kinds[p.kind] = true; });
    var needs = [];
    if (kinds.bouquet) needs.push("Bouquets");
    if (kinds.bout) needs.push("Boutonnieres");
    if (kinds.corsage) needs.push("Corsages");
    if (kinds.altar) needs.push("Altar or ceremony pieces");
    return needs;
  }
  function planHref() {
    var total = pieces().reduce(function (sum, p) { return sum + p.n; }, 0);
    var notes = "From the planner:\n- " + planLines().join("\n- ") + "\nStyle: " + plan.style;
    var colors = (plan.colors || []).filter(function (c) { return c.keep !== false; });
    if (colors.length) notes += "\nColors from my photo: " + colors.map(function (c) { return c.name + " (" + c.hex + ")"; }).join(", ");
    var q = "event=Wedding&count=" + encodeURIComponent(total + " pieces") + "&needs=" + encodeURIComponent(needsFor().join(",")) + "&notes=" + encodeURIComponent(notes);
    if (plan.date) q += "&date=" + encodeURIComponent(plan.date);
    return "/inquire?" + q;
  }

  // Little line drawings, one per piece, tinted with the chosen colors
  function iconSvg(p, color) {
    var cls = "pc pc--" + p.kind + (p.big ? " pc--big" : "") + (p.small ? " pc--small" : "");
    return '<svg class="' + cls + '" style="--bloom:' + color + '" viewBox="0 0 40 48" aria-hidden="true" focusable="false"><use href="#pc-' + p.kind + '"></use></svg>';
  }

  function renderPlanner() {
    if (!planner) return;
    var list = pieces();
    var total = list.reduce(function (sum, p) { return sum + p.n; }, 0);
    var colors = bloomColors();
    var k = 0;
    var field = list.map(function (p) {
      var out = "";
      for (var i = 0; i < p.n; i++) out += iconSvg(p, colors[k++ % colors.length]);
      return out;
    }).join("");
    $("#plan-field", planner).innerHTML = field;
    $("#plan-total", planner).textContent = String(total);
    $("#plan-total-word", planner).textContent = total === 1 ? "piece" : "pieces";
    $("#plan-lines", planner).innerHTML = planLines().map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
    $("#plan-style", planner).textContent = plan.style;
    var mini = $("#plan-mini-total", planner);
    if (mini) mini.textContent = String(total);
    var sendLinks = $all("[data-plan-send]");
    sendLinks.forEach(function (a) { a.href = planHref(); });

    var seasonBox = $("#plan-season", planner);
    var d = parseDate(plan.date);
    if (d) {
      var warn = holidayNote(d);
      seasonBox.innerHTML = '<span class="label">Around ' + esc(MONTHS[d.getMonth()].name) + "</span>" + seasonSummary(d.getMonth()) +
        (warn ? '<p class="plan-warn">' + esc(warn) + "</p>" : "") +
        '<p><a class="arrow-link" href="/seasons?month=' + (d.getMonth() + 1) + '">See the whole year</a></p>';
      seasonBox.hidden = false;
      frenchify(seasonBox);
    } else {
      seasonBox.hidden = true;
    }
  }

  if (planner) {
    // Fill the controls from the saved plan
    Object.keys(LIMITS).forEach(function (key) {
      var input = planner.querySelector('input[data-count="' + key + '"]');
      if (input) input.value = plan[key];
    });
    ["altar", "delivery", "style"].forEach(function (name) {
      var r = planner.querySelector('input[name="' + name + '"][value="' + String(plan[name]).replace(/"/g, "") + '"]');
      if (r) r.checked = true;
    });
    ["toss", "teardown"].forEach(function (name) {
      var c = planner.querySelector('input[name="' + name + '"]');
      if (c) c.checked = !!plan[name];
    });
    var dateInput = $("#plan-date", planner);
    var now = new Date();
    dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (plan.date && plan.date >= dateInput.min) dateInput.value = plan.date; else plan.date = "";

    var setCount = function (key, value) {
      var n = Math.max(0, Math.min(LIMITS[key], Math.round(Number(value) || 0)));
      plan[key] = n;
      var input = planner.querySelector('input[data-count="' + key + '"]');
      if (input && String(input.value) !== String(n)) input.value = n;
    };

    planner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-step]");
      if (!btn) return;
      var key = btn.getAttribute("data-step-key");
      setCount(key, plan[key] + Number(btn.getAttribute("data-step")));
      renderPlanner();
      savePlan();
    });
    planner.addEventListener("input", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-count")) {
        if (t.value === "") return;
        setCount(t.getAttribute("data-count"), t.value);
      } else if (t.type === "radio") {
        plan[t.name] = t.value;
      } else if (t.type === "checkbox") {
        plan[t.name] = t.checked;
      } else if (t.id === "plan-date") {
        plan.date = t.value;
      }
      renderPlanner();
      savePlan();
    });
    planner.addEventListener("change", function (e) {
      if (e.target.hasAttribute("data-count")) { setCount(e.target.getAttribute("data-count"), e.target.value); renderPlanner(); savePlan(); }
    });
    // On phones the summary sits below the controls, so a slim bar keeps the
    // running total in view while the controls are on screen.
    var miniBar = $("#plan-mini", planner);
    if (miniBar && "IntersectionObserver" in window) {
      var seen = { controls: false, summary: false };
      var sync = function () { miniBar.classList.toggle("is-on", seen.controls && !seen.summary); };
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen[en.target.id === "plan-summary" ? "summary" : "controls"] = en.isIntersecting; });
        sync();
      }, { threshold: 0 }).observe($("#planner-controls", planner));
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen.summary = en.isIntersecting; });
        sync();
      }, { threshold: 0.15 }).observe($("#plan-summary", planner));
    }
    var reset = $("#plan-reset");
    if (reset) reset.addEventListener("click", function () {
      store.set(PLAN_KEY, null);
      window.location.reload();
    });
    renderPlanner();
  }

  /* --- Palette from a photo ------------------------------------------ */
  var FAMILIES = {
    white: { label: "White and ivory", flowers: ["roses", "sprayRoses", "lisianthus", "ranunculus", "babysBreath", "hydrangeas", "gardenias"] },
    cream: { label: "Cream and champagne", flowers: ["gardenRoses", "sprayRoses", "lisianthus", "carnations", "stock"] },
    blush: { label: "Blush", flowers: ["roses", "sprayRoses", "ranunculus", "carnations", "peonies", "sweetPeas"] },
    pink: { label: "Pink", flowers: ["roses", "peonies", "carnations", "stock", "snapdragons", "zinnias"] },
    hotpink: { label: "Hot pink and fuchsia", flowers: ["roses", "zinnias", "carnations", "peonies", "dahlias"] },
    coral: { label: "Coral and peach", flowers: ["gardenRoses", "ranunculus", "carnations", "zinnias", "dahlias"] },
    red: { label: "Red", flowers: ["roses", "ranunculus", "carnations", "anemones", "tulips", "dahlias"] },
    burgundy: { label: "Burgundy and wine", flowers: ["roses", "dahlias", "callas", "carnations", "mums"] },
    orange: { label: "Orange and rust", flowers: ["roses", "ranunculus", "zinnias", "mums", "dahlias"] },
    yellow: { label: "Yellow and gold", flowers: ["roses", "sunflowers", "ranunculus", "daffodils", "tulips", "mums"] },
    lavender: { label: "Lavender and lilac", flowers: ["roses", "lisianthus", "stock", "sweetPeas", "larkspur"] },
    purple: { label: "Purple and plum", flowers: ["lisianthus", "stock", "irises", "anemones", "mums", "larkspur"] },
    blue: { label: "Blue", flowers: ["delphinium", "hydrangeas", "eryngo", "irises", "larkspur"] },
    green: { label: "Green", flowers: ["eucalyptus", "magnoliaLeaves", "hydrangeas", "ivy"] },
    sage: { label: "Sage and dusty green", flowers: ["eucalyptus", "dustyMiller", "magnoliaLeaves"] },
    neutral: { label: "Neutrals", flowers: ["roses", "eucalyptus", "dustyMiller"],
      tip: "Black, gray, tan and brown frame the flowers rather than match them. Ivory blooms and greenery look best against them." }
  };

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, l = (max + min) / 2, d = max - min, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: s, l: l, c: d };
  }
  function hex(rgb) {
    return "#" + rgb.map(function (v) { var s = Math.round(v).toString(16); return s.length < 2 ? "0" + s : s; }).join("").toUpperCase();
  }
  // Sort a color into a flower color family and give it a plain name
  function classify(rgb) {
    var x = rgbToHsl(rgb[0], rgb[1], rgb[2]), h = x.h, l = x.l, c = x.c;
    var neutralName = l < 0.16 ? "Black" : (h >= 18 && h <= 55 && c > 0.07) ? (l > 0.55 ? "Tan" : "Brown") : (l > 0.6 ? "Gray" : "Charcoal");
    if (l < 0.11) return { family: "neutral", name: "Black" };
    if (c < 0.07) return l > 0.86 ? { family: "white", name: "White" } : { family: "neutral", name: neutralName };
    if (l > 0.88 && c < 0.2) return (h >= 25 && h <= 70) ? { family: "cream", name: "Ivory" } : { family: "white", name: "White" };
    if (h >= 345 || h < 12) {
      if (l > 0.78) return { family: "blush", name: "Blush" };
      if (l > 0.6) return h < 12 && h >= 5 ? { family: "coral", name: "Salmon" } : { family: "pink", name: "Pink" };
      if (l < 0.3) return { family: "burgundy", name: "Burgundy" };
      return c < 0.3 ? { family: "burgundy", name: "Rosewood" } : { family: "red", name: "Red" };
    }
    if (h < 42) {
      if (l > 0.82) return h < 25 ? { family: "blush", name: "Blush" } : { family: "cream", name: "Champagne" };
      if (l > 0.55) return c < 0.15 ? { family: "neutral", name: neutralName } : { family: "coral", name: h < 22 ? "Coral" : "Peach" };
      if (l > 0.28) {
        if (c > 0.45) return { family: "orange", name: h < 24 ? "Rust" : "Orange" };
        return { family: "neutral", name: neutralName };
      }
      return h < 20 && c > 0.2 ? { family: "burgundy", name: "Oxblood" } : { family: "neutral", name: "Brown" };
    }
    if (h < 68) {
      if (l > 0.85) return { family: "cream", name: "Cream" };
      if (c < 0.22) return { family: "neutral", name: l > 0.5 ? "Khaki" : "Olive" };
      return { family: "yellow", name: h < 50 ? "Gold" : "Yellow" };
    }
    if (h < 170) {
      if (c < 0.22 && l > 0.3) return { family: "sage", name: "Sage" };
      return { family: "green", name: l < 0.3 ? "Deep green" : "Green" };
    }
    if (h < 255) {
      if (c < 0.12) return { family: "neutral", name: l > 0.6 ? "Gray" : "Slate" };
      if (l > 0.75) return { family: "blue", name: "Pale blue" };
      return { family: "blue", name: l < 0.35 ? "Navy" : "Blue" };
    }
    if (h < 300) return l > 0.65 ? { family: "lavender", name: "Lavender" } : { family: "purple", name: l < 0.3 ? "Plum" : "Purple" };
    if (l > 0.8) return { family: "blush", name: "Blush" };
    if (l > 0.55) return c > 0.55 ? { family: "hotpink", name: "Fuchsia" } : { family: "pink", name: "Pink" };
    if (l > 0.3) return c > 0.45 ? { family: "hotpink", name: "Magenta" } : { family: "pink", name: "Mauve" };
    return { family: "burgundy", name: "Plum" };
  }

  // Small, seeded k-means so the same photo always gives the same colors
  function extractColors(pixels, k) {
    var seed = 20261027;
    var rand = function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    var n = pixels.length;
    if (!n) return [];
    var dist = function (a, b) { var dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; };
    var centers = [pixels[Math.floor(rand() * n)].slice()];
    while (centers.length < k) {
      var d2 = pixels.map(function (p) { return Math.min.apply(null, centers.map(function (c) { return dist(p, c); })); });
      var sum = d2.reduce(function (a, b) { return a + b; }, 0);
      if (!sum) break;
      var r = rand() * sum, i = 0;
      while (r > d2[i] && i < n - 1) { r -= d2[i]; i++; }
      centers.push(pixels[i].slice());
    }
    var counts = [];
    for (var iter = 0; iter < 12; iter++) {
      var sums = centers.map(function () { return [0, 0, 0]; });
      counts = centers.map(function () { return 0; });
      for (var p = 0; p < n; p++) {
        var best = 0, bestD = Infinity;
        for (var c = 0; c < centers.length; c++) { var dd = dist(pixels[p], centers[c]); if (dd < bestD) { bestD = dd; best = c; } }
        sums[best][0] += pixels[p][0]; sums[best][1] += pixels[p][1]; sums[best][2] += pixels[p][2]; counts[best]++;
      }
      centers = centers.map(function (cen, ci) { return counts[ci] ? [sums[ci][0] / counts[ci], sums[ci][1] / counts[ci], sums[ci][2] / counts[ci]] : cen; });
    }
    var out = centers.map(function (cen, ci) { return { rgb: cen, share: counts[ci] / n }; })
      .filter(function (x) { return x.share > 0.03; })
      .sort(function (a, b) { return b.share - a.share; });
    // Merge near-duplicates
    var merged = [];
    out.forEach(function (x) {
      var twin = merged.filter(function (m) { return dist(m.rgb, x.rgb) < 420; })[0];
      if (twin) twin.share += x.share; else merged.push(x);
    });
    return merged.slice(0, 5);
  }

  if (palette) {
    var fileInput = $("#palette-file", palette);
    var exampleBtn = $("#palette-example", palette);
    var clearBtn = $("#palette-clear", palette);
    var preview = $("#palette-preview", palette);
    var status = $("#palette-status", palette);
    var swatchBox = $("#palette-swatches", palette);
    var suggestBox = $("#palette-suggest", palette);
    var resultBox = $("#palette-result", palette);

    var renderPalette = function () {
      var colors = plan.colors || [];
      resultBox.hidden = !colors.length;
      clearBtn.hidden = !colors.length;
      if (!colors.length) { swatchBox.innerHTML = ""; suggestBox.innerHTML = ""; return; }
      swatchBox.innerHTML = colors.map(function (c, i) {
        var dark = rgbToHsl(parseInt(c.hex.slice(1, 3), 16), parseInt(c.hex.slice(3, 5), 16), parseInt(c.hex.slice(5, 7), 16)).l < 0.55;
        return '<button type="button" class="swatch' + (dark ? " swatch--dark" : "") + '" data-swatch="' + i + '" aria-pressed="' + (c.keep !== false) + '" style="--sw:' + c.hex + '">' +
          '<span class="swatch-chip"></span><span class="swatch-name">' + esc(c.name) + '</span><span class="swatch-hex">' + esc(c.hex) + " · " + Math.round(c.share * 100) + "%</span></button>";
      }).join("");
      var seen = {};
      var fams = colors.filter(function (c) { return c.keep !== false; }).map(function (c) { return c.family; })
        .filter(function (f) { if (seen[f]) return false; seen[f] = true; return true; });
      var shown = fams.filter(function (f) { return f !== "neutral"; }).slice(0, 3);
      if (!shown.length && fams.length) shown = ["neutral"];
      suggestBox.innerHTML = shown.map(function (key) {
        var fam = FAMILIES[key];
        return '<div class="suggest"><span class="label label--ink">' + esc(fam.label) + "</span><p>" + flowerList(fam.flowers, true) + ".</p>" +
          (fam.tip ? '<p class="muted">' + esc(fam.tip) + "</p>" : "") + "</div>";
      }).join("") || '<p class="muted">Tap a color to bring it back.</p>';
      frenchify(suggestBox);
    };

    var readImage = function (img, label) {
      var canvas = document.createElement("canvas");
      var scale = Math.min(1, 120 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
      var ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var px = [];
      for (var i = 0; i < data.length; i += 4) if (data[i + 3] > 128) px.push([data[i], data[i + 1], data[i + 2]]);
      plan.colors = extractColors(px, 7).map(function (x) {
        var named = classify(x.rgb);
        return { hex: hex(x.rgb), share: x.share, family: named.family, name: named.name, keep: true, l: rgbToHsl(x.rgb[0], x.rgb[1], x.rgb[2]).l };
      });
      // Two swatches with the same name become "Light peach" and "Deep peach"
      plan.colors.forEach(function (c) {
        var twins = plan.colors.filter(function (o) { return o.name.replace(/^(Light|Deep) /, "").toLowerCase() === c.name.toLowerCase(); });
        if (twins.length < 2) return;
        twins.sort(function (a, b) { return b.l - a.l; });
        twins.forEach(function (t, i) { t.name = (i === 0 ? "Light " : "Deep ") + t.name.toLowerCase(); });
      });
      plan.colors.forEach(function (c) { delete c.l; });
      savePlan();
      status.textContent = "Found " + plural(plan.colors.length, "color", "colors") + " in " + label + ". Tap a color to leave it out.";
      renderPalette();
      renderPlanner();
    };

    var loadFrom = function (src, label, revoke) {
      status.textContent = "Reading the colors…";
      var img = new Image();
      img.onload = function () {
        preview.src = src;
        preview.hidden = false;
        try { readImage(img, label); } catch (e) { status.textContent = "Couldn't read that photo. Try a JPEG, PNG or a screenshot."; }
        if (revoke) setTimeout(function () { URL.revokeObjectURL(src); }, 60000);
      };
      img.onerror = function () { status.textContent = "Couldn't open that photo. Try a JPEG, PNG or a screenshot of it."; };
      img.src = src;
    };

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      loadFrom(URL.createObjectURL(file), "your photo", true);
      fileInput.value = "";
    });
    exampleBtn.addEventListener("click", function () {
      loadFrom(exampleBtn.getAttribute("data-src"), "the example photo", false);
    });
    clearBtn.addEventListener("click", function () {
      plan.colors = [];
      savePlan();
      preview.hidden = true;
      preview.removeAttribute("src");
      status.textContent = "Colors cleared.";
      renderPalette();
      renderPlanner();
    });
    swatchBox.addEventListener("click", function (e) {
      var b = e.target.closest("[data-swatch]");
      if (!b) return;
      var c = plan.colors[Number(b.getAttribute("data-swatch"))];
      c.keep = c.keep === false;
      savePlan();
      renderPalette();
      renderPlanner();
    });
    if ((plan.colors || []).length) status.textContent = "Colors from your last visit. Choose a new photo to start over.";
    renderPalette();
  }

  /* ------------------------------------------------------------------ */
  /* 4. In season in Acadiana                                            */
  /* ------------------------------------------------------------------ */
  var seasons = $("#seasons");
  if (seasons) {
    var wheel = $("#wheel", seasons);
    var dial = $("#wheel-dial", seasons);
    var monthName = $("#wheel-month", seasons);
    var detail = $("#season-detail", seasons);
    var sDate = $("#season-date", seasons);
    var sDateOut = $("#season-date-result", seasons);
    var current = 0, turns = 0;

    dial.innerHTML = MONTHS.map(function (m, i) {
      return '<button type="button" class="wheel-month" style="--i:' + i + '" data-month="' + i + '" aria-pressed="false" aria-label="' + m.name + '"><span>' + m.short + "</span></button>";
    }).join("");

    var showMonth = function (i, focus) {
      // Turn the shortest way round so the chosen month sits at the top
      var step = ((i - current) % 12 + 12) % 12;
      if (step > 6) step -= 12;
      turns += step;
      current = i;
      wheel.style.setProperty("--turn", String(-turns));
      $all(".wheel-month", dial).forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-month")) === i)); });
      var m = MONTHS[i];
      monthName.textContent = m.name;
      detail.innerHTML =
        '<h3 class="title-sm">' + esc(m.name) + "</h3>" +
        '<div class="season-cols">' +
          '<div><span class="label">In Louisiana gardens</span><ul class="season-list">' + m.garden.map(function (id) { return "<li>" + fl(F[id]) + "</li>"; }).join("") + "</ul></div>" +
          '<div><span class="label">Best from growers</span><ul class="season-list">' + m.growers.map(function (id) { return "<li>" + fl(F[id]) + "</li>"; }).join("") + "</ul></div>" +
        "</div>" +
        (m.note ? '<p class="season-note">' + esc(m.note) + "</p>" : "");
      frenchify(detail);
      if (focus) {
        var b = dial.querySelector('[data-month="' + i + '"]');
        if (b) b.focus();
      }
      try { history.replaceState(null, "", "?month=" + (i + 1)); } catch (e) { /* file:// */ }
    };

    dial.addEventListener("click", function (e) {
      var b = e.target.closest("[data-month]");
      if (b) showMonth(Number(b.getAttribute("data-month")));
    });
    dial.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); showMonth((current + 1) % 12, true); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); showMonth((current + 11) % 12, true); }
    });
    $all("[data-wheel-step]", seasons).forEach(function (b) {
      b.addEventListener("click", function () { showMonth((current + Number(b.getAttribute("data-wheel-step")) + 12) % 12); });
    });

    var nowD = new Date();
    sDate.min = new Date(nowD.getTime() - nowD.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    var checkDate = function () {
      var d = parseDate(sDate.value);
      if (!d) { sDateOut.hidden = true; return; }
      showMonth(d.getMonth());
      var warn = holidayNote(d);
      var pretty = MONTHS[d.getMonth()].name + " " + d.getDate() + ", " + d.getFullYear();
      sDateOut.innerHTML = "<p><strong>" + esc(pretty) + ".</strong> Here's what's at its best that month, plus the year-round flowers below.</p>" +
        (warn ? '<p class="plan-warn">' + esc(warn) + "</p>" : "") +
        '<div class="btn-row"><a class="btn" href="/inquire?date=' + esc(sDate.value) + '">Ask about this date</a><a class="arrow-link" href="/plan">Plan a wedding order</a></div>';
      sDateOut.hidden = false;
    };
    sDate.addEventListener("change", checkDate);
    sDate.addEventListener("input", checkDate);

    var startMonth = Number(new URLSearchParams(window.location.search).get("month"));
    var first = startMonth >= 1 && startMonth <= 12 ? startMonth - 1 : new Date().getMonth();
    // Jump straight to the first month without spinning
    wheel.classList.add("no-anim");
    current = first; turns = first;
    wheel.style.setProperty("--turn", String(-turns));
    showMonth(first);
    void wheel.offsetWidth;
    wheel.classList.remove("no-anim");
    var todayMark = dial.querySelector('[data-month="' + new Date().getMonth() + '"]');
    if (todayMark) todayMark.classList.add("is-now");

    var yr = $("#year-round", seasons);
    if (yr) { yr.innerHTML = YEAR_ROUND.map(function (id) { return "<li>" + fl(F[id]) + "</li>"; }).join(""); frenchify(yr); }
  }
})();
