"""Protótipo de 5 slides em frase-afirmação + prova (P2).

Uso:  python3 estagio/defesa/prototipo/gerar_prototipo.py

Gera prototipo-5-slides.pptx nesta pasta, sobre o modelo do IFC, sem tocar na
apresentação de estagio/apresentacao/. As funções de desenho são uma cópia
enxuta das de estagio/apresentacao/montar_apresentacao.py (importar aquele
script o faria regerar a apresentação inteira).
"""
import copy
import os
import sys
import tempfile
from itertools import count

from lxml import etree
from PIL import Image, ImageOps
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTAGIO = os.path.dirname(os.path.dirname(AQUI))
REPO = os.path.dirname(ESTAGIO)
MODELO = os.path.join(ESTAGIO, "Modelo Defesa de estágio Técnico.pptx")
EXTRA = "--extra" in sys.argv   # 21/11: gera só os 3 slides novos, sem mexer no arquivo dos 5
SAIDA = os.path.join(AQUI, "prototipo-extra-3-slides.pptx" if EXTRA else "prototipo-5-slides.pptx")
TMP = tempfile.mkdtemp(prefix="prototipo-")
_n = count()

VERMELHO, AZUL, VERDE = "CC0000", "0B5394", "009933"
TEXTO, CINZA, AMBAR = "333333", "666666", "B45309"
VERDE_CLARO, AZUL_CLARO, NEUTRO = "E8F4EC", "E9F0F8", "F1F4F2"
L, R = 0.55, 10.47
CW = R - L


def F(*p):
    return os.path.join(ESTAGIO, "fotos", *p)


def K(nome):
    return os.path.join(REPO, "katita-3d", "img", nome)


def preparar(src, aspecto, caixa=None, foco=(0.5, 0.5), largura_max=1800):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if caixa:
        W, H = im.size
        im = im.crop((int(caixa[0] * W), int(caixa[1] * H), int(caixa[2] * W), int(caixa[3] * H)))
    W, H = im.size
    if W / H > aspecto:
        nw = int(H * aspecto)
        x0 = int((W - nw) * foco[0])
        im = im.crop((x0, 0, x0 + nw, H))
    else:
        nh = int(W / aspecto)
        y0 = int((H - nh) * foco[1])
        im = im.crop((0, y0, W, y0 + nh))
    if im.width > largura_max:
        im = im.resize((largura_max, int(largura_max / aspecto)), Image.LANCZOS)
    caminho = os.path.join(TMP, f"img{next(_n)}.jpg")
    im.save(caminho, quality=86)
    return caminho


def foto(slide, src, x, y, w, h, caixa=None, foco=(0.5, 0.5), raio=0.1, alt=""):
    caminho = preparar(src, w / h, caixa, foco, largura_max=max(600, int(w * 230)))
    pic = slide.shapes.add_picture(caminho, Inches(x), Inches(y), Inches(w), Inches(h))
    geom = pic._element.spPr.find(qn("a:prstGeom"))
    geom.set("prst", "roundRect")
    av = geom.find(qn("a:avLst"))
    if av is None:
        av = etree.SubElement(geom, qn("a:avLst"))
    gd = etree.SubElement(av, qn("a:gd"))
    gd.set("name", "adj")
    gd.set("fmla", f"val {int(raio / min(w, h) * 100000)}")
    pic._element.nvPicPr.cNvPr.set("descr", alt)
    return pic


def texto(slide, x, y, w, h, paras, tam=16, cor=TEXTO, negrito=False, alinh=PP_ALIGN.LEFT,
          ancora=MSO_ANCHOR.TOP, depois=6):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = ancora
    for i, runs in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = alinh
        p.space_after = Pt(depois)
        if isinstance(runs, str):
            runs = [(runs, {})]
        for item in runs:
            t, o = (item, {}) if isinstance(item, str) else item
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = "Calibri"
            f.size = Pt(o.get("tam", tam))
            f.bold = o.get("negrito", negrito)
            f.italic = o.get("italico", False)
            f.color.rgb = RGBColor.from_string(o.get("cor", cor))
    return tb


