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
| Creme `#eee5cd` | Fundo do emblema | Seções "Desde 2005" e "Venha nos visitar" |
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
7. **Desde 2005 no centro de Sombrio:** a fachada e a história (com o Rangel).
8. **Por dentro da clínica:** 9 ambientes num mosaico; tocar abre a foto maior.
9. **Quem cuida do seu pet:** Tamiris, Dra. Cláudia, Dr. Thiago e Dr. Rangel.
10. **Cliente da casa ganha mais:** o cartão fidelidade (desenhado com carimbos de patinha) e o primeiro banho grátis com a vacinação completa.
11. **Pet do dia:** convite para seguir o Instagram.
12. **Agendar horário:** o formulário do protótipo, agora com a opção de busca e entrega no banho e tosa.
13. **Dúvidas frequentes:** 6 perguntas.
14. **Venha nos visitar:** endereço, WhatsApp, telefone fixo, horário, **Como chegar** e o mapa do Google.
15. **Rodapé** e o **botão fixo do WhatsApp** em todas as telas.

## Fotos (`img/`)

| Arquivo | Origem |
|---|---|
| `equipe-tamiris.jpg`, `equipe-tamiris-rosto.jpg` | Captura do reel do Cartão Fidelidade enviada pelo Felipe em 26/11 (recortada sem a barra do celular e sem a legenda) |
| `fachada.jpg`, `recepcao.jpg`, `pet-shop.jpg`, `sala-de-espera.jpg`, `raio-x.jpg`, `centro-cirurgico.jpg`, `banho-e-tosa.jpg` | Fotos cedidas, tiradas da defesa da Yasmin (2025), que dispensou o crédito. A fachada ainda tem o logo antigo (filhote de golden) |
| `consultorio.jpg`, `laboratorio.jpg` | Fotos do Felipe no estágio (`estagio/fotos/dia-24-11/`, `geral/`) |
| `internacao.jpg` | Filhotes comendo na baia, foto do Felipe escolhida por ele para a internação (26/11) |
| `pet-*.jpg` | Fotos de exemplo do estágio, as mesmas do protótipo |
| `emblema.png`, `favicon.png`, `apple-touch-icon.png` | Recorte circular da foto de perfil do Instagram |

Não foi preciso baixar nada do Instagram: a fachada e os ambientes já estavam no repositório.

## Antes de publicar: o que a clínica precisa confirmar

- **Tamiris:** a função dela e a autorização para usar a foto e o nome.
- **Veterinários:** autorização, fotos de rosto, sobrenome do Thiago e CRMV de cada um; **responsável técnico** com CRMV no rodapé.
- **Horário de atendimento** e se atende urgência fora dele.
- **Telefone fixo (48) 3533-4232:** lido na placa da fachada de 2025.
- **Ano de abertura:** o Instagram diz "22 anos"; desde 2005 seriam 21.
- **Texto da história:** aprovação do Rangel.
- **Cartão fidelidade:** como funciona (carimbos e prêmio). O desenho com 10 carimbos é ilustrativo.
- **Primeiro banho grátis com vacinação completa:** a promoção de nov/2025 ainda vale?
- **Quimioterapia na lista de serviços:** a clínica quer divulgar?
- **Busca e entrega:** área atendida e se há taxa.
- **Orientações e respostas das dúvidas:** revisão da veterinária.
- **Agendamento:** dias e horários reais e para onde vão os pedidos (as opções estão no LEIAME do protótipo). Hoje só o WhatsApp chega à clínica.
- **Fotos de pacientes:** trocar as de exemplo por fotos do Instagram, com autorização dos tutores.
- **Perfil no Google** com avaliações (o link já está no site).

## Para publicar (quando a clínica aprovar)

O site é estático (HTML, CSS e JS, sem servidor). Dá para publicar de graça no GitHub Pages, Netlify ou Cloudflare Pages, com um domínio como `mundoanimalsombrio.com.br` (registro no Registro.br, cerca de R$ 40 por ano).
