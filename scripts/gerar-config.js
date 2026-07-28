/**
 * Gera assets/js/config.js a partir do .env.
 *
 * Por que um passo de geração: a landing roda via file://, sem servidor e sem
 * bundler, então o navegador não tem como ler o .env em tempo de execução.
 * O .env e o config.js gerado ficam fora do versionamento — o repositório
 * carrega apenas o .env.exemplo.
 *
 * Uso: node scripts/gerar-config.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

var RAIZ = path.join(__dirname, '..');
var ARQUIVO_ENV = path.join(RAIZ, '.env');
var ARQUIVO_SAIDA = path.join(RAIZ, 'assets', 'js', 'config.js');

/** Lê um .env simples (CHAVE=valor) e devolve um objeto. */
function lerEnv(caminho) {
  var conteudo = fs.readFileSync(caminho, 'utf8');
  return conteudo.split(/\r?\n/).reduce(function (acumulado, linha) {
    var limpa = linha.trim();
    if (!limpa || limpa.charAt(0) === '#') return acumulado;
    var separador = limpa.indexOf('=');
    if (separador === -1) return acumulado;
    var chave = limpa.slice(0, separador).trim();
    var valor = limpa.slice(separador + 1).trim();
    // Aspas em volta do valor são opcionais.
    valor = valor.replace(/^(['"])(.*)\1$/, '$2');
    acumulado[chave] = valor;
    return acumulado;
  }, {});
}

/** Monta o conteúdo do config.js a partir das variáveis lidas. */
function montarConfig(env) {
  var config = {
    contatoEmail: env.CONTATO_EMAIL || '',
    contatoAssunto: env.CONTATO_ASSUNTO || ''
  };
  return (
    '/* Gerado por scripts/gerar-config.js a partir do .env — não edite à mão. */\n' +
    '(function () {\n' +
    "  'use strict';\n" +
    '  window.Naves = window.Naves || {};\n' +
    '  window.Naves.config = ' +
    JSON.stringify(config, null, 2).replace(/\n/g, '\n  ') +
    ';\n' +
    '})();\n'
  );
}

function principal() {
  if (!fs.existsSync(ARQUIVO_ENV)) {
    console.error('Falta o .env. Copie o .env.exemplo e preencha os valores.');
    process.exit(1);
  }
  var env = lerEnv(ARQUIVO_ENV);
  if (!env.CONTATO_EMAIL) {
    console.error('CONTATO_EMAIL não definido no .env.');
    process.exit(1);
  }
  fs.writeFileSync(ARQUIVO_SAIDA, montarConfig(env), 'utf8');
  console.log('assets/js/config.js gerado.');
}

principal();
