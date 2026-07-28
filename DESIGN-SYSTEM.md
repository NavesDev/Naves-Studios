# Naves Studios — Sistema de Design v0.2

Referência única de estilo da landing. Os tokens vivem em
[`assets/css/estilo.css`](assets/css/estilo.css) (bloco `:root`) — este documento
explica **quando** usar cada um; o CSS é a fonte da verdade dos valores.

Princípio: blocos de cor chapada, tipografia pesada, zero gradiente, e um rabisco
feito à mão como assinatura.

---

## Cores

| Token | Hex | Uso |
|---|---|---|
| `--azul` | `#2495E8` | Protagonista — heros, botões, destaques |
| `--azul-forte` | `#1B7DC7` | Hover e profundidade |
| `--claro` | `#BEE3FB` | Rabiscos e texto sobre azul |
| `--tinta` | `#1A2B3A` | Títulos e corpo de texto |
| `--fundo` | `#F5FAFE` | Respiro entre seções brancas |
| `--branco` | `#FFFFFF` | Fundo padrão, texto sobre azul |
| `--texto-suave` | `#5A7184` | Texto secundário, legendas |
| `--borda` | `#E3EEF7` | Contornos de cards e divisórias |

Regras:

- Sem gradientes. Um bloco = uma cor chapada.
- Texto sobre `--azul` é `#FFFFFF` (títulos) ou `--claro` (apoio). Nunca `--tinta`.
- `--fundo` alterna com branco para separar seções — não é cor de card.

## Tipografia

Família única: **Poppins** (`--fonte`), com `"Segoe UI", system-ui, sans-serif`
como reserva. Contraste vem do peso, não de trocar de fonte: 800 grita, 400 conversa.

| Papel | Token | Peso | Tamanho |
|---|---|---|---|
| Display | `--t-display` | 800 | `clamp(2.6rem, 6vw, 4.4rem)`, `letter-spacing:-.02em` |
| Título | `--t-titulo` | 800 | `clamp(1.7rem, 3.4vw, 2.5rem)`, `letter-spacing:-.015em` |
| Subtítulo | `--t-sub` | 600 | `1.15rem` |
| Corpo | `--t-corpo` | 400 | `1rem`, `line-height:1.65` |
| Eyebrow | `--t-legenda` | 700 | `0.8rem`, caixa alta, `letter-spacing:.22em`, cor `--azul` |

## Layout

- `--larg`: `1080px` — largura da coluna de conteúdo (`.wrap`).
- `.wrap-largo`: `1320px` — exceção para a vitrine de projetos, que precisa respirar.
- `--raio`: `8px` em tudo que tem canto. Cantos discretos, nunca pílula (exceto chips e tags).
- Seções: `88px` de respiro vertical.

## Movimento

Três velocidades e **uma** curva:

| Token | Valor | Uso |
|---|---|---|
| `--dur-micro` | `.18s` | Hover, foco, estados de botão |
| `--dur-media` | `.5s` | Troca de painel, reveal de card |
| `--dur-lenta` | `.9s` | Entrada de seção |
| `--curva` | `cubic-bezier(.22,1,.36,1)` | Todas as transições |

Padrões de animação em uso:

- **Rabisco que se desenha** — traço à mão animado por `stroke-dashoffset`.
- **Reveal ao rolar** — a seção entra subindo com fade (classe `.reveal-alvo`, ativada com `.visivel`).
- **Texto decolando** — palavras sobem de trás de uma máscara (`.decola`).
- **Vitrine sticky** — a tela do mockup fica presa enquanto os textos rolam ao lado.

Toda animação respeita `prefers-reduced-motion: reduce`: o conteúdo aparece no
estado final, sem transição. Nada de movimento que só existe por enfeite —
o cursor com rastro foi removido justamente por isso.

## Componentes

### Botões

Base `.btn`: caixa alta, peso 700, `letter-spacing:.06em`, `padding:15px 32px`,
raio `--raio`, e `translateY(-2px)` no hover. Foco visível obrigatório
(`outline:3px solid var(--claro)`).

| Variante | Fundo | Texto | Onde |
|---|---|---|---|
| `.btn-branco` | branco | `--azul` | Sobre blocos azuis |
| `.btn-azul` | `--azul` | branco | Ação principal em fundo claro |
| `.btn-contorno` | transparente, borda `--tinta` | `--tinta` | Ação secundária |
| `.btn-quadrado` | — | — | Ícone `+` de 44×44, sem caixa alta |

`.magnetico` adiciona a atração sutil ao cursor; é opcional e some com
`prefers-reduced-motion`.

### Cards

`.card`: fundo branco, borda `--borda`, raio `--raio`, `padding:34px 28px`,
elevação no hover (`translateY(-8px)` + sombra). Em um trio, o card do meio
recebe `.card-ativo` e vira bloco azul — hierarquia sem precisar de tamanho diferente.

### Ícones

SVG autorais, `viewBox="0 0 24 24"`, traço de 2px em `--azul`, pontas e junções
arredondadas. Assinatura da família: um **ponto-nave preenchido** (`fill:currentColor`)
em cada ícone. Biblioteca atual: foguete, código, agenda, conversa, crescimento,
segurança, órbita, cometa. Nunca usar ícone de pacote genérico.

### Rabiscos

Traços à mão que assinam a marca: foguete no hero, ondinha sob os títulos de seção
(`.rabisco`). Sempre `stroke` em `--azul` ou `--claro`, `stroke-width:3`, ponta
arredondada, `fill:none`.

## Logo

"N contínuo": traço único com um loop orbital na diagonal. Duas cores — hastes em
branco, diagonal em `--claro`. Arquivo: [`assets/logo.svg`](assets/logo.svg).
Anima se desenhando no preloader.

## Regras de implementação

- Português do Brasil em todo texto e em nomes de classe/variável.
- A página roda via `file://`, sem servidor. Por isso: **scripts clássicos**, nunca
  ES modules; namespace `window.Naves`; sem sintaxe recente que quebre em browser antigo.
- JS organizado por responsabilidade: `nucleo.js` (compartilhado), `animacoes.js`
  (uma classe por efeito), `main.js` (único que conhece o DOM concreto e liga as peças).
- Nada de imagem de banco: ilustrações são SVG próprio.
