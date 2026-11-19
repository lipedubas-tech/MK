# Quimioterapia: a seringa vermelha

Sequência de 8 cenas (cerca de 4 minutos) sobre a quimioterapia com doxorrubicina de 12/11/2026, para a defesa do estágio. Não mostra nenhuma medida de dose ou de volume.

- **Página publicada:** https://claude.ai/artifact/2KrnwDdg2sY1Nqw3SReCVJ (só abre logado na conta do Felipe)
- **Versão offline para o dia da defesa:** `dist/quimio-offline.html`. Abre direto no navegador, sem internet; fotos e fontes estão dentro do arquivo.

## Como apresentar

| Tecla | Ação |
|---|---|
| → · espaço · clique na borda direita | Avança |
| ← · clique na borda esquerda | Volta |
| N | Mostra ou esconde as notas do apresentador (o que falar e o que falta confirmar) |
| F | Tela cheia |
| 1 a 8 | Pula para a cena |

Leve uma seringa com água e corante vermelho para levantar na cena 1.

## As cenas

1. **Doxorrubicina:** a seringa enchendo de vermelho, o paciente e o ritmo de 21 dias.
2. **De onde vem o vermelho:** *Streptomyces peucetius*, a terra do Castel del Monte, os nomes daunorrubicina e Adriamicina, o caminho até Sombrio.
3. **A parte que dá a cor é a parte que entra no DNA:** a molécula e a intercalação.
4. **Por que 21 dias:** a queda e a volta dos neutrófilos (curva ilustrativa, sem valores).
5. **O coração tem um orçamento:** cada sessão gasta um pedaço de um limite para a vida inteira.
6. **Quem se protege de quem:** a foto da aplicação, anotada.
7. **Silêncio:** a seringa esvazia sozinha, sem fala.
8. **03/12:** a próxima sessão e a frase final.

## O que confirmar com a Cláudia

As telas marcam estes pontos com uma etiqueta tracejada.

- [ ] Quanto tempo durou a aplicação (para ajustar a cena 7)
- [ ] Quantas sessões de doxorrubicina ele já fez, e se o protocolo alterna com outros remédios
- [ ] Por quantos dias o tutor deve usar luvas para recolher urina e fezes
- [ ] Data da próxima sessão (a página supõe 03/12)
- [ ] Autorização para usar a foto da aplicação (o rosto está coberto pelos EPIs)

## Como mudar

- Textos e cenas: `src/page.html`. Os ajustes das animações (duração do silêncio, quanto a seringa aparece cheia, número de faixas do coração) estão no bloco `CONFIG`, no começo do script.
- Foto recortada: `img/`.
- Depois de mudar, rode `python3 tools/build.py` para gerar os dois arquivos de `dist/`.
