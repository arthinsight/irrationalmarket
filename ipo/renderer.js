
document.querySelectorAll('.tabbtn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tabbtn').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tabpanel').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); document.getElementById(b.dataset.tab).classList.add('active');
}));
const DASH='<span class="subtle">\u2013</span>';
function numv(v){return (v==null||v==='')?null:(+v);}
function f2(v){return (v==null||isNaN(v))?DASH:(+v).toFixed(2);}
function f0(v){return (v==null||isNaN(v))?DASH:Math.round(+v).toLocaleString('en-IN');}
function clsv(v){return v==null?'':(v>0?'pos':(v<0?'neg':''));}

// ===== IPO Analysis (Goal 1) =====
// Phase-2 split: the ~1 MB row array is no longer inline — `sme-data` holds a pointer to
// data/sme.json and we fetch it on the FIRST activation of this tab (same pattern as Concall and the
// Momentum-2 stage history). `SME` stays a mutable binding in this closure, so every function below
// reads the rows through it exactly as before; only the moment they arrive has changed.
let SME=[];
let SMECFG={}; try{SMECFG=JSON.parse(document.getElementById('sme-data').textContent||'{}');}catch(e){}
/* Days, not sessions: master's ATH snapshot reports days_since_ath in CALENDAR days. 21 days is
   the same screen the old `<15 sessions` filter backed, restated in the unit the data now uses. */
const ATH_RECENT_DAYS=21;
const smeState={sort:'rfl',dir:-1,board:'ALL',exch:'ALL',heldlow:false,ath15:false};
const NUMCOLS=['mc','avt','ip','lo','lg','lc','rfl','dd','mdl','dath','r30','r90','r180'];
const PCTCOLS=['lg','rfl','dd','mdl','r30','r90','r180'];
// listing-date columns sort chronologically, not lexically. Values are "DD-MON-YYYY"
// (e.g. 22-APR-2026), occasionally numeric "DD-MM-YYYY", or '-'/'' when not yet listed.
const DATECOLS=['ld','Date Of Listing','Issue Date'];
const _MON={JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};
function dparse(s){if(!s||typeof s!=='string')return NaN;s=s.trim().toUpperCase();
  let m=s.match(/^(\d{1,2})[-\/\s]([A-Z]{3})[-\/\s](\d{4})$/);
  if(m){const mo=_MON[m[2]];return mo==null?NaN:Date.UTC(+m[3],mo,+m[1]);}
  m=s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if(m)return Date.UTC(+m[3],+m[2]-1,+m[1]);
  return NaN;}
function cmpKey(k,x,y,dir){const dx=dparse(x),dy=dparse(y);
  if(isNaN(dx))return 1; if(isNaN(dy))return -1; return dir*(dx-dy);}
const SCOLS=[{k:'sym',t:'Symbol'},{k:'ex',t:'Exch'},{k:'mc',t:'Mkt Cap (Cr)'},
 {k:'lc',t:'Last Close'},{k:'rfl',t:'Ret from List %'},{k:'r30',t:'30D %'},{k:'r90',t:'90D %'},{k:'r180',t:'180D %'},{k:'ld',t:'Listing'},
 {k:'lo',t:'List Open'},{k:'lg',t:'Listing Gain %'},{k:'avt',t:'Avg Val 10D (Cr)'},
 {k:'dd',t:'Drawdown %'},{k:'mdl',t:'DD From List Low %'},{k:'dath',t:'Days Since ATH'},{k:'al',t:'Above List'},{k:'lm',t:'Lead Manager'},
 {k:'co',t:'Company'},{k:'bd',t:'Board'},{k:'ip',t:'Issue'}];
