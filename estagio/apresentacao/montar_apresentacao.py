"""Monta a apresentação da defesa de estágio sobre o modelo do IFC.

Uso:  python3 estagio/apresentacao/montar_apresentacao.py

Lê o modelo "Modelo Defesa de estágio Técnico.pptx", as fotos de estagio/fotos/,
as capturas da animação 3D (capturas-3d/) e as fotos de ambientes da clínica
extraídas do PDF de referência de 2025. Gera Defesa-de-Estagio-Felipe.pptx
nesta pasta. Precisa de python-pptx, Pillow e do pdfimages (poppler).
"""
import copy
import os
import subprocess
import tempfile
from itertools import count

from lxml import etree
from PIL import Image, ImageOps
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION, XL_LEGEND_POSITION, XL_MARKER_STYLE
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTAGIO = os.path.dirname(AQUI)
REPO = os.path.dirname(ESTAGIO)
MODELO = os.path.join(ESTAGIO, "Modelo Defesa de estágio Técnico.pptx")
PDF_REF = os.path.join(ESTAGIO, "pdfs", "defesa-yasmin-2025.pdf")
SAIDA = os.path.join(AQUI, "Defesa-de-Estagio-Felipe.pptx")
TMP = tempfile.mkdtemp(prefix="defesa-")
_n = count()

# Cores do modelo do IFC
VERMELHO = "CC0000"   # títulos
AZUL = "0B5394"       # rótulos
VERDE = "009933"      # linha do título
TEXTO = "333333"
CINZA = "666666"
VERDE_CLARO = "E8F4EC"
AZUL_CLARO = "E9F0F8"
NEUTRO = "F1F4F2"
AMBAR = "B45309"      # pendências ("a confirmar")

L, R = 0.55, 10.47    # margens do conteúdo (polegadas)
CW = R - L


def F(*partes):
    return os.path.join(ESTAGIO, "fotos", *partes)


def K(nome):
    return os.path.join(REPO, "katita-3d", "img", nome)


def C3D(nome):
    return os.path.join(AQUI, "capturas-3d", nome)


def OSH(nome):
    return os.path.join(ESTAGIO, "animacao-osh", "referencias", nome)


def NOD(nome):
    return os.path.join(ESTAGIO, "animacao-nodulectomia", "referencias", nome)


def fotos_da_clinica():
    """Extrai as fotos de ambientes (págs. 3 a 12) do PDF de referência."""
    pasta = os.path.join(TMP, "amb")
    os.makedirs(pasta)
    subprocess.run(["pdfimages", "-j", "-p", "-f", "3", "-l", "12", PDF_REF,
                    os.path.join(pasta, "y")], check=True)
    nomes = {
        "fachada": "y-003-001", "recepcao": "y-004-003", "petshop": "y-004-004",
        "consultorio": "y-005-006", "internamento": "y-006-009",
        "espera": "y-007-012", "banho": "y-010-021", "cirurgia": "y-012-027",
    }
    return {k: os.path.join(pasta, v + ".jpg") for k, v in nomes.items()}


AMB = fotos_da_clinica()


# ---------------------------------------------------------------- imagens
def preparar(src, aspecto, caixa=None, foco=(0.5, 0.5), largura_max=1800):
    """Recorta a imagem para preencher o quadro sem distorcer.

    caixa: recorte prévio em frações (x0, y0, x1, y1), para tirar rostos e nomes.
    foco: onde fica a janela de recorte (0 = esquerda/topo, 1 = direita/base).
    """
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


def foto(slide, src, x, y, w, h, caixa=None, foco=(0.5, 0.5), raio=0.1, forma="roundRect", alt=""):
    caminho = preparar(src, w / h, caixa, foco, largura_max=max(600, int(w * 230)))
    pic = slide.shapes.add_picture(caminho, Inches(x), Inches(y), Inches(w), Inches(h))
    geom = pic._element.spPr.find(qn("a:prstGeom"))
    geom.set("prst", forma)
    if forma == "roundRect":
        av = geom.find(qn("a:avLst"))
        if av is None:
            av = etree.SubElement(geom, qn("a:avLst"))
        gd = etree.SubElement(av, qn("a:gd"))
        gd.set("name", "adj")
        gd.set("fmla", f"val {int(raio / min(w, h) * 100000)}")
    pic._element.nvPicPr.cNvPr.set("descr", alt)
    return pic


# ---------------------------------------------------------------- texto
def _bullet(p, nivel_pol=0.28):
    pPr = p._p.get_or_add_pPr()
    pPr.set("marL", str(Inches(nivel_pol)))
    pPr.set("indent", str(-Inches(nivel_pol)))
    for tag in ("a:buNone", "a:buChar", "a:buAutoNum", "a:buFont"):
        for el in pPr.findall(qn(tag)):
            pPr.remove(el)
    buFont = etree.SubElement(pPr, qn("a:buFont"))
    buFont.set("typeface", "Arial")
    buChar = etree.SubElement(pPr, qn("a:buChar"))
    buChar.set("char", "•")


