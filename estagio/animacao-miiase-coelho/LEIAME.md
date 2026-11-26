# Miíase em coelho: animação 3D (projeto)

Projeto da animação do coelho com miíase atendido em 25/11/2026, perto das 18h. Por enquanto só tem o
**briefing**; a animação ainda não começou. O Felipe pediu um questionário antes de animar, e as respostas
estão no briefing e abaixo.

- `briefing-animacao-miiase-coelho.pdf`: objetivo, entregável, estilo, roteiro de 11 cenas (cerca de 104 s),
  ordem de trabalho, cuidados, prompt para o Claude Code e as 8 fotos de referência.
- `modelo-3d/rabbit_rigged.glb`: o modelo enviado pelo Felipe. É o "Rabbit Rigged", de FourthGreen (Sketchfab),
  com licença **CC BY 4.0**, então o crédito precisa aparecer na animação. Tem 1.597 vértices, uma textura de
  256 px (coelho laranja de pelo curto), 48 ossos (coluna, cauda, patas, pescoço, cabeça, nariz e 3 ossos em cada
  orelha) e um clipe de salto de 0,43 s.
- `modelo-3d/previa-modelo-original.png`: o modelo como veio, de lado, de frente e de três quartos.
- `referencias/`: as fotos do atendimento, de `fotos/dia-25-11/` (03 e 07 a 10). As fotos 2, 3 e 4 são os
  **originais em alta resolução** das fotos 04, 05 e 06, que o Felipe reenviou em 25/11 (reduzidos para 2400 px).

## Respostas do questionário (Felipe, 25/11)

| Pergunta | Resposta |
|---|---|
| O que mostrar | O atendimento completo **mais a causa** (a mosca, os ovos e as larvas) |
| Aparência | **Igual ao paciente**: pelo longo, cinza-escuro acastanhado e branco |
| Ordem do soro | **Depois** da tricotomia e da limpeza. As fotos mostram o equipo já ligado às 18h35, então a rifamicina (18h38) vem depois do soro |
| Larvas e feridas | **Mais realistas**: larvas com segmentos e movimento. A animação terá um modo suave (tecla S) para a banca |
| Retirada das larvas | Antes da clínica, a tutora foi a uma agropecuária e passaram um **spray prata**, que não alcançou várias feridas com larvas. Na clínica, a **Cláudia passava álcool e ia tirando** a maioria; as que ficavam **mais acima**, o Felipe tirou **com luva, com o dedo** |
| Sedação | Não. Só contenção física |
| Onde estavam as feridas | Dorso, garupa e base da cauda, e região genital e perineal |
| Tricotomia | Com máquina |

## A ideia central (Felipe, 25/11): o pelo escondia

Por fora, o coelho parecia normal e fofo; as feridas e as larvas estavam por baixo do pelo longo e denso. O pelo
provavelmente escondeu as feridas da tutora e segurou umidade e sujeira perto da pele, o que atrai a mosca
**[interpretação do Felipe, a confirmar com a Cláudia]**. Só a tricotomia mostrou o tamanho real das lesões. Por isso:

- da cena 1 à 5, o coelho tem o pelo longo e volumoso do paciente e parece normal por fora;
- nas cenas 2 a 4, uma lente de transparência mostra as feridas e as larvas por baixo do pelo, sem nada mudar por fora;
- na cena 6, a tricotomia é a revelação, com a legenda "O pelo escondia. A tricotomia mostrou.";
- o trecho sugerido para a defesa passou a ser as cenas 3 e 6 (cerca de 22 s).

**Fora desta versão:** a foto de 26/11 ("como ele vai estar") não entra na animação de agora, a pedido do Felipe.

## Animação em andamento (26/11, PR em rascunho)

Começou a construção, seguindo o `handoff.md` (a especificação técnica: layout, cores, componentes,
estados, movimento por cena e acessibilidade). A base é a mesma da animação da nodulectomia.

- `src/`: o código, em partes, na ordem em que roda: `base.js` (roteiro das 11 cenas, renderizador, câmera,
  rótulos), `coelho.js` (o modelo, o pelo em camadas, feridas, tosa, lente, larvas e ovos, poses),
  `cenario.js` (estúdio, mesa de granito com o pano, baia), `objetos.js` (mosca, lata de spray prata e a nuvem,
  mancha de rifamicina no pano), `cenas.js` (o estado de cada instante, a câmera e os rótulos) e
  `fim.js` (controles e laço); `page.html` é a casca da página.
- `vendor/GLTFLoader-r128.js`: o carregador de modelos do three.js r128 (licença MIT).
- `tools/build_page.py`: monta `index.html` (abre sem internet) e `dist/miiase-coelho.html` (para publicar):
  `THREE_JS=castracao-osh/3d/vendor/three-r128.min.js python3 estagio/animacao-miiase-coelho/tools/build_page.py`
- `tools/briefing.py`: refaz o PDF do briefing.

**Passo 1 aprovado pelo Felipe (26/11).** As capturas estão em `capturas/`:

| Captura | O que mostra |
|---|---|
| `passo1-1.png` | Cena 1: o coelho deitado em decúbito esternal, patas recolhidas, orelhas deitadas para trás, respirando. Por fora, normal e fofo |
| `passo1-2.png` | Cenas 2 a 4: a lente de transparência na garupa. Dentro do anel o pelo some e aparecem as feridas; fora dele, nada muda |
| `passo1-3.png` | Cena 5: deitado no pano branco, sobre a mesa de granito |
| `passo1-4.png` | Cena 6 em diante: depois da tricotomia, na mesa (dorso, garupa e base da cauda) |
| `passo1-5.png` | Depois da tricotomia, de trás: garupa, base da cauda e região perineal |

