"""Monta a página final a partir de src/ e build/.

- dist/nodulectomia.html: versão para publicar (carrega o Three.js r128 do cdnjs e a fonte do Google Fonts);
- index.html: arquivo único que abre sem internet, com o Three.js embutido.
  Sem internet, a fonte cai na sans-serif do sistema.

Uso: THREE_JS=caminho/three.min.js python3 tools/build_page.py
(sem THREE_JS, só a versão para publicar é gerada).
"""
import base64
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, ".."))


def le(*p):
    return open(os.path.join(RAIZ, *p), encoding="utf-8").read()


def b64(*p):
    return base64.b64encode(open(os.path.join(RAIZ, *p), "rb").read()).decode()


meta = json.load(open(os.path.join(RAIZ, "build", "cao.json")))
dados = "var KC={meta:%s,bin:\"%s\",cor:\"data:image/jpeg;base64,%s\",rug:\"data:image/jpeg;base64,%s\"};\n" % (
    json.dumps(meta, separators=(",", ":")), b64("build", "cao.bin"), b64("build", "cao_cor.jpg"), b64("build", "cao_rug.jpg"))
# o código fica em partes, na ordem em que roda: base e sala, campo operatório, mesa de instrumentais, interface
PARTES = ["app.js", "campo.js", "bandeja.js", "fim.js"]
codigo = "".join(le("src", p) for p in PARTES if os.path.exists(os.path.join(RAIZ, "src", p)))
pagina = le("src", "page.html").replace("@@APP@@", dados + codigo)
CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
os.makedirs(os.path.join(RAIZ, "dist"), exist_ok=True)
open(os.path.join(RAIZ, "dist", "nodulectomia.html"), "w", encoding="utf-8").write(pagina.replace("@@THREE@@", CDN))
print("publicar: %.2f MB" % (len(pagina) / 1e6))

three = os.environ.get("THREE_JS")
if three and os.path.exists(three):
    cab = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n')
    sem_fonte = re.sub(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?', "", pagina)
    off = cab + sem_fonte.replace("@@THREE@@", "<script>" + open(three, encoding="utf-8").read() + "</script>") + "\n</body>\n</html>\n"
    open(os.path.join(RAIZ, "index.html"), "w", encoding="utf-8").write(off)
    print("offline (index.html): %.2f MB" % (len(off) / 1e6))