def texto(slide, x, y, w, h, paras, tam=16, cor=TEXTO, negrito=False, alinh=PP_ALIGN.LEFT,
          ancora=MSO_ANCHOR.TOP, fonte="Calibri", depois=6, nome=None):
    """paras: lista de str, de listas de (texto, opções) ou de dicts {runs, bullet, depois}."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if nome:
        tb.name = nome
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = ancora
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        opts = {}
        if isinstance(para, dict):
            opts = para
            runs = para["runs"]
        else:
            runs = para
        if isinstance(runs, str):
            runs = [(runs, {})]
        p.alignment = opts.get("alinh", alinh)
        p.space_after = Pt(opts.get("depois", depois))
        if opts.get("bullet"):
            _bullet(p)
        for t, o in runs:
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = o.get("fonte", fonte)
            f.size = Pt(o.get("tam", tam))
            f.bold = o.get("negrito", negrito)
            f.italic = o.get("italico", False)
            f.color.rgb = RGBColor.from_string(o.get("cor", cor))
    return tb


def rot(t):
    """Rótulo em azul e negrito."""
    return (t, {"cor": AZUL, "negrito": True})


def pend(t="a confirmar"):
    """Pendência em âmbar e itálico, para achar fácil e trocar."""
    return (f"[{t}]", {"cor": AMBAR, "italico": True})


def legenda(slide, x, y, w, t, h=0.4, tam=16):
    return texto(slide, x, y, w, h, [t], tam=tam, cor=TEXTO)


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


def numero(slide, x, y, d, n, cor=VERDE):
    s = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    s.fill.solid()
    s.fill.fore_color.rgb = RGBColor.from_string(cor)
    s.line.fill.background()
    s.shadow.inherit = False
    tf = s.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = str(n)
    r.font.name = "Calibri"
    r.font.size = Pt(int(d * 30))
    r.font.bold = True
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    return s


def notas(slide, t):
    slide.notes_slide.notes_text_frame.text = t.strip()


# ---------------------------------------------------------------- slides
def titulo(slide, t):
    """Troca o texto do título do modelo mantendo a formatação."""
    for sh in slide.shapes:
        if sh.has_text_frame and Emu(sh.top).inches < 1.0 and sh.text_frame.text.strip():
            p = sh.text_frame.paragraphs[0]
            p.runs[0].text = t
            for r in p.runs[1:]:
                r._r.getparent().remove(r._r)
            for extra in sh.text_frame.paragraphs[1:]:
                extra._p.getparent().remove(extra._p)
            return sh
    raise ValueError("título não encontrado")


def tirar_corpo(slide):
    """Remove a caixa de texto grande do corpo do modelo."""
    for sh in list(slide.shapes):
        if sh.has_text_frame and 1.7 < Emu(sh.top).inches < 2.0 and Emu(sh.width).inches > 9:
            sh._element.getparent().remove(sh._element)


def duplicar(prs, src):
    """Copia um slide do modelo (fundo, título, linha verde e logo)."""
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
    mc = "{http://schemas.openxmlformats.org/markup-compatibility/2006}AlternateContent"
    for filho in src._element:
        if filho.tag in (mc, qn("p:transition")):
            novo._element.append(copy.deepcopy(filho))
    return novo


def apagar(prs, slide):
    lst = prs.slides._sldIdLst
    for sldId in list(lst):
        if prs.part.related_part(sldId.rId) is slide.part:
            prs.part.drop_rel(sldId.rId)
            lst.remove(sldId)


def grade(slide, itens, y0=1.75, cols=3, h_foto=2.05, gap=0.25, h_leg=0.42, linha_gap=0.18):
    """Grade de fotos com legenda embaixo. itens: (src, legenda, kwargs)."""
    w = (CW - gap * (cols - 1)) / cols
    for i, (src, leg, kw) in enumerate(itens):
        c, lnh = i % cols, i // cols
        x = L + c * (w + gap)
        y = y0 + lnh * (h_foto + h_leg + linha_gap)
        foto(slide, src, x, y, w, h_foto, alt=leg, **kw)
        legenda(slide, x, y + h_foto + 0.06, w, leg, h=h_leg)


# ======================================================================
prs = Presentation(MODELO)
orig = list(prs.slides)
s_capa, s_orient, s_info, s_area, s_ativ, s_dific, s_consid, s_refs = orig
# Cópia limpa do quadro vazio (fundo, título, linha verde e logo), feita antes de
# preencher qualquer slide; todos os slides novos saem dela e ela é apagada no fim.
base = duplicar(prs, s_ativ)

# ---- 1. Capa
titulo(s_capa, "Defesa de Estágio - Estudante Felipe")
for sh in s_capa.shapes:
    if sh.shape_type == 13 and Emu(sh.width).inches > 5:   # logo do curso
        sh.left, sh.top, sh.width, sh.height = Inches(2.75), Inches(1.7), Inches(4.9), Inches(3.47)
texto(s_capa, 0.8, 5.35, 8.8, 1.7, [
    [rot("Orientadora: "), ("Franciele Oliveira", {})],
    [rot("Supervisora: "), ("Cláudia Helena Bratti da Silva", {})],
    [rot("Local: "), ("Mundo Animal Clínica Veterinária, Sombrio (SC)", {})],
    [("Santa Rosa do Sul, dezembro de 2026", {"cor": CINZA})],
], tam=18, alinh=PP_ALIGN.CENTER, depois=2)
notas(s_capa, """
Apresentar-se: Felipe, Técnico em Agropecuária integrado ao Ensino Médio, IFC Campus Santa Rosa do Sul.
Estágio na Mundo Animal Clínica Veterinária, em Sombrio, de 28/10 a 07/12/2026.
Orientadora: Franciele Oliveira. Supervisora na clínica: Cláudia Helena Bratti da Silva.
PENDENTE: completar o nome com o sobrenome no título; acrescentar a banca, se for pedida.
""")

# ---- 2. Informações do estagiário
tirar_corpo(s_info)
texto(s_info, L, 1.85, 6.0, 5.3, [
    [rot("Nome do estagiário: "), ("Felipe", {})],
    [rot("Nome da orientadora: "), ("Franciele Oliveira", {})],
    {"runs": [("", {})], "depois": 2},
    [("Identificação da empresa", {"cor": AZUL, "negrito": True, "tam": 18})],
    [rot("Razão social: "), ("Comercial Agropecuária Rangel LTDA", {})],
    [rot("Nome: "), ("Mundo Animal Clínica Veterinária", {})],
    [rot("Responsável legal: "), ("Rangel Ramos Cardoso", {})],
    [rot("Endereço: "), ("Avenida Antonio Sant'Helena, 165", {})],
    [rot("Bairro: "), ("Centro", {})],
    [rot("CEP: "), ("88960-000", {})],
    [rot("Cidade/Estado: "), ("Sombrio/SC", {})],
    [rot("Telefone: "), ("(48) 99924-7977", {})],
    [rot("Site: "), ("não possui ", {}), pend()],
], tam=17, depois=5)
foto(s_info, AMB["fachada"], 6.85, 1.95, 3.62, 3.25, caixa=(0.03, 0.05, 0.97, 0.93), alt="Fachada da clínica")
legenda(s_info, 6.85, 5.28, 3.62, "Fachada da clínica")
fonte(s_info)
notas(s_info, """
Dados da clínica: Mundo Animal é o nome; a razão social leva o nome do fundador, Rangel (por isso os laudos dizem "Clínica Veterinária Rangel").
PENDENTE: confirmar com a clínica se endereço, telefone e responsável legal continuam iguais e se há site.
""")

# ---- 3. Área do estágio
tirar_corpo(s_area)
texto(s_area, L, 1.85, 6.1, 5.2, [
    [rot("Data de início: "), ("28/10/2026", {})],
    [rot("Data de término: "), ("07/12/2026", {})],
    [rot("Carga horária semanal: "), pend()],
    [rot("Carga horária total: "), pend()],
    [rot("Setor: "), ("clínica médica e cirúrgica de pequenos animais ", {}), pend()],
    [rot("Supervisora de estágio: "), ("Cláudia Helena Bratti da Silva", {})],
    [rot("Formação da supervisora: "), ("Medicina Veterinária", {})],
], tam=20, depois=12)
caixa(s_area, 6.95, 1.95, 3.52, 2.3, VERDE_CLARO)
texto(s_area, 7.2, 2.1, 3.02, 2.0, [
    [("41", {"tam": 54, "negrito": True, "cor": VERDE})],
    [("dias de estágio", {"tam": 18})],
    [("28/10 a 07/12/2026", {"tam": 16, "cor": CINZA})],
], depois=0)
caixa(s_area, 6.95, 4.5, 3.52, 2.3, AZUL_CLARO)
texto(s_area, 7.2, 4.65, 3.02, 2.0, [
    [("8h às 18h", {"tam": 40, "negrito": True, "cor": AZUL})],
    [("horário no estágio", {"tam": 18})],
    [("manhã e tarde no mesmo dia", {"tam": 16, "cor": CINZA})],
], depois=2)
notas(s_area, """
Período: 28/10 a 07/12/2026 (41 dias corridos). Horário: 08:00–13:00 e 13:00–18:00.
LEMBRETE do modelo do IFC: entregar em separado, no dia da defesa, o plano de atividades de estágio (estagiário/orientador e empresa).
PENDENTE: carga horária semanal e total (quantas horas contam por dia) e o nome do setor.
""")

# ---- 4. A clínica
s = duplicar(prs, base)
titulo(s, "A clínica Mundo Animal")
tirar_corpo(s)
texto(s, L, 1.85, 5.15, 2.0, [
    "Inaugurada em 2005, em Sombrio (SC), pelo médico veterinário Rangel Ramos Cardoso.",
    "Começou pequena e cresceu até se tornar referência na região.",
], tam=18, depois=10)
texto(s, L, 3.95, 5.15, 0.4, [[("Serviços", {"cor": AZUL, "negrito": True})]], tam=18)
servicos = ["Consultas", "Cirurgias", "Exames laboratoriais", "Raio-X",
            "Ultrassonografia", "Vacinas", "Banho e tosa", "Pet shop"]
for i, sv in enumerate(servicos):
    x = L + (i % 2) * 2.7
    y = 4.45 + (i // 2) * 0.64
    caixa(s, x, y, 2.5, 0.5, VERDE_CLARO, raio=0.25)
    texto(s, x, y, 2.5, 0.5, [sv], tam=16, alinh=PP_ALIGN.CENTER, ancora=MSO_ANCHOR.MIDDLE)
foto(s, AMB["recepcao"], 5.95, 1.85, 4.52, 2.45, alt="Recepção")
foto(s, AMB["petshop"], 5.95, 4.5, 4.52, 2.45, alt="Pet shop")
fonte(s, "Recepção (acima) e pet shop (abaixo). Fonte: O autor.")
notas(s, """
Histórico curto: fundada em 2005 pelo veterinário Rangel Ramos Cardoso; cresceu e virou referência na região.
Serviços: consultas, cirurgias, exames laboratoriais, raio-X, ultrassonografia, vacinas, banho e tosa e pet shop.
""")
s_clinica = s

# ---- 5. Estrutura: ambientes
s = duplicar(prs, base)
titulo(s, "Estrutura: ambientes")
tirar_corpo(s)
grade(s, [
    (AMB["recepcao"], "Recepção e pet shop", {}),
    (AMB["consultorio"], "Consultório", {}),
    (AMB["internamento"], "Internamento", {}),
    (AMB["espera"], "Sala de espera e pesagem", {}),
    (AMB["banho"], "Banho e tosa", {}),
    (AMB["cirurgia"], "Sala de cirurgia", {}),
])
fonte(s)
notas(s, """
Percorrer os ambientes rapidamente: recepção e pet shop, consultório, internamento, espera e pesagem, banho e tosa, sala de cirurgia.
""")
s_amb = s

# ---- 6. Estrutura: equipamentos
s = duplicar(prs, base)
titulo(s, "Estrutura: equipamentos")
tirar_corpo(s)
grade(s, [
    (F("dia02", "13-gerador-de-raio-x.jpg"), "Raio-X digital", {"foco": (0.5, 0.32)}),
    (F("geral", "05-vetscan-vs2.jpg"), "Analisador bioquímico", {"foco": (0.5, 0.62)}),
    (F("geral", "06-microscopio.jpg"), "Microscópio", {"foco": (0.5, 0.3)}),
    (F("dia-18-11", "01-autoclave-cristofoli-vitale-21.jpg"), "Autoclaves (esterilização)", {"foco": (0.5, 0.45)}),
    (F("geral", "26-geladeira-de-vacinas.jpg"), "Geladeira de vacinas", {"foco": (0.5, 0.3)}),
    (F("geral", "10-anestesia-equipamento.jpg"), "Anestesia e monitoração", {"foco": (0.5, 0.3)}),
])
fonte(s)
notas(s, """
Raio-X digital: gerador portátil no suporte de teto e detector na mesa; a imagem sai no notebook.
Analisador bioquímico VetScan VS2: o rotor de reagentes gira (centrifugação) e cada câmara é lida por fotometria.
Autoclaves (Cristófoli Vitale 21 e Bioex, foto de 18/11): esterilizam os instrumentos cirúrgicos com vapor sob pressão. Os instrumentos vão embalados em papel grau cirúrgico.
Geladeira de vacinas: 6 °C no dia da foto, dentro da faixa de 2 a 8 °C.
""")
s_equip = s

# ---- 7. Atividades realizadas (slide do modelo)
s = s_ativ
tirar_corpo(s)
texto(s, L, 1.6, CW, 0.4, [[("Acompanhamento e auxílio na rotina, sempre sob supervisão da médica veterinária",
                            {"italico": True, "cor": CINZA})]], tam=18)
cards = [
    (F("geral", "15-exame-fisico-cao.jpg"), "Clínica médica", "Consultas, exame físico, internamento e fluidoterapia"),
    (NOD("foto3-mesa-instrumentais.jpg"), "Cirurgia", "Ortopedia, castração, nodulectomia, criocirurgia e odontologia"),
    (F("geral", "04-rotor-de-reagentes.jpg"), "Diagnóstico", "Hemograma, bioquímico, teste FeLV/FIV, raio-X e ultrassom"),
    (F("quimio", "01-doxorrubicina-frasco.jpg"), "Terapias", "Quimioterapia e transfusão de sangue"),
    (F("geral", "19-vacina-vanguard-plus.jpg"), "Prevenção", "Vacinas (V8/V10 e antirrábica) e antiparasitários"),
    (F("dia-18-11", "01-autoclave-cristofoli-vitale-21.jpg"), "Rotina da clínica", "Esterilização de instrumentos, banho e tosa"),
]
cw, ch, g = (CW - 0.5) / 3, 2.3, 0.25
for i, (src, cab, desc) in enumerate(cards):
    x = L + (i % 3) * (cw + g)
    y = 2.2 + (i // 3) * (ch + g)
    caixa(s, x, y, cw, ch, NEUTRO)
    foto(s, src, x + 0.2, y + 0.2, 0.95, 0.95, forma="ellipse", alt=cab)
    texto(s, x + 1.3, y + 0.2, cw - 1.45, 0.95, [cab], tam=19, cor=AZUL, negrito=True, ancora=MSO_ANCHOR.MIDDLE)
    texto(s, x + 0.2, y + 1.3, cw - 0.4, 0.9, [desc], tam=16)
fonte(s)
notas(s, """
Visão geral do que foi acompanhado. Usar sempre "acompanhamento de" e "auxílio em": incisão, ligadura e sutura são atos do médico veterinário (Lei 5.517/68).
Os próximos slides mostram os casos em detalhe.
""")

# ---- 8. Katita: o caso
s = duplicar(prs, base)
titulo(s, "Katita: fratura em Y no cotovelo")
tirar_corpo(s)
caixa(s, L, 1.85, 4.55, 5.05, VERDE_CLARO)
texto(s, L + 0.25, 2.1, 4.05, 4.6, [
    [rot("Paciente: "), ("Katita, cadela SRD, 7 anos, 35\u00a0kg", {})],
    [rot("Causa: "), ("atropelamento", {})],
    [rot("Lesão: "), ("fratura em Y (intercondilar) na extremidade do úmero, junto ao cotovelo esquerdo", {})],
    [rot("Cirurgião: "), ("Thiago, médico veterinário ortopedista", {})],
    [rot("Cirurgia: "), ("29/10/2026, com mais de 4\u00a0horas de duração", {})],
], tam=18, depois=14)
foto(s, K("rx_pre_dp.jpg"), 5.35, 1.85, 3.3, 4.25, foco=(0.35, 0.5), alt="Raio-X antes da cirurgia")
foto(s, F("dia02", "05-desenho-fratura-em-Y.jpg"), 8.85, 1.85, 1.62, 4.25,
     caixa=(0.17, 0.12, 0.5, 0.97), alt="Desenho da fratura em Y")
legenda(s, 5.35, 6.18, 3.3, "Raio-X antes da cirurgia (26/10)")
legenda(s, 8.85, 6.18, 1.62, "Desenho da fratura", h=0.75)
fonte(s)
notas(s, """
A Katita foi atropelada. O raio-X de 26/10 (dois dias antes do início do estágio) mostra a fratura em Y: a ponta do úmero se partiu em três partes, separando os dois côndilos do corpo do osso.
O desenho em vermelho mostra como o osso rachou.
A CONFIRMAR com o Thiago: lado operado (os raios-X marcam "E"), duração exata, anestesia e pós-operatório.
""")
s_k1 = s

# ---- 9. Katita: a cirurgia
s = duplicar(prs, base)
titulo(s, "A cirurgia, passo a passo")
tirar_corpo(s)
foto(s, K("foto_acesso.jpg"), L, 1.85, 2.45, 3.75, alt="Acesso: articulação exposta")
foto(s, K("foto_placa.jpg"), L + 2.65, 1.85, 2.45, 3.75, alt="Placa posicionada")
legenda(s, L, 5.68, 2.45, "Acesso: articulação exposta", h=0.75)
legenda(s, L + 2.65, 5.68, 2.45, "Placa já posicionada no osso", h=0.75)
passos = [
    ("Osteotomia do olécrano: ", "corte no olécrano para expor a articulação"),
    ("Redução: ", "côndilos realinhados e unidos por um parafuso intercondilar"),
    ("Placas: ", "duas placas com parafusos prendem os côndilos ao úmero"),
    ("Banda de tensão: ", "pinos e fio de cerclagem refixam o olécrano"),
    ("Fechamento: ", "músculo com fio absorvível e pele com náilon"),
]
for i, (cab, desc) in enumerate(passos):
    y = 1.85 + i * 0.98
    numero(s, 6.0, y + 0.17, 0.56, i + 1)
    texto(s, 6.8, y, 3.67, 0.9, [[rot(cab), (desc, {})]], tam=17, ancora=MSO_ANCHOR.MIDDLE)
fonte(s)
notas(s, """
1. Osteotomia do olécrano: corta-se a ponta da ulna para levantar o tríceps e enxergar a articulação, "para não precisar cortar mais".
2. Os dois côndilos são encaixados de novo e presos por um parafuso intercondilar (de compressão).
3. Duas placas, com parafusos, ligam os côndilos ao corpo do úmero.
4. Banda de tensão: pinos de Kirschner e fio de cerclagem refixam o olécrano; a tração do tríceps vira compressão.
5. Fechamento em planos: músculo com fio absorvível e pele com náilon.
A CONFIRMAR com o Thiago: quantos pinos foram usados.
""")
s_k2 = s

# ---- 10. Katita: depois
s = duplicar(prs, base)
titulo(s, "Depois: raio-X e recuperação")
tirar_corpo(s)
w3 = (CW - 0.5) / 3
foto(s, F("dia02", "12-katita-rx-pos-anotado.jpg"), L, 1.85, w3, 4.0, caixa=(0, 0.03, 1, 0.66),
     alt="Raio-X depois da cirurgia, anotado")
foto(s, F("legendas", "03-katita-incisao-suturada.jpg"), L + w3 + 0.25, 1.85, w3, 4.0, alt="Incisão suturada")
foto(s, F("legendas", "04-katita-sentada.jpg"), L + 2 * (w3 + 0.25), 1.85, w3, 4.0, alt="Katita sentada")
texto(s, L, 5.95, w3, 1.1, [[("Verde: ", {"cor": VERDE, "negrito": True}), ("2 placas e parafuso intercondilar. ", {}),
                             ("Vermelho: ", {"cor": VERMELHO, "negrito": True}), ("pino da banda de tensão", {})]], tam=16)
legenda(s, L + w3 + 0.25, 5.95, w3, "Incisão fechada com pontos de náilon", h=0.8)
legenda(s, L + 2 * (w3 + 0.25), 5.95, w3, "Katita na clínica, no pós-operatório", h=0.8)
fonte(s)
notas(s, """
Raio-X de 29/10, depois da cirurgia. Em verde, em cima, as duas placas; em verde, embaixo, o parafuso transversal intercondilar; os outros parafusos dão a fixação; em vermelho, o pino na ulna (banda de tensão).
Pós-operatório: incisão no cotovelo fechada com pontos de náilon.
""")
s_k3 = s

# ---- 11. A cirurgia em 3D
s = duplicar(prs, base)
titulo(s, "A cirurgia em 3D")
tirar_corpo(s)
w2 = (CW - 0.25) / 2
cap3d = [
    ("etapa2-lesao-em-Y.jpg", "Etapa 2: a lesão em Y"),
    ("etapa4-reducao-parafuso.jpg", "Etapa 4: redução e parafuso intercondilar"),
    ("etapa6-banda-de-tensao.jpg", "Etapa 6: banda de tensão no olécrano"),
    ("etapa6-modo-raio-x.jpg", "Modo raio-X: os implantes por dentro"),
]
for i, (arq, leg) in enumerate(cap3d):
    x = L + (i % 2) * (w2 + 0.25)
    y = 1.7 + (i // 2) * 2.72
    foto(s, C3D(arq), x, y, w2, 2.22, foco=(0.5, 0.45), alt=leg)
    legenda(s, x, y + 2.27, w2, leg)
fonte(s, "Fonte: O autor (animação 3D da cirurgia).")
notas(s, """
Animação feita para a defesa, com as 7 etapas da cirurgia sobre um esqueleto 3D de cão, a partir das radiografias e das fotos reais.
Mostrar ao vivo: katita-3d/dist/katita-offline.html abre sem internet (plano B). Usar o "Modo apresentação" e o botão "Antes × depois".
Se o esqueleto 3D veio de um site (Sketchfab), citar o autor do modelo.
""")
s_3d = s

# ---- 12. Quimioterapia
s = duplicar(prs, base)
titulo(s, "Quimioterapia com doxorrubicina")
tirar_corpo(s)
texto(s, L, 1.85, 4.75, 5.2, [
    {"runs": "Cão de 17 anos com sarcoma na cabeça e no pescoço, há 7 meses em tratamento com oncologista", "bullet": True},
    {"runs": "Doxorrubicina por via intravenosa, a cada 21 dias", "bullet": True},
    {"runs": "É vesicante: lesa o tecido se extravasar. Por isso a aplicação é lenta e o acesso fica bem seguro", "bullet": True},
    {"runs": "Aplicada em seringa, e não em bolsa: a dose é pequena e o cão arranca o acesso mordendo", "bullet": True},
    {"runs": "Proteção: avental descartável, respirador com filtro e protetor facial", "bullet": True},
], tam=17, depois=10)
foto(s, F("quimio", "01-doxorrubicina-frasco.jpg"), 5.55, 1.85, 2.33, 3.0, foco=(0.5, 0.4), alt="Frasco de doxorrubicina")
foto(s, F("quimio", "05-quimio-seringa-no-acesso.jpg"), 8.14, 1.85, 2.33, 3.0, foco=(0.5, 0.6), alt="Seringa no acesso venoso")
foto(s, F("quimio", "03-quimio-contencao.jpg"), 5.55, 5.05, 4.92, 1.95, caixa=(0.42, 0.42, 1.0, 0.92), foco=(0.5, 0.25),
     alt="Cão de focinheira, contido para a aplicação")
fonte(s, "Frasco, seringa no acesso e contenção com focinheira. Fonte: O autor.")
notas(s, """
Sessão de 12/11. Doxorrubicina (Fauldoxo, Libbs, 50 mg/25 mL). O vermelho vem da própria molécula.
A dose era uma seringa ("6,4/2 que dá 3,2"): A CONFIRMAR as unidades antes de falar em número.
A bolsa de NaCl 0,9% de 250 mL na sessão provavelmente era para lavar o acesso: A CONFIRMAR.
""")
s_quimio = s

# ---- 13. Criocirurgia
s = duplicar(prs, base)
titulo(s, "Criocirurgia de melanoma")
tirar_corpo(s)
foto(s, F("dia06", "01-criocirurgia-spray.jpg"), L, 1.85, 2.95, 2.85, foco=(0.5, 0.35), alt="Spray de nitrogênio líquido sobre a lesão")
foto(s, F("dia06", "02-criocauterio.jpg"), L + 3.15, 1.85, 2.95, 2.85, caixa=(0, 0.3, 1, 1), foco=(0.35, 0.5),
     alt="Criocautério com nitrogênio líquido")
texto(s, 7.0, 1.85, 3.47, 2.9, [
    "Melanoma: tumor das células que produzem pigmento, numa lesão escura da pele.",
    "Spray de nitrogênio líquido, a cerca de −196 °C: o gelo rompe as células e fecha os vasos que nutrem o tumor.",
], tam=16, depois=10)
texto(s, L, 4.98, CW, 0.4, [[("Depois da aplicação, o tutor foi avisado:", {"cor": AZUL, "negrito": True})]], tam=18)
etapas = ["Vai inchar", "Sangramento leve", "Escurece e vira crosta", "A crosta cai em semanas", "Dipirona em gotas se doer"]
slot = CW / 5
for i, e in enumerate(etapas):
    cx = L + i * slot + slot / 2
    numero(s, cx - 0.3, 5.48, 0.6, i + 1)
    if i < 4:
        ln = s.shapes.add_connector(1, Inches(cx + 0.38), Inches(5.78), Inches(cx + slot - 0.38), Inches(5.78))
        ln.line.color.rgb = RGBColor.from_string(VERDE)
        ln.line.width = Pt(2)
    texto(s, cx - slot / 2 + 0.05, 6.18, slot - 0.1, 0.8, [e], tam=16, alinh=PP_ALIGN.CENTER)
fonte(s)
notas(s, """
05/11: melanoma na pele da região do traseiro de um cão.
O congelamento deixa a superfície branca. Depois do degelo vem a inflamação: inchaço e um pouco de sangue. A lesão escurece, seca e cai em algumas semanas, com pele nova por baixo.
Melanomas da pele do cão costumam ser benignos; os da boca e das unhas são os mais agressivos. A confirmação é por citologia ou histopatologia.
Animações 2D e 3D da criocirurgia estão nos links de notas/artefatos-publicados.md.
""")
s_crio = s

# ---- 14. Mel (labradora)
s = duplicar(prs, base)
titulo(s, "Mel: hemangiossarcoma no baço")
tirar_corpo(s)
texto(s, L, 1.75, 5.6, 0.4, [[("Hematócrito da Mel (%)", {"cor": AZUL, "negrito": True})]], tam=18)
cd = CategoryChartData()
cd.categories = ["07/10", "16/10", "06/11"]
cd.add_series("Hematócrito (%)", (24, 21.24, 13.88))
cd.add_series("Mínimo de referência (37%)", (37, 37, 37))
gf = s.shapes.add_chart(XL_CHART_TYPE.LINE_MARKERS, Inches(L), Inches(2.15), Inches(5.6), Inches(3.55), cd)
gf.name = "Gráfico do hematócrito"
ch = gf.chart
ch.font.name = "Calibri"
ch.font.size = Pt(14)
ch.font.color.rgb = RGBColor.from_string(CINZA)
ch.has_title = False
ch.has_legend = True
ch.legend.position = XL_LEGEND_POSITION.BOTTOM
ch.legend.include_in_layout = False
ch.legend.font.size = Pt(14)
va = ch.value_axis
va.minimum_scale, va.maximum_scale, va.major_unit = 0, 45, 10
va.has_major_gridlines = True
va.major_gridlines.format.line.color.rgb = RGBColor(0xE3, 0xE3, 0xE3)
va.format.line.fill.background()
va.tick_labels.font.size = Pt(14)
ca = ch.category_axis
ca.tick_labels.font.size = Pt(16)
ca.format.line.color.rgb = RGBColor(0xBB, 0xBB, 0xBB)
s0, s1 = ch.plots[0].series
s0.format.line.color.rgb = RGBColor.from_string(VERMELHO)
s0.format.line.width = Pt(3)
s0.smooth = False
s0.marker.style = XL_MARKER_STYLE.CIRCLE
s0.marker.size = 10
s0.marker.format.fill.solid()
s0.marker.format.fill.fore_color.rgb = RGBColor.from_string(VERMELHO)
s0.marker.format.line.color.rgb = RGBColor.from_string(VERMELHO)
dl = s0.data_labels
dl.show_value = True
dl.number_format = "0.0"
dl.number_format_is_linked = False
dl.position = XL_LABEL_POSITION.ABOVE
dl.font.size = Pt(16)
dl.font.bold = True
dl.font.color.rgb = RGBColor.from_string(VERMELHO)
s1.format.line.color.rgb = RGBColor.from_string(VERDE)
s1.format.line.width = Pt(2)
s1.format.line.dash_style = MSO_LINE_DASH_STYLE.DASH
s1.smooth = False
s1.marker.style = XL_MARKER_STYLE.NONE
texto(s, L, 5.8, 5.6, 1.2, [
    [rot("Plaquetas (mil/µL): "), ("87 → 403 → 102", {})],
    [("07/10: laboratório externo; 16/10 e 06/11: analisador da clínica", {"cor": CINZA, "tam": 14})],
], tam=16, depois=4)
caixa(s, 6.45, 1.85, 4.02, 5.1, AZUL_CLARO)
texto(s, 6.7, 2.05, 3.55, 4.75, [
    [("Labradora, cerca de 13 anos", {"negrito": True, "cor": AZUL})],
    {"runs": [rot("Ultrassom (07/10): "), ("baço aumentado, com vários nódulos; o maior com 4,45 × 4,13 cm", {})], "bullet": True},
    {"runs": [rot("Cirurgia: "), ("retirada total do baço (esplenectomia)", {})], "bullet": True},
    {"runs": [rot("Biópsia: "), ("hemangiossarcoma esplênico, com ruptura", {})], "bullet": True},
    {"runs": [("Depois da cirurgia o hematócrito continuou caindo: 13,9% em 06/11", {})], "bullet": True},
], tam=16, depois=9)
fonte(s, "Fonte: exames e laudos da paciente (nomes ocultados).")
notas(s, """
Mel, labradora de cerca de 13 anos (não é a gata Mel Serafina).
Ultrassom de 07/10: baço aumentado com várias estruturas arredondadas, a maior com 4,45 × 4,13 cm, uma delas com a cápsula irregular. Adrenal esquerda com nódulo.
Esplenectomia total; biópsia (laudo de 27/10): hemangiossarcoma esplênico com ruptura e hematoma.
O gráfico mostra a anemia piorando depois da cirurgia: 24% (07/10), 21,2% (16/10) e 13,9% (06/11). O mínimo de referência para cães é 37%.
Atenção: o primeiro exame é de laboratório externo e os outros dois do analisador da clínica.
""")
s_mel = s

# ---- 15. Mel Serafina
s = duplicar(prs, base)
titulo(s, "Mel Serafina: anemia grave")
tirar_corpo(s)
foto(s, F("dia06", "03-mel-serafina-internada.jpg"), L, 1.85, 2.75, 3.4, foco=(0.5, 0.4), alt="Mel Serafina internada")
foto(s, F("dia07", "03-transfusao-mel-serafina.jpg"), L + 2.95, 1.85, 4.0, 3.4, foco=(0.4, 0.5), alt="Transfusão de sangue")
legenda(s, L, 5.3, 2.75, "Internada (05/11)")
legenda(s, L + 2.95, 5.3, 4.0, "Transfusão de sangue (06/11)")
texto(s, L, 5.85, 6.95, 1.2, [
    "Gata SRD, 6 anos. Mucosas muito brancas, dificuldade para ficar de pé e sangue escuro. Suspeita de FeLV, a confirmar por teste.",
    [("Ao lado, o hemograma de 05/11: os três valores abaixo da referência.", {"cor": CINZA})],
], tam=16)
stats = [("6,3", "hemoglobina (g/dL)"), ("19,4%", "hematócrito"), ("38", "plaquetas (mil/µL)")]
for i, (v, lb) in enumerate(stats):
    y = 1.85 + i * 1.72
    caixa(s, 7.75, y, 2.72, 1.55, NEUTRO)
    texto(s, 7.95, y + 0.12, 2.32, 1.35, [
        [(v, {"tam": 36, "negrito": True, "cor": VERMELHO})],
        [(lb, {})],
    ], tam=16, depois=0)
fonte(s)
notas(s, """
Mel Serafina, gata SRD castrada, nascida em 09/04/2020.
Chegou com mucosas muito brancas e sem conseguir ficar de pé; o sangue do pescoço estava muito escuro, por falta de oxigênio.
Hemograma de 05/11: hemoglobina 6,3, hematócrito 19,4%, plaquetas 38 mil; neutrófilos altos e linfócitos baixos.
Os tutores pensaram em eutanásia, mas antes optaram pela transfusão (06/11). Se o quadro voltasse em 3 dias, a recomendação seria a eutanásia.
PENDENTE: o desfecho e o resultado do teste de FeLV.
""")
s_ser = s

# ---- 16. Barão
s = duplicar(prs, base)
titulo(s, "Barão: tártaro e extrações")
tirar_corpo(s)
foto(s, F("legendas", "07-barao-antes-odontologico.jpg"), L, 1.85, 3.0, 4.2, alt="Antes do procedimento")
foto(s, F("legendas", "08-barao-depois-odontologico.jpg"), L + 3.2, 1.85, 3.0, 4.2, alt="Depois do procedimento")
legenda(s, L, 6.12, 3.0, "Antes")
legenda(s, L + 3.2, 6.12, 3.0, "Depois")
texto(s, 7.05, 1.85, 3.42, 5.1, [
    [("SRD, 11 anos, macho castrado", {"negrito": True, "cor": AZUL})],
    {"runs": "Cálculo dentário espesso e gengiva avermelhada", "bullet": True},
    {"runs": "Sob anestesia: limpeza e extração de cerca de 8 dentes, com sutura na gengiva", "bullet": True},
    {"runs": "Hemograma (04/11): leucócitos altos e plaquetas baixas", "bullet": True},
    {"runs": [("Diagnóstico informado: linfoma na raiz dentária", {})], "bullet": True},
], tam=16, depois=10)
fonte(s)
notas(s, """
04/11. Barão, SRD, 11 anos.
Antes: muito cálculo (tártaro) e gengiva inflamada. Depois: dentes limpos e sutura na gengiva, após a extração de cerca de 8 dentes.
Hemograma: leucócitos 23,6 com neutrófilos, linfócitos e monócitos altos; plaquetas 121 (baixas).
A CONFIRMAR com a Cláudia como foi feito o diagnóstico de linfoma.
""")
s_barao = s

# ---- 17. Castração e nodulectomia
s = duplicar(prs, base)
titulo(s, "Castração e nodulectomia")
tirar_corpo(s)
wc = (CW - 0.3) / 2
blocos = [
    ("Castração de gata (OSH)", OSH("foto1-sutura-subcutaneo.jpg"), OSH("foto3-pos-operatorio.jpg"),
     "Retirada de ovários e útero por uma incisão na linha média do abdômen, com sutura em três planos. "
     "Achado: fetos mumificados no útero."),
    ("Nodulectomia em cadela", NOD("foto7-peca-cirurgica.jpg"), NOD("foto8-sutura-pele.jpg"),
     "Nódulo perto da axila retirado inteiro, junto com a pele por cima. Pele fechada com sutura contínua de náilon."),
]
for i, (cab, f1, f2, desc) in enumerate(blocos):
    x = L + i * (wc + 0.3)
    texto(s, x, 1.72, wc, 0.45, [[(cab, {"cor": AZUL, "negrito": True})]], tam=20)
    foto(s, f1, x, 2.25, (wc - 0.2) / 2, 2.75, alt=cab)
    foto(s, f2, x + (wc - 0.2) / 2 + 0.2, 2.25, (wc - 0.2) / 2, 2.75, foco=(0.5, 0.35), alt=cab)
    texto(s, x, 5.15, wc, 1.85, [desc], tam=16)
fonte(s, "Cirurgias de 17/11/2026. Fonte: O autor.")
notas(s, """
17/11. Duas cirurgias de tecidos moles.
OSH (ovariosalpingo-histerectomia) eletiva em gata colorpoint: incisão retroumbilical na linha média, técnica das três pinças nos pedículos ovarianos, ligadura do corpo do útero e sutura em três planos. No útero havia fetos mumificados.
Nodulectomia: nódulo na região torácica lateral, perto da axila, de uma cadela preta idosa. Incisão em elipse com margem, dissecção sem romper a cápsula, retirada em bloco e sutura contínua de náilon.
11/11: auxílio na castração de uma cadela (segurar o útero com pinça para a Cláudia cortar e suturar). Apresentar como auxílio sob supervisão. A CONFIRMAR com a Fran como enquadrar.
Animações das duas cirurgias: ver os briefings em animacao-osh/ e animacao-nodulectomia/.
""")
s_tec = s

# ---- 18. Esporotricose
s = duplicar(prs, base)
titulo(s, "Esporotricose em gatos")
tirar_corpo(s)
grade(s, [
    (F("geral", "17-esporotricose-lesao-pata.jpg"), "28/10: ferida na pata", {}),
    (F("dia-18-11", "07-esporotricose-lesao-olho.jpg"), "18/11: ferida perto do olho", {"caixa": (0.15, 0.36, 0.55, 0.74)}),
    (F("dia-18-11", "04-esporotricose-lesao-pescoco.jpg"), "18/11: ferida no pescoço", {"caixa": (0.2, 0.0, 0.7, 0.55)}),
], h_foto=2.6)
caixa(s, L, 4.95, CW, 1.75, AZUL_CLARO)
texto(s, L + 0.3, 5.15, CW - 0.6, 1.45, [
    [rot("O que é: "), ("micose causada pelo fungo Sporothrix, que abre feridas na pele.", {})],
    [rot("Zoonose: "), ("passa do gato para as pessoas por arranhão, mordida ou contato com as feridas. "
                        "Por isso o manejo é sempre com luvas.", {})],
], tam=17, depois=10)
fonte(s)
notas(s, """
Dois gatos com esporotricose no estágio: em 28/10 (ferida ulcerada na pata, com colar elizabetano) e em 18/11 (feridas perto do olho e no pescoço, gato branco).
Na clínica, os gatos quase sempre eram casos de FIV/FeLV ou cistite; a esporotricose foi a exceção.
PENDENTE: tratamento indicado para o gato de 18/11.
""")
s_esp = s

# ---- 19. Prevenção
s = duplicar(prs, base)
titulo(s, "Prevenção e teste rápido")
tirar_corpo(s)
grade(s, [
    (F("geral", "19-vacina-vanguard-plus.jpg"), "Vanguard Plus: vacina polivalente para cães", {"foco": (0.5, 0.45)}),
    (F("geral", "21-vacina-nobivac-raiva.jpg"), "Nobivac Raiva: vacina antirrábica", {"foco": (0.5, 0.5)}),
    (F("dia-18-11", "08-revolution-plus.jpg"), "Revolution Plus: antiparasitário para gatos", {"foco": (0.5, 0.3)}),
    (F("geral", "24-teste-felv-fiv-leitura.jpg"), "Teste rápido de FeLV e FIV em gatos", {"foco": (0.4, 0.5)}),
], cols=4, h_foto=3.1, h_leg=1.0)
caixa(s, L, 6.05, CW, 0.9, VERDE_CLARO)
texto(s, L + 0.3, 6.05, CW - 0.6, 0.9, [[rot("Cadeia de frio: "),
                                          ("as vacinas ficam na geladeira entre 2 e 8 °C (6 °C no dia da foto).", {})]],
      tam=17, ancora=MSO_ANCHOR.MIDDLE)
fonte(s)
notas(s, """
Vacinas aplicadas com frequência: polivalentes V8/V10 (como a Vanguard Plus, da Zoetis) e antirrábica (Nobivac Raiva, MSD, inativada).
Antiparasitários: Defenza (fluralaner, cães) e Revolution Plus (selamectina e sarolaner, gatos de 2,6 a 5 kg; foto de 18/11). A dose depende do peso.
Teste rápido SensPERT FeLV Ag/FIV Ab (Dechra). PENDENTE: resultado do teste da foto e de qual paciente era.
PENDENTE: quantas vacinas foram aplicadas no estágio (contar por dia).
""")
s_prev = s

# ---- 20. Outros casos
s = duplicar(prs, base)
titulo(s, "Outros casos acompanhados")
tirar_corpo(s)
grade(s, [
    (F("legendas", "09-polidactilia.jpg"), "Cão com polidactilia (6 dedos)", {}),
    (F("dia07", "02-mordida-no-pescoco.jpg"), "Mordida no pescoço: limpeza e curativo, sem sutura", {"foco": (0.5, 0.45)}),
    (F("quimio", "06-cistocentese-ecoguiada.jpg"), "Cistocentese guiada por ultrassom", {"caixa": (0, 0, 0.9, 0.62)}),
], h_foto=2.3, h_leg=0.75)
colw = (CW - 0.3) / 2
texto(s, L, 5.0, colw, 2.0, [
    {"runs": [rot("Bob, pinscher de 13 anos: "), ("não apoia a pata; problema neurológico, com bota ortopédica", {})], "bullet": True},
    {"runs": [rot("Gato paraplégico: "), ("cristais na bexiga ao ultrassom", {})], "bullet": True},
], tam=16, depois=8)
texto(s, L + colw + 0.3, 5.0, colw, 2.0, [
    {"runs": [rot("Luna: "), ("atropelada, com suspeita de fratura no quadril", {})], "bullet": True},
    {"runs": [rot("Gato de rua internado: "), ("vômito e pulgas; antibiótico, vermífugo e antipulgas", {})], "bullet": True},
], tam=16, depois=8)
fonte(s)
notas(s, """
Bob (29/10): pinscher de 13 anos que não apoia a pata há 2 meses. No teste com os olhos tapados não reage: problema neurológico, sem indicação de cirurgia. Recomendada bota ortopédica; risco de automutilação.
Gato paraplégico (06/11): jogado de um carro quando filhote; a tutora esvazia a bexiga dele manualmente.
Mordida no pescoço (06/11): só na pele; sem sutura para não formar abscesso.
Cistocentese (12/11): coleta de urina direto da bexiga, guiada por ultrassom, em cão com suspeita de doença renal.
""")
s_out = s

# ---- 21. Dificuldades (slide do modelo)
s = s_dific
tirar_corpo(s)
difs = [
    ("A morte logo no primeiro dia",
     "Em 28/10, um golden retriever morreu durante o ultrassom e houve uma eutanásia, as duas com a família presente."),
    ("A rotina intensa",
     "A cirurgia da Katita durou mais de 4 horas e foi acompanhada sem pausa para o almoço."),
    ("Tutores em momentos difíceis",
     "Uma tutora recusou a sedação do cão para o ultrassom e saiu muito alterada da clínica."),
]
for i, (cab, desc) in enumerate(difs):
    y = 1.85 + i * 1.72
    caixa(s, L, y, CW, 1.55, NEUTRO)
    numero(s, L + 0.3, y + 0.42, 0.72, i + 1)
    texto(s, L + 1.3, y + 0.2, CW - 1.6, 0.45, [[(cab, {"cor": AZUL, "negrito": True})]], tam=20)
    texto(s, L + 1.3, y + 0.7, CW - 1.6, 0.75, [desc], tam=17)
notas(s, """
RASCUNHO montado a partir do diário: ajustar com as suas palavras.
1. Primeiro dia: óbito do golden retriever no ultrassom, com a família presente, e a eutanásia de um cão idoso depois de uma longa conversa com a dona.
2. Rotina: pulou o almoço para acompanhar a cirurgia da Katita; o veterinário brincou que depois dessa ele desistiria da veterinária.
3. 11/11: um dobermann agitado não deixou fazer o ultrassom; a dona recusou a sedação e saiu muito alterada.
""")

# ---- 22. Considerações finais (slide do modelo)
s = s_consid
tirar_corpo(s)
foto(s, F("geral", "31-sao-francisco-de-assis.jpg"), L, 1.85, 3.0, 4.6, caixa=(0.58, 0, 1, 1), foco=(0.5, 0.3),
     alt="Imagem de São Francisco de Assis na clínica")
legenda(s, L, 6.5, 3.0, "São Francisco de Assis, na clínica", h=0.75)
texto(s, 3.85, 1.85, 6.62, 1.4, [
    "O trabalho do veterinário é quase mais com pessoas do que com animais: envolve conversa, emoção e confiança.",
], tam=18)
texto(s, 3.85, 3.3, 6.62, 0.9, [[("“Os animais têm uma alma muito pura.”", {"italico": True, "cor": VERDE})]], tam=26)
texto(s, 3.85, 4.5, 6.62, 1.6, [
    [("Ações que o campus poderia alterar para melhorar a atuação como estagiário:", {"cor": AZUL, "negrito": True})],
    [pend("a preencher")],
], tam=18, depois=8)
fonte(s)
notas(s, """
RASCUNHO. Reflexões registradas no diário:
- Dia 01: o trabalho do veterinário é quase mais com humanos do que com animais; envolve aspectos emocionais, mais próximo de uma atividade espiritual, como São Francisco, do que de um simples "tratador".
- Dia 02: "Os animais têm uma alma muito pura."
- O gato de rua: nunca teve gato e sentia apatia por eles; começou a se envolver quando o gato se esfregava nos dedos dele sob o vidro da baia.
O modelo do IFC pede também as ações que o campus poderia alterar para melhorar a atuação como estagiário: PENDENTE.
""")

# ---- 23. Referências (slide do modelo)
s = s_refs
tirar_corpo(s)
refs = [
    [("BRASIL. Lei nº 5.517, de 23 de outubro de 1968. ", {}),
     ("Dispõe sobre o exercício da profissão de médico-veterinário e cria os Conselhos Federal e Regionais de Medicina Veterinária. ", {"negrito": True}),
     ("Brasília, DF: Presidência da República, 1968.", {})],
    [("BRASIL. Lei nº 11.788, de 25 de setembro de 2008. ", {}),
     ("Dispõe sobre o estágio de estudantes. ", {"negrito": True}),
     ("Brasília, DF: Presidência da República, 2008.", {})],
    [("DECAMP, C. E. et al. ", {}),
     ("Brinker, Piermattei and Flo's handbook of small animal orthopedics and fracture repair. ", {"negrito": True}),
     ("5. ed. St. Louis: Elsevier, 2016.", {})],
    [("EVANS, H. E.; DE LAHUNTA, A. ", {}), ("Miller's anatomy of the dog. ", {"negrito": True}),
     ("4. ed. St. Louis: Elsevier Saunders, 2013.", {})],
    [("FOSSUM, T. W. ", {}), ("Small animal surgery. ", {"negrito": True}), ("5. ed. Philadelphia: Elsevier, 2019.", {})],
    [("JOHNSON, A. L.; HOULTON, J. E. F.; VANNINI, R. ", {}),
     ("AO principles of fracture management in the dog and cat. ", {"negrito": True}),
     ("Davos: AO Publishing; Stuttgart: Thieme, 2005.", {})],
]
texto(s, L, 1.85, CW, 5.3, refs, tam=16, depois=10)
notas(s, """
As quatro obras de cirurgia e anatomia são as mesmas usadas na animação 3D da Katita.
PENDENTE: acrescentar as fontes que forem usadas para melanoma, hemangiossarcoma, esporotricose e quimioterapia.
""")

# ---- 24. Encerramento
s = duplicar(prs, base)
titulo(s, "Obrigado pela atenção!")
tirar_corpo(s)
mosaico = [
    (F("legendas", "04-katita-sentada.jpg"), {}),
    (OSH("foto3-pos-operatorio.jpg"), {"caixa": (0.05, 0.15, 0.95, 0.75)}),
    (F("dia02", "01-gato-de-rua-internado.jpg"), {"foco": (0.6, 0.4)}),
    (F("legendas", "09-polidactilia.jpg"), {}),
    (NOD("foto5-pos-operatorio-angulo2.jpg"), {"foco": (0.3, 0.5)}),
    (F("dia06", "03-mel-serafina-internada.jpg"), {"foco": (0.5, 0.35)}),
    (F("dia-18-11", "07-esporotricose-lesao-olho.jpg"), {"caixa": (0.15, 0.36, 0.55, 0.74)}),
    (F("quimio", "06-cistocentese-ecoguiada.jpg"), {"caixa": (0.35, 0, 0.9, 0.55)}),
]
mw = (CW - 3 * 0.15) / 4
for i, (src, kw) in enumerate(mosaico):
    x = L + (i % 4) * (mw + 0.15)
    y = 1.85 + (i // 4) * 2.6
    foto(s, src, x, y, mw, 2.45, alt="Paciente do estágio", **kw)
fonte(s)
notas(s, """
Agradecer à Cláudia, ao Thiago e à equipe da Mundo Animal, à orientadora Franciele e à banca.
""")
s_fim = s

# ---------------------------------------------------------------- ordem final
apagar(prs, s_orient)
apagar(prs, base)
ordem = [s_capa, s_info, s_area, s_clinica, s_amb, s_equip, s_ativ, s_k1, s_k2, s_k3, s_3d,
         s_quimio, s_crio, s_mel, s_ser, s_barao, s_tec, s_esp, s_prev, s_out,
         s_dific, s_consid, s_refs, s_fim]
lst = prs.slides._sldIdLst
assert len(lst) == len(ordem), (len(lst), len(ordem))
por_parte = {prs.part.related_part(e.rId): e for e in lst}
for e in list(lst):
    lst.remove(e)
for sl in ordem:
    lst.append(por_parte[sl.part])

prs.core_properties.title = "Defesa de Estágio - Felipe"
prs.core_properties.author = "Felipe"
prs.save(SAIDA)
print("salvo:", SAIDA, "-", len(prs.slides), "slides")
