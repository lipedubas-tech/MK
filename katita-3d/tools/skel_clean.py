"""Ajustes de render do esqueleto de fundo, sem remodelar a malha.

A malha e a textura vêm do .glb (guardadas em original.html). Estes problemas apareciam na tela:
- costuras de UV: cada vértice duplicado numa costura ganhava uma normal diferente, e a luz
  marcava riscos e facetas pelo esqueleto todo (metade dos vértices tinha esse salto);
- textura com sombra e sujeira "assadas": manchas quase pretas na bacia, no pescoço e nas
  costelas, pontinhos roxos nas patas e ruído fino de JPEG;
- emendas do membro operado: onde o úmero, o rádio e a ulna esculpidos encontram o osso do
  modelo, sobravam "dentes" de triângulos cortados para fora do osso novo.

Este programa gera em build/:
- skel.bin: posições (float32 x3), normais suavizadas nas costuras (int8 x3) e oclusão
  ambiente por vértice (uint8), calculada lançando raios contra a própria malha;
- skel.json: onde começa cada bloco dentro de skel.bin;
- skel_tex.jpg: a textura limpa (mesmo relevo, sem manchas, sem ruído e sem pontinhos coloridos).
"""
import base64, io, json, os, re
import numpy as np
from PIL import Image
from scipy import ndimage

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, "..")
out = os.path.join(root, "build")
h = open(os.path.join(root, "original.html"), encoding="utf-8").read()
m = re.search(r'var A=\{POS:"([^"]+)",UV:"([^"]+)",IDX:"([^"]+)",LEFT:"([^"]+)",TEX:"data:image/jpeg;base64,([^"]+)"', h)
P = np.frombuffer(base64.b64decode(m.group(1)), dtype=np.float32).reshape(-1, 3).astype(np.float64)
UV = np.frombuffer(base64.b64decode(m.group(2)), dtype=np.float32).reshape(-1, 2)
I = np.frombuffer(base64.b64decode(m.group(3)), dtype=np.uint16).reshape(-1, 3).astype(np.int64)
TEX = Image.open(io.BytesIO(base64.b64decode(m.group(5)))).convert("RGB")
nv = len(P)

# ---------- 0. emendas do membro operado ----------
# Os triângulos do cotovelo original saem da página (o cotovelo é esculpido à parte), e o corte
# deixava pontas soltas acima do úmero novo e entre o rádio e a ulna. As pontas que sobram são
# recolhidas para dentro do osso esculpido: ficam escondidas e a emenda vira uma linha limpa.
LEFT = np.frombuffer(base64.b64decode(m.group(4)), dtype=np.uint8).astype(bool)
KB = json.load(open(os.path.join(out, "bones.json"))); kbuf = open(os.path.join(out, "bones.bin"), "rb").read()
klo, khi = np.array(KB["lo"]), np.array(KB["hi"])
def piece(name):
    p = [q for q in KB["pieces"] if q["name"] == name][0]
    qv = np.frombuffer(kbuf[p["off"]:p["off"] + p["nv"] * 6], dtype=np.uint16).reshape(-1, 3)
    return klo + qv / 65535 * (khi - klo)
def section(B, y):
    s = B[np.abs(B[:, 1] - y) < .004]
    c = (s.max(0) + s.min(0)) / 2; r = (s.max(0) - s.min(0)) / 2
    return c, r
HS, RA = piece("hShaft"), piece("radius")
def smooth(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
moved = 0
for v in np.where(LEFT)[0]:
    y = P[v, 1]
    if .02 < y < .112:   k, (c, r) = 1 - smooth(.099, .112, y), section(HS, min(y, .096))
    elif -.264 < y < -.1: k, (c, r) = smooth(-.264, -.25, y), section(RA, max(y, -.248))
    else: continue
    if k <= 0: continue
    o = P[v, [0, 2]] - c[[0, 2]]; rho = np.sqrt((o[0] / r[0]) ** 2 + (o[1] / r[2]) ** 2)
    lim = .72                                            # 72% do raio do osso esculpido
    if rho > lim:
        P[v, [0, 2]] = c[[0, 2]] + o * (1 - k + k * lim / rho); moved += 1

# ---------- 1. normais: soldar os vértices duplicados nas costuras de UV ----------
key = np.round(P / 2e-5).astype(np.int64)
_, grp = np.unique(key, axis=0, return_inverse=True); grp = grp.ravel()
fn = np.cross(P[I[:, 1]] - P[I[:, 0]], P[I[:, 2]] - P[I[:, 0]])            # normal x 2*área
fu = fn / np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-15)
own = np.zeros((nv, 3))
for k in range(3): np.add.at(own, I[:, k], fn)
own /= np.maximum(np.linalg.norm(own, axis=1, keepdims=True), 1e-15)
faces_of = {}
for f in range(len(I)):
    for k in range(3): faces_of.setdefault(grp[I[f, k]], []).append(f)
N = np.zeros((nv, 3)); COS = np.cos(np.radians(70))   # quinas de verdade (acima de 70 graus) continuam vivas
for v in range(nv):
    fl = np.array(faces_of[grp[v]])
    ok = fl[(fu[fl] @ own[v]) > COS]
    s = fn[ok].sum(0) if len(ok) else own[v]
    N[v] = s / max(np.linalg.norm(s), 1e-15)

