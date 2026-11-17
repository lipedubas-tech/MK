"""Repinta a textura da gata (modelo "Cat by Sumpitueslag", CC BY 4.0) como pelagem colorpoint, igual à paciente:
corpo creme-claro; orelhas, máscara do focinho, patas e cauda cinza-azulados; olhos azuis; trufa cinza.

Como funciona: para cada vértice calcula-se o quanto ele é "ponta" (extremidade), a partir dos pesos de osso do
próprio modelo (patas, cauda, focinho) e da posição na cabeça (máscara e orelhas). Esse valor é rasterizado no
espaço UV da textura e vira a mistura entre creme e cinza-azulado. O pelo original entra só como detalhe
(alta frequência), sem as manchas tricolores.

Saída: build/corpo.png, build/rosto.png, build/pelo.png
"""
import json, os, struct
import numpy as np
from PIL import Image, ImageFilter

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
glb = open(os.path.join(root, "modelo", "source", "Cat.glb"), "rb").read()
L = struct.unpack("<I", glb[12:16])[0]
J = json.loads(glb[20:20 + L])
BIN = glb[20 + L + 8:]


def acc(i):
    a = J["accessors"][i]
    bv = J["bufferViews"][a["bufferView"]]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    dt = {5126: np.float32, 5123: np.uint16, 5121: np.uint8, 5125: np.uint32}[a["componentType"]]
    off = bv.get("byteOffset", 0) + a.get("byteOffset", 0)
    return np.frombuffer(BIN, dt, a["count"] * n, off).reshape(a["count"], n).astype(np.float64 if dt == np.float32 else np.int64)


def image_of(material_index):
    tex = J["materials"][material_index]["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    img = J["images"][J["textures"][tex]["source"]]
    bv = J["bufferViews"][img["bufferView"]]
    import io
    return Image.open(io.BytesIO(BIN[bv.get("byteOffset", 0):bv.get("byteOffset", 0) + bv["byteLength"]])).convert("RGBA")


names = [J["nodes"][k]["name"] for k in J["skins"][0]["joints"]]
PESO_PONTA = {"L__FrontPaw": 1, "R_FrontPaw": 1, "L_Arm": .6, "R_Arm": .6, "L_Shoulder": .12, "R_Shoulder": .12,
              "L_BackPaw": 1, "R_BackPaw": 1, "L_Leg": .6, "R_Leg": .6, "L_Thigh": .1, "R_Thigh": .1,
              "Tail": .75, "Tail1": 1, "Tail2": 1, "Mouth": .95}


def ss(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def pontas(prim):
    at = prim["attributes"]
    P, Jt, W = acc(at["POSITION"]), acc(at["JOINTS_0"]), acc(at["WEIGHTS_0"])
    k = np.zeros(len(P))
    for c in range(4):
        nm = [names[j] for j in Jt[:, c]]
        k += W[:, c] * np.array([PESO_PONTA.get(n, 0) for n in nm])
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    # cabeça: máscara no focinho e ao redor dos olhos, mais as orelhas; testa e bochechas de trás ficam claras
    mascara = ss(.292, .325, z) * (1 - .35 * ss(.355, .385, y) * (1 - ss(.31, .335, z)))
    orelha = ss(.352, .372, y) * (1 - ss(.30, .325, z) * .2)
    cab = np.maximum(mascara, orelha) * ss(.19, .23, z)
    pesoCab = sum(W[:, c] * np.isin(Jt[:, c], [names.index("Head"), names.index("Neck")]) for c in range(4))
    k = np.maximum(k, cab * np.clip(pesoCab * 1.6, 0, 1))
    # o ventre e o peito ficam um pouco mais claros que o dorso
    ventral = 1 - ss(.08, .2, y)
    return np.clip(k, 0, 1), ventral, acc(at["TEXCOORD_0"]), acc(prim["indices"]).reshape(-1, 3)


def rasteriza(W, H, uv, tri, vals):
    """Interpola valores por vértice no espaço UV (com preenchimento das bordas)."""
    out = np.zeros((H, W, len(vals)))
    cob = np.zeros((H, W))
    px = uv * [W, H]
    for a, b, c in tri:
        p = px[[a, b, c]]
        x0, y0 = np.floor(p.min(0)).astype(int)
        x1, y1 = np.ceil(p.max(0)).astype(int)
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W - 1), min(y1, H - 1)
        if x1 < x0 or y1 < y0:
            continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
        d = (p[1, 1] - p[2, 1]) * (p[0, 0] - p[2, 0]) + (p[2, 0] - p[1, 0]) * (p[0, 1] - p[2, 1])
        if abs(d) < 1e-9:
            continue
        l0 = ((p[1, 1] - p[2, 1]) * (gx - p[2, 0]) + (p[2, 0] - p[1, 0]) * (gy - p[2, 1])) / d
        l1 = ((p[2, 1] - p[0, 1]) * (gx - p[2, 0]) + (p[0, 0] - p[2, 0]) * (gy - p[2, 1])) / d
        l2 = 1 - l0 - l1
        m = (l0 >= -.02) & (l1 >= -.02) & (l2 >= -.02)
        for i, v in enumerate(vals):
            out[y0:y1 + 1, x0:x1 + 1, i][m] = (l0 * v[a] + l1 * v[b] + l2 * v[c])[m]
        cob[y0:y1 + 1, x0:x1 + 1][m] = 1
    # espalha para fora das ilhas UV (evita costuras) com médias sucessivas
    for _ in range(24):
        if cob.all():
            break
        soma = np.zeros_like(out)
        n = np.zeros_like(cob)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            soma += np.roll(np.roll(out * cob[..., None], dy, 0), dx, 1)
            n += np.roll(np.roll(cob, dy, 0), dx, 1)
        novo = (cob == 0) & (n > 0)
        out[novo] = soma[novo] / n[novo][:, None]
        cob[novo] = 1
    return out


def suaviza(campo, r):
    im = Image.fromarray((np.clip(campo, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im).astype(np.float64) / 255


def srgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)]) / 255.0


