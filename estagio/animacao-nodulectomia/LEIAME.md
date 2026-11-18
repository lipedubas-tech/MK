# Nodulectomia em cão: animação 3D

Animação didática em 11 cenas para a defesa do estágio, feita a partir do briefing
(`briefing-animacao-nodulectomia.pdf`) e do modelo 3D de cão (`modelo-3d/cao.glb`).

- `index.html`: arquivo único que abre sem internet (Three.js embutido). É a versão para a apresentação.
- `dist/nodulectomia.html`: mesma página, carregando o Three.js da internet (para publicar).
- `esboco-2d.html`: o primeiro esboço em SVG (Passo 1 do briefing), antes da troca para 3D.

## Como usar
Setas ← → (ou os botões) trocam de cena e cada cena toca ao entrar; espaço pausa;
**Reproduzir tudo** passa pelas 11 cenas sem parar (cerca de 1 min 50 s); **F** põe em tela cheia.
No celular: deslize para o lado para trocar de cena, toque para pausar.

## Correção do caso (18/11)
No dia da cirurgia o nódulo **já tinha rompido a pele** (aberto para fora, ulcerado) e **estava infeccionado**;
não estava mais sob a pele, como dizia o briefing. A animação mostra isso: metade da massa fica para fora da
pele, com crostas e exsudato discretos e a pele inflamada em volta; a base entra no subcutâneo. Como a lesão
é contaminada, a antissepsia vai da periferia para a lesão, e a dissecção passa pelo tecido sadio, sem cortar o nódulo.

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
- `bandeja.js`: mesa de instrumentais, peça na gaze e frasco de formol com etiqueta.
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
- A animação fala só em "nódulo": o tipo depende do laudo histopatológico.
