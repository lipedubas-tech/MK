# Handoff Spec: animação 3D "Miíase em coelho"

> Especificação para construir a animação a partir do briefing (`briefing-animacao-miiase-coelho.pdf`).
> Segue a mesma base da animação da nodulectomia (`estagio/animacao-nodulectomia/`), para as animações
> da defesa terem a mesma cara e os mesmos controles.

## Overview

Página única, em 3D (Three.js r128), que conta em 11 cenas (cerca de 104 s) como a miíase aconteceu
no coelho atendido em 25/11/2026 e como foi o atendimento. Quem usa é o Felipe, na defesa, com o
projetor e o teclado ou o clicador. Ele fala por cima e avança no ritmo dele; a banca lê a legenda.

**A ideia central (Felipe, 25/11): "O pelo escondia. A tricotomia mostrou."** Da cena 1 à 5, o coelho
parece normal e fofo por fora. Nas cenas 2 a 4, uma lente mostra o que acontece por baixo do pelo. Na
cena 6, a tosa revela as feridas. Tudo no código existe para essa revelação funcionar.

## Layout

- **Palco 16:9** no centro, o maior possível; a **barra de controles** fica embaixo (64 px; 56 px abaixo
  de 760 px de largura). Em tela cheia, a barra flutua sobre o palco e some com o mouse parado (2,6 s).
- Tudo dentro do palco é medido em `cqw` (porcentagem da largura do palco), então a página escala
  igual no projetor e no celular.
- A imagem 3D sobe 6% da altura do palco (`DESLOC_Y`), para o assunto não ficar embaixo da legenda.
- Camadas do palco, de baixo para cima: canvas 3D, véu (corte entre ambientes), lente (SVG), título de
  abertura, aviso, rótulos com linha de chamada, topo (número e nome da cena), legenda, créditos.

## Design Tokens Used

| Token | Valor | Uso |
|---|---|---|
| `--fundo` | #0b1015 | fundo da página fora do palco |
| `--barra` | #121a22 | barra de controles |
| `--tinta` | #f3f6f8 | texto claro |
| `--tinta2` | #a9b7c4 | texto secundário (dica no celular) |
| `--acento` | #f2b84b | número da cena, progresso, botões ligados, contorno de foco |
| `--acento-tinta` | #1b2836 | texto sobre o acento |
| `--pilula` | rgba(16,25,34,.88) | fundo da legenda, do nome da cena e dos rótulos |
| `--lente` | #f2b84b a 85% | anel da lente de transparência |
| `--aviso` | #e8a23a | faixa do aviso de imagens fortes |
| `--sans` | IBM Plex Sans 400–700, cai para system-ui | todo o texto |
| `legenda` | 600 2,35cqw/1,25 | legenda (até 2 linhas, 88cqw no máximo) |
| `rotulo` | 600 1,5cqw/1,15 (sub: 500 1,12cqw) | rótulos com linha de chamada |
| `titulo` | 700 5,4cqw/1,02 | título da abertura |

**Cores do mundo 3D** (do briefing e das fotos):

| Token | Valor | Uso |
|---|---|---|
| `pelo-escuro` | #3b3531 | dorso, garupa, flancos |
| `pelo-claro` | #9b958f | áreas cinza-claras |
| `pelo-branco` | #ece8e2 | cara, peito, frente do corpo (foto 8) |
| `pele-depilada` | #b9b0aa | pele com pelo curto depois da tosa |
| `ferida` | #b5545c | pele avermelhada e inchada |
| `crosta` | #c9a85a | crostas amareladas |
| `larva` | #efe6cf | larvas |
| `prata` | #b8bcc2 | spray prata |
| `rifamicina` | #e07a1f | rifamicina e mancha no pano |
| `granito` | #8c847b com pintas #2a2724 e #c2b29a | mesa |
| `pano` | #f4f1ea | pano branco |
| `manta` | #8f9a86 | manta do internamento |
| `cateter` | #8b4fc4 | canhão do cateter |

## Components

| Componente | Variante | Props / estado | Notas |
|---|---|---|---|
| `#palco` | — | `role="img"`, `aria-label` muda por cena | contém o canvas e as camadas |
| `#topo` | número + nome | `n/11`, nome da cena | número na pílula âmbar, nome na pílula escura |
| `#legenda` | — | texto da cena | `aria-live="polite"`; some na abertura até o título sair |
| `#abertura` | — | rótulo, título, subtítulo | aparece de 0,2 a 4,2 s da cena 1 |
| `#aviso` | normal / suave | texto do aviso | cena 1, de 3,4 a 6 s; diz a tecla S |
| `#lente` | aberta / fechada | centro e raio em pixels | anel âmbar em SVG, desenhado sobre a projeção do centro da lente |
| `.r` (rótulo) | normal / `.ok` | texto, subtítulo, ponto 3D | linha de chamada com halo branco |
| `#creditos` | — | crédito do modelo | fixo no canto inferior direito, 1cqw, 60% de opacidade |
| `#barra` botões | Anterior, Tocar/Pausar, Próxima, Reproduzir tudo, Modo suave, Tela cheia | `aria-pressed` nos que ligam e desligam | alvo mínimo de 44 × 44 px |
| `#trilha` | 11 segmentos | progresso de cada cena | clique vai para a cena |

## States and Interactions

