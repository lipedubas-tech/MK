# Teste offline e plano B (P13 e o item "Plano B offline")

> **Execução de 20/11/2026, às 21h41.** As 7 peças da defesa foram abertas num Chromium sem rede, pelo Playwright em modo offline. Toda requisição para fora do computador era bloqueada e registrada. A tela era de 1280 × 720, o tamanho típico de um projetor.
>
> Nenhuma peça foi alterada. O roteiro do teste ficou fora do repositório. Para refazer, peça "rodar o teste offline de novo".

## Resultado

| Peça | Arquivo | Abriu? | Tempo até carregar | Pedidos à internet | Imagens | Fontes | Erros no console |
|---|---|---|---|---|---|---|---|
| **Katita 3D** | `katita-3d/dist/katita-offline.html` | ✅ | 0,6 s | nenhum | 15 de 15 | do sistema | nenhum |
| **Castração (OSH) 3D** | `castracao-osh/osh-3d.html` | ✅ | 2,0 s | nenhum | 1 de 1 | do sistema | nenhum |
| **Nodulectomia 3D** | `estagio/animacao-nodulectomia/index.html` | ✅ | 3,3 s | nenhum | — | do sistema | nenhum |
| **Quimio, "A seringa vermelha"** | `estagio/quimioterapia/dist/quimio-offline.html` | ✅ | 0,15 s | nenhum | 1 de 1 | Archivo e IBM Plex Mono, embutidas no arquivo, carregaram | nenhum |
| **Linha do tempo** | `estagio/defesa/linha-do-tempo/index.html` | ✅ | instantâneo | nenhum | 119 de 119 caminhos existem | do sistema | nenhum |
| **Corpo do estágio** | `estagio/defesa/corpo-do-estagio/index.html` | ✅ | instantâneo | nenhum | 15 de 15 fotos ao clicar nos 19 pontos | do sistema | nenhum |
| **Odisseu e Argos** | `estagio/defesa/odisseu-argos/slides.html` | ✅ | 0,2 s | nenhum | 1 de 1 | do sistema | nenhum |

**Conclusão: as 7 peças funcionam sem internet.** As três animações 3D desenharam a cena no teste, numa placa de vídeo simulada, então um notebook comum deve dar conta.

## Pontos de atenção

1. **A Katita abre na página do relato de caso, não na animação.** Para chegar à animação, clique na aba **"2. A cirurgia"** antes de começar a apresentar. No dia, deixe essa aba já aberta.
2. **As fotos da linha do tempo e do corpo do estágio vêm de outras pastas do repositório**, por caminhos como `../../fotos/`. Se você copiar só a página para um pendrive, as fotos somem. **Copie a pasta `estagio/` inteira e a `katita-3d/`**, ou leve o PDF da linha do tempo, que já é independente.
3. **O corpo do estágio:** uma foto grande, a da quimio, levou cerca de 2 s para aparecer depois do clique. Clique uma vez em cada ponto antes da defesa, para o navegador guardar as fotos.
4. **Odisseu:** com a tela de 1280 × 720, o fim do texto da variante de abertura fica cortado ("…e o cão morre em seguida"). Use a tela cheia (F11) ou teste no projetor da sala.
5. **A criocirurgia não tem versão offline.** Ela existe só no claude.ai. Sem internet, use a foto do spray (`fotos/dia06/01-criocirurgia-spray.jpg`), como já propõe `tempo-animacoes.md`.

## A duração da Katita (o que faltava no P12)

A duração de cada etapa está no código (`katita-3d/src/app.js`, a lista `DUR`), na velocidade normal:

| Etapa | 1 | 2 | 3 | 4 | 5 | 6 | 7 | **Total** |
|---|---|---|---|---|---|---|---|---|
| Segundos | 8 | 8 | 14 | 11 | 14 | 12 | 11 | **78 s (1 min 18 s)** |

Ao tocar só as etapas propostas no P12 (2, 3, 5 e 6), a soma é **48 s**. Fica abaixo dos 60 a 75 s previstos, e isso sobra para você falar por cima ou pausar.

---

## Plano B: o que gravar e levar

Ordem de segurança: **1) as páginas offline no notebook** → **2) os vídeos gravados** → **3) os PDFs e as imagens dentro do `.pptx`**.

