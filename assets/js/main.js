/**
 * Naves Studios — landing page bootstrap.
 * The only file that knows the concrete DOM: it selects elements
 * and injects each one into the class responsible for it.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var N = window.Naves;

    new N.Preloader(document.querySelector('.preloader')).start();
    new N.HeaderScroll(document.querySelector('header.topbar')).start();

    new N.RevealOnScroll().observe(
      document.querySelectorAll('.reveal-target, .liftoff, .section-head, .step')
    );

    new N.AnimatedCounter().bind(document.querySelectorAll('[data-value]'));

    new N.ScrollTrajectory(
      document.querySelector('.trajectory .line path'),
      document.querySelector('.trajectory')
    ).start();

    new N.CardTilt().bind(document.querySelectorAll('.card'));
    new N.MagneticButton().bind(document.querySelectorAll('.magnetic'));

    var showcaseCounter = new N.ShowcaseCounter(
      document.querySelector('[data-showcase-index]'),
      document.querySelector('[data-showcase-total]'),
      document.querySelector('[data-showcase-bar]')
    );
    new N.ShowcaseScroll(document.querySelector('[data-showcase]'))
      .subscribe(showcaseCounter.update.bind(showcaseCounter))
      .start();

    new N.Slider(
      document.querySelector('.slider .rail'),
      document.querySelector('.slider-controls')
    ).start();
  });
})();
