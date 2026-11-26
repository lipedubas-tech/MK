"""Gera o PDF de briefing da animação do coelho com miíase (25/11/2026).

Uso: python3 tools/briefing.py estagio/animacao-miiase-coelho  (precisa de reportlab e Pillow)
"""
import io
import sys

from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image as RLImage, KeepTogether, PageBreak, Paragraph,
                                SimpleDocTemplate, Spacer, Table, TableStyle)

PASTA = sys.argv[1]  # estagio/animacao-miiase-coelho
SAIDA = f"{PASTA}/briefing-animacao-miiase-coelho.pdf"

D = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("DV", D + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", D + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DVM", D + "DejaVuSansMono.ttf"))

TINTA = colors.HexColor("#1f2328")
CINZA = colors.HexColor("#5b636b")
ACENTO = colors.HexColor("#8a3b12")
FUNDO = colors.HexColor("#f3efe8")

st = {
    "t": ParagraphStyle("t", fontName="DVB", fontSize=20, leading=25, textColor=TINTA, spaceAfter=4),
    "sub": ParagraphStyle("sub", fontName="DV", fontSize=10.5, leading=14, textColor=CINZA, spaceAfter=14),
    "h": ParagraphStyle("h", fontName="DVB", fontSize=13.5, leading=18, textColor=ACENTO, spaceBefore=14, spaceAfter=6),
    "p": ParagraphStyle("p", fontName="DV", fontSize=9.6, leading=13.4, textColor=TINTA, spaceAfter=5, alignment=TA_LEFT),
    "li": ParagraphStyle("li", fontName="DV", fontSize=9.5, leading=13, textColor=TINTA, leftIndent=12, bulletIndent=2, spaceAfter=3),
    "cel": ParagraphStyle("cel", fontName="DV", fontSize=7.9, leading=9.9, textColor=TINTA),
    "celb": ParagraphStyle("celb", fontName="DVB", fontSize=7.9, leading=9.9, textColor=TINTA),
    "cab": ParagraphStyle("cab", fontName="DVB", fontSize=8.6, leading=11, textColor=colors.white),
    "mono": ParagraphStyle("mono", fontName="DVM", fontSize=8.2, leading=11.5, textColor=TINTA, backColor=FUNDO,
                           borderPadding=8, spaceBefore=4, spaceAfter=8),
    "leg": ParagraphStyle("leg", fontName="DV", fontSize=8.8, leading=12, textColor=TINTA, spaceAfter=10),
}


def P(t, s="p"):
    return Paragraph(t, st[s])


def lista(itens):
    return [Paragraph(i, st["li"], bulletText="•") for i in itens]


def tabela(linhas, larguras, cab=True):
    t = Table(linhas, colWidths=larguras, repeatRows=1 if cab else 0)
    estilo = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#c9c2b6")),
        ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    if cab:
        estilo += [("BACKGROUND", (0, 0), (-1, 0), ACENTO)]
    t.setStyle(TableStyle(estilo))
    return t


def foto(caminho, larg_max, alt_max):
    im = ImageOps.exif_transpose(Image.open(caminho)).convert("RGB")
    im.thumbnail((1400, 1400))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=82)
    buf.seek(0)
    w, h = im.size
    k = min(larg_max / w, alt_max / h)
    return RLImage(buf, width=w * k, height=h * k)


def rodape(c, doc):
    c.saveState()
    c.setFont("DV", 7.5)
    c.setFillColor(CINZA)
    c.drawString(2 * cm, 1.2 * cm, "Briefing: animação do coelho com miíase · estágio na Mundo Animal · 25/11/2026")
    c.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"página {doc.page}")
    c.restoreState()


H = []
H.append(P("Miíase em coelho: o atendimento de emergência", "t"))
H.append(P("Briefing da animação 3D · caso de 25/11/2026, perto das 18h · montado a partir do relato do Felipe, "
           "das 8 fotos do atendimento e do questionário respondido por ele em 25/11", "sub"))

# 1
H.append(P("1. Objetivo", "h"))
H.append(P("Mostrar à banca da defesa de estágio, em cerca de 100 segundos, <b>como a miíase acontece</b> e <b>como foi o "
           "atendimento de emergência</b> deste coelho: tricotomia, retirada das larvas com álcool, soro pela veia da "
           "orelha, rifamicina e internamento. O público é a banca (técnica) e os colegas. A prioridade é a exatidão e a "
           "clareza; o efeito visual vem depois."))
