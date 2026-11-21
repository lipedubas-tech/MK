# Orçamento de tempo das animações (P12)

> **Execução de 20/11/2026, às 13h41.** O objetivo é que as animações caibam na defesa sem engolir os casos. As durações vieram do **código de cada animação**, que não foi alterado. O que não deu para medir pelo código está marcado para o teste offline (P13).

## Quanto tempo existe

| Bloco | Tempo |
|---|---|
| Parte 1, a clínica (esboço já feito) | cerca de 6 min |
| Parte 2, os casos | cerca de 17 a 20 min |
| Fechamento e considerações | cerca de 2 a 3 min |
| **Total** | **25 a 30 min** |

**Proposta:** as animações juntas ocupam **no máximo 3 a 4 minutos**, o que dá cerca de 20% da Parte 2. Mais do que isso e a defesa vira uma sessão de cinema. A banca quer ouvir você.

## Duração de cada animação inteira

| Animação | Cenas | Duração inteira | Fonte da medida |
|---|---|---|---|
| **Castração (OSH)**: `castracao-osh/osh-3d.html` | 11 | **1 min 56 s** (116 s) | `castracao-osh/3d/src/40-roteiro.js` |
| **Nodulectomia**: `estagio/animacao-nodulectomia/index.html` | 10 | **1 min 43 s** (103 s). Se o PR #43 da cauterização for juntado, passa para cerca de 1 min 47 s | `estagio/animacao-nodulectomia/src/app.js` |
| **Quimio, "A seringa vermelha"**: `estagio/quimioterapia/dist/quimio-offline.html` | 8 cenas, 25 passos com clique | **cerca de 4 min**, no ritmo de quem apresenta | LEIAME da quimio |
| **Katita 3D**: `katita-3d/dist/katita-offline.html` | 7 etapas | **1 min 18 s** (78 s; medido em 20/11 às 21h41, P13). Toca sozinha ou etapa por etapa | `katita-3d/src/app.js` (lista `DUR`: 8, 8, 14, 11, 14, 12 e 11 s) |
| **Criocirurgia** (2D e 3D) | 7 passos | **a medir**. Existe só no claude.ai, sem versão offline no repositório | — |

## Trecho proposto de cada uma (você decide)

### Katita: 48 s tocando sozinha, até cerca de 75 s se você pausar para falar (a mais longa, porque é o caso principal)
- **Medido no P13:** as etapas 2, 3, 5 e 6 somam 8 + 14 + 14 + 12 = **48 s** na velocidade normal.
- **Entram** a etapa 2 (a lesão em Y), a 3 (a osteotomia do olécrano), a 5 (placas e parafusos) e a 6 (banda de tensão), avançando no seu ritmo enquanto fala.
- **Ficam de fora** a etapa 1 (o esqueleto, que você pode substituir pelo raio-X de antes) e a 7 (o fechamento).
- **Dica:** o raio-X real de antes e depois, nos slides 8 e 10, já conta metade da história. A animação mostra só o que o raio-X não mostra: como as peças entram.

### Castração (OSH): cerca de 35 s
| Cena | Duração | Por quê |
|---|---|---|
| 4. Localizar o útero | 11 s | mostra onde estavam os fetos |
| 6. Pedículo ovariano (técnica das três pinças) | 13 s | é o passo técnico central |
| 8. Corpo do útero | 12 s | completa a retirada |
| **Total** | **36 s** | |
- **Ficam de fora** a abertura, o preparo, a incisão, o "outro lado", a hemostasia, a sutura e o pós-operatório.
- **Atenção:** a animação **não mostra os fetos mumificados**. Se o par 17/11 → 19/11 for usado, logo depois da animação entra um slide com a frase e, se houver, a foto real. **[decisão sua]**

### Nodulectomia: cerca de 27 s
| Cena | Duração | Por quê |
|---|---|---|
| 3. Marcação (incisão elíptica com margem) | 8 s | mostra o "por que a margem" |
| 5. Dissecção pelo tecido sadio | 10 s | é o cuidado principal com um nódulo infeccionado |
| 7. Retirada em bloco | 9 s | o resultado |
| **Total** | **27 s** | |
- Se o PR #43 entrar, dá para trocar a cena 5 pela 8 (cauterização, cerca de 12 s), porque foi a hemostasia que você viu.

### Quimio, "A seringa vermelha": cerca de 50 a 60 s
- **Entram** a abertura (a seringa enchendo de vermelho, com 2 passos) e a cena "O intervalo é o tempo da medula voltar" (o porquê dos 21 dias, com 3 passos).
- **Ficam de fora** a origem da molécula, o DNA, o coração, a proteção, o "silêncio" e o fim. São excelentes, mas viram material para as perguntas da banca, não para a fala.
- **Alternativa:** se você quiser destacar a segurança (paramentação e vesicante), troque o "ciclo" pela cena "proteção", com 4 passos.

### Criocirurgia: 0 a 20 s
- Sem versão offline, o mais seguro é **usar a foto real do spray** (`fotos/dia06/01-criocirurgia-spray.jpg`) e contar os 7 passos falando.
- Se quiser a animação, ela precisa ser trazida para o repositório e testada offline. Isso pode entrar no P13.

## Somando

| Animação | Trecho |
|---|---|
| Katita | 48 a 75 s |
| OSH | 36 s |
| Nodulectomia | 27 s |
| Quimio | 50 a 60 s |
| Criocirurgia | 0 a 20 s |
| **Total** | **cerca de 2 min 40 s a 3 min 40 s** ✅ dentro do orçamento (revisto em 21/11 com a Katita medida) |

## Como mostrar sem perder tempo

- **Abrir as animações antes**, cada uma numa aba, já na cena certa. Trocar de aba na hora leva 2 segundos; abrir um arquivo leva 20.
- **Falar por cima.** As animações têm legenda, mas a banca deve ouvir você, e não ler.
- **Corte de segurança:** se o tempo apertar, as primeiras a sair são a criocirurgia e a nodulectomia.

## O que depende de você

1. Aprovar ou mudar os trechos acima.
2. A OSH sem os fetos: entra um slide logo depois?
3. Juntar o PR #43 (cauterização) muda a escolha da nodulectomia.
4. A criocirurgia: foto ou animação?
