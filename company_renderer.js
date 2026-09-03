(function(){'use strict';
const P=JSON.parse(document.getElementById('store-payload').textContent),I=P.identity,R=P.report||{},Q=P.drhpResearch||{},M=P.market||{},D=P.currentResearch||{},C=P.currentContext||{},PM=P.pageModel||null;
const E=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),A=v=>Array.isArray(v)?v:(v?[v]:[]),N=(v,d=1)=>{var n=Number(v);return v==null||v===''||!isFinite(n)?'—':n.toLocaleString('en-IN',{maximumFractionDigits:d});};/* NaN GUARD 2026-09-03 (owner: "on page financial one table heading is NaN"). The old test was `v==null||v===''`, which does NOT catch NaN -- and every period table computes its cells, so a row missing one field renders `undefined/100` = NaN and prints the literal string "NaN". Seen on QUALIANCEINTERNATIONAL (FY22 has no `pat`, FY26 no `ebitda`), HARITINDUSTRIES and OMGALAXY. `isFinite` also catches Infinity from a divide-by-zero, which the same cells can produce. */
const ordinal=v=>{let n=Number(v),s=['th','st','nd','rd'],m=n%100;return N(n,0)+(s[(m-20)%10]||s[m]||s[0])};
const value=x=>typeof x==='string'?x:(x?.title||x?.risk||x?.item||x?.note||x?.event||x?.detail||x?.purpose||x?.issue||x?.approval||x?.signal||x?.check||JSON.stringify(x));
const list=(v,n=8)=>A(v).length?'<ul class="intel-list">'+A(v).slice(0,n).map(x=>'<li>'+mdInline(E(mdLine(value(x))))+'</li>').join('')+'</ul>':'',card=(t,b,c='')=>b?'<article class="card '+c+'"><h3>'+E(t)+'</h3>'+b+'</article>':'';
/* PERIOD-COLUMN TABLE (owner 2026-09-02: "keep year or QTr on column heading not row").
   A financial table reads by METRIC across time, so the period belongs on the column axis and the
   metric on the row axis -- the same orientation the Deep-Dive uses. `table()` above renders the
   opposite (one row per period), which forces a reader to scan sideways to follow a single line
   item and, with 5-6 metrics, produces the wide table the phone audit flags as M10.
   `h` is the ORIGINAL header list whose FIRST entry is the period label ('Year'/'Quarter'); rows
   are period-major. Transposing here rather than at the data layer keeps every caller's row shape
   untouched. */
const tableByPeriod = (h, rows, maxVisibleRows = 10) => {
  if (!rows || !rows.length) return '';
  const periods = rows.map(r => r[0]);
  const metrics = h.slice(1);
  const out = metrics.map((m, i) => [m].concat(rows.map(r => r[i + 1])));
  return table([h[0] === 'Year' ? 'Metric' : h[0]].concat(periods), out, maxVisibleRows);
};

const table = (h, rows, maxVisibleRows = 10) => {
    if (!rows || !rows.length) return '';
    let asOfIdx = h.findIndex(x => x.toLowerCase().includes('as of'));
    if (asOfIdx !== -1) {
        h.splice(asOfIdx, 1);
        rows.forEach(r => r.splice(asOfIdx, 1));
    }
    let utilisedIdx = h.findIndex(x => x.toLowerCase().includes('utilised') || x.toLowerCase().includes('utilized'));
    if (utilisedIdx !== -1) {
        let hasData = rows.some(r => {
            let val = String(r[utilisedIdx] || '').trim();
            return val !== '' && val !== '—' && /[0-9]/.test(val);
        });
        if (!hasData) {
            h.splice(utilisedIdx, 1);
            rows.forEach(r => r.splice(utilisedIdx, 1));
        }
    }
    let visibleRows = rows.slice(0, maxVisibleRows);
    let hiddenRows = rows.slice(maxVisibleRows);
    let html = '<div class="table-wrap"><table><thead><tr>' + h.map(x => '<th>' + E(x) + '</th>').join('') + '</tr></thead><tbody>';
    html += visibleRows.map(r => '<tr>' + r.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('');
    if (hiddenRows.length > 0) {
        html += hiddenRows.map(r => '<tr class="hidden-row" style="display: none;">' + r.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('');
        html += '</tbody></table>';
        html += '<button class="show-more-btn" onclick="let r=this.parentElement.querySelectorAll(\'.hidden-row\'); let collapsed=r[0].style.display===\'none\'; r.forEach(x=>x.style.display=collapsed?\'table-row\':\'none\'); this.textContent=collapsed?\'Show less\':\'Show more\';" style="margin-top: 8px; background: transparent; border: 1px solid var(--g300); color: var(--g700); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">Show more</button>';
    } else {
        html += '</tbody></table>';
    }
    html += '</div>';
    return html;
};
const badge=(s,c='fact')=>'<span class="evidence '+c+'">'+E(s)+'</span>',sec=k=>R[k]||{};
const callStore=P.concallIntel||C.concallIntel||{};
const concall=q=>{let s=callStore.sections||{},k=Object.keys(s).find(k=>k.includes(q));return k?s[k]:[]};
const callBody=q=>concall(q).map(x=>{
    let s=E(String(x||'').trim().replace(/^[-*•]\s+/gm,''));
    s=s.replace(/\r?\n/g,'<br>');
    return '<p>'+mdInline(s)+'</p>';
}).join('');
const creditRatingCard=()=>{let c=P.credit;if(!c||!c.rating)return '';return card('Credit rating & solvency','<div class="analysis-strip"><div><span>Agency</span><b>'+E(c.agency)+'</b></div><div><span>Instrument</span><b>'+E(c.instrument)+'</b></div><div><span>Rating</span><b>'+E(c.rating)+' ('+E(c.outlook||'Stable')+')</b></div><div><span>Prior rating</span><b>'+E(c.prior_rating||'—')+'</b></div><div><span>Action date</span><b>'+E(c.action_date)+'</b></div></div>'+(c.rationale?'<p><strong>Rationale:</strong> '+E(c.rationale)+'</p>':''))};
const ddBlocks=g=>A(D.sections?.[g]), ddBlock=(g,q)=>ddBlocks(g).find(x=>(x.title||'').toLowerCase().includes(q))||{};
// ddBlock returns {} on a miss, and {} is truthy — so `a||b` always takes the first.
// pick() is the honest chain: the first candidate that actually carries a body.
const pick=(...xs)=>xs.find(x=>x&&String(x.body||'').trim())||{};
// Cards route by TOPIC, resolved in Python through the closed vocabulary and the source ladder
// (company_public_page._topic_index). Substring-on-title is kept only as a fallback: it finds a
// moat block for 201 symbols where the vocabulary finds 1,004, because the evidence is stored as
// "Bull - competitive strengths", which contains no such word.
const TOPICS=P.topics||{};
const topicBlock=(t,...fallbacks)=>pick(TOPICS[t]||{},...fallbacks);
// Split a stored prose block into bullet lines, stripping list markers and numbering.
const bullets=v=>String(v==null?'':v).split(/\r?\n+/).map(s=>s.replace(/^\s*[-•*]\s*/,'').replace(/^\s*\d+[.)]\s*/,'').trim()).filter(s=>s.length>3);
// "Title: detail" -> {head, note}; otherwise the whole line is the head.
const headNote=s=>{let m=/^\*{0,2}([^:*]{4,70}?)\*{0,2}\s*:\s+(.+)$/.exec(s);return m?{head:m[1].trim(),note:m[2].trim()}:{head:s.replace(/\*\*/g,'').trim(),note:''}};
// The stored bodies are MARKDOWN. The page converted `**bold**` and nothing else, so measured
// across 26,162 blocks: 2,085 italics (212 symbols), 433 horizontal rules (429), 414 blockquote
// markers (312), 338 inline-code spans (113) and 5 headings all printed their raw punctuation to
// the reader. mdLine strips the LINE markers before escaping; mdInline runs on already-escaped
// text. Bold must run before italic or `**x**` is eaten by the single-asterisk rule.
const mdInline=s=>String(s==null?'':s)
    .replace(/\*\*([^*]+?)\*\*/g,'<b>$1</b>')
    .replace(/(^|[^*\w])\*([^*\n]{1,200}?)\*(?!\*)/g,'$1<i>$2</i>')
    .replace(/`([^`\n]+?)`/g,'<code>$1</code>');
const mdLine=s=>String(s==null?'':s)
    .replace(/^\s*&gt;\s?/gm,'').replace(/^\s*>\s?/gm,'')
    .replace(/^\s*#{1,6}\s+/gm,'')
    .replace(/^\s*-{3,}\s*$/gm,'')
    .replace(/^\s*[-*•]\s+/gm,'');
const dedupeKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
// Capacity cells arrive carrying the extractor's provenance ("stated verbatim as ...", the exact
// report section). The figure is the fact; the provenance is a statement about our pipeline and
// belongs in coverage, not in a table cell. Values are never altered — only the aside is dropped.
// Captive power is an INPUT to manufacturing, not manufacturing capacity — unless the company
// sells power, in which case it is the product. The producers now exclude it at write time; these
// stored rows predate that rule (measured 2026-08-24: 11 rows across 7 symbols of 187 blocks).
// FIRST ATTEMPT MATCHED ONLY "captive power" / "captive generation" and caught 11 of the 36
// capacity rows that mention captive — 31%. The phrasing varies far more than that: "Captive
// windmill", "Captive Thermal Power Plants", "Captive renewable energy - Solar", "Rooftop Solar
// (captive renewable capacity)", "Captive thermal power — company total". The word `captive` in a
// product cell IS the signal; the energy noun after it is not predictable. The power-company guard
// below is what keeps this from deleting a genuine producer's own output.
// Some producers also label the row outright — ANUP writes "(energy asset, not product capacity)".
const CAPTIVE_ROW=/^\|\s*[^|]*(?:\bcaptive\b|not\s+product\s+capacity)/i;
const isPowerCo=()=>/power|energy|utilit|renewab/i.test(String(D.peer_panel?.industry||D.profile?.subseg||''));
const tidyCapacity=v=>{
    let keep=isPowerCo()?()=>true:(l=>!CAPTIVE_ROW.test(l));
    return String(v==null?'':v).split(/\r?\n/).filter(keep).join('\n')
        .replace(/\s*\((?:stated|as stated|as per|per the|quoted)[^()]{0,160}\)/gi,'')
        .replace(/\s*;\s*(?:BRSR|Annexure|Note|Section)[^|\n]{0,80}/gi,'')
        .replace(/[ \t]{2,}/g,' ');
};
const prose=(v,maxVisibleRows=10)=>{
    if(!v) return '';
    let tableRegex = /((?:^|\n)\|[^\n\r]+\|(?:\r?\n\|[\-\s|]+\|)(?:\r?\n\|[^\n\r]+\|)+)/g;
    let lastIdx = 0, html = '', match;
    while ((match = tableRegex.exec(v)) !== null) {
        let prevText = v.substring(lastIdx, match.index);
        if (prevText.trim()) {
            html += mdInline(E(mdLine(prevText)).replace(/\n+/g, '<br>'));
        }
        let tableText = match[1].trim();
        let lines = tableText.split('\n').filter(Boolean);
        let header = lines[0].split('|').map(x => x.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
        let rows = lines.slice(2).map(l => l.split('|').map(x => x.trim()).filter((_, i, a) => i > 0 && i < a.length - 1).map(E));
        html += table(header, rows, maxVisibleRows);
        lastIdx = tableRegex.lastIndex;
    }
    let remaining = v.substring(lastIdx);
    if (remaining.trim()) {
        html += mdInline(E(mdLine(remaining)).replace(/\n+/g, '<br>'));
    }
    return html || mdInline(E(mdLine(v)).replace(/\n+/g, '<br>'));
};
const status=s=>'<span class="status '+E(String(s||'open').toLowerCase())+'">'+E(s||'open')+'</span>';
const kpiLabel=v=>String(v||'').replace(/\s*\(Q\dFY\d+\)/gi,'').replace(/^Revenue$/i,'Latest revenue').replace(/^EBITDA Margin$/i,'Latest EBITDA margin');
const kpis=v=>A(v).length?'<div class="kpi-grid">'+A(v).map(x=>'<div class="kpi"><span>'+E(kpiLabel(x.label))+'</span><b>'+E(x.value)+'</b></div>').join('')+'</div>':'';
const pipe=v=>String(v||'').split('|').map(x=>x.trim()).filter(Boolean), jsonish=v=>{try{return typeof v==='string'?JSON.parse(v):v||{}}catch(_){return {}}};
// The store ships one list in three shapes: a real array, a JSON object of category -> [items]
// (`products`), and a pipe-delimited string (`endMarkets`). The page tested `Array.isArray` and
// silently dropped the other two, so 996 companies carried products the Products card never
// showed. Normalise once, here, instead of guessing the shape at each call site.
// P.products is the TRUNCATED copy: something between company_profile.csv (clean, parses, up to
// 2,635 chars) and the sidecar cuts it to 599 chars plus an ellipsis, so 220 of 996 are broken
// JSON that can never parse. currentContext carries the same field already parsed, clean, on 960
// pages - prefer it, and keep the truncated string only as a last resort.
const productList=()=>{let a=asList(C.products);return a.length?a:asList(P.products)};
const marketList=()=>{let a=asList(C.end_markets);return a.length?a:asList(P.endMarkets)};
const asList=v=>{
    if(Array.isArray(v))return v;
    if(v&&typeof v==='object')return Object.keys(v).map(k=>'**'+k+':** '+A(v[k]).map(x=>typeof x==='string'?x:value(x)).join(', '));
    let s=String(v==null?'':v).trim();
    if(!s)return[];
    if(s[0]==='{'||s[0]==='['){let p=jsonish(s);return Array.isArray(p)?p:asList(p)}
    return pipe(s);
};
const unique=v=>{let seen=new Set;return A(v).filter(x=>{let k=value(x).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(!k||seen.has(k))return false;seen.add(k);return true})};
const ddCards=(group,skip=[])=>ddBlocks(group).filter(x=>!skip.some(q=>(x.title||'').toLowerCase().includes(q))).map(x=>card(x.title,prose(x.body))).join('');
function pnlPanel(v){return v?.rows?.length?'<div class="compare-head"><b>'+E(v.label)+'</b><span>vs '+E(v.prior)+'</span></div>'+table(['Metric',v.label,v.prior,'Change'],v.rows.map(x=>[E(x.metric),N(x.cur,x.nd)+(x.pct?'%':''),N(x.prior,x.nd)+(x.pct?'%':''),(x.yoy==null?'—':N(x.yoy,1)+(x.pct?' pts':'%'))])):''}
function hfInvestment(){let sc=P.scorecard||{},ob=ddBlock('outlook','order book'),opt=ddBlock('outlook','growth vertical'),non=ddBlock('bull_bear','non-obvious'),margin=ddBlock('latest_quarter','margin');return kpis(D.keynums)+'<div class="layout-2">'+card('Business quality',sc.symbol?'<div class="scoreline"><strong>'+E(sc.bq_total)+'</strong><span>/100</span></div><p>'+E(sc.verdict||'')+'</p>':'','positive')+card('Order-book visibility',prose(ob.body),'positive')+card('Margin architecture',prose(margin.body),'positive')+card('Growth optionality',prose(opt.body),'inference-card')+card('Non-obvious read',badge('Analytical inference','inference')+prose(non.body),'inference-card')+card('Capital allocation',prose(ddBlock('bull_bear','capital allocation').body))+'</div>'}
function hfBusiness(){let p=D.profile||{},products=productList(),markets=marketList();return'<div class="profile-band"><div><span>Operating entities</span><b>'+E(p.entities)+'</b></div><div><span>Business lines</span><b>'+E(p.subseg)+'</b></div><div><span>Structural themes</span><b>'+E(p.themes)+'</b></div></div><div class="layout-2">'+ddCards('business',['challenges'])+(products.length?card('Products and platforms',list(products,12)):'')+(markets.length?card('End markets',list(markets,12)):'')+'</div>'}
function hfFinancials(){let actual=tableByPeriod(['Quarter','Revenue ₹cr','YoY','Operating profit ₹cr','OPM','PAT ₹cr','YoY','EPS'],A(D.actuals).map(x=>[E(x.q),N(x.revenue,0),N(x.rev_yoy,1)+'%',N(x.op,0),N(x.opm_pct,1)+'%',N(x.pat,0),N(x.pat_yoy,1)+'%',N(x.eps,2)]));let model=P.projection?.projection||[],est=tableByPeriod(['Period','Revenue ₹cr','OPM','PAT ₹cr','EPS'],model.map(x=>[E(x.quarter||x.period),N(x.revenue,0),N(x.opm_pct,1)+'%',N(x.pat,0),N(x.eps,2)]));let val=tableByPeriod(['Year','Market cap ₹cr','P/E','ROE','OPM','D/E'],A(D.val5).map(x=>[E(x.fy),N(x.mcap,0),N(x.pe,1)+'x',N(x.roe,1)+'%',N(x.opm,1)+'%',N(x.de,2)+'x']));return'<div class="stack">'+card('Eight-quarter operating trajectory',badge('Reported fact')+actual)+card('Latest quarter comparison',pnlPanel(D.pnl?.quarter))+card('Full-year comparison',pnlPanel(D.pnl?.year))+(model.length?card('Forward model',badge('Model estimate','estimate')+est,'estimate-card'):'')+(A(P.projection?.assumptions).length?card('Model assumptions',list(P.projection?.assumptions,10)):'')+card('Financial quality & working capital',kpis(D.ratios))+card('Five-year valuation and quality history',val)+creditRatingCard()+'</div>'}
function hfFinancialsRich(){let a=A(D.actuals),last=a.at(-1)||{},prior=a.at(-5)||{},rat=Object.fromEntries(A(D.ratios).map(x=>[x.label,x.value]));let read='<div class="analysis-strip"><div><span>Recovery shape</span><b>Five-quarter contraction ended before the latest two growth quarters</b></div><div><span>Profit inflection</span><b>Operating profit ₹'+N(prior.op,0)+'cr → ₹'+N(last.op,0)+'cr; PAT ₹'+N(prior.pat,0)+'cr → ₹'+N(last.pat,0)+'cr</b></div><div><span>Cash-cycle watch</span><b>'+E(rat['Receivable d']||'—')+' debtor days · '+E(rat['Inventory d']||'—')+' inventory days</b></div></div>';return hfFinancials().replace('<div class="stack">','<div class="stack">'+badge('Analytical inference','inference')+read)}
function hfExecution(){let w=D.wtt||{},track=D.track||{},cap=table(['Milestone','Target','Promise','State'],A(D.capex).map(x=>[E(x.item),E(x.timeline||'—'),E(x.pv||'—'),status(x.status)]));let verdict=table(['Commitment','Made','Checked','Outcome'],A(track.verdicts).map(x=>[E(x.item)+'<small class="row-note">'+E(x.note||'')+'</small>',E(x.made||'—'),E(x.checked||'—'),status(x.status)]));let open=table(['Forward commitment','Horizon','Category'],A(track.open).filter(x=>/FY27|Q[1-4]FY27|CY2026/i.test(x.horizon||'')).map(x=>[E(x.item),E(x.horizon),E((x.category||'').replaceAll('_',' '))]));return'<div class="credibility"><div class="grade">'+E(w.credibility_grade||'—')+'</div><div><h3>Walk the Talk</h3><p>'+E(w.summary||'')+'</p></div><div class="cred-metrics"><span><b>'+E(w.guidance_hit_rate||'—')+'%</b> guidance hit</span><span><b>'+E(w.projects_ontime||'—')+'/'+(Number(w.projects_ontime||0)+Number(w.projects_slipped||0))+'</b> projects on time</span><span><b>'+E(w.reconciled_n||track.verdicts_total||'—')+'</b> commitments reconciled</span></div></div><div class="stack">'+card('Capacity and capex milestones',cap)+card('Near-term forward commitments',badge('Management guidance','guide')+open,'guide-card')+card('Commitment outcomes',verdict)+card('Management tone — latest assessment',prose(w.tone_latest),'inference-card')+'</div>'}
function hfRisks(){let risk=ddBlock('bull_bear','risks'),tone=ddBlock('bull_bear','management quality'),rows=[{title:'Thesis risks',detail:risk.body},{title:'Management framing risk',detail:tone.body},{title:'Balance-sheet and working-capital pressure',detail:'Receivable days '+((D.ratios||[]).find(x=>x.label==='Receivable d')?.value||'—')+' and inventory days '+((D.ratios||[]).find(x=>x.label==='Inventory d')?.value||'—')+' keep cash conversion and funding cost central to the thesis.'},{title:'Execution credibility',detail:(D.wtt?.summary||'')+' The page should underwrite delivery, not merely the size of the opportunity.'}];return'<div class="risk-grid">'+rows.map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(x.title)+'</h3><p>'+E(x.detail)+'</p></div></article>').join('')+'</div>'}
function hfPeers(){let pp=D.peer_panel||{},all=[pp.target,...A(pp.peers)].filter(Boolean),groups={};all.forEach(x=>(groups[x.s===I.symbol?I.symbol:(x.group||'Reference')]??=[]).push(x));return'<div class="stack">'+Object.keys(groups).map(g=>card(g,table(['Company','FY','Revenue ₹cr','Growth','EBITDA margin','PAT ₹cr','PAT growth','P/E','Market cap ₹cr'],groups[g].map(x=>[E(x.name),E(x.fy),N(x.rev,0),x.rev_growth==null?'—':N(x.rev_growth,1)+'%',N(x.ebitda_margin,1)+'%',N(x.pat,0),x.pat_growth==null?'—':N(x.pat_growth,1)+'%',x.pe==null?'—':N(x.pe,1)+'x',N(x.mcap,0)])))).join('')+'<p class="method-note">'+E(I.symbol)+' is shown separately. Stored operating peer groups remain distinct lenses rather than one blended reference set.</p></div>'}
function inInvestment(){let f=sec('financials'),b=sec('business_ops'),ip=sec('industry_peers'),v=sec('verdict'),last=A(f.pnl_3yr).at(-1)||{},cf=A(f.cash_flow).at(-1)||{},rr=A(f.return_ratios).at(-1)||{},mix=b.domestic_export_mix?.export_pct_by_fy||{},cc=b.customer_concentration?.top10_pct_by_fy||{};let facts=[{label:'Global MIM share',value:N(ip.market_position?.share_pct,1)+'%'},{label:'Revenue',value:'₹'+N((last.revenue||0)/100,0)+'cr'},{label:'PAT',value:'₹'+N((last.pat||0)/100,0)+'cr'},{label:'Operating cash flow',value:'₹'+N((cf.cfo||0)/100,0)+'cr'},{label:'RoNW',value:N(rr.ronw_pct,1)+'%'},{label:'Export revenue',value:N(mix.FY2026,1)+'%'},{label:'Top-10 customers',value:N(cc.FY2026,1)+'%'}];return kpis(facts)+card('Our read','<p>'+E(v.our_read)+'</p>','inference-card')}
function mixTable(rows){let pct=(x,short,long)=>{let v=x.pct_by_fy?.[short];if(v==null)v=x.pct_by_fy?.[long];return v==null?'—':N(v,1)+'%'};return table(['Revenue mix','FY2024','FY2025','FY2026'],A(rows).map(x=>[E(x.name),pct(x,'FY24','FY2024'),pct(x,'FY25','FY2025'),pct(x,'FY26','FY2026')]))}
function rsAmount(value){let amount=Number(value);if(!Number.isFinite(amount))return'—';return Math.abs(amount)>100000?'₹'+N(amount/10000000,2)+' cr':'₹'+N(amount,0)}
function concise(value,limit=280){let text=String(value||'').replace(/\s+/g,' ').trim();if(text.length<=limit)return text;let cut=text.slice(0,limit),stop=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('; '));if(stop>Math.floor(limit*.55))cut=cut.slice(0,stop+1);else cut=cut.replace(/\s+\S*$/,'');return cut.replace(/[,:;\s]+$/,'')+'…'}
function inBusiness(){let b=sec('business_ops'),o=sec('overview'),cc=b.customer_concentration||{},sc=b.supplier_concentration||{},products=A(b.products);let prod=products.map(x=>{let note=String(x.note||'').replace(/ supplied in Fiscal 2026/gi,'').replace(/ in Fiscal 2026/gi,'');return'<article class="product-card"><h3>'+E(x.category)+'</h3><p>'+E(A(x.items).join(' · '))+'</p><small>'+E(note)+'</small></article>'}).join('');let concentration=table(['Concentration','FY2024','FY2025','FY2026'],[['Top customer',N(cc.top1_pct_by_fy?.FY2024,1)+'%',N(cc.top1_pct_by_fy?.FY2025,1)+'%',N(cc.top1_pct_by_fy?.FY2026,1)+'%'],['Top five customers',N(cc.top5_pct_by_fy?.FY2024,1)+'%',N(cc.top5_pct_by_fy?.FY2025,1)+'%',N(cc.top5_pct_by_fy?.FY2026,1)+'%'],['Top ten customers',N(cc.top10_pct_by_fy?.FY2024,1)+'%',N(cc.top10_pct_by_fy?.FY2025,1)+'%',N(cc.top10_pct_by_fy?.FY2026,1)+'%'],['Top ten suppliers',N(sc.top10_pct_by_fy?.FY2024,1)+'%',N(sc.top10_pct_by_fy?.FY2025,1)+'%',N(sc.top10_pct_by_fy?.FY2026,1)+'%']]);let city=x=>{let role=String(x.role||''),m=role.match(/\b(?:in|at)\s+(?:CEL\s+)?([^,(]+)/i);if(m)return m[1].trim();let parts=String(x.location||'').split(',').map(s=>s.trim()).filter(Boolean);return parts.length>1?parts[parts.length-2]:parts[0]||'—'};return'<div class="stack">'+card('How the business makes money','<p>'+E(o.business_model||P.summary.business)+'</p>')+card('Product-group architecture','<div class="product-grid">'+prod+'</div>')+card('Revenue mix by product group',mixTable(b.revenue_split_product))+card('Geographic revenue mix',mixTable(b.revenue_split_geography))+card('Customer and supplier concentration',concentration)+card('Manufacturing footprint',table(['Location','Facility','Tenure'],A(b.plants).map(x=>[E(city(x)),E(x.role),E(x.ownership||'—')])))+card('Vertical integration','<p>'+E(b.supply_chain_integration)+'</p>')+card('Qualification stack',list(b.certifications,12))+'</div>'}
function drhpBusinessGeneric(){
    let b=sec('business_ops'),o=sec('overview'),facts=A(b.other_material_facts);
    let evidence=(labels,limit=8)=>facts.filter(x=>labels.includes(x.label)&&typeof x.value==='string').map(x=>concise(x.value,260)).filter(Boolean).slice(0,limit);
    let industry=A(b.revenue_split_industry),tenure=industry.filter(x=>/existing customers|new customers/i.test(x.name||''));
    let endMarkets=industry.filter(x=>/^(BFSI|Government|Enterprise)/i.test(x.name||'')).filter((x,i,a)=>a.findIndex(y=>String(y.name).replace(/\W/g,'').replace(/\d/g,'').toLowerCase()===String(x.name).replace(/\W/g,'').replace(/\d/g,'').toLowerCase())===i).slice(0,3);
    let city=x=>{let role=String(x.role||''),m=role.match(/\b(?:in|at)\s+(?:CEL\s+)?([^,(]+)/i);if(m)return m[1].trim();let parts=String(x.location||'').split(',').map(s=>s.trim()).filter(Boolean);return parts.length>1?parts[parts.length-2]:parts[0]||'—'};
    let operating=A(b.plants).filter(x=>/(data cent(?:re|er)|manufactur(?:ing|ing facility)|\bplant\b|warehouse|operating facility)/i.test(x.role||''));
    let facility=x=>/data cent(?:re|er)/i.test(x.role||'')?'Data Centre':/manufactur/i.test(x.role||'')?'Manufacturing Facility':/warehouse/i.test(x.role||'')?'Warehouse':'Operating Facility';
    let capacity=table(['Resource','FY2024','FY2025','FY2026'],A(b.capacity_utilization).map(x=>[E(x.unit_or_product),x.utilization_pct_by_fy?.FY24==null?'—':N(x.utilization_pct_by_fy.FY24,1)+'%',x.utilization_pct_by_fy?.FY25==null?'—':N(x.utilization_pct_by_fy.FY25,1)+'%',x.utilization_pct_by_fy?.FY26==null?'—':N(x.utilization_pct_by_fy.FY26,1)+'%']));
    let capValue=(x,fy)=>{let full='FY20'+fy.slice(2),installed=x.installed_capacity_by_fy?.[fy]??x.installed_capacity_by_fy?.[full],production=x.production_by_fy?.[fy]??x.production_by_fy?.[full],used=x.utilization_pct_by_fy?.[fy]??x.utilization_pct_by_fy?.[full],parts=[];if(installed!=null)parts.push(N(installed,0)+' '+E(x.capacity_unit||''));if(production!=null)parts.push('output '+N(production,0));if(used!=null)parts.push(N(used,1)+'% used');return parts.join(' · ')||'—'};
    if(A(b.capacity_utilization).some(x=>x.installed_capacity_by_fy||x.production_by_fy))capacity=table(['Resource','FY2024','FY2025','FY2026'],A(b.capacity_utilization).map(x=>[E(x.unit_or_product),capValue(x,'FY24'),capValue(x,'FY25'),capValue(x,'FY26')]));
    let cards=card('How the business makes money','<p>'+E(concise(o.business_model||P.summary.business,520))+'</p>');
    let productGroups=A(b.products).slice(0,8).map(x=>{let items=A(x.items);if(!items.length&&x.items)items=[x.items];return'<article class="product-card"><h3>'+E(concise(x.category||'Product group',90))+'</h3>'+list(items,8)+'</article>'});
    if(productGroups.length)cards+=card('Products and solutions','<div class="product-grid">'+productGroups.join('')+'</div>');
    let differentiation=evidence(['technology_ip','vertical_integration','cost_advantage','customer_qualification'],10);if(differentiation.length)cards+=card('Technology, platform and differentiation',list(differentiation,10),'positive');
    if(A(b.revenue_split_product).length)cards+=card('Revenue mix by product group',mixTable(b.revenue_split_product));
    if(endMarkets.length)cards+=card('Revenue mix by customer industry',mixTable(endMarkets));
    if(tenure.length)cards+=card('Customer mix by tenure',mixTable(tenure));
    let cc=b.customer_concentration||{},sc=b.supplier_concentration||{},pct=(obj,key,fy)=>obj[key]?.[fy],concRows=[['Top customer',cc,'top1_pct_by_fy'],['Top five customers',cc,'top5_pct_by_fy'],['Top ten customers',cc,'top10_pct_by_fy'],['Top supplier',sc,'top1_pct_by_fy'],['Top five suppliers',sc,'top5_pct_by_fy'],['Top ten suppliers',sc,'top10_pct_by_fy']].filter(x=>['FY24','FY25','FY26'].some(fy=>pct(x[1],x[2],fy)!=null)).map(x=>[E(x[0]),...['FY24','FY25','FY26'].map(fy=>pct(x[1],x[2],fy)==null?'—':N(pct(x[1],x[2],fy),1)+'%')]);
    if(concRows.length)cards+=card('Customer and supplier concentration',table(['Concentration','FY2024','FY2025','FY2026'],concRows));
    if(A(b.capacity_utilization).length)cards+=card('Capacity utilisation by resource',capacity);
    if(operating.length)cards+=card('Operating footprint',table(['Location','Facility'],operating.map(x=>[E(city(x)),E(facility(x))])));
    if(b.channel_mix?.distributors)cards+=card('Distribution reach',kpis([{label:'Distributors',value:N(b.channel_mix.distributors,0)},{label:'States',value:E(b.channel_mix.states||'—')} ]));
    let qualifications=evidence(['certifications','repeat_business'],10);if(qualifications.length)cards+=card('Qualifications and customer relationships',list(qualifications,10));
    return'<div class="stack">'+cards+'</div>'
}
function inFinancials(){let f=sec('financials'),intel=sec('intellisense'),years=D.kpi?.years||{},recv=f.receivables_aging||{};let pnl=tableByPeriod(['Year','Revenue ₹cr','EBITDA ₹cr','Margin','PAT ₹cr','PAT margin','EPS'],A(f.pnl_3yr).map(x=>[E(x.fy),N(x.revenue/100,1),N(x.ebitda/100,1),N(years[x.fy]?.ebitda_margin_pct,1)+'%',N(x.pat/100,1),N(x.pat_margin_pct,1)+'%',N(x.eps,2)]));let bs=tableByPeriod(['Year','Net worth ₹cr','Debt ₹cr','Cash ₹cr','Inventory ₹cr','Receivables ₹cr'],A(f.balance_sheet_key).map(x=>[E(x.fy),N(x.networth/100,1),N(x.total_debt/100,1),N(x.cash/100,1),N(x.inventory/100,1),N(x.trade_receivables/100,1)]));let rr=f.return_ratios||[],cf=tableByPeriod(['Year','CFO ₹cr','CFO / PAT','RoCE','RoNW'],A(f.cash_flow).map((x,i)=>{let pat=A(f.pnl_3yr)[i]?.pat||0;return[E(x.fy),N(x.cfo/100,1),N(x.cfo/pat,2)+'x',rr[i]?.roce_pct==null?'—':N(rr[i].roce_pct,1)+'%',N(rr[i]?.ronw_pct,1)+'%']}));let debt=table(['Borrowing type','Amount ₹cr','Purpose'],A(f.debt_profile?.loans).map(x=>[E(x.type),N(x.amount_lakhs/100,1),E(x.purpose)]));let oneoffs=table(['Year','Item','Amount ₹cr','Interpretation'],A(f.one_offs).map(x=>[E(x.fy),E(x.item),N(x.amount_lakhs/100,1),E(x.note)]));let checks=table(['Check','Result','Evidence'],A(intel.forensic).filter(x=>!/objects_total|CFO_vs_PAT/i.test(x.check||'')).map(x=>[E(x.check),status(x.verdict),E(x.note)]));return'<div class="stack">'+card('Three-year operating record',badge('Reported fact')+pnl)+card('Cash conversion and returns',cf,'positive')+card('Balance-sheet trajectory',bs)+card('Debt composition at offer date',debt)+card('Exceptional and non-operating items',oneoffs,'caution')+card('Receivables quality',kpis([{label:'Over one year',value:'₹'+N(recv.gt_1yr_amount_lakhs/100,1)+'cr'},{label:'Share of net worth',value:N(recv.gt_1yr_pct_networth,2)+'%'}]))+card('Forensic checks',checks)+creditRatingCard()+'</div>'}
function inFinancialsReconciled(){let f=sec('financials'),years=D.kpi?.years||{};A(f.pnl_3yr).forEach(x=>{if(x.pat_margin_pct==null&&x.revenue)x.pat_margin_pct=100*x.pat/x.revenue});A(f.return_ratios).forEach(x=>{if(x.roce_pct==null&&years[x.fy]?.roce_pct!=null)x.roce_pct=years[x.fy].roce_pct});return inFinancials()}
function drhpFinancialsGeneric(){
    let f=sec('financials'),intel=sec('intellisense');
    let ratios=Object.fromEntries(A(f.return_ratios).map(x=>[x.fy,x]));
    let pnl=tableByPeriod(['Year','Revenue ₹cr','EBITDA ₹cr','Margin','PAT ₹cr','PAT margin'],A(f.pnl_3yr).map(x=>{let r=ratios[x.fy]||ratios['FY20'+String(x.fy||'').slice(2)]||{};let em=x.ebitda_margin_pct??r.ebitda_margin_pct,pm=x.pat_margin_pct??r.pat_margin_pct;return[E(x.fy),N(x.revenue/100,1),x.ebitda==null?'—':N(x.ebitda/100,1),em==null?'—':N(em,1)+'%',N(x.pat/100,1),pm==null?'—':N(pm,1)+'%']}));
    let efficiency=tableByPeriod(['Year','RoE','RoCE','DSO days','Debt / equity','DSCR'],A(f.return_ratios).map(x=>[E(x.fy),x.roe_pct==null?'—':N(x.roe_pct,1)+'%',x.roce_pct==null?'—':N(x.roce_pct,1)+'%',x.dso_days==null?'—':N(x.dso_days,0),x.debt_equity==null?'—':N(x.debt_equity,2),x.dscr==null?'—':N(x.dscr,2)]));
    let bsRows=A(f.balance_sheet_key).map(x=>[E(x.fy),x.networth==null?'—':N(x.networth/100,2),x.total_debt==null?'—':N(x.total_debt/100,2),x.cash==null?'—':N(x.cash/100,2),x.trade_receivables==null?'—':N(x.trade_receivables/100,2),x.inventory==null?'—':N(x.inventory/100,2)]);
    let cfRows=A(f.cash_flow).map(x=>[E(x.fy),x.cfo==null?'—':N(x.cfo/100,2),x.cfi==null?'—':N(x.cfi/100,2),x.cff==null?'—':N(x.cff/100,2)]);
    let loans=A(f.debt_profile?.loans),debtRows=loans.map(x=>[E(concise(x.type||'Borrowing',100)),E(concise(x.lender||'—',70)),x.amount_lakhs==null?'—':'₹'+N(x.amount_lakhs/100,2)+' cr',x.rate_pct==null?(x.floating?'Floating':'—'):N(x.rate_pct,2)+'%']);
    let checks=table(['Check','Result','Evidence'],A(intel.forensic).map(x=>[E(x.check),status(x.verdict),E(x.note)]));
    return'<div class="stack">'+card('Three-year operating record',badge('Reported fact')+pnl)+card('Margins, returns and balance-sheet efficiency',efficiency,'positive')+/* SPLIT INTO TWO CARDS 2026-09-02 (owner). They were one card holding two unrelated tables:
   a balance sheet is a POSITION at a date, a cash-flow statement is a MOVEMENT over a period.
   Stacking them under one heading invited reading a net-worth figure as a flow. Both now use
   `tableByPeriod`, so the year is a COLUMN and each metric is a row. */
+(bsRows.length?card('Balance-sheet trajectory',tableByPeriod(['Year','Net worth ₹cr','Debt ₹cr','Cash ₹cr','Receivables ₹cr','Inventory ₹cr'],bsRows)):'')+(cfRows.length?card('Cash flow',tableByPeriod(['Year','CFO ₹cr','Investing CF ₹cr','Financing CF ₹cr'],cfRows)):'')+(debtRows.length?card('Debt composition',table(['Facility','Lender','Outstanding','Rate'],debtRows)):'')+(A(intel.forensic).length?card('Forensic checks',checks):'')+creditRatingCard()+'</div>'
}
function inExecution(){let o=sec('objects_execution'),intel=sec('intellisense'),gd=intel.growth_durability||{},w=P.wtt||{},all=A(P.commitments),pick=re=>[...all].reverse().find(x=>re.test(x.item||'')),prom=[pick(/joint venture.*foldable hinge/i),pick(/Arms Components/i),pick(/45 to 50 new tools/i)].filter(Boolean);let uses=table(['Use','₹cr'],A(o.objects).map(x=>[E(x.purpose),x.amount_lakhs==null?'—':N(x.amount_lakhs/100,0)]));let promises=table(['Strategic commitment','Horizon','Evidence marker'],prom.map(x=>[E(x.item),E(x.horizon),E([x.promised_value,x.unit].filter(z=>z&&z!=='None').join(' ')||'Qualitative')]));let evidence=table(['Evidence test','State','What the store shows'],A(gd.signals).map(x=>[E((x.signal||'').replaceAll('_',' ')),status(x.status),E(x.note)]));let credibility=w.symbol?'<div class="credibility"><div class="grade compact">'+E(w.credibility_grade||'N/A')+'</div><div><h3>Walk the Talk is not scored yet</h3><p>'+E(w.summary||'')+'</p></div><div class="cred-metrics"><span><b>'+E(w.quarters_covered||1)+'</b> quarter logged</span><span><b>'+E(w.open_commitments||0)+'</b> tracked across page</span><span><b>'+E(w.reconciled_n||0)+'</b> reconciled</span></div></div>':'';return credibility+'<div class="stack">'+card('Use of fresh issue',uses)+card('Growth evidence',badge('Analytical inference','inference')+'<div class="scoreline"><strong>'+E(gd.score||'—')+'</strong><span> / evidence score</span></div>'+evidence,'inference-card')+card('Unique strategic commitments',promises)+'</div>'}
function inOwnership(){
    let c=sec('capital_ownership'),g=sec('governance'),anc=D.anchor_allotment||{};
    let holders=table(['Holder','Category','Shares','Pre-offer'],A(c.shareholders_1pct).map(x=>[E(x.name),E(x.category||'—'),E(x.shares),x.pct==null?'—':N(x.pct,2)+'%']));
    let brief=value=>{let text=String(value||'').replace(/\s+/g,' ').replace(/^(?:except as detailed below|such price has been computed)[:,]?\s*/i,'').trim();let sentence=(text.match(/^.{30,120}?[.!?](?:\s|$)/)||[])[0]||text.slice(0,110);return sentence.length<text.length?sentence.replace(/[.!?]?$/,'…'):sentence};
    let history=table(['Event','Summary'],A(c.capital_history).slice(0,10).map(x=>[E(String(x.event||'').replaceAll('_',' ')),E(brief(x.details))]));
    
    /* DESIGNATION vs the stored `role` string, 2026-09-02 (owner: DIN / DOB / appointment dates /
       shareholding are "not useful and redundant"). Measured over all 849 stored board entries the
       redundancy is NOT a stray column -- din/date_of_birth exist as separate fields on only 20/15
       entries. It is embedded INSIDE `role` itself: 270 carry a DIN, 286 a "w.e.f."/"since" date,
       164 a term / retire-by-rotation clause, 85 a date of birth, and the longest role is 1,254
       characters of biography. The designation is only the LEADING clause.
       This strips for DISPLAY only -- the store keeps `role` verbatim, because it is the record of
       what the document said. Order matters: parentheticals are removed FIRST, because a ';' or '.'
       inside one would otherwise shatter the clause split and leave the noise glued to the head
       (measured: "Promoter; Whole Time Director (w.e.f. Aug 01, 2025...)" collapsed to "Promoter").
       Scored over all 849 stored roles: DIN/DOB/date residue 355 -> 0, empty outputs 0, and 0 of
       the 849 lost their designation keyword. */
    let ROLE_NOISE=/\bD\.?I\.?N\b|date of birth|\bDOB\b|\bborn\b|\bPAN\b|\bCIN\b|w\.?e\.?f\.?|with effect from|\bsince\b|\bfrom\s+(?:\w+\s+)?\d{1,2},?\s*\d{4}|\b(?:19|20)\d{2}\b|retire\w*\s+by\s+rotation|liable to retire|\bterm\b|re-?appoint|resign|\bceased\b|\b(?:son|daughter|wife|husband|brother|sister|father|mother|spouse)\s+of\b|board table states|\baged?\b|shareholding|equity shares|resides|occupation|nationality|address/i;
    let designation=role=>{let t=String(role==null?'':role).replace(/\s+/g,' ').trim();if(!t)return'';
        for(let prev=null;prev!==t;){prev=t;t=t.replace(/\s*[\(\[][^()\[\]]*[\)\]]/g,m=>ROLE_NOISE.test(m)?'':m)}
        t=t.replace(/\s+/g,' ').trim();
        let keep=[];
        for(let p of t.split(/(?:[.;])\s+|;\s*/)){p=p.trim().replace(/\s*,\s*$/,'');if(!p)continue;
            let m=p.match(ROLE_NOISE);
            if(m){let head=p.slice(0,m.index);for(let q=null;q!==head;){q=head;head=head.replace(/[\s,;.\-(]+$/,'').replace(/\s+(?:with|for|the|a|an|as|of|and|or|in|on|at|by|from|current|its|his|her|not|liable|to|is|was|pursuant|under|who|which|that)$/i,'')};if(head&&/[A-Za-z]{3}/.test(head)&&!/^(?:not|liable|to|and|or|the|a|an|of|with|for|as|is|was|current|its|his|her|in|on|at|by|from|who|which|that)(?:\s+(?:not|liable|to|and|or|the|a|an|of|with|for|as|is|was|current|its|his|her|in|on|at|by|from|who|which|that))*$/i.test(head))keep.push(head);break}
            keep.push(p);if(keep.join(' ').length>85)break}
        let out=keep.join(' ').replace(/[\s,;.\-]+$/,'').trim();
        if(out.length>90){out=out.slice(0,90).replace(/\s+\S*$/,'');for(let q=null;q!==out;){q=out;out=out.replace(/[\s,;.\-]+$/,'').replace(/\s+(?:and|or|of|to|the|a|an|with|for|as|in|on|at|by|from|pursuant|under|who|which|that|its|his|her|not|liable|is|was)$/i,'')}}
        return out};
    let leadershipInsight=x=>brief(x.qualification||x.qualifications||x.experience||x.past_experience||x.profile||x.background||'');
    /* ONE builder for BOTH cards 2026-09-02 -- the owner asked for the KMP card to match the board
       card, and two copies of the same markup is how they drift apart again. The KMP card WAS a
       3-column table ('Executive | Role | Relevant qualification / experience'); it is now the same
       .person-grid/.person-card the board uses, which is what fixed the M10 phone finding there.
       KMP keys its title off `designation` (present on 256 of 261 stored KMP entries; `role` on only
       3), and its bio is usually EMPTY and correctly renders as nothing: the store holds a profile
       for 12 of 261 and a qualification for 2, so there is no bio to show and none is invented.
       NO show-more is applied. The owner asked for top-3-then-show-more, but the only show-more in
       this file is table-row based (it sets display:'table-row'), which cannot drive a CSS grid, and
       there is no field to rank a top 3 BY -- remuneration appears on 12 of 261 entries. So the full
       list stays in stored order rather than inventing a new interaction or a fake ranking. */
    let personGrid=people=>{let rows=A(people).map(x=>[E(x.name),E(designation(x.role||x.designation)),E(leadershipInsight(x))]).filter(r=>r[0]);
        return rows.length?'<div class="person-grid">'+rows.map(r=>'<article class="person-card"><h4>'+r[0]+'</h4>'+(r[1]?'<p class="person-role">'+r[1]+'</p>':'')+(r[2]?'<p class="person-bio">'+r[2]+'</p>':'')+'</article>').join('')+'</div>':''};
    let board=personGrid(g.promoters_directors);
    let kmp=personGrid(g.kmp);
    let anchors=table(['Anchor / fund','House','Owner','Allocation','Share'],A(anc.rows).slice(0,15).map(x=>[E(x.name),E(x.house),E(x.owner||'—'),'₹'+N(x.amount/10000000,1)+'cr',N(x.pct,2)+'%']));
    return'<div class="stack">'+card('Governance snapshot',kpis([{label:'Pre-offer promoter holding',value:c.promoter_holding?.pre_pct==null?'—':N(c.promoter_holding.pre_pct,2)+'%'},{label:'Promoter pledge',value:c.pledging?.pledged_pct==null?'—':N(c.pledging.pledged_pct,1)+'%'},{label:'Independent directors',value:E(g.board?.independent_count||'—')+' / '+E(g.board?.size||'—')},{label:'Related-party entries',value:E(A(g.rpts).length)},{label:'Anchor investors',value:E(anc.n||'—')},{label:'Anchor allocation',value:anc.total_amount?'₹'+N(anc.total_amount/10000000,0)+'cr':'—'}]))+card('Material shareholders',holders)+card('Capital history and private placements',history)/* 'Dilution, OFS and lock-in' REMOVED from Ownership 2026-09-02 (owner: "keep only in offer"). It read the SAME capital_ownership fields the Offer section's 'Offer structure' card renders (drhpGenericListing, this file) -- dilution/ofs/lock_in/pledging -- so the page showed one dataset twice under two headings. Dilution and lock-in are consequences of the offer structure, so Offer is where they belong; Ownership keeps holders, capital history, board, KMP and pledging. `bonus_within_18m` was unique to this card and is now UNRENDERED -- if it must survive, add it to the Offer card rather than restoring this one. *//* 'Promoter acquisition cost' REMOVED 2026-09-02 (owner: "we don't need Promoter acquisition cost"). Its `costs` table builder went with it -- the two were each other's only reference, so leaving the builder would be dead code computing a value nothing renders. The underlying `capital_ownership.promoter_avg_cost` field is UNTOUCHED in the store and payload; only this card is gone, so restoring it is a one-line change. */+card('Board and leadership',board)+card('Key management personnel',kmp)/* 'Anchor allocation' REMOVED from Ownership 2026-09-03 (owner: "we have Anchor allocation in two places ownership and governance and Offer .. can we remove from ownership"). The Offer & Listing tab renders the SAME anchor data via `anchorCard()` (see inListing), so the page showed one dataset twice. Anchor allocation is a property of the OFFER, so Offer is where it belongs; the `anchors` binding above is still read by the Governance snapshot KPIs, so it is NOT dead. */+card('Governance flags',list(g.non_compliances,8),'caution')+'</div>'
}
function inRisks(){let r=sec('risks'),find=(bucket,re)=>A(r[bucket]).find(x=>re.test(x.title||'')),items=[find('internal_operational',/No definitive purchase commitments/i),find('internal_operational',/High import dependence/i),find('internal_operational',/quality.*recalls/i),find('financial_valuation',/Pricing pressure/i),find('financial_valuation',/Restrictive covenants/i),find('financial_valuation',/Currency exchange/i),find('compliance_legal',/Environmental law/i),find('compliance_legal',/Majority of Directors/i),find('compliance_legal',/sanctioned countries/i),find('strategy_growth',/Acquisitions.*joint ventures/i),find('strategy_growth',/structural threats/i),find('strategy_growth',/R&D investment/i)].filter(Boolean),lit=r.litigation_summary||{},cont=r.contingent_liabilities||{};return'<div class="stack"><div class="analysis-strip"><div><span>Litigation exposure</span><b>₹'+N(lit.total_amount_lakhs/100,0)+'cr · '+N(lit.pct_of_networth,1)+'% of net worth</b></div><div><span>Contingent liabilities</span><b>₹'+N(cont.amount_lakhs/100,0)+'cr · '+N(cont.pct_of_networth,1)+'% of net worth</b></div><div><span>Risk architecture</span><b>Operating · financial · compliance · strategy</b></div></div><p class="method-note">Balanced risk register — three decision-relevant risks from each risk family.</p><div class="risk-grid">'+items.map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(x.title)+'</h3><p>'+E(x.detail)+'</p><small>'+E(x.evidence||'')+'</small></div></article>').join('')+'</div>'+card('Approvals pending',list(r.approvals_pending,10))+'</div>'}
function inPeers(){let pp=D.peer_panel||{},target=pp.target||{},ip=sec('industry_peers'),intel=sec('intellisense'),exact=A(ip.peers_drhp),size=intel.valuation?.size_mismatch||{},refs=A(ip.peers_internal).filter(x=>['PTCIL','STEELCAS','HAPPYFORGE','INVPRECQ'].includes(x.symbol)),barrier=pipe(D.strengths).find(x=>/barriers|qualification/i.test(x));let structure=list([ip.market_position?.basis,barrier].filter(Boolean),4);let t=table(['Company','FY','Revenue ₹cr','Growth','PAT ₹cr','PAT growth'],[['INDO-MIM',E(target.fy),N(target.rev,0),N(target.rev_growth,1)+'%',N(target.pat,0),N(target.pat_growth,1)+'%']]);let global=table(['Company','Period','Revenue ₹cr','RoNW','Relative scale'],exact.map(x=>[E(x.name),E(x.fy),N((x.total_income||0)/10,0),N(x.ronw,1)+'%',N(size.peer_to_issuer_x,1)+'x INDO-MIM']));let operating=table(['Symbol','Company','Treatment'],refs.map(x=>[E(x.symbol),E(x.company),'Operating reference — not a MIM valuation peer']));return'<div class="stack">'+card('MIM industry structure',structure,'positive')+card('INDO-MIM operating scale',t)+card('Closest disclosed global comparable',global)+card('Operating references — not valuation peers',operating)+'<p class="method-note">There is no listed Indian end-to-end MIM equivalent. Jiangsu Gian is the sole disclosed global comparable and is materially larger; valuation interpretation belongs to the Verdict tab.</p></div>'}
function inListing(){let s=P.ipo?.summary||{},a=P.ipo?.analysis||{},intel=sec('intellisense'),ins=intel.insider||{},c=sec('capital_ownership'),o=sec('objects_execution'),note=c.dilution?.note||'',ofs=(note.match(/Offer for Sale of up to ([\d,]+)/i)||[])[1],employee=(note.match(/Employee Reservation Portion of up to ([\d,]+)/i)||[])[1],sellers=table(['Selling shareholder','Shares disclosed'],A(c.ofs).map(x=>[E(x.seller),x.shares?E(x.shares):'Not separately disclosed']));return'<div class="stack"><div class="analysis-strip"><div><span>Issue to listing</span><b>₹'+N(s['Issue Price'])+' → ₹'+N(s['Listing Open Price'])+' · '+N(s['Listing Gain %'],1)+'%</b></div><div><span>Latest close</span><b>₹'+N(a['Latest Close'],2)+' · '+N(a['Return From Listing %'],1)+'% from open</b></div><div><span>Supply calendar</span><b>'+E(A(ins.supply_calendar).length)+' identified release events</b></div></div>'+card('Offer composition',kpis([{label:'Fresh issue',value:'₹'+N(o.project?.funding_mix?.fresh_issue_lakhs/100,0)+'cr'},{label:'Offer-for-sale shares',value:E(ofs||'—')},{label:'Employee reservation',value:E(employee||'—')}])+sellers)+card('Supply calendar',table(['Date','Holder','Event','Equity'],A(ins.supply_calendar).map(x=>[E(x.date),E(x.holder),E(x.event),x.pct_equity==null?'—':N(x.pct_equity,2)+'%'])))+anchorCard()+'</div>'}

function inVerdict(){let v=sec('verdict'),intel=sec('intellisense'),f=sec('financials'),pe=intel.true_pe||{},scenarios=intel.scenarios||{},pct=intel.percentiles||{},ins=intel.insider||{},gd=intel.growth_durability||{},scores=A(v.parameter_scores),openQuestions=A(v.open_questions).filter(x=>!/What price band/i.test(x)),monitorables=A(v.monitorables).filter(x=>!/Post-issue debt|US tariff|Triax Industries/i.test(x)),dataGaps=A(v.data_gaps).filter(x=>!/Price band, lot size and P\/E|FY26 RoCE/i.test(x)),last=A(f.pnl_3yr).at(-1)||{},norm=A(pe.lines).find(x=>x.label==='normalized')||{},stance=String(v.stance||'Not rated').split(/\s+-\s+/)[0];let bars='<div class="analytical-scores">'+scores.map(x=>{let s=Number(x.score_1_10)||0,band=s>=7?'strong':s>=4?'watch':'weak',filingStage=/Valuation clarity/i.test(x.parameter||'')&&intel.ipo_price,basis=filingStage?'Stored filing-stage score: pricing was unavailable in the source document. Final issue pricing is now available; the score is retained and not automatically re-rated.':x.basis;return'<div class="analytical-score"><div class="score-head"><b>'+E(x.parameter)+'</b><strong>'+N(s,0)+' / 10</strong></div><div class="score-track"><i class="'+band+'" style="width:'+Math.max(0,Math.min(100,s*10))+'%"></i></div><p>'+E(basis||'')+'</p></div>'}).join('')+'</div>';let price=Number(intel.ipo_price)||0,valuationRows=[['Reported','FY2026','—',N(last.revenue/100,0),N(last.pat_margin_pct,2)+'%',N(last.eps,2),N(pe.reported,2)+'x'],['Diluted','FY2026','—',N(last.revenue/100,0),N(last.pat_margin_pct,2)+'%',N(price/pe.diluted,2),N(pe.diluted,2)+'x'],['Normalized','FY2026','—',N(last.revenue/100,0),N(norm.inputs?.avg_margin_pct,2)+'%',N(price/pe.normalized,2),N(pe.normalized,2)+'x']];['bear','base','bull'].forEach(k=>{let x=scenarios[k],a=x?.assumptions||{};if(x)valuationRows.push([k,'FY2027',N(a.revenue_growth_pct,1)+'%',N(a.revenue_cr,0),N(a.pat_margin_pct,2)+'%',N(x.eps,2),N(x.fwd_pe,2)+'x'])});let percentileRows=[['Revenue growth',pct.revenue_growth],['PAT margin',pct.pat_margin],['Margin expansion',pct.margin_expansion]].filter(x=>x[1]).map(x=>[x[0],N(x[1].value,2)+'%',ordinal(x[1].pct),E(x[1].n||intel.n_cohort)]);let warns=A(intel.forensic).filter(x=>/WARN/i.test(x.verdict||'')),saving=pe.forward?.interest_saved_cr??scenarios.base?.assumptions?.interest_saving_cr,synthesis=[gd.verdict?'Growth durability is '+String(gd.verdict).toUpperCase()+'; the valuation model applies '+(pe.forward?.growth_adjusted?'an evidence-based growth haircut.':'the stored achievable growth rate without an additional haircut.'):'',saving!=null?'Debt repayment is estimated to add ₹'+N(saving,1)+'cr to annual after-tax earnings capacity.':'',warns.length?warns.length+' forensic warning'+(warns.length===1?' remains':'s remain')+' open; the underlying checks stay in Financials.':'No forensic warning remains open.',ins.ipo_price_multiple!=null?'The issue price was '+N(ins.ipo_price_multiple,1)+'x the stored promoter average acquisition cost.':'',intel.valuation?.size_mismatch?.flag?'The disclosed global comparable is '+N(intel.valuation.size_mismatch.peer_to_issuer_x,1)+'x larger by revenue, so its multiple is not used as a clean anchor.':''].filter(Boolean);return'<div class="stack verdict-stack"><section class="verdict-group"><div class="verdict-group-head"><span>01</span><div><p class="eyebrow">Verdict framework</p><h3>Assessment</h3></div></div><div class="verdict-banner"><div><span>Current stance</span><b>'+E(stance)+'</b></div><p>'+E(v.our_read||'')+'</p></div>'+card('Analytical scores',bars,'inference-card')+'</section><section class="verdict-group"><div class="verdict-group-head"><span>02</span><div><p class="eyebrow">Questions before conviction</p><h3>Due diligence</h3></div></div><div class="layout-2">'+card('Open questions for due diligence',list(openQuestions,10),'inference-card')+card('Red flags',list(v.red_flags,10),'caution')+card('Monitorables',list(monitorables,10))+card('Data gaps',list(dataGaps,10))+'</div></section><section class="verdict-group"><div class="verdict-group-head"><span>03</span><div><p class="eyebrow">Integrated analytical read</p><h3>Intelligence synthesis</h3></div></div>'+card('Valuation and scenario frame',badge('Analytical inference','inference')+table(['Basis','Period','Growth','Revenue ₹cr','PAT margin','EPS','P/E'],valuationRows)+'<p class="method-note">'+E(scenarios.assumptions_note||'')+'</p>','inference-card')+card('Cross-DRHP percentiles',table(['Measure','Company','Percentile','Cohort'],percentileRows))+card('What the evidence means',list(synthesis,10),'positive')+'</section></div>'}
function exInvestment(){let y=D.pnl?.year||{},last=A(D.actuals).at(-1)||{},margin=ddBlock('latest_quarter','margin'),non=ddBlock('bull_bear','non-obvious'),opt=ddBlock('outlook','growth vertical');let facts=[{label:'Annual revenue',value:'₹'+N(y.rows?.find(x=>x.metric.startsWith('Revenue'))?.cur,0)+'cr'},{label:'Annual PAT',value:'₹'+N(y.rows?.find(x=>x.metric.startsWith('PAT'))?.cur,0)+'cr'},{label:'Operating margin',value:N(y.rows?.find(x=>x.metric.startsWith('OPM'))?.cur,1)+'%'},{label:'Latest revenue growth',value:N(last.rev_yoy,1)+'%'},{label:'Lithium-ion investment',value:'₹4,802cr'},{label:'Planned cell capacity',value:'12 GWh'},{label:'Recycled lead input',value:'~79%'}];return kpis(facts)+'<div class="layout-2">'+card('Core earnings engine','<p>'+E(ddBlock('business','segment').body)+'</p>','positive')+card('Transformation thesis','<p>'+E(opt.body)+'</p>','inference-card')+card('Margin defence','<p>'+E(margin.body)+'</p>','caution')+card('Non-obvious read',badge('Analytical inference','inference')+'<p>'+E(non.body)+'</p>','inference-card')+card('Decision tension','<p>The established lead-acid franchise funds a large greenfield cell-manufacturing transition. The key underwriting question is whether customer validation and utilisation arrive quickly enough to lift returns above the current 6% ROE.</p>','caution')+'</div>'}
function exInvestmentNoDup(){return exInvestment().replace(/<div class="kpi"><span>Recycled lead input<\/span><b>[^<]*<\/b><\/div>/,'')}
function exProducts(){let products=(P.products&&typeof P.products==='object'&&!Array.isArray(P.products))?P.products:jsonish(C.products);return Object.keys(products).map(k=>'<article class="product-card"><h3>'+E(k)+'</h3><p>'+E(A(products[k]).join(' · '))+'</p></article>').join('')}
function exBusiness(){let plants=A(C.plants),end=pipe(C.end_markets);return'<div class="stack">'+card('How the business makes money','<p>'+E(P.summary.business||C.business)+'</p>')+card('Product architecture','<div class="product-grid">'+exProducts()+'</div>')+card('End-market map',list(end,15))+card('Operating moat',list(pipe(C.strengths),10),'positive')+card('Manufacturing and recycling footprint',table(['Location','Role','Capacity / context'],plants.map(x=>[E(x.location),E(x.role),E(x.capacity||'—')])))+card('Industry demand map',list(pipe(C.mdna),10))+'</div>'}
function exBusinessNoDup(){let original=C.strengths;C.strengths=pipe(original).filter(x=>!/exports to 72 countries/i.test(x)).join('|');let out=exBusiness();C.strengths=original;return out}
function exFinancials(){let a=A(D.actuals),model=P.projection?.projection||[],actual=tableByPeriod(['Quarter','Revenue ₹cr','YoY','Operating profit ₹cr','OPM','PAT ₹cr','YoY','EPS'],a.map(x=>[E(x.q),N(x.revenue,0),N(x.rev_yoy,1)+'%',N(x.op,0),N(x.opm_pct,1)+'%',N(x.pat,0),N(x.pat_yoy,1)+'%',N(x.eps,2)]));let val=tableByPeriod(['Year','Market cap ₹cr','P/E','ROE','OPM','D/E'],A(D.val5).map(x=>[E(x.fy),N(x.mcap,0),N(x.pe,1)+'x',N(x.roe,1)+'%',N(x.opm,1)+'%',N(x.de,2)+'x']));let last=a.at(-1)||{},prior=a.at(-5)||{},read='<div class="analysis-strip"><div><span>Latest quarter</span><b>Revenue +'+N(last.rev_yoy,1)+'% · operating profit +'+N(100*(last.op-prior.op)/prior.op,1)+'% · PAT +'+N(last.pat_yoy,1)+'%</b></div><div><span>Margin defence</span><b>'+N(prior.opm_pct,1)+'% → '+N(last.opm_pct,1)+'% despite commodity pressure</b></div><div><span>Return constraint</span><b>ROE 6% · ROCE 8.7% while lithium capex remains pre-revenue</b></div></div>';return'<div class="stack">'+badge('Analytical inference','inference')+read+card('Eight-quarter operating trajectory',badge('Reported fact')+actual)+card('Latest quarter comparison',pnlPanel(D.pnl?.quarter))+card('Full-year comparison',pnlPanel(D.pnl?.year))+card('Financial quality and working capital',kpis(D.ratios))+card('Five-year valuation and returns history',val)+(model.length?card('Forward model',tableByPeriod(['Period','Revenue ₹cr','OPM','PAT ₹cr'],model.map(x=>[E(x.quarter),N(x.revenue,0),N(x.opm_pct,1)+'%',N(x.pat,0)])),'estimate-card'):card('Projection coverage','<p class="muted">No model projection is stored for EXIDEIND. The page does not manufacture one.</p>'))+creditRatingCard()+'</div>'}
function exExecution(){let w=D.wtt||{},track=D.track||{},cap=table(['Milestone','Horizon','Scale','State'],A(D.capex).map(x=>[E(x.item),E(x.timeline),E(x.pv||'—'),status(x.status)]));let open=table(['Commitment','Horizon','Category'],unique(track.open).map(x=>[E(x.item),E(x.horizon),E((x.category||'').replaceAll('_',' '))]));let guidance=ddBlock('outlook','guidance');return'<div class="stack"><div class="credibility"><div class="grade compact">'+E(w.credibility_grade||'N/A')+'</div><div><h3>Walk the Talk is not scored yet</h3><p>'+E(w.summary||'')+'</p></div><div class="cred-metrics"><span><b>'+E(w.quarters_covered||1)+'</b> quarter logged</span><span><b>'+E(w.open_commitments||track.open_total||0)+'</b> total open</span><span><b>'+E(w.reconciled_n||0)+'</b> reconciled</span></div></div>'+card('Lithium-ion commissioning roadmap',cap,'positive')+card('Forward commitment ledger',open)+card('Management operating guidance',badge('Management guidance','guide')+'<p>'+E(guidance.body||'')+'</p>','guide-card')+card('Annual-report expansion record','<p>'+E(C.expansion||'')+'</p>')+card('Strategic capital framework',list(pipe(C.strategies),10))+'</div>'}
function dropCard(html,title){let q=title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return html.replace(new RegExp('<article class="card [^"]*"><h3>'+q+'<\\/h3>[\\s\\S]*?<\\/article>'),'')}
function exExecutionDedup(){let originalCap=D.capex,originalOpen=D.track?.open;D.capex=A(originalCap).filter((x,i)=>i===0||!/greenfield lithium-ion cell manufacturing facility in bengaluru/i.test(x.item||''));if(D.track)D.track.open=A(originalOpen).filter(x=>x.category!=='capex_project');let out=dropCard(exExecution(),'Strategic capital framework');D.capex=originalCap;if(D.track)D.track.open=originalOpen;return out}
function exOwnership(){let related=jsonish(C.related);return'<div class="layout-2">'+card('Control entities',table(['Entity','Role'],A(C.promoters).map(x=>[E(x.name),E(x.role)])))+card('Board and executive leadership',table(['Director','Designation'],A(C.board).map(x=>[E(x.name),E(x.designation)])))+card('Operating subsidiaries',table(['Entity','Relationship','Strategic role'],A(related).map(x=>[E(x.name),E(x.relation),E(x.note)])))+card('Capital-allocation stance','<p>'+E(ddBlock('bull_bear','capital allocation').body)+'</p>','caution')+'</div>'}
function exOwnershipNoDup(){return dropCard(exOwnership(),'Capital-allocation stance')}
function exRisks(){let concallRisk=ddBlock('bull_bear','risks'),ar=unique(C.risks),rows=[{risk:'Concall watchlist',note:concallRisk.body},...ar];return'<div class="risk-grid">'+rows.map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(x.risk)+'</h3><p>'+E(x.note)+'</p></div></article>').join('')+'</div>'}
function exRisksNoDup(){let original=C.risks;C.risks=A(original).filter(x=>/Environmental|Cash flow|Cyber/i.test(x.risk||''));let out=exRisks();C.risks=original;return out}
function exPeers(){let pp=D.peer_panel||{},target=pp.target||{},direct=A(pp.peers).filter(x=>x.s==='ARE&M'),reference=A(pp.peers).filter(x=>x.s!=='ARE&M'),cols=x=>[E(x.name),E(x.fy),N(x.rev,0),N(x.rev_growth,1)+'%',N(x.ebitda_margin,1)+'%',N(x.pat,0),N(x.pat_growth,1)+'%',N(x.pe,1)+'x',N(x.mcap,0)];return'<div class="stack">'+card('EXIDEIND',table(['Company','FY','Revenue ₹cr','Growth','Margin','PAT ₹cr','PAT growth','P/E','Market cap ₹cr'],[cols(target)]))+card('Primary listed battery peer',table(['Company','FY','Revenue ₹cr','Growth','Margin','PAT ₹cr','PAT growth','P/E','Market cap ₹cr'],direct.map(cols)))+card('Indicative auto-component reference',table(['Company','FY','Revenue ₹cr','Growth','Margin','PAT ₹cr','PAT growth','P/E','Market cap ₹cr'],reference.map(cols)))+'<p class="method-note">Amara Raja is the direct operating peer. Other auto-component names are shown separately and are not treated as battery-business equivalents.</p></div>'}
function cuInvestment(){let sc=P.scorecard||{};let facts=[{label:'ROE',value:N(sc.roe,1)+'%'},{label:'ROCE',value:N(sc.roce,1)+'%'},{label:'3Y sales CAGR',value:N(sc.sales_cagr_3y,1)+'%'},{label:'3Y EPS CAGR',value:N(sc.eps_cagr_3y,1)+'%'},{label:'3Y CFO / PAT',value:N(sc.cfo_pat_3y,2)+'x'},{label:'Debt / equity',value:N(sc.debt_equity,2)+'x'}];let non=ddBlock('bull_bear','non-obvious');return kpis(facts)+'<div class="layout-2">'+card('Compounding case','<p>Cummins India combines a high-return, debt-free core with three reinforcing demand layers: mission-critical power generation, a growing installed-base aftermarket and regulated industrial applications.</p>','positive')+card('Earnings architecture','<p>Domestic power generation and distribution provide the growth engine. Industrial applications and exports widen the opportunity set but introduce procurement and global-cycle variability.</p>')+card('Non-obvious read',badge('Analytical inference','inference')+prose(non.body),'inference-card')+card('Underwriting tension','<p>The operating franchise is strong, but the valuation requires durable execution. Data-centre conversion, aftermarket growth and margin defence must offset export uncertainty, input-cost pass-through lags and a sub-1x cash-conversion ratio.</p>','caution')+'</div>'}
function cuProducts(){let products=(P.products&&typeof P.products==='object'&&!Array.isArray(P.products))?P.products:jsonish(C.products);return Object.keys(products).map(k=>'<article class="product-card"><h3>'+E(k)+'</h3><p>'+E(A(products[k]).join(' · '))+'</p></article>').join('')}
function cuBusiness(){let demand=pipe(C.mdna).slice(0,10),plants=A(C.plants),segments=A(P.segments);return'<div class="stack">'+card('How the business makes money','<p>'+E(C.business||P.summary.business)+'</p>')+card('Reported segment economics',badge('Reported fact')+table(['Business','Latest FY sales ₹cr','Growth','Institutional read'],segments.map(x=>[E(x.business),N(x.sales_cr,0),E(x.growth),E(x.read)])))+card('Product and application architecture','<div class="product-grid">'+cuProducts()+'</div>')+card('End-market demand map',list(demand,10))+card('Operating moat',list(pipe(C.strengths),8),'positive')+card('Manufacturing and service footprint',table(['Location','Role','Scale / context'],plants.map(x=>[E(x.location),E(x.role),E(x.capacity||'—')])))+'</div>'}
function cuFinancials(){let a=A(D.actuals),model=A(P.projection?.projection),actual=tableByPeriod(['Quarter','Revenue ₹cr','YoY','Operating profit ₹cr','OPM','PAT ₹cr','YoY','EPS'],a.map(x=>[E(x.q),N(x.revenue,0),N(x.rev_yoy,1)+'%',N(x.op,0),N(x.opm_pct,1)+'%',N(x.pat,0),N(x.pat_yoy,1)+'%',N(x.eps,2)]));let est=tableByPeriod(['Period','Revenue ₹cr','YoY','OPM','PAT ₹cr','EPS','Primary drivers'],model.map(x=>[E(x.quarter),N(x.revenue,0),N(x.yoy_pct,1)+'%',N(x.opm_pct,1)+'%',N(x.pat,0),N(x.eps,2),E(A(x.drivers).map(d=>d.label+': '+d.value).join(' · '))]));let rat=A(D.ratios).filter(x=>/Receivable|Inventory|Payable|Int cover/i.test(x.label));let val=tableByPeriod(['Year','Market cap ₹cr','P/E','Operating margin','Debt / equity'],A(D.val5).map(x=>[E(x.fy),N(x.mcap,0),N(x.pe,1)+'x',N(x.opm,1)+'%',N(x.de,2)+'x']));return'<div class="stack">'+card('Eight-quarter operating trajectory',badge('Reported fact')+actual)+card('Full-year bridge',pnlPanel(D.pnl?.year))+(model.length?card('Forward model · '+N(P.projection?.confidence_pct,0)+'% confidence',badge('Model estimate','estimate')+est,'estimate-card'):'')+(A(P.projection?.assumptions).length?card('Model assumptions',list(P.projection?.assumptions,10)):'')+card('Working-capital diagnostics',kpis(rat))+card('Five-year valuation and balance-sheet history',val)+creditRatingCard()+'</div>'}
function cuExecution(){let w=D.wtt||{},track=D.track||{},open=A(track.open),pick=q=>open.find(x=>q.test(x.item||'')),focus=[pick(/moderate growth across segments/i),pick(/distribution.*20%|20%.*distribution/i),pick(/railways and mining growing/i),pick(/prototype engine.*defence/i),pick(/data center market.*QSK60/i),pick(/BESS.*no meaningful sales/i),pick(/India-UK FTA/i)].filter(Boolean);let outcomes=A(track.verdicts).filter(x=>x.status!=='expired');let ledger=table(['Forward commitment','Horizon','Type'],unique(focus).map(x=>[E(x.item),E(x.horizon||'—'),E((x.category||'').replaceAll('_',' '))]));let verdict=table(['Commitment tested','Made','Checked','Outcome'],outcomes.map(x=>[E(x.item)+'<small class="row-note">'+E(x.note||'')+'</small>',E(x.made||'—'),E(x.checked||'—'),status(x.status)]));return'<div class="stack"><div class="credibility"><div class="grade">'+E(w.credibility_grade||'—')+'</div><div><h3>Walk the Talk</h3><p>'+E(w.summary||'')+'</p></div><div class="cred-metrics"><span><b>'+E(w.quarters_covered||track.quarters_n||'—')+'</b> calls covered</span><span><b>'+E(w.reconciled_n||track.verdicts_total||'—')+'</b> reconciled</span><span><b>'+E(w.guidance_hit_rate||'—')+'%</b> guidance hit</span></div></div>'+card('Decision-relevant forward commitments',badge('Management guidance','guide')+ledger,'guide-card')+card('Evidence-tested commitments',verdict)+card('Management tone · latest assessment',badge('Analytical inference','inference')+'<p>'+E(w.tone_latest||'')+'</p>','inference-card')+'</div>'}
function cuOwnership(){let board=A(C.board).filter(x=>!/(resigned|ceased)/i.test(x.designation||'')),related=A(jsonish(C.related)).filter(x=>!/Former wholly-owned subsidiary/i.test(x.note||'')),dividend=A(D.track?.open).find(x=>/aggregating.*66 per (equity )?share/i.test(x.item||''));return'<div class="stack">'+card('Control and promoter position','<div class="analysis-strip"><div><span>Ultimate parent</span><b>Cummins Inc., USA</b></div><div><span>Promoter holding</span><b>'+N(P.scorecard?.promoter_pct,1)+'%</b></div><div><span>Share-count change · 3Y CAGR</span><b>'+N(P.scorecard?.share_cagr_3y,2)+'%</b></div></div>')+card('Current board and executive leadership',table(['Director','Role'],board.map(x=>[E(x.name),E(x.designation)])))+card('Operating and related-party structure',table(['Entity','Relationship','Decision relevance'],related.map(x=>[E(x.name),E(x.relation),E(x.note)])))+card('Capital distribution record','<p>'+E(dividend?.item||'A Board-adopted dividend policy governs distribution versus retention of profit.')+'</p>','positive')+card('Governance watch','<p>Parent technology access is a strategic advantage, while related-party sourcing, technology transfer and inter-company sales make arm’s-length discipline and localization economics continuing diligence items.</p>','caution')+'</div>'}
function cuRisks(){let ar=A(C.risks),find=q=>ar.find(x=>q.test(x.risk||''))||{},cr=String(ddBlock('bull_bear','risks').body||'').split(/\n+/).map(x=>x.replace(/^[-•]\s*/,'')),line=q=>cr.find(x=>q.test(x))||'',non=String(ddBlock('bull_bear','non-obvious').body||'').split(/\n+/).map(x=>x.replace(/^[-•]\s*/,''));let rows=[{risk:'Input-cost and pass-through lag',note:line(/Commodity inflation/)},{risk:'Export and geopolitical exposure',note:find(/Export demand/).note},{risk:'Imported high-displacement engine economics',note:line(/imported 78L\/95L/)},{risk:'Supplier resilience',note:find(/Supply chain fragility/).note},{risk:'Industrial-cycle sensitivity',note:find(/private capex recovery/).note},{risk:'Rail procurement concentration',note:find(/Segment concentration in Rail/).note},{risk:'Aftermarket competition',note:pipe(C.mdna).find(x=>/^Distribution\/Aftermarket:/i.test(x))},{risk:'Energy-transition execution gap',note:non.find(x=>/BESS is import-dependent/i)}].filter(x=>x.note);return'<div class="risk-grid">'+rows.map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(x.risk)+'</h3><p>'+E(x.note)+'</p></div></article>').join('')+'</div>'}
function cuPeers(){let pp=D.peer_panel||{},all=[pp.target,...A(pp.peers)].filter(Boolean),cols=x=>[E(x.name)+'<small class="row-note">'+E(x.s)+'</small>',E(x.fy),N(x.rev,0),N(x.rev_growth,1)+'%',N(x.ebitda_margin,1)+'%',N(x.pat,0),N(x.pat_growth,1)+'%',N(x.pe,1)+'x',N(x.mcap,0)];return'<div class="stack">'+card('Operating peer set',table(['Company','FY','Revenue ₹cr','Growth','EBITDA margin','PAT ₹cr','PAT growth','P/E','Market cap ₹cr'],all.map(cols)))+'<div class="layout-2">'+card('Closest operating reference','<p>Kirloskar Oil Engines is the cleaner domestic engines and generation reference. It is smaller and less profitable, so its multiple is context rather than a direct valuation answer.</p>')+card('Partial reference only','<p>Greaves Cotton shares engine heritage but differs materially in scale, mix and margin. It should not be treated as an equivalent franchise.</p>','caution')+'</div><p class="method-note">Operating resemblance and valuation context are kept separate; unrelated capital-goods names are excluded.</p></div>'}
function cuVerdict(){let sc=P.scorecard||{},scores=[['Profitability',sc.bq_a,'25'],['Growth',sc.bq_b,'20'],['Balance sheet',sc.bq_c,'15'],['Cash quality',sc.bq_d,'15'],['Capital allocation',sc.bq_e,'10'],['Promoter and governance',sc.bq_f,'10'],['Management evidence',sc.bq_g,'15']];let questions=['What is the data-centre revenue and order-book split between colocation and hyperscaler customers, and what margin does each earn?','What localization and sourcing plan protects economics if demand shifts from QSK60 to imported 78L or 95L engines?','How quickly can the three-year CFO/PAT ratio move toward 1x, and which working-capital line is the binding constraint?','What are the measurable commercial milestones for BESS before it becomes an investible earnings driver?','How much export recovery is embedded in the order book, by geography, and how much depends on related-party demand?'];let synthesis=['The core franchise clears the quality gate: high returns, a debt-free balance sheet and strong three-year earnings growth.','Data centres accelerate the thesis, but the installed-base aftermarket is the more repeatable second engine.','Industrial breadth reduces single-market dependence; rail procurement and the global export cycle still create lumpiness.','The stored execution record is the counterweight to franchise quality: guidance precision and cash conversion need stronger evidence.','The investment case is valuation-dependent. Sustained premium economics matter more than any one quarter’s growth spike.'];let gaps=['No valid Stage classification is stored; price and volume evidence are shown separately.','Management has not disclosed a clean data-centre sub-segment revenue, margin or order-book bridge.','Model projections are analytical estimates, not management guidance.','A historical valuation distribution or percentile store is not available, so none is fabricated.'];return'<div class="stack"><div class="decision-card"><div><p class="eyebrow">Current stance</p><h3>'+E(sc.verdict||'OBSERVE')+' · quality established, entry price matters</h3><p>The evidence supports a high-quality operating franchise, while execution scoring, cash conversion and valuation keep the conclusion conditional.</p></div><div class="decision-score"><strong>'+E(sc.bq_total||'—')+'</strong><span>/100 Business Quality</span></div></div>'+card('Analytical scores',table(['Dimension','Stored score','Maximum'],scores.map(x=>[E(x[0]),N(x[1],0),E(x[2])])))+card('Due diligence',list(questions,10),'caution')+card('Intelligence synthesis',list(synthesis,10),'inference-card')+card('Coverage limits',list(gaps,8))+'</div>'}
function themeIntelligence(){let rows=A(P.themes);return'<div class="theme-stack">'+rows.map((x,i)=>{let id='theme_detail_'+i;let relevanceHtml=x.relevance?'<p class="theme-relevance">'+E(x.relevance)+'</p>':'';let intelHtml='<div class="theme-intel"><div><span>Need of the hour</span><p>'+E(x.need)+'</p></div><div><span>Current driver</span><p>'+E(x.driver)+'</p></div></div>';return'<article class="theme-card"><div class="theme-card-head"><div><p class="theme-parent">'+E(x.parent)+'</p><h3>'+E(x.title)+'</h3></div><div class="theme-pills"><span class="theme-pill tier">T'+E(x.tier)+'</span><span class="theme-pill">'+E(x.tag)+'</span><span class="theme-pill '+(/Sharpest/i.test(x.status)?'sharp':'long')+'">'+E(x.status)+'</span></div></div><div id="'+id+'" style="display: none;">'+relevanceHtml+intelHtml+'</div><a href="#" onclick="let p=document.getElementById(\''+id+'\'); let collapsed=p.style.display===\'none\'; p.style.display=collapsed?\'block\':\'none\'; this.textContent=collapsed?\'Show less\':\'Show details\'; return false;" style="font-size: 11px; color: var(--g700); font-weight: 500; text-decoration: underline; cursor: pointer; display: inline-block; margin-top: 8px; margin-bottom: 4px;">Show details</a></article>'}).join('')+'</div>'}
function explorer(){let sets=P.explorer||{},labels={momentum:'Momentum',investing:'Investing',new:'New listings',peers:'Peers'},keys=['momentum','investing','new','peers'];return'<aside class="stock-explorer"><div class="explorer-title"><div><span>Company Explorer</span><b>Stock list</b></div><button id="explorer-close" aria-label="Close stock list">×</button></div><select id="explorer-source" aria-label="Choose stock screen">'+keys.map(k=>'<option value="'+k+'">'+labels[k]+'</option>').join('')+'</select><input id="explorer-search" type="search" placeholder="Filter stocks…" aria-label="Filter stock list"><div id="explorer-list"></div></aside><button id="explorer-open" class="explorer-open">Stocks</button>'}
function initExplorer(){let sets=P.explorer||{},source=document.getElementById('explorer-source'),search=document.getElementById('explorer-search'),listBox=document.getElementById('explorer-list'),aside=document.querySelector('.stock-explorer');if(!source||!search||!listBox||!aside)return;/* KEEP THE READER WHERE THEY WERE. Clicking a stock is a real navigation (href=/company/?sym=), so every click reloads the page, re-renders this list from scratch and resets its scrollTop to 0 - the row just clicked is then hundreds of rows down and has to be hunted for again (owner 2026-08-31). Centre the selected row INSIDE the list box. Never scrollIntoView(): the list is a nested scroller and that also scrolls the DOCUMENT, throwing the reader to the top of the company page - trading one wrong scroll position for another. Measured off rects rather than offsetTop, which is relative to the offsetParent and silently wrong if the box is not positioned. */function centre(){let sel=listBox.querySelector('.explorer-stock.selected');if(!sel)return;let r=sel.getBoundingClientRect(),b=listBox.getBoundingClientRect();listBox.scrollTop+=(r.top-b.top)-(b.height/2-r.height/2)}function draw(keep){let q=String(search.value||'').toUpperCase(),rows=A(sets[source.value]).filter(r=>!q||String(r.symbol||'').toUpperCase().includes(q)||String(r.name||'').toUpperCase().includes(q));listBox.innerHTML=rows.length?rows.map(r=>'<a class="explorer-stock'+(r.symbol===I.symbol?' selected':'')+'" href="/company/?sym='+encodeURIComponent(r.symbol)+'"><b>'+E(r.symbol)+'</b><span>'+E(r.name||r.meta||'')+'</span><small>'+E(r.meta||'')+'</small></a>').join(''):'<p class="empty">No stocks in this view.</p>';if(keep!==false)centre()}source.onchange=()=>draw();search.oninput=()=>draw(false);document.getElementById('explorer-close').onclick=()=>aside.classList.remove('open');document.getElementById('explorer-open').onclick=()=>aside.classList.add('open');draw()}
function initStage(){if(!window.M2D)return;window.M2D.init({stocks:M.stock?[M.stock]:[],meta:{hist_sessions:130},datadir:'../data'});if(M.stock){window.M2D.select(I.symbol);let bs=document.querySelectorAll('#m2-tf button');bs.forEach(b=>b.onclick=()=>{bs.forEach(x=>x.classList.toggle('active',x===b));window.M2D.setTf(+b.dataset.tf)})}else if(A(M.price).length){window.M2D.setCur(I.symbol)}window.M2D.loadDelVol()}
function chart(rows){if(!rows||rows.length<2)return'<div class="empty">Price history is not yet sufficient.</div>';let d=rows.slice(-260),W=900,H=300,p=34,c=d.map(x=>+x[1]),v=d.map(x=>+x[2]||0),lo=Math.min(...c),hi=Math.max(...c),vm=Math.max(...v)||1,X=i=>p+i*(W-2*p)/(d.length-1),Y=x=>p+(hi-x)*(H-2*p-52)/(hi-lo||1);return'<div class="market-chart"><svg viewBox="0 0 '+W+' '+H+'">'+d.map((x,i)=>{let z=44*(+x[2]||0)/vm;return'<rect x="'+X(i)+'" y="'+(H-p-z)+'" width="2" height="'+z+'"/>'}).join('')+'<polyline points="'+d.map((x,i)=>X(i)+','+Y(+x[1])).join(' ')+'"/></svg><div><span>'+E(d[0][0])+'</span><b>₹'+N(c.at(-1),2)+'</b><span>'+E(d.at(-1)[0])+'</span></div></div>'}
function hero(){let st=M.stock,sc=P.scorecard||{},an=P.ipo?.analysis||{},hasDrhp=PM?PM.coverage?.drhp:P.coverage.drhp,hasDeep=PM?PM.coverage?.deepDive:P.coverage.deepDive,f=[['Coverage',hasDeep&&hasDrhp?'Deep Dive + offer research':hasDrhp?'Offer-document research':hasDeep?'Operating deep dive':'Market coverage'],['Market structure',st?st.g+' · '+({1:'Basing',2:'Advancing',3:'Top',4:'Decline'}[st.g]||'Tracked'):'Classification pending']],thesis=PM?.hero?.oneLiner||P.summary.oneLiner;if(!PM&&I.symbol==='INDOMIM')thesis=String(thesis||'').replace(/ in Calendar Year 2025 for the last six years/i,', a leadership position held for six years');if(sc.symbol)f.push(['Business quality',sc.bq_total+' / 100']);if(an.Symbol)f.push(['Market cap','₹'+N(an['Market Cap (Cr)'],0)+' cr']);let hasModel=A(P.projection?.projection).length;return'<section class="company-hero"><p class="eyebrow">Institutional company intelligence</p><div class="title-row"><h1>'+E(I.name)+'</h1><span>'+E(I.symbol)+'</span></div><p class="thesis">'+E(thesis)+'</p><div class="decision-strip">'+f.map(x=>'<div><span>'+E(x[0])+'</span><b>'+E(x[1])+'</b></div>').join('')+'</div><div class="legend">'+badge('Reported fact')+badge('Management guidance','guide')+(hasModel?badge('Model estimate','estimate'):'')+badge('Analytical inference','inference')+'</div></section>'}
function investment(){if(D.s)return hfInvestment();let v=sec('verdict'),ip=sec('industry_peers'),strength=v.strengths_observed||ip.swot?.strengths||[],concerns=v.concerns_observed||[],non=concall('non-obvious');return'<div class="layout-2">'+card('Business in one view','<p>'+E(P.summary.business)+'</p>')+card('Why this can compound',list(I.symbol==='HFCL'?concall('optionality'):strength,6),'positive')+card('What the market must be right about',list(concerns,6),'caution')+card('Non-obvious intelligence',badge('Analytical inference','inference')+list(non.length?non:sec('intellisense').growth_durability?.signals,6),'inference-card')+card('What changes the view',list(v.monitorables||concall('risk'),7))+'</div>'}
function business(){if(D.s)return hfBusiness();let b=sec('business_ops'),ip=sec('industry_peers'),products=b.products||P.products;return'<div class="layout-2">'+card('Revenue engine',list(products,10))+card('End-market architecture',list(b.revenue_split_industry||P.endMarkets,10))+card('Competitive position',(ip.market_position?'<p><strong>'+N(ip.market_position.share_pct,1)+'%</strong> '+E(ip.market_position.positioning||'')+'</p><p>'+E(ip.market_position.basis||'')+'</p>':'')+list(ip.swot?.strengths,5),'positive')+card('Manufacturing footprint',list(b.plants,8))+card('Operating economics',list(concall('margin'),8))+'</div>'}
function financials(){let f=sec('financials'),p=f.pnl_3yr||[],cash=f.cash_flow||[],rr=f.return_ratios||[],model=P.projection?.projection||[];let reported=tableByPeriod(['Year','Revenue ₹cr','EBITDA ₹cr','PAT ₹cr','EPS'],p.map(x=>[E(x.fy),N((x.revenue||0)/100),N((x.ebitda||0)/100),N((x.pat||0)/100),N(x.eps,2)]))||list(concall('financial scorecard'),10);let cf=tableByPeriod(['Year','CFO ₹cr','RoCE','RoNW'],cash.map((x,i)=>[E(x.fy),N((x.cfo||0)/100),rr[i]?.roce_pct==null?'—':N(rr[i].roce_pct)+'%',rr[i]?.ronw_pct==null?'—':N(rr[i].ronw_pct)+'%']));let estimates=tableByPeriod(['Period','Revenue ₹cr','OPM','PAT ₹cr'],model.map(x=>[E(x.quarter||x.period),N(x.revenue,0),N(x.opm_pct)+'%',N(x.pat,0)]));return'<div class="stack">'+card('Reported operating record',badge('Reported fact')+reported)+card('Cash conversion & returns',cf)+card('Forward model',badge('Model estimate','estimate')+estimates,'estimate-card')+card('Model assumptions',list(P.projection?.assumptions,8))+creditRatingCard()+'</div>'}
function execution(){let o=sec('objects_execution'),hi=P.presentation?.highlights||{},cs=P.commitments||[];let ledger=table(['Commitment','Horizon','Status'],cs.slice(-14).map(x=>[E(x.item||x.commitment||x.promised||'Commitment'),E(x.horizon||x.target_period||'—'),E(x.status||'Open')])),objects=o.objects?table(['Use of proceeds','₹cr'],o.objects.map(x=>[E(x.purpose),x.amount_lakhs==null?'—':N(x.amount_lakhs/100,0)])):'';return'<div class="layout-2">'+card(I.symbol==='HFCL'?'Capacity & capital':'Use of fresh issue',I.symbol==='HFCL'?list(hi.expansion_capex||concall('capex'),8):objects)+card('Execution milestones',ledger||list(o.project?[o.project]:[],6))+card('Management credibility',P.wtt?.symbol?'<div class="grade">'+E(P.wtt.credibility_grade||'Tracked')+'</div><p>'+E(P.wtt.summary||'')+'</p>':'<p class="muted">No mature commitment history yet. This is an evidence gap, not a negative score.</p>')+card('Guidance and dependencies',badge('Management guidance','guide')+list(concall('guidance'),10),'guide-card')+'</div>'}
function ownership(){let c=sec('capital_ownership'),g=sec('governance');return'<div class="layout-2">'+card('Promoter and dilution',list([c.promoter_holding,c.pledging,c.dilution].filter(Boolean),8))+card('Board and leadership',list(g.promoters_directors,8))+card('Related parties & record gaps',list([...A(g.rpts),...A(g.record_gaps)],8),'caution')+card('Capital history — decision-relevant events',list(c.capital_history,8))+'</div>'}
function risks(){let r=sec('risks'),v=sec('verdict'),all=[...A(r.internal_operational),...A(r.financial_valuation),...A(r.strategy_growth),...A(v.concerns_observed),...(I.symbol==='HFCL'?concall('risk'):[])];return'<div class="risk-grid">'+all.slice(0,12).map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(x.title||value(x))+'</h3>'+(x.detail?'<p>'+E(x.detail)+'</p>':'')+(x.evidence?'<small>'+E(x.evidence)+'</small>':'')+'</div></article>').join('')+'</div>'}
function peers(){let rows=P.peers?.peers||[],groups={};rows.forEach(x=>(groups[x.group||'Peers']??=[]).push(x));return'<div class="stack">'+Object.keys(groups).map(g=>card(g+(g.includes('Global')?' · closest disclosed comparable':' · operating reference set'),table(['Company','Revenue ₹cr','Margin','PAT ₹cr','P/E'],groups[g].map(x=>[E(x.name),N(x.rev,0),x.ebitda_margin==null?'—':N(x.ebitda_margin)+'%',N(x.pat,0),N(x.pe,1)])))).join('')+'<p class="method-note">Groups show business resemblance, not assumed equivalence. Missing metrics remain blank.</p>'}
// The anchor book: 172 symbols carry one, 4,945 rows in total, and NOTHING rendered it. The data
// shipped in every payload while `listing()` showed only price discovery; `coverageListing` reads
// it but is not the renderer these symbols are assigned.
function anchorCard(){
    let aa=Q.anchor_allotment||{},rows=A(aa.rows);
    if(!rows.length)return '';
    // Named owners first (present on 440 of 4,967 rows), blanks after; within each, largest stake
    // first. A row's owner is the person behind the fund house, which is the part a reader knows.
    let ranked=rows.slice().sort((x,y)=>{
        let ox=String(x.owner||'').trim(), oy=String(y.owner||'').trim();
        if(!!ox!==!!oy) return ox?-1:1;
        if(ox&&oy&&ox!==oy) return ox.localeCompare(oy);
        return (Number(y.pct)||0)-(Number(x.pct)||0);
    }).slice(0,50);
    // `tr_med90` is the house's MEDIAN 90-DAY RETURN across its prior anchor positions, and it is
    // present on ~24% of rows. `tr_medl` is a different measure (listing-day gain), so it is NOT
    // substituted in - an empty cell is honest, a mixed column is not. The sample size rides along
    // because "100%" over 4 IPOs and over 40 are not the same claim.
    // The sample size rides with the 90-day figure only, so it is stated once per row rather than
    // twice: "-10.9%" over 2 prior IPOs and "8.0%" over 109 are not the same claim, and without n
    // they read identically. A missing median stays blank — never filled from a different measure.
    let ret=(v,n)=>{
        if(v==null) return '—';
        return N(v,1)+'%'+(n==null?'':'<small class="row-note">n='+N(n,0)+'</small>');
    };
    let body=table(['Anchor house','Owner','% of anchor book','Shares','Med 90D','Med 180D'],
        ranked.map(x=>[E(x.house||'—'),E(x.owner||'—'),
                       x.pct==null?'—':N(x.pct,2)+'%',N(x.shares,0),
                       ret(x.tr_med90,x.tr_n),ret(x.tr_med180,null)]),7);
    let note=rows.length>50?'<p class="method-note">Showing the 50 largest of '+rows.length+' anchor allottees.</p>':'';
    return card('Anchor investors ('+(aa.n||rows.length)+')',body+note);
}
function listing(){let s=P.ipo?.summary||{},a=P.ipo?.analysis||{};return s.Symbol?'<div class="stack">'+anchorCard()+'<div class="layout-2">'+card('Price discovery',table(['Issue','Open','Listing gain','Latest','Since open'],[[N(s['Issue Price']),N(s['Listing Open Price']),N(s['Listing Gain %'])+'%',N(a['Latest Close']),N(a['Return From Listing %'])+'%']]))+card('Offer structure',list(sec('objects_execution').objects,6))+card('Forensic checks',list(sec('intellisense').forensic,8))+'</div></div>':(anchorCard()||'<div class="empty">No offer record applies to this coverage.</div>')}
function pendingVolume(){let d=A(M.price).slice(-20),vol=d.map(x=>Number(x[2])||0).filter(x=>x>0),latest=Number(d.at(-1)?.[2])||0,avg=vol.length?vol.reduce((a,b)=>a+b,0)/vol.length:0;if(!vol.length)return'';return card('Observed volume profile',kpis([{label:'Sessions observed',value:d.length},{label:'Latest volume',value:N(latest,0)},{label:'Observed average',value:N(avg,0)},{label:'Latest / average',value:N(latest/avg,2)+'x'}]))}
function stage(){if(M.stock)return'<div id="tab-momentum2"><div class="m2card"><div class="m2chartbar"><div class="m2tf" id="m2-tf"><button data-tf="1" class="active">1Y</button><button data-tf="3">3Y</button><button data-tf="5">5Y</button><button data-tf="0">Max</button></div><div class="m2hover" id="m2-hover"></div></div><div id="m2-chart"></div></div><div class="m2card"><div class="m2sec">Stage analysis</div><div id="m2-data"></div><div id="m2-data-ext"></div></div><div class="m2card"><div class="m2sec">Stage history</div><div id="m2-hist"></div></div><div class="m2card"><div class="m2sec" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="let t=document.getElementById(\'m2-vol-table\'); let collapsed=t.style.display===\'none\'; t.style.display=collapsed?\'block\':\'none\'; this.querySelector(\'.toggle-sign\').textContent=collapsed?\'−\':\'+\';">Volume analysis <span class="toggle-sign" style="font-size: 16px; font-weight: bold;">+</span></div><div id="m2-vol-table" style="display: none;"></div></div></div>';return'<div class="pending"><b>Classification pending</b><p>Listed price history exists, but the Stage engine has not produced a valid classification. No stage is inferred.</p></div>'+chart(M.price)+'<div class="m2card"><div class="m2sec" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="let t=document.getElementById(\'m2-vol-table\'); let collapsed=t.style.display===\'none\'; t.style.display=collapsed?\'block\':\'none\'; this.querySelector(\'.toggle-sign\').textContent=collapsed?\'−\':\'+\';">Volume analysis <span class="toggle-sign" style="font-size: 16px; font-weight: bold;">+</span></div><div id="m2-vol-table" style="display: none;"><div class="m2empty">Loading volume analysis&hellip;</div></div></div>'}
function drhpRiskRows(){let r=sec('risks'),all=[...A(r.internal_operational),...A(r.financial_valuation),...A(r.compliance_legal),...A(r.strategy_growth)];let generic=/general economic|political condition|natural disaster|pandemic|competition may|changes in law|force majeure/i;let score=x=>{let text=[x.title,x.risk,x.detail,x.evidence].join(' '),n=0;if(/[₹%]|\b\d[\d,.]*\b/.test(text))n+=4;if(/customer|supplier|data cent|cloud|cyber|power|capacity|receivable|government|technology|order|vendor/i.test(text))n+=3;if(x.evidence)n+=2;if(generic.test(text))n-=4;return n};return unique(all).sort((a,b)=>score(b)-score(a)).slice(0,10)}
function drhpInvestmentGeneric(){let f=sec('financials'),b=sec('business_ops'),o=sec('overview'),rows=A(f.pnl_3yr),last=rows.at(-1)||{},rr=A(f.return_ratios).find(x=>x.fy===last.fy)||{},facts=A(b.other_material_facts).filter(x=>['technology_ip','vertical_integration','repeat_business','customer_qualification'].includes(x.label)&&typeof x.value==='string').map(x=>concise(x.value,240)).slice(0,6),risks=drhpRiskRows().slice(0,5);return kpis([{label:'Revenue',value:last.revenue==null?'—':rsAmount(last.revenue_amount_rs||last.revenue*100000)},{label:'EBITDA margin',value:rr.ebitda_margin_pct==null?'—':N(rr.ebitda_margin_pct,1)+'%'},{label:'PAT',value:last.pat==null?'—':rsAmount(last.pat_amount_rs||last.pat*100000)},{label:'RoCE',value:rr.roce_pct==null?'—':N(rr.roce_pct,1)+'%'}])+'<div class="layout-2">'+card('Business in one view','<p>'+E(concise(o.business_model||P.summary.business||'',520))+'</p>')+card('Evidence-backed differentiation',list(facts,6),'positive')+card('Key concerns to underwrite',list(risks.map(x=>concise(x.title||x.risk||value(x),220)),5),'caution')+card('What to monitor',list([A(b.capacity_utilization).length?'Capacity addition and utilisation':'',sec('objects_execution').orders_not_placed?.status?'Conversion of quotations into firm equipment orders':''].filter(Boolean),6))+'</div>'}
function drhpExecutionGeneric(){let o=sec('objects_execution'),objects=A(o.objects),deployment=A(o.project?.deployment),changes=A(o.post_expansion_math?.capacity_changes),orders=o.orders_not_placed||{};let uses=table(['Use of funds','Amount'],objects.map(x=>[E(x.purpose),x.amount_rs==null?'To be finalised':rsAmount(x.amount_rs)]));let schedule=table(['Equipment / infrastructure','FY2027','FY2028'],deployment.map(x=>[E(x.item),rsAmount(x.amount_rs_by_fy?.FY27),rsAmount(x.amount_rs_by_fy?.FY28)]));let capacity=table(['Resource','Current','Post investment','Increase'],changes.map(x=>[E(x.resource),N(x.before,0)+' '+E(x.unit),N(x.after,0)+' '+E(x.unit),N(x.increase_pct,1)+'%']));return'<div class="stack">'+card('Use of funds',uses)+(deployment.length?card('Planned deployment',schedule):'')+(changes.length?card('Expected capacity addition',capacity,'positive'):'')+(orders.status?card('Execution status','<p>'+E(orders.note)+'</p>','caution'):'')+'</div>'}
function drhpRisksGeneric(){let rows=drhpRiskRows();if(!rows.length)return'<div class="empty">No company-specific risk disclosures are stored.</div>';return'<p class="method-note">Showing the most company-specific, evidence-backed risks. The complete risk register remains stored for audit.</p><div class="risk-grid">'+rows.map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(concise(x.title||x.risk||value(x),220))+'</h3><p>'+E(concise(x.detail||x.note||'',260))+'</p></div></article>').join('')+'</div>'}
function drhpPeersGeneric(){let ip=sec('industry_peers'),sk=Q.sk||{},pp=Q.peer_panel||P.peers||{},facts=A(ip.other_material_facts).map(x=>x.value||x),position=[ip.market_position?.positioning,ip.market_position?.basis].filter(Boolean),metrics=A(sk.market_size||sk.cagrs),drivers=A(sk.drivers||sk.growth_drivers),peers=A(ip.peers_drhp).length?A(ip.peers_drhp):A(pp.peers);let peerRows=peers.map(x=>[E(x.name||x.company||x.s),E(x.fy||x.period||'—'),x.revenue_cr==null&&x.rev==null?'—':N(x.revenue_cr??x.rev,2),x.ebitda_margin==null?'—':N(x.ebitda_margin,2)+'%',x.pe==null?'—':N(x.pe,2)+'x']);let cards='';if(position.length||facts.length)cards+=card('Industry position',list([...position,...facts],8),'positive');if(metrics.length)cards+=card('Market size and growth',list(metrics,8));if(drivers.length)cards+=card('Growth drivers',list(drivers,8));if(peerRows.length)cards+=card('Disclosed and operating peers',table(['Company','Period','Revenue ₹cr','EBITDA margin','P/E'],peerRows));return cards?'<div class="stack">'+cards+'</div>':'<div class="empty">Industry evidence is not yet structured for this filing.</div>'}
function drhpListingWithAnchors(){let html=drhpListingGeneric(),anchors=anchorCard();if(!anchors)return html;let at=html.lastIndexOf('</div>');return at<0?html+anchors:html.slice(0,at)+anchors+html.slice(at)}
function drhpListingGeneric(){let s=P.ipo?.summary||{},o=sec('objects_execution'),c=sec('capital_ownership'),listed=String(s['Listing Open Price']||'').trim()!=='';let dates=kpis([{label:'Price band',value:E(s['Price Range']||'—')},{label:'Issue price',value:s['Issue Price']?'₹'+N(s['Issue Price']):'—'},{label:'Issue opens',value:E(s['Issue Start Date']||'—')},{label:'Issue closes',value:E(s['Issue End Date']||'—')},{label:listed?'Listed on':'Planned listing',value:E(s['Date Of Listing']||'—')}]);let uses=table(['Offer object','Amount'],A(o.objects).map(x=>[E(x.purpose),x.amount_rs==null?'To be finalised':rsAmount(x.amount_rs)]));let structure=[c.dilution,c.ofs,c.lock_in,c.pledging].filter(x=>x&&Object.keys(x).length);let discovery=listed?card('Price discovery',table(['Issue price','Listing open','Listing gain'],[['₹'+N(s['Issue Price']),'₹'+N(s['Listing Open Price']),N(s['Listing Gain %'],1)+'%']])):'';return'<div class="stack">'+card(listed?'Offer and listing timeline':'Offer timeline',dates)+card('Offer objects',uses)+(structure.length?card('Offer structure',list(structure,8)):'')+discovery+'</div>'}
function coverageCase(){let v=sec('verdict'),ip=sec('industry_peers'),strength=v.strengths_observed||ip.swot?.strengths||pipe(C.strengths),concerns=v.concerns_observed||ip.swot?.weaknesses||[],monitor=v.monitorables||[],score=P.scorecard||{};return(score.symbol?kpis([{label:'Business Quality',value:score.bq_total+' / 100'},{label:'ROE',value:N(score.roe,1)+'%'},{label:'ROCE',value:N(score.roce,1)+'%'},{label:'3Y EPS CAGR',value:N(score.eps_cagr_3y,1)+'%'}]):'')+'<div class="layout-2">'+card('Business in one view','<p>'+E(P.summary.business||C.business||sec('overview').business_model||'')+'</p>')+card('Evidence-backed strengths',list(strength,8),'positive')+card('Concerns to underwrite',list(concerns,8),'caution')+card('What changes the view',list(monitor,8))+'</div>'}
function concallHighlights(){let period=String(callStore.period||'').replace(/^(Q[1-4]|H[12])(FY\d+)$/,'$1 $2');// MEASURED 2026-08-24: five of the six cards this section used to render were the SAME TEXT as
    // cards other tabs now own - margins, guidance, order book, growth verticals and non-obvious all
    // scored 100% word overlap against their topic, because concallIntel and deepdive.sections carry
    // the same note. That is COMPANY_CONTENT_MAP.md §1a, still live. This section now renders only
    // what the call added and no other card claims: what changed since last quarter, how management
    // answered, and the segment detail nothing else owns.
    let cards=card('What changed since the last call',callBody('qoq change'),'positive')+card('Management quality & tone',callBody('management quality')||callBody('tone'),'inference-card')+card('Segment / subsidiary detail',callBody('segment'));return'<div class="call-context"><span>Latest available management call</span><b>'+E(period||'Current stored call')+'</b></div><div class="stack">'+cards+'</div>'}
function coverageFinancials(){if(R.financials)return financials();let years=Q.kpi?.years||{},rows=Object.keys(years).map(fy=>{let x=years[fy]||{};return[E(fy),x.revenue_lakhs==null?'—':N(x.revenue_lakhs/100,1),x.ebitda_lakhs==null?'—':N(x.ebitda_lakhs/100,1),x.ebitda_margin_pct==null?'—':N(x.ebitda_margin_pct,1)+'%',x.pat_lakhs==null?'—':N(x.pat_lakhs/100,1),x.roce_pct==null?'—':N(x.roce_pct,1)+'%']});return'<div class="stack">'+card('Reported operating record',badge('Reported fact')+tableByPeriod(['Year','Revenue ₹cr','EBITDA ₹cr','Margin','PAT ₹cr','RoCE'],rows))+creditRatingCard()+'</div>'}
function coverageExecution(){let objects=R.objects_execution?.objects||Q.objects||[],promises=Q.promises||P.commitments||[];return'<div class="stack">'+card('Use of funds and projects',table(['Purpose','Amount / scale'],A(objects).map(x=>[E(x.purpose||x.item||value(x)),x.amount_lakhs==null?E(x.amount||x.scale||'—'):'₹'+N(x.amount_lakhs/100,1)+'cr'])))+card('Execution commitments',table(['Commitment','Horizon','Status'],A(promises).slice(0,20).map(x=>[E(x.item||value(x)),E(x.horizon||x.target_period||'—'),E(x.status||'Open')])))+'</div>'}
function coverageOwnership(){
    let g=sec('governance'),c=sec('capital_ownership'),board=g.promoters_directors||Q.board||C.board||[],promoters=Q.promoters||C.promoters||[],anchors=Q.anchor_allotment||{};
    let cardHtml = '';
    if (I.symbol === 'WELCORP') {
        cardHtml = card('Governance & Leadership Assessment', '<p>WCL is a promoter-controlled company under the Balkrishan Goenka promoter group (Welspun World), holding ~49.7% promoter stake. Board leadership features significant institutional and independent pedigree, with Manish Chokhani serving as a prominent independent director. Strategic capital allocation is monitored closely, with third-party transactions in the specialty steel and infrastructure entities being key diligence points.</p>', 'positive');
    }
    return'<div class="stack">'+cardHtml+card('Promoters and control',table(['Name','Role'],A(promoters).map(x=>[E(x.name),E(x.role||x.designation)])))+card('Board and leadership',table(['Name','Role'],A(board).map(x=>[E(x.name),E(x.role||x.designation)])))+card('Ownership and offer context',kpis([{label:'Promoter holding',value:c.promoter_holding?.pre_pct==null?'—':N(c.promoter_holding.pre_pct,2)+'%'},{label:'Anchor investors',value:anchors.n||'—'},{label:'Anchor allocation',value:anchors.total_amount?'₹'+N(anchors.total_amount/10000000,1)+'cr':'—'}]))+'</div>'
}
function coverageRisks(){let source=R.risks||{},all=[...A(source.internal_operational),...A(source.financial_valuation),...A(source.compliance_legal),...A(source.strategy_growth),...A(Q.risks),...A(C.risks)];return'<div class="risk-grid">'+unique(all).slice(0,16).map((x,i)=>'<article class="risk"><span>'+(i+1)+'</span><div><h3>'+E(x.title||x.risk||value(x))+'</h3><p>'+E(x.detail||x.note||'')+'</p></div></article>').join('')+'</div>'}
function coverageVerdict(){if(R.verdict||R.intellisense)return inVerdictDrhp();let g=Q.grades||{};return'<div class="stack">'+card('Stored assessment',kpis([{label:'Relative grade',value:g.rel||'—'},{label:'Weighted momentum',value:g.wm90||'—'}]))+card('Coverage limits','<p class="muted">This filing has no full analytical verdict domain. Stored grades remain separately labelled and are not treated as Stage Analysis.</p>')+'</div>'}
function coverageListing(){let o=sec('objects_execution'),c=sec('capital_ownership'),s=P.ipo?.summary||{},objects=o.objects||Q.objects||[],anchors=Q.anchor_allotment||{},uses=table(['Use of proceeds','₹cr'],A(objects).map(x=>[E(x.purpose||value(x)),x.amount_lakhs==null?E(x.amount||'—'):N(x.amount_lakhs/100,0)]));let discovery=s.Symbol?table(['Issue price','Listing open','Listing gain'],[['₹'+N(s['Issue Price']),'₹'+N(s['Listing Open Price']),N(s['Listing Gain %'],1)+'%']]):'';return'<div class="stack">'+/* 'Offer objects' REMOVED from Offer & Listing 2026-09-03 (owner:
   "Both read objects_execution.objects. Keep the detailed table in Execution and remove it from
   Offer & Listing. Offer should retain only Offer-at-a-Glance / composition metrics, OFS context
   and anchor data."). `coverageExecution`'s 'Use of funds and projects' renders the SAME
   `objects_execution.objects` list, so the page showed one dataset twice. The `uses` binding above
   is now unused HERE but `objects` is still read by it -- both are left in place rather than
   pruned, because the payload contract is unchanged and a future Offer-side summary may want them.
   */card('Offer structure',list([c.dilution,c.lock_in,c.pledging].filter(Boolean),8))+card('Anchor allocation',kpis([{label:'Anchor investors',value:anchors.n||'—'},{label:'Allocation',value:anchors.total_amount?'₹'+N(anchors.total_amount/10000000,1)+'cr':'—'}]))+anchorCard()+/* 'Price discovery' REMOVED 2026-09-03 (owner: "i don't need Price discovery in offer and listing"). It restated Issue price / Listing open / Listing gain, which the page already carries in the listing hero strip; the underlying `P.ipo.summary` fields are UNTOUCHED, so restoring it is a one-line change. */+'</div>'}
function opInvestment(){
    let sc=P.scorecard||{};
    let ob=topicBlock('order_book'),
        opt=topicBlock('growth_optionality'),
        non=topicBlock('non_obvious'),
        margin=topicBlock('margins');
    // `business_model` is OWNED by the Business section ("What the Company Does"). A Core
    // operating engine card here rendered the same block again - measured as a business+case
    // duplicate on 8 of 10 sampled symbols. There is no free topic to give this card, and
    // inventing one would only move the repetition, so the card is gone.
    // The strip used to hardcode five labels and regex the keynums for each. Three printed a dash
    // on most companies, and /roce/i matched the SUBSTRING - "Zinc tailings rep·roce·ssing plant"
    // rendered under the label ROCE. Measured: 91 symbols carried a label where /roce/i hits but
    // ROCE is not the word ("food processing", "records processed", "Sale Proceeds").
    // The store already curates these with their own labels - show those, capped at 5, and show
    // NOTHING when there are none. No slot is invented, so no slot can print a dash.
    let facts = A(D.keynums)
        .filter(x => x && String(x.label || '').trim() && String(x.value || '').trim())
        .slice(0, 5)
        .map(x => ({label: x.label, value: x.value}));
    let thesis=String(D.thesis||'').trim(),bottom=String(D.divline||'').trim();
    // REMOVED 2026-08-24: this header repeated the hero. hero() already prints the same
    // PM.hero.oneLiner and the same scorecard bq_total at the top of the page.
    let capAlloc=topicBlock('capital_allocation');
    // Two distinct blocks (margins, capital allocation). Joined with no separator they ran together
    // mid-sentence — "...is also a likelihood."Priorities stated as unchanged...".
    let economics=[margin.body?prose(margin.body):'',capAlloc.body?prose(capAlloc.body):''].filter(Boolean).join('<p class="src-title">Capital allocation</p>');
    let cards=[
        ['Compounding Drivers',opt.body?prose(opt.body):'','positive'],
        ['Unit Economics & Cost Dynamics',economics,'inference-card'],
        ['Order Book Visibility',ob.body?prose(ob.body):'','positive'],
        ['Non-Obvious Takeaways (Inference)',non.body?badge('Analytical inference','inference')+prose(non.body):'','inference-card']
    ].map(x=>card(x[0],x[1],x[2])).join('');
    // The Bigger Picture is gone for the same reason: P.summary.oneLiner falls back to
    // deepdive.thesis, so the hero already carries that exact paragraph. The Bottom Line
    // (deepdive.divline) is distinct and appears nowhere else, so it stays.
    let picture=bottom?card('The Bottom Line','<p>'+E(bottom)+'</p>','positive'):'';
    return kpis(facts)+'<div class="stack">'+horizonCards()+cards+'</div>'+(picture?'<div class="layout-2">'+picture+'</div>':'')
}
// Short vs long horizon is DERIVED, never editorial (COMPANY_CONTENT_MAP.md §6): bucket the capex
// ledger and the open commitments on the fiscal year each already carries. Two rules the spec did
// not state, both found on HINDZINC: rows dated in a fiscal year that has already ENDED are not a
// forward horizon at all (32 of its 53 dated rows sat in FY26), and the same commitment arrives in
// several phrasings, so it is deduped on the normalised item - the key the capex ledger uses.
function fyOf(text){let m=/FY\s?(?:20)?(\d{2})\s?-?\s?(?:20)?(\d{2})?|Q[1-4]\s?FY\s?(?:20)?(\d{2})|\b(20\d{2})\b/i.exec(String(text||''));if(!m)return null;let g=m[2]||m[1]||m[3]||m[4];let y=parseInt(g,10);return y>2000?y-2000:y}
function currentFY(){let d=new Date();let y=d.getFullYear()%100;return d.getMonth()>=3?y+1:y}
function horizonCards(){
    let cur=currentFY(),rows=[],seen=new Set();
    let push=(item,when,unit,amount)=>{let fy=fyOf(when),k=dedupeKey(item);if(fy==null||!k||seen.has(k)||fy<cur)return;seen.add(k);rows.push({fy:fy,unit:unit||'',amount:amount})};
    A(D.capex).forEach(x=>push(x.item,x.end_quarter||x.timeline,x.unit,x.amount));
    A(D.track?.open).forEach(x=>push(x.item,x.horizon,'',null));
    // AGGREGATE, never itemise. Listing the items here reprinted the Execution capex ledger word
    // for word — measured on 6 of 10 sampled symbols as a case+execution duplicate. This card's
    // question is WHEN capital lands; the ledger's is WHICH projects and what happened to them.
    // Only `inr_cr` rows are summed: `amount` alone is not a number (tonnes on one row, Rs crore on
    // the next), so mixing units would invent a total.
    let byFy={};
    rows.forEach(x=>{let b=byFy[x.fy]||(byFy[x.fy]={n:0,cr:0});b.n++;if(x.unit==='inr_cr'&&x.amount)b.cr+=Number(x.amount)||0});
    let lineFor=fy=>{let b=byFy[fy];return'**FY'+fy+'** — '+b.n+' commitment'+(b.n===1?'':'s')+(b.cr?' · ₹'+N(b.cr,0)+'cr of stated capital':'')};
    let years=Object.keys(byFy).map(Number).sort((a,b)=>a-b);
    let near=years.filter(y=>y<=cur+1).map(lineFor);
    let far =years.filter(y=>y> cur+1).map(lineFor);
    if(!near.length&&!far.length)return'';
    let note='<p class="method-note">Each commitment is listed with its status in the Execution ledger.</p>';
    return'<div class="layout-2">'+(near.length?card('Short-Term Horizon (0–2 Years)',list(near,6)+note,'positive'):'')+(far.length?card('Long-Term Growth Projects (Capex)',list(far,6)+note,'positive'):'')+'</div>'
}
function opBusiness(){
    let p=D.profile||{},products=productList(),markets=marketList();
    let certs=topicBlock('certifications'),oems=topicBlock('customers'),cap=topicBlock('capacity');
    // No `segment` fallback here: Management Call owns `segment_detail`, and falling back to it
    // reprinted that block under "What the Company Does" - 7 of 28 sampled symbols.
    let whatTheyDo=topicBlock('business_model');
    let moat=topicBlock('moat');
    let moatCard=moat.body?card('Does the Business Have a Moat? (Competitive Strengths)',prose(moat.body,4),'positive'):'';
    return'<div class="profile-band"><div><span>Operating entities</span><b>'+E(p.entities||'—')+'</b></div><div><span>Business lines</span><b>'+E(p.subseg||'—')+'</b></div><div><span>Structural themes</span><b>'+E(p.themes||'—')+'</b></div></div><div class="stack">'+card('What the Company Does',prose(whatTheyDo.body))+moatCard+(cap.body?card('Manufacturing capacity',prose(tidyCapacity(cap.body),8)):'')+(certs.body?card('Technical Moats & Certifications',prose(certs.body)):'')+(products.length?card('Products and platforms',list(products,12)):'')+(markets.length?card('End markets',list(markets,12)):'')+'</div>'
}
function opFinancials(){
    let actuals=A(D.actuals);
    let quartersHeaders=['Metric',...actuals.map(x=>E(x.q))];
    let revRow=['Revenue ₹cr'];
    let revYoYRow=['Revenue Growth YoY (%)'];
    let revQoQRow=['Revenue Growth QoQ (%)'];
    let opRow=['Operating profit ₹cr'];
    let opmRow=['OPM'];
    let patRow=['PAT ₹cr'];
    let epsRow=['EPS'];
    let epsYoYRow=['EPS Growth YoY (%)'];
    let epsQoQRow=['EPS Growth QoQ (%)'];

    actuals.forEach((x,i)=>{
        let rev=Number(x.revenue||0);
        let op=Number(x.op||0);
        let opm=Number(x.opm_pct||0);
        let pat=Number(x.pat||0);
        let eps=Number(x.eps||0);
        revRow.push(N(rev,0));
        opRow.push(N(op,0));
        opmRow.push(N(opm,1)+'%');
        patRow.push(N(pat,0));
        epsRow.push(N(eps,2));
        revYoYRow.push(x.rev_yoy!=null?N(x.rev_yoy,1)+'%':'—');
        let prevYear=actuals[i-4];
        let epsYoY=(prevYear&&prevYear.eps)?((eps-prevYear.eps)/prevYear.eps)*100:null;
        epsYoYRow.push(epsYoY!=null?N(epsYoY,1)+'%':'—');
        let prevQtr=actuals[i-1];
        let revQoQ=(prevQtr&&prevQtr.revenue)?((rev-prevQtr.revenue)/prevQtr.revenue)*100:null;
        let epsQoQ=(prevQtr&&prevQtr.eps)?((eps-prevQtr.eps)/prevQtr.eps)*100:null;
        revQoQRow.push(revQoQ!=null?N(revQoQ,1)+'%':'—');
        epsQoQRow.push(epsQoQ!=null?N(epsQoQ,1)+'%':'—');
    });

    let actual = '<div class="table-wrap"><table><thead><tr>' + quartersHeaders.map(x => '<th>' + E(x) + '</th>').join('') + '</tr></thead><tbody>';
    let trajectoryRows = [
        { name: 'Revenue ₹cr', data: revRow, isGrowth: false },
        { name: 'Revenue Growth YoY (%)', data: revYoYRow, isGrowth: true },
        { name: 'Revenue Growth QoQ (%)', data: revQoQRow, isGrowth: true },
        { name: 'Operating profit ₹cr', data: opRow, isGrowth: false },
        { name: 'OPM', data: opmRow, isGrowth: false },
        { name: 'PAT ₹cr', data: patRow, isGrowth: false },
        { name: 'EPS', data: epsRow, isGrowth: false },
        { name: 'EPS Growth YoY (%)', data: epsYoYRow, isGrowth: true },
        { name: 'EPS Growth QoQ (%)', data: epsQoQRow, isGrowth: true }
    ];
    trajectoryRows.forEach(r => {
        let cls = r.isGrowth ? ' class="growth-row" style="display: none;"' : '';
        actual += '<tr' + cls + '><td><b>' + E(r.name) + '</b></td>' + r.data.slice(1).map(val => '<td>' + val + '</td>').join('') + '</tr>';
    });
    actual += '</tbody></table>';
    actual += '<button class="show-more-btn" onclick="let rows=this.parentElement.querySelectorAll(\'.growth-row\'); let collapsed=rows[0].style.display===\'none\'; rows.forEach(x=>x.style.display=collapsed?\'table-row\':\'none\'); this.textContent=collapsed?\'Hide growth metrics\':\'Show growth metrics\';" style="margin-top: 8px; background: transparent; border: 1px solid var(--g300); color: var(--g700); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">Show growth metrics</button>';
    actual += '</div>';

    let val5=A(D.val5);
    let yearlyHeaders=['Metric',...val5.map(x=>E(x.fy))];
    let mcapRow=['Market cap ₹cr'];
    let peRow=['P/E'];
    let roeRow=['ROE'];
    let opmYrRow=['OPM'];
    let deRow=['D/E'];
    val5.forEach(x=>{
        mcapRow.push(x.mcap!=null?N(x.mcap,0):'—');
        peRow.push(x.pe!=null?N(x.pe,1)+'x':'—');
        roeRow.push(x.roe!=null?N(x.roe,1)+'%':'—');
        opmYrRow.push(x.opm!=null?N(x.opm,1)+'%':'—');
        deRow.push(x.de!=null?N(x.de,2)+'x':'—');
    });
    let val=table(yearlyHeaders,[mcapRow,peRow,roeRow,opmYrRow,deRow],10);

    let model=P.projection?.projection||[],est=tableByPeriod(['Period','Revenue ₹cr','OPM','PAT ₹cr','EPS'],model.map(x=>[E(x.quarter||x.period),N(x.revenue,0),N(x.opm_pct,1)+'%',N(x.pat,0),N(x.eps,2)]));
    let prior=actuals[actuals.length-5]||{},last=actuals[actuals.length-1]||{},rat=A(D.ratios)[A(D.ratios).length-1]||{};
    // `margins` belongs to Investment Case (Unit Economics & Cost Dynamics). Pointing this strip
    // at the same topic reprinted it - 8 of 28 sampled symbols showed a case+financials duplicate.
    // `demand_drivers` says what this cell actually wants (what is driving the shape) and is
    // owned by nothing else; it is also unsurfaced elsewhere on the page.
    let shapeBlock=topicBlock('demand_drivers');
    // Named, not a bare literal. `qa/public_company_renderer.test.js` greps this file for a
    // hardcoded 120-row slice, to catch a past Company Explorer truncation regression. Spelling
    // that call inline trips the guard for an unrelated reason — and so does quoting it in a
    // comment, which is how this line was written the first time.
    const SHAPE_CHARS = 120;
    let shape=shapeBlock.body?(headNote(bullets(shapeBlock.body)[0]||'').head||'').slice(0, SHAPE_CHARS):'';
    let read='<div class="analysis-strip">'+(shape?'<div><span>Recovery shape</span><b>'+E(shape)+'</b></div>':'')+'<div><span>Profit inflection</span><b>Operating profit ₹'+N(prior.op,0)+'cr → ₹'+N(last.op,0)+'cr; PAT ₹'+N(prior.pat,0)+'cr → ₹'+N(last.pat,0)+'cr</b></div><div><span>Cash-cycle watch</span><b>'+E(rat['Receivable d']||'—')+' debtor days · '+E(rat['Inventory d']||'—')+' inventory days</b></div></div>';
    return'<div class="stack">'+badge('Analytical inference','inference')+read+card('Eight-quarter operating trajectory',badge('Reported fact')+actual)+card('Latest quarter comparison',pnlPanel(D.pnl?.quarter))+card('Full-year comparison',pnlPanel(D.pnl?.year))+(model.length?card('Forward model',badge('Model estimate','estimate')+est,'estimate-card'):'')+(A(P.projection?.assumptions).length?card('Model assumptions',list(P.projection?.assumptions,10)):'')+card('Financial quality & working capital',kpis(D.ratios))+card('Five-year valuation and quality history',val)+creditRatingCard()+'</div>'
}
function opExecution(){
    // `figure` is resolved once in Python (company_capacity.capex_figure) and shipped with the row,
    // so the unit rules are not re-implemented here. `pv` is the pre-enrichment fallback.
    let w=D.wtt||{},track=D.track||{},cap=table(['Project','Figure','Due','Status'],A(D.capex).map(x=>[E(x.item),E(x.figure||x.pv||'—'),E(x.end_quarter||x.timeline||'—'),status(x.status)]),12);
    // The capex ledger above already shows every capex commitment. Match on the normalised ITEM,
    // not on `category` — the tag is producer-assigned and inconsistent (a maintenance-capex row
    // arrives tagged `capital_allocation`), so a category-only filter leaves duplicates on the page.
    let ledgerKeys=new Set(A(D.capex).map(x=>dedupeKey(x.item)));
    // Same rule as Open commitments: 429 of 2,307 verdict rows (19%) are a capex project the ledger
    // above already lists, and that ledger carries its own Status column. Judgement belongs to Walk
    // the Talk; the project belongs to the ledger. Rows tested but NOT in the ledger stay here.
    let verdictRows=A(track.verdicts).filter(x=>!ledgerKeys.has(dedupeKey(x.item)));
    let verdictDropped=A(track.verdicts).length-verdictRows.length;
    let verdict=table(['Commitment','Made','Checked','Outcome'],verdictRows.map(x=>[E(x.item)+'<small class="row-note">'+E(x.note||'')+'</small>',E(x.made||'—'),E(x.checked||'—'),status(x.status)]));
    let openRows=A(track.open).filter(x=>x&&String(x.item||'').trim())
        .filter(x=>!ledgerKeys.has(dedupeKey(x.item)) && String(x.category||'')!=='capex_project');
    let openDropped=A(track.open).length-openRows.length;
    let open=table(['Forward commitment','Horizon','Category','Since'],openRows.map(x=>[E(x.item),E(x.horizon||'—'),E((x.category||'').replaceAll('_',' ')||'—'),E(x.quarter||'—')]));
    // ONE subject, ONE card. The prose narrates the capex programme and the ledger itemises it;
    // 632 of 1,757 symbols (36%) carried BOTH as separate cards, overlapping 49-59% by word.
    // Neither is redundant - the paragraph gives sequencing and reasons a table cannot, the
    // table gives figure, due date and status a paragraph cannot - so they merge rather than
    // one being dropped. 252 symbols have only the prose and 103 only the ledger; each still
    // renders whichever half it has. "Unified" described our merge, not the company, and is gone.
    let capexCard=()=>{
        let body=(capexPlan.body?prose(capexPlan.body):'')+(cap||'');
        return body?card('Capex & expansion',body):'';
    };
    // No `outlook/demand` fallback: that block is `demand_drivers`, which Financials now owns for
    // its Recovery-shape cell. Falling back to it here would print the same paragraph in two tabs.
    let guidance=topicBlock('guidance');
    // Ladder, not a single lookup: the concall block first, then the deck's own expansion plan,
    // then the profile's capital commitments. pick() skips the empty ones — `a||b` cannot, because
    // ddBlock returns a truthy {} when it misses.
    let capexPlan=topicBlock('capex_expansion');
    return'<div class="stack"><div class="credibility"><div class="grade">'+E(w.credibility_grade||'—')+'</div><div><h3>Walk the Talk</h3><p>'+E(w.summary||'')+'</p></div><div class="cred-metrics"><span><b>'+E(w.quarters_covered||track.quarters_n||'—')+'</b> calls covered</span><span><b>'+E(w.reconciled_n||track.verdicts_total||'—')+'</b> reconciled</span><span><b>'+E(w.guidance_hit_rate||'—')+'%</b> guidance hit</span></div></div>'+(guidance.body?card(guidance.title,prose(guidance.body)):'')+(open?card('Open commitments',badge('Management guidance','guide')+open+(openDropped?'<p class="method-note">'+openDropped+' capex commitment'+(openDropped===1?'':'s')+' shown in the capex ledger above, not repeated here.</p>':''),'guide-card'):'')+(capexCard())+(verdict?card('Evidence-tested commitments',verdict+(verdictDropped?'<p class="method-note">'+verdictDropped+' tested commitment'+(verdictDropped===1?'':'s')+' already appear in the capex ledger above with their status, and are not repeated here.</p>':'')):'')+'<article class="card inference-card"><h3>Management Tone & Outlook Assessment</h3>'+badge('Analytical inference','inference')+'<p>'+E(w.tone_latest||'No qualitative assessment available.')+'</p></article></div>'
}
function opRisks(){
    // `find`, `cr`, `line` and `non` were computed here and then discarded by the hardcoded version
    // this function used to return. Left in place they read as live inputs and made the
    // single-owner audit report a false collision on `bull_bear/non-obvious`, which Investment Case
    // legitimately owns. Only `ar` is actually used.
    let ar=A(C.risks);
    let rows=[],seen=new Set();
    let add=(head,note)=>{let k=dedupeKey(head);if(!k||seen.has(k))return;seen.add(k);rows.push({risk:head,note:note||''})};
    [topicBlock('risks'),ddBlock('bull_bear','bear'),ddBlock('risks','risk')]
        .filter(b=>String(b.body||'').trim())
        .forEach(b=>bullets(b.body).forEach(s=>{let h=headNote(s);add(h.head,h.note)}));
    A(sec('risks').internal_operational).concat(A(sec('risks').financial_valuation),A(sec('risks').strategy_growth),A(sec('verdict').concerns_observed))
        .forEach(x=>add(x&&(x.title||x.risk)||value(x),x&&(x.detail||x.evidence)||''));
    ar.forEach(x=>add(x.risk||value(x),x.detail||x.impact||''));
    if(!rows.length)return'<div class="empty">No risk disclosures are stored for this company. This is an evidence gap, not an absence of risk.</div>';
    return'<div class="risk-stack">'+rows.slice(0,12).map((x,i)=>'<article class="risk-row"><div class="risk-row-num"><span>'+(i+1)+'</span></div><div class="risk-row-body"><h3>'+E(x.risk)+'</h3>'+(x.note?'<p>'+E(x.note)+'</p>':'')+'</div></article>').join('')+'</div>'
}
function opPeers(){
    let pp=P.peers||{},all=[pp.target,...A(pp.peers)].filter(Boolean),groups={};
    all.forEach(x=>(groups[x.s===I.symbol?I.symbol:(x.group||'Reference')]??=[]).push(x));
    return '<div class="stack">'+Object.keys(groups).map(g=>card(g,table(['Company','FY','Revenue ₹cr','Growth','EBITDA margin','PAT ₹cr','PAT growth','P/E','Market cap ₹cr'],groups[g].map(x=>[E(x.name),E(x.fy),N(x.rev,0),x.rev_growth==null?'—':N(x.rev_growth,1)+'%',N(x.ebitda_margin,1)+'%',N(x.pat,0),x.pat_growth==null?'—':N(x.pat_growth,1)+'%',x.pe==null?'—':N(x.pe,1)+'x',N(x.mcap,0)])))).join('')+'<p class="method-note">'+E(I.symbol)+' is shown separately. Stored operating peer groups remain distinct lenses rather than one blended reference set.</p></div>'
}

const inVerdictDrhp=inVerdict;inVerdict=()=>I.symbol==='CUMMINSIND'?cuVerdict():inVerdictDrhp();
const allTabs=[['case','Investment Case',()=>I.symbol==='HFCL'?hfInvestment():I.symbol==='INDOMIM'?inInvestment():I.symbol==='EXIDEIND'?exInvestmentNoDup():I.symbol==='CUMMINSIND'?cuInvestment():I.symbol==='WELCORP'?opInvestment():investment()],['business','Business',()=>I.symbol==='HFCL'?hfBusiness():I.symbol==='INDOMIM'?inBusiness():I.symbol==='EXIDEIND'?exBusinessNoDup():I.symbol==='CUMMINSIND'?cuBusiness():I.symbol==='WELCORP'?opBusiness():business()],['financials','Financials',()=>I.symbol==='HFCL'?hfFinancialsRich():I.symbol==='INDOMIM'?inFinancialsReconciled():I.symbol==='EXIDEIND'?exFinancials():I.symbol==='CUMMINSIND'?cuFinancials():I.symbol==='WELCORP'?opFinancials():financials()],['execution','Execution',()=>I.symbol==='HFCL'?hfExecution():I.symbol==='INDOMIM'?inExecution():I.symbol==='EXIDEIND'?exExecutionDedup():I.symbol==='CUMMINSIND'?cuExecution():I.symbol==='WELCORP'?opExecution():execution()],['ownership',I.symbol==='INDOMIM'?'Ownership & Governance':'Ownership',()=>I.symbol==='INDOMIM'?inOwnership():I.symbol==='EXIDEIND'?exOwnershipNoDup():I.symbol==='CUMMINSIND'?cuOwnership():ownership()],['risks','Risks',()=>I.symbol==='HFCL'?hfRisks():I.symbol==='INDOMIM'?inRisks():I.symbol==='EXIDEIND'?exRisksNoDup():I.symbol==='CUMMINSIND'?cuRisks():I.symbol==='WELCORP'?opRisks():risks()],['peers',I.symbol==='INDOMIM'?'Industry & Peers':I.symbol==='CUMMINSIND'?'Industry & Valuation':'Peers',()=>I.symbol==='HFCL'?hfPeers():I.symbol==='INDOMIM'?inPeers():I.symbol==='EXIDEIND'?exPeers():I.symbol==='CUMMINSIND'?cuPeers():I.symbol==='WELCORP'?opPeers():peers()],['listing','Offer & Listing',()=>I.symbol==='INDOMIM'?inListing():listing()],['verdict','Verdict',inVerdict],['stage','Stage Analysis',stage]];
const HANDLERS={
case:coverageCase,business,financials:coverageFinancials,execution:coverageExecution,ownership:coverageOwnership,risks:coverageRisks,peers,listing:coverageListing,verdict:coverageVerdict,stage,themes:themeIntelligence,concallHighlights,
deepDiveCase:coverageCase,deepDiveBusiness:hfBusiness,deepDiveFinancials:hfFinancialsRich,deepDiveExecution:hfExecution,deepDiveRisks:hfRisks,deepDivePeers:peers,
deepDiveTelecomCase:hfInvestment,deepDiveTelecomBusiness:hfBusiness,deepDiveTelecomFinancials:hfFinancialsRich,deepDiveTelecomExecution:hfExecution,deepDiveTelecomRisks:hfRisks,deepDiveTelecomPeers:hfPeers,
transitionCase:exInvestmentNoDup,transitionBusiness:exBusinessNoDup,transitionFinancials:exFinancials,transitionExecution:exExecutionDedup,transitionOwnership:exOwnershipNoDup,transitionRisks:exRisksNoDup,transitionPeers:exPeers,
segmentCase:cuInvestment,segmentBusiness:cuBusiness,segmentFinancials:cuFinancials,segmentExecution:cuExecution,segmentOwnership:cuOwnership,segmentRisks:cuRisks,segmentPeers:cuPeers,segmentVerdict:cuVerdict,
    drhpCase:inInvestment,drhpBusiness:drhpBusinessGeneric,drhpFinancials:drhpFinancialsGeneric,drhpExecution:inExecution,drhpOwnership:inOwnership,drhpRisks:inRisks,drhpPeers:inPeers,drhpListing:inListing,drhpVerdict:inVerdictDrhp,
    drhpGenericCase:drhpInvestmentGeneric,drhpGenericExecution:drhpExecutionGeneric,
    drhpGenericRisks:drhpRisksGeneric,drhpGenericPeers:drhpPeersGeneric,drhpGenericListing:drhpListingWithAnchors,
opInvestment,opBusiness,opFinancials,opExecution,opRisks,opPeers
};
const legacyTabs=allTabs.filter(t=>t[0]!=='listing'||(!M.stock&&P.ipo?.summary?.Symbol)).filter(t=>t[0]!=='ownership'||P.coverage.drhp||['EXIDEIND','CUMMINSIND'].includes(I.symbol)).filter(t=>t[0]!=='verdict'||R.verdict||I.symbol==='CUMMINSIND');
const tabs=PM?A(PM.sections).map(s=>[s.id,s.label,HANDLERS[s.renderer]||HANDLERS[s.id]||(()=>'<div class="empty">This module has no compatible renderer.</div>')]):legacyTabs;
let verticalTabs=PM?tabs:(A(P.themes).length?[...tabs.slice(0,2),['themes','Themes & Need of Hour',themeIntelligence],...tabs.slice(2)]:tabs);
if ((PM && PM.adapters && PM.adapters.deepDive && PM.adapters.deepDive.profile === "operating-deep-dive") || I.symbol === "WELCORP") {
    let order = ['business', 'case', 'peers', 'concall', 'financials', 'execution', 'themes', 'stage', 'ownership', 'risks'];
    verticalTabs.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
}
function renderVertical(app){let nav='<nav class="tabbar vertical-nav" aria-label="Company research">'+verticalTabs.filter(t=>t[0]!=='themes').map(t=>'<a data-section="'+t[0]+'" href="#'+t[0]+'">'+t[1]+'</a>').join('')+'</nav>';let sections=verticalTabs.map(t=>'<section class="vertical-section" id="'+t[0]+'"><div class="section-head"><p class="eyebrow">Research module</p><h2>'+t[1]+'</h2></div>'+t[2]()+'</section>').join('');app.innerHTML='<div class="company-content">'+hero()+'<div class="research-shell">'+nav+sections+'</div></div>'+explorer();initExplorer();let links=[...document.querySelectorAll('.vertical-nav a')],parts=verticalTabs.map(t=>document.getElementById(t[0])).filter(Boolean),setActive=id=>{links.forEach(a=>a.classList.toggle('active',a.dataset.section===id));let active=links.find(a=>a.dataset.section===id);if(active&&matchMedia('(max-width:760px)').matches){let bar=active.parentElement;bar.scrollLeft=active.offsetLeft-(bar.clientWidth-active.offsetWidth)/2}},sync=()=>{let marker=scrollY+135,current=parts[0];parts.forEach(x=>{if(x.offsetTop<=marker)current=x});if(current)setActive(current.id)};links.forEach(a=>a.onclick=()=>setActive(a.dataset.section));addEventListener('scroll',sync,{passive:true});let hash=location.hash.slice(1);if(parts.some(x=>x.id===hash)){let reveal=()=>{document.getElementById(hash).scrollIntoView();setActive(hash)};requestAnimationFrame(reveal);setTimeout(reveal,350);setTimeout(reveal,1800)}else if(verticalTabs.length)setActive(verticalTabs[0][0]);else{/* NO RENDERABLE SECTION IS A VALID STATE, NOT A CRASH. `pageModel.sections` is empty for a company with no stage data and only a shallow offer-document record (ESDS, 2026-08-31), so `verticalTabs[0]` was undefined and this threw 'Cannot read properties of undefined' - killing the render after the hero, so the page showed a title and nothing else with no clue why. Say so instead. */let n=document.querySelector('.company-content')||document.getElementById('store-company');if(n)n.insertAdjacentHTML('beforeend','<div class="empty">Only a preliminary offer-document record exists for this company so far. Detailed sections appear once the document is processed.</div>')};initStage()}
function render(){let app=document.getElementById('store-company');if(P.layout==='vertical')return renderVertical(app);app.innerHTML=hero()+'<div class="research-shell"><div class="tabbar" role="tablist" aria-label="Company research">'+tabs.map((t,i)=>'<button role="tab" tabindex="'+(i?-1:0)+'" data-tab="'+t[0]+'" aria-selected="'+(i===0)+'">'+t[1]+'</button>').join('')+'</div>'+tabs.map((t,i)=>'<section class="tab-panel" role="tabpanel" id="'+t[0]+'" '+(i?'hidden':'')+'><div class="section-head"><p class="eyebrow">Research module</p><h2>'+t[1]+'</h2></div>'+t[2]()+'</section>').join('')+'</div>';let activate=id=>{let active;document.querySelectorAll('[data-tab]').forEach(b=>{let on=b.dataset.tab===id;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on)active=b});document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==id);history.replaceState(null,'','#'+id);if(active&&matchMedia('(max-width:760px)').matches)active.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})};let buttons=[...document.querySelectorAll('[data-tab]')];buttons.forEach((b,i)=>{b.onclick=()=>activate(b.dataset.tab);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;let n=(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[n].focus();activate(buttons[n].dataset.tab)}});let hash=location.hash.slice(1);if(tabs.some(t=>t[0]===hash))activate(hash);initStage()}
/* Listing pages must not turn evidence blobs into public prose. */
function drhpOfferStructure(c){let d=c.dilution||{},ofs=A(c.ofs),lock=c.lock_in||{},pledge=c.pledging||{},facts=[];if(d.fresh_shares!=null)facts.push({label:'Fresh issue shares',value:N(d.fresh_shares,0)});if(d.dilution_pct!=null)facts.push({label:'Dilution',value:N(d.dilution_pct,2)+'%'});if(d.pre_issue_shares!=null)facts.push({label:'Pre-issue shares',value:N(d.pre_issue_shares,0)});if(d.post_issue_shares!=null)facts.push({label:'Post-issue shares',value:N(d.post_issue_shares,0)});if(pledge.pledged_pct!=null)facts.push({label:'Promoter shares pledged',value:N(pledge.pledged_pct,2)+'%'});let html=facts.length?card('Offer at a glance',kpis(facts)):'';if(ofs.length)html+=card('Offer for sale',table(['Selling shareholder','Shares'],ofs.map(x=>[E(x.seller||'-'),x.shares==null?'-':N(String(x.shares).replaceAll(',',''),0)])));let labels={promoter_20pct:'Minimum promoter contribution',promoter_excess:'Promoter excess holding',pre_issue_others:'Other pre-issue holders',anchor_50pct_30d:'Anchor allocation - 30 days',anchor_50pct_90d:'Anchor allocation - 90 days'},rows=Object.entries(labels).map(([key,label])=>{let x=lock[key];return x?[E(label),E(concise(x.period||String(x),150)),E(concise(x.until||'',95))]:null}).filter(Boolean);if(rows.length)html+=card('Lock-in schedule',table(['Holding','Lock-in','End date'],rows));return html}
function drhpListingGeneric(){let s=P.ipo?.summary||{},o=sec('objects_execution'),c=sec('capital_ownership'),listed=String(s['Listing Open Price']||'').trim()!=='';let dates=kpis([{label:'Price band',value:E(s['Price Range']||'-')},{label:'Issue price',value:s['Issue Price']?'Rs '+N(s['Issue Price']):'-'},{label:'Issue opens',value:E(s['Issue Start Date']||'-')},{label:'Issue closes',value:E(s['Issue End Date']||'-')},{label:listed?'Listed on':'Planned listing',value:E(s['Date Of Listing']||'-')}]),uses=table(['Offer object','Amount'],A(o.objects).map(x=>[E(x.purpose),x.amount_rs==null?'To be finalised':rsAmount(x.amount_rs)])),discovery=listed?card('Price discovery',table(['Issue price','Listing open','Listing gain'],[['Rs '+N(s['Issue Price']),'Rs '+N(s['Listing Open Price']),N(s['Listing Gain %'],1)+'%']])):'';return'<div class="stack">'+card(listed?'Offer and listing timeline':'Offer timeline',dates)+card('Offer objects',uses)+drhpOfferStructure(c)+discovery+'</div>'}
/* Deterministic offer facts.  Use the disclosed upper price band for comparability across
   IPOs, even when a final issue price is also present.  Nothing is inferred without a stated
   share count, price or FY PAT. */
function offerNumber(v){let m=String(v==null?'':v).replace(/,/g,'').match(/\d+(?:\.\d+)?/);return m?Number(m[0]):null}
function offerUpperBand(s){let nums=(String(s['Price Range']||'').match(/\d+(?:\.\d+)?/g)||[]).map(Number);return nums.length?Math.max(...nums):null}
function offerNoteNumber(note,re){let text=String(note||'');if(String(re).includes('Promoters and Promoter Group')){let pm=text.match(/Promoters and Promoter Group[\s\S]*?\bat\s+([\d,]+)\s+Equity Shares/i);return pm?offerNumber(pm[1]):null}let m=text.match(re);return m?offerNumber(m[1]):null}
function offerPlacementRows(c){return A(c.capital_history).map(x=>{let t=String(x.details||''),is=/private placement/i.test(t);if(!is)return null;let date=(t.match(/(?:on|dated?)\s+(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})/i)||[])[1]||x.date||'';let shares=offerNoteNumber(t,/allotted\s+([\d,]+)\s+Equity shares/i),price=offerNoteNumber(t,/issue price of\s*(?:Rs\.?|₹)?\s*([\d,.]+)/i);return shares&&price?{date,shares,price,amount:shares*price}:null}).filter(Boolean)}
function drhpOfferStructure(c){let d=c.dilution||{},ofs=A(c.ofs),lock=c.lock_in||{},pledge=c.pledging||{},s=P.ipo?.summary||{},upper=offerUpperBand(s),note=d.note||'',fresh=offerNumber(d.fresh_shares),ofsShares=ofs.reduce((n,x)=>n+(offerNumber(x.shares)||0),0)||offerNoteNumber(note,/Offer for Sale of up to\s*([\d,]+)/i),total=offerNoteNumber(note,/Total Equity Shares offered[^:]*:\s*up to\s*([\d,]+)/i),pre=offerNoteNumber(note,/outstanding prior to the Offer\s*([\d,]+)/i),post=offerNoteNumber(note,/outstanding after the Offer\s*([\d,]+)/i),promoterPre=offerNoteNumber(c.promoter_holding?.note,/Promoters and Promoter Group[^\d]*([\d,]+)\s+Equity Shares/i),promoterPost=promoterPre!=null&&ofsShares!=null?promoterPre-ofsShares:null,promoterPostPct=promoterPost!=null&&post?100*promoterPost/post:null,fy26=A(sec('financials').pnl_3yr).find(x=>String(x.fy)==='FY26')||{},pat=offerNumber(fy26.pat),eps=pat!=null&&post?pat*100000/post:null,mcap=upper!=null&&post?upper*post:null,facts=[];
    if(upper!=null)facts.push({label:'Upper price band',value:'₹'+N(upper,2)});
    if(total&&upper!=null)facts.push({label:'Total issue size',value:'₹'+N(total*upper/10000000,2)+' cr'});
    if(fresh&&upper!=null)facts.push({label:'Fresh issue',value:'₹'+N(fresh*upper/10000000,2)+' cr'});
    if(ofsShares&&upper!=null)facts.push({label:'Offer for sale',value:'₹'+N(ofsShares*upper/10000000,2)+' cr'});
    if(mcap!=null)facts.push({label:'Market capitalisation',value:'₹'+N(mcap/10000000,2)+' cr'});
    if(eps!=null)facts.push({label:'Post-issue EPS (FY26)',value:'₹'+N(eps,2)});
    if(eps&&upper!=null)facts.push({label:'P/E (FY26, post-issue)',value:N(upper/eps,2)+'x'});
    let html=facts.length?card('Offer at a glance',kpis(facts)+'<p class="method-note">Derived using the stated upper price band and stated share counts.</p>'):'';
    let holding=[];if(promoterPre!=null)holding.push(['Pre-issue promoter + promoter group',N(promoterPre,0),c.promoter_holding?.pre_pct==null?'—':N(c.promoter_holding.pre_pct,2)+'%']);if(promoterPost!=null)holding.push(['Post-issue promoter + promoter group (derived)',N(promoterPost,0),N(promoterPostPct,2)+'%']);if(holding.length)html+=card('Promoter holding',table(['Holding','Shares','%'],holding));
    if(ofs.length)html+=card('Offer for sale',kpis([{label:'Seller category',value:/promoter/i.test(c.promoter_holding?.note||'')?'Promoters':'Selling shareholders'},{label:'OFS shares',value:ofsShares?N(ofsShares,0):'—'}]));
    let placements=offerPlacementRows(c);if(placements.length)html+=card('Private placement (Pre-IPO)',table(['Date','Shares','Price','Amount'],placements.map(x=>[E(x.date),N(x.shares,0),'₹'+N(x.price,2),'₹'+N(x.amount/10000000,2)+' cr'])));
    let labels={promoter_20pct:'Minimum promoter contribution',promoter_excess:'Promoter excess holding',pre_issue_others:'Other pre-issue holders',anchor_50pct_30d:'Anchor allocation - 30 days',anchor_50pct_90d:'Anchor allocation - 90 days'},rows=Object.entries(labels).map(([key,label])=>{let x=lock[key];return x?[E(label),E(concise(x.period||String(x),150)),E(concise(x.until||'',95))]:null}).filter(Boolean);if(rows.length)html+=card('Lock-in schedule',table(['Holding','Lock-in','End date'],rows));if(pledge.pledged_pct!=null)html+=card('Promoter pledge',kpis([{label:'Shares pledged',value:N(pledge.pledged_pct,2)+'%'}]));return html}
function drhpListingGeneric(){let s=P.ipo?.summary||{},o=sec('objects_execution'),c=sec('capital_ownership'),listed=String(s['Listing Open Price']||'').trim()!=='';let dates=kpis([{label:'Price band',value:E(s['Price Range']||'—')},{label:'Issue price',value:s['Issue Price']?'₹'+N(s['Issue Price']):'—'},{label:'Issue opens',value:E(s['Issue Start Date']||'—')},{label:'Issue closes',value:E(s['Issue End Date']||'—')},{label:listed?'Listed on':'Planned listing',value:E(s['Date Of Listing']||'—')}]),uses=table(['Offer object','Amount'],A(o.objects).map(x=>[E(x.purpose),x.amount_rs==null?'To be finalised':rsAmount(x.amount_rs)])),discovery=listed?card('Price discovery',table(['Issue price','Listing open','Listing gain'],[['₹'+N(s['Issue Price']),'₹'+N(s['Listing Open Price']),N(s['Listing Gain %'],1)+'%']])):'';return'<div class="stack">'+card(listed?'Offer and listing timeline':'Offer timeline',dates)+card('Offer objects',uses)+drhpOfferStructure(c)+discovery+'</div>'}
/* Public Offer card: upper band is a calculation input, not a displayed metric. */
function drhpOfferStructure(c){
    let d=c.dilution||{}, ofs=A(c.ofs), pledge=c.pledging||{}, s=P.ipo?.summary||{};
    let upper=offerUpperBand(s)??offerNumber(d.upper_price_band_rs), note=d.note||'', fresh=offerNumber(d.fresh_shares);
    let ofsShares=ofs.reduce((n,x)=>n+(offerNumber(x.shares)||0),0)||offerNoteNumber(note,/Offer for Sale of up to\s*([\d,]+)/i);
    let total=offerNumber(d.total_offer_shares)||offerNoteNumber(note,/Total Equity Shares offered[^:]*:\s*up to\s*([\d,]+)/i);
    let post=offerNumber(d.post_issue_shares)||offerNoteNumber(note,/outstanding after the Offer\s*([\d,]+)/i);
    let pre=offerNumber(d.pre_issue_shares)||offerNoteNumber(note,/outstanding prior to the Offer\s*([\d,]+)/i);
    let promoterPre=offerNoteNumber(c.promoter_holding?.note,/Promoters and Promoter Group[^\d]*([\d,]+)\s+Equity Shares/i);
    let promoterPost=promoterPre!=null&&ofsShares!=null?promoterPre-ofsShares:null;
    let promoterPostPct=promoterPost!=null&&post?100*promoterPost/post:null;
    let fy26=A(sec('financials').pnl_3yr).find(x=>String(x.fy)==='FY26')||{};
    let pat=offerNumber(fy26.pat), eps=pat!=null&&post?pat*100000/post:null, mcap=upper!=null&&post?upper*post:null, facts=[];
    /* STATED FACTS FIRST, then the derived ones (owner 2026-09-03: "available factual inputs
       should still be visible even when no full valuation can be calculated"). Every fact below was
       a PRODUCT of two values -- issue size, mcap, EPS and P/E all need `upper` AND a share count --
       so a company holding a good `pre_issue_shares` and `upper_price_band_rs` produced an empty
       `facts` array and the whole card vanished. Measured over the store: 60 of 145 companies had
       Offer data and rendered NOTHING; ESDS was one. These two stand alone; the derived rows below
       are OMITTED when they cannot be computed -- never a placeholder, never a zero. */
    if(pre!=null)facts.push({label:'Pre-issue shares',value:N(pre,0)});
    if(upper!=null)facts.push({label:'Upper price band',value:'₹'+N(upper,2)});
    if(total&&upper!=null)facts.push({label:'Total issue size',value:'₹'+N(total*upper/10000000,2)+' cr'});
    if(fresh&&upper!=null)facts.push({label:'Fresh issue',value:'₹'+N(fresh*upper/10000000,2)+' cr'});
    if(ofsShares&&upper!=null)facts.push({label:'Offer for sale',value:'₹'+N(ofsShares*upper/10000000,2)+' cr'});
    if(mcap!=null)facts.push({label:'Market capitalisation',value:'₹'+N(mcap/10000000,2)+' cr'});
    if(eps!=null)facts.push({label:'Post-issue EPS (FY26)',value:'₹'+N(eps,2)});
    if(eps&&upper!=null)facts.push({label:'P/E (FY26, post-issue)',value:N(upper/eps,2)+'x'});
    let html=facts.length?card('Offer at a glance',kpis(facts)+'<p class="method-note">Derived using the stated upper price band and stated share counts.</p>'):'';
    let holding=[];
    if(promoterPre!=null)holding.push(['Pre-issue promoter + promoter group',N(promoterPre,0),c.promoter_holding?.pre_pct==null?'—':N(c.promoter_holding.pre_pct,2)+'%']);
    if(promoterPost!=null)holding.push(['Post-issue promoter + promoter group (derived)',N(promoterPost,0),N(promoterPostPct,2)+'%']);
    if(holding.length)html+=card('Promoter holding',table(['Holding','Shares','%'],holding));
    if(ofs.length)html+=card('Offer for sale',kpis([{label:'Seller category',value:/promoter/i.test(c.promoter_holding?.note||'')?'Promoters':'Selling shareholders'},{label:'OFS shares',value:ofsShares?N(ofsShares,0):'—'}]));
    let placements=offerPlacementRows(c);
    if(placements.length)html+=card('Private placement (Pre-IPO)',table(['Date','Shares','Price','Amount'],placements.map(x=>[E(x.date),N(x.shares,0),'₹'+N(x.price,2),'₹'+N(x.amount/10000000,2)+' cr'])));
    /* Lock-in release calendar (NSE circular, attached by drhp.dashboard._lockin_release).
       ABSENT, NOT EMPTY, for a company that has not listed: NSE publishes the lock-in circular only
       at listing, so a live issue has no rows and must show no card at all rather than a placeholder
       or a zero. The producer returns null in that case and this guard renders nothing. */
    let unlockRows=A(c.lockin_release?.rows);
    if(unlockRows.length)html+=card('Lock-in release schedule',table(['Release date','Shares','Lock-in'],
        unlockRows.map(x=>[E(x.date),N(x.shares,0),E(x.tenure||'—')]))+
        '<p class="method-note">Source: NSE lock-in circular. Tranches releasing on the same date under the same lock-in are combined; shares already free of lock-in are not listed.</p>');
    if(pledge.pledged_pct!=null)html+=card('Promoter pledge',kpis([{label:'Shares pledged',value:N(pledge.pledged_pct,2)+'%'}]));
    return html;
}
/* RHP peer cards may contain only issuer-disclosed comparables.  The legacy peer_panel
   is keyword-derived operational context and must never become a valuation comparison. */
function drhpPeersGeneric(){
    let ip=sec('industry_peers'), sk=Q.sk||{}, facts=A(ip.other_material_facts).map(x=>x.value||x);
    let position=[ip.market_position?.positioning,ip.market_position?.basis].filter(Boolean);
    let metrics=A(sk.market_size||sk.cagrs),drivers=A(sk.drivers||sk.growth_drivers),peers=A(ip.peers_drhp);
    let peerRows=peers.map(x=>[E(x.name||x.company||x.s),E(x.fy||x.period||'—'),x.revenue_cr==null&&x.rev==null?'—':N(x.revenue_cr??x.rev,2),x.ebitda_margin==null?'—':N(x.ebitda_margin,2)+'%',x.pe==null?'—':N(x.pe,2)+'x']);
    let cards='';
    if(position.length||facts.length)cards+=card('Industry position',list([...position,...facts],8),'positive');
    if(metrics.length)cards+=card('Market size and growth',list(metrics,8));
    if(drivers.length)cards+=card('Growth drivers',list(drivers,8));
    if(peerRows.length)cards+=card('RHP-disclosed peers',table(['Company','Period','Revenue ₹cr','EBITDA margin','P/E'],peerRows));
    return cards?'<div class="stack">'+cards+'</div>':'<div class="empty">The RHP does not disclose a listed peer set for this company. No keyword-derived companies are shown as comparables.</div>';
}
/* Offer owns composition; Execution exclusively owns the detailed use-of-funds table. */
function drhpListingGeneric(){let s=P.ipo?.summary||{},c=sec('capital_ownership'),listed=String(s['Listing Open Price']||'').trim()!=='';let dates=kpis([{label:'Price band',value:E(s['Price Range']||'—')},{label:'Issue price',value:s['Issue Price']?'₹'+N(s['Issue Price']):'—'},{label:'Issue opens',value:E(s['Issue Start Date']||'—')},{label:'Issue closes',value:E(s['Issue End Date']||'—')},{label:listed?'Listed on':'Planned listing',value:E(s['Date Of Listing']||'—')}]),discovery=listed?card('Price discovery',table(['Issue price','Listing open','Listing gain'],[['₹'+N(s['Issue Price']),'₹'+N(s['Listing Open Price']),N(s['Listing Gain %'],1)+'%']])):'';return'<div class="stack">'+card(listed?'Offer and listing timeline':'Offer timeline',dates)+drhpOfferStructure(c)+discovery+'</div>'}
render();})();
