/**
 * Naves Studios — animações da landing.
 * Cada classe tem uma responsabilidade; nenhuma conhece as outras.
 * Todas degradam com elegância: sem o recurso, o conteúdo continua legível.
 */
(function () {
  'use strict';

  window.Naves = window.Naves || {};

  /** Esconde a tela de abertura após o desenho do logo. */
  function Preloader(elemento, duracaoMs) {
    this.elemento = elemento;
    this.duracaoMs = typeof duracaoMs === 'number' ? duracaoMs : 1400;
  }

  Preloader.prototype.iniciar = function () {
    if (!this.elemento) return;
    var elemento = this.elemento;
    var esconder = function () {
      elemento.classList.add('saiu');
    };
    if (window.Naves.prefereMenosMovimento()) {
      esconder();
      return;
    }
    setTimeout(esconder, this.duracaoMs);
    window.addEventListener('load', function () {
      setTimeout(esconder, 300);
    });
  };

  /** Conta de zero até data-valor quando o elemento fica visível. */
  function ContadorAnimado(duracaoMs) {
    this.duracaoMs = typeof duracaoMs === 'number' ? duracaoMs : 1600;
  }

  ContadorAnimado.prototype.bind = function (elementos) {
    var self = this;
    Array.prototype.forEach.call(elementos, function (elemento) {
      var valorFinal = parseInt(elemento.getAttribute('data-valor'), 10) || 0;
      var sufixo = elemento.getAttribute('data-sufixo') || '';
      if (window.Naves.prefereMenosMovimento() || !('IntersectionObserver' in window)) {
        elemento.textContent = valorFinal + sufixo;
        return;
      }
      elemento.textContent = '0' + sufixo;
      var observer = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          observer.unobserve(elemento);
          self.animar(elemento, valorFinal, sufixo);
        });
      }, { threshold: 0.6 });
      observer.observe(elemento);
    });
  };

  ContadorAnimado.prototype.animar = function (elemento, valorFinal, sufixo) {
    var inicio = null;
    var duracao = this.duracaoMs;
    function passo(agora) {
      if (inicio === null) inicio = agora;
      var progresso = Math.min((agora - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - progresso, 3);
      elemento.textContent = Math.round(valorFinal * suave) + sufixo;
      if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  };

  /** Desenha um path conforme o progresso de rolagem sobre a seção. */
  function TrajetoriaScroll(path, secao) {
    this.path = path;
    this.secao = secao;
  }

  TrajetoriaScroll.prototype.iniciar = function () {
    if (!this.path || !this.secao) return;
    var comprimento = this.path.getTotalLength();
    this.path.style.strokeDasharray = comprimento + ' ' + comprimento;
    this.path.style.strokeDashoffset = comprimento;
    if (window.Naves.prefereMenosMovimento()) {
      this.path.style.strokeDashoffset = 0;
      return;
    }
    var atualizar = this.atualizar.bind(this, comprimento);
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  };

  TrajetoriaScroll.prototype.atualizar = function (comprimento) {
    var caixa = this.secao.getBoundingClientRect();
    var alturaJanela =
      window.innerHeight || document.documentElement.clientHeight;
    var progresso =
      (alturaJanela * 0.85 - caixa.top) / (caixa.height + alturaJanela * 0.3);
    progresso = Math.max(0, Math.min(1, progresso));
    this.path.style.strokeDashoffset = comprimento * (1 - progresso);
  };

  /** Inclina o cartão seguindo o mouse (efeito 3D sutil). */
  function CartaoTilt(intensidade) {
    this.intensidade = typeof intensidade === 'number' ? intensidade : 7;
  }

  CartaoTilt.prototype.bind = function (cartoes) {
    if (window.Naves.prefereMenosMovimento()) return;
    var intensidade = this.intensidade;
    Array.prototype.forEach.call(cartoes, function (cartao) {
      cartao.addEventListener('mousemove', function (evento) {
        var caixa = cartao.getBoundingClientRect();
        var x = (evento.clientX - caixa.left) / caixa.width - 0.5;
        var y = (evento.clientY - caixa.top) / caixa.height - 0.5;
        cartao.style.transform =
          'perspective(700px) rotateY(' + x * intensidade + 'deg)' +
          ' rotateX(' + -y * intensidade + 'deg) translateY(-6px)';
      });
      cartao.addEventListener('mouseleave', function () {
        cartao.style.transform = '';
      });
    });
  };

  /** Botão que gravita levemente na direção do cursor. */
  function BotaoMagnetico(alcance) {
    this.alcance = typeof alcance === 'number' ? alcance : 0.3;
  }

  BotaoMagnetico.prototype.bind = function (botoes) {
    if (window.Naves.prefereMenosMovimento()) return;
    var alcance = this.alcance;
    Array.prototype.forEach.call(botoes, function (botao) {
      botao.addEventListener('mousemove', function (evento) {
        var caixa = botao.getBoundingClientRect();
        var x = evento.clientX - caixa.left - caixa.width / 2;
        var y = evento.clientY - caixa.top - caixa.height / 2;
        botao.style.transform =
          'translate(' + x * alcance + 'px,' + y * alcance + 'px)';
      });
      botao.addEventListener('mouseleave', function () {
        botao.style.transform = '';
      });
    });
  };

  /** Slider simples com bolinhas de navegação e troca automática. */
  function Slider(faixa, controles, intervaloMs) {
    this.faixa = faixa;
    this.controles = controles;
    this.intervaloMs = typeof intervaloMs === 'number' ? intervaloMs : 6000;
    this.indice = 0;
    this.total = faixa ? faixa.children.length : 0;
    this.timer = null;
  }

  Slider.prototype.iniciar = function () {
    if (!this.faixa || this.total < 2) return;
    var self = this;
    Array.prototype.forEach.call(
      this.controles.querySelectorAll('button'),
      function (botao, indice) {
        botao.addEventListener('click', function () {
          self.irPara(indice);
          self.agendar();
        });
      }
    );
    this.irPara(0);
    if (!window.Naves.prefereMenosMovimento()) this.agendar();
  };

  Slider.prototype.irPara = function (indice) {
    this.indice = (indice + this.total) % this.total;
    this.faixa.style.transform = 'translateX(-' + this.indice * 100 + '%)';
    var botoes = this.controles.querySelectorAll('button');
    Array.prototype.forEach.call(botoes, function (botao, i) {
      botao.setAttribute('aria-current', String(i === this.indice));
    }, this);
  };

  Slider.prototype.agendar = function () {
    var self = this;
    clearInterval(this.timer);
    this.timer = setInterval(function () {
      self.irPara(self.indice + 1);
    }, this.intervaloMs);
  };

  /**
   * Vitrine de projetos: sincroniza os textos que rolam com os mockups
   * fixos ao lado. Sabe apenas ativar/desativar índices — quem quiser
   * reagir (contador, barra, analytics) se inscreve via assinar().
   *
   * SRP: só decide qual projeto está em foco.
   * OCP: novos reagentes entram por assinatura, sem tocar na classe.
   */
  function VitrineScroll(raiz) {
    this.raiz = raiz;
    this.passos = [];
    this.paineis = [];
    this.ouvintes = [];
    this.indice = -1;
  }

  /** @param {function(number, number): void} ouvinte recebe (indice, total) */
  VitrineScroll.prototype.assinar = function (ouvinte) {
    this.ouvintes.push(ouvinte);
    return this;
  };

  VitrineScroll.prototype.iniciar = function () {
    if (!this.raiz) return;
    var seletor = Array.prototype.slice;
    this.passos = seletor.call(this.raiz.querySelectorAll('[data-vitrine-passo]'));
    this.paineis = seletor.call(this.raiz.querySelectorAll('[data-vitrine-painel]'));
    if (!this.passos.length || this.passos.length !== this.paineis.length) return;

    this.ativar(0);
    this.observarComScroll();
  };

  /**
   * Mede na rolagem, limitado a um quadro por vez (requestAnimationFrame).
   * Medir é determinístico: o passo mais próximo do centro sempre vence,
   * mesmo em saltos grandes de rolagem (âncoras, teclado, restauração).
   */
  VitrineScroll.prototype.observarComScroll = function () {
    var self = this;
    var agendado = false;
    var agendar = function () {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(function () {
        agendado = false;
        self.medir();
      });
    };
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    this.medir();
  };

  /** Ativa o passo cujo centro está mais perto do centro da tela. */
  VitrineScroll.prototype.medir = function () {
    var centro = (window.innerHeight || document.documentElement.clientHeight) / 2;
    var melhor = 0;
    var menorDistancia = Infinity;
    this.passos.forEach(function (passo, indice) {
      var caixa = passo.getBoundingClientRect();
      var distancia = Math.abs(caixa.top + caixa.height / 2 - centro);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        melhor = indice;
      }
    });
    this.ativar(melhor);
  };

  /** @param {number} indice */
  VitrineScroll.prototype.ativar = function (indice) {
    if (indice < 0 || indice === this.indice) return;
    this.indice = indice;
    this.passos.forEach(function (passo, i) {
      passo.classList.toggle('ativo', i === indice);
    });
    this.paineis.forEach(function (painel, i) {
      painel.classList.toggle('ativo', i === indice);
    });
    var total = this.passos.length;
    this.ouvintes.forEach(function (ouvinte) {
      ouvinte(indice, total);
    });
  };

  /** Contador "01 / 04" + barra de progresso da vitrine. */
  function ContadorVitrine(elementoIndice, elementoTotal, barra) {
    this.elementoIndice = elementoIndice;
    this.elementoTotal = elementoTotal;
    this.barra = barra;
  }

  /** @param {number} indice @param {number} total */
  ContadorVitrine.prototype.atualizar = function (indice, total) {
    if (this.elementoIndice) {
      this.elementoIndice.textContent = formatarDoisDigitos(indice + 1);
    }
    if (this.elementoTotal) {
      this.elementoTotal.textContent = formatarDoisDigitos(total);
    }
    if (this.barra) {
      this.barra.style.width = ((indice + 1) / total) * 100 + '%';
    }
  };

  function formatarDoisDigitos(numero) {
    return (numero < 10 ? '0' : '') + numero;
  }

  /** Sombra no header depois que a página rola. */
  function HeaderRolagem(header) {
    this.header = header;
  }

  HeaderRolagem.prototype.iniciar = function () {
    if (!this.header) return;
    var header = this.header;
    var atualizar = function () {
      header.classList.toggle('rolou', window.scrollY > 10);
    };
    window.addEventListener('scroll', atualizar, { passive: true });
    atualizar();
  };

  window.Naves.Preloader = Preloader;
  window.Naves.ContadorAnimado = ContadorAnimado;
  window.Naves.TrajetoriaScroll = TrajetoriaScroll;
  window.Naves.CartaoTilt = CartaoTilt;
  window.Naves.BotaoMagnetico = BotaoMagnetico;
  window.Naves.Slider = Slider;
  window.Naves.VitrineScroll = VitrineScroll;
  window.Naves.ContadorVitrine = ContadorVitrine;
  window.Naves.HeaderRolagem = HeaderRolagem;
})();
