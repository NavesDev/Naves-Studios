/**
 * Naves Studios — shared core.
 *
 * Architecture: classic scripts (file:// does not allow ES modules).
 * Every file registers its classes on the global `Naves` namespace;
 * only main.js knows the concrete DOM and wires the pieces together (DIP).
 */
(function () {
  'use strict';

  window.Naves = window.Naves || {};

  var DEFAULT_REVEAL_THRESHOLD = 0.15;
  /** Fraction of the viewport height an element must reach to count as visible. */
  var VIEWPORT_ENTER_RATIO = 0.9;

  /**
   * Adds the "visible" class when the target enters the viewport.
   * Uses IntersectionObserver when available; falls back to scroll measuring.
   */
  function RevealOnScroll(threshold) {
    this.threshold = typeof threshold === 'number' ? threshold : DEFAULT_REVEAL_THRESHOLD;
    this.targets = [];
  }

  RevealOnScroll.prototype.observe = function (targets) {
    this.targets = Array.prototype.slice.call(targets);
    if ('IntersectionObserver' in window) {
      this.observeWithIntersection();
    } else {
      this.observeWithScroll();
    }
    this.measureAll();
  };

  RevealOnScroll.prototype.observeWithIntersection = function () {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('visible', entry.isIntersecting);
        });
      },
      { threshold: this.threshold }
    );
    this.targets.forEach(function (target) {
      observer.observe(target);
    });
  };

  RevealOnScroll.prototype.observeWithScroll = function () {
    var measure = this.measureAll.bind(this);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
  };

  RevealOnScroll.prototype.measureAll = function () {
    var viewportHeight = viewportSize();
    this.targets.forEach(function (target) {
      var box = target.getBoundingClientRect();
      var onScreen =
        box.top < viewportHeight * VIEWPORT_ENTER_RATIO && box.bottom > 0;
      target.classList.toggle('visible', onScreen);
    });
  };

  /** Viewport height, with the pre-`innerHeight` fallback. */
  function viewportSize() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  /** true when the user asked the system for less motion. */
  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  window.Naves.RevealOnScroll = RevealOnScroll;
  window.Naves.prefersReducedMotion = prefersReducedMotion;
  window.Naves.viewportSize = viewportSize;
})();
