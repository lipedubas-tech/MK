# Melhorias da defesa — registro da tarefa agendada

A tarefa "Melhorar a defesa" roda a cada 2 horas, das 7h41 às 23h41 (9 vezes por dia). Cada execução acrescenta
uma entrada no fim deste arquivo (nunca apaga as anteriores).

## Decisões do Felipe (seguir sempre)

- **19/11 — Estrutura em duas partes.** Primeiro a clínica em geral, como na defesa da Yasmin (identificação, história, infraestrutura, serviços e atividades realizadas). Depois o diferencial: os casos específicos que interessaram ao Felipe. A parte geral deve ser enxuta (referência: seção 11 de `informacoes-do-estagio.md`); o tempo maior vai para os casos.
- **19/11 — Registro detalhado não é critério para virar caso.** Ter muitos dados de algo não significa que entra como caso específico. Exames de sangue (inclusive a série da Mel labradora) vão para "atividades realizadas / exames", não para casos.
- **19/11 — Transfusão de sangue entra em "atividades realizadas".** Atenção: a transfusão foi na **Mel Serafina (gata, 06/11)**; a **Mel labradora** é a do hemangiossarcoma e da série de hemogramas. Confirmar com o Felipe qual das duas ele quis dizer antes de montar o slide.
- **19/11 — Sem citações e sem animação do tártaro.** A defesa não precisa de referências bibliográficas, e a limpeza de tártaro não justifica uma animação (pode entrar como foto em atividades realizadas).
- **19/11 — Eixo: todos.** O Felipe quer todos os eixos (os 5 e a tese), com grande parte dos elementos do comparativo presentes. Não escolher um só: integrar cada eixo como uma **camada** com lugar definido, para não diluir em 25–30 min. Proposta de partida (o Felipe ainda pode ajustar):
  - **Tese (as pessoas que o amam):** o fio humano que atravessa a defesa inteira, uma frase ou uma pessoa por caso.
  - **3. Caráter por exposição e habituação:** a ordem dos casos segue a cronologia do estágio (dia 1 → 19/11), como arco pessoal; a parte pessoal ocupa uma frase por caso.
  - **1. Tornar visível o oculto** e **2. Dar voz ao paciente:** duas perguntas aplicadas dentro de cada caso: "o que estava escondido e como apareceu?" e "como o animal mostrou o que sentia?".
  - **4. Mortalidade e tempo:** abertura e fechamento com o par 17/11 → 19/11 e o dia 1.
  - **5. Mídia visual como argumento:** o método de toda a defesa (raio-X real, 3D, linha do tempo, corpo do estágio), com plano B offline.

## Fila de ideias (a próxima execução escolhe daqui ou propõe outra)

- [ ] **3º NA FILA — Parte 1, a clínica em geral:** esboço dos slides da parte geral, enxuto, com base na estrutura da Yasmin: capa, identificação, história, infraestrutura, serviços, atividades realizadas (procedimentos, exames, vacinas, transfusão). Usar as fotos que existem e listar as que faltam (o Felipe não tem fotos dos ambientes da clínica: balcão, consultório, internamento, espera, banho e tosa, canil, cirurgia, esterilização parcial). Em `estagio/defesa/parte1-clinica/`.

- [x] **FEITO 19/11 (teste):** linha do tempo do estágio inteiro com **todas as fotos e todas as ideias**, dia a dia (28/10 até hoje). Cada dia com as suas fotos (de `estagio/fotos/` e `estagio/imagens/`, com as legendas originais), os casos, as reflexões e as ideias da defesa que surgiram naquele dia (animações, eixos temáticos, artefatos publicados). Formato visual (página HTML em `estagio/defesa/linha-do-tempo/`, com as fotos referenciadas do repositório, sem copiar nem alterar os originais), com uma versão em PDF para o plano B offline. Atualizar a cada execução seguinte quando chegarem dias novos.