function boardRows(){return SME.filter(r=>(smeState.board==='ALL'||r.bd===smeState.board)&&(smeState.exch==='ALL'||r.ex===smeState.exch));}
function smeFilters(){return {q:(document.getElementById('f-q').value||'').toLowerCase().trim(),
  al:document.getElementById('f-al').value,lm:document.getElementById('f-lm').value,
  anc:(document.getElementById('f-anc').value||'').toLowerCase().trim(),
  mc:numv(document.getElementById('f-mc').value),avt:numv(document.getElementById('f-avt').value),
  dd:numv(document.getElementById('f-dd').value),rfl:numv(document.getElementById('f-rfl').value)};}
function renderSME(){
  const fl=smeFilters();
  let rows=boardRows().filter(r=>{
    if(smeState.heldlow && !(r.mdl!=null && r.mdl>=-10))return false;
    if(smeState.ath15 && !(r.dath!=null && r.dath<ATH_RECENT_DAYS))return false;
    if(fl.q && !((r.sym||'').toLowerCase().includes(fl.q)||(r.co||'').toLowerCase().includes(fl.q)))return false;
    if(fl.al && r.al!==fl.al)return false;
    if(fl.lm && r.lm!==fl.lm)return false;
    if(fl.anc && !(((r.anc||'')+'|'+(r.own||'')).toLowerCase().includes(fl.anc)))return false;
    if(fl.mc!=null && !(r.mc!=null && r.mc>=fl.mc))return false;
    if(fl.avt!=null && !(r.avt!=null && r.avt>=fl.avt))return false;
    if(fl.dd!=null && !(r.dd!=null && r.dd>=fl.dd))return false;
    if(fl.rfl!=null && !(r.rfl!=null && r.rfl>=fl.rfl))return false;
    return true;});
  const s=smeState.sort,dir=smeState.dir;
  rows.sort((a,b)=>{let x=a[s],y=b[s];
    if(x==null||x==='')return 1; if(y==null||y==='')return -1;
    if(DATECOLS.includes(s))return cmpKey(s,x,y,dir);
    if(typeof x==='string'&&typeof y==='string')return dir*x.localeCompare(y);
    return dir*(x-y);});
  let h='<table><tr>'+SCOLS.map(c=>`<th class="sortable" data-k="${c.k}">${c.t}${smeState.sort===c.k?(dir<0?' \u25bc':' \u25b2'):''}</th>`).join('')+'</tr>';
  for(const r of rows){h+='<tr>'+SCOLS.map(c=>{const v=r[c.k];
    if(c.k==='al')return `<td>${v==null?'':`<span class="pill ${v==='Yes'?'pill-y':'pill-n'}">${v}</span>`}</td>`;
    if(c.k==='sym')return `<td><b>${v||''}</b></td>`;
    if(c.k==='co'||c.k==='lm'||c.k==='ld'||c.k==='bd'||c.k==='ex')return `<td>${v==null?'':v}</td>`;
    if(c.k==='mc')return `<td>${f0(v)}</td>`;
    if(c.k==='dath')return `<td>${v==null?DASH:v}</td>`;
    if(PCTCOLS.includes(c.k))return `<td class="${clsv(v)}">${f2(v)}</td>`;
    return `<td>${f2(v)}</td>`;}).join('')+'</tr>';}
  document.getElementById('sme-table').innerHTML=h+'</table>';
  document.getElementById('sme-count').textContent=`${rows.length} of ${boardRows().length} ${smeState.board==='ALL'?'IPOs':smeState.board+' IPOs'}`;
  document.querySelectorAll('#sme-table th.sortable').forEach(th=>th.onclick=()=>{
    const k=th.dataset.k;
    if(smeState.sort===k)smeState.dir*=-1; else{smeState.sort=k;smeState.dir=(NUMCOLS.includes(k)||DATECOLS.includes(k))?-1:1;}
    renderSME();});
}
function smeKPIs(){
  const u=boardRows(),have=u.filter(r=>r.bs>0),up=have.filter(r=>r.al==='Yes').length;
  const held=have.filter(r=>r.mdl!=null && r.mdl>=-10).length;
  const ath=have.filter(r=>r.dath!=null && r.dath<ATH_RECENT_DAYS).length;
  const med=a=>{const v=a.filter(x=>x!=null).sort((p,q)=>p-q);return v.length?v[Math.floor(v.length/2)]:null;};
  const k=[['IPOs',u.length],['With price data',have.length],['Above listing',up],
    ['Never >10% below list low',held],['ATH last 3wk',ath],['Median listing gain %',f2(med(have.map(r=>r.lg)))]];
  document.getElementById('sme-kpis').innerHTML=k.map(x=>`<div class="card"><div class="kpi-l">${x[0]}</div><div class="kpi-v">${x[1]}</div></div>`).join('');
}
function smeRefresh(){smeKPIs();renderSME();}
// Runs AFTER the rows arrive, never at load. It opens with an emptiness guard that returns early,
// so while the payload was inline this could be an IIFE — now that the rows are fetched, calling it
// at load would hit that guard, print "No IPO data" and return BEFORE wiring anything. Keep it a
// plain function; the loader below calls it once the fetch resolves.
function smeInit(){
  if(!SME.length){document.getElementById('sme-table').innerHTML='<div class="empty">No IPO data \u2014 run: python -m IPO_Listing.sme_dashboard</div>';return;}
  const lms=[...new Set(SME.map(r=>r.lm).filter(Boolean))].sort();
  document.getElementById('f-lm').insertAdjacentHTML('beforeend',lms.map(l=>`<option>${l}</option>`).join(''));
  const ancs=[...new Set(SME.flatMap(r=>((r.anc||'')+'|'+(r.own||'')).split('|').filter(Boolean)))].sort();
  document.getElementById('anc-list').innerHTML=ancs.map(a=>`<option value="${a.replace(/"/g,'&quot;')}"></option>`).join('');
  document.querySelectorAll('#f-board .segbtn').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('#f-board .segbtn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');smeState.board=b.dataset.board;smeRefresh();}));
  document.querySelectorAll('#f-exch .segbtn').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('#f-exch .segbtn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');smeState.exch=b.dataset.exch;smeRefresh();}));
  const hl=document.getElementById('f-heldlow');
  hl.addEventListener('click',()=>{smeState.heldlow=!smeState.heldlow;hl.classList.toggle('active',smeState.heldlow);renderSME();});
  const a15=document.getElementById('f-ath15');
  a15.addEventListener('click',()=>{smeState.ath15=!smeState.ath15;a15.classList.toggle('active',smeState.ath15);renderSME();});
  ['f-q','f-al','f-lm','f-anc','f-mc','f-avt','f-dd','f-rfl'].forEach(id=>document.getElementById(id).addEventListener('input',renderSME));
  document.getElementById('f-reset').onclick=()=>{
    ['f-q','f-al','f-lm','f-anc','f-mc','f-avt','f-dd','f-rfl'].forEach(id=>document.getElementById(id).value='');
    smeState.exch='ALL';smeState.board='ALL';
    document.querySelectorAll('#f-exch .segbtn,#f-board .segbtn').forEach(x=>x.classList.toggle('active',x.dataset.exch==='ALL'||x.dataset.board==='ALL'));
    smeState.heldlow=false;hl.classList.remove('active');smeState.ath15=false;a15.classList.remove('active');smeRefresh();};
  smeRefresh();
}

