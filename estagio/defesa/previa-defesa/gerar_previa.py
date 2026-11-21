"""Prévia da defesa inteira, na ordem do roteiro, num PDF só (21/11/2026).

Uso:  python3 estagio/defesa/previa-defesa/gerar_previa.py <pasta-com-slides-atuais-em-png>

A pasta indicada deve ter os slides da apresentação atual em PNG (a-01.png ... a-24.png),
gerados com:  soffice --convert-to pdf Defesa-de-Estagio-Felipe.pptx && pdftoppm -r 110 -png ... a
Cada página mostra o bloco do roteiro, o tempo previsto e de onde vem a imagem:
protótipo (verde), apresentação atual (cinza), peça pronta (azul) ou falta fazer (âmbar).
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
DEF = os.path.dirname(AQUI)
ATUAL = sys.argv[1]
FONTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTE_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H, TOPO = 1600, 1040, 140
CORES = {"protótipo": "#1E7B45", "apresentação atual": "#6B6B6B", "peça pronta": "#0B5394", "falta fazer": "#B45309"}


def P(*p):
    return os.path.join(DEF, *p)


def A(n):
    return os.path.join(ATUAL, f"a-{n:02d}.png")


# (bloco, tempo, origem, imagem ou None, observação)
PAGINAS = [
    ("0 · Abertura (Odisseu, variante A)", "0:30", "peça pronta", P("odisseu-argos", "previa-abertura.png"), "Decisão sua: Odisseu ou direto à capa"),
    ("1 · Parte 1 · Capa", "0:15", "apresentação atual", A(1), ""),
    ("1 · Parte 1 · Identificação", "0:40", "apresentação atual", A(2), "A foto da fachada é da Yasmin: trocar ou dar crédito"),
    ("1 · Parte 1 · O Rangel", "1:00", "protótipo", P("prototipo", "previa-1.png"), "Substitui o slide 4 atual"),
    ("1 · Parte 1 · Serviços", "1:00", "apresentação atual", A(4), "Hoje tem fotos da Yasmin; o esboço propõe um mosaico com fotos suas"),
    ("1 · Parte 1 · Ambientes", "0:50", "apresentação atual", A(5), "As 6 fotos são da Yasmin: trocar ou dar crédito"),
    ("1 · Parte 1 · Equipamentos", "1:00", "apresentação atual", A(6), "Falta só o título em frase"),
    ("1 · Parte 1 · Atividades realizadas", "1:00", "apresentação atual", A(7), "Aqui entram transfusão, exames, Barão e vacinas (decisões de 19/11)"),
    ("2 · O corpo do estágio", "0:45", "peça pronta", P("corpo-do-estagio", "previa-estatica.png"), ""),
    ("3 · O dia 1", "0:45", "protótipo", P("prototipo", "previa-extra-1.png"), ""),
    ("4a · Katita: a lesão e o resultado", "1:30", "protótipo", P("prototipo", "previa-2.png"), ""),
    ("4b · Katita: a cirurgia em 3D", "1:15", "apresentação atual", A(11), "Na defesa, a animação ao vivo (etapas 2, 3, 5 e 6, 48 s)"),
    ("4c · Katita: a rotina", "0:45", "apresentação atual", A(10), "Pós-operatório; título em frase a fazer"),
    ("5 · Bob", "1:30", "protótipo", P("prototipo", "previa-3.png"), ""),
    ("6 · Criocirurgia", "1:00", "apresentação atual", A(13), "Primeiro a sair se faltar tempo"),
    ("7 · Quimioterapia", "1:30", "protótipo", P("prototipo", "previa-4.png"), ""),
    ("7 · Quimioterapia: animação", "1:00", "peça pronta", sys.argv[2] if len(sys.argv) > 2 else None, "\"A seringa vermelha\": abertura e a cena dos 21 dias"),
    ("8 · Castrações (11/11 e 17/11)", "1:15", "apresentação atual", A(17), "Na defesa, a animação OSH (cenas 4, 6 e 8, 36 s); falta o slide do seu auxílio em 11/11"),
    ("8 e 12 · O par 17/11 → 19/11", "1:30", "protótipo", P("prototipo", "previa-extra-2.png"), "Decisão sua: entra?"),
    ("9 · Nodulectomia", "1:00", "apresentação atual", A(17), "Mesmo slide 17 atual; na defesa, a animação (cenas 3, 5 e 7, 27 s)"),
    ("10 · Esporotricose", "1:30", "protótipo", P("prototipo", "previa-5.png"), ""),
    ("11 · Fecaloma", "1:00", "protótipo", P("prototipo", "previa-extra-3.png"), ""),
    ("12 · A segunda eutanásia (19/11)", "0:45", "falta fazer", None, "Decisão sua: slide próprio, sem foto, ou só nas dificuldades"),
    ("13 · Dificuldades", "0:45", "apresentação atual", A(21), "Escolher 2 das 5 em fechamento/"),
    ("14 · Considerações finais", "1:00", "apresentação atual", A(22), "Falta a tese; imagem final: São Francisco ou Odisseu"),
    ("15 · Fechamento (Odisseu, variante B)", "0:30", "peça pronta", P("odisseu-argos", "previa-fechamento.png"), "Só se a abertura também for Odisseu"),
]


def pagina(i, total, bloco, tempo, origem, img, obs):
    pg = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(pg)
    f_b = ImageFont.truetype(FONTE_B, 34)
    f = ImageFont.truetype(FONTE, 24)
    f_s = ImageFont.truetype(FONTE, 20)
    d.text((40, 26), bloco, font=f_b, fill="#222222")
    d.text((40, 80), f"{tempo} previsto  ·  página {i}/{total}", font=f, fill="#555555")
    cor = CORES[origem]
    tw = d.textlength(origem, font=f) + 40
    d.rounded_rectangle((W - 40 - tw, 30, W - 40, 72), 18, fill=cor)
    d.text((W - 40 - tw + 20, 36), origem, font=f, fill="white")
    if obs:
        d.text((W - 40 - d.textlength(obs, font=f_s), 90), obs, font=f_s, fill=cor)
    d.line((40, TOPO - 10, W - 40, TOPO - 10), fill="#DDDDDD", width=2)
    area = (W - 80, H - TOPO - 30)
    if img and os.path.exists(img):
        im = ImageOps.exif_transpose(Image.open(img)).convert("RGB")
        im.thumbnail(area, Image.LANCZOS)
        x = (W - im.width) // 2
        pg.paste(im, (x, TOPO + 5))
        d.rectangle((x - 1, TOPO + 4, x + im.width, TOPO + 5 + im.height), outline="#CCCCCC")
    else:
        d.rounded_rectangle((40, TOPO + 5, W - 40, H - 30), 24, outline=cor, width=4)
        msg = "Slide a fazer"
        fb = ImageFont.truetype(FONTE_B, 48)
        d.text(((W - d.textlength(msg, font=fb)) / 2, H / 2 - 40), msg, font=fb, fill=cor)
    return pg


paginas = [pagina(i + 1, len(PAGINAS), *p) for i, p in enumerate(PAGINAS)]
saida = os.path.join(AQUI, "previa-defesa.pdf")
paginas[0].save(saida, save_all=True, append_images=paginas[1:], resolution=110, quality=80)
print("salvo:", saida, len(paginas), "páginas")