H.append(P("Por que este caso: é o <b>único coelho do estágio</b>, e a Cláudia, que normalmente não atende coelhos, "
           "atendeu porque ele sofria muito. Chegou como emergência na hora de ir embora."))
H.append(P("<b>A ideia central (Felipe, 25/11): o pelo escondia.</b> Por fora, ele parecia um coelho normal e fofo. As "
           "feridas e as larvas estavam por baixo do pelo longo e denso, no dorso, na garupa e na região genital. O pelo "
           "provavelmente teve dois papéis: <b>escondeu as feridas</b>, e a tutora só percebeu quando o quadro já estava "
           "grave; e <b>segurou umidade e sujeira perto da pele</b>, sobretudo na região perineal, o que atrai a mosca "
           "<b>[interpretação do Felipe, a confirmar com a Cláudia]</b>. Só na clínica, quando a máquina tirou o pelo, "
           "apareceu o tamanho real das lesões. A animação é construída em volta dessa revelação. "
           "Frase do slide: <b>\"O pelo escondia. A tricotomia mostrou.\"</b>"))
H.append(P("<b>Decisões do Felipe no questionário (25/11)</b>"))
H.append(tabela([
    [P("Pergunta", "cab"), P("Resposta", "cab")],
    [P("O que mostrar", "celb"), P("O atendimento completo <b>mais a causa</b> (como a mosca e as larvas fazem as feridas).", "cel")],
    [P("Aparência", "celb"), P("<b>Igual ao paciente</b>: pelo longo, cinza-escuro acastanhado e branco, com volume de pelo.", "cel")],
    [P("Ordem do soro", "celb"), P("<b>Soro depois</b> da tricotomia e da limpeza. As fotos mostram o equipo já ligado às 18h35 e "
                                   "a rifamicina às 18h38, então a rifamicina vem <b>depois</b> do soro.", "cel")],
    [P("Larvas e feridas", "celb"), P("<b>Mais realistas</b>: larvas com segmentos e movimento, feridas com crostas. Pede aviso à banca.", "cel")],
    [P("Retirada das larvas", "celb"), P("Antes da clínica, a tutora foi a uma agropecuária e passaram um <b>spray prata</b>, que não "
                                         "alcançou várias feridas com larvas (foi ineficaz). Na clínica, a <b>Cláudia passava álcool "
                                         "e ia tirando</b> a maioria; as larvas que ficavam <b>mais acima</b>, o Felipe tirou "
                                         "<b>com luva, com o dedo</b>.", "cel")],
    [P("Sedação", "celb"), P("<b>Não.</b> Só contenção física.", "cel")],
    [P("Onde estavam as feridas", "celb"), P("<b>Dorso</b>, <b>garupa e base da cauda</b> e <b>região genital e perineal</b>.", "cel")],
    [P("Tricotomia", "celb"), P("Com <b>máquina</b>.", "cel")],
    [P("A revelação", "celb"), P("Por fora, o coelho fica <b>normal e fofo</b> até a tricotomia. Nas cenas 2 a 4, uma <b>lente de "
                                 "transparência</b> mostra as feridas e as larvas por baixo do pelo, sem nada mudar por fora. "
                                 "Na cena 6, a máquina revela o que o pelo escondia (pedido do Felipe, 25/11).", "cel")],
    [P("Fora desta animação", "celb"), P("A foto de 26/11 (como ele vai estar) <b>não entra agora</b>, a pedido do Felipe.", "cel")],
], [4.2 * cm, 12.8 * cm]))

# 2
H.append(P("2. Entregável", "h"))
H += lista([
    "<b>3D no navegador</b>, como a animação da nodulectomia (<font name='DVM'>estagio/animacao-nodulectomia/</font>): "
    "<font name='DVM'>index.html</font> único que abre sem internet (Three.js r128 embutido) e "
    "<font name='DVM'>dist/miiase-coelho.html</font> para publicar (Three.js do cdnjs). Formato 16:9.",
    "<b>Modelo:</b> <font name='DVM'>modelo-3d/rabbit_rigged.glb</font> (\"Rabbit Rigged\", de FourthGreen, Sketchfab, "
    "licença CC BY 4.0). Malha com pele (skinning), 48 ossos (coluna, cauda, 4 patas, pescoço, cabeça, nariz e 3 ossos em "
    "cada orelha) e um clipe de salto de 0,43 s. O crédito precisa aparecer na página (rodapé ou tela de créditos).",
    "<b>Navegação:</b> botões Anterior e Próxima, setas ← →, espaço pausa, <b>Reproduzir tudo</b> (modo contínuo), "
    "<b>F</b> tela cheia, deslizar no celular. Cada cena toca ao entrar.",
    "<b>Modo suave (tecla S):</b> larvas viram pontos claros discretos e os closes das cenas 3, 7 e 8 ficam mais "
    "afastados. Serve para a banca ou a plateia sensível. Começa desligado (versão realista, escolhida pelo Felipe).",
    "<b>Duração</b> no modo contínuo: cerca de 104 s (11 cenas, de 6 a 12 s cada).",
    "<b>Fase 2 (opcional):</b> exportar o modo contínuo para MP4 1920×1080 (Playwright + ffmpeg, H.264 -preset veryfast), "
    "como plano B offline.",
])