// ---- Phase-2 split loader ------------------------------------------------------------------------
// Fetch once, on the FIRST activation of this tab, then hand the rows to smeInit() — whose body is
// the previous inline code, verbatim. Nothing about what renders changes; only where the bytes come
// from and when they arrive.
(function(){
  const smeStat=document.getElementById('sme-status');
  let smeLatched=false;
  function smeSay(msg){ if(smeStat){ smeStat.innerHTML=msg; smeStat.style.display=msg?'':'none'; } }
  function smeLoad(){
    if(smeLatched) return; smeLatched=true;
    smeSay('Loading IPO analysis&hellip;');
    fetch((SMECFG.datadir||'data')+'/'+(SMECFG.file||'sme.json'))
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(rows){ SME=rows||[]; smeSay(''); smeInit(); })
      // file:// blocks fetch (CORS). Say so, and UN-LATCH so the next click retries rather than
      // leaving a permanently blank tab. Over HTTP (results server, or the public host) this branch
      // never runs.
      .catch(function(e){ smeLatched=false;
        smeSay('IPO analysis could not load &mdash; open this page over HTTP rather than from the '+
               'file system. ('+String(e && e.message || e)+')'); });
  }
  const smeBtn=document.querySelector('.tabbtn[data-tab="tab-sme"]');
  if(smeBtn) smeBtn.addEventListener('click',smeLoad);
  const smePanel=document.getElementById('tab-sme');
  if(smePanel && smePanel.classList.contains('active')) smeLoad();   // already the open tab
})();

