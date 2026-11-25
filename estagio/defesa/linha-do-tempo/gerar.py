#!/usr/bin/env python3
"""Gera a linha do tempo do estágio (index.html e, opcionalmente, o PDF).

Lê as legendas originais das fotos em ../../informacoes-do-estagio.md e nos
LEIAME.md das pastas de fotos, sem alterar nenhum arquivo original.

Uso:
    python3 gerar.py            # gera index.html ao lado deste script
    python3 gerar.py --pdf      # também gera linha-do-tempo.pdf (fotos reduzidas)
"""
import html
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
ESTAGIO = AQUI.parent.parent  # .../estagio

# ---------------------------------------------------------------------------
# Dias do estágio: o que aconteceu e as ideias da defesa que surgiram.
# Fonte: diário e seções 2 e 8 de informacoes-do-estagio.md (resumo derivado).
# ---------------------------------------------------------------------------
DIAS = [
    {
        "data": "26/10", "titulo": "Antes do estágio",
        "casos": ["Raios-X pré-operatórios do cotovelo esquerdo da Katita (fratura em Y do úmero distal), feitos 2 dias antes do início."],
        "ideias": [], "reflexoes": [],
    },
    {
        "data": "28/10", "titulo": "Dia 01 — primeiro dia",
        "casos": [
            "Pastora alemã já morta ao chegar.",
            "Golden retriever morreu durante o ultrassom (falência múltipla), com a família presente.",
            "Salsicha com massas no fígado, no baço e nas mamas.",
            "Eutanásia de cão idoso sem qualidade de vida, depois de longa conversa com a dona.",
            "Pug com doença renal crônica; gato com esporotricose na pata; procedimento sob anestesia.",
            "Vacinas, antiparasitário, teste rápido FeLV/FIV, hemogramas e bioquímicos.",
        ],
        "reflexoes": ["O trabalho do veterinário é quase mais com humanos do que com animais; mais perto de São Francisco do que de um simples \"tratador\"."],
        "ideias": ["Juntar todos os exames de sangue e fazer algo visual com eles (virou o \"Microscópio do Estágio\")."],
    },
    {
        "data": "29/10", "titulo": "Dia 02 — cirurgia da Katita",
        "casos": [
            "Cirurgia da Katita com o Thiago: osteotomia do olécrano, 2 placas, parafuso intercondilar, banda de tensão. Mais de 4 horas.",
            "Bob, pinscher de 13 anos: claudicação de origem neurológica; bota ortopédica.",
            "Gato de rua branco internado; shih-tzu de 17 anos com soro 3 vezes por semana.",
        ],
        "reflexoes": [
            "\"Os animais têm uma alma muito pura.\"",
            "Começou a se envolver com gatos: o gato de rua se esfregava nos dedos sob o vidro da baia.",
            "Pulou o almoço para sentir o estresse da rotina; o papel do anestesista é garantir a sobrevivência.",
        ],
        "ideias": [],
    },
    {
        "data": "30/10", "titulo": "Dia 03",
        "casos": [
            "Luna, atropelada, com possível fratura de quadril (não confirmada).",
            "Atena, filhote resgatada; tutor cheio de perguntas sobre os cuidados.",
            "Seringas preparadas com antibiótico, anti-inflamatório e analgésicos.",
        ],
        "reflexoes": [], "ideias": [],
    },
    {
        "data": "03/11", "titulo": "Dia 04",
        "casos": ["Chegou o PDF da defesa da Yasmin (29 slides, descritiva)."],
        "reflexoes": [],
        "ideias": [
            "A defesa pode apostar em casos narrativos (Katita, Bob) e numa reflexão final.",
            "Primeira ideia de uma animação simples explicando a cirurgia da Katita.",
        ],
    },
    {
        "data": "04/11", "titulo": "Dia 05",
        "casos": [
            "Barão: linfoma na raiz dentária, cerca de 8 dentes extraídos.",
            "Cão com polidactilia (6 dedos). Várias vacinas V8/V10 e antirrábica.",
        ],
        "reflexoes": [],
        "ideias": ["Animação 2D da Katita ajustada com detalhes reais da sala (campo azul, mesa com estampa de onça, cilindro, monitor)."],
    },
    {
        "data": "05/11", "titulo": "Dia 06",
        "casos": [
            "Criocirurgia de melanoma com nitrogênio líquido.",
            "Mel Serafina, gata com anemia grave e provável FeLV.",
            "Nodulectomia na pálpebra com cauterização.",
        ],
        "reflexoes": [],
        "ideias": ["Animações da criocirurgia em 2D e 3D."],
    },
    {
        "data": "06/11", "titulo": "Dia 07",
        "casos": [
            "Ultrassom em gato paraplégico (cristais na bexiga).",
            "Cadela de 12 anos com mordida no pescoço: limpeza, sem sutura.",
            "Transfusão de sangue na Mel Serafina.",
            "Mel, labradora: laudo de hemangiossarcoma esplênico.",
        ],
        "reflexoes": [], "ideias": [],
    },
    {
        "data": "09/11", "titulo": "Segunda",
        "casos": ["Conversa sobre cinomose (nenhum caso há 1 ano) e parvovirose (sumiu da clínica)."],
        "reflexoes": [], "ideias": ["Pedir números concretos de parvovirose do ano passado e de agora."],
    },
    {
        "data": "10–11/11", "titulo": "Terça e quarta",
        "casos": [
            "Gato com cistite (ultrassom).",
            "Dobermann sem ultrassom: a dona recusou sedação.",
            "Banho e tosa.",
            "Castração de cadela: o Felipe segurou o útero com pinça para a Cláudia (auxílio sob supervisão).",
        ],
        "reflexoes": ["Os gatos na clínica quase sempre são FIV/FeLV ou cistite; a exceção foi a esporotricose."],
        "ideias": [],
    },
    {
        "data": "12/11", "titulo": "Quimioterapia",
        "casos": [
            "Quimioterapia com doxorrubicina em cão de 17 anos com sarcoma.",
            "Cistocentese ecoguiada em cão com suspeita de doença renal.",
        ],
        "reflexoes": [], "ideias": [],
    },
    {
        "data": "13/11", "titulo": "Katita em 3D",
        "casos": ["O Felipe enviou o modelo 3D do esqueleto de cachorro (.glb)."],
        "reflexoes": [],
        "ideias": [
            "Cirurgia da Katita sobre o esqueleto 3D.",
            "Rejeição das ideias interativas genéricas; escolha da \"Katita modo cinema\".",
            "O que funciona é material real: raio-X, fotos, modelo 3D. Ter plano B offline.",
        ],
    },
    {
        "data": "17/11", "titulo": "Castração da gata, nodulectomia e abdominocentese",
        "casos": [
            "Castração (OSH) de uma gata colorpoint, com fetos mumificados no útero.",
            "Nodulectomia em cadela preta idosa, na axila.",
            "Abdominocentese terapêutica em cadela caramelo: cerca de 3 L de líquido avermelhado drenados (causa a confirmar). O animal morreu depois (registrado em 23/11).",
        ],
        "reflexoes": [],
        "ideias": [
            "Briefings para animações da OSH e da nodulectomia.",
            "Animações 3D prontas depois (18/11): OSH em 11 cenas e nodulectomia em 11 cenas, ambas com versão offline.",
        ],
    },
    {
        "data": "18/11", "titulo": "O fundador, o fecaloma e a esporotricose",
        "casos": [
            "Conversa com o Rangel, fundador da clínica: queria grande porte, abriu para pet pela demanda da região; há 2 anos se afastou das consultas pelo estresse e hoje só vem para operar (autorizou contar).",
            "Cirurgia de fecaloma em gato, feita pelo Rangel com a Cláudia na anestesia: massa de fezes endurecidas retirada do intestino; o gato comeu pão; terceira cirurgia dele.",
            "Segundo caso de esporotricose: gato branco com feridas perto do olho e no pescoço.",
            "Autoclaves da sala de esterilização; Revolution Plus.",
        ],
        "reflexoes": ["O fundador que se afastou das consultas pelo peso de ter a vida dos animais nas mãos, mas continua operando."],
        "ideias": ["O Rangel abre a Parte 1 da defesa; o fecaloma como caso do oculto que sai do corpo."],
    },
    {
        "data": "19/11", "titulo": "Os filhotes e a segunda eutanásia",
        "casos": [
            "Ninhada de 7 gatinhos; um cachorro matou 4. Três sobreviventes internados; o creme com ferida infeccionada, olho doente e costela quebrada.",
            "Segunda eutanásia do estágio: uma cachorra grande que ainda andava; a veterinária não queria fazer; o tutor não acompanhou; veia difícil de achar (sem fotos).",
            "Visita da oncologista à clínica.",
        ],
        "reflexoes": [
            "Os 3 fetos que já estavam mortos na castração da gata (17/11) e os 3 filhotes que podem ser salvos hoje. O sofrimento desnecessário no mundo.",
            "Na eutanásia, o esforço para largar o dó, lembrando a frase da orientadora: \"se alguém tiver com dó, o bicho não morre\".",
        ],
        "ideias": [
            "Estrutura da defesa: primeiro a clínica em geral, depois os casos específicos.",
            "Registro detalhado não é critério para virar caso; exames e transfusão vão para atividades realizadas.",
            "O par 17/11 → 19/11 como possível abertura ou fechamento.",
            "Eixo da defesa: todos, em camadas (tese das pessoas, caráter, oculto, voz do paciente, tempo, mídia).",
            "Odisseu e o cão Argos (Odisseia, canto XVII) como imagem para os slides.",
        ],
    },
    {
        "data": "23/11", "titulo": "As radiografias da Dara",
        "casos": [
            "Radiografias de abdômen e coluna da Dara, em 3 projeções. Laudo do Thiago: extrusão discal mineralizada entre L3 e L4 e espondilose entre L2 e L4. Sinais clínicos e conduta a confirmar.",
        ],
        "reflexoes": [],
        "ideias": [
            "O palpite do Claude acertou a doença do disco, mas errou o local e não viu a espondilose: o laudo depende da imagem original e de quem sabe ler.",
        ],
    },
    {
        "data": "24/11", "titulo": "A terceira nodulectomia e as fotos dos ambientes",
        "casos": [
            "Mais uma nodulectomia, a terceira do estágio (animal, local e técnica a registrar).",
            "Fotos novas: o consultório, o internamento atualizado e São Francisco em melhor resolução.",
        ],
        "reflexoes": [],
        "ideias": [
            "Correção na animação da nodulectomia de 17/11: a antissepsia foi da lesão para fora.",
        ],
    },
    {
        "data": "25/11", "titulo": "Duas profilaxias",
        "casos": [
            "Duas profilaxias (limpeza dentária) com extração em dois cães de pequeno porte; a Cláudia fez a anestesia. Os dois se recuperam no internamento.",
        ],
        "reflexoes": [],
        "ideias": [],
    },
]

