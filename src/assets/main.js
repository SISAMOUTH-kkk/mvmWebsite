/* MVM GROUP — small progressive enhancements. The site works without JS. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Netlify Identity invite / password-reset links land on the site: send them to the CMS.
  if (/(invite|confirmation|recovery|email_change)_token=/.test(location.hash)) {
    location.replace('/admin/' + location.hash);
    return;
  }

  function $(sel, ctx) {
    return (ctx || doc).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }

  /* Header: solid background after scrolling --------------------------- */
  var header = $('[data-header]');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 24 || doc.body.classList.contains('nav-open'));
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* Mobile navigation ---------------------------------------------------- */
  var burger = $('[data-burger]');
  var mobileNav = $('#mobile-nav');
  function setNav(open) {
    if (!burger || !mobileNav) return;
    burger.setAttribute('aria-expanded', String(open));
    mobileNav.classList.toggle('is-open', open);
    mobileNav.toggleAttribute('inert', !open);
    doc.body.classList.toggle('nav-open', open);
    onScrollHeader();
    if (open) {
      var first = $('a, summary', mobileNav);
      if (first) first.focus({ preventScroll: true });
    }
  }
  if (burger && mobileNav) {
    mobileNav.setAttribute('inert', '');
    burger.addEventListener('click', function () {
      setNav(burger.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1200) setNav(false);
    });
  }

  /* Desktop dropdowns: close on Escape --------------------------------- */
  $$('.nav__item.has-menu').forEach(function (item) {
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var link = $('.nav__link', item);
        item.classList.remove('is-open');
        if (link) link.focus();
        if (doc.activeElement) doc.activeElement.blur();
      }
    });
  });

  /* Remember the chosen language for the root redirect ------------------ */
  $$('[data-lang-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      try {
        localStorage.setItem('mvm-lang', a.getAttribute('data-lang-link'));
      } catch (e) {}
    });
  });

  /* Reveal on scroll ------------------------------------------------------ */
  // Crossfade photo slideshows (home travel room, tour page hero)
  $$('[data-slides]').forEach(function (box) {
    var slides = $$('picture', box);
    var scope = box.closest('.room, .tour-hero') || box.parentElement;
    var places = $$('[data-slide-labels] > span', scope);
    if (slides.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      slides[i].classList.remove('is-active');
      if (places[i]) places[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
      if (places[i]) places[i].classList.add('is-active');
    }, 5500);
  });

  var revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) {
        el.classList.add('is-in');
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* Gentle parallax on decorative layers -------------------------------- */
  var parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var y = window.scrollY;
      parallaxEls.forEach(function (el) {
        var factor = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        if (y < window.innerHeight * 1.5) el.style.transform = 'translate3d(0,' + (y * factor).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* Table of contents highlighting -------------------------------------- */
  var tocLinks = $$('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      map[a.getAttribute('href').slice(1)] = a;
    });
    var tocObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (a) {
              a.classList.remove('is-active');
            });
            var link = map[entry.target.id];
            if (link) link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    Object.keys(map).forEach(function (id) {
      var section = doc.getElementById(id);
      if (section) tocObserver.observe(section);
    });
  }

  /* Project filters ------------------------------------------------------- */
  $$('[data-filter-group]').forEach(function (group) {
    var target = doc.getElementById(group.getAttribute('data-filter-group'));
    if (!target) return;
    var buttons = $$('button[data-filter]', group);
    var empty = $('[data-filter-empty]', target.parentNode);
    function apply(value) {
      var shown = 0;
      $$('[data-category]', target).forEach(function (card) {
        var match = value === 'all' || card.getAttribute('data-category') === value;
        card.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === value));
      });
      if (empty) empty.hidden = shown > 0;
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var value = b.getAttribute('data-filter');
        apply(value);
        if (history.replaceState) history.replaceState(null, '', value === 'all' ? location.pathname : '#' + value);
      });
    });
    var initial = location.hash.slice(1);
    if (initial && buttons.some(function (b) { return b.getAttribute('data-filter') === initial; })) apply(initial);
  });

  /* Forms: prefill, validation, double-submit guard ---------------------- */
  var params = new URLSearchParams(location.search);
  $$('form[data-form]').forEach(function (form) {
    var msgs = {
      required: form.getAttribute('data-msg-required'),
      email: form.getAttribute('data-msg-email'),
      choice: form.getAttribute('data-msg-choice'),
      consent: form.getAttribute('data-msg-consent'),
    };

    // Prefill from links such as /en/quote/?service=translation-interpretation
    ['service', 'brand', 'type', 'interest'].forEach(function (key) {
      var value = params.get(key);
      if (!value) return;
      $$('[data-prefill="' + key + '"]', form).forEach(function (input) {
        if (input.tagName === 'SELECT') {
          if ($('option[value="' + CSS.escape(value) + '"]', input)) input.value = value;
        } else if (input.value === value) {
          input.checked = true;
        }
      });
    });

    // A tour package link (?tour=...) starts the message with the tour name
    var tour = params.get('tour');
    if (tour) {
      var box = $('textarea[name="details"], textarea[name="message"]', form);
      if (box && !box.value) box.value = tour + '\n';
    }

    var pageField = $('input[name="page"]', form);
    if (pageField) pageField.value = location.href;

    function setError(field, message) {
      if (!field) return;
      field.classList.toggle('has-error', !!message);
      var box = $('.field__error', field);
      if (!box && message) {
        box = doc.createElement('p');
        box.className = 'field__error';
        box.id = 'err-' + Math.random().toString(36).slice(2, 8);
        field.appendChild(box);
      }
      if (box) {
        box.textContent = message || '';
        box.hidden = !message;
        var control = $('input, select, textarea', field);
        if (control) {
          if (message) {
            control.setAttribute('aria-invalid', 'true');
            control.setAttribute('aria-describedby', box.id);
          } else {
            control.removeAttribute('aria-invalid');
          }
        }
      }
    }

    function validate() {
      var firstInvalid = null;
      $$('.field', form).forEach(function (field) {
        var control = $('input:not([type=checkbox]):not([type=radio]), select, textarea', field);
        if (!control) return;
        var message = '';
        var value = (control.value || '').trim();
        if (control.required && !value) message = msgs.required;
        else if (control.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = msgs.email;
        setError(field, message);
        if (message && !firstInvalid) firstInvalid = control;
      });
      $$('[data-required-group]', form).forEach(function (group) {
        var checked = $$('input:checked', group).length > 0;
        setError(group, checked ? '' : msgs.choice);
        if (!checked && !firstInvalid) firstInvalid = $('input', group);
      });
      $$('[data-consent]', form).forEach(function (wrap) {
        var box = $('input', wrap);
        var ok = box && box.checked;
        setError(wrap, ok ? '' : msgs.consent);
        if (!ok && !firstInvalid) firstInvalid = box;
      });
      return firstInvalid;
    }

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      var invalid = validate();
      if (invalid) {
        e.preventDefault();
        invalid.focus();
        return;
      }
      var button = $('button[type=submit]', form);
      if (button) {
        button.disabled = true;
        button.textContent = form.getAttribute('data-msg-sending') || button.textContent;
      }
    });
    form.addEventListener('change', function (e) {
      var field = e.target.closest('.field, [data-required-group], [data-consent]');
      if (field && field.classList.contains('has-error')) validate();
    });
  });

  /* Floating quick-contact ---------------------------------------------- */
  var quick = $('[data-quick]');
  if (quick) {
    var qToggle = $('.quick__toggle', quick);
    qToggle.addEventListener('click', function () {
      var open = !quick.classList.contains('is-open');
      quick.classList.toggle('is-open', open);
      qToggle.setAttribute('aria-expanded', String(open));
    });
    doc.addEventListener('click', function (e) {
      if (!quick.contains(e.target)) {
        quick.classList.remove('is-open');
        qToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Copy link ------------------------------------------------------------- */
  $$('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var done = function () {
        var label = btn.getAttribute('data-copied');
        if (label) btn.setAttribute('aria-label', label);
        btn.classList.add('is-copied');
        var text = $('span', btn);
        if (text && label) text.textContent = label;
      };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {});
    });
  });

  /* Click-to-load video (keeps pages fast) ----------------------------- */
  $$('[data-video]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.parentNode;
      var src = btn.getAttribute('data-video');
      var iframe = doc.createElement('iframe');
      iframe.src = src;
      iframe.title = btn.getAttribute('aria-label') || 'Video';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
    });
  });
})();
