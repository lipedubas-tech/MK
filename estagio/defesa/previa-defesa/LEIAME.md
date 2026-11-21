# Prévia da defesa inteira (21/11/2026, às 19h41)

`previa-defesa.pdf` mostra a defesa de ponta a ponta, **na ordem do roteiro**, com uma página por slide (26 páginas). Serve para você ver o conjunto antes de decidir.

## Como ler

Cada página tem, no alto, três informações:
- o **bloco do roteiro** e o **tempo previsto**;
- uma etiqueta de **origem** da imagem:
  - 🟢 **protótipo:** o slide novo, em frase-afirmação e prova (`prototipo/`);
  - ⚪ **apresentação atual:** o slide como está hoje em `estagio/apresentacao/`, ainda sem mudança;
  - 🔵 **peça pronta:** Odisseu, o corpo do estágio, a animação da quimio;
  - 🟠 **falta fazer:** o slide ainda não existe;
- em letra pequena, **o que falta** naquele slide.

## O que a prévia mostra

| Origem | Páginas |
|---|---|
| Protótipo | 9 (Rangel, dia 1, Katita, Bob, quimio, o par fetos/filhotes, esporotricose, fecaloma) |
| Apresentação atual | 12 (capa, identificação, serviços, ambientes, equipamentos, atividades, Katita em 3D e pós-operatório, criocirurgia, castração e nodulectomia, dificuldades, considerações) |
| Peça pronta | 4 (Odisseu na abertura e no fechamento, o corpo do estágio, a quimio) |
| Falta fazer | 1 (a segunda eutanásia, se você quiser um slide próprio) |

**O que salta aos olhos no conjunto:**
- A diferença entre os slides 🟢 e os ⚪ é visível. Os atuais têm título-rótulo e mais texto.
- Os slides de serviços e ambientes (páginas 5 e 6) ainda usam as fotos da Yasmin.
- As páginas 18 e 20 repetem o mesmo slide 17 atual (castração e nodulectomia juntas). O roteiro separa os dois.

## Como refazer

```bash
soffice --headless --convert-to pdf --outdir /tmp/atual estagio/apresentacao/Defesa-de-Estagio-Felipe.pptx
pdftoppm -r 110 -png /tmp/atual/Defesa-de-Estagio-Felipe.pdf /tmp/atual/a
python3 estagio/defesa/previa-defesa/gerar_previa.py /tmp/atual <captura-da-quimio.png>
```

A lista das páginas fica em `PAGINAS`, dentro de `gerar_previa.py`. Quando um slide mudar, basta trocar a imagem e a etiqueta.
