# Cirurgia da Katita em 3D

Página publicada: https://claude.ai/artifact/HzsxC8rvK49Ss3tfd1b76K

A página está organizada como um relato de caso: resumo e palavras-chave, Quadro 1 (identificação),
Figura 1 (a animação 3D, com o texto de cada etapa ao lado), Figuras 2 a 8 (radiografias e fotos,
com fonte), discussão, nota sobre o modelo e referências no formato da ABNT.

- `dist/katita.html`: a página publicada (precisa de internet para carregar a biblioteca 3D e as fontes).
- `dist/katita-offline.html`: a mesma página num arquivo só, que abre sem internet. É o plano B para a defesa.
  Sem internet, as fontes caem nas do sistema.
- `original.html`: a versão anterior da página, guardada como cópia de segurança. O esqueleto de fundo (.glb) sai daqui.
- `src/`: o código da página (`page.html` e `app.js`). Os instrumentos cirúrgicos são modelados em `app.js`.
- `tools/`: os programas em Python que esculpem as peças 3D.
  - `bones.py` e `build_bones.py`: úmero, ulna e rádio, com a fratura em Y e o corte do olécrano.
  - `implants.py`: placas, parafusos, pinos e banda de tensão.
  - `soft.py`: pele e músculo, com a incisão.
  - `skel_clean.py`: ajustes de render do esqueleto de fundo, sem remodelar: normais suavizadas nas
    costuras, sombra de contato, textura sem manchas e emendas limpas no membro operado.
  - `build_page.py`: junta tudo nos dois arquivos de `dist/`.
- `build/`: as peças 3D já geradas.
- `img/`: radiografias e fotos reais, já recortadas sem nomes.

Para refazer a página depois de mexer em `src/`: `python3 tools/build_page.py`
(com `THREE_JS=caminho/three.min.js` para gerar também a versão offline).
Depois de mexer em `tools/skel_clean.py`: `python3 tools/skel_clean.py` antes do `build_page.py`.