O que mudou no passo 1:
- **Pose:** antes o coelho ficava sentado, de orelhas em pé; agora fica deitado, com a barriga no pano, e respira.
- **Lente:** antes não abria (o anel aparecia, mas o pelo continuava); agora é um círculo na tela, preso a um
  ponto do corpo, que acompanha a câmera.
- **Feridas:** antes eram manchas rosadas redondas e granuladas; agora seguem as fotos 2 e 3: pele inchada e
  enrugada, placas de crosta amarelada com fendas escuras, carne viva com buracos no centro e borda úmida.
- **Pele tosada:** cinza-rosada com o restolho do pelo, e a borda do pelo cortado em rampa (antes formava "dentes de pente").
- **Mesa:** granito mais escuro, com grãos irregulares; o pano não estoura mais de branco.
- **Correção:** rótulos e lente usavam a câmera do quadro anterior; agora usam a do quadro atual.

### Passo 2 (26/11): as cenas 1 a 4 prontas, e as 5 a 11 em rascunho

Agora a animação anda do começo ao fim (cerca de 104 s): cada cena calcula o seu estado a partir do tempo, então dá
para pular para qualquer instante.

- **1. Abertura:** a câmera se aproxima do coelho, que respira e mexe as orelhas; o título fica à esquerda.
- **2. Como começa:** a câmera vai para a garupa e a lente abre: junto da pele, umidade e sujeira (rótulo). A mosca
  chega voando, pousa na ponta do pelo, desce até a pele, põe 5 grupos de ovos (um a cada 0,4 s; rótulo "ovos") e vai embora.
- **3. As larvas:** os ovos eclodem, as feridas abrem e as larvas crescem nelas, com a cabeça na pele e a ponta de
  trás para fora (os dois espiráculos escuros; rótulo). A lente passeia pela garupa, pelo dorso e pela região
  perineal e fecha; a câmera se afasta e, por fora, o coelho continua igual.
- **4. Antes da clínica:** a lata entra, borrifa uma nuvem prateada e o pelo fica prateado (rótulo "spray prata").
  A lente abre de novo: parte das feridas ficou com a película e outras não (rótulo "ferida sem o produto"), e as
  larvas continuam se mexendo.
- **5 a 11 (rascunho, com uma etiqueta no canto):** a mesa e a baia, a câmera, as poses e as máscaras, ainda sem
  mãos e instrumentos: chegada (rótulo "muito desidratado"); tosa em faixas revelando as feridas e as larvas;
  álcool, larvas agitadas que sobem e saem uma a uma; as de cima, no dorso (cena 8); close na orelha direita;
  o coelho vira de barriga para cima, a rifamicina cobre as feridas e mancha o pano; a baia, de cabeça baixa no
  pote, e a tela escurece no fim.
- **Modo suave (tecla S):** funciona: larvas viram pontos claros e as feridas perdem a saturação.

| Captura | O que mostra |
|---|---|
| `passo2-1-abertura.png` | Cena 1, com o título |
| `passo2-2-mosca-e-ovos.png` | Cena 2: a mosca na pele, pondo os ovos, vista pela lente |
| `passo2-3-larvas.png` | Cena 3: as larvas na ferida da garupa |
| `passo2-4-perineo.png` | Cena 3: a lente na região perineal |
| `passo2-5-spray.png` | Cena 4: o spray prata |
| `passo2-6-sem-produto.png` | Cena 4: pela lente, a ferida que o spray não alcançou |
| `passo2-7-tosa-rascunho.png` | Cena 6 (rascunho): depois da tosa |
| `passo2-8-baia-rascunho.png` | Cena 11 (rascunho): na baia |

**Falta (passo 3, acabamento):** as mãos em contorno (contenção, álcool, retirada para a gaze), a máquina de tosa e
as mechas caindo, o dedo de luva, o cateter, o esparadrapo, o equipo e as gotas, os rótulos da orelha (veia
marginal e artéria central), o frasco de rifamicina, a cabeça dentro do pote e o equipo na baia; depois, a
conferência no celular.

Para conferir sem Python (este computador não tem): `tools/build_page.py` pode ser trocado por uma cópia em Node
que gera os mesmos arquivos; as capturas saem do Chrome sem janela, com `index.html?captura` (sem laço; cada
quadro é desenhado por `window.__vai(t)`).

Para conferir um instante: abra `index.html?t=12.5&limpo` (parado em 12,5 s, sem título nem legendas).
Parâmetros de teste: `&cam=x,y,z,ax,ay,az` (câmera), `&rot=Osso,x,y,z;...` (giro de ossos),
`&raiz=x,y,z` (posição do coelho), `&u=uFerida:1;uTosa:1,1,1` (máscaras), `&lente=garupa` (dorso, perineo, cauda),
`&amb=mesa` (estudio, mesa ou baia).

## Próximo passo

O Felipe vê o passo 2 e diz o que muda. Depois, o passo 3 (acabamento das cenas 5 a 11). O código da animação é
mudança estrutural (regras do `CLAUDE.md`), então cada passo vai em pull request em rascunho, esperando a aprovação dele.

**Resposta do Felipe (26/11):** a retirada das larvas foi **com a mão nos dois casos**: a Cláudia, depois do álcool,
e o Felipe, de luva. A cena 7 mostra mãos (só o contorno), sem pinça.

**Rosto (26/11):** o Felipe achou que parecia "mais um pokémon do que coelho". Corrigido: olhos menores e castanho-escuros
com pálpebra escura, pelo curto no rosto, focinho com nariz rosado, narinas e boca em Y, bigodes, e as orelhas
inclinadas para trás em vez de enterradas no pelo (captura `passo1-6.png`).
