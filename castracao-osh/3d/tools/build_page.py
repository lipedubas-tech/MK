"""Monta dist/osh-3d.html: um arquivo só, que abre sem internet (three.js, modelo e texturas embutidos)."""
import base64, os, re
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
rd = lambda *p: open(os.path.join(root, *p), encoding="utf-8").read()
b64 = lambda *p: base64.b64encode(open(os.path.join(root, *p), "rb").read()).decode()

data = 'var GLB="%s";\n' % b64("modelo", "source", "Cat.glb")
tex = {}
for nome in sorted(os.listdir(os.path.join(root, "build"))):
    if nome.endswith(".png"):
        tex[nome[:-4]] = "data:image/png;base64," + b64("build", nome)
data += "var TEX={%s};\n" % ",".join('%s:"%s"' % (k, v) for k, v in tex.items())
libs = "<script>" + rd("vendor", "three-r128.min.js") + "</script>\n<script>" + rd("vendor", "GLTFLoader-r128.js") + "</script>"
page = rd("src", "page.html").replace("@@THREE@@", libs).replace("@@APP@@", data + rd("src", "app.js"))
page = re.sub(r"@@IMG:([\w-]+)@@", lambda g: "data:image/jpeg;base64," + b64("img", g.group(1) + ".jpg"), page)
out = os.path.join(root, "dist", "osh-3d.html")
open(out, "w", encoding="utf-8").write(page)
print(out, round(len(page) / 1e6, 2), "MB")
