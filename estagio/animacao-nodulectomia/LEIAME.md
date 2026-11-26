# Nodulectomia em cão: animação 3D

Animação didática em 10 cenas para a defesa do estágio, feita a partir do briefing
(`briefing-animacao-nodulectomia.pdf`) e do modelo 3D de cão (`modelo-3d/cao.glb`).

- `index.html`: arquivo único que abre sem internet (Three.js embutido). É a versão para a apresentação.
- `dist/nodulectomia.html`: mesma página, carregando o Three.js da internet (para publicar).
- `esboco-2d.html`: o primeiro esboço em SVG (Passo 1 do briefing), antes da troca para 3D.

## Como usar
Setas ← → (ou os botões) trocam de cena e cada cena toca ao entrar; espaço pausa;
**Reproduzir tudo** passa pelas 10 cenas sem parar (cerca de 1 min 47 s); **F** põe em tela cheia.
No celular: deslize para o lado para trocar de cena, toque para pausar.

## Correção do caso (18/11)
No dia da cirurgia o nódulo **já tinha rompido a pele** (aberto para fora, ulcerado) e **estava infeccionado**;
não estava mais sob a pele, como dizia o briefing. A animação mostra isso: metade da massa fica para fora da
pele, com crostas e exsudato discretos e a pele inflamada em volta; a base entra no subcutâneo. Como a lesão
é contaminada, a dissecção passa pelo tecido sadio, sem cortar o nódulo.

## Correção do caso (24/11): antissepsia da lesão para fora
O Felipe corrigiu que, nesta nodulectomia, a antissepsia foi feita **da lesão para fora** (em espiral, do
centro para a periferia). A versão de 18/11 mostrava o contrário (da periferia para a lesão). Mudaram a espiral
pintada na pele e o caminho da gaze (`src/app.js`) e o rótulo da cena 2, que agora diz "antissepsia da lesão
para fora" (`src/fim.js`).

## Correção do caso (19/11): sem formol
O Felipe corrigiu que **a peça não foi para o formol**: essa parte não aconteceu. Saíram a cena 10 do briefing
("Histopatológico": peça no frasco de formol 10% e seta para o laboratório) e o frasco que ficava na mesa de
instrumentais, que agora bate com a foto 3 (peça na gaze, instrumental e envelope de fio 3-0). A animação passou
de 11 para 10 cenas, e os textos que davam o exame como feito ficaram neutros: o subtítulo da abertura diz
"da marcação ao pós-operatório", e a legenda do pós-operatório diz "Recuperação: analgesia, curativo e retorno"
(sem "com o laudo").

## Correção do caso (20/11): a cauterização foi o principal
O Felipe contou que **a cauterização foi a principal forma de hemostasia** nesta cirurgia. A cena 8 (Hemostasia)
passou de 8 para 12 s e agora começa por ela: o cauterizador, com a ponta em brasa, toca seis pontos que sangram
(quatro no leito e dois na parede da ferida). Cada toque solta um fio de fumaça e deixa uma escara, o tecido
coagulado, escuro no centro e esbranquiçado em volta. Depois vêm a compressão com gaze da foto 2 e a conferência
do leito. A legenda virou "Hemostasia por cauterização e conferência do leito", e há dois rótulos novos:
"Cauterização: o calor coagula os vasinhos que sangram" e "Pontos cauterizados: tecido coagulado, o vaso fica
fechado". As escaras acompanham o leito e as paredes quando a ferida fecha na sutura. Continua sem sangue.

## Melhorias de 19/11
Revisão quadro a quadro das cenas, com estas correções (a numeração abaixo já é a de 10 cenas):
- **Nome da cena legível em todas as cenas.** Da cena 3 em diante o nome saía em branco sobre o fundo claro e
  quase sumia; agora fica numa pílula escura, como a legenda.
