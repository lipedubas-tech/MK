# Quimioterapia: "3,2 mL"

Sequência de 10 cenas (cerca de 4 minutos) sobre a quimioterapia com doxorrubicina de 12/11/2026, para a defesa do estágio.

- **Página publicada:** https://claude.ai/artifact/2KrnwDdg2sY1Nqw3SReCVJ (só abre logado na conta do Felipe)
- **Versão offline para o dia da defesa:** `dist/quimio-offline.html`. Abre direto no navegador, sem internet; fotos e fontes estão dentro do arquivo.

## Como apresentar

| Tecla | Ação |
|---|---|
| → · espaço · clique na borda direita | Avança |
| ← · clique na borda esquerda | Volta |
| N | Mostra ou esconde as notas do apresentador (o que falar e o que falta confirmar) |
| F | Tela cheia |
| 1 a 9, 0 | Pula para a cena (0 é a cena 10) |

Leve uma seringa com 3,2 mL de água com corante vermelho para levantar na cena 1.

## As cenas

1. **3,2 mL:** a seringa, o paciente e o ritmo de 21 dias.
2. **"6,4 / 2 que dá 3,2":** a conta ouvida na sala, decifrada com o rótulo do frasco.
3. **Na seringa havia quase 9 mL:** a foto não bate com a conta; hipótese da diluição no soro da bolsa.
4. **De onde vem o vermelho:** *Streptomyces peucetius*, a terra do Castel del Monte, os nomes daunorrubicina e Adriamicina, 10.300 km até Sombrio.
5. **A parte que dá a cor é a parte que entra no DNA:** a molécula e a intercalação.
6. **Por que 21 dias:** a queda e a volta dos neutrófilos (curva ilustrativa).
7. **O coração tem um orçamento:** a dose acumulada e o limite de cerca de 180 mg/m².
8. **Quem se protege de quem:** a foto da aplicação, anotada.
9. **Silêncio:** a seringa esvazia sozinha, sem fala.
10. **03/12:** a próxima sessão e a frase final.

## O que confirmar com a Cláudia

As telas marcam estes pontos com uma etiqueta tracejada ("hipótese").

- [ ] Peso do cão e dose: 6,4 mg é 1 mg/kg de um cão de 6,4 kg?
- [ ] A doxorrubicina foi diluída no soro? Em quanto? Para que servia a bolsa de NaCl 0,9% de 250 mL?
- [ ] Quanto tempo durou a aplicação (para ajustar a cena 9)
- [ ] Quantas sessões de doxorrubicina ele já fez, e se o protocolo alterna com outros remédios
- [ ] Os hemogramas de antes das sessões (para trocar a curva ilustrativa da cena 6 pela real)
- [ ] Por quantos dias o tutor deve usar luvas para recolher urina e fezes
- [ ] Data da próxima sessão (a página supõe 03/12)
- [ ] Autorização para usar a foto da aplicação (o rosto está coberto pelos EPIs)

## Como mudar

- Textos e cenas: `src/page.html`. Os números das animações (duração do silêncio, volume da seringa, dose por sessão, limite) estão no bloco `CONFIG`, no começo do script.
- Fotos recortadas: `img/`.
- Depois de mudar, rode `python3 tools/build.py` para gerar os dois arquivos de `dist/`.
