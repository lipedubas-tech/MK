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

## Novo visual com a Hallmark (25/11, pedido do Felipe)

Restyle com a skill de design [Hallmark](https://github.com/Nutlope/hallmark), no tema **Almanac**. O layout de artigo, as três abas, a animação, o modo apresentação e todo o texto científico continuam iguais.

- **Mudou o sistema visual:** papel ardósia, títulos em Hanken Grotesk, texto em Newsreader e números das abas e etapas em IBM Plex Mono. O magenta fica só para o botão Pausar, a aba atual e a etapa atual. Os cantos são retos e os fios têm dois pesos. O palco 3D continua escuro.
- **Pequenos ajustes de texto:**
  - "Relato de caso · Ortopedia veterinária" virou o começo da linha de autoria, e os "·" dessa linha viraram vírgulas e uma quebra de linha;
  - as setas dos links viraram "Voltar:" e "Próxima:";
  - os botões ‹ › viraram "Anterior" e "Próxima".
- **Ficou de propósito:** o travessão das legendas ("Figura 1 – …"), que é da ABNT, mesmo o verificador apontando. Os "·" das miniaturas da galeria também ficaram, porque são gerados pelo `app.js`, que não foi alterado.
- **Verificador da Hallmark:** de 45 para 4 falhas. Das 4, 1 é o travessão da ABNT; as outras 3 são alarmes falsos do código 3D: a textura listrada de um instrumento e as miniaturas que o script preenche.
- Os dois arquivos de `dist/` foram refeitos com `tools/build_page.py`, usando o Three.js r128.

## Etapa 8: controle de 30 dias (26/11, pedido do Felipe)

A animação agora termina no acompanhamento depois da cirurgia, com o registro de 26/11/2026.

- **Etapa 8, "Controle de 30 dias":** câmera lateral (como a radiografia de controle) e **raio-X ligado sozinho**,
  com os rótulos "Placas e parafusos", "Pinos" e "Banda de tensão". O raio-X desliga ao sair da etapa, a não ser que a
  pessoa tenha mexido no botão durante ela. O texto conta, em quatro frases: o retorno em 26/11, o que aparece no
  raio-X, que ela ainda não apoia a pata e que o ortopedista recomendou fisioterapia, e que o resultado deve vir
  depois do fim do estágio.
- **Figuras novas:** Figura 9 (radiografias de controle, A e B) e Figura 10 (a Katita na baia, 26/11). Os recortes estão
  em `img/rx_30d_lat.jpg`, `img/rx_30d_membros.jpg` e `img/foto_katita_30d.jpg`, sem o nome da paciente e do tutor.
  Os originais ficam em `estagio/fotos/dia-26-11/`.
- **Texto do relato:** Resumo, Quadro 1 (linha "Evolução"), título da seção 2, um parágrafo novo na Discussão e uma
  frase na Nota sobre o modelo (a etapa 8 mostra os implantes como ficaram no fim da cirurgia; a consolidação não foi
  modelada).
- **Código:** o fim da linha do tempo deixou de ser fixo em 7 etapas e passou a seguir o número de etapas (`N`).
- **A confirmar com o Thiago antes da defesa:** a leitura das radiografias de controle (consolidação, implantes) e o
  plano de fisioterapia. A página só descreve o que aparece nas imagens e o que o Felipe relatou.