# Pastas de fotos -> dia da linha do tempo
PASTA_DIA = {
    "fotos/geral": "28/10",
    "fotos/dia02": "29/10",
    "fotos/dia06": "05/11",
    "fotos/dia07": "06/11",
    "fotos/quimio": "12/11",
    "fotos/dia-18-11": "18/11",
    "fotos/cirurgia-felino": "18/11",
    "fotos/abdominocentese-cao": "17/11",
    "fotos/dia-23-11": "23/11",
    "fotos/dia-24-11": "24/11",
    "fotos/dia-25-11": "25/11",
    "fotos/dia-19-11": "19/11",
    "animacao-osh/referencias": "17/11",
    "animacao-nodulectomia/referencias": "17/11",
    "apresentacao/capturas-3d": "13/11",
}

# Fotos com rostos ou nomes à vista (seção de privacidade do documento original)
SENSIVEIS = {
    "fotos/dia02/02", "fotos/dia02/03", "fotos/dia02/04", "fotos/dia02/08",
    "fotos/dia02/09", "fotos/dia02/10", "fotos/dia02/11", "fotos/dia02/12",
    "fotos/legendas/01", "fotos/quimio/03", "fotos/quimio/04", "fotos/dia07/01",
    "fotos/cirurgia-felino/01", "fotos/cirurgia-felino/08",
    "fotos/dia-23-11/01", "fotos/dia-23-11/02", "fotos/dia-23-11/03",
}