| Peça | Vídeo (trecho do roteiro) | PDF ou imagem | Já existe? |
|---|---|---|---|
| Katita 3D | Etapas 2, 3, 5 e 6, cerca de 48 s | As 4 capturas em `estagio/apresentacao/capturas-3d/`, que já estão no slide 11 | ✅ imagens; ❌ vídeo |
| Castração (OSH) | Cenas 4, 6 e 8, cerca de 36 s | Prévias em `castracao-osh/previas/` | ✅ imagens; ❌ vídeo |
| Nodulectomia | Cenas 3, 5 e 7, cerca de 27 s | — | ❌ |
| Quimio | A abertura e a cena "21 dias", cerca de 50 a 60 s | — | ❌ |
| Criocirurgia | — | A foto do spray | ✅ |
| Linha do tempo | Não precisa | `linha-do-tempo/linha-do-tempo.pdf` | ✅ |
| Corpo do estágio | Não precisa | `corpo-do-estagio/previa-estatica.png` | ✅ |
| Odisseu | Não precisa | `odisseu-argos/previa-*.png` | ✅ |

**Proposta para uma próxima execução:** gravar os 4 vídeos dos trechos (Katita, OSH, nodulectomia e quimio) automaticamente, pelo navegador, em `estagio/defesa/plano-b/videos/`. Assim eles podem entrar no `.pptx` como vídeo. Cada um deve ter de 2 a 6 MB. **[decisão sua: vale o espaço no repositório?]**

---

## Checklist do dia da defesa

**Na véspera**
- [ ] Copiar para o notebook **e** para um pendrive: as pastas `estagio/` e `katita-3d/`, o `castracao-osh/osh-3d.html` e o `.pptx` final.
- [ ] Abrir cada peça uma vez **com o wi-fi desligado**.
- [ ] Abrir o corpo do estágio e clicar em todos os pontos.
- [ ] Carregar o notebook. Levar o carregador e um adaptador HDMI.

**Na sala, 15 min antes**
- [ ] Ligar o projetor e testar a resolução. Abrir Odisseu em tela cheia e ver se o texto cabe.
- [ ] Abrir as abas na ordem do roteiro: Katita, já na aba "2. A cirurgia" → quimio → OSH → nodulectomia → corpo do estágio.
- [ ] Deixar cada animação parada na primeira cena do trecho.
- [ ] Desligar as notificações e a economia de energia (a tela não pode apagar).
- [ ] Testar o passador de slides e as teclas (→ avança na quimio; "Próximo" na OSH e na nodulectomia).

**Se algo falhar na hora**
- Se a animação não abrir, use a imagem que já está no slide e conte em uma frase. Não perca mais de 10 s tentando.
- Se o notebook falhar, use o `.pptx` no computador da sala, pelo pendrive. As capturas da Katita já estão dentro dele.

## O que depende de você

1. **Gravar os vídeos do plano B no repositório?** São 4 vídeos, de cerca de 10 a 25 MB no total.
2. **Testar no notebook que você vai levar**, de preferência no projetor da sala. O teste daqui usou um computador simulado.

## Reteste de 25/11/2026, às 23h41

Retestei sem internet o que mudou desde 20/11, com o mesmo método (Chromium pelo Playwright, toda requisição para fora bloqueada, tela de 1280 × 720):

| Peça | Arquivo | Abriu? | Pedidos à internet | Erros no console |
|---|---|---|---|---|
| **Nodulectomia 3D, com a cauterização** (PR #43) | `estagio/animacao-nodulectomia/index.html` | ✅ desenhou a cena | nenhum | nenhum |
| **Coelho com miíase 3D** (em construção, passo 1) | `estagio/animacao-miiase-coelho/index.html` | ✅ abertura com o coelho e o crédito do modelo | nenhum | nenhum |
| **Linha do tempo** (agora com 142 fotos) | `estagio/defesa/linha-do-tempo/index.html` | ✅ | nenhum | nenhum; 142 de 142 fotos carregaram |

**Atenção:** `estagio/animacao-nodulectomia/dist/nodulectomia.html` é a versão **para publicar**. Ela busca o three.js e a fonte na internet e, **sem rede, não abre** (erro "THREE is not defined"). No dia, use o `index.html` da mesma pasta.
