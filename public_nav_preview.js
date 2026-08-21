/* Local review navigation only. The final version will move this behaviour into the public build. */
(function () {
  function renameLinks(root) {
    root.querySelectorAll('a').forEach(function (link) {
      var label = link.textContent.trim();
      if (label === 'Announcements') link.textContent = 'Feed';
      if (label === 'IPO') link.textContent = 'IPO Intelligence';
      var href = link.getAttribute('href') || '';
      if (href.indexOf('index.html?tab=') !== -1) {
        link.setAttribute('href', href.replace('index.html?tab=', 'dashboard.html?tab='));
      }
    });
  }

  var dashboardNav = document.querySelector('.tabbar-buckets');
  if (dashboardNav) {
    var logo = dashboardNav.querySelector('.sitenav-logo');
    if (logo) logo.setAttribute('href', 'index.html');
    if (!dashboardNav.querySelector('[data-preview-home]')) {
      var home = document.createElement('a');
      home.className = 'pagelink'; home.href = 'index.html'; home.textContent = 'Home';
      home.setAttribute('data-preview-home', '');
      dashboardNav.insertBefore(home, logo ? logo.nextSibling : dashboardNav.firstChild);
    }
    renameLinks(dashboardNav);
    var staleNewListing = document.querySelector('.bkgrp[data-bucket="Screens"] .tabbtn[data-tab="tab-sme"]');
    if (staleNewListing) staleNewListing.remove();
  }

  var siteNav = document.querySelector('.sitenav');
  if (siteNav) {
    var siteLogo = siteNav.querySelector('.sitenav-logo');
    if (siteLogo) siteLogo.setAttribute('href', '../index.html');
    if (!siteNav.querySelector('[data-preview-home]')) {
      var siteHome = document.createElement('a');
      siteHome.className = 'sitenav-a'; siteHome.href = '../index.html'; siteHome.textContent = 'Home';
      siteHome.setAttribute('data-preview-home', '');
      siteNav.insertBefore(siteHome, siteLogo ? siteLogo.nextSibling : siteNav.firstChild);
    }
    renameLinks(siteNav);
  }
}());
