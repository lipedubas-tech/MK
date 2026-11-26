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
  `cenario.js` (estúdio, mesa de granito com o pano, baia), `cenas.js` (o estado de cada instante) e
  `fim.js` (controles e laço); `page.html` é a casca da página.
- `vendor/GLTFLoader-r128.js`: o carregador de modelos do three.js r128 (licença MIT).
- `tools/build_page.py`: monta `index.html` (abre sem internet) e `dist/miiase-coelho.html` (para publicar):
  `THREE_JS=castracao-osh/3d/vendor/three-r128.min.js python3 estagio/animacao-miiase-coelho/tools/build_page.py`
- `tools/briefing.py`: refaz o PDF do briefing.

**Passo 1 pronto e conferido na tela (26/11), esperando o Felipe aprovar.** As capturas estão em `capturas/`:

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

**Falta:** larvas e ovos visíveis; mosca, máquina de tosa, pinça, luva, cateter, soro e sprays; a câmera e o
tempo das 11 cenas; a baia; a conferência no celular.

Para conferir um instante: abra `index.html?t=12.5&limpo` (parado em 12,5 s, sem título nem legendas).
Parâmetros de teste: `&cam=x,y,z,ax,ay,az` (câmera), `&rot=Osso,x,y,z;...` (giro de ossos),
`&raiz=x,y,z` (posição do coelho), `&u=uFerida:1;uTosa:1,1,1` (máscaras), `&lente=garupa` (dorso, perineo, cauda),
`&amb=mesa` (estudio, mesa ou baia).

## Próximo passo

Com a aprovação do Felipe, o passo 2 do briefing: larvas e ovos nas feridas, a mosca e o tempo das cenas 1 a 4
(a lente abrindo e passeando). O código da animação é mudança estrutural (regras do `CLAUDE.md`), então cada
passo vai em pull request em rascunho, esperando a aprovação dele.

**Resposta do Felipe (26/11):** a retirada das larvas foi **com a mão nos dois casos**: a Cláudia, depois do álcool,
e o Felipe, de luva. A cena 7 mostra mãos (só o contorno), sem pinça.

**Rosto (26/11):** o Felipe achou que parecia "mais um pokémon do que coelho". Corrigido: olhos menores e castanho-escuros
com pálpebra escura, pelo curto no rosto, focinho com nariz rosado, narinas e boca em Y, bigodes, e as orelhas
inclinadas para trás em vez de enterradas no pelo (captura `passo1-6.png`).
