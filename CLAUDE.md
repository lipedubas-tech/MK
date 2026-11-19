# Instruções para o Claude neste repositório

Contexto do estágio: `estagio/informacoes-do-estagio.md` (fonte principal) e
`estagio/exportacao-claude/CLAUDE.md`.

## Como gravar mudanças no git

O branch principal é `claude/cirurgia-katita-rbgcmx`.

**Registros de baixo risco: pode gravar direto, sem pedir aprovação.**
Trabalhe no branch da sessão, abra o pull request e faça o merge você mesmo
na hora (assim fica o histórico de cada mudança). Contam como registro:
- fotos novas em `estagio/fotos/<dia>/` com a nota/legenda;
- entradas novas no diário, nas reflexões, nos exames ou nas pendências;
- correções pequenas de texto, datas e nomes;
- arquivos novos que não mexem em nada que já existe.

**Mudanças bruscas ou estruturais: continue pedindo.** Abra o pull request em
rascunho e espere o usuário aprovar antes de juntar. Contam como estruturais:
- apagar, mover ou renomear arquivos ou pastas já existentes;
- reorganizar ou reescrever boa parte de um documento;
- mexer na apresentação da defesa (`estagio/apresentacao/`), nos scripts,
  em `katita-3d/` ou em qualquer código;
- mudar estas próprias regras.

Na dúvida, trate como estrutural e pergunte.

## Informações puras: nunca alterar

São os registros originais do estágio. Pode **acrescentar** a eles (dia novo,
foto nova, pendência nova), mas nunca apagar, resumir por cima, reescrever ou
"corrigir" o que já está lá sem o usuário pedir:
- `estagio/informacoes-do-estagio.md` (diário, casos, exames, reflexões);
- `estagio/exportacao-claude/` inteira;
- `estagio/fotos/`, `estagio/imagens/`, `estagio/pdfs/` e as notas `LEIAME.md`
  de cada pasta de fotos;
- os PDFs e `.pptx` recebidos (modelo do IFC, defesa da Yasmin, briefings).

Trabalho derivado (rascunhos, roteiros, slides novos, análises) vai em
`estagio/defesa/`. Interpretação clínica é sempre marcada como "a confirmar"
com a Cláudia ou o Thiago, nunca escrita como fato.

## Tarefa agendada "Melhorar a defesa"

Roda a cada 2 horas, das 7h41 às 23h41 (9 vezes por dia). Cada execução lê
`estagio/defesa/MELHORIAS.md`, escolhe a próxima melhoria, faz, e registra lá
o que fez e o que sugere em seguida. Ao terminar, manda um e-mail (Gmail) ao
Felipe com o resumo das mudanças e o link do PR. As decisões do Felipe ficam
no topo do MELHORIAS.md e valem sempre.

Depois de juntar, avise o usuário em uma linha o que foi gravado.
