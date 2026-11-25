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

## Próximo passo

Passo 1 do briefing: repintar o coelho com as cores do paciente, fazer o pelo longo e volumoso, deitá-lo no pano
sobre o granito e marcar as feridas, visíveis só pela lente de transparência. Depois, **mostrar capturas ao Felipe
antes de animar**. O código da animação é mudança estrutural (regras do `CLAUDE.md`), então vai em
pull request em rascunho, esperando a aprovação dele.

**A confirmar com o Felipe:** com o que a Cláudia tirava as larvas depois do álcool (pinça ou mão) e o que quer
dizer "as que ficavam mais acima" (mais na superfície ou mais no alto do corpo).