def legendas_do_documento():
    """Lê as linhas '| n | ![](caminho) | legenda |' do documento principal."""
    texto = (ESTAGIO / "informacoes-do-estagio.md").read_text(encoding="utf-8")
    achadas = {}
    for m in re.finditer(r"^\|\s*\d+\s*\|\s*!\[\]\(([^)]+)\)\s*\|\s*(.+?)\s*\|\s*$", texto, re.M):
        achadas.setdefault(m.group(1), m.group(2))
    return achadas


def legendas_leiame(pasta):
    leiame = ESTAGIO / pasta / "LEIAME.md"
    achadas = {}
    if leiame.exists():
        for m in re.finditer(r"^\|\s*([^|]+\.jpe?g)\s*\|\s*(.+?)\s*\|\s*$", leiame.read_text(encoding="utf-8"), re.M):
            achadas[f"{pasta}/{m.group(1).strip()}"] = m.group(2)
    return achadas


def dia_da_foto(rel):
    if rel.startswith("fotos/legendas/"):
        n = int(Path(rel).name[:2])
        return "29/10" if n <= 4 else "04/11"
    if rel.startswith("imagens/"):
        return "26/10" if "pre-operatorio" in rel else "29/10"
    for pasta, dia in PASTA_DIA.items():
        if rel.startswith(pasta + "/"):
            return dia
    return None


