// The newsletter archive (APP-020): the list at /nyhedsbreve/ and one newsletter at
// /nyhedsbreve/vis/?id=…[&lang=en]. Reads PublicService.platformNewsletters() and
// platformNewsletter(newsletterId); draws only the block types the contract allows, with DOM
// APIs and textContent, never innerHTML.
(function () {
  'use strict';

  var BASE = String(window.SEKVADO_API_BASE || '').replace(/\/+$/, '');
  var root = document.getElementById('archive-body');
  var isView = location.pathname.replace(/\/+$/, '').slice(-4) === '/vis';
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (kids || []).forEach(function (kid) { if (kid) node.appendChild(kid); });
    return node;
  }

  function show() {
    root.textContent = '';
    Array.prototype.forEach.call(arguments, function (n) { root.appendChild(n); });
  }

  function date(iso, lang) {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'da-DK', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Copenhagen'
    }).format(new Date(iso));
  }

  function get(path) {
    var signal = window.AbortSignal && AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined;
    return fetch(BASE + '/odata/v4/public/' + path, { headers: { Accept: 'application/json' }, signal: signal })
      .then(function (r) {
        if (r.status === 404) { var e = new Error('not found'); e.notFound = true; throw e; }
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }

  /* ---- States ---- */

  function skeleton(label, heights) {
    return el('div', { 'class': 'archive-list', role: 'status' }, [el('span', { 'class': 'sr', text: label })].concat(
      heights.map(function (h) { return el('div', { 'class': 'archive-skel', style: h ? 'height:' + h : null }); })));
  }

  function message(tag, title, paras, extra) {
    var kids = [el(tag, { text: title })].concat(paras.map(function (t) { return el('p', { text: t }); }));
    if (extra) kids.push(el('p', null, [extra]));
    return kids;
  }

  function retryButton(run) {
    var b = el('button', { type: 'button', 'class': 'archive-button', text: 'Prøv igen' });
    b.addEventListener('click', run);
    return b;
  }

  function failed(title, text, run) {
    var tag = isView ? 'h1' : 'h2';
    var box = el('div', { 'class': 'msg', role: 'alert' }, message(tag, title, text, retryButton(run)));
    show(box);
    box.querySelector('button').focus();
  }

  /* ---- The list ---- */

  function sourcesOf(list) {
    return (list || []).filter(function (s) { return s && /^https:\/\//.test(s.url); })
      .sort(function (a, b) { return a.width - b.width; });
  }

  function card(item) {
    var src = sourcesOf(item.image && item.image.sources);
    var thumb = src.length
      ? el('img', {
        'class': 'th', alt: '', loading: 'lazy', src: src[0].url, width: src[0].width, height: src[0].height,
        srcset: src.map(function (s) { return s.url + ' ' + s.width + 'w'; }).join(', '), sizes: '(min-width: 737px) 128px, 100vw'
      })
      : el('span', { 'class': 'th none', 'aria-hidden': 'true' });
    var title = el('h2', null, [el('a', { href: '/nyhedsbreve/vis/?id=' + encodeURIComponent(item.newsletterId), text: item.subject })]);
    var when = item.sentAt ? el('time', { 'class': 'd', datetime: item.sentAt.slice(0, 10), text: date(item.sentAt, 'da') }) : null;
    return el('li', null, [el('article', { 'class': 'archive-card' }, [thumb, el('div', null, [when, title, item.preheader ? el('p', { text: item.preheader }) : null])])]);
  }

  function loadList() {
    show(skeleton('Henter nyhedsbreve…', [null, null, null]));
    get('platformNewsletters()').then(function (data) {
      var items = (data && data.value) || [];
      if (!items.length) {
        show(el('div', { 'class': 'msg', role: 'status' }, message('h2', 'Ingen nyhedsbreve endnu',
          ['Vi samler Sekvados nyhedsbreve her, når de er sendt. Kig forbi igen senere.'])));
        return;
      }
      show(el('ul', { 'class': 'archive-list' }, items.map(card)));
    }).catch(function () {
      failed('Nyhedsbrevene kunne ikke hentes', ['Tjek din forbindelse og prøv igen. Er problemet der stadig, så kig forbi lidt senere.'], loadList);
    });
  }

  /* ---- One newsletter ---- */

  // Rich text: the backend's sanitiser keeps p, br, strong, em, h3, ul, ol, li and a. The same set
  // is rebuilt here from a parsed, inert document; anything else is flattened to its text.
  var KEEP = { P: 1, BR: 1, STRONG: 1, EM: 1, H3: 1, UL: 1, OL: 1, LI: 1, A: 1 };
  var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, TEMPLATE: 1, NOSCRIPT: 1, TEXTAREA: 1, TITLE: 1 };

  function httpsHref(h) {
    try { var u = new URL(h); return u.protocol === 'https:' ? u.href : null; } catch (e) { return null; }
  }

  function linkAttrs(a, href) {
    a.setAttribute('href', href);
    a.setAttribute('rel', 'noopener noreferrer');
  }

  function richInto(parent, source) {
    Array.prototype.forEach.call(source.childNodes, function (n) {
      if (n.nodeType === 3) { parent.appendChild(document.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1 || DROP[n.tagName]) return;
      if (!KEEP[n.tagName]) { richInto(parent, n); return; }
      var out = document.createElement(n.tagName.toLowerCase());
      if (n.tagName === 'A') {
        var href = httpsHref(n.getAttribute('href') || '');
        if (!href) { richInto(parent, n); return; }
        linkAttrs(out, href);
      }
      richInto(out, n);
      parent.appendChild(out);
    });
  }

  function richText(html) {
    var wrap = el('div', { 'class': 'rich' });
    richInto(wrap, new DOMParser().parseFromString(String(html || ''), 'text/html').body);
    return wrap;
  }

  function image(block, images) {
    var found = typeof block.image === 'number' ? images[block.image] : null;
    var src = sourcesOf(found && found.sources);
    if (!src.length) return null;
    var big = src[src.length - 1];
    var cls = ['size-' + String(block.size || 'FULL').toLowerCase().replace(/_/g, '-'),
      'align-' + String(block.align || 'CENTER').toLowerCase(),
      'ratio-' + String(block.ratio || 'ORIGINAL').toLowerCase()].join(' ');
    var img = el('img', {
      src: big.url, width: big.width, height: big.height, alt: block.decorative ? '' : (block.alt || ''), loading: 'lazy',
      srcset: src.map(function (s) { return s.url + ' ' + s.width + 'w'; }).join(', '), sizes: '(min-width: 737px) 760px, 100vw'
    });
    return el('figure', { 'class': cls }, [img, block.caption ? el('figcaption', { text: block.caption }) : null]);
  }

  function blocks(list, images, inColumn) {
    var out = [];
    (list || []).forEach(function (b) {
      var node = null;
      if (!b || typeof b !== 'object') return;
      if (b.type === 'heading') node = el(b.level === 3 ? 'h3' : 'h2', { text: b.text || '' });
      else if (b.type === 'text') node = richText(b.html);
      else if (b.type === 'image') node = image(b, images);
      else if (b.type === 'divider') node = el('hr');
      else if (b.type === 'button') {
        var href = httpsHref(b.href || '');
        if (href) { node = el('a', { 'class': 'btn', text: b.label || '' }); linkAttrs(node, href); }
      } else if (b.type === 'columns' && !inColumn) {
        node = el('div', { 'class': 'cols' + (b.split === 'NARROW_WIDE' ? ' narrow-wide' : '') }, [
          el('div', { 'class': 'col' }, blocks(b.left, images, true)),
          el('div', { 'class': 'col' }, blocks(b.right, images, true))]);
      }
      if (node) out.push(node);
    });
    return out;
  }

  function unwrapRich(nodes) {
    // A rich text div only groups its paragraphs; flatten it into the letter's grid.
    var out = [];
    nodes.forEach(function (n) {
      if (n.className === 'rich') Array.prototype.slice.call(n.childNodes).forEach(function (c) { out.push(c); });
      else out.push(n);
    });
    return out;
  }

  function flatBlocks(list, images, inColumn) {
    return unwrapRich(blocks(list, images, inColumn)).map(function (n) {
      if (n.className === 'cols') Array.prototype.forEach.call(n.querySelectorAll('.col'), function (c) {
        var kids = unwrapRich(Array.prototype.slice.call(c.children));
        c.textContent = '';
        kids.forEach(function (k) { c.appendChild(k); });
      });
      return n;
    });
  }

  function letter(version) {
    var content;
    try { content = JSON.parse(version.content); } catch (e) { return null; }
    if (!content || !Array.isArray(content.blocks)) return null;
    return el('div', { 'class': 'letter' }, flatBlocks(content.blocks, version.images || [], false));
  }

  function params() { return new URLSearchParams(location.search); }

  function loadOne() {
    var id = params().get('id') || '';
    if (!UUID.test(id)) { missing(); return; }
    show(skeleton('Henter nyhedsbrevet…', ['3em', '22em']));
    get('platformNewsletter(newsletterId=' + id.toLowerCase() + ')').then(function (n) {
      var versions = (n && n.versions) || [];
      if (!versions.length) { missing(); return; }
      draw(n, params().get('lang') === 'en' ? 'en' : 'da');
    }).catch(function (e) {
      if (e && e.notFound) missing();
      else failed('Nyhedsbrevet kunne ikke hentes', ['Tjek din forbindelse og prøv igen.'], loadOne);
    });
  }

  function missing() {
    document.title = 'Nyhedsbrevet findes ikke — Sekvado';
    show(el('div', { 'class': 'msg', role: 'status' }, message('h1', 'Nyhedsbrevet findes ikke',
      ['Det er måske trukket tilbage, eller adressen er forkert. Se de nyhedsbreve, der er offentliggjort.'],
      el('a', { 'class': 'archive-button', href: '/nyhedsbreve/', text: 'Til nyhedsbreve' }))));
  }

  function draw(n, want) {
    var versions = n.versions;
    var by = {};
    versions.forEach(function (v) { by[v.languageCode] = v; });
    var L = by[want] ? want : 'da';
    var v = by[L] || versions[0];
    var en = L === 'en';
    var body = letter(v);
    if (!body) { failed('Nyhedsbrevet kunne ikke hentes', ['Tjek din forbindelse og prøv igen.'], loadOne); return; }
    document.title = v.subject + ' — Sekvado';

    var toggle = null;
    if (versions.length > 1) {
      toggle = el('div', { 'class': 'lang', role: 'group', 'aria-label': 'Sprog' }, ['da', 'en'].filter(function (k) { return by[k]; }).map(function (k) {
        var b = el('button', { type: 'button', lang: k, 'aria-pressed': String(k === L), text: k === 'da' ? 'Dansk' : 'English' });
        b.addEventListener('click', function () {
          var p = params();
          if (k === 'en') p.set('lang', 'en'); else p.delete('lang');
          history.replaceState(null, '', location.pathname + '?' + p.toString());
          draw(n, k);
          document.querySelector('.lang button[aria-pressed="true"]').focus();
        });
        return b;
      }));
    }

    var meta = el('p', { 'class': 'meta' }, [
      n.sentAt ? el('span', null, [
        document.createTextNode((en ? 'Published ' : 'Udgivet ')),
        el('time', { datetime: n.sentAt.slice(0, 10), text: date(n.sentAt, L) }),
        document.createTextNode(en ? ' by Sekvado' : ' af Sekvado')]) : null,
      n.editedAt ? el('span', { 'class': 'pill', text: en ? 'Edited' : 'Redigeret' }) : null]);
    var closing = el('p', { 'class': 'closing', text: en
      ? "This is the web version of Sekvado's newsletter. Members get it in Club and by e-mail."
      : 'Det her er webudgaven af Sekvados nyhedsbrev. Medlemmer får det i Club og på e-mail.' });

    show(toggle || document.createComment(''), el('article', { lang: L }, [
      el('h1', { 'class': 'subj', text: v.subject }), meta, body, closing]));
  }

  if (!BASE) failed(isView ? 'Nyhedsbrevet kunne ikke hentes' : 'Nyhedsbrevene kunne ikke hentes', ['Tjek din forbindelse og prøv igen.'], isView ? loadOne : loadList);
  else if (isView) loadOne();
  else loadList();
})();
