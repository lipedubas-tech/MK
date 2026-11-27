# Site da Mundo Animal: versão de produção (começo em 26/11/2026)

Pedido do Felipe em 26/11: começar a produção do site com o material coletado do Instagram (`../dados-instagram/`, `../identidade-visual/`), inspirado no site do Hospital Veterinário Criciúma (`../../estagio/defesa/site-prototipo/referencia-hospital-criciuma.md`). Prioridades: **identidade visual** e **intuitividade**. Como no site de Criciúma, a **profissional em primeiro plano e as instalações ao fundo**: a foto da Tamiris no pet shop, recortada do reel do Cartão Fidelidade.

**Ainda não está publicado em lugar nenhum.** O protótipo anterior continua em `estagio/defesa/site-prototipo/` (não foi mexido).

## Como abrir

Abra `index.html` no navegador, no computador ou no celular, e mantenha a pasta inteira junta (`css/`, `js/`, `img/`). Sem internet a página funciona; só a letra dos títulos vira a do sistema e o mapa não carrega.

Prévias, na versão limpa (sem as marcações amarelas): `previa-computador.png`, `previa-celular.png` e `previa-pagina-inteira.jpg`.

## Itens a confirmar (botão amarelo no canto)

Tudo o que ainda depende da clínica aparece **marcado em amarelo**. O botão "Itens a confirmar" no canto inferior esquerdo mostra ou esconde as marcações. Escondidas, a página fica como ficaria publicada: é a versão para mostrar à Tamiris. Para publicar, tire `class="revisao"` da primeira linha do `index.html` e apague o botão `.alternar-revisao`.

## Identidade visual

| Elemento | De onde vem | No site |
|---|---|---|
| Verde-musgo `#1f3315` e dourado `#b09759` | Emblema atual (globo com o cão) | Abertura, cartão fidelidade e rodapé; anel dourado em volta das fotos |
| Globo com meridianos | O "mundo" do emblema | Desenhado em dourado atrás da foto da Tamiris (a linha se desenha ao abrir a página) |
| Verde `#068d50` e ícones amarelos em círculo verde | Capas dos destaques do Instagram | Faixa de diferenciais e ícones dos serviços |
| Verde vivo `#39be34` | Post "Nossos serviços" | Só no botão do WhatsApp sobre o verde-musgo, com texto verde-musgo |
| Creme `#eee5cd` | Fundo do emblema | Seção "Desde 2005", a última da página |
| Patinhas verde-água | Fundo dos posts | Fundo da seção de serviços |
| Painel xadrez verde e branco | Painel do "Pet do dia" | Fundo da seção "Pet do dia", em tom claro |
| Marcellus (títulos) e Nunito (texto) | Serifada romana do emblema e sans arredondada dos posts | Google Fonts |

Cores e letras são aproximações (ver `../identidade-visual/identidade-visual.md`). O emblema no topo é um recorte da foto de perfil do Instagram (baixa resolução): **trocar pelo logo em vetor** quando a clínica mandar.

## Seções (de cima para baixo)

1. **Barra de contato:** WhatsApp, endereço e Instagram, sempre no topo (como em Criciúma).
2. **Menu fixo:** Serviços, Estrutura, Equipe, Dúvidas, Contato e o botão **Agendar horário**. No celular vira o botão "Menu".
3. **Abertura:** "Quem é da família é cuidado aqui.", botões **Chamar no WhatsApp** e **Agendar horário**, o telefone para quem prefere ligar e a foto da Tamiris com a etiqueta "Peça o seu cartão fidelidade". No celular, a foto aparece logo depois do título.
4. **Diferenciais:** exames de sangue na clínica, raio-X e ultrassom, internação, banho e tosa, busca e entrega.
5. **O que o seu pet precisa hoje?** O visitante toca na necessidade e sai com a mensagem de WhatsApp pronta (ou vai para o agendamento com o serviço já escolhido).
6. **Serviços:** clínica veterinária e pet shop e estética, com os produtos e marcas que aparecem nos reels.
7. **Por dentro da clínica:** 9 ambientes num mosaico; tocar abre a foto maior.
8. **Quem cuida do seu pet:** Tamiris, Dra. Cláudia e Dr. Rangel.
9. **Cliente da casa ganha mais:** o cartão fidelidade (desenhado com carimbos de patinha) e o primeiro banho grátis com a vacinação completa.
10. **Pet do dia:** convite para seguir o Instagram.
11. **Agendar horário:** o formulário do protótipo, agora com a opção de busca e entrega no banho e tosa.
12. **Dúvidas frequentes:** 6 perguntas.
13. **Venha nos visitar:** endereço, WhatsApp, telefone fixo, horário, **Como chegar** e o mapa do Google.
14. **Desde 2005 no centro de Sombrio:** a fachada e a história (com o Rangel). Fica por último, a pedido do Felipe (26/11), logo antes do rodapé.
15. **Rodapé** e o **botão fixo do WhatsApp** em todas as telas.