def coletar_fotos():
    legendas = legendas_do_documento()
    for pasta in ("fotos/dia-19-11",):
        legendas.update(legendas_leiame(pasta))
    fotos = {}
    pastas = list(PASTA_DIA) + ["fotos/legendas", "imagens"]
    for pasta in pastas:
        for f in sorted((ESTAGIO / pasta).glob("*.jp*g")):
            rel = f"{pasta}/{f.name}"
            dia = dia_da_foto(rel)
            if not dia:
                continue
            leg = legendas.get(rel, "")
            if not leg:
                leg = f.stem.split("-", 1)[-1].replace("-", " ").capitalize() + " (sem legenda original)"
            sensivel = any(rel.startswith(p + "-") for p in SENSIVEIS)
            fotos.setdefault(dia, []).append({"rel": rel, "legenda": leg, "sensivel": sensivel})
    return fotos


def md_inline(t):
    t = html.escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
    return t


def lista(titulo, itens, classe):
    if not itens:
        return ""
    lis = "".join(f"<li>{md_inline(i)}</li>" for i in itens)
    return f'<div class="bloco {classe}"><h4>{titulo}</h4><ul>{lis}</ul></div>'


def gerar_html(base_img):
    fotos = coletar_fotos()
    lazy = ' loading="lazy"' if base_img else ""
    total = sum(len(v) for v in fotos.values())
    secoes = []
    for d in DIAS:
        fs = fotos.get(d["data"], [])
        if d["data"] == "10–11/11":
            fs = []
        galeria = ""
        if fs:
            cards = []
            for f in fs:
                aviso = '<span class="aviso">rosto ou nome visível</span>' if f["sensivel"] else ""
                cards.append(
                    f'<figure><img{lazy} src="{base_img}{html.escape(f["rel"])}" alt="">'
                    f'<figcaption>{md_inline(f["legenda"])}{aviso}</figcaption></figure>'
                )
            galeria = f'<div class="galeria">{"".join(cards)}</div>'
        else:
            galeria = '<p class="semfoto">Sem fotos no repositório para este dia.</p>'
        secoes.append(f"""
<section class="dia" id="d{re.sub(r'[^0-9]', '', d['data'])}">
  <div class="marca"><span class="data">{d['data']}</span></div>
  <div class="conteudo">
    <h3>{html.escape(d['titulo'])} <small>{len(fs)} foto{'s' if len(fs) != 1 else ''}</small></h3>
    <div class="blocos">
      {lista('Casos e atividades', d['casos'], 'casos')}
      {lista('Reflexões', d['reflexoes'], 'reflexoes')}
      {lista('Ideias para a defesa', d['ideias'], 'ideias')}
    </div>
    {galeria}
  </div>
</section>""")
    indice = "".join(
        f'<a href="#d{re.sub(r"[^0-9]", "", d["data"])}">{d["data"]}</a>' for d in DIAS
    )
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Linha do tempo do estágio</title>
<style>
:root {{
  --fundo:#f7f5f0; --papel:#ffffff; --tinta:#1f2328; --suave:#5b636e; --linha:#d9d4c7;
  --casos:#2f6f5e; --reflexoes:#7a4b8c; --ideias:#b0661c; --aviso:#a8322d;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --fundo:#16181b; --papel:#1f2226; --tinta:#e8e6e1; --suave:#a3a9b1; --linha:#3a3f45;
    --casos:#6cc2a8; --reflexoes:#c79be0; --ideias:#e8a35c; --aviso:#ef7d76;
  }}
}}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--fundo); color:var(--tinta);
  font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }}
header {{ max-width:1100px; margin:0 auto; padding:32px 16px 8px; }}
header h1 {{ margin:0 0 4px; font-size:2rem; letter-spacing:-0.01em; }}
header p {{ margin:4px 0; color:var(--suave); }}
nav {{ position:sticky; top:0; z-index:2; background:var(--fundo); border-bottom:1px solid var(--linha); }}
nav div {{ max-width:1100px; margin:0 auto; padding:8px 16px; display:flex; gap:6px; overflow-x:auto; }}
nav a {{ flex:none; padding:4px 10px; border:1px solid var(--linha); border-radius:999px;
  color:var(--tinta); text-decoration:none; font-size:.85rem; background:var(--papel); }}