def pend(t="a confirmar"):
    return (f" [{t}]", {"cor": AMBAR, "italico": True})


def legenda(slide, x, y, w, t, h=0.4, tam=15, alinh=PP_ALIGN.LEFT):
    return texto(slide, x, y, w, h, [t],
                 tam=tam, cor=CINZA, alinh=alinh)


def fonte(slide, t="Fonte: O autor."):
    return texto(slide, L, 7.42, 7.0, 0.3, [t], tam=12, cor=CINZA)


def caixa(slide, x, y, w, h, cor, raio=0.14):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    s.adjustments[0] = min(0.5, raio / min(w, h))
    s.fill.solid()
    s.fill.fore_color.rgb = RGBColor.from_string(cor)
    s.line.fill.background()
    s.shadow.inherit = False
    return s


def notas(slide, t):
    slide.notes_slide.notes_text_frame.text = t.strip()


def titulo(slide, t, tam=30):
    """Título em frase-afirmação: maior que um rótulo, então pode ocupar 2 linhas."""
    for sh in slide.shapes:
        if sh.has_text_frame and Emu(sh.top).inches < 1.0 and sh.text_frame.text.strip():
            p = sh.text_frame.paragraphs[0]
            p.runs[0].text = t
            p.runs[0].font.size = Pt(tam)
            for r in p.runs[1:]:
                r._r.getparent().remove(r._r)
            for extra in sh.text_frame.paragraphs[1:]:
                extra._p.getparent().remove(extra._p)
            sh.text_frame.word_wrap = True
            return sh
    raise ValueError("título não encontrado")


def tirar_corpo(slide):
    for sh in list(slide.shapes):
        if sh.has_text_frame and 1.7 < Emu(sh.top).inches < 2.0 and Emu(sh.width).inches > 9:
            sh._element.getparent().remove(sh._element)


def duplicar(prs, src):
    novo = prs.slides.add_slide(src.slide_layout)
    for sh in list(novo.shapes):
        sh._element.getparent().remove(sh._element)
    mapa = {}
    for rId, rel in src.part.rels.items():
        if rel.reltype.endswith("/image"):
            mapa[rId] = novo.part.relate_to(rel.target_part, rel.reltype)
    bg = src._element.cSld.find(qn("p:bg"))
    if bg is not None:
        novo._element.cSld.insert(0, copy.deepcopy(bg))
    for el in src.shapes._spTree.iterchildren():
        if el.tag in (qn("p:nvGrpSpPr"), qn("p:grpSpPr")):
            continue
        novo.shapes._spTree.append(copy.deepcopy(el))
    for el in novo._element.iter():
        v = el.get(qn("r:embed"))
        if v in mapa:
            el.set(qn("r:embed"), mapa[v])
    return novo


def apagar(prs, slide):
    lst = prs.slides._sldIdLst
    for sldId in list(lst):
        if prs.part.related_part(sldId.rId) is slide.part:
            prs.part.drop_rel(sldId.rId)
            lst.remove(sldId)


# ======================================================================
prs = Presentation(MODELO)
orig = list(prs.slides)
base = duplicar(prs, orig[4])   # quadro do slide "Atividades": fundo, título, linha verde, logo


def novo(t, tam=30):
    s = duplicar(prs, base)
    titulo(s, t, tam)
    tirar_corpo(s)
    return s


# ---- 1. Parte 1: o Rangel (esboço da Parte 1, slide 3)
s = novo("O Rangel queria bois; a região pediu cães e gatos.", tam=28)
foto(s, F("cirurgia-felino", "01-equipe-paramentada-anestesia.jpg"), L, 1.75, 6.2, 5.0,
     alt="O Rangel opera e a Cláudia faz a anestesia, 18/11")
