/**
 * Naves Studios — núcleo compartilhado.
 *
 * Arquitetura: scripts clássicos (file:// não permite ES modules).
 * Cada arquivo registra classes no namespace global `Naves`;
 * apenas main.js conhece o DOM concreto e liga as peças (DIP).
 */
(function () {
  'use strict';

  window.Naves = window.Naves || {};

  /**
   * Aplica a classe "visivel" quando o alvo entra na viewport.
   * IntersectionObserver quando disponível; senão, medição em scroll.
   */
  function RevealOnScroll(threshold) {
    this.threshold = typeof threshold === 'number' ? threshold : 0.15;
    this.alvos = [];
  }

  RevealOnScroll.prototype.observe = function (alvos) {
    this.alvos = Array.prototype.slice.call(alvos);
    if ('IntersectionObserver' in window) {
      this.observarComIO();
    } else {
      this.observarComScroll();
    }
    this.medirTodos();
  };

  RevealOnScroll.prototype.observarComIO = function () {
    var observer = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          entrada.target.classList.toggle('visivel', entrada.isIntersecting);
        });
      },
      { threshold: this.threshold }
    );
    this.alvos.forEach(function (alvo) {
      observer.observe(alvo);
    });
  };

  RevealOnScroll.prototype.observarComScroll = function () {
    var medir = this.medirTodos.bind(this);
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
  };

  RevealOnScroll.prototype.medirTodos = function () {
    var alturaJanela =
      window.innerHeight || document.documentElement.clientHeight;
    this.alvos.forEach(function (alvo) {
      var caixa = alvo.getBoundingClientRect();
      var naTela = caixa.top < alturaJanela * 0.9 && caixa.bottom > 0;
      alvo.classList.toggle('visivel', naTela);
    });
  };

  /** true quando o usuário pediu menos movimento no sistema. */
  function prefereMenosMovimento() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  window.Naves.RevealOnScroll = RevealOnScroll;
  window.Naves.prefereMenosMovimento = prefereMenosMovimento;
})();
