"""Monta a página final: dist/katita.html (para publicar) e dist/katita-offline.html (abre sem internet)."""
import base64, json, os, re
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, "..")
rd = lambda *p: open(os.path.join(root, *p), encoding="utf-8").read()
b64 = lambda *p: base64.b64encode(open(os.path.join(root, *p), "rb").read()).decode()
orig = rd("original.html")
m = re.search(r'var A=\{POS:"[^"]+",(UV:"[^"]+",IDX:"[^"]+",LEFT:"[^"]+"),TEX:"data:image/jpeg;base64,[^"]+"\};', orig)
data = "var A={" + m.group(1) + "};\n"   # posições e textura do esqueleto vêm de KK
# esqueleto de fundo: normais suavizadas, sombra de contato e textura limpa (tools/skel_clean.py)
data += "var KK={meta:%s,bin:\"%s\",tex:\"data:image/jpeg;base64,%s\"};\n" % (json.dumps(json.load(open(os.path.join(root, "build", "skel.json"))), separators=(",", ":")), b64("build", "skel.bin"), b64("build", "skel_tex.jpg"))
for var, name in (("KB", "bones"), ("KI", "implants"), ("KS", "soft")):
    data += "var %s={meta:%s,bin:\"%s\"};\n" % (var, json.dumps(json.load(open(os.path.join(root, "build", name + ".json"))), separators=(",", ":")), b64("build", name + ".bin"))
page = rd("src", "page.html").replace("@@APP@@", data + rd("src", "app.js"))
page = re.sub(r"@@IMG:(\w+)@@", lambda g: "data:image/jpeg;base64," + b64("img", g.group(1) + ".jpg"), page)
cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
open(os.path.join(root, "dist", "katita.html"), "w", encoding="utf-8").write(page.replace("@@THREE@@", cdn))
three = os.environ.get("THREE_JS")
if three and os.path.exists(three):
    skel = '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
    # sem internet as fontes caem nas alternativas do sistema; o link sai para não esperar a rede
    page_off = re.sub(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?', "", page)
    off = skel + page_off.replace("@@THREE@@", "<script>" + open(three, encoding="utf-8").read() + "</script>") + "\n</body>\n</html>\n"
    open(os.path.join(root, "dist", "katita-offline.html"), "w", encoding="utf-8").write(off)
    print("offline", round(len(off) / 1e6, 2), "MB")
print("publicar", round(len(page) / 1e6, 2), "MB")
