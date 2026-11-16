# Cirurgia da Katita em 3D

Página publicada: https://claude.ai/artifact/HzsxC8rvK49Ss3tfd1b76K

- `dist/katita.html`: a página publicada (precisa de internet para carregar a biblioteca 3D).
- `dist/katita-offline.html`: a mesma página num arquivo só, que abre sem internet. É o plano B para a defesa.
- `original.html`: a versão anterior da página, guardada como cópia de segurança.
- `src/`: o código da página (`page.html` e `app.js`).
- `tools/`: os programas em Python que esculpem as peças 3D.
  - `bones.py` e `build_bones.py`: úmero, ulna e rádio, com a fratura em Y e o corte do olécrano.
  - `implants.py`: placas, parafusos, pinos e banda de tensão.
  - `soft.py`: pele e músculo, com a incisão.
  - `build_page.py`: junta tudo nos dois arquivos de `dist/`.
- `build/`: as peças 3D já geradas.
- `img/`: radiografias e fotos reais, já recortadas sem nomes.

Para refazer a página depois de mexer em `src/`: `python3 tools/build_page.py`.
