(function () {
  var uid = 0;

  function setOpen(li, open) {
    li.classList.toggle('is-open', open);
    var btn = li.querySelector(':scope > .reed-submenu__row > .reed-submenu__toggle');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function closeWithDescendants(li) {
    setOpen(li, false);
    li.querySelectorAll('li.is-open').forEach(function (d) { setOpen(d, false); });
  }

  function toggle(li) {
    if (li.classList.contains('is-open')) {
      closeWithDescendants(li);
      return;
    }
    // Accordion: close siblings (and their descendants) at this level
    Array.prototype.forEach.call(li.parentElement.children, function (sib) {
      if (sib !== li && sib.classList.contains('is-open')) closeWithDescendants(sib);
    });
    setOpen(li, true);
  }

  function enhance(nav) {
    nav.classList.add('is-enhanced');

    nav.querySelectorAll('li').forEach(function (li) {
      var sub = li.querySelector(':scope > ul');
      if (!sub) return;

      sub.id = sub.id || 'reed-submenu-' + (++uid);

      var row = document.createElement('div');
      row.className = 'reed-submenu__row';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reed-submenu__toggle';
      btn.setAttribute('aria-controls', sub.id);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () { toggle(li); });

      var link = li.querySelector(':scope > a');

      if (link) {
        // Parent with its own page: link navigates, caret toggles.
        li.insertBefore(row, link);
        row.appendChild(link);
        btn.setAttribute('aria-label', 'Toggle sub-items for ' + link.textContent.trim());
        row.appendChild(btn);
      } else {
        // Parent with no page of its own: the whole label is the toggle.
        var text = '';
        Array.prototype.slice.call(li.childNodes).some(function (n) {
          if (n === sub) return true;          // stop at the sub-list
          text += n.textContent;
          li.removeChild(n);
          return false;
        });
        var label = document.createElement('span');
        label.className = 'reed-submenu__label';
        label.textContent = text.replace(/\s+/g, ' ').trim();
        btn.classList.add('reed-submenu__toggle--label');
        btn.appendChild(label);
        li.insertBefore(row, sub);
        row.appendChild(btn);
      }
    });

    // Mark the current page and open its ancestors
    var here = location.pathname.replace(/\/$/, '');
    nav.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (a.pathname.replace(/\/$/, '') === here) {
        a.setAttribute('aria-current', 'page');
        for (var li = a.closest('li'); li && nav.contains(li); li = li.parentElement.closest('li')) {
          if (li.querySelector(':scope > ul')) setOpen(li, true);
        }
      }
    });
  }

  function init(context) {
    (context || document).querySelectorAll('.reed-submenu:not(.is-enhanced)').forEach(enhance);
  }

  if (window.Drupal && Drupal.behaviors) {
    Drupal.behaviors.reedSubmenu = { attach: function (context) { init(context); } };
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
