/**
 * Naves Studios — bootstrap da landing.
 * Único arquivo que conhece o DOM concreto: seleciona elementos
 * e injeta cada um na classe responsável.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var N = window.Naves;

    new N.LinkContato(N.config).bind(
      document.querySelectorAll('[data-contato]')
    );

    new N.Preloader(document.querySelector('.preloader')).iniciar();
    new N.HeaderRolagem(document.querySelector('header.topo')).iniciar();

    new N.RevealOnScroll().observe(
      document.querySelectorAll('.reveal-alvo, .decola, .secao-head, .passo')
    );

    new N.ContadorAnimado().bind(document.querySelectorAll('[data-valor]'));

    new N.TrajetoriaScroll(
      document.querySelector('.trajetoria .linha path'),
      document.querySelector('.trajetoria')
    ).iniciar();

    new N.CartaoTilt().bind(document.querySelectorAll('.card'));
    new N.BotaoMagnetico().bind(document.querySelectorAll('.magnetico'));

    var contadorVitrine = new N.ContadorVitrine(
      document.querySelector('[data-vitrine-indice]'),
      document.querySelector('[data-vitrine-total]'),
      document.querySelector('[data-vitrine-barra]')
    );
    new N.VitrineScroll(document.querySelector('[data-vitrine]'))
      .assinar(contadorVitrine.atualizar.bind(contadorVitrine))
      .iniciar();

    new N.Slider(
      document.querySelector('.slider .faixa'),
      document.querySelector('.slider-controles')
    ).iniciar();
  });
})();
