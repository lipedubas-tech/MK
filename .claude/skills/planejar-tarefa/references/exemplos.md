# Exemplos de planejamento

Quatro tarefas, da menor para a mais arriscada. Em cada uma, o raciocínio vem primeiro e o plano depois, para mostrar de onde o plano saiu.

## Conteúdo

1. Tarefa pequena: corrigir uma data
2. Tarefa média: modo escuro em uma página
3. Tarefa grande: relatório em PDF com fotos e anotações
4. Tarefa arriscada: limpar uma pasta com duplicados

---

## 1. Tarefa pequena: corrigir uma data

**Pedido:** "A data na primeira página do relatório está errada, é 12/11 e não 21/11."

**Raciocínio:** uma mudança só, o pedido diz exatamente o quê, e dá para desfazer. Não há o que planejar.

**O que fazer:** abrir o arquivo, achar a data, corrigir, e procurar se a mesma data errada aparece em outros lugares do documento (um erro de digitação raramente está sozinho). Relatar: "Corrigi na primeira página. A mesma data aparecia no rodapé da página 3; corrigi também."

Escrever um plano aqui seria mais longo do que o trabalho.

---

## 2. Tarefa média: modo escuro em uma página

**Pedido:** "Coloca um botão de modo escuro na página."

**Raciocínio:**

- *Objetivo:* ler a página à noite sem ofuscar. Isso sugere que a escolha deve ser lembrada na próxima visita.
- *Olhar antes:* as cores da página estão espalhadas pelo CSS ou em variáveis? A resposta muda o tamanho do trabalho, então é a primeira coisa a conferir.
- *Pronto:* o botão alterna as cores, todo texto continua legível nos dois modos e a escolha sobrevive a recarregar a página.
- *Dúvidas:* onde fica o botão? Existe um padrão sensato (canto superior direito), então é assumir e avisar, não perguntar.
- *Sem volta:* nada.

**Plano dito em duas frases, e começar:**

> Vou passar as cores da página para variáveis, criar a versão escura e pôr um botão no canto superior direito que alterna entre as duas e lembra a escolha. Depois abro a página nos dois modos para conferir se algum texto ficou ilegível.

Não precisa de plano escrito nem de aprovação: tudo é reversível e a única suposição foi avisada.

---

## 3. Tarefa grande: relatório em PDF com fotos e anotações

**Pedido:** "Junta as fotos e as minhas anotações do semestre em um relatório em PDF."

**Raciocínio:**

- *Objetivo:* não está dito para quem é o relatório. Entregar a um professor e guardar de lembrança pedem documentos diferentes. Só a pessoa sabe, e a resposta muda o resultado: é uma pergunta de verdade.
- *Olhar antes:* quantas fotos são, se têm legenda ou data, em que formato estão as anotações, se existe um relatório anterior que sirva de modelo.
- *Maior incerteza:* gerar um PDF com dezenas de fotos sem ficar enorme nem com imagem borrada. É o que pode derrubar o plano, então é testado primeiro, com três fotos.
- *Sem volta:* nada, desde que os originais não sejam alterados.

**Plano escrito:**

```
**Objetivo:** Um PDF único com as anotações do semestre em ordem de data
e as fotos ao lado do dia a que pertencem.
**Pronto quando:** O PDF abre, todas as 45 fotos aparecem com legenda,
nenhuma anotação ficou de fora e o arquivo tem menos de 20 MB.
**O que eu vi:**
- 45 fotos em 4 pastas, separadas por dia; 38 já têm legenda em um arquivo de texto.
- As anotações estão em um único arquivo, com um título por dia.
- Não existe relatório anterior para servir de modelo.
**O que estou assumindo:**
- A ordem é cronológica, porque as anotações já estão assim.
- As 7 fotos sem legenda entram com a data como legenda.
**Passos:**
1. Gerar um PDF de teste com 3 fotos e uma página de texto → abre, as fotos estão nítidas e o tamanho é razoável.
2. Montar a estrutura completa (um capítulo por dia) só com o texto → todos os dias das anotações aparecem no sumário.
3. Encaixar as fotos de cada dia → a contagem de fotos no PDF bate com a das pastas.
4. Revisar o PDF final página por página → nenhuma foto cortada, nenhuma legenda trocada.
**Pontos sem volta:** nenhum. Os originais não são alterados; o PDF é um arquivo novo.
**Preciso de você para:** Para quem é o relatório? Se for para entregar na faculdade
(recomendo assumir isso), incluo capa e sumário; se for só para guardar, deixo mais simples.
```

Repare que o passo 1 existe só para matar a maior incerteza, e que a pergunta vem com uma recomendação. Os passos 1 e 2 não dependem da resposta, então o trabalho começa enquanto ela não chega.

---

## 4. Tarefa arriscada: limpar uma pasta com duplicados

**Pedido:** "Essa pasta está uma bagunça, tem muita coisa duplicada. Limpa pra mim."

**Raciocínio:**

- O trabalho é pequeno, mas apagar não tem volta. O risco é que manda no tamanho do plano.
- *"Duplicado" é ambíguo:* mesmo nome? mesmo conteúdo? `relatorio-final.pdf` e `relatorio-final-v2.pdf` são duplicados ou versões? Dá para descobrir parte disso sozinho, comparando o conteúdo dos arquivos.
- *Pronto:* nenhum conteúdo único foi perdido, e a pessoa aprovou a lista antes de qualquer coisa sumir.
- *Caminho de volta:* mover para uma pasta de descarte em vez de apagar.

**Plano escrito:**

```
**Objetivo:** Deixar na pasta uma cópia só de cada arquivo, sem perder nenhum conteúdo.
**Pronto quando:** Você aprovou a lista do que sai, e todo arquivo removido
tem uma cópia idêntica que ficou.
**O que eu vi:**
- 212 arquivos; 61 têm conteúdo idêntico a outro arquivo da pasta.
- 9 pares têm nome parecido e conteúdo diferente (parecem versões, não duplicados).
**O que estou assumindo:**
- "Duplicado" quer dizer conteúdo idêntico. Arquivos com nome parecido e
  conteúdo diferente ficam como estão.
- Entre dois idênticos, fica o de nome mais limpo (sem "cópia" ou "(1)").
**Passos:**
1. Listar os grupos de arquivos idênticos e qual de cada grupo fica → lista pronta para você ler.
2. Você revisa a lista → aprovação ou correções.
3. Mover os que saem para uma pasta `_descarte` → a contagem bate com a lista aprovada.
4. Conferir que cada arquivo movido tem um idêntico na pasta original → zero conteúdo único em `_descarte`.
**Pontos sem volta:** Apagar de vez a pasta `_descarte`. Não faço isso;
fica para você, quando tiver certeza.
**Preciso de você para:** Aprovar a lista do passo 1, e dizer o que fazer com os
9 pares de versões (recomendo não mexer).
```

Três coisas tornam esse plano seguro: a ação perigosa foi trocada por uma reversível (mover em vez de apagar), a pessoa vê exatamente o que vai sair antes de sair, e o passo que realmente não tem volta ficou fora do plano, nas mãos dela.