| Elemento | Estado | Comportamento |
|---|---|---|
| Página | carregando | "Carregando o modelo 3D…" no centro do palco até o modelo e as texturas estarem prontos |
| Página | sem WebGL | mensagem no palco: "Este navegador não mostra 3D. Use o Chrome ou o vídeo do plano B." |
| Cena | ao entrar | toca do começo e para no fim (não passa sozinha para a próxima) |
| Reproduzir tudo | ligado | passa por todas as cenas sem parar; no fim, desliga e para |
| Modo suave | ligado | larvas viram pontos claros e pequenos; os closes das cenas 3, 7 e 8 ficam 35% mais longe; a cor da ferida fica menos saturada |
| Botões | hover / foco | fundo mais claro / contorno âmbar de 2 px |
| Botão ligado | `aria-pressed="true"` | fundo âmbar, texto escuro |
| Toque no palco | toque curto | tocar ou pausar |
| Toque no palco | arrastar para o lado | cena anterior ou próxima |
| `prefers-reduced-motion` | ligado | não começa sozinho; sem transições de opacidade |
| `?t=12.5` na URL | — | abre parada nesse instante (para conferir quadros) |

## Responsive Behavior

| Largura | Mudanças |
|---|---|
| Projetor e desktop (>1024 px) | palco máximo; barra com os rótulos dos botões |
| Tablet (760–1024 px) | igual, com o palco menor |
| Celular (<760 px) | barra com 56 px e só os ícones; 8 camadas de pelo em vez de 16; sombras desligadas |
| Celular em retrato | dica embaixo: "Gire o celular para ver maior. Deslize para trocar de cena." |

## Edge Cases

- **Carregamento lento:** o GLB e as texturas vão embutidos em base64; não há rede. O aviso de carregamento fica até tudo estar pronto.
- **Sem internet:** `index.html` traz o Three.js embutido; só a fonte cai para a do sistema.
- **localStorage bloqueado:** o modo suave começa desligado e funciona mesmo sem guardar a escolha (leitura e escrita em try/catch).
- **Tela muito larga ou muito alta:** o palco mantém 16:9 e centraliza.
- **GPU fraca:** a qualidade cai sozinha (menos camadas de pelo) se a média de quadros ficar abaixo de 30 por segundo por 2 s.

## Animation / Motion

Tudo é função do tempo global `t`: dá para pular para qualquer instante e o estado sai igual.
Transições de câmera com ease in-out cúbico; entradas de objetos com ease out cúbico; cortes entre
ambientes com véu escuro de 0,32 s.

| # | Cena | Duração | O que se move | Easing / notas |
|---|---|---|---|---|
| 1 | Abertura e aviso | 6 s | coelho respirando (0,9 Hz), orelhas; câmera se aproxima; título 0,2–4,2 s; aviso 3,4–6 s | respiração senoidal |
| 2 | Como começa | 9 s | câmera vai à garupa; a lente abre (raio 0→1 em 1,2 s); mosca entra, pousa, põe ovos (1 grupo a cada 0,4 s) | lente com ease out |
| 3 | As larvas | 10 s | ovos somem e as larvas crescem; feridas abrem (0→1 em 5 s); a lente passeia pelo dorso, garupa e região perineal; fecha no fim; câmera se afasta | larvas ondulam (2 Hz) |
| 4 | Antes da clínica | 8 s | lata de spray entra, nuvem prateada; película aparece no pelo e em parte das feridas; a lente mostra as feridas sem produto | spray: partículas, 1,5 s |
| 5 | Chegada e contenção | 8 s | corte para a mesa de granito; mãos (contorno) seguram; rótulo "muito desidratado" | corte com véu |
| 6 | Tricotomia: a revelação | 12 s | câmera parada 1 s; máquina passa em 5 faixas (1,6 s cada); o pelo some na faixa e cai em mechas; feridas e larvas aparecem; câmera se afasta | máscara de tosa avança junto com a lâmina |
| 7 | Álcool e retirada | 12 s | borrifos de álcool; larvas se agitam (4 Hz) e sobem; pinça tira uma por vez (0,7 s cada) para a gaze | — |
| 8 | Com a luva | 8 s | dedo de luva azul tira as larvas restantes do alto | — |
| 9 | Acesso na orelha e soro | 12 s | close na orelha; rótulos (veia marginal, artéria central); cateter entra (2 s), mandril sai, esparadrapo, equipo; gotas a cada 0,8 s | — |
| 10 | Rifamicina | 9 s | coelho vira de barriga para cima (1,5 s); spray laranja cobre as feridas; mancha cresce no pano | — |
| 11 | Internamento | 10 s | corte para a baia; cabeça no pote, mastigando (3 Hz); equipo na orelha; escurece no fim | — |

## Accessibility Notes

- **Ordem do foco:** Anterior → Tocar/Pausar → Próxima → 11 segmentos da trilha → Reproduzir tudo → Modo suave → Tela cheia.
- **Teclado:** ← → (e PageUp/PageDown do clicador) trocam de cena; espaço toca ou pausa; F tela cheia; S modo suave; Home e End vão para a primeira e a última cena.
- **Leitor de tela:** a legenda é `aria-live="polite"`; o `aria-label` do palco descreve a cena atual; cada segmento da trilha tem "Cena n: nome".
- **Contraste:** texto branco sobre pílula #101922 a 88% (acima de 12:1); acento âmbar com texto #1b2836 (acima de 9:1).
- **Imagens fortes:** aviso na cena 1 e modo suave a um toque. O Felipe avisa a banca antes de tocar.
- **Créditos:** "Modelo 3D: Rabbit Rigged, de FourthGreen (Sketchfab), CC BY 4.0, modificado."