# 3
H.append(P("3. Estilo visual", "h"))
H += lista([
    "<b>O paciente:</b> coelho de <b>pelo longo</b>, aparência de angorá ou cabeça-de-leão (raça a confirmar). Corpo e "
    "garupa <b>cinza-escuro acastanhado</b> (#3b3531); áreas <b>cinza-claras</b> (#9b958f) nos flancos; <b>branco</b> "
    "(#ece8e2) na cara, no peito e na frente do corpo, como na foto 8. Pelo molhado e emaranhado em mechas na garupa e na "
    "região perineal (fotos 2 e 3), mas só por baixo da camada de fora.",
    "<b>Pelo longo e volumoso, a peça central:</b> bem mais volume que o modelo original, com a silhueta arredondada e fofa "
    "da foto 8. Até a cena 6 ele <b>cobre por completo</b> as feridas: por fora, nada denuncia o problema. Técnica de "
    "camadas (<i>shells</i>, de 12 a 16 sobre a malha com pele) com uma textura de ruído e duas máscaras: a "
    "<b>máscara de transparência</b> (a lente das cenas 2 a 4, um círculo de bordas suaves em que as camadas de pelo "
    "ficam translúcidas e deixam ver a pele, sem mudar a silhueta) e a <b>máscara de tosa</b> (pintada aos poucos na "
    "cena 6, para o pelo sumir só onde a máquina passa). No celular, use menos camadas.",
    "<b>Poses pelo esqueleto:</b> decúbito esternal com as patas recolhidas (cenas 1 a 9); decúbito dorsal, de barriga "
    "para cima (cena 10, como na foto 5); de cabeça baixa no pote, mastigando (cena 11). Use as orelhas (3 ossos cada) "
    "para dar vida. <b>Não use o clipe de salto</b>: um coelho pulando sugere uma recuperação que ainda não se conhece.",
    "<b>Feridas</b> (pintadas na textura ou em decalques): pele depilada cinza-clara com <b>crostas amareladas</b> "
    "(#c9a85a); pele <b>enrugada, inchada e avermelhada</b> (#b5545c) em volta do ânus e do pênis; bordas úmidas e "
    "escuras. Locais: dorso, garupa e base da cauda, região genital e perineal. <b>Só aparecem pela lente</b> (cenas 2 a "
    "4) <b>ou depois da tosa</b> (cena 6 em diante).",
    "<b>Larvas (realistas):</b> creme (#efe6cf), corpo em fuso com cerca de 11 segmentos e anéis de pequenos espinhos; "
    "a ponta da frente fina, com ganchos bucais escuros; a de trás larga, com os dois espiráculos escuros. Movimento de "
    "contração em onda (shader de vértice, instâncias). Ficam com a ponta da frente <b>para dentro</b> da ferida.",
    "<b>Produtos:</b> o spray prata como película metálica (#b8bcc2) em parte das feridas; a rifamicina como camada "
    "<b>laranja</b> (#e07a1f) que também mancha o pano de amarelo-laranja (fotos 4 e 5); o álcool como borrifo "
    "transparente.",
    "<b>Cenário:</b> mesa de granito (cinza com pintas pretas e bege) com pano branco (cenas 5 a 10); baia do internamento "
    "com manta verde-acinzentada e pote de ração com pellets (cena 11); fundo neutro nas cenas 1 a 4.",
    "<b>Mãos:</b> semitransparentes, só o contorno, para não afirmar se havia luva. A exceção é a cena 8: o dedo com "
    "<b>luva</b>, como o Felipe contou.",
    "<b>Legendas:</b> até 2 linhas, em português do Brasil, numa pílula escura legível a 3 m (como na nodulectomia). Os "
    "termos técnicos aparecem na legenda. Rótulos com seta para as estruturas (veia marginal, artéria central da orelha, "
    "espiráculos).",
    "<b>Evitar:</b> sangue escorrendo ou poças de sangue; rostos de pessoas; nome ou marca da clínica; afirmar que ele se "
    "recuperou; mostrar a foto de 26/11.",
])

