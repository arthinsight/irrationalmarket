(function () {
  function pct(value) { return value == null ? '—' : (Number(value) * 100).toFixed(1) + '%'; }
  function label(value) { return value == null ? '—' : String(value); }
  function update(data) {
    var regime = data.regime || {}, breadth = regime.breadth || {};
    var asof = document.querySelector('.asof');
    if (asof) asof.innerHTML = '<b>Data as of ' + label(data.as_of) + '</b><br>Live Unified Intel snapshot';
    var footerAsOf = document.getElementById('big-picture-asof');
    if (footerAsOf) footerAsOf.textContent = 'Data as of ' + label(data.as_of);
    var name = document.querySelector('.regime-name');
    if (name) name.innerHTML = label(regime.name) + ' <span class="status" style="background:var(--warn-bg);color:var(--warn)"><i></i>' + label(regime.code) + ' · ' + label(regime.hero) + ' conditions</span>';
    var mini = document.querySelectorAll('.regime-meta .mini-stat');
    if (mini.length >= 4) {
      mini[0].innerHTML = '<b>' + label(regime.aggr) + ' / 5</b><span>Market participation</span>';
      mini[1].innerHTML = '<b>' + label(regime.major_trend) + '</b><span>Broad trend</span>';
      mini[2].innerHTML = '<b>' + label(regime.minor_trend) + '</b><span>Near-term trend</span>';
      mini[3].innerHTML = '<b>' + (Number(regime.sepa_momentum) > 0 ? 'Building' : Number(regime.sepa_momentum) < 0 ? 'Fading' : 'Flat') + '</b><span>Trend momentum · ' + label(regime.sepa_momentum) + '</span>';
    }
    var kpis = document.querySelectorAll('.kpis .kpi');
    if (kpis.length >= 3) {
      kpis[0].querySelector('.kpi-value').textContent = pct(breadth.bull_pct);
      kpis[1].querySelector('.kpi-value').textContent = pct(breadth.sideways_pct);
      kpis[2].querySelector('.kpi-value').textContent = pct(breadth.bear_pct);
    }
    var riskRows = document.querySelectorAll('.panel table tbody')[1] && document.querySelectorAll('.panel table tbody')[1].querySelectorAll('tr');
    if (riskRows && data.risk_off) data.risk_off.forEach(function (row, i) {
      if (!riskRows[i]) return;
      riskRows[i].children[0].textContent = row.name;
      riskRows[i].children[1].innerHTML = '<span class="badge ' + (row.fired ? 'warn' : 'good') + '">' + (row.fired ? 'Triggered' : 'Clear') + '</span>';
    });
  }
  (function(){
    /* Prefer the published payload; fall back to scraping the old screens page.
       The scrape is why `screens/index.html` (a 546 KB copy of the dashboard) could not be retired:
       this page depended on it. `publish._export_public` now writes the SAME public-sanitised
       payload to data/intel.json, so the fetch below is the primary path and the scrape is only a
       bridge for a cached page. Remove the fallback once no built page carries `intel-data`. */
    return fetch('../data/intel.json').then(function(r){
      if(!r.ok) throw new Error('no intel.json');
      return r.text().then(function(t){ return {text:function(){return Promise.resolve(
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