caixa(s, 7.0, 1.75, R - 7.0, 5.0, NEUTRO)
texto(s, 7.25, 2.0, R - 7.5, 4.6, [
    [("2005", {"tam": 40, "negrito": True, "cor": VERDE})],
    ["formado, abriu um consultório para pequenos animais"],
    [("hoje", {"tam": 40, "negrito": True, "cor": VERDE})],
    ["deixou as consultas, mas continua operando"],
], tam=21, depois=10)
legenda(s, L, 6.8, 6.2, "18/11: o Rangel opera; a Cláudia na anestesia. Uso da imagem autorizado.", tam=13)
fonte(s)
notas(s, """
[Frase-afirmação.]
"O Rangel se formou em 2005 e queria trabalhar com grande porte, mas a demanda daqui era de pet. Então abriu um consultório para pequenos animais.
Vinte anos depois, se afastou das consultas pelo peso de ter a vida dos animais nas mãos todos os dias. Hoje ele só vem para operar. Eu vi ele operar um gato no dia 18."
Camada: tese (a clínica é feita de pessoas) e caráter (o desgaste da profissão).
A CONFIRMAR: o ano em que ele deixou as consultas (o diário diz "há 2 anos"; a reflexão, "cerca de 20 anos" de profissão).
Fonte da fala: conversa de 18/11, contada com autorização do Rangel. ~60 s.
""")

# ---- 2. Katita
s = novo("Duas placas e um parafuso uniram o cotovelo partido.", tam=28)
foto(s, K("rx_pre_dp.jpg"), L, 1.75, 4.8, 4.75, foco=(0.35, 0.5), alt="Raio-X antes, 26/10")
foto(s, F("dia02", "12-katita-rx-pos-anotado.jpg"), L + 5.12, 1.75, 4.8, 4.75, alt="Raio-X depois, anotado")
legenda(s, L, 6.55, 4.8, [("Antes", {"negrito": True, "cor": TEXTO}), (" · 26/10 · fratura em Y", {})], tam=16)
legenda(s, L + 5.12, 6.55, 4.8, [("Depois", {"negrito": True, "cor": TEXTO}),
                                 (" · 29/10 · verde: placas e parafuso; vermelho: pino", {})], tam=16)
fonte(s)
notas(s, """
[Frase-afirmação + prova: antes e depois lado a lado.]
"A Katita, 7 anos, 35 kg, foi atropelada. O raio-X mostra o úmero partido em três: os dois côndilos separados do corpo do osso.
O Thiago, ortopedista, operou por mais de 4 horas. Para alcançar a articulação, ele cortou o olécrano e depois o prendeu de volta com pinos e fio.
No raio-X de depois: as duas placas em verde, o parafuso intercondilar embaixo, e o pino da banda de tensão em vermelho."
Em seguida: a animação 3D, etapas 2, 3, 5 e 6 (60–75 s, ver tempo-animacoes.md).
A CONFIRMAR com o Thiago: lado (os raios-X marcam "E"), número de pinos, duração.
""")

# ---- 3. Bob
s = novo("O Bob mostrou que não sentia a pata.")
for i, (cab, olhos, reacao, cor_fundo, cor_txt) in enumerate([
    ("Olhos livres", "ele vê a pata encostar na mesa", "reage", VERDE_CLARO, VERDE),
    ("Olhos tapados", "a pata encosta na mesa", "não reage", "FBEAEA", VERMELHO),
]):
    x = L + i * (CW / 2 + 0.1)
    w = CW / 2 - 0.1
    caixa(s, x, 1.95, w, 3.0, cor_fundo)
    texto(s, x + 0.3, 2.3, w - 0.6, 2.5, [
        [(cab, {"tam": 24, "negrito": True, "cor": AZUL})],
        [(olhos, {"tam": 18})],
        [("→ " + reacao, {"tam": 40, "negrito": True, "cor": cor_txt})],
    ], depois=14, alinh=PP_ALIGN.CENTER)
