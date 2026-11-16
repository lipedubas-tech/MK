"""Modela os ossos do cotovelo esquerdo da Katita como campos de distância (SDF)
e gera as malhas: úmero (diáfise + dois fragmentos condilares), ulna (inteira,
olécrano e corpo) e rádio. Coordenadas do mundo iguais às do esqueleto .glb:
x = medial(+)/lateral(-) no membro esquerdo, y = para cima, z = cranial(+).
"""
import numpy as np
from scipy.interpolate import PchipInterpolator
from skimage import measure

H = 0.001  # tamanho do voxel dos ossos


# ---------- utilidades ----------
def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def V(*a):
    return np.array(a, dtype=np.float64)


def unit(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.linalg.norm(v)


def noise(X, Y, Z, freq, seed, octs=3):
    rng = np.random.default_rng(seed)
    out = 0.0
    amp = 1.0
    tot = 0.0
    for o in range(octs):
        for _ in range(4):
            d = rng.normal(size=3)
            d /= np.linalg.norm(d)
            ph = rng.uniform(0, 6.283)
            out = out + amp * np.sin((X * d[0] + Y * d[1] + Z * d[2]) * freq * (2 ** o) * 6.283 + ph)
        tot += 4 * amp
        amp *= 0.5
    return out / tot * 2.2


def cone(X, Y, Z, a, b, r1, r2):
    ab = b - a
    t = np.clip(((X - a[0]) * ab[0] + (Y - a[1]) * ab[1] + (Z - a[2]) * ab[2]) / (ab @ ab), 0, 1)
    dx = X - (a[0] + t * ab[0])
    dy = Y - (a[1] + t * ab[1])
    dz = Z - (a[2] + t * ab[2])
    return np.sqrt(dx * dx + dy * dy + dz * dz) - (r1 + t * (r2 - r1))


def econe(X, Y, Z, a, b, ra1, rb1, ra2, rb2, u):
    """Tronco de cone de seção elíptica: raio ra na direção u, rb na perpendicular."""
    ab = b - a
    L = np.linalg.norm(ab)
    n = ab / L
    u = unit(u - (u @ n) * n)
    w = np.cross(n, u)
    px, py, pz = X - a[0], Y - a[1], Z - a[2]
    s = px * n[0] + py * n[1] + pz * n[2]
    t = np.clip(s / L, 0, 1)
    ql = s - t * L
    qu = px * u[0] + py * u[1] + pz * u[2]
    qw = px * w[0] + py * w[1] + pz * w[2]
    ra = ra1 + t * (ra2 - ra1)
    rb = rb1 + t * (rb2 - rb1)
    rm = np.minimum(ra, rb)
    k = np.sqrt((qu / ra) ** 2 + (qw / rb) ** 2 + (ql / rm) ** 2)
    return (k - 1) * rm


def tube(X, Y, Z, pts, k=0.004, u=V(1, 0, 0), step=0.004):
    """pts: lista de (ponto, ra, rb). Cilindro generalizado de seção elíptica ao longo de uma
    linha central suave: cada ponto usa o trecho mais próximo (sem emendas visíveis)."""
    P = np.array([p[0] for p in pts])
    ra = np.array([p[1] for p in pts])
    rb = np.array([p[2] for p in pts])
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    n = max(2, int(np.ceil(s[-1] / step)) + 1)
    t = np.linspace(0, s[-1], n)
    Pi = PchipInterpolator(s, P)(t)
    rai = PchipInterpolator(s, ra)(t)
    rbi = PchipInterpolator(s, rb)(t)
    best = None
    out = None
    for i in range(n - 1):
        a, b = Pi[i], Pi[i + 1]
        ab = b - a
        L = np.linalg.norm(ab)
        nn = ab / L
        uu = unit(u - (u @ nn) * nn)
        w = np.cross(nn, uu)
        px, py, pz = X - a[0], Y - a[1], Z - a[2]
        sp = px * nn[0] + py * nn[1] + pz * nn[2]
        tt = np.clip(sp / L, 0, 1)
        ql = sp - tt * L
        qu = px * uu[0] + py * uu[1] + pz * uu[2]
        qw = px * w[0] + py * w[1] + pz * w[2]
        r1 = rai[i] + tt * (rai[i + 1] - rai[i])
        r2 = rbi[i] + tt * (rbi[i + 1] - rbi[i])
        rm = np.minimum(r1, r2)
        d2 = qu * qu + qw * qw + ql * ql
        d = (np.sqrt((qu / r1) ** 2 + (qw / r2) ** 2 + (ql / rm) ** 2) - 1) * rm
        if best is None:
            best, out = d2, d
        else:
            m = d2 < best
            best = np.where(m, d2, best)
            out = np.where(m, d, out)
    return out


def ellipsoid(X, Y, Z, c, r):
    k = np.sqrt(((X - c[0]) / r[0]) ** 2 + ((Y - c[1]) / r[1]) ** 2 + ((Z - c[2]) / r[2]) ** 2)
    return (k - 1) * min(r)


def sphere(X, Y, Z, c, r):
    return np.sqrt((X - c[0]) ** 2 + (Y - c[1]) ** 2 + (Z - c[2]) ** 2) - r


def line_dist(X, Y, Z, c, ax):
    ax = unit(ax)
    px, py, pz = X - c[0], Y - c[1], Z - c[2]
    s = px * ax[0] + py * ax[1] + pz * ax[2]
    return np.sqrt(np.maximum(px * px + py * py + pz * pz - s * s, 0)), s


# ---------- marcos anatômicos ----------
C = V(-0.091, -0.060, 0.1245)      # centro do côndilo do úmero (eixo ao longo de x)
RC = 0.0163                         # raio da superfície articular (com folga) usado para esculpir ulna e rádio
X0 = -0.0915                        # plano intercondilar (entre tróclea e capítulo)
YA = -0.0425                        # ápice do Y (forame supratroclear)
TUB = V(-0.0985, -0.028, 0.080)     # topo do olécrano
OAX = unit(V(0, 0.038, -0.017))     # eixo do olécrano, apontando para o topo
OQ = V(-0.0985, -0.0405, 0.0856)    # ponto do plano da osteotomia
FOR = V(-0.092, -0.0445, 0.128)     # forame supratroclear

# perfil do raio do côndilo ao longo de x (medial -> lateral): lábio medial, sulco troclear, crista, capítulo
_cx = np.array([-0.1135, -0.108, -0.100, -0.091, -0.080, -0.072, -0.0675])
_cr = np.array([0.0118, 0.0136, 0.0142, 0.0150, 0.0138, 0.0152, 0.0150])
_crf = PchipInterpolator(_cx, _cr, extrapolate=True)


def humerus(X, Y, Z):
    pts = [
        (V(-0.0990, 0.094, 0.1840), 0.0205, 0.0122),
        (V(-0.0995, 0.072, 0.1810), 0.0200, 0.0120),
        (V(-0.1010, 0.050, 0.1775), 0.0165, 0.0122),
        (V(-0.1035, 0.025, 0.1700), 0.0140, 0.0118),
        (V(-0.1040, 0.000, 0.1570), 0.0130, 0.0112),
        (V(-0.1005, -0.020, 0.1440), 0.0148, 0.0104),
        (V(-0.0960, -0.034, 0.1345), 0.0200, 0.0096),
        (V(-0.0925, -0.047, 0.1275), 0.0245, 0.0094),
    ]
    d = tube(X, Y, Z, pts, k=0.005)
    # côndilo: carretel transversal
    r = _crf(np.clip(X, -0.116, -0.065))
    dc = np.sqrt((Y - C[1]) ** 2 + (Z - C[2]) ** 2) - r
    dc = smax(dc, np.abs(X - (-0.0905)) - 0.0228, 0.0045)
    d = smin(d, dc, 0.006)
    # epicôndilos e cristas supracondilares
    d = smin(d, ellipsoid(X, Y, Z, V(-0.0650, -0.0510, 0.1150), (0.0080, 0.0110, 0.0100)), 0.006)
    d = smin(d, ellipsoid(X, Y, Z, V(-0.1165, -0.0530, 0.1195), (0.0062, 0.0100, 0.0088)), 0.006)
    d = smin(d, cone(X, Y, Z, V(-0.1170, -0.045, 0.1220), V(-0.1130, -0.012, 0.1450), 0.0046, 0.0028), 0.006)
    d = smin(d, cone(X, Y, Z, V(-0.0670, -0.044, 0.1190), V(-0.0880, -0.012, 0.1440), 0.0050, 0.0030), 0.006)
    # fossa do olécrano (caudal), fossa radial (cranial) e forame supratroclear
    d = smax(d, -ellipsoid(X, Y, Z, V(FOR[0], -0.0440, 0.1165), (0.0088, 0.0100, 0.0082)), 0.003)
    d = smax(d, -ellipsoid(X, Y, Z, V(FOR[0], -0.0455, 0.1380), (0.0072, 0.0075, 0.0058)), 0.003)
    rr, _ = line_dist(X, Y, Z, FOR, V(0, -0.12, 1))
    d = smax(d, -(rr - 0.0031), 0.0015)
    # relevo sutil da cortical
    d = d + 0.00022 * noise(X, Y, Z, 55, 3, 2)
    return d


def radius_head_carve(X, Y, Z):
    return ellipsoid(X, Y, Z, V(-0.0900, -0.0810, 0.1305), (0.0148, 0.0073, 0.0108))


def ulna(X, Y, Z):
    T1 = TUB - OAX * 0.0065
    Mb = V(-0.0975, -0.0525, 0.0975)
    N = V(-0.0990, -0.0720, 0.1010)
    S1 = V(-0.1005, -0.0900, 0.1075)
    d = econe(X, Y, Z, T1, Mb, 0.0066, 0.0104, 0.0076, 0.0165, V(1, 0, 0))
    d = smin(d, econe(X, Y, Z, Mb, N, 0.0076, 0.0165, 0.0086, 0.0148, V(1, 0, 0)), 0.003)
    # tuberosidade do olécrano
    d = smin(d, ellipsoid(X, Y, Z, TUB + V(0, -0.0035, 0.0005), (0.0086, 0.0072, 0.0108)), 0.004)
    d = smin(d, sphere(X, Y, Z, TUB + V(0.0030, 0.0004, 0.0056), 0.0042), 0.003)
    d = smin(d, sphere(X, Y, Z, TUB + V(-0.0030, 0.0006, -0.0054), 0.0044), 0.003)
    # processos coronoides medial e lateral
    d = smin(d, cone(X, Y, Z, V(-0.0930, -0.0800, 0.1080), V(-0.0765, -0.0805, 0.1195), 0.0074, 0.0040), 0.004)
    d = smin(d, cone(X, Y, Z, V(-0.1010, -0.0800, 0.1075), V(-0.1050, -0.0805, 0.1160), 0.0060, 0.0034), 0.004)
    # corpo da ulna até se fundir com o antebraço da malha
    shaft = [
        (N, 0.0086, 0.0140),
        (S1, 0.0098, 0.0120),
        (V(-0.1040, -0.120, 0.1145), 0.0084, 0.0102),
        (V(-0.1045, -0.160, 0.1170), 0.0074, 0.0088),
        (V(-0.1000, -0.196, 0.1200), 0.0062, 0.0072),
        (V(-0.0950, -0.222, 0.1230), 0.0048, 0.0052),
        (V(-0.0920, -0.242, 0.1250), 0.0040, 0.0044),
    ]
    d = smin(d, tube(X, Y, Z, shaft, k=0.005), 0.005)
    # incisura troclear (encaixa no côndilo) e incisura radial (encaixa na cabeça do rádio)
    rr = np.sqrt((Y - C[1]) ** 2 + (Z - C[2]) ** 2)
    d = smax(d, -(rr - RC), 0.0018)
    d = smax(d, -(radius_head_carve(X, Y, Z) - 0.0008), 0.0015)
    d = d + 0.00020 * noise(X, Y, Z, 60, 5, 2)
    return d


def radius(X, Y, Z):
    d = ellipsoid(X, Y, Z, V(-0.0900, -0.0810, 0.1305), (0.0140, 0.0065, 0.0100))
    shaft = [
        (V(-0.0885, -0.086, 0.1310), 0.0106, 0.0086),
        (V(-0.0865, -0.120, 0.1340), 0.0102, 0.0080),
        (V(-0.0850, -0.165, 0.1345), 0.0112, 0.0088),
        (V(-0.0835, -0.200, 0.1300), 0.0125, 0.0105),
        (V(-0.0830, -0.224, 0.1280), 0.0126, 0.0106),
        (V(-0.0830, -0.246, 0.1275), 0.0126, 0.0106),
    ]
    d = smin(d, tube(X, Y, Z, shaft, k=0.005), 0.005)
    rr = np.sqrt((Y - C[1]) ** 2 + (Z - C[2]) ** 2)
    d = smax(d, -(rr - RC), 0.0015)
    d = d + 0.00020 * noise(X, Y, Z, 60, 9, 2)
    return d


# ---------- fratura em Y e osteotomia ----------
def frac_fields(X, Y, Z):
    """g_s > 0 na diáfise (acima do V); sx > 0 no lado medial."""
    sx = (X - X0) + 0.0011 * noise(X, Y, Z, 38, 21, 3) + 0.10 * (Z - 0.125)
    ax = np.abs(sx)
    slope = np.where(sx < 0, 1.10, 1.30)
    yv = YA + slope * ax + 0.22 * (Z - 0.127) + 0.0013 * noise(X, Y, Z, 45, 33, 3)
    g = (Y - yv) / np.sqrt(1 + slope ** 2)
    return g, sx


KERF = 0.00022


def humerus_parts(X, Y, Z):
    b = humerus(X, Y, Z)
    g, sx = frac_fields(X, Y, Z)
    shaft = np.maximum(b, -g + KERF)
    lat = np.maximum(np.maximum(b, g + KERF), sx + KERF)
    med = np.maximum(np.maximum(b, g + KERF), -sx + KERF)
    return b, shaft, lat, med


def osteo(X, Y, Z):
    return (X - OQ[0]) * OAX[0] + (Y - OQ[1]) * OAX[1] + (Z - OQ[2]) * OAX[2]


def ulna_parts(X, Y, Z):
    b = ulna(X, Y, Z)
    g = osteo(X, Y, Z)
    olec = np.maximum(b, -g)
    body = np.maximum(b, g)
    return b, olec, body


def all_bones(X, Y, Z):
    return np.minimum(np.minimum(humerus(X, Y, Z), ulna(X, Y, Z)), radius(X, Y, Z))


# ---------- malhas ----------
def grid(lo, hi, h):
    xs = np.arange(lo[0], hi[0] + h, h)
    ys = np.arange(lo[1], hi[1] + h, h)
    zs = np.arange(lo[2], hi[2] + h, h)
    X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
    return X.astype(np.float32), Y.astype(np.float32), Z.astype(np.float32)


def mesh(field, lo, h):
    if field.min() > 0 or field.max() < 0:
        raise RuntimeError("campo sem superfície")
    v, f, _, _ = measure.marching_cubes(field, 0.0, spacing=(h, h, h))
    v = v + np.asarray(lo)[None, :]
    return v.astype(np.float64), f.astype(np.int64)


def sample(fn, v, chunk=200000):
    out = np.empty(len(v))
    for i in range(0, len(v), chunk):
        p = v[i:i + chunk]
        out[i:i + chunk] = fn(p[:, 0], p[:, 1], p[:, 2])
    return out


def normals(fn, v, e=0.0004):
    n = np.stack([
        sample(fn, v + V(e, 0, 0)) - sample(fn, v - V(e, 0, 0)),
        sample(fn, v + V(0, e, 0)) - sample(fn, v - V(0, e, 0)),
        sample(fn, v + V(0, 0, e)) - sample(fn, v - V(0, 0, e)),
    ], axis=1)
    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9)
    return n


def ambient(fn, v, n):
    """Oclusão ambiente a partir do SDF (1 = aberto, 0 = fechado)."""
    occ = 0.0
    w = 1.0
    tot = 0.0
    for dist in (0.0015, 0.003, 0.006, 0.010, 0.016):
        s = sample(fn, v + n * dist)
        occ = occ + w * np.clip((dist - s) / dist, 0, 1)
        tot += w
        w *= 0.75
    return 1 - np.clip(occ / tot, 0, 1)