// ===== IPO Signal (Goal 2) =====
/* THE PAYLOAD IS OPTIONAL NOW. This script block ships with the dashboard (it shares gtable /
   gcell / trCols with the New Listing tab) but `signal-data` moved to the standalone /ipo/ page
   on 2026-08-19. Read straight through, this threw `Cannot read properties of null` at top
   level and killed everything after it in the block — including the New Listing loader. The
   guard inside sigInit() was not enough: it runs later. Same shape as the MTF quadrant
   renderer that outlived its section by one build. */
const _sigEl=document.getElementById('signal-data');
const SIG=_sigEl?JSON.parse(_sigEl.textContent||'{}'):{};
function gcell(v,c,row){
  const sep=c.sep?' grpsep':'';
  /* a column may render itself (the participant-name column shortens legal names) */
  if(c.cell) return `<td class="${('nm '+sep).trim()}">${c.cell(v,row)}</td>`;
  if(v==null||v===''){
    // recent IPOs are legitimately too young for a 90-day return -> say so instead of a bare dash
    if(c.k==='Actual 90D %'&&row&&row.Kind==='recent')
      return `<td class="${sep.trim()}"><span class="subtle" style="font-size:var(--fs-xs,11px)">pending (listed &lt;90d)</span></td>`;
    return `<td class="${sep.trim()}">`+DASH+'</td>';
  }
  if(v==='Yes'||v==='No')return `<td class="${sep.trim()}"><span class="pill ${v==='Yes'?'pill-y':'pill-n'}">${v}</span></td>`;
  if(typeof v==='number'){const cls=((c.pct?clsv(v):'')+sep).trim();return `<td class="${cls}">${Number.isInteger(v)&&!c.pct?v:(+v).toFixed(2)}</td>`;}
  return `<td class="${sep.trim()}">${v}</td>`;
}
function gtable(elId,countId,rows,cols,st,renderFn,label){
  const r=rows.slice().sort((a,b)=>{let x=a[st.sort],y=b[st.sort];
    if(x==null||x==='')return 1; if(y==null||y==='')return -1;
    if(DATECOLS.includes(st.sort))return cmpKey(st.sort,x,y,st.dir);
    if(typeof x==='string'&&typeof y==='string')return st.dir*x.localeCompare(y);
    return st.dir*(x-y);});
  let h='<table><tr>'+cols.map(c=>`<th class="sortable ${c.sep?'grpsep':''}" data-k="${c.k}">${c.t}${st.sort===c.k?(st.dir<0?' \u25bc':' \u25b2'):''}</th>`).join('')+'</tr>';
  for(const row of r)h+='<tr>'+cols.map(c=>gcell(row[c.k],c,row)).join('')+'</tr>';
  document.getElementById(elId).innerHTML=h+'</table>';
  if(countId)document.getElementById(countId).textContent=`${r.length} ${label}`;
  document.querySelectorAll('#'+elId+' th.sortable').forEach(th=>th.onclick=()=>{
    const k=th.dataset.k; if(st.sort===k)st.dir*=-1; else{st.sort=k;st.dir=-1;} renderFn();});
}
// Issue Date is the 2nd column (table sorts by it, newest first). Predicted (blend of LM + reliable
// fund-house records) and Actual groups are visually partitioned via `sep`. 90D returns are from the
// LISTING price. 'Blended*' keys are the source columns; shown to the user as 'Predicted'.
/* No `Reliable` COLUMN (owner 2026-08-19). The field still exists on every row and the
   "Reliable only" toggle still filters on it — what went is the cell, which spent a column's
   width repeating what the filter above the table already decides. */