texto(s, L, 5.4, CW, 1.2, [
    "Pinscher, 13 anos · 2 meses sem apoiar a pata · a lesão antiga do raio-X não explica",
    [("Conclusão do Thiago: problema neurológico, sem cirurgia; bota ortopédica", {}), pend()],
], tam=16, cor=CINZA, alinh=PP_ALIGN.CENTER, depois=4)
fonte(s)
notas(s, """
[Frase-afirmação + prova: o próprio teste. Sem foto no repositório; se a clínica mandar o raio-X de 31/08, ele entra pequeno embaixo.]
"O Bob, um pinscher de 13 anos, não apoiava a pata havia dois meses. Ele tinha quebrado essa pata aos 4 meses.
A Cláudia não fechou o diagnóstico e chamou o Thiago. O teste foi simples: encostar a pata na mesa. Com os olhos livres, ele reagia. Com os olhos tapados, não.
Ou seja: ele não sentia a pata. Era neurológico, não ortopédico. O raio-X mostrava a fratura antiga já calcificada, mas ela não explicava.
Saiu sem cirurgia, com bota ortopédica, porque um cão que não sente a pata pode se machucar sem perceber."
Camada: voz do paciente (principal) e o oculto ao contrário (o raio-X NÃO explicou). ~90 s.
A CONFIRMAR com o Thiago: o nome do teste e a conclusão.
""")

# ---- 4. Quimio
s = novo("Seringa, e não bolsa: ele arrancava o acesso.")
foto(s, F("quimio", "05-quimio-seringa-no-acesso.jpg"), L, 1.75, 6.0, 5.0, foco=(0.5, 0.6),
     alt="Seringa de doxorrubicina no acesso venoso")
foto(s, F("quimio", "01-doxorrubicina-frasco.jpg"), L + 6.3, 1.75, CW - 6.3, 3.1, foco=(0.5, 0.4),
     alt="Frasco de doxorrubicina")
caixa(s, L + 6.3, 5.05, CW - 6.3, 1.7, NEUTRO)
texto(s, L + 6.5, 5.2, CW - 6.7, 1.45, [
    [("17 anos", {"negrito": True, "cor": VERMELHO}), (" de idade", {})],
    [("21 dias", {"negrito": True, "cor": VERMELHO}), (" entre as doses", {})],
], tam=20, depois=6)
fonte(s)
notas(s, """
[Frase-afirmação + prova.]
"Um cão de 17 anos, com sarcoma na cabeça e no pescoço, há 7 meses com a oncologista. A doxorrubicina é vermelha por causa da própria molécula.
Ela é vesicante: se vazar da veia, lesa o tecido. Por isso a aplicação é lenta e o acesso tem que ficar seguro.
E por que seringa, e não bolsa de soro? Porque a dose é pequena e ele arrancava o acesso mordendo."
Em seguida: a animação "A seringa vermelha", abertura e a cena "21 dias é o tempo da medula voltar" (50–60 s).
NÃO dizer a dose: as unidades não estão confirmadas.
""")

# ---- 5. Esporotricose
s = novo("Dois gatos com a mesma zoonose em três semanas.")
w = (CW - 0.5) / 3
for i, (src, leg, kw) in enumerate([
    (F("geral", "17-esporotricose-lesao-pata.jpg"), "28/10 · pata", {}),
    (F("dia-18-11", "07-esporotricose-lesao-olho.jpg"), "18/11 · olho", {"caixa": (0.15, 0.36, 0.55, 0.74)}),
    (F("dia-18-11", "04-esporotricose-lesao-pescoco.jpg"), "18/11 · pescoço", {"caixa": (0.2, 0.0, 0.7, 0.55)}),
]):
    x = L + i * (w + 0.25)
    foto(s, src, x, 1.75, w, 3.55, alt=leg, **kw)
    legenda(s, x, 5.38, w, [(leg, {"negrito": True, "cor": TEXTO})], tam=17, alinh=PP_ALIGN.CENTER)
