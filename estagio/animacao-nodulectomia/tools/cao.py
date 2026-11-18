"""Prepara o modelo 3D do cão (modelo-3d/cao.glb) para a animação da nodulectomia.

O modelo original é um labrador amarelo em pé, sem esqueleto. Aqui ele vira a paciente:
- pelagem preta com focinho grisalho (cadela SRD preta e idosa, fotos 4 a 6);
- pose de decúbito lateral direito, guardada como morph (a base continua sendo o cão em pé);
- volume do nódulo na parede torácica esquerda, logo caudal ao cotovelo, perto da axila (segundo morph);
- dados para a cena: olhos, boca, referencial do campo operatório e o relevo do pano de campo.

Saída em build/: cao.bin, cao.json, cao_cor.jpg (cor) e cao_rug.jpg (rugosidade).
Uso: python3 tools/cao.py
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from glb import carrega  # noqa: E402

RAIZ = os.path.normpath(os.path.join(AQUI, ".."))
SAIDA = os.path.join(RAIZ, "build")
os.makedirs(SAIDA, exist_ok=True)

P, N_glb, UV, T, COR = carrega(os.path.join(RAIZ, "modelo-3d", "cao.glb"))
NV = len(P)
x, y, z = P[:, 0], P[:, 1], P[:, 2]
ax = np.abs(x)


def suave(a, b, v):
    """smoothstep de a até b (a > b inverte o sentido)."""
    t = np.clip((v - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def rad(g):
    return np.radians(g)


# ---------------------------------------------------------------- normais
# vértices repetidos nas costuras de uv são soldados para a normal sair contínua
_chave = np.round(P * 1e5).astype(np.int64)
_, GRUPO = np.unique(_chave, axis=0, return_inverse=True)
GRUPO = GRUPO.ravel()


def normais(Q):
    fn = np.cross(Q[T[:, 1]] - Q[T[:, 0]], Q[T[:, 2]] - Q[T[:, 0]])
    acc = np.zeros((GRUPO.max() + 1, 3))
    for k in range(3):
        np.add.at(acc, GRUPO[T[:, k]], fn)
    n = acc[GRUPO]
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)


N0 = normais(P)

# ---------------------------------------------------------------- decúbito lateral direito
# Tudo no referencial do próprio cão: x = lado esquerdo, y = dorsal, z = cranial.
# Os membros giram em torno da altura do cotovelo e do joelho: os torácicos vão para a frente,
# os pélvicos para trás, e os de cima (esquerdos) caem em direção à mesa (−x).
# O pescoço dobra um pouco para a cabeça apoiar na mesa; a cauda também desce.


def pesos(Q0):
    qx, qy, qz = Q0[:, 0], Q0[:, 1], Q0[:, 2]
    qa = np.abs(qx)
    w = {}
    w["tor"] = suave(0.245, 0.185, qy) * suave(0.105, 0.14, qz) * suave(0.36, 0.31, qz) * suave(0.012, 0.038, qa)
    w["pel"] = suave(0.265, 0.20, qy) * suave(-0.12, -0.155, qz) * suave(-0.35, -0.31, qz) * suave(0.012, 0.038, qa)
    w["esq"] = suave(-0.01, 0.01, qx)
    w["cab"] = suave(0.19, 0.31, qz) * suave(0.25, 0.30, qy)
    w["cau"] = suave(-0.245, -0.30, qz) * suave(0.25, 0.285, qy) * suave(0.05, 0.03, qa)
    return w


def gira(Q, w, piv, ia, ib, ang):
    a = ang * w
    c, s = np.cos(a), np.sin(a)
    da = Q[:, ia] - piv[ia]
    db = Q[:, ib] - piv[ib]
    R = Q.copy()
    R[:, ia] = piv[ia] + da * c - db * s
    R[:, ib] = piv[ib] + da * s + db * c
    return R


MESA_X = -0.094  # lado direito do tronco: é ele que encosta na mesa


def deita(Q0):
    w = pesos(Q0)
    Q = Q0.copy()
    e, d = w["esq"], 1 - w["esq"]
    # membros torácicos: estendidos para a frente; o de cima cai sobre o de baixo
    pe, pd = np.array([0.05, 0.235, 0.19]), np.array([-0.05, 0.235, 0.19])
    Q = gira(Q, w["tor"] * e, pe, 2, 1, rad(42))
    Q = gira(Q, w["tor"] * e, pe, 0, 1, rad(-40))
    Q = gira(Q, w["tor"] * d, pd, 2, 1, rad(24))
    Q = gira(Q, w["tor"] * d, pd, 0, 1, rad(4))
    # membros pélvicos: estendidos para trás
    pe, pd = np.array([0.05, 0.24, -0.2]), np.array([-0.05, 0.24, -0.2])
    Q = gira(Q, w["pel"] * e, pe, 2, 1, rad(-34))
    Q = gira(Q, w["pel"] * e, pe, 0, 1, rad(-38))
    Q = gira(Q, w["pel"] * d, pd, 2, 1, rad(-14))
    Q = gira(Q, w["pel"] * d, pd, 0, 1, rad(4))
    # pescoço e cabeça descem até a mesa
    Q = gira(Q, w["cab"], np.array([0.0, 0.40, 0.19]), 0, 2, rad(14))
    # cauda deitada
    Q = gira(Q, w["cau"], np.array([0.0, 0.33, -0.245]), 0, 2, rad(-17))
    # o peso achata um pouco o que encosta na mesa
    abaixo = Q[:, 0] < MESA_X
    Q[abaixo, 0] = MESA_X - (MESA_X - Q[abaixo, 0]) * 0.18
    return Q


P_DEI = deita(P)
N_DEI = normais(P_DEI)

# ---------------------------------------------------------------- nódulo e referencial do campo
# Ponto da pele na parede torácica esquerda, caudal ao cotovelo, acima da axila.
perto = (np.abs(z - 0.095) < 0.012) & (np.abs(y - 0.272) < 0.012) & (x > 0)
i_sitio = int(np.argmax(np.where(perto, x, -1)))
C = P[i_sitio].copy()
NC = N0[i_sitio].copy()
# eixo maior do fuso: dorsoventral, com a ponta ventral 22° para cranial (como a sutura das fotos 5 e 8)
u_bruto = np.array([0.0, -np.cos(rad(22)), np.sin(rad(22))])
U = u_bruto - NC * NC.dot(u_bruto)
U /= np.linalg.norm(U)
V = np.cross(NC, U)

d = P - C
du, dv, dn = d @ U, d @ V, d @ NC
r2 = (du / 0.042) ** 2 + (dv / 0.034) ** 2
mask_nod = (r2 < 1) & (np.abs(dn) < 0.04) & (x > 0.02)
ALT_NOD = 0.019
desl_nod = np.zeros_like(P)
desl_nod[mask_nod] = (ALT_NOD * (1 - r2[mask_nod]) ** 2)[:, None] * NC[None, :]
N_NOD = normais(P + desl_nod)
idx_nod = np.where(mask_nod | (np.linalg.norm(N_NOD - N0, axis=1) > 1e-3))[0]

# ---------------------------------------------------------------- olhos e boca (para pálpebras, tubo e oxímetro)
OLHO_E = np.array([0.0265, 0.4555, 0.3785])
OLHO_D = OLHO_E * np.array([-1, 1, 1])
LINGUA = np.array([0.0, 0.40, 0.432])
BOCA = np.array([0.0, 0.405, 0.405])
# eixo do antebraço esquerdo (acesso venoso no pós-operatório): centro do anel de vértices em duas alturas
def centro_membro(alt):
    k = (np.abs(y - alt) < 0.006) & (x > 0.02) & (z > 0.12) & (z < 0.32)
    return P[k].mean(0)
ANTEB = [centro_membro(0.065), centro_membro(0.125)]
pontos = np.array([OLHO_E, OLHO_D, LINGUA, BOCA, C, ANTEB[0], ANTEB[1]])
pontos_dei = deita(pontos)

# ---------------------------------------------------------------- pesos: respirar, abanar a cauda e onde vão a tricotomia e a ferida
w = pesos(P)
resp = suave(-0.08, 0.0, z) * suave(0.27, 0.18, z) * suave(0.22, 0.27, y) * (1 - w["tor"]) * (1 - w["pel"])
cauda = w["cau"] * suave(-0.25, -0.33, z)
tronco = (1 - w["tor"]) * (1 - w["pel"]) * (1 - w["cab"]) * (1 - w["cau"])
aux = np.stack([np.round(resp * 255), np.round(cauda * 255), np.round(tronco * 255), np.zeros(NV)], axis=1).astype(np.uint8)

# ---------------------------------------------------------------- textura: pelagem preta e focinho grisalho
cor = np.asarray(COR, dtype=np.float64) / 255.0
TAM = cor.shape[0]
r_, g_, b_ = cor[..., 0], cor[..., 1], cor[..., 2]
mx, mn = cor.max(-1), cor.min(-1)
sat = (mx - mn) / (mx + 1e-6)
delta = mx - mn + 1e-6
hue = np.where(mx == r_, ((g_ - b_) / delta) % 6, np.where(mx == g_, (b_ - r_) / delta + 2, (r_ - g_) / delta + 4)) * 60
lum = 0.299 * r_ + 0.587 * g_ + 0.114 * b_
# pelo caramelo: matiz entre ~15° e ~58°, saturação média, nem muito escuro nem branco (dentes)
pelo = (suave(8, 18, hue) * suave(62, 52, hue) * suave(0.10, 0.20, sat) * suave(0.16, 0.28, mx)
        * (1 - suave(0.80, 0.9, mx) * suave(0.32, 0.22, sat)))


def borra(a, raio):
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(raio)), dtype=np.float64) / 255.0


lum_baixa = borra(lum, 10)
detalhe = lum / (borra(lum, 2.2) + 1e-3)
sombra = np.clip((lum_baixa / 0.62) ** 1.15, 0.35, 1.5)
fio = np.clip(1 + 2.4 * (detalhe - 1), 0.55, 1.7)
PRETO = np.array([0.105, 0.098, 0.112])
preto = PRETO[None, None, :] * (sombra * fio)[..., None]

# máscara do grisalho, desenhada no espaço uv a partir da posição 3D de cada triângulo
g_vert = np.maximum(
    suave(0.365, 0.41, z) * suave(0.335, 0.365, y),                                  # focinho
    0.85 * suave(0.31, 0.37, z) * suave(0.405, 0.375, y) * suave(0.045, 0.02, ax),   # queixo e garganta
)
g_vert = np.maximum(g_vert, 0.55 * np.exp(-np.sum((P - (OLHO_E + [0.004, 0.016, 0.004])) ** 2, 1) / 0.008 ** 2))
g_vert = np.maximum(g_vert, 0.55 * np.exp(-np.sum((P - (OLHO_D + [-0.004, 0.016, 0.004])) ** 2, 1) / 0.008 ** 2))
MT = 1024
im_g = Image.new("L", (MT, MT), 0)
dr = ImageDraw.Draw(im_g)
for tri in T[g_vert[T].max(1) > 0.01]:
    val = int(round(255 * g_vert[tri].mean()))
    dr.polygon([(UV[k, 0] * MT, UV[k, 1] * MT) for k in tri], fill=val)
im_g = im_g.filter(ImageFilter.GaussianBlur(2.5)).resize((TAM, TAM), Image.BILINEAR)
grisalho = np.asarray(im_g, dtype=np.float64) / 255.0
rng = np.random.default_rng(7)
ruido = borra(rng.random((TAM, TAM)), 0.8)
ruido = (ruido - ruido.min()) / (ruido.max() - ruido.min())
fios = 0.55 * ruido + 0.45 * np.clip((detalhe - 0.85) / 0.3, 0, 1)
fr = suave(1.06 - 0.62 * grisalho, 1.24 - 0.62 * grisalho, fios) * (grisalho > 0.02)
CINZA = np.array([0.56, 0.55, 0.565])
cinza = CINZA[None, None, :] * np.clip(0.85 + 0.6 * (detalhe - 1), 0.6, 1.2)[..., None]
pelagem = preto * (1 - fr[..., None]) + cinza * fr[..., None]
final = cor * (1 - pelo[..., None]) + pelagem * pelo[..., None]
Image.fromarray(np.clip(final * 255 + 0.5, 0, 255).astype(np.uint8)).save(
    os.path.join(SAIDA, "cao_cor.jpg"), quality=86, optimize=True, progressive=True)

# rugosidade: pelo fosco, trufa e lábios acetinados, língua e gengiva úmidas
vermelho = suave(0.25, 0.45, sat) * ((hue > 330) | (hue < 12)) * suave(0.25, 0.4, mx)
escuro = suave(0.2, 0.1, mx) * (1 - pelo)
rug = 0.66 * pelo + 0.6 * (1 - pelo)
rug = rug * (1 - escuro) + 0.42 * escuro
rug = rug * (1 - vermelho) + 0.3 * vermelho
im_r = Image.fromarray(np.clip(rug * 255, 0, 255).astype(np.uint8)).resize((512, 512), Image.BILINEAR)
Image.merge("RGB", (im_r, im_r, im_r)).save(os.path.join(SAIDA, "cao_rug.jpg"), quality=85)

# ---------------------------------------------------------------- relevo do campo e do pano
# Transformações para a cena (mesa em y=0, cabeça para −x, câmera do lado ventral em +z):
#   em pé:    mundo = (−z, y, x)
#   deitado:  mundo = (−z, x − xmin, −y + DZ)


XMIN = float(P_DEI[:, 0].min())
DZ = 0.24


def mundo_deitado(Q):
    return np.stack([-Q[:, 2], Q[:, 0] - XMIN, -Q[:, 1] + DZ], axis=1)


def rasteriza_max(pts2, alt, tris, x0, z0, passo, nx, nz, filtro=None):
    """Altura máxima por célula de uma grade regular (z-buffer simples, triângulo a triângulo)."""
    grade = np.full((nz, nx), -np.inf)
    gx, gz = np.meshgrid(x0 + passo * np.arange(nx), z0 + passo * np.arange(nz))
    for tri in tris:
        a, b, c = pts2[tri]
        mnx, mxx = min(a[0], b[0], c[0]), max(a[0], b[0], c[0])
        mnz, mxz = min(a[1], b[1], c[1]), max(a[1], b[1], c[1])
        i0, i1 = int(np.ceil((mnx - x0) / passo)), int(np.floor((mxx - x0) / passo))
        j0, j1 = int(np.ceil((mnz - z0) / passo)), int(np.floor((mxz - z0) / passo))
        i0, j0 = max(i0, 0), max(j0, 0)
        i1, j1 = min(i1, nx - 1), min(j1, nz - 1)
        if i1 < i0 or j1 < j0:
            continue
        sx = gx[j0:j1 + 1, i0:i1 + 1]
        sz = gz[j0:j1 + 1, i0:i1 + 1]
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-14:
            continue
        l1 = ((b[1] - c[1]) * (sx - c[0]) + (c[0] - b[0]) * (sz - c[1])) / den
        l2 = ((c[1] - a[1]) * (sx - c[0]) + (a[0] - c[0]) * (sz - c[1])) / den
        l3 = 1 - l1 - l2
        dentro = (l1 >= -1e-6) & (l2 >= -1e-6) & (l3 >= -1e-6)
        h = l1 * alt[tri[0]] + l2 * alt[tri[1]] + l3 * alt[tri[2]]
        sub = grade[j0:j1 + 1, i0:i1 + 1]
        np.maximum(sub, np.where(dentro, h, -np.inf), out=sub)
    return grade


# pele em volta do nódulo, no referencial (u, v, n) do sítio
dP = P - C
pu, pv, pn = dP @ U, dP @ V, dP @ NC
frente = (N0 @ NC > 0.2) & (np.abs(pn) < 0.06) & (x > 0)
tris_campo = T[frente[T].all(1)]
CAMPO = dict(u0=-0.16, v0=-0.12, passo=0.005, nu=65, nv=49)
g_campo = rasteriza_max(np.stack([pu, pv], 1), pn, tris_campo, CAMPO["u0"], CAMPO["v0"], CAMPO["passo"], CAMPO["nu"], CAMPO["nv"])
# buracos (fora do corpo) recebem a altura do vizinho válido mais próximo
ok = np.isfinite(g_campo)
if not ok.all():
    jj, ii = np.nonzero(ok)
    for j, i in zip(*np.nonzero(~ok)):
        k = np.argmin((jj - j) ** 2 + (ii - i) ** 2)
        g_campo[j, i] = g_campo[jj[k], ii[k]]

# pano de campo: cobre o cão deitado do pescoço para trás; relevo = corpo dilatado e suavizado
W = mundo_deitado(P_DEI)
PANO = dict(x0=-0.42, z0=-0.36, passo=0.01, nx=108, nz=73)
g_pano = rasteriza_max(W[:, [0, 2]], W[:, 1], T, PANO["x0"], PANO["z0"], PANO["passo"], PANO["nx"], PANO["nz"])
g_pano = np.where(np.isfinite(g_pano), g_pano, 0.0)
# dilatação (o pano não entra nos vãos) e suavização (pano tem rigidez)
from numpy.lib.stride_tricks import sliding_window_view  # noqa: E402
pad = np.pad(g_pano, 3, mode="edge")
g_pano = sliding_window_view(pad, (7, 7)).max(axis=(-1, -2))
for _ in range(3):
    pad = np.pad(g_pano, 2, mode="edge")
    g_pano = sliding_window_view(pad, (5, 5)).mean(axis=(-1, -2))
g_pano = np.maximum(g_pano, 0.0)

# ---------------------------------------------------------------- binário
partes = []
meta = {"nv": int(NV), "ni": int(T.size)}


def add(nome, arr):
    arr = np.ascontiguousarray(arr)
    off = sum(len(p) for p in partes)
    pad = (-off) % 4
    if pad:
        partes.append(b"\0" * pad)
        off += pad
    partes.append(arr.tobytes())
    meta[nome] = int(off)


pmin, pmax = P.min(0), P.max(0)
add("pos", np.round((P - pmin) / (pmax - pmin) * 65535).astype(np.uint16))
meta["pmin"], meta["pmax"] = pmin.round(6).tolist(), pmax.round(6).tolist()
add("nrm", np.round(N0 * 127).astype(np.int8))
dl = P_DEI - P
esc_dl = float(np.abs(dl).max()) / 32767
add("dpos_dei", np.round(dl / esc_dl).astype(np.int16))
meta["esc_dei"] = esc_dl
add("dnrm_dei", np.round(np.clip(N_DEI - N0, -2, 2) * 63).astype(np.int8))
add("uv", np.round(UV * 65535).astype(np.uint16))
add("idx", T.astype(np.uint16))
add("aux", aux)
add("nod_i", idx_nod.astype(np.uint16))
add("nod_p", desl_nod[idx_nod].astype(np.float32))
add("nod_n", (N_NOD - N0)[idx_nod].astype(np.float32))
meta["nod_n_count"] = int(len(idx_nod))
add("campo", g_campo.astype(np.float32))
add("pano", g_pano.astype(np.float32))
open(os.path.join(SAIDA, "cao.bin"), "wb").write(b"".join(partes))

meta.update({
    "campo_grade": CAMPO, "pano_grade": PANO,
    "xmin": XMIN, "dz": DZ, "mesa_x": MESA_X,
    "sitio": {"c": C.round(5).tolist(), "n": NC.round(5).tolist(), "u": U.round(5).tolist(), "v": V.round(5).tolist(),
              "alt_nod": ALT_NOD},
    "olho_e": pontos[0].round(4).tolist(), "olho_d": pontos[1].round(4).tolist(),
    "olho_e_dei": pontos_dei[0].round(4).tolist(), "olho_d_dei": pontos_dei[1].round(4).tolist(),
    "lingua": pontos[2].round(4).tolist(), "lingua_dei": pontos_dei[2].round(4).tolist(),
    "boca": pontos[3].round(4).tolist(), "boca_dei": pontos_dei[3].round(4).tolist(),
    "antebraco_dei": [pontos_dei[5].round(4).tolist(), pontos_dei[6].round(4).tolist()],
})
json.dump(meta, open(os.path.join(SAIDA, "cao.json"), "w"), separators=(",", ":"))
tam = os.path.getsize(os.path.join(SAIDA, "cao.bin"))
print("cao.bin %.0f KB, textura %.0f KB, rugosidade %.0f KB" % (
    tam / 1024, os.path.getsize(os.path.join(SAIDA, "cao_cor.jpg")) / 1024,
    os.path.getsize(os.path.join(SAIDA, "cao_rug.jpg")) / 1024))
print("sítio", C.round(4), "normal", NC.round(3), "xmin deitado", round(XMIN, 4), "vértices do nódulo", len(idx_nod))