function trCols(nk){return [{k:nk,t:nk,cell:nameCell},{k:'N IPOs',t:'N IPOs'},
 {k:'Med Listing Gain %',t:'Med List Gain %',pct:1},{k:'Med 30D %',t:'Med 30D %',pct:1},
 {k:'Med 90D %',t:'Med 90D %',pct:1},{k:'Med 180D %',t:'Med 180D %',pct:1},
 {k:'Hit Rate Listing %',t:'Hit List %'},{k:'Hit Rate 90D %',t:'Hit 90D %'}];}
/* ---------- 1. THE LIVE CALENDAR ----------
   Rows come from `ipo_pipeline_dashboard.build_payload()`, the same builder the internal IPO
   Pipeline tab draws — read, never re-derived. Columns dropped on purpose (owner 2026-08-18):
   `Held` (where OUR copy of the document sits) and `Anchors hit %` (a track-record number that the
   table below answers properly). What the cards had and the table did not — the one-line business
   description — is now a column, which is the whole reason the cards are not here. */
const CO_BASE=((document.getElementById('tab-signal')||{}).dataset||{}).coBase||'company/';
const CALREAD={analysed:['deep-dive','ok'], shallow:['shallow','ok'],
               held_unread:['not read','warn'], no_doc:['no document','bad']};
function calPill(t,c){return `<span class="pill pill-${c==='ok'?'y':'n'}">${t}</span>`;}
/* NOT called `esc`: this script block runs at page top level, so a bare `esc` is a global
   that any other tab's script can redefine - and the calendar re-renders on every sort and
   keystroke, long after that redefinition would have happened. */