caixa(s, L, 6.0, CW, 0.85, AZUL_CLARO)
texto(s, L, 6.0, CW, 0.85, [
    [("gato", {"negrito": True, "cor": AZUL}), ("  →  ", {}), ("pessoa", {"negrito": True, "cor": AZUL}),
     ("  →  ", {}), ("ambiente", {"negrito": True, "cor": AZUL}), ("      Saúde Única", {"italico": True})],
], tam=20, alinh=PP_ALIGN.CENTER, ancora=MSO_ANCHOR.MIDDLE)
fonte(s)
notas(s, """
[Frase-afirmação + prova. Fotos recortadas sem a mão sem luva.]
Fala no formato E / MAS / PORTANTO (casos/esporotricose.md):
"No meu primeiro dia, um gato com uma ferida na pata: esporotricose. Três semanas depois, outro gato, com feridas no olho e no pescoço: de novo.
MAS a esporotricose não fica no gato: passa para quem cuida dele, por arranhão, mordida ou contato com a ferida. E já tem casos no Sul de SC.
PORTANTO, cuidar do gato também é cuidar das pessoas. Por isso as luvas."
Camada: pessoas (Saúde Única), caráter ("eu nunca tinha tido gato"), tempo. ~90 s.
A CONFIRMAR com a Cláudia: como foi o diagnóstico e o tratamento dos dois gatos.
""")

# ---- Slides extras (21/11): dia 1, o par 17/11 → 19/11 e o fecaloma.
# Gerados só com --extra, num arquivo à parte.
n_antes = len(prs.slides)

# ---- 6. O dia 1
s = novo("No primeiro dia, a morte apareceu três vezes.")
w = (CW - 0.5) / 3
for i, (cab, txt) in enumerate([
    ("Pastora alemã", "já estava morta quando cheguei"),
    ("Golden retriever", "morreu durante o ultrassom, com a família presente"),
    ("Cão idoso", "eutanásia, depois de uma longa conversa com a dona"),
]):
    x = L + i * (w + 0.25)
    caixa(s, x, 1.9, w, 2.2, NEUTRO)
    texto(s, x + 0.25, 2.15, w - 0.5, 2.2, [
        [(cab, {"tam": 22, "negrito": True, "cor": AZUL})],
        [(txt, {"tam": 17})],
    ], depois=10)
caixa(s, L, 4.5, CW, 1.9, VERDE_CLARO)
texto(s, L + 0.4, 4.5, CW - 0.8, 1.9, [
    [("“O trabalho do veterinário é quase mais com humanos do que com animais.”", {"tam": 22, "italico": True})],
    [("minha anotação do dia 1, 28/10", {"tam": 14, "cor": CINZA})],
], alinh=PP_ALIGN.CENTER, ancora=MSO_ANCHOR.MIDDLE, depois=6)
fonte(s)
notas(s, """
[Frase-afirmação. Sem foto de propósito: nenhuma foto de animal morto.]
"No primeiro dia, a morte apareceu três vezes. Quando cheguei, já havia uma pastora alemã morta. Depois, um golden morreu durante o ultrassom, com a família presente. E acompanhei a eutanásia de um cão idoso, depois de uma longa conversa com a dona.
Naquele dia eu escrevi que o trabalho do veterinário é quase mais com humanos do que com animais."
Camadas: tempo (abre a moldura) e caráter (o ponto de partida). ~45 s.
""")