# 4
H.append(PageBreak())
H.append(P("4. Roteiro das cenas", "h"))
H.append(P("Na ordem real do caso. O que está marcado <b>[a confirmar]</b> sai na legenda de forma neutra, sem afirmar o "
           "detalhe, até a Cláudia ou o Felipe confirmarem."))
cenas = [
    ("1", "Abertura e aviso", "6 s",
     "Fundo escuro. O coelho com o pelo longo e volumoso do paciente, redondo e fofo, deitado em decúbito esternal, "
     "respirando devagar; as orelhas mexem de leve. Por fora, nenhuma ferida aparece. Entra o título e, por 2 s, o "
     "aviso \"Imagens de feridas com larvas · tecla S: modo suave\".",
     "Miíase em coelho (25/11, perto das 18h). Por fora, um coelho normal e fofo"),
    ("2", "Como começa", "9 s",
     "A câmera vai para a garupa e a região perineal; por fora, o pelo continua fofo. Abre-se a <b>lente de "
     "transparência</b> sobre o pelo: por baixo, junto da pele, umidade e sujeira presas entre os pelos. Uma mosca "
     "pousa, entra entre os pelos e deposita grupos de ovos brancos alongados na base do pelo, junto da pele. "
     "Rótulos: \"umidade e sujeira\", \"ovos\".",
     "Por baixo do pelo longo, umidade e sujeira atraem a mosca, que põe os ovos [neste coelho, a confirmar]"),
    ("3", "As larvas", "10 s",
     "Ainda pela lente: os ovos eclodem, as larvas entram na pele e crescem; a pele se abre em feridas com bordas "
     "avermelhadas e crostas, com as larvas de cabeça para dentro e espiráculos para fora. A lente passeia pelo dorso, "
     "pela garupa e base da cauda e pela região genital e perineal. No fim, a lente se fecha e a câmera se afasta: "
     "<b>por fora, o coelho continua igual</b>, fofo.",
     "Por baixo do pelo, as larvas comem o tecido vivo. Por fora, nada muda"),
    ("4", "Antes da clínica", "8 s",
     "Um jato de spray prata deixa uma película metálica sobre o pelo e sobre parte das feridas. Pela lente, várias "
     "feridas ficaram sem o produto, e as larvas continuam se mexendo nelas.",
     "Antes da clínica: spray prata de agropecuária. Não alcançou várias feridas [produto a confirmar]"),
    ("5", "Chegada e contenção", "8 s",
     "Mesa de granito com pano branco. O coelho, ainda fofo por fora, é deitado no pano e contido por mãos (só o "
     "contorno), acordado. Um rótulo discreto: \"muito desidratado\".",
     "Chegada perto das 18h, muito desidratado. Contenção física, sem sedação"),
    ("6", "Tricotomia: a revelação", "12 s",
     "A câmera para na garupa, ainda fofa, por 1 s. A máquina de tosa passa em faixas pelo dorso, pela garupa e pela "
     "região perineal; mechas de pelo longo caem no pano. Cada faixa revela o que o pelo escondia: pele avermelhada, "
     "crostas amareladas, a pele enrugada em volta do ânus e do pênis e as larvas se mexendo (fotos 2 e 3). No fim, a "
     "câmera se afasta e mostra o tamanho real das lesões.",
     "O pelo escondia. A tricotomia mostrou. (Tricotomia com máquina)"),
    ("7", "Álcool e retirada", "12 s",
     "Borrifo de álcool nas feridas. As larvas se agitam e sobem à superfície e são tiradas uma a uma [com pinça ou com "
     "a mão: a confirmar], indo para uma gaze ao lado, que vai enchendo. Sem número na tela: \"muitas larvas\".",
     "Álcool nas feridas e retirada das larvas, uma a uma"),
    ("8", "Com a luva", "8 s",
     "Close nas larvas que ficavam mais acima [na superfície ou mais no alto do corpo: a confirmar com o Felipe]. Um dedo "
     "com luva as retira.",
     "As larvas mais acima: tiradas com o dedo, de luva"),
    ("9", "Acesso na orelha e soro", "12 s",
     "Close na orelha. Rótulos: veia marginal (na borda) e artéria central (no meio, que não é usada). O cateter de "
     "canhão roxo entra na veia marginal, o mandril sai e o esparadrapo fixa. O equipo é conectado e as gotas caem no "
     "gotejador do soro.",
     "Acesso na veia marginal da orelha e soro: ele estava muito desidratado [veia a confirmar]"),
    ("10", "Rifamicina", "9 s",
     "O coelho vira de barriga para cima, como na foto 5. O frasco de rifamicina borrifa as feridas; a camada laranja "
     "cobre a região e mancha o pano de amarelo-laranja (fotos 4 e 5).",
     "Rifamicina spray (rifamicina SV sódica 10 mg/mL) sobre as feridas"),
    ("11", "Internamento", "10 s",
     "Baia do internamento, manta verde-acinzentada. O coelho deitado, com a cabeça no pote de pellets, mastigando; o "
     "equipo sai da orelha, preso com esparadrapo (fotos 7 e 8). Escurece devagar.",
     "18h45: internado, com o soro, comendo"),
]
linhas = [[P("#", "cab"), P("Cena", "cab"), P("Seg.", "cab"), P("Animação", "cab"), P("Legenda na tela", "cab")]]
for n, nome, tempo, anim, leg in cenas:
    linhas.append([P(n, "celb"), P(nome, "celb"), P(tempo.replace(" s", ""), "cel"), P(anim, "cel"), P(leg, "cel")])