function calEsc(s){return (s==null?'':''+s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const calState={sort:'listing',dir:1,q:''};
const CALCOLS=[
 /* ANALYZE FIRST: the reason to open a row is to go and look at the company, so the way to do that
    is the first thing in it. A row with no symbol yet has nowhere to go and says so — a link to
    `company/?sym=` with an empty symbol lands on a page that cannot answer. */
 /* THE LINK IS RELATIVE TO WHATEVER PAGE HOSTS THIS PANEL. Hard-coded `company/?sym=` was correct
    inside dashboard.html at the site root and became a 404 the moment the panel moved to /ipo/ —
    it resolved to /ipo/company/?sym=BLEL. The host declares the base on the panel div
    (`data-co-base`), exactly as the Announcements panel declares `data-annc-base`, so relocating a
    panel stays a one-attribute change instead of a hunt for every URL inside it. */
 {k:'sym',t:'Analyze',f:r=>r.sym?`<a href="${CO_BASE}?sym=${encodeURIComponent(r.sym)}" target="_blank" rel="noopener">analyze</a>`:'<span class="subtle">no symbol yet</span>'},
 /* COMPANY carries its own identity: name, ticker and board in one cell (owner 2026-08-19: "merge
    Company col with symbol, Board"). Three columns for three attributes of the same entity made the
    reader scan sideways to answer "which company is this"; a symbol without its name is a lookup,
    and a board without either is trivia. */
 {k:'name',t:'Company',f:r=>`<b>${calEsc(r.name)}</b>`
    +`<div class="calmeta">${r.sym?calEsc(r.sym):'<span class="subtle">symbol not assigned</span>'}`
    +`${r.board?' · '+calEsc(r.board):''}</div>`},
 /* THESIS SECOND (owner 2026-08-19). What the company DOES is the next question after who it is —
    it was last, past six columns of dates and states, where it read as a footnote. */
 {k:'biz',t:'Thesis',f:r=>r.biz?calEsc(r.biz):'<span class="subtle">no description</span>'},
 /* ONE DATE CELL: the issue closes, then it lists. Two columns held two halves of one timeline. */
 {k:'listing',t:'Issue closes → lists',f:r=>{
    const c=r.end?calEsc(r.end):'<span class="subtle">–</span>';
    const l=r.listing?calEsc(r.listing):'<span class="subtle">–</span>';
    return `${c} <span class="subtle">→</span> <b>${l}</b>`;}},
 {k:'d2l',t:'Days',f:r=>r.d2l==null?'':r.d2l},
 /* the filing itself, not its name: the URL was already computed for the pipeline tab and simply
    never travelled with the row (owner: "it should have a link to pdf as we have link already"). */
 {k:'doc',t:'Latest doc',f:r=>!r.doc?'<span class="subtle">none</span>'
    :(r.doc_url?`<a href="${calEsc(r.doc_url)}" target="_blank" rel="noopener">${calEsc(r.doc)} ${calEsc(r.doc_date||'')}</a>`
               :`${calEsc(r.doc)} ${calEsc(r.doc_date||'')}`)},
 /* INTERNAL-ONLY COLUMN. Whether WE have read the filing, and how deeply, is a statement about this
    desk rather than about the company — publish.py drops this one column from the public copy and
    keeps the rest of the table (see the IPOCAL-READ markers). */
 /* INTERNAL-ONLY COLUMN, and it disappears with its DATA, not with a stylesheet. Whether THIS DESK
    has read a filing and how deeply is a statement about us, not the company. publish.py deletes the
    `read` field from every pipeline row in the public payload; this column is then built only if some
    row still carries one, so the public page has no column AND no hidden values to read out of the
    source. A `display:none` would have shipped the working state to anyone who opened dev tools. */
 {k:'read',t:'Read',cls:'calread',internal:1,f:r=>{const h=CALREAD[r.read]||['&mdash;','warn'];return calPill(h[0],h[1]);}},
 {k:'anch',t:'Anchor file',f:r=>r.anch==='arrived'?calPill('in','ok'):calPill('not yet','warn')},
].filter(c=>!c.internal || (SIG.pipeline||[]).some(r=>r.read));

function renderCAL(){
  const all=SIG.pipeline||[];
  const q=calState.q;
  let rows=all.filter(r=>!q||((''+(r.name||'')).toLowerCase().includes(q)||(''+(r.sym||'')).toLowerCase().includes(q)));
  rows=rows.slice().sort((a,b)=>{let x=a[calState.sort],y=b[calState.sort];
    if(x==null||x==='')return 1; if(y==null||y==='')return -1;
    if(typeof x==='string'&&typeof y==='string')return calState.dir*x.localeCompare(y);
    return calState.dir*(x-y);});
  let h='<table><tr>'+CALCOLS.map(c=>{
    const sk=c.k;
    return `<th class="sortable${c.cls?' '+c.cls:''}" data-k="${sk}">${c.t}${calState.sort===sk?(calState.dir<0?' ▼':' ▲'):''}</th>`;}).join('')+'</tr>';
  /* `data-t` carries the column's own header onto every cell. On a phone the row stops being a grid
     and becomes a card (see the narrow-layout block in the CSS), where a value needs to say what it
     is — and the only correct label is the one the header already uses, taken from the same CALCOLS
     entry rather than restated in a stylesheet where it would drift. */
  for(const r of rows) h+='<tr>'+CALCOLS.map(c=>`<td class="tl${c.cls?' '+c.cls:''}" data-t="${calEsc(c.t)}">${c.f(r)}</td>`).join('')+'</tr>';
  const t=document.getElementById('cal-table'); if(!t) return;
  t.innerHTML=all.length?h+'</table>'
    :'<div class="empty">No IPO has a listing date still ahead, and none has an issue still open.</div>';
  const c=document.getElementById('cal-count');
  if(c)c.textContent=`${rows.length} of ${all.length} in the pipeline`;
  document.querySelectorAll('#cal-table th.sortable').forEach(th=>th.onclick=()=>{
    const k=th.dataset.k; if(calState.sort===k)calState.dir*=-1; else{calState.sort=k;calState.dir=1;} renderCAL();});
}

/* ---------- 2. ONE TRACK-RECORD TABLE, THREE GRAINS ----------
   Each grain keeps its OWN sort (the columns differ — only the owner grain has Vehicles — so one
   shared sort key would be dropped on every switch), while search and Reliable are shared: they are
   the reader's filter, not a property of the grain. */
/* LEGAL NAMES ARE NOT LABELS (owner 2026-08-19: "lead manger name very big, strip limited or
   private limited from it"). Two rules, in order:
     1. drop a trailing "(Formerly Known as ...)" parenthetical — the owner's example was
        "Smart Horizon Capital Advisors Private Limited (Formerly Known as Shreni Capital Advisors
        Private Limited)"; handled by RULE rather than by renaming that one string, so the next
        manager to rebrand is handled too;
     2. strip the corporate suffix (Private Limited / Pvt Ltd / Limited / Ltd / LLP).
   The FULL legal name goes in the cell's title, so nothing is lost — a shortened name in a table is
   a label, and the record it came from is one hover away. The underlying value is untouched: search,
   sort and the Reliable filter all still run on the original string. */
function shortName(v){
  var s=(v==null?'':''+v).trim();
  s=s.replace(/\s*\((?:formerly|erstwhile)[^)]*\)\s*$/i,'');
  s=s.replace(/[,\s]+(?:pvt\.?|private)?[\s.]*(?:ltd\.?|limited)\s*$/i,'');
  s=s.replace(/[,\s]+llp\s*$/i,'');
  return s.trim()||(''+v);
}
function nameCell(v){
  var full=(v==null?'':''+v), sh=shortName(full);
  return sh===full?calEsc(full):'<span title="'+calEsc(full)+'">'+calEsc(sh)+'</span>';
}
const TRV={
  lm : {rows:()=>SIG.lm||[],     key:'Lead Manager',    label:'lead managers', ph:'lead manager', note:''},
  own: {rows:()=>SIG.owner||[],  key:'Owner',           label:'owners',        ph:'owner / fund manager',
        note:'The fund manager behind the houses \u2014 IPOs de-duped across their vehicles. Click a row to expand its houses.'},
  an : {rows:()=>SIG.anchor||[], key:'Anchor Investor', label:'anchors',       ph:'anchor investor', note:''},
};
const trShared={view:'lm',q:'',rel:false};
const lmState={sort:'N IPOs',dir:-1};
const anState={sort:'N IPOs',dir:-1};
const ownState={sort:'N IPOs',dir:-1,open:{}};
const OWNCOLS=[{k:'Owner',t:'Owner',cell:nameCell},{k:'N IPOs',t:'N IPOs'},{k:'Vehicles',t:'Vehicles'},
 {k:'Med Listing Gain %',t:'Med List Gain %',pct:1},{k:'Med 30D %',t:'Med 30D %',pct:1},
 {k:'Med 90D %',t:'Med 90D %',pct:1},{k:'Med 180D %',t:'Med 180D %',pct:1},
 {k:'Hit Rate Listing %',t:'Hit List %'},{k:'Hit Rate 90D %',t:'Hit 90D %'}];

function trFilter(rows,key){
  return rows.filter(r=>(!trShared.q||(''+r[key]).toLowerCase().includes(trShared.q))
                      &&(!trShared.rel||r.Reliable==='Yes'));
}
function renderTR(){
  const cfg=TRV[trShared.view];
  const note=document.getElementById('tr-note'); if(note)note.innerHTML=cfg.note;
  const q=document.getElementById('tr-q'); if(q&&q.placeholder!==cfg.ph)q.placeholder=cfg.ph;
  document.querySelectorAll('#tr-pick button').forEach(b=>b.classList.toggle('active',b.dataset.tr===trShared.view));
  const rows=trFilter(cfg.rows(),cfg.key);
  if(trShared.view==='own'){renderOWNRows(rows);return;}
  gtable('tr-table','tr-count',rows,trCols(cfg.key),
         trShared.view==='lm'?lmState:anState,renderTR,cfg.label);
}
/* OWNER grain has its own renderer (not gtable) because its rows EXPAND: a click reveals that
   owner's houses from SIG.anchor. */
function renderOWNRows(rows){
  rows=rows.slice().sort((a,b)=>{let x=a[ownState.sort],y=b[ownState.sort];
    if(x==null||x==='')return 1; if(y==null||y==='')return -1;
    if(typeof x==='string'&&typeof y==='string')return ownState.dir*x.localeCompare(y);
    return ownState.dir*(x-y);});
  let h='<table><tr>'+OWNCOLS.map(c=>`<th class="sortable" data-k="${c.k}">${c.t}${ownState.sort===c.k?(ownState.dir<0?' \u25bc':' \u25b2'):''}</th>`).join('')+'</tr>';
  for(const row of rows){
    const op=!!ownState.open[row.Owner];
    h+=`<tr class="ownrow" data-o="${(''+row.Owner).replace(/"/g,'&quot;')}">`+OWNCOLS.map((c,i)=>
      i===0?`<td class="nm">${op?'▾':'▸'} ${nameCell(row.Owner)}</td>`:gcell(row[c.k],c)).join('')+'</tr>';
    if(op){
      const houses=(SIG.anchor||[]).filter(r=>r.Owner===row.Owner).sort((a,b)=>(b['N IPOs']||0)-(a['N IPOs']||0));
      for(const hs of houses)
        h+='<tr class="subrow">'+OWNCOLS.map(c=>
          gcell(c.k==='Owner'?hs['Anchor Investor']:(c.k==='Vehicles'?'':hs[c.k]),c)).join('')+'</tr>';
    }
  }
  document.getElementById('tr-table').innerHTML=h+'</table>';
  document.getElementById('tr-count').textContent=`${rows.length} owners`;
  document.querySelectorAll('#tr-table th.sortable').forEach(th=>th.onclick=()=>{
    const k=th.dataset.k; if(ownState.sort===k)ownState.dir*=-1; else{ownState.sort=k;ownState.dir=-1;} renderTR();});
  document.querySelectorAll('#tr-table tr.ownrow').forEach(tr=>tr.onclick=()=>{
    const o=tr.dataset.o; ownState.open[o]=!ownState.open[o]; renderTR();});
}
(function sigInit(){
  /* NO PAYLOAD, NO WORK. This block ships with the dashboard (it shares gtable/gcell/trCols with the
     New Listing tab) but the signal payload now ships only with /ipo/. Without this guard `renderTR`
     would call gtable() on a `tr-table` that does not exist there and throw on every dashboard load —
     the same class of null-element error the MTF quadrant renderer threw on 2026-08-18. */
  if(!document.getElementById('signal-data')) return;
  renderCAL();renderTR();
  const cq=document.getElementById('cal-q');
  if(cq)cq.addEventListener('input',e=>{calState.q=e.target.value.toLowerCase().trim();renderCAL();});
  const tq=document.getElementById('tr-q');
  if(tq)tq.addEventListener('input',e=>{trShared.q=e.target.value.toLowerCase().trim();renderTR();});
  const rel=document.getElementById('tr-rel');
  if(rel)rel.onclick=()=>{trShared.rel=!trShared.rel;rel.classList.toggle('active',trShared.rel);renderTR();};
  document.querySelectorAll('#tr-pick button').forEach(b=>b.onclick=()=>{
    trShared.view=b.dataset.tr; renderTR();});
})();