# ---- 7. O par 17/11 → 19/11
s = novo("Três já não podiam ser salvos; três ainda podiam.", tam=28)
caixa(s, L, 1.8, 4.6, 4.9, "2B2B2B")
texto(s, L + 0.35, 1.8, 3.9, 4.9, [
    [("17/11", {"tam": 20, "negrito": True, "cor": "BBBBBB"})],
    [("3", {"tam": 72, "negrito": True, "cor": "FFFFFF"})],
    [("fetos mumificados no útero da gata, na castração", {"tam": 18, "cor": "FFFFFF"})],
], alinh=PP_ALIGN.CENTER, ancora=MSO_ANCHOR.MIDDLE, depois=8)
foto(s, F("dia-19-11", "02-tres-filhotes-comendo.jpg"), L + 4.9, 1.8, CW - 4.9, 4.2, foco=(0.55, 0.5),
     alt="Três filhotes comendo na baia, 19/11")
legenda(s, L + 4.9, 6.1, CW - 4.9, [("19/11", {"negrito": True, "cor": TEXTO}),
                                   (" · 3 filhotes resgatados, vivos, depois de um ataque de cachorro", {})], tam=16)
fonte(s)
notas(s, """
[Frase-afirmação + prova: o contraste escuro e claro. Decisão do Felipe: este slide entra?]
"Na castração da gata, no dia 17, o útero tinha três fetos que já estavam mortos. Não havia nada a fazer por eles.
Dois dias depois, chegaram três filhotes. Eram sete; um cachorro matou quatro. Alguém resgatou os três que sobraram.
A clínica só pode mexer no que ainda está acontecendo na frente dela."
Camadas: tempo (fecha a moldura) e pessoas (alguém resgatou). ~45 s.
A foto mostra uma mão sem luva tocando o filhote branco. Recortar a mão corta também um dos três filhotes, então ela ficou. Tenha a resposta pronta ou troque a foto (privacidade/checklist-fotos.md).
O estado clínico dos filhotes está a confirmar; a veterinária conduz o caso.
""")

# ---- 8. Fecaloma
s = novo("O fundador que deixou as consultas continua operando.", tam=28)
foto(s, F("cirurgia-felino", "07-material-removido-cuba-rim.jpg"), L, 1.75, 6.0, 4.75, foco=(0.45, 0.45),
     alt="Fecaloma retirado, na cuba-rim, 18/11")
caixa(s, L + 6.3, 1.75, CW - 6.3, 4.75, NEUTRO)
texto(s, L + 6.5, 2.0, CW - 6.7, 4.3, [
    [("Fecaloma", {"tam": 24, "negrito": True, "cor": AZUL})],
    ["fezes ressecadas que o gato não consegue eliminar"],
    [("3ª cirurgia", {"tam": 24, "negrito": True, "cor": VERMELHO})],
    ["do mesmo gato; a causa foi comer pão"],
], tam=17, depois=8)
legenda(s, L, 6.55, 6.0, "18/11 · retirado pelo Rangel, com a Cláudia na anestesia", tam=14)
fonte(s)
notas(s, """
[Frase-afirmação + prova: o que saiu de dentro do gato.]
"No dia 18, o Rangel operou um gato com fecaloma, com a Cláudia na anestesia. Fecaloma é uma massa de fezes ressecadas que o gato não consegue eliminar.
Esse gato tinha o estômago sensível, comeu pão, e foi a terceira cirurgia dele. A dieta também é tratamento, e ela está nas mãos do tutor."
Camadas: pessoas (o Rangel e o tutor) e oculto. ~45 s. Terceiro a sair se faltar tempo.
""")

novos = list(prs.slides)
apagar(prs, base)
for sl in orig:
    apagar(prs, sl)

# novos[0] é a base; os 5 primeiros vêm logo depois, e os 3 extras no fim.
extras = novos[n_antes:]
cinco = [x for x in novos[:n_antes] if x is not base and x not in orig]
for sl in (cinco if EXTRA else extras):
    apagar(prs, sl)

prs.core_properties.title = ("Protótipo: 3 slides extras" if EXTRA else "Protótipo: 5 slides em frase-afirmação e prova")
prs.core_properties.author = "Felipe de Oliveira Dubas Pires"
prs.save(SAIDA)
print("salvo:", SAIDA, "-", len(prs.slides), "slides")
