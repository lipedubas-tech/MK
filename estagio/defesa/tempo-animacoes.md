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
| **Nodulectomia**: `estagio/animacao-nodulectomia/index.html` | 10 | **1 min 47 s** (107 s), com a cauterização (PR #43, juntado em 25/11; a cena 8 passou de 8 para 12 s) | `estagio/animacao-nodulectomia/src/app.js` |
| **Quimio, "A seringa vermelha"**: `estagio/quimioterapia/dist/quimio-offline.html` | 8 cenas, 25 passos com clique | **cerca de 4 min**, no ritmo de quem apresenta | LEIAME da quimio |
| **Katita 3D**: `katita-3d/dist/katita-offline.html` | **8 etapas** (a 8ª, "Controle de 30 dias", entrou em 26/11) | **1 min 30 s** (90 s; eram 78 s com 7 etapas). Toca sozinha ou etapa por etapa | `katita-3d/src/app.js` (lista `DUR`: 8, 8, 14, 11, 14, 12, 11 e 12 s) |
| **Coelho com miíase**: `estagio/animacao-miiase-coelho/index.html` | 11 | **1 min 44 s** (104 s). **Em construção** (passo 1 de 26/11); a duração pode mudar | `estagio/animacao-miiase-coelho/src/base.js` *(acrescentado em 25/11, 23h41)* |
| **Criocirurgia** (2D e 3D) | 7 passos | **a medir**. Existe só no claude.ai, sem versão offline no repositório | — |

## Trecho proposto de cada uma (você decide)

### Katita: 48 s tocando sozinha, até cerca de 75 s se você pausar para falar (a mais longa, porque é o caso principal)
- **Medido no P13:** as etapas 2, 3, 5 e 6 somam 8 + 14 + 14 + 12 = **48 s** na velocidade normal.
- **Entram** a etapa 2 (a lesão em Y), a 3 (a osteotomia do olécrano), a 5 (placas e parafusos) e a 6 (banda de tensão), avançando no seu ritmo enquanto fala.
- **Ficam de fora** a etapa 1 (o esqueleto, que você pode substituir pelo raio-X de antes) e a 7 (o fechamento).
- **Novo em 26/11, a etapa 8 ("Controle de 30 dias", 12 s):** a câmera fica de lado, como na radiografia de controle, e o raio-X liga sozinho, com os implantes rotulados. O texto da etapa conta que ela ainda não apoia a pata, que o ortopedista recomendou fisioterapia e que o resultado deve vir depois do fim do estágio. **Se o trecho "e. 30 dias depois" da fala entrar** (pendência 29 do `LEIAME.md`), toque a etapa 8 no lugar da foto: o trecho da Katita passa a ter **60 s** (2, 3, 5, 6 e 8). **[decisão sua]**
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
- **Atualização de 25/11:** o PR #43 foi juntado, e a cena 8 agora mostra a cauterização (12 s). Como foi a hemostasia que você viu, há duas opções **[decisão sua]**:
  - **A, sem mudar:** as cenas 3, 5 e 7, com **27 s**.
  - **B, com a cauterização:** as cenas 3, 7 e 8, com **29 s**. Sai a dissecção e entra o que você viu de verdade.

### Coelho com miíase: cerca de 22 s *(acrescentado em 25/11, 23h41)*
| Cena | Duração | Por quê |
|---|---|---|
| 3. As larvas (por baixo do pelo, nada muda por fora) | 10 s | mostra o que estava escondido |
| 6. Tricotomia ("O pelo escondia. A tricotomia mostrou.") | 12 s | é a revelação, a ideia central do caso |
| **Total** | **22 s** | |
- É o trecho sugerido no projeto da animação. Ela ainda está em construção, então confira de novo quando ficar pronta.
- Tem **modo suave** (tecla S), que deixa as larvas e as feridas menos fortes para a banca.

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
| Katita | 48 a 75 s (60 a 87 s com a etapa 8) |
| OSH | 36 s |
| Nodulectomia | 27 a 29 s |
| Coelho | 22 s |
| Quimio | 50 a 60 s |
| Criocirurgia | 0 a 20 s |
| **Total** | **cerca de 3 min 02 s a 4 min 04 s** (revisto em 25/11, com o coelho e a cauterização). No limite de cima, passa um pouco dos 4 min. **Com a etapa 8 da Katita, soma mais 12 s: de 3 min 14 s a 4 min 16 s** (26/11) |

## Como mostrar sem perder tempo

- **Abrir as animações antes**, cada uma numa aba, já na cena certa. Trocar de aba na hora leva 2 segundos; abrir um arquivo leva 20.
- **Falar por cima.** As animações têm legenda, mas a banca deve ouvir você, e não ler.
- **Corte de segurança:** se o tempo apertar, as primeiras a sair são a criocirurgia e a nodulectomia. Com o coelho, o mais simples para voltar ao orçamento é tirar a criocirurgia (use a foto) ou tocar a Katita sem pausas (48 s).

## O que depende de você

1. Aprovar ou mudar os trechos acima.
2. A OSH sem os fetos: entra um slide logo depois?
3. ~~Juntar o PR #43 (cauterização)~~ **Feito em 25/11.** Agora a escolha é da nodulectomia: opção A (27 s) ou B, com a cauterização (29 s)?
5. O coelho: confirmar o trecho das cenas 3 e 6 quando a animação ficar pronta.
4. A criocirurgia: foto ou animação?