## Fotos (`img/`)

| Arquivo | Origem |
|---|---|
| `equipe-tamiris.jpg`, `equipe-tamiris-rosto.jpg` | Captura do reel do Cartão Fidelidade enviada pelo Felipe em 26/11 (recortada sem a barra do celular e sem a legenda) |
| `fachada.jpg` | Foto enviada pelo Felipe em 26/11 (866 px de largura). Mostra também a placa lateral com os telefones. Se veio do Google Maps, confirmar quem tirou antes de publicar |
| `recepcao.jpg`, `pet-shop.jpg`, `sala-de-espera.jpg`, `raio-x.jpg`, `centro-cirurgico.jpg`, `banho-e-tosa.jpg` | Fotos cedidas, tiradas da defesa da Yasmin (2025), que dispensou o crédito |
| `consultorio.jpg`, `laboratorio.jpg` | Fotos do Felipe no estágio (`estagio/fotos/dia-24-11/`, `geral/`) |
| `internacao.jpg` | Filhotes comendo na baia, foto do Felipe escolhida por ele para a internação (26/11) |
| `pet-*.jpg` | Fotos de exemplo do estágio, as mesmas do protótipo |
| `emblema.png`, `favicon.png`, `apple-touch-icon.png` | Recorte circular da foto de perfil do Instagram |

O letreiro da fachada ainda tem o logo antigo (filhote de golden); o site usa o emblema novo. Não foi preciso baixar nada do Instagram.

## Black Friday (27/11)

Pedido do Felipe: a chefa está gravando vídeos da Black Friday, e o site ganhou uma campanha para mostrar a ela.
- **Faixa preta no topo**, "Black Friday na Mundo Animal: veja as ofertas", que leva à seção.
- **Seção "Black Friday"** logo depois dos diferenciais, em preto e dourado (o dourado do emblema): três ofertas (rações, medicações e banho e tosa), botão "Quero as ofertas" no WhatsApp e uma moldura de celular para o vídeo.
- **Some sozinha em 01/12** (atributo `data-ate` na faixa e na seção).
- **Falta:** as ofertas reais, até quando valem e o vídeo. Para pôr o vídeo, troque o texto dentro de `.bf-tela` por `<video src="img/black-friday.mp4" controls playsinline></video>`.

## Correções do Felipe (26/11)

- A clínica **não faz anestesia inalatória**: saiu do texto das cirurgias, que agora diz "Das mais simples às mais complexas, com todo o cuidado e monitoração".
- **Fluidoterapia é o soro:** ficou só "soro" na internação.
- **Especialistas:** novo item, "vários especialistas cadastrados na clínica", com quimioterapia e ortopedia.
- **Banho e tosa, rações e medicações:** textos novos ("os melhores shampoos e condicionadores", "todas as linhas de ração", "medicações para todas as situações, em opções que cabem no seu bolso"). Os nomes de marcas saíram.
- **Equipe:** a Cláudia ficou só como clínica geral, e o Thiago saiu.
- **Horário:** de segunda a sexta, das 8h às 12h e das 13h às 18h; sábado, das 8h às 12h; domingo fechado. Está no contato, na barra do topo, nos horários do agendamento e nos dados para o Google.

## Antes de publicar: o que a clínica precisa confirmar

- **Tamiris:** a função dela e a autorização para usar a foto e o nome.
- **Veterinários:** autorização, fotos de rosto e CRMV de cada um; **responsável técnico** com CRMV no rodapé.
- **Urgências:** a clínica atende fora do horário? Se sim, vale uma faixa como a de Criciúma.
- **Telefone fixo (48) 3533-4232:** lido na placa da fachada de 2025.
- **Ano de abertura:** o Instagram diz "22 anos"; desde 2005 seriam 21.
- **Texto da história:** aprovação do Rangel.
- **Cartão fidelidade:** como funciona (carimbos e prêmio). O desenho com 10 carimbos é ilustrativo.
- **Primeiro banho grátis com vacinação completa:** a promoção de nov/2025 ainda vale?
- **Especialistas:** a lista completa das áreas (hoje o site cita quimioterapia e ortopedia).
- **Busca e entrega:** área atendida e se há taxa.
- **Orientações e respostas das dúvidas:** revisão da veterinária.
- **Agendamento:** dias e horários reais e para onde vão os pedidos (as opções estão no LEIAME do protótipo). Hoje só o WhatsApp chega à clínica.
- **Fotos de pacientes:** trocar as de exemplo por fotos do Instagram, com autorização dos tutores.
- **Perfil no Google** com avaliações (o link já está no site).

## Para publicar (quando a clínica aprovar)

O site é estático (HTML, CSS e JS, sem servidor). Dá para publicar de graça no GitHub Pages, Netlify ou Cloudflare Pages, com um domínio como `mundoanimalsombrio.com.br` (registro no Registro.br, cerca de R$ 40 por ano).