- [x] **FEITO 19/11 11h41 (`estagio/defesa/eixos/comparativo.md`) — 1º NA FILA: material para o Felipe escolher o eixo da defesa.** A escolha é dele; a tarefa **não decide** o eixo. Fazer uma página comparando os 5 eixos temáticos (seção 2 de `informacoes-do-estagio.md`: tornar visível o oculto; dar voz ao paciente que não fala; caráter formado por exposição e habituação; mortalidade e tempo condensados em dados clínicos; mídia visual como argumento) e a tese "o paciente é o animal, mas a clínica é construída com as pessoas que o amam". Para cada um: os casos e fotos que encaixam, as reflexões dele que sustentam, como seria a abertura e o fechamento, o que fica de fora, e o risco. Em `estagio/defesa/eixos/`.
  - **O Felipe gostou desta ligação (19/11), incluir no comparativo:** o par 17/11 → 19/11. Os 3 fetos que já estavam mortos (mumificados) na castração da gata, sem nada a fazer, e os 3 filhotes que sobreviveram ao cachorro e chegaram vivos para serem salvos. Encaixa no eixo "mortalidade e tempo" e na tese "a clínica é construída com as pessoas que o amam" (alguém resgatou a ninhada). Mostrar como poderia servir de abertura ou fechamento, com as fotos de `estagio/fotos/dia-19-11/`.
- ~~Enquanto o eixo não for escolhido~~ — o eixo foi decidido em 19/11: todos, em camadas.

- [ ] **2º NA FILA (pedido do Felipe em 19/11; subiu para 2º para orientar as próximas execuções): pesquisa aprofundada para direcionar a continuação da fila.** Instrução do Felipe: **não poupe tokens; pesquise o máximo possível; ultra pesquisa aprofundada** de como direcionar o uso do Claude para a melhor produtividade possível na apresentação. Buscar ideias boas, **altamente agradáveis, pedagógicas, visuais e acadêmicas**.
  - **Dentro do git (o material dele):** ler tudo (diário, casos, reflexões, fotos e legendas, exportação do claude.ai, briefings, apresentação atual, defesa da Yasmin, artefatos publicados, linha do tempo) e mapear o que ainda não foi aproveitado, as ligações entre casos, os pontos fortes e as lacunas.
  - **Fora (possibilidades):** pesquisar na web (use a skill de pesquisa aprofundada e/ou várias buscas) boas práticas de defesa de estágio técnico e TCC, apresentação científica e pedagógica, visualização de casos clínicos veterinários, narrativa em apresentações acadêmicas, design de slides, uso de fotos clínicas com ética e privacidade, e exemplos de defesas e apresentações que se destacaram. Também: o que o Claude consegue fazer de melhor para isso (animações, páginas, 3D, PDFs, roteiros, ensaio).
  - **Entrega:** um relatório em `estagio/defesa/pesquisa/` com direções, ideias e possibilidades, cada uma com: por que serve à defesa dele, esforço, o que precisa dele (fotos, decisões), e um exemplo concreto com o material real. No fim, uma proposta de próximas tarefas para a fila, marcadas **"para o Felipe avaliar"** (não executar antes de ele escolher). Respeitar as Decisões do Felipe (sem citações na defesa, exames não viram caso, sem animação do tártaro, eixo é escolha dele); fontes da pesquisa podem ser listadas no relatório para consulta, mas não viram slides de referências.
