(function () {
  var MINUS = '−';
  function pct(value) { return value == null ? '—' : (Number(value) * 100).toFixed(1) + '%'; }
  function label(value) { return value == null ? '—' : String(value); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* Trend strength prints as a WORD plus a signed number in the template's own vocabulary
     (Strong +3 / Positive +1 / Weak -1). Deriving both from one score keeps the label and the
     number from ever disagreeing, which a hand-written sample row cannot guarantee. */
  function strengthWord(v) {
    v = Number(v);
    if (!isFinite(v)) return '—';
    if (v >= 3) return 'Strong';
    if (v >= 1) return 'Positive';
    if (v <= -1) return 'Weak';
    return 'Flat';
  }
  function signed(v) {
    v = Number(v);
    if (!isFinite(v)) return '';
    return (v > 0 ? '+' : v < 0 ? MINUS : '') + Math.abs(v);
  }
  function strength(v) { return strengthWord(v) + ' ' + signed(v); }
  function toneOf(v) { v = Number(v); return v >= 1 ? 'good' : v <= -1 ? 'bad' : 'warn'; }
  function badgeOf(trend) { return trend === 'Bull' ? 'good' : trend === 'Bear' ? 'bad' : 'warn'; }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function shortDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) { return label(iso); }
    return m[3] + ' ' + MON[Number(m[2]) - 1];
  }
  /* Map a -3..+3 trend score onto the bar width the template uses for its samples (18%..100%),
     so a weak sector reads as a short bar instead of inheriting a hardcoded width. */
  function barWidth(v) {
    v = Math.max(-3, Math.min(3, Number(v) || 0));
    return Math.round(18 + ((v + 3) / 6) * 82) + '%';
  }

  function update(data) {
    var regime = data.regime || {}, breadth = regime.breadth || {};
    // The page-head `.asof` block ("Data as of <date> / Live Unified Intel snapshot") was REMOVED
    // 2026-09-01 on the owner's instruction. Its <p class="asof"> went from big_picture.html in the
    // same change: a writer kept without its element is a `querySelector` that silently returns
    // null forever, which is indistinguishable from working. The date still ships in the FOOTER
    // below, so it is relocated, not lost.
    var footerAsOf = document.getElementById('big-picture-asof');
    if (footerAsOf) footerAsOf.textContent = 'Data as of ' + label(data.as_of);
    var name = document.querySelector('.regime-name');
    if (name) {
      name.innerHTML = esc(label(regime.name)) +
        ' <span class="status" style="background:var(--warn-bg);color:var(--warn)"><i></i>' +
        esc(label(regime.code)) + ' · ' + esc(label(regime.hero)) + ' conditions</span>';
    }
    var mini = document.querySelectorAll('.regime-meta .mini-stat');
    if (mini.length >= 4) {
      mini[0].innerHTML = '<b>' + esc(label(regime.aggr)) + ' / 5</b><span>Market participation</span>';
      mini[1].innerHTML = '<b>' + esc(label(regime.major_trend)) + '</b><span>Broad trend</span>';
      mini[2].innerHTML = '<b>' + esc(label(regime.minor_trend)) + '</b><span>Near-term trend</span>';
      mini[3].innerHTML = '<b>' + (Number(regime.sepa_momentum) > 0 ? 'Building' :
        Number(regime.sepa_momentum) < 0 ? 'Fading' : 'Flat') +
        '</b><span>Trend momentum · ' + esc(label(regime.sepa_momentum)) + '</span>';
    }

    var grid = data.sector_grid || [];
    var stage2 = grid.reduce(function (t, r) { return t + (Number(r.stage2_buys) || 0); }, 0);
    var stage2Bull = grid.reduce(function (t, r) {
      return t + (r.trend === 'Bull' ? (Number(r.stage2_buys) || 0) : 0);
    }, 0);

    /* EVERY KPI, INCLUDING ITS NOTE. This used to set three .kpi-value cells and nothing else, so
       KPI 4 and all four .kpi-note lines kept the template's sample figures: the page showed "438
       Stage-2 buys" against a real 428, and a hydrated "62.9%" sat directly above its own
       un-hydrated note reading "20 of 35" (= 57.1%). It contradicted itself on one screen. A value
       and the note explaining it must come from the same payload, or neither should move. */
    var n = Number(breadth.n_indices) || 0;
    function countOf(p) { return (p == null || !n) ? null : Math.round(Number(p) * n); }
    var kpis = document.querySelectorAll('.kpis .kpi');
    function setKpi(i, value, noteHtml) {
      if (!kpis[i]) { return; }
      var v = kpis[i].querySelector('.kpi-value'), note = kpis[i].querySelector('.kpi-note');
      if (v) { v.textContent = value; }
      if (note && noteHtml != null) { note.innerHTML = noteHtml; }
    }
    var cBull = countOf(breadth.bull_pct);
    var cSide = countOf(breadth.sideways_pct);
    var cBear = countOf(breadth.bear_pct);
    setKpi(0, pct(breadth.bull_pct), cBull == null ? null :
      '<span class="up">' + cBull + ' of ' + n + '</span> · tracked indices in Bull');
    setKpi(1, pct(breadth.sideways_pct), cSide == null ? null :
      cSide + ' of ' + n + ' · range-bound structures');
    setKpi(2, pct(breadth.bear_pct), cBear == null ? null :
      '<span class="down">' + cBear + ' of ' + n + '</span> · tracked indices in Bear');
    /* The sample note read "378 aligned - with current regime". No field in the payload defines
       "aligned", so this states something the data actually supports rather than reproducing a
       number nobody can derive. */
    setKpi(3, grid.length ? String(stage2) : '—', !grid.length ? null :
      '<span class="up">' + stage2Bull + ' in Bull sectors</span> · of ' + stage2 + ' total');

    /* SECTOR LEADERSHIP - leaders and laggards from the grid, not five frozen rows. */
    var list = document.querySelector('.sector-list');
    if (list && grid.length) {
      var byScore = grid.slice().sort(function (a, b) {
        return (Number(b.sepa_score) || 0) - (Number(a.sepa_score) || 0) ||
               (Number(b.stage2_buys) || 0) - (Number(a.stage2_buys) || 0);
      });
      var picked = byScore.slice(0, 3).concat(byScore.slice(-2));
      list.innerHTML = picked.map(function (r) {
        var tone = toneOf(r.sepa_score);
        return '<div class="sector"><b>' + esc(r.sector) + '</b><div class="track"><div class="fill' +
          (tone === 'good' ? '' : ' ' + tone) + '" style="width:' + barWidth(r.sepa_score) +
          '"></div></div><span class="trend ' + tone + '">' + strength(r.sepa_score) +
          ' · ' + (Number(r.stage2_buys) || 0) + '</span></div>';
      }).join('');
    }

    var bodies = document.querySelectorAll('.panel table tbody');
    /* BROADER INDICES (tbody 0). */
    if (bodies[0] && (data.broader_strip || []).length) {
      bodies[0].innerHTML = data.broader_strip.map(function (r) {
        return '<tr><td>' + esc(r.index) + '</td><td><span class="badge ' + badgeOf(r.trend) + '">' +
          esc(r.trend) + '</span></td><td>' + esc(r.minor) + '</td><td>' + strength(r.sepa) + '</td></tr>';
      }).join('');
    }
    /* RISK MONITOR (tbody 1). `fired` arrives as a real bool for most rows but as the STRING
       "True" for at least one, and every non-empty string is truthy - so a future "False" would
       have rendered as Triggered. Compare against the values explicitly. */
    var riskRows = bodies[1] && bodies[1].querySelectorAll('tr');
    if (riskRows && data.risk_off) {
      data.risk_off.forEach(function (row, i) {
        if (!riskRows[i]) { return; }
        var fired = row.fired === true || row.fired === 'True' || row.fired === 'true' || row.fired === 1;
        riskRows[i].children[0].textContent = row.name;
        riskRows[i].children[1].innerHTML = '<span class="badge ' + (fired ? 'warn' : 'good') + '">' +
          (fired ? 'Triggered' : 'Clear') + '</span>';
      });
    }
    /* RECENT REGIME CHANGES (tbody 2), newest first. The samples were three weeks stale and one
       was misdated, because nothing ever rewrote them. */
    if (bodies[2] && (data.change_log || []).length) {
      var chg = data.change_log.slice().sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
      }).slice(0, 4);
      bodies[2].innerHTML = chg.map(function (r) {
        var worse = r.to === 'Bear' || (r.from === 'Bull' && r.to !== 'Bull');
        return '<tr><td>' + esc(r.index) + '</td><td>' + shortDate(r.date) +
          '</td><td><span class="badge ' + (worse ? 'warn' : 'good') + '">' +
          esc(r.from) + ' → ' + esc(r.to) + '</span></td></tr>';
      }).join('');
    }

    /* CURRENT MARKET READ - the prose repeated the two headline numbers, so it was a third place
       for them to be wrong. */
    var readTitle = document.querySelector('.insight b');
    if (readTitle && readTitle.textContent.indexOf('Current market read') === 0 && readTitle.parentNode) {
      readTitle.parentNode.innerHTML = '<b>Current market read</b>Market is ' +
        esc(String(regime.hero || '').toUpperCase()) + ' (' + esc(label(regime.code)) +
        '). Breadth is ' + pct(breadth.bull_pct) + ' and ' + stage2 +
        ' Stage-2 BUY candidates are present, while the broad trend is ' +
        esc(String(regime.major_trend || '').toLowerCase()) + ' and trend momentum is ' +
        esc(label(regime.sepa_momentum)) +
        '. The page surfaces this alignment and divergence so visitors can form their own view.';
    }
  }
  (function(){
    /* Prefer the published payload; fall back to scraping the old screens page.
       The scrape is why `screens/index.html` (a 546 KB copy of the dashboard) could not be retired:
       this page depended on it. `publish._export_public` now writes the SAME public-sanitised
       payload to data/intel.json, so the fetch below is the primary path and the scrape is only a
       bridge for a cached page. Remove the fallback once no built page carries `intel-data`. */
    return fetch('../data/intel.json').then(function(r){
      if(!r.ok) throw new Error('no intel.json');
      return r.text().then(function(t){ return {ok:true, text:function(){return Promise.resolve(
        '<script id="intel-data" type="application/json">'+t+'<\/script>');}}; });
    }).catch(function(){ return fetch('../screens/index.html'); });
  })().then(function (r) {
    if (!r.ok) throw new Error('Could not load the current market snapshot');
    return r.text();
  }).then(function (html) {
    var match = html.match(/<script id="intel-data" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) update(JSON.parse(match[1]));
  }).catch(function () { /* Static snapshot remains available for file:// review. */ });
}());