H.append(tabela(linhas, [0.9 * cm, 2.9 * cm, 1.1 * cm, 7.9 * cm, 4.2 * cm]))
H.append(Spacer(1, 6))
H.append(P("<b>Total:</b> cerca de 104 s. <b>Trecho sugerido para a defesa</b> (o orçamento das animações já está "
           "perto do limite de 3 a 4 min): as cenas 3 e 6, <b>o escondido e a revelação</b>, cerca de 22 s; com a cena 9 "
           "(o soro), cerca de 34 s. <b>[decisão do Felipe]</b>"))

# 5
H.append(P("5. Ordem de trabalho e critérios de pronto", "h"))
H += lista([
    "<b>Passo 1, o visual base (parar e mostrar):</b> o coelho repintado, com o pelo longo e volumoso cobrindo tudo, "
    "deitado no pano sobre o granito. Gerar capturas de lado, de trás e de cima, <b>mais uma com a lente de "
    "transparência</b> mostrando as feridas por baixo do pelo, e <b>esperar o Felipe aprovar</b> antes de animar.",
    "<b>Passo 2, animação crua de ponta a ponta:</b> as 11 cenas com câmera, poses e legendas, sem acabamento.",
    "<b>Passo 3, acabamento:</b> larvas, tosa progressiva, sprays, cateter e gotejamento, transições e modo suave.",
    "<b>Passo 4 (opcional):</b> o MP4.",
])
H.append(P("<b>Pronto quando:</b> abre sem internet; percorre as 11 cenas por botão, teclado e toque sem erro no console; "
           "dura cerca de 104 s no modo contínuo; o coelho parece normal por fora até a cena 6; é legível a 3 m de um projetor; funciona no Chrome do celular (retrato "
           "e paisagem); o modo suave funciona; e o crédito do modelo (CC BY 4.0) aparece."))

# 6
H.append(P("6. Cuidados", "h"))
H += lista([
    "<b>Exatidão acima do efeito.</b> Tudo o que não veio do relato ou das fotos fica marcado [a confirmar] e sai neutro "
    "na legenda.",
    "<b>Ainda a confirmar com a Cláudia:</b> o nome do spray prata; o que mais foi usado (antiparasitário, antibiótico, "
    "analgesia); o tipo e o volume do soro; o calibre do cateter; a espécie da mosca; a raça do coelho; como ele ficou "
    "depois.",
    "<b>Interpretação a confirmar:</b> que o pelo longo escondeu as feridas da tutora e segurou umidade e sujeira que "
    "atraíram a mosca. É o raciocínio do Felipe; confirme com a Cláudia antes de afirmar na fala. Se o pelo também "
    "impediu o spray prata de chegar às feridas, a legenda da cena 4 não diz.",
    "<b>A confirmar com o Felipe:</b> com o que a Cláudia tirava as larvas depois do álcool (pinça ou mão) e o que "
    "quer dizer \"as que ficavam mais acima\".",
    "<b>Realista, mas sem sangue escorrendo.</b> O Felipe escolheu larvas realistas; o modo suave existe para a banca. "
    "Antes de tocar a animação, avise: \"vou mostrar as feridas\".",
    "<b>Fotos só como referência.</b> As fotos 1, 3 e 5 mostram mãos sem luva; elas não entram na animação.",
    "<b>Sem afirmar a recuperação.</b> A última cena é o que a foto mostra (comendo às 18h45). A foto de 26/11 não "
    "entra nesta versão.",
])

