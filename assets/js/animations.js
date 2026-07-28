/**
 * Naves Studios — landing page animations.
 * One responsibility per class; none of them knows the others.
 * All degrade gracefully: without the effect, the content stays readable.
 */
(function () {
  'use strict';

  window.Naves = window.Naves || {};

  var PRELOADER_DURATION_MS = 1400;
  var PRELOADER_AFTER_LOAD_MS = 300;
  var COUNTER_DURATION_MS = 1600;
  var COUNTER_VISIBLE_RATIO = 0.6;
  var TRAJECTORY_LEAD_RATIO = 0.85;
  var TRAJECTORY_SPAN_RATIO = 0.3;
  var CARD_TILT_DEGREES = 7;
  var CARD_TILT_PERSPECTIVE_PX = 700;
  var CARD_TILT_LIFT_PX = 6;
  var MAGNETIC_PULL_RATIO = 0.3;
  var SLIDER_INTERVAL_MS = 6000;
  var SLIDER_MIN_ITEMS = 2;
  var HEADER_SCROLL_OFFSET_PX = 10;
  var PERCENT = 100;
  var TWO_DIGIT_LIMIT = 10;

  /** Hides the splash screen once the logo has drawn itself. */
  function Preloader(element, durationMs) {
    this.element = element;
    this.durationMs = typeof durationMs === 'number' ? durationMs : PRELOADER_DURATION_MS;
  }

  Preloader.prototype.start = function () {
    if (!this.element) return;
    var element = this.element;
    var hide = function () {
      element.classList.add('gone');
    };
    if (window.Naves.prefersReducedMotion()) {
      hide();
      return;
    }
    setTimeout(hide, this.durationMs);
    window.addEventListener('load', function () {
      setTimeout(hide, PRELOADER_AFTER_LOAD_MS);
    });
  };

  /** Counts from zero up to data-value once the element becomes visible. */
  function AnimatedCounter(durationMs) {
    this.durationMs = typeof durationMs === 'number' ? durationMs : COUNTER_DURATION_MS;
  }

  AnimatedCounter.prototype.bind = function (elements) {
    var self = this;
    Array.prototype.forEach.call(elements, function (element) {
      var finalValue = parseInt(element.getAttribute('data-value'), 10) || 0;
      var suffix = element.getAttribute('data-suffix') || '';
      if (window.Naves.prefersReducedMotion() || !('IntersectionObserver' in window)) {
        element.textContent = finalValue + suffix;
        return;
      }
      element.textContent = '0' + suffix;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(element);
          self.animate(element, finalValue, suffix);
        });
      }, { threshold: COUNTER_VISIBLE_RATIO });
      observer.observe(element);
    });
  };

  AnimatedCounter.prototype.animate = function (element, finalValue, suffix) {
    var startedAt = null;
    var duration = this.durationMs;
    function frame(now) {
      if (startedAt === null) startedAt = now;
      var progress = Math.min((now - startedAt) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(finalValue * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /** Draws a path following the scroll progress over its section. */
  function ScrollTrajectory(path, section) {
    this.path = path;
    this.section = section;
  }

  ScrollTrajectory.prototype.start = function () {
    if (!this.path || !this.section) return;
    var length = this.path.getTotalLength();
    this.path.style.strokeDasharray = length + ' ' + length;
    this.path.style.strokeDashoffset = length;
    if (window.Naves.prefersReducedMotion()) {
      this.path.style.strokeDashoffset = 0;
      return;
    }
    var update = this.update.bind(this, length);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  };

  ScrollTrajectory.prototype.update = function (length) {
    var box = this.section.getBoundingClientRect();
    var viewportHeight = window.Naves.viewportSize();
    var progress =
      (viewportHeight * TRAJECTORY_LEAD_RATIO - box.top) /
      (box.height + viewportHeight * TRAJECTORY_SPAN_RATIO);
    progress = Math.max(0, Math.min(1, progress));
    this.path.style.strokeDashoffset = length * (1 - progress);
  };

  /** Tilts the card following the mouse (subtle 3D effect). */
  function CardTilt(intensity) {
    this.intensity = typeof intensity === 'number' ? intensity : CARD_TILT_DEGREES;
  }

  CardTilt.prototype.bind = function (cards) {
    if (window.Naves.prefersReducedMotion()) return;
    var intensity = this.intensity;
    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener('mousemove', function (event) {
        var box = card.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width - 0.5;
        var y = (event.clientY - box.top) / box.height - 0.5;
        card.style.transform =
          'perspective(' + CARD_TILT_PERSPECTIVE_PX + 'px) rotateY(' + x * intensity + 'deg)' +
          ' rotateX(' + -y * intensity + 'deg) translateY(-' + CARD_TILT_LIFT_PX + 'px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  };

  /** Button that drifts slightly toward the cursor. */
  function MagneticButton(pull) {
    this.pull = typeof pull === 'number' ? pull : MAGNETIC_PULL_RATIO;
  }

  MagneticButton.prototype.bind = function (buttons) {
    if (window.Naves.prefersReducedMotion()) return;
    var pull = this.pull;
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('mousemove', function (event) {
        var box = button.getBoundingClientRect();
        var x = event.clientX - box.left - box.width / 2;
        var y = event.clientY - box.top - box.height / 2;
        button.style.transform =
          'translate(' + x * pull + 'px,' + y * pull + 'px)';
      });
      button.addEventListener('mouseleave', function () {
        button.style.transform = '';
      });
    });
  };

  /** Simple slider with navigation dots and automatic rotation. */
  function Slider(rail, controls, intervalMs) {
    this.rail = rail;
    this.controls = controls;
    this.intervalMs = typeof intervalMs === 'number' ? intervalMs : SLIDER_INTERVAL_MS;
    this.index = 0;
    this.total = rail ? rail.children.length : 0;
    this.timer = null;
  }

  Slider.prototype.start = function () {
    if (!this.rail || this.total < SLIDER_MIN_ITEMS) return;
    var self = this;
    Array.prototype.forEach.call(
      this.controls.querySelectorAll('button'),
      function (button, index) {
        button.addEventListener('click', function () {
          self.goTo(index);
          self.schedule();
        });
      }
    );
    this.goTo(0);
    if (!window.Naves.prefersReducedMotion()) this.schedule();
  };

  Slider.prototype.goTo = function (index) {
    this.index = (index + this.total) % this.total;
    this.rail.style.transform = 'translateX(-' + this.index * PERCENT + '%)';
    var buttons = this.controls.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (button, i) {
      button.setAttribute('aria-current', String(i === this.index));
    }, this);
  };

  Slider.prototype.schedule = function () {
    var self = this;
    clearInterval(this.timer);
    this.timer = setInterval(function () {
      self.goTo(self.index + 1);
    }, this.intervalMs);
  };

  /**
   * Project showcase: syncs the scrolling copy with the mockups pinned
   * alongside it. It only knows how to activate/deactivate an index —
   * anything that wants to react (counter, bar, analytics) subscribes.
   *
   * SRP: it only decides which project is in focus.
   * OCP: new reactors come in through subscribe(), without touching the class.
   */
  function ShowcaseScroll(root) {
    this.root = root;
    this.steps = [];
    this.panels = [];
    this.listeners = [];
    this.index = -1;
  }

  /** @param {function(number, number): void} listener receives (index, total) */
  ShowcaseScroll.prototype.subscribe = function (listener) {
    this.listeners.push(listener);
    return this;
  };

  ShowcaseScroll.prototype.start = function () {
    if (!this.root) return;
    var toArray = Array.prototype.slice;
    this.steps = toArray.call(this.root.querySelectorAll('[data-showcase-step]'));
    this.panels = toArray.call(this.root.querySelectorAll('[data-showcase-panel]'));
    if (!this.steps.length || this.steps.length !== this.panels.length) return;

    this.activate(0);
    this.observeWithScroll();
  };

  /**
   * Measures on scroll, capped at one frame at a time (requestAnimationFrame).
   * Measuring is deterministic: the step closest to the center always wins,
   * even on large scroll jumps (anchors, keyboard, scroll restoration).
   */
  ShowcaseScroll.prototype.observeWithScroll = function () {
    var self = this;
    var scheduled = false;
    var schedule = function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        self.measure();
      });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    this.measure();
  };

  /** Activates the step whose center is closest to the center of the screen. */
  ShowcaseScroll.prototype.measure = function () {
    var center = window.Naves.viewportSize() / 2;
    var best = 0;
    var shortestDistance = Infinity;
    this.steps.forEach(function (step, index) {
      var box = step.getBoundingClientRect();
      var distance = Math.abs(box.top + box.height / 2 - center);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        best = index;
      }
    });
    this.activate(best);
  };

  /** @param {number} index */
  ShowcaseScroll.prototype.activate = function (index) {
    if (index < 0 || index === this.index) return;
    this.index = index;
    this.steps.forEach(function (step, i) {
      step.classList.toggle('active', i === index);
    });
    this.panels.forEach(function (panel, i) {
      panel.classList.toggle('active', i === index);
    });
    var total = this.steps.length;
    this.listeners.forEach(function (listener) {
      listener(index, total);
    });
  };

  /** "01 / 04" counter plus the showcase progress bar. */
  function ShowcaseCounter(indexElement, totalElement, bar) {
    this.indexElement = indexElement;
    this.totalElement = totalElement;
    this.bar = bar;
  }

  /** @param {number} index @param {number} total */
  ShowcaseCounter.prototype.update = function (index, total) {
    if (this.indexElement) {
      this.indexElement.textContent = padTwoDigits(index + 1);
    }
    if (this.totalElement) {
      this.totalElement.textContent = padTwoDigits(total);
    }
    if (this.bar) {
      this.bar.style.width = ((index + 1) / total) * PERCENT + '%';
    }
  };

  function padTwoDigits(number) {
    return (number < TWO_DIGIT_LIMIT ? '0' : '') + number;
  }

  /** Shadow under the header once the page has scrolled. */
  function HeaderScroll(header) {
    this.header = header;
  }

  HeaderScroll.prototype.start = function () {
    if (!this.header) return;
    var header = this.header;
    var update = function () {
      header.classList.toggle('scrolled', window.scrollY > HEADER_SCROLL_OFFSET_PX);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  window.Naves.Preloader = Preloader;
  window.Naves.AnimatedCounter = AnimatedCounter;
  window.Naves.ScrollTrajectory = ScrollTrajectory;
  window.Naves.CardTilt = CardTilt;
  window.Naves.MagneticButton = MagneticButton;
  window.Naves.Slider = Slider;
  window.Naves.ShowcaseScroll = ShowcaseScroll;
  window.Naves.ShowcaseCounter = ShowcaseCounter;
  window.Naves.HeaderScroll = HeaderScroll;
})();