main {{ max-width:1100px; margin:0 auto; padding:16px; }}
.dia {{ display:grid; grid-template-columns:92px 1fr; gap:16px; position:relative; padding-bottom:28px; }}
.dia::before {{ content:""; position:absolute; left:45px; top:0; bottom:0; width:2px; background:var(--linha); }}
.marca {{ position:relative; z-index:1; }}
.data {{ display:inline-block; background:var(--tinta); color:var(--fundo); font-weight:700;
  padding:4px 8px; border-radius:6px; font-size:.9rem; white-space:nowrap; }}
.conteudo {{ background:var(--papel); border:1px solid var(--linha); border-radius:10px; padding:16px; min-width:0; }}
h3 {{ margin:0 0 10px; font-size:1.25rem; }}
h3 small {{ color:var(--suave); font-weight:400; font-size:.8rem; margin-left:6px; }}
.blocos {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }}
.bloco h4 {{ margin:0 0 4px; font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; }}
.bloco ul {{ margin:0; padding-left:18px; }}
.casos h4 {{ color:var(--casos); }} .reflexoes h4 {{ color:var(--reflexoes); }} .ideias h4 {{ color:var(--ideias); }}
.galeria {{ margin-top:14px; display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; }}
figure {{ margin:0; border:1px solid var(--linha); border-radius:8px; overflow:hidden; background:var(--fundo); break-inside:avoid; }}
figure img {{ display:block; width:100%; aspect-ratio:4/3; object-fit:cover; }}
figcaption {{ padding:6px 8px; font-size:.78rem; color:var(--suave); }}
.aviso {{ display:block; margin-top:4px; color:var(--aviso); font-weight:600; }}
.semfoto {{ margin:12px 0 0; color:var(--suave); font-style:italic; font-size:.9rem; }}
footer {{ max-width:1100px; margin:0 auto; padding:16px 16px 40px; color:var(--suave); font-size:.85rem; }}
@media (max-width:600px) {{
  .dia {{ grid-template-columns:1fr; }} .dia::before {{ display:none; }}
}}
@media print {{
  nav {{ display:none; }} body {{ background:#fff; }}
  .dia {{ break-inside:auto; }} .conteudo {{ border-color:#ccc; }}
  .galeria {{ grid-template-columns:repeat(4,1fr); }}
}}
</style>
</head>
<body>
<header>
  <h1>Linha do tempo do estágio</h1>
  <p>Mundo Animal Clínica Veterinária, Sombrio (SC) · 28/10 a 07/12/2026 · {len(DIAS)} momentos · {total} fotos</p>
  <p>Fotos e legendas originais do repositório; textos dos dias resumidos do diário. Interpretações clínicas a confirmar com a Cláudia ou o Thiago.
  As fotos marcadas em vermelho mostram rosto ou nome: cobrir antes de usar em slides.</p>
</header>
<nav><div>{indice}</div></nav>
<main>{''.join(secoes)}</main>
<footer>Gerado por <code>estagio/defesa/linha-do-tempo/gerar.py</code>. Para atualizar com dias novos, acrescente o dia na lista <code>DIAS</code> e rode o script de novo.</footer>
</body>
</html>"""


def main():
    (AQUI / "index.html").write_text(gerar_html("../../"), encoding="utf-8")
    print("index.html gerado")
    if "--pdf" in sys.argv:
        gerar_pdf()


def gerar_pdf():
    import tempfile
    from PIL import Image
    import subprocess

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for dia_fotos in coletar_fotos().values():
            for f in dia_fotos:
                destino = tmp / f["rel"]
                destino.parent.mkdir(parents=True, exist_ok=True)
                with Image.open(ESTAGIO / f["rel"]) as im:
                    im = im.convert("RGB")
                    im.thumbnail((640, 640))
                    im.save(destino, "JPEG", quality=72)
        pagina = tmp / "pdf.html"
        pagina.write_text(gerar_html(""), encoding="utf-8")
        saida = AQUI / "linha-do-tempo.pdf"
        js = (
            "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
            "const p=await b.newPage();await p.emulateMedia({colorScheme:'light'});"
            "await p.goto(process.argv[1],{waitUntil:'networkidle'});"
            "await p.pdf({path:process.argv[2],format:'A4',printBackground:true,"
            "margin:{top:'12mm',bottom:'12mm',left:'10mm',right:'10mm'}});await b.close();})();"
        )
        subprocess.run(["node", "-e", js, pagina.as_uri(), str(saida)], check=True)
    print("linha-do-tempo.pdf gerado")


if __name__ == "__main__":
    main()