# 7
H.append(KeepTogether([P("7. Prompt inicial para o Claude Code", "h"), P(
    "Leia estagio/animacao-miiase-coelho/briefing-animacao-miiase-coelho.pdf e as fotos em "
    "estagio/animacao-miiase-coelho/referencias/. Use o modelo modelo-3d/rabbit_rigged.glb (CC BY 4.0, FourthGreen; "
    "ponha o crédito na página). Siga o roteiro de 11 cenas na ordem do PDF. Tome como base a estrutura da animação "
    "da nodulectomia (estagio/animacao-nodulectomia: src/, tools/build_page.py, index.html offline com Three.js r128 "
    "embutido). A ideia central é \"o pelo escondia, a tricotomia mostrou\": por fora, o coelho fica normal e fofo até "
    "a cena 6. Comece só pelo Passo 1: repinte o coelho com as cores do paciente, faça o pelo longo e volumoso em "
    "camadas, deite-o no pano sobre o granito, marque as feridas no dorso, na garupa e base da cauda e na região "
    "genital e perineal, visíveis só pela lente de transparência, e me mostre capturas antes de animar. Use só HTML, CSS, JS e Three.js embutidos; nada de internet "
    "no index.html. Tudo o que estiver marcado [a confirmar] sai neutro na legenda.", "mono")]))

# 8
TITULO8 = P("8. Fotos de referência (25/11/2026, celular do Felipe)", "h")
fotos = [
    ("foto1-acesso-na-orelha.jpg", "Foto 1 · 18h33 · O cateter (roxo) entrando na veia da orelha. Pelo longo, cinza-escuro "
     "acastanhado, molhado e emaranhado no dorso. Contenção com as mãos sobre o pano, na mesa de granito."),
    ("foto2-feridas-perineais-depiladas.jpg", "Foto 2 · 18h35 · Região genital e perineal depois da tricotomia e da "
     "limpeza, vista de trás: pelo curto cinza-claro, crostas amareladas, pele enrugada e avermelhada. O equipo já "
     "aparece à esquerda. (original em alta resolução, reenviado pelo Felipe)"),
    ("foto3-feridas-perineais-angulo2.jpg", "Foto 3 · 18h35 · O mesmo, mais de perto: a pele avermelhada e inchada em volta "
     "do ânus e do pênis, mechas de pelo molhado. (original em alta resolução)"),
    ("foto4-apos-rifamicina.jpg", "Foto 4 · 18h38 · Vista de cima: a garupa e a região perineal cobertas pela rifamicina "
     "laranja, que mancha o pano. O equipo sai pela esquerda. (original em alta resolução)"),
    ("foto5-aplicacao-rifamicina-decubito-dorsal.jpg", "Foto 5 · 18h38 · De barriga para cima: o spray de rifamicina, os "
     "dedos afastando a pele, o equipo preso com esparadrapo."),
    ("foto6-frasco-rifotrat.jpg", "Foto 6 · 18h42 · O frasco: Rifotrat spray, rifamicina SV sódica 10 mg/mL, 20 mL."),
    ("foto7-internado-comendo.jpg", "Foto 7 · 18h45 · Internado, sobre a manta verde, com a cabeça no pote de pellets."),
    ("foto8-internado-soro-na-orelha.jpg", "Foto 8 · 18h45 · De lado: a frente branca e o corpo cinza-escuro; o cateter "
     "na orelha preso com esparadrapo, ligado ao equipo."),
]
for i, (nome, leg) in enumerate(fotos):
    H.append(KeepTogether(([TITULO8] if i == 0 else []) + [foto(f"{PASTA}/referencias/{nome}", 15.5 * cm, 9.6 * cm), Spacer(1, 4), P(leg, "leg")]))

doc = SimpleDocTemplate(SAIDA, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.8 * cm,
                        bottomMargin=1.9 * cm, title="Briefing: animação do coelho com miíase",
                        author="Felipe (estágio Mundo Animal)")
doc.build(H, onFirstPage=rodape, onLaterPages=rodape)
print("ok", SAIDA)
