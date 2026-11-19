# Modelos

Troque o que está entre `<>`. O exemplo real deste repositório é a defesa de estágio: o arquivo de fila é `estagio/defesa/MELHORIAS.md`.

## A. Arquivo de fila (`<pasta-de-trabalho>/MELHORIAS.md`)

```markdown
# Melhorias de <atividade> — registro da tarefa agendada

A tarefa "<nome>" roda <frequência>. Cada execução acrescenta uma entrada
no fim deste arquivo (nunca apaga as anteriores).

## Decisões de <usuário> (seguir sempre)

- **<DD/MM> — <decisão em uma frase>.** <detalhe, se preciso>

## Fila de ideias (a próxima execução pega o primeiro item pendente na ordem)

- [ ] **1º NA FILA: <entrega>.** <o que fazer, com que material, onde salvar>
- [ ] **2º NA FILA: <entrega>.** ...
- [ ] <itens sem número: depois dos numerados>
- [x] ~~<item descartado>~~ — descartado por <usuário> em <DD/MM> (<motivo>).

## Registro das execuções

### <DD/MM/AAAA> — <HHh>

**Feito:** <entrega>.
- `<arquivo>`: <o que é>

**Perguntas para <usuário>:**
- <pergunta direta que só ele responde>

**Próxima sugestão:** <item>.
```

## B. Texto da tarefa agendada (`create_trigger`, disparando nesta sessão)

```
Execução agendada "<nome>" (pedido de <usuário>: <frequência>, <objetivo>, com
liberdade, salvaguardando as informações puras, e mandar e-mail com as mudanças).

1. No repositório <caminho>, sincronize com `origin/<branch principal>` (git fetch;
   recrie o branch da sessão a partir dele). Leia `CLAUDE.md` e `<fila>`
   (as "Decisões" no topo valem sempre).
2. Pegue o primeiro item pendente da fila na ordem numerada que não dependa de uma
   decisão de <usuário> ainda não tomada, e faça uma entrega concreta e completa.
   Não decida o que é escolha dele. Não repita trabalho feito. Se nada puder
   avançar sem ele, melhore o que já existe em vez de inventar trabalho novo.
3. Informações puras: só acrescentar. Trabalho derivado em `<pasta>`.
   Interpretação técnica marcada "a confirmar". Nunca inventar referências.
4. Acrescente no fim da fila a entrada da execução e atualize a fila.
5. Commit, push, PR para `<branch principal>`. Só arquivos novos em `<pasta>` +
   a fila: faça o merge. Mexeu em arquivos existentes fora dela: PR em rascunho.
6. Mande pelo Gmail para <e-mail>, assunto "<Atividade> — melhorias de DD/MM HHh",
   resumo curto em texto simples. NÃO anexe arquivos; use só links.
7. Termine com uma linha de resumo.
```

Cron sugerido: `CRON_TZ=<fuso> 41 7-23/2 * * *` (a cada 2 horas, das 7h41 às 23h41).

## C. E-mail de cada execução (texto simples, sem Markdown)

```
Assunto: <Atividade> — melhorias de DD/MM HHh

Oi, <nome>. Resumo da execução das HHh.

O que foi feito
<uma ou duas frases>

Arquivos
- <arquivo>: <o que é>

PR: <link> (juntado | esperando sua aprovação)
Arquivo principal: <link do GitHub>

Perguntas para você
1. <pergunta>

Próxima execução (HHh)
<item seguinte>
```
