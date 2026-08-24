(function () {
  'use strict';
  var nav = [['Home','index.html'],['Big Picture','bigpicture/'],['Feed','feed/'],['IPO Intelligence','ipo/'],['Screens','screens/?tab=tab-momentum2']];
  function relative(path) {
    var pathname = location.pathname || '/';
    var segments = pathname.split('/').filter(Boolean);
    var depth = pathname.endsWith('/') ? segments.length : Math.max(0, segments.length - 1);
    return new Array(depth + 1).join('../') + path;
  }
  function activePage() {
    var title = document.title || '';
    // Company is a destination reached from the global search, not one of the
    // five primary sections.  Do not misleadingly highlight Home there.
    if (/\/company\//i.test(location.pathname)) return '';
    if (/\/screens\//i.test(location.pathname)) return 'Screens';
    if (/bigpicture/i.test(location.pathname) || /Big Picture/i.test(title)) return 'Big Picture';
    if (/\/feed\//i.test(location.pathname) || /Feed|Announcement|Circular/i.test(title)) return 'Feed';
    if (/IPO/i.test(title)) return 'IPO Intelligence';
    if (/Momentum|Invest|Listing|Screen/i.test(title)) return 'Screens';
    return 'Home';
  }
  function links(active) { return nav.map(function (item) { return '<a' + (item[0] === active ? ' class="active"' : '') + ' href="' + relative(item[1]) + '">' + item[0] + '</a>'; }).join(''); }
  var mobileIcons = {
    'Home':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M9.5 19v-5h5v5"/></svg>',
    'Big Picture':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9m5 10V5m5 14v-7m5 7V8"/></svg>',
    'Feed':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
    'IPO Intelligence':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V9h12v11M9 13h2m2 0h2M9 17h2m2 0h2M5 9l7-5 7 5"/></svg>',
    'Screens':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>'
  };
  var mobileLabels = {'Big Picture':'Picture','IPO Intelligence':'IPO'};
  function mobileLinks(active) { return nav.map(function (item) { var selected=item[0]===active;return '<a' + (selected ? ' class="active" aria-current="page"' : '') + ' aria-label="' + item[0] + '" href="' + relative(item[1]) + '">' + mobileIcons[item[0]] + '<span>' + (mobileLabels[item[0]] || item[0]) + '</span></a>'; }).join(''); }

  var style = document.createElement('style');
  style.id = 'public-shared-header-css';
  style.textContent = '.site-header .nav,.tabbar-buckets,.sitenav{min-height:64px;display:flex;align-items:center;gap:16px}.site-header .nav-links{margin-right:auto;gap:16px}.site-header .nav-links a,.tabbar-buckets .pagelink,.sitenav .sitenav-a{border:0!important;border-bottom:0!important;border-radius:6px!important;padding:8px 0!important;background:transparent!important;color:#64748b!important;font-size:12.5px!important;font-weight:600!important;height:auto!important;line-height:1.5!important}.site-header .nav-links a:hover,.site-header .nav-links a.active,.tabbar-buckets .pagelink:hover,.tabbar-buckets .pagelink.active,.sitenav .sitenav-a:hover,.sitenav .sitenav-a.active{color:#2563eb!important}.tabbar-buckets,.sitenav{padding:0 20px!important;border-bottom:1px solid rgba(15,23,42,.08)!important;background:rgba(248,250,252,.94)!important;backdrop-filter:blur(12px)}.tabbar-buckets .sitenav-logo,.sitenav .sitenav-logo{margin-right:0!important}.public-header-search{position:relative;margin-left:auto;flex:0 1 330px}.public-header-search input{width:100%;padding:10px 12px;border:1px solid rgba(15,23,42,.12);border-radius:8px;background:rgba(255,255,255,.95);color:#0f172a;font:12.5px Inter,system-ui,sans-serif}.public-header-search input:focus{outline:2px solid #2563eb;outline-offset:2px}.public-header-results{position:absolute;right:0;top:calc(100% + 4px);z-index:80;display:none;min-width:270px;max-width:80vw;overflow:hidden;border:1px solid rgba(15,23,42,.10);border-radius:8px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.12)}.public-header-result{display:flex;gap:8px;align-items:baseline;padding:8px 11px;cursor:pointer;border-bottom:1px solid rgba(15,23,42,.08);font:12.5px Inter,system-ui,sans-serif}.public-header-result:last-child{border-bottom:0}.public-header-result:hover,.public-header-result.on{background:#f1f5f9}.public-header-result b{margin-left:auto;color:#64748b;font-size:11px}.public-header-more{padding:7px 11px;color:#64748b;font:11px Inter,system-ui,sans-serif;background:#f1f5f9}@media(max-width:700px){.site-header .nav,.tabbar-buckets,.sitenav{min-height:56px;padding-left:14px!important;padding-right:14px!important;overflow-x:auto}.site-header .brand span:last-child{display:none}.site-header .nav-links{gap:12px}.site-header .nav-links a:not(.active),.tabbar-buckets .pagelink:not(.active),.sitenav .sitenav-a:not(.active){display:none}.public-header-search{flex-basis:min(62vw,240px)}.public-header-search input{font-size:16px}}';
  style.textContent += '.tabbar-buckets .bkbtn{border:0!important;border-bottom:0!important;border-radius:6px!important;padding:8px 0!important;background:transparent!important;color:#64748b!important;font-size:12.5px!important;font-weight:600!important;height:auto!important;line-height:1.5!important}.tabbar-buckets .bkbtn:hover,.tabbar-buckets .bkbtn.active{color:#2563eb!important}.tabbar-buckets+.tabbar{position:sticky;top:64px;z-index:40;background:#f8fafc;border-bottom:1px solid rgba(15,23,42,.08)}@media(max-width:700px){.tabbar-buckets .bkbtn:not(.active){display:none}.tabbar-buckets+.tabbar{top:56px}}';
  style.textContent += '.dashboard-public-header{position:sticky;top:0;z-index:42;border-bottom:1px solid rgba(15,23,42,.08);background:rgba(248,250,252,.94);backdrop-filter:blur(12px)}.dashboard-public-header .wrap{width:min(calc(100% - 40px),1440px);margin:0 auto}.dashboard-public-header .brand{display:flex;align-items:center;gap:8px;color:#0f172a;text-decoration:none;font:600 15px Outfit,Inter,sans-serif}.dashboard-public-header .brand-mark{display:grid;place-items:center;width:30px;height:30px;border-radius:6px;background:#0f172a;color:#fff;font:700 12.5px Inter,sans-serif}.dashboard-public-header .nav-links{display:flex;align-items:center}@media(max-width:700px){.dashboard-public-header .wrap{width:min(calc(100% - 28px),1440px)}.dashboard-public-header .brand span:last-child{display:none}}';
  /* One computed header, regardless of whether the host page is a marketing template,
     standalone Company shell, or the padded dashboard used by Screens. */
  style.textContent += '.site-header{display:block!important;margin:0!important;padding:0!important;background:rgba(248,250,252,.94)!important;border-bottom-color:rgba(15,23,42,.08)!important}.site-header .nav{justify-content:space-between!important}.site-header .brand{font-family:Outfit,sans-serif!important;font-size:15px!important;font-weight:600!important;text-decoration:none!important}.site-header .nav-links{display:flex!important;align-items:center!important;gap:16px!important}.site-header .nav-links a{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;text-decoration:none!important;white-space:nowrap!important}.public-header-search input{height:42px!important;min-height:42px!important;box-sizing:border-box!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}.dashboard-public-header{margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}.dashboard-public-header .wrap{width:min(calc(100% - 40px),1440px)!important;max-width:1440px!important;padding-left:0!important;padding-right:0!important}@media(max-width:700px){.dashboard-public-header .wrap{width:min(calc(100% - 28px),1440px)!important;padding-left:14px!important;padding-right:14px!important}.site-header .nav-links{gap:12px!important}}';
  style.textContent += '.public-mobile-nav{display:none}@media(max-width:700px){html{scroll-padding-bottom:calc(72px + env(safe-area-inset-bottom))}body{padding-bottom:calc(68px + env(safe-area-inset-bottom))!important}.site-header .nav-links{display:none!important}.public-mobile-nav{position:fixed;left:0;right:0;bottom:0;z-index:140;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));min-height:62px;padding:5px max(6px,env(safe-area-inset-left)) calc(5px + env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-right));border-top:1px solid rgba(15,23,42,.12);background:rgba(255,255,255,.96);box-shadow:0 -7px 22px rgba(15,23,42,.09);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}.public-mobile-nav a{min-width:0;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:8px;color:#64748b;text-decoration:none;font:600 10px/1.15 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-tap-highlight-color:transparent}.public-mobile-nav a.active{background:#eff6ff;color:#2563eb}.public-mobile-nav svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.public-mobile-nav span{overflow:hidden;max-width:100%;text-overflow:ellipsis;white-space:nowrap}.explorer-open{bottom:calc(76px + env(safe-area-inset-bottom))!important}.stock-explorer.open{bottom:calc(72px + env(safe-area-inset-bottom))!important}}';
  /* Mobile search results must escape the header's horizontal scroller and sit above the page's
     sticky sub-navigation. Without this, the list exists but is clipped/covered on small screens. */
  style.textContent += '@media(max-width:700px){.site-header{z-index:220!important;overflow:visible!important}.site-header .nav{overflow:visible!important}.public-header-search{position:relative;min-width:0}.public-header-results{right:0;left:auto;z-index:260;min-width:min(300px,calc(100vw - 28px));max-width:calc(100vw - 28px)}}';
  document.head.appendChild(style);

  var active = activePage(), marketingNav = document.querySelector('.site-header .nav-links');
  if (window.self === window.top && !document.querySelector('.public-mobile-nav')) {
    var mobileNav=document.createElement('nav');mobileNav.className='public-mobile-nav';mobileNav.setAttribute('aria-label','Primary mobile navigation');mobileNav.innerHTML=mobileLinks(active);document.body.appendChild(mobileNav);
  }
  if (marketingNav) {
    marketingNav.innerHTML = links(active);
    var marketingBrand = document.querySelector('.site-header .brand');
    if (marketingBrand) marketingBrand.setAttribute('href', relative('index.html'));
  }
  var dashboardNav = document.querySelector('.tabbar-buckets');
  if (dashboardNav && !document.querySelector('.dashboard-public-header')) {
    var publicHeader=document.createElement('header');
    publicHeader.className='site-header dashboard-public-header';
    publicHeader.innerHTML='<nav class="wrap nav" aria-label="Primary navigation"><a class="brand" href="'+relative('index.html')+'"><span class="brand-mark">A</span><span>Arth Insight</span></a><div class="nav-links">'+links('Screens')+'</div></nav>';
    dashboardNav.parentNode.insertBefore(publicHeader,dashboardNav);
    /* Keep the bucket row in the DOM because dashboard code owns its state, but remove the obsolete
       public navigation surface. The row below remains as the Screens section navigation. */
    dashboardNav.style.setProperty('display','none','important');
    var screenTabs=dashboardNav.nextElementSibling;if(screenTabs&&screenTabs.classList.contains('tabbar'))screenTabs.classList.add('public-screen-tabs');
  }
  var siteNav = document.querySelector('.sitenav');
  if (siteNav && !siteNav.querySelector('[data-public-home]')) {
    var brand=siteNav.querySelector('.sitenav-logo'); if(brand)brand.setAttribute('href',relative('index.html'));
    var homeLink=document.createElement('a'); homeLink.className='sitenav-a'; homeLink.href=relative('index.html'); homeLink.textContent='Home'; homeLink.dataset.publicHome='1'; siteNav.insertBefore(homeLink,brand ? brand.nextSibling : siteNav.firstChild);
    siteNav.querySelectorAll('.sitenav-a').forEach(function(a){var label=a.textContent.trim();if(label==='Announcements')a.textContent='Feed';if(a.textContent.trim()==='Feed')a.href=relative('feed/');if(label==='IPO')a.textContent='IPO Intelligence';if(a.textContent.trim()==='Big Picture')a.href=relative('bigpicture/');if(a.textContent.trim()==='Screens')a.href=relative('screens/?tab=tab-momentum2');if(a.textContent.trim()===active)a.classList.add('active');});
  }

  // Home uses the existing shared component; moving it into the header removes the hero duplicate.
  var header=document.querySelector('.site-header .nav') || dashboardNav || siteNav, homeSearch=document.querySelector('.home-company-search');
  if(header && homeSearch)homeSearch.remove();
  // Other pages use the same data, destination and keyboard behaviour, with scoped markup.
  // The `!header.querySelector('.public-header-search')` clause meant "only build a search if the
  // page has none". Once the page SHIPPED that markup the guard went false and this whole block -
  // input wiring, fetch, dropdown - was skipped: the box rendered and did nothing. The block now
  // adopts an existing box, so its presence must not veto the wiring. The `.cosearch` clause stays:
  // a page carrying the legacy search still opts out of the shared one.
  if(header && !header.querySelector('.cosearch')){
    /* ADOPT the box the page already ships, and only build one when it is absent. The search was
   created entirely in JS and appended, so it existed ONLY if this script loaded — the markup
   had no search at all, and a failed or slow load showed a nav without it. The page now ships
   the same element; this wires behaviour to it instead of being its only source. */
var box=header.querySelector('.public-header-search');
if(!box){box=document.createElement('div');box.className='public-header-search';header.appendChild(box);}
if(!box.querySelector('input'))box.innerHTML='<input type="search" autocomplete="off" spellcheck="false" placeholder="Search company or IPO" aria-label="Search company or IPO"><div class="public-header-results" role="listbox"></div>';
    var input=box.querySelector('input'),results=box.querySelector('.public-header-results'),all=[],loaded=false,loading,selected=-1;
    function load(){if(loaded)return loading||Promise.resolve();loaded=true;loading=fetch(relative('data/index.json')+'?v=20260822b').then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(j){all=(j.companies||[]).map(function(c){return{s:c.s,co:c.co||'',search:c.search||''};});}).catch(function(){results.innerHTML='<div class="public-header-more">Could not load the company index.</div>';});return loading;}
    function go(symbol){if(symbol)location.href=relative('company/')+'?sym='+encodeURIComponent(symbol);}
    function render(){var term=input.value.trim().toUpperCase();selected=-1;if(!term){results.style.display='none';return;}var hits=all.filter(function(r){return r.s.toUpperCase().indexOf(term)>=0||r.co.toUpperCase().indexOf(term)>=0||r.search.toUpperCase().indexOf(term)>=0;}),shown=hits.slice(0,6);results.innerHTML=shown.length?shown.map(function(r){return '<div class="public-header-result" role="option" data-symbol="'+r.s+'"><span>'+r.co.replace(/[&<>]/g,'')+'</span><b>'+r.s+'</b></div>';}).join('')+(hits.length>6?'<div class="public-header-more">+'+(hits.length-6)+' more — keep typing</div>':''):'<div class="public-header-more">No match.</div>';results.style.display='block';}
    input.addEventListener('focus',load);input.addEventListener('input',function(){load().then(render);});input.addEventListener('keydown',function(e){var rows=Array.prototype.slice.call(results.querySelectorAll('[data-symbol]'));if(e.key==='ArrowDown'&&rows.length){e.preventDefault();selected=(selected+1)%rows.length;}if(e.key==='ArrowUp'&&rows.length){e.preventDefault();selected=(selected-1+rows.length)%rows.length;}if(e.key==='ArrowDown'||e.key==='ArrowUp')rows.forEach(function(r,i){r.classList.toggle('on',i===selected);});if(e.key==='Enter'&&rows.length){e.preventDefault();go(rows[selected>=0?selected:0].dataset.symbol);}if(e.key==='Escape')results.style.display='none';});
    results.addEventListener('click',function(e){var row=e.target.closest('[data-symbol]');if(row)go(row.dataset.symbol);});document.addEventListener('click',function(e){if(!box.contains(e.target))results.style.display='none';});
  }
}());
