---
name: fila-agendada
description: Protocolo para montar e manter uma fila de tarefas que o Claude executa sozinho em horários agendados para uma atividade longa (defesa, TCC, relatório, projeto), gravando no git e mandando por e-mail o resumo de cada execução. Use quando o usuário pedir para "trabalhar sozinho", "não deixar os tokens ociosos", "rodar de manhã, à tarde e à noite", "me mandar um e-mail com as mudanças", criar ou reorganizar uma fila de melhorias, mudar a ordem ou a frequência das execuções, ou registrar uma decisão que as execuções devem seguir, mesmo que ele não use a palavra "fila".
---

# Fila de tarefas agendada com e-mail

O objetivo é transformar tempo ocioso em trabalho útil sem tirar do usuário as decisões que são dele. Três peças fazem isso funcionar:

1. **Um arquivo de fila** no repositório: decisões do usuário no topo, fila numerada no meio e registro das execuções no fim.
2. **Uma tarefa agendada** que, a cada disparo, pega o próximo item, faz uma entrega completa, grava e registra.
3. **Um e-mail** por execução, com o que foi feito, os links e as perguntas que dependem do usuário.

Os modelos prontos (arquivo de fila, texto da tarefa agendada e e-mail) estão em [`references/modelos.md`](references/modelos.md).

## 1. Montar (uma vez por atividade)

**a. Proteja os dados originais antes de tudo.** Escreva no `CLAUDE.md` do repositório quais arquivos são "informações puras": diário, fotos, documentos recebidos. Esses arquivos só recebem acréscimos e nunca são apagados, resumidos por cima ou "corrigidos". Todo trabalho derivado vai numa pasta própria (ex.: `estagio/defesa/`). Interpretação técnica ou clínica sai marcada "a confirmar".

**b. Defina o que pode ser gravado sem pedir.** Também no `CLAUDE.md`:
- **Baixo risco (grava e junta sozinho):** arquivos novos na pasta de trabalho, entradas novas no registro, correções pequenas. Abre o PR e faz o merge na hora, para manter o histórico.
- **Estrutural (pede aprovação):** apagar, mover ou renomear, reescrever boa parte de um documento, mexer no produto final ou em código existente, mudar as regras. Nesses casos o PR fica em rascunho.
- Na dúvida, trate como estrutural.

**c. Crie o arquivo de fila** (modelo A), com uma fila inicial de 5 a 10 itens concretos tirados do material do usuário. Cada item diz o que entregar e onde.

**d. Crie a tarefa agendada** (modelo B) com `create_trigger`. Antes de escolher a forma, considere as lições abaixo.
- **Dispare dentro desta sessão** (sem `create_new_session_on_fire`). Uma sessão nova nasce sem o repositório e sem os conectores (Gmail). O push dela é recusado e o trabalho se perde. A opção `connectors` pode não estar liberada na conta.
- **Use o fuso do usuário** e um minuto quebrado (ex.: `CRON_TZ=America/Sao_Paulo 41 7-23/2 * * *`). Horários cheios atrasam.
- **Frequência:** com execuções na mesma sessão, uma não roda em paralelo com a outra. A cada 2 horas é o máximo útil. De hora em hora, elas se acumulam sem render mais. O gargalo real costuma ser o usuário decidir, não o tempo de máquina.

**e. Teste na hora.** Rode `fire_trigger` e confira o resultado: o trabalho foi feito, o PR foi juntado e o e-mail chegou. Se algo falhar, corrija o texto da tarefa antes do primeiro horário real.

## 2. Cada execução

1. **Sincronize** com o branch principal (`git fetch`) e recrie o branch da sessão a partir dele. Outra execução ou o usuário podem ter mudado a fila.
2. **Leia** o `CLAUDE.md`, as **Decisões do usuário** no topo da fila e o que o item pedir.
3. **Escolha** o primeiro item pendente, na ordem numerada, que não dependa de uma decisão que o usuário ainda não tomou. Se nada puder avançar sem ele, melhore o que já existe em vez de inventar trabalho de pouco valor.
4. **Entregue algo completo e verificado.** Se for visual, gere e olhe uma captura de tela. Se for PDF, abra uma página. Um item grande pode durar várias execuções, desde que cada uma registre onde parou.
5. **Registre** no fim do arquivo de fila: data e hora, o que foi feito, os arquivos, o PR, as perguntas para o usuário e a próxima sugestão. Marque o item como feito.
6. **Grave:** commit, push, PR e merge, se for de baixo risco. Se não for, o PR fica em rascunho.
7. **Mande o e-mail** (modelo C). **Nunca anexe arquivos:** a chamada ao conector tem limite de cerca de 4 MB e um PDF de fotos estoura esse limite e bloqueia o envio inteiro. Mande só os links do GitHub.
8. **Termine com uma linha** de resumo.

## 3. Manter a fila (quando o usuário fala)

- **Decisão do usuário** ("exames não viram caso", "sem citações"): vai para **Decisões**, com data, no topo da fila. Vale para todas as execuções. Itens que a contrariam são riscados com o motivo, não apagados.
- **Escolha que é dele** (o eixo, o tema, o que entra na apresentação): a fila produz **material para ele escolher**, como um comparativo com prós, riscos e exemplos do material real, e nunca decide no lugar dele.
- **Ordem:** numere explicitamente (1º, 2º, 3º). Rótulos como "prioridade alta" em dois itens criam empate.
- **Mudança de ordem:** se uma troca afeta outra execução (por exemplo, a pesquisa que deveria orientar o comparativo), avise o efeito e recomende. A palavra final é do usuário. Se ele disser "continua assim", mantenha.
- **Sugestões de itens novos:** ofereça poucas, ancoradas no material real e no que ele já disse que funciona. Se ele não gostar, pergunte o que errou antes de mandar mais ideias.
- **Ao gravar uma mudança na fila,** avise em uma linha o que foi gravado.

## 4. Avisos ao usuário

- Diga quando cada execução vai rodar e quantos e-mails ele vai receber. Ofereça juntar tudo em menos e-mails se forem muitos.
- Relate falhas como falhas: "o teste não conseguiu gravar, o trabalho se perdeu, corrigi assim".
- Quando um item depender dele (fotos que faltam, uma escolha), diga isso no e-mail como pergunta direta.
