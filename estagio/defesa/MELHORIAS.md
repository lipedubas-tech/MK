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
- **19/11 — Material dos PRs abertos conta.** O Felipe pediu que o material dos pull requests em rascunho (#1, #6, #8, #9, #10, #12) seja considerado nas pesquisas e decisões. Cada execução deve olhar também os PRs abertos do repositório, não só o branch principal. Juntar esses PRs depende da aprovação dele.

## Fila de ideias (a próxima execução escolhe daqui ou propõe outra)

- [x] **FEITO 19/11 15h41 (`estagio/defesa/parte1-clinica/esboco.md`) — 3º NA FILA — Parte 1, a clínica em geral:** esboço dos slides da parte geral, enxuto, com base na estrutura da Yasmin: capa, identificação, história, infraestrutura, serviços, atividades realizadas (procedimentos, exames, vacinas, transfusão). Usar as fotos que existem e listar as que faltam (o Felipe não tem fotos dos ambientes da clínica: balcão, consultório, internamento, espera, banho e tosa, canil, cirurgia, esterilização parcial). Em `estagio/defesa/parte1-clinica/`.

- [x] **FEITO 19/11 (teste):** linha do tempo do estágio inteiro com **todas as fotos e todas as ideias**, dia a dia (28/10 até hoje). Cada dia com as suas fotos (de `estagio/fotos/` e `estagio/imagens/`, com as legendas originais), os casos, as reflexões e as ideias da defesa que surgiram naquele dia (animações, eixos temáticos, artefatos publicados). Formato visual (página HTML em `estagio/defesa/linha-do-tempo/`, com as fotos referenciadas do repositório, sem copiar nem alterar os originais), com uma versão em PDF para o plano B offline. Atualizar a cada execução seguinte quando chegarem dias novos.

- [x] **FEITO 19/11 11h41 (`estagio/defesa/eixos/comparativo.md`) — 1º NA FILA: material para o Felipe escolher o eixo da defesa.** A escolha é dele; a tarefa **não decide** o eixo. Fazer uma página comparando os 5 eixos temáticos (seção 2 de `informacoes-do-estagio.md`: tornar visível o oculto; dar voz ao paciente que não fala; caráter formado por exposição e habituação; mortalidade e tempo condensados em dados clínicos; mídia visual como argumento) e a tese "o paciente é o animal, mas a clínica é construída com as pessoas que o amam". Para cada um: os casos e fotos que encaixam, as reflexões dele que sustentam, como seria a abertura e o fechamento, o que fica de fora, e o risco. Em `estagio/defesa/eixos/`.
  - **O Felipe gostou desta ligação (19/11), incluir no comparativo:** o par 17/11 → 19/11. Os 3 fetos que já estavam mortos (mumificados) na castração da gata, sem nada a fazer, e os 3 filhotes que sobreviveram ao cachorro e chegaram vivos para serem salvos. Encaixa no eixo "mortalidade e tempo" e na tese "a clínica é construída com as pessoas que o amam" (alguém resgatou a ninhada). Mostrar como poderia servir de abertura ou fechamento, com as fotos de `estagio/fotos/dia-19-11/`.
- ~~Enquanto o eixo não for escolhido~~ — o eixo foi decidido em 19/11: todos, em camadas.

- [x] **FEITO 19/11 13h41 (`estagio/defesa/pesquisa/relatorio.md`) — 2º NA FILA (pedido do Felipe em 19/11; subiu para 2º para orientar as próximas execuções): pesquisa aprofundada para direcionar a continuação da fila.** Instrução do Felipe: **não poupe tokens; pesquise o máximo possível; ultra pesquisa aprofundada** de como direcionar o uso do Claude para a melhor produtividade possível na apresentação. Buscar ideias boas, **altamente agradáveis, pedagógicas, visuais e acadêmicas**.
  - **Dentro do git (o material dele):** ler tudo (diário, casos, reflexões, fotos e legendas, exportação do claude.ai, briefings, apresentação atual, defesa da Yasmin, artefatos publicados, linha do tempo) e mapear o que ainda não foi aproveitado, as ligações entre casos, os pontos fortes e as lacunas.
  - **Fora (possibilidades):** pesquisar na web (use a skill de pesquisa aprofundada e/ou várias buscas) boas práticas de defesa de estágio técnico e TCC, apresentação científica e pedagógica, visualização de casos clínicos veterinários, narrativa em apresentações acadêmicas, design de slides, uso de fotos clínicas com ética e privacidade, e exemplos de defesas e apresentações que se destacaram. Também: o que o Claude consegue fazer de melhor para isso (animações, páginas, 3D, PDFs, roteiros, ensaio).
  - **Entrega:** um relatório em `estagio/defesa/pesquisa/` com direções, ideias e possibilidades, cada uma com: por que serve à defesa dele, esforço, o que precisa dele (fotos, decisões), e um exemplo concreto com o material real. No fim, uma proposta de próximas tarefas para a fila, marcadas **"para o Felipe avaliar"** (não executar antes de ele escolher). Respeitar as Decisões do Felipe (sem citações na defesa, exames não viram caso, sem animação do tártaro, eixo é escolha dele); fontes da pesquisa podem ser listadas no relatório para consulta, mas não viram slides de referências.
- [x] **FEITO 19/11 17h41 — P15 (escolhido pelo Felipe em 19/11): atualizar a linha do tempo** com 18/11 (conversa com o Rangel e cirurgia de fecaloma em gato, fotos em `fotos/cirurgia-felino/`) e 19/11 (segunda eutanásia, sem fotos). Editar a lista `DIAS` e o mapeamento de pastas em `estagio/defesa/linha-do-tempo/gerar.py`, rodar de novo (página e PDF) e conferir as fotos novas. Fotos 1 e 8 do fecaloma mostram rostos (uso autorizado): marcar como "rosto visível" mesmo assim.
- [x] **FEITO 19/11 19h41 (`estagio/defesa/casos/esporotricose.md`) — P3 (escolhido pelo Felipe em 19/11): esporotricose como caso de Saúde Única.** Slide (frase + prova: as lesões dos dois gatos, 28/10 e 18/11, lado a lado) e fala ligando os dois casos à zoonose em expansão, com casos confirmados no Sul de SC, e à biossegurança (luvas, mão sem luva recortada, descarte). Interpretação clínica "a confirmar"; fontes só como estudo (seção 2.7 da pesquisa), sem slide de referências. Em `estagio/defesa/casos/esporotricose.md`.
- [x] **FEITO 19/11 21h41 (`estagio/defesa/odisseu-argos/`) — Odisseu e o cão Argos (ideia do Felipe em 19/11): colocar nos slides.** A cena da *Odisseia* (canto XVII) em que só o velho cão reconhece Odisseu na volta e morre em seguida. Achar a obra de arte (candidata: John Flaxman, *Ulysses and his Dog*), **confirmar o domínio público no Wikimedia Commons**, baixar em boa resolução e montar o slide (imagem inteira, uma frase, crédito da obra), com 2 ou 3 variantes de posição para ele escolher: abertura, fechamento ou ponte entre a Parte 1 e a Parte 2. Detalhes na seção 5 de `estagio/defesa/pesquisa/relatorio.md`.
- [x] **FEITO 19/11 23h41 (`estagio/defesa/corpo-do-estagio/`) — O corpo do estágio (o Felipe escolheu em 19/11):** uma silhueta de cão e uma de gato, desenhadas com cuidado (nada de formas genéricas), com cada lesão ou procedimento marcado no lugar do corpo onde aconteceu. Ao clicar no ponto, aparecem a foto real e uma legenda curta. Pontos: cotovelo esquerdo da Katita (fratura em Y), pálpebra superior (nodulectomia com cauterização), axila (nodulectomia de 17/11), pescoço (mordida da cadela de 12 anos), traseiro (melanoma, criocirurgia), boca (Barão, cerca de 8 extrações), pata (esporotricose, 28/10), olho e pescoço do gato branco (esporotricose, 18/11), bexiga (gato paraplégico; cistite; cistocentese), útero (castrações de 11/11 e 17/11), baço (Mel labradora), pescoço e cabeça (sarcoma, quimio), costela e barriga (filhote de 19/11), quadril (Luna, a confirmar). Interpretações clínicas "a confirmar"; fotos com rosto ou nome não entram. Página em `estagio/defesa/corpo-do-estagio/`, mais uma versão estática para slide/PDF.
- [x] **FEITO 20/11 7h41 (`estagio/defesa/simulado-banca/simulado.md`) — Simulado da banca (o Felipe escolheu em 19/11):** as perguntas prováveis da banca, cada uma com uma resposta curta montada a partir do material dele (nunca inventada), e os pontos frágeis marcados. Incluir: o que ele fez de fato na castração (atos privativos, Lei 5.517/68: auxílio sob supervisão); por que esses casos e não outros; a estrutura e os serviços da clínica; perguntas técnicas básicas de cada caso (FeLV, esporotricose como zoonose, por que a quimio em seringa, por que não suturar mordida, o que é osteotomia do olécrano); dificuldades e o que aprendeu. Onde o material não tiver resposta, marcar "pesquisar ou perguntar à Cláudia". Em `estagio/defesa/simulado-banca/`.
- [x] **FEITO 20/11 9h41 (`estagio/defesa/perguntas/perguntas-por-pessoa.md`)** — Lista única "perguntas para a Cláudia, o Thiago e a Fran", juntando as pendências.
- [x] **FEITO 20/11 11h41 (`estagio/defesa/fechamento/dificuldades-e-consideracoes.md`)** — Rascunho de "Dificuldades encontradas" e "Considerações finais" a partir do diário e das reflexões.
- [x] ~~Referências bibliográficas~~ — descartado pelo Felipe em 19/11 (citações não são necessárias).
- [ ] **P12 (escolhido pelo Felipe em 20/11): orçamento de tempo das animações**, antes do roteiro. Abrir cada animação (Katita 3D/`katita-3d/dist/katita-offline.html`, OSH `castracao-osh/osh-3d.html`, nodulectomia `estagio/animacao-nodulectomia/index.html`, quimio `estagio/quimioterapia/dist/quimio-offline.html`, criocirurgia só no claude.ai) e medir a duração total e de cada cena. Propor para cada uma o trecho que entra na defesa (cenas e segundos) e o que fica de fora, de modo que as animações somadas caibam num orçamento razoável dentro dos 25–30 min. Em `estagio/defesa/tempo-animacoes.md`. Não editar as animações.
- [ ] **Roteiro da defesa (25–30 min) com todos os eixos integrados** (destravado: decisão de 19/11). Ordem dos casos, tempo por bloco e onde cada eixo aparece em cada bloco (tabela caso × eixo), seguindo a proposta de camadas nas Decisões. Mostrar o que coube e o que ficou de fora por tempo.
- [ ] **P1 (escolhido pelo Felipe em 20/11): auditoria da apresentação atual**, sem mexer nela. Renderizar cada slide de `estagio/apresentacao/Defesa-de-Estagio-Felipe.pptx` (LibreOffice/pdf → imagem) e dar uma nota por slide: título em frase-afirmação, número de palavras (meta 15–25), imagem como prova, privacidade (rostos, nomes, mão sem luva), tempo estimado e se contraria as Decisões do Felipe (slides 5, 14, 15, 23). Comparar com o roteiro e o esboço da Parte 1. Em `estagio/defesa/auditoria/`.
- [ ] **P2 (escolhido pelo Felipe em 20/11): protótipo de 5 slides em frase-afirmação e prova**, num `.pptx` novo em `estagio/defesa/prototipo/` (nunca no da apresentação): Katita, quimio, esporotricose, Bob e um da Parte 1 (o Rangel). Usar as falas e frases já escritas em `parte1-clinica/esboco.md` e `casos/esporotricose.md`. Gerar prévias em imagem para o Felipe comparar com os slides atuais.
- [ ] Plano B offline: lista do que gravar em vídeo/PDF das animações.
- [ ] **P13 (escolhido pelo Felipe em 20/11): teste offline de todas as peças** num navegador sem rede (Playwright com rede bloqueada): Katita, OSH, nodulectomia, quimio, linha do tempo, corpo do estágio, Odisseu. Para cada uma: abre? fontes e imagens carregam? animação roda? tempo de carregamento. Resultado e checklist para o dia da defesa em `estagio/defesa/plano-b/teste-offline.md`. Pode ser feito junto com o item do plano B.
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

### 19/11/2026 — 13h41

**Feito:** pesquisa aprofundada no material do repositório e fora dele (14 buscas: apresentação científica, slides em afirmação e prova, princípios de Mayer, narrativa E/MAS/PORTANTO, ensino com casos veterinários, mapas corporais, ética de imagens, esporotricose em SC, eutanásia e sofrimento moral, preparação de defesa, Odisseu e Argos).
- `estagio/defesa/pesquisa/relatorio.md`: resumo em 10 linhas; inventário do material e lacunas; 9 achados aplicados com exemplos do material real; como usar o Claude para render mais; 10 propostas de tarefa (P1 a P10) **para o Felipe avaliar**; a ideia de Odisseu e Argos (seção 5); fontes.
- Achados importantes: o slide 5 da apresentação usa fotos de ambientes da defesa da Yasmin (precisa de crédito ou troca); a apresentação tem de 50 a 86 palavras por slide; o `katita-offline.html` já é um plano B pronto.
- Fila: acrescentado o item "Odisseu e o cão Argos" (ideia do Felipe).

**Perguntas para o Felipe:**
- Quais propostas (P1 a P10) entram na fila, e em que ordem?
- Data da defesa e quem está na banca? Na sala tem internet e projetor?
- O slide 5 fica com as fotos da Yasmin com crédito, ou ele tira fotos suas?

**Próxima sugestão:** 3º da fila, a Parte 1 (a clínica), já usando a técnica de afirmação e prova; ou o que o Felipe escolher entre P1 e P10.

### 19/11/2026 — 15h41

**Feito:** esboço da Parte 1 (a clínica em geral), com 7 slides em frase-afirmação e prova visual, cerca de 6 minutos. A Parte 1 abre com a história do Rangel (autorizada) em vez de dados, e usa as camadas dos eixos. Cada slide tem fotos reais do repositório (caminhos conferidos), fala e tempo; no fim, o que depende do Felipe e a comparação com a apresentação atual, que não foi mexida.
- `estagio/defesa/parte1-clinica/esboco.md`

**Perguntas para o Felipe:**
- Tirar fotos dos ambientes, da fachada e do banho e tosa até 07/12? (slides 2, 4 e 5)
- Carga horária e setor do estágio.
- Slide 5: fotos da Yasmin com crédito, ou fotos dele?

**Próxima sugestão:** o corpo do estágio (próximo item numerado da fila), ou atualizar a linha do tempo com 18/11 (Rangel e fecaloma) e 19/11 (P15).

### 19/11/2026 — 17h41

**Feito:** P15, a linha do tempo atualizada.
- **18/11** agora tem a conversa com o Rangel e a cirurgia de fecaloma, com as 9 fotos (as fotos 1 e 8 marcadas como "rosto visível", apesar de o uso estar autorizado).
- **19/11** ganhou a segunda eutanásia (sem fotos), a visita da oncologista, a reflexão sobre o dó e as ideias do dia: eixo em camadas, Odisseu e Argos.
- **17/11** registra as animações 3D da OSH e da nodulectomia, já prontas.
- Total: 119 fotos.
- Arquivos regenerados: `estagio/defesa/linha-do-tempo/gerar.py`, `index.html`, `linha-do-tempo.pdf`.

**Perguntas para o Felipe:** nenhuma nova.

**Próxima sugestão:** P3, a esporotricose como caso de Saúde Única (19h41).

### 19/11/2026 — 19h41

**Feito:** P3, a esporotricose como caso de Saúde Única.
- Proposta de slide em frase e prova ("Dois gatos com a mesma zoonose em três semanas"), com variante em 2 slides.
- Fala de cerca de 1 min 30 s no formato E/MAS/PORTANTO e as camadas dos eixos.
- O ponto delicado da mão sem luva, com três caminhos.
- Sete perguntas prováveis da banca, com o status de cada resposta.
- `estagio/defesa/casos/esporotricose.md`

**Perguntas para o Felipe:**
- Perguntar à Cláudia como foram o diagnóstico e o tratamento dos dois gatos, e se o Revolution Plus foi para o de 18/11.
- A mão sem luva: recortar, usar como aprendizado ou ligar à biossegurança da Parte 1?

**Próxima sugestão:** Odisseu e Argos (21h41).

### 19/11/2026 — 21h41

**Feito:** Odisseu e Argos.
- **Imagem:** a gravura de John Flaxman, *Ulisses e seu cão*. O **domínio público foi conferido** na página do arquivo no Wikimedia Commons, e a imagem foi baixada em 2048 × 1536 px.
- **Slides:** três variantes de posição (abertura, fechamento e ponte entre as partes), cada uma com frase, fala sugerida e crédito da obra. As prévias foram conferidas.
- **Rede:** para baixar a imagem, foram liberados na rede do ambiente os endereços `commons.wikimedia.org` e `upload.wikimedia.org`.
- **Arquivos:** `estagio/defesa/odisseu-argos/` (`LEIAME.md`, `slides.html`, `flaxman-ulisses-e-seu-cao.jpg`, `previa-abertura.png`, `previa-fechamento.png`, `previa-ponte.png`).

**Perguntas para o Felipe:** qual variante: abertura, fechamento, ponte, ou abertura e fechamento como moldura?

**Próxima sugestão:** o corpo do estágio (23h41).

### 19/11/2026 — 23h41

**Feito:** o corpo do estágio.
- **Silhuetas:** cão e gato tirados dos modelos 3D reais das animações, renderizados de perfil. A do gato foi suavizada.
- **Pontos:** 11 no cão e 8 no gato, cada um no lugar do corpo onde o caso aconteceu.
- **Página interativa:** ao clicar num ponto, aparecem a foto real e a legenda. Os pontos tracejados indicam "a confirmar".
- **Versão estática:** uma imagem para slide.
- **Fotos e privacidade:** os caminhos das 15 fotos foram conferidos. Fotos com rosto ficaram de fora, e a mão sem luva tem aviso.
- **Arquivos:** `estagio/defesa/corpo-do-estagio/` (`index.html`, `previa-estatica.png`, `silhueta-cao.png`, `silhueta-gato.png`, `LEIAME.md`).

**Perguntas para o Felipe:**
- O modelo 3D do cão (o da nodulectomia) não tem origem nem licença registradas no repositório. Ele sabe de onde veio?
- Confirmar o lado da nodulectomia de 17/11.

**Próxima sugestão:** o simulado da banca (amanhã, 7h41).

### 20/11/2026 — 7h41

**Feito:** o simulado da banca.
- Cerca de 35 perguntas prováveis, em 10 blocos: estágio e clínica, Katita, Bob, quimio, criocirurgia, cirurgias de 17/11 e 18/11, esporotricose, rotina, eutanásia e fechamento.
- Cada pergunta tem uma resposta curta tirada do material (nada inventado) e um status: no material, a confirmar ou falta.
- Os pontos frágeis estão marcados. O principal: dizer sempre "acompanhei e auxiliei sob supervisão", porque há atos privativos do veterinário.
- No fim, uma tabela de prioridades das pendências.
- `estagio/defesa/simulado-banca/simulado.md`

**Perguntas para o Felipe:**
- Carga horária e setor do estágio.
- Ensaiar a resposta a "por que pequenos animais num curso de Agropecuária?".
- Algumas respostas são pessoais e só ele pode dar: dificuldade, o que leva do estágio, o que o campus poderia mudar.

**Próxima sugestão:** a lista única de perguntas para a Cláudia, o Thiago e a Fran (9h41).

### 20/11/2026 — 9h41

**Feito:** a lista única de perguntas, separada por pessoa, para usar no celular.
- Pessoas: Fran (7 perguntas), Cláudia (18, entre IFC, casos e dados), Thiago (3), oncologista (5) e Rangel (2), mais uma lista de decisões que são só do Felipe.
- As perguntas que travam a defesa estão marcadas com ★.
- Cada pergunta tem um espaço para anotar a resposta. As respostas, quando vierem, entram no diário como acréscimo.
- `estagio/defesa/perguntas/perguntas-por-pessoa.md`

**Perguntas para o Felipe:** levar a lista à clínica e ao IFC. As principais são a data da defesa e a banca, a carga horária e o setor, como apresentar a castração, a autorização das fotos e a dose da quimio.

**Próxima sugestão:** rascunho de "Dificuldades encontradas" e "Considerações finais" (11h41).

### 20/11/2026 — 11h41

**Feito:** rascunho de "Dificuldades encontradas" e "Considerações finais".
- **Dificuldades:** 5 candidatas tiradas do diário, sendo 2 novas em relação ao slide 21 (aprender a lidar com o dó e a relação com os gatos), com título e fala de cerca de 40 s.
- **Considerações finais:** uma versão para o slide, com a tese, e uma versão falada de cerca de 1 min que usa as camadas dos eixos.
- **Ações que o campus poderia alterar:** 4 ideias tiradas da experiência dele, que só entram se forem verdade para ele.
- Os slides 21 e 22 da apresentação não foram alterados.
- `estagio/defesa/fechamento/dificuldades-e-consideracoes.md`

**Perguntas para o Felipe:**
- Quais dificuldades entram no slide?
- Quais ações o campus poderia alterar?
- A imagem final é São Francisco ou Odisseu?

**Próxima sugestão:** P12, o orçamento de tempo das animações (13h41).