# ---------- 2. oclusão ambiente por vértice ----------
rng = np.random.default_rng(7)
NR, MAXD, EPS = 48, .07, 4e-4
# direções em cosseno no hemisfério +Z, giradas depois para a normal de cada vértice
u1, u2 = rng.random(NR), rng.random(NR)
r, ph = np.sqrt(u1), 2 * np.pi * u2
D0 = np.stack([r * np.cos(ph), r * np.sin(ph), np.sqrt(1 - u1)], 1)
A0, B0, C0 = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]
E1, E2 = B0 - A0, C0 - A0
cen = (A0 + B0 + C0) / 3; rad = np.max(np.linalg.norm(np.stack([A0, B0, C0]) - cen, axis=2), 0)
def basis(n):
    a = np.array([1., 0, 0]) if abs(n[0]) < .9 else np.array([0, 1., 0])
    t = np.cross(n, a); t /= np.linalg.norm(t); return t, np.cross(n, t)
AO = np.ones(nv)
_, first = np.unique(grp, return_index=True)          # um cálculo por posição soldada
for v in first:
    n = N[v]; o = P[v] + n * EPS
    near = np.where(np.linalg.norm(cen - o, axis=1) < MAXD + rad)[0]
    if len(near) == 0: continue
    t, b = basis(n); D = D0[:, :1] * t + D0[:, 1:2] * b + D0[:, 2:] * n      # NR x 3
    e1, e2, a0 = E1[near], E2[near], A0[near]
    pv = np.cross(D[:, None, :], e2[None])                                     # NR x T x 3
    det = (pv * e1[None]).sum(2)
    inv = 1 / np.where(np.abs(det) < 1e-14, 1e-14, det)
    tv = o - a0
    uu = (tv[None] * pv).sum(2) * inv
    qv = np.cross(tv, e1)
    vv = (D[:, None, :] * qv[None]).sum(2) * inv
    tt = (e2[None] * qv[None]).sum(2) * inv
    hit = (np.abs(det) > 1e-14) & (uu >= 0) & (vv >= 0) & (uu + vv <= 1) & (tt > EPS) & (tt < MAXD)
    tmin = np.where(hit, tt, np.inf).min(1)
    occ = np.where(np.isfinite(tmin), 1 - (tmin / MAXD) ** .7, 0)
    AO[grp == grp[v]] = 1 - occ.mean()
# leve suavização pela vizinhança (evita pontos isolados)
nb = [set() for _ in range(grp.max() + 1)]
for a, b_, c in I:
    ga, gb, gc = grp[a], grp[b_], grp[c]; nb[ga] |= {gb, gc}; nb[gb] |= {ga, gc}; nb[gc] |= {ga, gb}
aog = np.zeros(grp.max() + 1); aog[grp] = AO
aos = np.array([.5 * aog[g] + .5 * np.mean([aog[j] for j in nb[g]]) if nb[g] else aog[g] for g in range(len(aog))])
AO = aos[grp]

# ---------- 3. textura limpa ----------
# A textura do .glb traz a luz "assada" do escaneamento, e é ela que desenha o relevo (órbitas, forames,
# cabeças articulares). O visual geral fica; só saem os defeitos:
# - pontinhos e blocos de JPEG (mediana pequena);
# - manchas quase pretas (sombra assada, sujeira): puxadas para a média da vizinhança, sem sumir;
# - pontinhos roxos e avermelhados: a cor passa a variar devagar, só o tom quente do osso.
im = np.asarray(TEX).astype(np.float64) / 255
lum = im @ [.2126, .7152, .0722]
lm = ndimage.median_filter(lum, size=3)
lm = ndimage.gaussian_filter(lm, .7)
w = np.clip((lm - .02) / .2, 0, 1)                          # 0 nas manchas pretas
num = ndimage.gaussian_filter(lm * w, 12); den = ndimage.gaussian_filter(w, 12)
fill = np.where(den > 1e-3, num / np.maximum(den, 1e-3), np.median(lm))
k = (1 - w) ** 1.5 * .62                                     # quanto do escuro é levantado
lc = lm + (fill * .8 - lm).clip(0, None) * k
# onde houve mancha, o que sobra é alisado (sem listras dentro da área levantada)
kk = ndimage.gaussian_filter(k / .62, 3)
lc = lc + (ndimage.gaussian_filter(lc, 3) - lc) * kk
# cor: cromaticidade borrada e menos saturada (sem pontinhos coloridos); neutra onde havia mancha
chroma = im / np.maximum(lum[..., None], 1e-3)
chroma = np.stack([ndimage.gaussian_filter(np.clip(chroma[..., c], 0, 3), 6) for c in range(3)], -1)
chroma = 1 + (chroma - 1) * .45 * (1 - kk[..., None])
warm = np.array([1.04, .97, .83])                            # o mesmo tom creme dos ossos esculpidos do cotovelo
rgb = np.clip(lc[..., None] * chroma * warm, 0, 1)
# a mesma curva de brilho que a página aplicava em tempo real (gama .58)
rgb = rgb ** .58
Image.fromarray((rgb * 255).round().astype(np.uint8), "RGB").save(os.path.join(out, "skel_tex.jpg"), quality=90)

# ---------- grava ----------
ps = P.astype(np.float32).tobytes()
nb8 = np.clip(np.round(N * 127), -127, 127).astype(np.int8).tobytes()
ao8 = np.clip(np.round(AO * 255), 0, 255).astype(np.uint8).tobytes()
open(os.path.join(out, "skel.bin"), "wb").write(ps + nb8 + ao8)
json.dump({"nv": int(nv), "pos": 0, "nrm": len(ps), "ao": len(ps) + len(nb8)}, open(os.path.join(out, "skel.json"), "w"))
print("esqueleto: %d vértices (%d recolhidos nas emendas), AO média %.2f (p5 %.2f), textura limpa" % (nv, moved, AO.mean(), np.percentile(AO, 5)))