- [ ] **O corpo do estágio (o Felipe escolheu em 19/11):** uma silhueta de cão e uma de gato, desenhadas com cuidado (nada de formas genéricas), com cada lesão ou procedimento marcado no lugar do corpo onde aconteceu. Ao clicar no ponto, aparecem a foto real e uma legenda curta. Pontos: cotovelo esquerdo da Katita (fratura em Y), pálpebra superior (nodulectomia com cauterização), axila (nodulectomia de 17/11), pescoço (mordida da cadela de 12 anos), traseiro (melanoma, criocirurgia), boca (Barão, cerca de 8 extrações), pata (esporotricose, 28/10), olho e pescoço do gato branco (esporotricose, 18/11), bexiga (gato paraplégico; cistite; cistocentese), útero (castrações de 11/11 e 17/11), baço (Mel labradora), pescoço e cabeça (sarcoma, quimio), costela e barriga (filhote de 19/11), quadril (Luna, a confirmar). Interpretações clínicas "a confirmar"; fotos com rosto ou nome não entram. Página em `estagio/defesa/corpo-do-estagio/`, mais uma versão estática para slide/PDF.
- [ ] **Simulado da banca (o Felipe escolheu em 19/11):** as perguntas prováveis da banca, cada uma com uma resposta curta montada a partir do material dele (nunca inventada), e os pontos frágeis marcados. Incluir: o que ele fez de fato na castração (atos privativos, Lei 5.517/68: auxílio sob supervisão); por que esses casos e não outros; a estrutura e os serviços da clínica; perguntas técnicas básicas de cada caso (FeLV, esporotricose como zoonose, por que a quimio em seringa, por que não suturar mordida, o que é osteotomia do olécrano); dificuldades e o que aprendeu. Onde o material não tiver resposta, marcar "pesquisar ou perguntar à Cláudia". Em `estagio/defesa/simulado-banca/`.
- [ ] Lista única "perguntas para a Cláudia, o Thiago e a Fran", juntando as pendências.
- [ ] Rascunho de "Dificuldades encontradas" e "Considerações finais" a partir do diário e das reflexões.
- [x] ~~Referências bibliográficas~~ — descartado pelo Felipe em 19/11 (citações não são necessárias).
- [ ] **Roteiro da defesa (25–30 min) com todos os eixos integrados** (destravado: decisão de 19/11). Ordem dos casos, tempo por bloco e onde cada eixo aparece em cada bloco (tabela caso × eixo), seguindo a proposta de camadas nas Decisões. Mostrar o que coube e o que ficou de fora por tempo.
- [ ] Plano B offline: lista do que gravar em vídeo/PDF das animações.
- [x] ~~Animação da limpeza de tártaro~~ — descartado pelo Felipe em 19/11 (não justifica uma animação).
- [x] ~~Linha do tempo dos exames da Mel (labradora)~~ — descartado pela decisão de 19/11 (exames não viram caso).
- [ ] Checklist de privacidade das fotos que entram nos slides.

## Registro das execuções

### 19/11/2026 — execução de teste (manhã)

**Feito:** linha do tempo do estágio inteiro, de 26/10 a 19/11: 15 momentos, 110 fotos com as legendas originais, e para cada dia os casos, as reflexões e as ideias da defesa.
- `estagio/defesa/linha-do-tempo/index.html`: página para abrir no navegador (usa as fotos onde já estão no repositório, sem copiar).
- `estagio/defesa/linha-do-tempo/linha-do-tempo.pdf`: 15 páginas, fotos reduzidas (plano B offline).
- `estagio/defesa/linha-do-tempo/gerar.py`: refaz os dois. Lê as legendas direto de `informacoes-do-estagio.md` e dos LEIAME; os textos dos dias ficam na lista `DIAS`.
- 13 fotos marcadas em vermelho por mostrarem rosto ou nome (raios-X do dia 02, sala da cirurgia, quimio, ultrassom do gato paraplégico).

**Perguntas para o Felipe:**
- 18 fotos estão "sem legenda original" (referências da OSH e da nodulectomia, capturas 3D, raios-X de `imagens/`). Quer legendas para elas?
- Dias sem fotos: 30/10, 03/11, 09/11, 10–11/11. Há fotos desses dias fora do repositório (Luna, Atena, castração de 11/11, banho e tosa)?

**Próxima sugestão:** o comparativo dos eixos (prioridade da fila), usando a linha do tempo como base.

### 19/11/2026 — 11h41

**Feito:** comparativo dos 5 eixos e da tese, para o Felipe escolher (nenhum eixo foi decidido).
- `estagio/defesa/eixos/comparativo.md`: quadro rápido; para cada opção, a ideia, os casos que encaixam com fotos reais, as reflexões dele que sustentam, como entra na Parte 1, o que fica de fora e o risco; o par 17/11 → 19/11 em cada opção; quatro combinações possíveis (eixo + tese); quatro perguntas para ajudar a escolher.
- Apontado (sem mexer): a apresentação atual tem os slides 14 (Mel) e 15 (Mel Serafina) como casos, o que contraria as decisões de 19/11, e o slide 23 de referências, que o modelo do IFC traz mas o Felipe decidiu dispensar.

**Perguntas para o Felipe:**
- Qual eixo (ou combinação)?
- Os slides 14, 15 e 23 da apresentação devem sair ou mudar? (mudança estrutural: só com aprovação)
- Perguntar à Fran se o slide de referências do modelo do IFC é obrigatório.

**Próxima sugestão:** 2º da fila, a pesquisa aprofundada (13h41).