CREME, CREME_VENTRE, PONTA = srgb("#ece0cc"), srgb("#f6efe3"), srgb("#6c727d")


def detalhe(rgb, r):
    """Só a textura fina do pelo, sem as manchas tricolores: cada pixel é classificado como pelo branco, laranja ou
    preto; a luminância é dividida pela média da sua classe e depois pela média local."""
    c = rgb[..., :3]
    lum = c @ [.299, .587, .114]
    sat = c.max(-1) - c.min(-1)
    preto = suaviza(ss(.36, .24, lum), 1.2)
    laranja = suaviza(ss(.10, .2, sat) * (1 - ss(.36, .24, lum)), 1.2)
    branco = np.clip(1 - preto - laranja, 0, 1)
    def media(m):
        return (lum * m).sum() / max(m.sum(), 1)
    ref = branco * media(branco) + laranja * media(laranja) + preto * media(preto)
    n = lum / np.maximum(ref, .04)
    med = np.asarray(Image.fromarray((np.clip(n / 2, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))) / 127.5
    d = np.clip(n / np.maximum(med, .05), .6, 1.3)
    # na borda entre manchas a classificação é incerta: ali o detalhe é atenuado para não desenhar o contorno
    borda = np.clip((np.abs(suaviza(preto, 4) - preto) + np.abs(suaviza(laranja, 4) - laranja)) * 4, 0, 1)
    borda = suaviza(borda, 2)
    return d * (1 - borda) + (1 + (d - 1) * .3) * borda


def pinta(img, prim, raio_det, protegidos, extra=()):
    W, H = img.size
    rgb = np.asarray(img).astype(np.float64) / 255
    k, ven, uv, tri = pontas(prim)
    campos = rasteriza(W, H, uv, tri, [k, ven])
    kp = campos[..., 0]
    for m, v in extra:
        kp = np.maximum(kp, m(W, H) * v)
    kp = suaviza(kp, W / 170)
    vn = suaviza(campos[..., 1], W / 170)
    base = CREME + (CREME_VENTRE - CREME) * vn[..., None]
    cor = base + (PONTA - base) * kp[..., None]
    det = detalhe(rgb, raio_det)[..., None]
    novo = np.clip(cor * (.42 + .58 * det), 0, 1)
    # áreas que não são pelo (olho, boca, almofadas) mantêm a pintura original, com ajustes próprios
    for m, ajuste in protegidos:
        mm = m(W, H)[..., None]
        novo = novo * (1 - mm) + ajuste(rgb[..., :3]) * mm
    out = np.dstack([novo, rgb[..., 3:4]])
    return Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")


def circulo(cx, cy, r, borda=3, ry=None):
    def m(W, H):
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.hypot(xx - cx, (yy - cy) * r / (ry or r))
        return np.clip((r - d) / borda, 0, 1)
    return m


def retangulo(x0, y0, x1, y1, borda=3):
    def m(W, H):
        yy, xx = np.mgrid[0:H, 0:W]
        return np.clip(np.minimum.reduce([xx - x0, x1 - xx, yy - y0, y1 - yy]) / borda, 0, 1)
    return m


def olho_azul(rgb):
    """Íris amarela vira azul-clara; pupila e brilho ficam."""
    lum = rgb @ [.299, .587, .114]
    sat = rgb.max(-1) - rgb.min(-1)
    azul = np.stack([.55 * lum + .12, .78 * lum + .2, lum * 1.0 + .32], -1)
    t = np.clip(sat * 3, 0, 1)[..., None]
    return np.clip(rgb * (1 - t) + azul * t, 0, 1)


def igual(rgb):
    return rgb


def almofada(rgb):
    """Almofadas plantares: rosa-acinzentado, como nas patas colorpoint."""
    lum = (rgb @ [.299, .587, .114])[..., None]
    return np.clip(lum * np.array([1.05, .82, .86]) + .1, 0, 1)


def trufa(rgb):
    lum = (rgb @ [.299, .587, .114])[..., None]
    return np.clip(lum * np.array([.62, .66, .74]), 0, 1)


prims = J["meshes"][0]["primitives"]
os.makedirs(os.path.join(root, "build"), exist_ok=True)

corpo = pinta(image_of(prims[0]["material"]), prims[0], 10, [
    # coordenadas na imagem embutida no .glb (de cabeça para baixo em relação às PNGs da pasta textures/)
    (circulo(48, 206, 40), olho_azul),
    (circulo(42, 396, 17), almofada),
    (retangulo(262, 362, 304, 408), igual),
    (retangulo(458, 144, 500, 233), igual),
])
corpo.convert("RGB").save(os.path.join(root, "build", "corpo.png"), optimize=True)

rosto = pinta(image_of(prims[1]["material"]), prims[1], 6, [
    (retangulo(194, 20, 250, 110, 4), igual),
    (circulo(128, 186, 9, 3), trufa),
], extra=[
    # máscara do focinho (olhos, almofadas dos bigodes e queixo) e orelhas, no espaço da textura do rosto
    (circulo(128, 182, 58, 34, 66), .9),
    (circulo(128, 186, 34, 22, 40), 1.08),
    (circulo(73, 122, 26, 18, 42), .9),
    (circulo(183, 122, 26, 18, 42), .9),
    (retangulo(52, 4, 204, 96, 14), .85),
])
rosto.convert("RGB").save(os.path.join(root, "build", "rosto.png"), optimize=True)

# pelo da cauda (cartões com transparência): cinza-azulado, mantendo o alfa original
pelo = np.asarray(image_of(prims[2]["material"])).astype(np.float64) / 255
lum = pelo[..., :3] @ [.299, .587, .114]
pelo[..., :3] = np.clip(PONTA * (.55 + .6 * lum[..., None]), 0, 1)
Image.fromarray((pelo * 255).round().astype(np.uint8), "RGBA").save(os.path.join(root, "build", "pelo.png"), optimize=True)
print("texturas em build/: corpo.png, rosto.png, pelo.png")