- **A legenda cobre menos o campo.** Ficou um pouco menor e cabe em uma linha, e a imagem 3D sobe 6% da altura
  (`DESLOC_Y` em `src/fim.js`), então a ponta do fuso, a sutura e a pata com o acesso não ficam mais embaixo dela.
- **Hemostasia (cena 8):** a gaze era um quadrado branco liso que sumia contra o leito. Virou uma compressa
  dobrada, com espessura, trama e a dobra de cima, que desce, comprime (achata e pulsa) e sai. Rótulo novo:
  "Compressão com gaze: pressão direta, sem esfregar o leito". Continua sem sangue, como pede o briefing.
- **Pós-operatório (cena 10):** o tubo saía de uma vez; agora a extubação é animada (o tubo desliza para fora com
  o oxímetro e a língua recolhe). Rótulos novos: "Ferida suturada", "Acesso venoso" e "Extubação: quando volta o
  reflexo de deglutição", conforme as fotos 4 a 6.

Conferido no Chromium (1280 × 784, celular em retrato e em paisagem), sem erros no console.

## Como o modelo foi adaptado (`tools/cao.py`)
O modelo original é um labrador amarelo em pé, sem esqueleto. O script:
- pinta a pelagem de preto e deixa o focinho grisalho (salpicado), como a paciente das fotos;
- deita a cadela em decúbito lateral direito: os membros giram e caem em direção à mesa, o pescoço e a
  cauda descem (guardado como *morph*, então a cena 2 mostra ela deitando);
- levanta a base do nódulo na parede torácica esquerda, caudal ao cotovelo, perto da axila
  (a massa ulcerada, aberta para fora, é uma malha à parte, em `src/app.js`);
- calcula o relevo do pano de campo sobre o corpo deitado.

## Partes do código (`src/`)
- `app.js`: cadela, mesa, toalha, tricotomia, antissepsia, panos e pinças de Backhaus, tubo, oxímetro, acesso venoso.
- `campo.js`: bloco de tecido em camadas (pele, subcutâneo, fáscia, músculo), nódulo encapsulado, vasos,
  corte esquemático, incisão, dissecção, ligadura, retirada em bloco, hemostasia e suturas.
- `bandeja.js`: mesa de instrumentais e a peça na gaze (sem frasco de formol: ver a correção de 19/11).
- `fim.js`: câmera da sala, rótulos, botões, teclado, toque e o laço de desenho.

## Refazer
```
python3 tools/cao.py                                  # só se mexer no modelo ou na pose
THREE_JS=caminho/three.min.js python3 tools/build_page.py   # Three.js r128
```
Para conferir um quadro: abra `index.html?t=45` (abre parado aos 45 s).

## A confirmar com a Cláudia
- Padrões de sutura usados no caso (a animação mostra subcutâneo contínuo com fio absorvível e pele em
  sutura contínua simples com náilon 3-0, como na foto 8).
- Antisséptico usado (a animação mostra um tom âmbar genérico) e se a úlcera foi coberta ou isolada antes da incisão.
- Lado operado (o modelo mostra o lado esquerdo, com a cadela em decúbito lateral direito).
- Se houve antibiótico no pós-operatório e se foi feita cultura da secreção.
- A animação fala só em "nódulo": o tipo só se confirma com exame histopatológico.
- Se a peça foi para algum exame (sem formol, a animação não mostra mais o envio ao laboratório) e se haverá laudo.
- Que cauterizador foi usado na nodulectomia de 17/11 (a clínica tem um de ferro quente, o mesmo da pálpebra em
  05/11) e em que momentos: a animação mostra uma caneta genérica com ponta de fio em brasa, só na hemostasia.
- Se os vasos do nódulo foram ligados com fio (cena 6) ou também cauterizados, e se houve cauterização durante a
  dissecção.
- Se houve curativo: a legenda do pós-operatório (do briefing) cita "curativo", mas as fotos 4 a 6 mostram a ferida
  descoberta, e a animação também.
