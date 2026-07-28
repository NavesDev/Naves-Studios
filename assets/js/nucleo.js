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

  /**
   * Preenche os links de contato com o e-mail vindo da configuração.
   * O endereço não fica no HTML: vem do .env via scripts/gerar-config.js.
   * Sem configuração, o link continua inerte (sem href) em vez de apontar
   * para um endereço errado.
   *
   * @param {{contatoEmail?: string, contatoAssunto?: string}} [config]
   */
  function LinkContato(config) {
    this.config = config || null;
  }

  /** @param {ArrayLike<HTMLAnchorElement>} links */
  LinkContato.prototype.bind = function (links) {
    var config = this.config;
    if (!config || !config.contatoEmail) return;
    var assunto = config.contatoAssunto
      ? '?subject=' + encodeURIComponent(config.contatoAssunto)
      : '';
    Array.prototype.forEach.call(links, function (link) {
      link.setAttribute('href', 'mailto:' + config.contatoEmail + assunto);
      link.removeAttribute('aria-disabled');
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
  window.Naves.LinkContato = LinkContato;
  window.Naves.prefereMenosMovimento = prefereMenosMovimento;
})();
