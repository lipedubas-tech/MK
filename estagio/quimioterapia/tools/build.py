"""Monta a página da quimioterapia num único arquivo HTML.

Uso:  python3 tools/build.py

- Embute as fotos de img/ e as fontes (baixadas uma vez para build/fonts/).
- Gera dist/quimio.html (a página publicada no Claude) e
  dist/quimio-offline.html (o mesmo, com cabeçalho HTML completo, para abrir
  direto no navegador sem internet no dia da defesa).
"""
import base64
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS_DIR = ROOT / "build" / "fonts"
CSS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Archivo:wdth,wght@62..125,300..900"
    "&family=IBM+Plex+Mono:wght@400;500"
    "&family=Caveat:wght@600&display=swap"
)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
SUBSETS = ("latin", "latin-ext")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return r.read()


def fonts_css():
    FONTS_DIR.mkdir(parents=True, exist_ok=True)
    cache = FONTS_DIR / "fonts.css"
    if not cache.exists():
        cache.write_bytes(get(CSS_URL))
    css = cache.read_text()
    out = []
    for subset, block in re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S):
        if subset not in SUBSETS:
            continue
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        f = FONTS_DIR / url.rsplit("/", 1)[1]
        if not f.exists():
            f.write_bytes(get(url))
        data = base64.b64encode(f.read_bytes()).decode()
        out.append(block.replace(url, "data:font/woff2;base64," + data))
    return "\n".join(out)


def img(name):
    data = (ROOT / "img" / f"{name}.jpg").read_bytes()
    return "data:image/jpeg;base64," + base64.b64encode(data).decode()


def main():
    page = (ROOT / "src" / "page.html").read_text()
    page = page.replace("{{FONTS}}", fonts_css())
    page = re.sub(r"\{\{img:(\w+)\}\}", lambda m: img(m.group(1)), page)
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    (dist / "quimio.html").write_text(page)
    offline = (
        '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        "</head>\n<body>\n" + page + "\n</body>\n</html>\n"
    )
    (dist / "quimio-offline.html").write_text(offline)
    for f in ("quimio.html", "quimio-offline.html"):
        print(f, round((dist / f).stat().st_size / 1024), "KB")


if __name__ == "__main__":
    main()
