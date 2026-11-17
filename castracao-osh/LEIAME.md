# Animação didática: OSH eletiva em gata

Especificação completa em `briefing-animacao-osh.pdf`. Fotos de referência em `referencias/` (extraídas do PDF).

## Versão 3D (principal), no nível da animação da Katita
- `3d/dist/osh-3d.html`: **um arquivo só, abre sem internet** (three.js, modelo e texturas embutidos).
  Gerado por `python3 3d/tools/build_page.py` (não fica no git; rode o comando para recriar).
- Navegação: botões Anterior / Próximo, setas ← →, clique ou toque no palco (avança), espaço (pausa),
  F (tela cheia), "Reproduzir tudo" (modo contínuo, ~116 s).
- `3d/src/`: o código, em módulos, juntados pelo `build_page.py` na ordem dos nomes:
  - `00-base.js`: renderizador, luzes, reflexos, mesa de inox, utilidades.
  - `10-gata.js`: o modelo da gata, as poses (em pé, decúbito dorsal, esternal) e o "molde" usado para medir a pele.
  - `15-instrumentos.js`: bisturi, gancho de Snook, pinças hemostáticas, tesoura de Metzenbaum, porta-agulhas, pinça de Backhaus.
  - `20-campo.js`: tricotomia, antissepsia em espiral, incisão e camadas da parede, cavidade, campo fenestrado, sonda endotraqueal.
  - `30-orgaos.js`: rins, aorta e cava, ovários, útero em Y, ligamentos suspensor e largo, pedículos, bexiga, alças intestinais.
  - `40-roteiro.js`: as 11 cenas (tempos, câmera, movimentos, rótulos).
  - `50-ui.js`: navegação, legendas, rótulos com linha-guia, lupa da hemostasia.
- `3d/tools/textura_colorpoint.py`: repinta a textura do modelo como a paciente (colorpoint, olhos azuis) → `3d/build/*.png`.
- `3d/modelo/`: o modelo original e o crédito (CC BY 4.0, exige atribuição; o crédito aparece na abertura e no fim).
- `3d/img/caso-real.jpg`: recorte da foto 3, que entra no fim como "caso real".

## Versão 2D (plano B)
- `index.html`: SVG do passo 1 (gata em decúbito dorsal + recorte anatômico), sem animação.
