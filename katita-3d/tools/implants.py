"""Placas moldadas ao úmero, parafusos, pinos e banda de tensão.
Grava build/implants.bin (malhas das placas) e build/implants.json (trajetos e parafusos)."""
import json
import os
import sys

import numpy as np
from scipy.interpolate import PchipInterpolator

sys.path.insert(0, os.path.dirname(__file__))
import bones as B
from build_bones import piece, write, OUT

V = B.V


def f1(fn, p):
    p = np.asarray(p, dtype=np.float64)
    return float(fn(np.array([p[0]]), np.array([p[1]]), np.array([p[2]]))[0])


def grad(fn, p, e=0.0004):
    g = np.array([
        f1(fn, p + V(e, 0, 0)) - f1(fn, p - V(e, 0, 0)),
        f1(fn, p + V(0, e, 0)) - f1(fn, p - V(0, e, 0)),
        f1(fn, p + V(0, 0, e)) - f1(fn, p - V(0, 0, e)),
    ])
    return g / max(np.linalg.norm(g), 1e-9)


def project(fn, p, off=0.0, it=40):
    """Leva p até a superfície (fn = off) descendo pelo gradiente."""
    p = np.asarray(p, dtype=np.float64).copy()
    for _ in range(it):
        d = f1(fn, p) - off
        p = p - grad(fn, p) * d * 0.9
    return p, grad(fn, p)


def resample(P, ds):
    P = np.asarray(P)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    n = int(np.ceil(s[-1] / ds)) + 1
    t = np.linspace(0, s[-1], n)
    return PchipInterpolator(s, P)(t), t


def surface_path(fn, guides, ds=0.002):
    pts = [project(fn, g)[0] for g in guides]
    P, _ = resample(pts, ds)
    S, N = [], []
    for p in P:
        q, n = project(fn, p)
        S.append(q)
        N.append(n)
    return np.array(S), np.array(N)


OFF, TH, HW = 0.0003, 0.0026, 0.0052


def make_plate(name, guides, nholes=7):
    hum = B.humerus
    S, N = surface_path(hum, guides)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(S, axis=0), axis=1))])
    L = s[-1]
    Cc = S + N * (OFF + TH / 2)
    # furos igualmente espaçados
    hs = np.linspace(0.006, L - 0.006, nholes)
    holes = []
    for h in hs:
        i = int(np.argmin(np.abs(s - h)))
        tan = B.unit(S[min(i + 1, len(S) - 1)] - S[max(i - 1, 0)])
        holes.append((S[i], N[i], tan))
    mids = []
    for a, b in zip(hs[:-1], hs[1:]):
        i = int(np.argmin(np.abs(s - (a + b) / 2)))
        tan = B.unit(S[min(i + 1, len(S) - 1)] - S[max(i - 1, 0)])
        bn = np.cross(tan, N[i])
        mids.append((Cc[i], bn))

    def field(X, Y, Z):
        db = hum(X, Y, Z)
        shell = np.maximum(db - (OFF + TH), OFF - db)
        fp = None
        for a, b in zip(Cc[:-1], Cc[1:]):
            d = B.cone(X, Y, Z, a, b, HW, HW)
            fp = d if fp is None else np.minimum(fp, d)
        d = B.smax(shell, fp, 0.0009)
        for (p, n, _t) in holes:
            rr, sp = B.line_dist(X, Y, Z, p, n)
            d = np.maximum(d, -(rr - 0.0019))
            # escareado raso para a cabeça do parafuso
            d = np.maximum(d, -B.sphere(X, Y, Z, p + n * (OFF + TH + 0.0016), 0.0034))
        for (c, bn) in mids:
            for sgn in (-1, 1):
                d = np.maximum(d, -B.sphere(X, Y, Z, c + bn * sgn * (HW + 0.0014), 0.0028))
        return d

    lo = Cc.min(0) - 0.010
    hi = Cc.max(0) + 0.010
    pc = piece(name, field, field, lo, hi, 0.0006, None, keep=0.45, metal=True)
    # parafusos: escolhe o furo mais próximo da linha de fratura para ficar vazio
    gs = []
    for (p, n, _t) in holes:
        g, _sx = B.frac_fields(np.array([p[0]]), np.array([p[1]]), np.array([p[2]]))
        gs.append(float(g[0]))
    empty = int(np.argmin(np.abs(gs)))
    screws = []
    for j, (p, n, _t) in enumerate(holes):
        if j == empty:
            continue
        a = p + n * (OFF + TH + 0.0002)
        q = p - n * 0.002
        inside = False
        depth = 0.002
        while depth < 0.05:
            d = f1(hum, q)
            if d < 0:
                inside = True
            elif inside:
                break
            q = q - n * 0.0005
            depth += 0.0005
        b = p - n * min(depth + 0.0012, 0.05)
        screws.append(dict(a=a.round(5).tolist(), b=b.round(5).tolist(), r=0.00155, frag=bool(gs[j] < 0)))
    print(name, "comprimento", round(L, 4), "furos", nholes, "vazio", empty, "parafusos", len(screws))
    return pc, screws


def scan_x(fn, y, z, x0, x1, step=0.0004):
    """Primeira entrada e última saída do osso ao longo de x."""
    xs = np.arange(x0, x1, step if x1 > x0 else -step)
    d = fn(xs, np.full_like(xs, y), np.full_like(xs, z))
    ins = np.where(d < 0)[0]
    return xs[ins[0]], xs[ins[-1]]


def keep_inside(fn, P, margin=0.0022):
    """Empurra pontos de um pino para dentro do osso, se estiverem perto da cortical."""
    out = []
    for p in P:
        p = np.array(p, dtype=np.float64)
        for _ in range(12):
            d = f1(fn, p)
            if d < -margin:
                break
            p = p - grad(fn, p) * (d + margin)
        out.append(p)
    return np.array(out)


def main():
    hum, uln = B.humerus, B.ulna
    P = []
    lat_guides = [V(-0.126, -0.049, 0.118), V(-0.124, -0.036, 0.125), V(-0.119, -0.018, 0.138),
                  V(-0.117, 0.000, 0.151), V(-0.117, 0.018, 0.163), V(-0.116, 0.034, 0.171)]
    med_guides = [V(-0.057, -0.048, 0.112), V(-0.062, -0.036, 0.120), V(-0.078, -0.018, 0.137),
                  V(-0.088, 0.000, 0.151), V(-0.088, 0.018, 0.164), V(-0.086, 0.031, 0.172)]
    pl, sl = make_plate("plateLat", lat_guides)
    pm, sm = make_plate("plateMed", med_guides)
    P += [pl, pm]

    # parafuso intercondilar: de lateral para medial, pelo centro do côndilo
    cy, cz = B.C[1] - 0.0012, B.C[2]
    xa, xb = scan_x(hum, cy, cz, -0.135, -0.05)
    tcs = dict(a=[round(xa - 0.0004, 5), cy, cz], b=[round(xb + 0.0012, 5), cy, cz], r=0.0024)

    # pino intramedular do úmero (fio de Kirschner), entrando pelo epicôndilo medial
    hp = np.array([V(-0.0655, -0.0585, 0.1150), V(-0.0760, -0.0400, 0.1260), V(-0.0900, -0.0200, 0.1410),
                   V(-0.1010, 0.0000, 0.1560), V(-0.1035, 0.0250, 0.1700), V(-0.1010, 0.0520, 0.1790)])
    hp = np.vstack([hp[:1] + V(0.0035, -0.004, -0.002), keep_inside(hum, hp[1:], 0.003)])
    hp, _ = resample(hp, 0.006)

    # dois pinos longos da ponta do olécrano pela ulna
    top = B.TUB + B.OAX * 0.0045
    guide = np.array([V(-0.0985, -0.0300, 0.0808), V(-0.0985, -0.0500, 0.0868), V(-0.0995, -0.0750, 0.0945),
                      V(-0.1015, -0.1050, 0.1040), V(-0.1040, -0.1400, 0.1125), V(-0.1040, -0.1780, 0.1180)])
    pins = []
    for sgn in (-1, 1):
        g = guide.copy()
        g[:, 0] += sgn * np.linspace(0.0030, 0.0014, len(g))
        g = keep_inside(uln, g, 0.0026)
        hook = [top + V(sgn * 0.0030, 0.0010, -0.0045), top + V(sgn * 0.0030, 0.0022, -0.0012), top + V(sgn * 0.0030, 0.0002, 0.0012)]
        pth = np.vstack([np.array(hook), g])
        pth, _ = resample(pth, 0.005)
        pins.append(pth)

    # banda de tensão: furo transversal na ulna e fio em oito pela face caudal
    yh = -0.0965
    zc = None
    zs = np.arange(0.06, 0.14, 0.0004)
    d = uln(np.full_like(zs, -0.1012), np.full_like(zs, yh), zs)
    ins = zs[d < 0]
    zh = ins[0] + 0.0052
    xl, xm = scan_x(uln, yh, zh, -0.125, -0.07)
    hole = dict(a=[round(xl - 0.0006, 5), yh, round(zh, 5)], b=[round(xm + 0.0006, 5), yh, round(zh, 5)], r=0.0009)
    yt = B.TUB[1] - 0.0045

    def strand(sgn):
        """sgn=-1: sai do furo pelo lado lateral e sobe cruzando para medial; sgn=+1: o inverso."""
        pts = []
        for s in np.linspace(0, 1, 26):
            y = yh + (yt - yh) * s
            # centro aproximado do osso nessa altura
            zz = np.arange(0.06, 0.14, 0.0006)
            dd = uln(np.full_like(zz, -0.0995), np.full_like(zz, y), zz)
            zi = zz[dd < 0]
            c = V(-0.0995, y, zi.mean() if len(zi) else 0.09)
            sm = s * s * (3 - 2 * s)
            # ângulo em torno do osso: começa na face lateral/medial, passa pela caudal e termina do outro lado
            ang0 = np.pi if sgn < 0 else 0.0
            ang1 = (np.pi * 1.5 + 0.75) if sgn < 0 else (np.pi * 1.5 - 0.75)
            if sgn > 0:
                ang0 = 2 * np.pi
            ang = ang0 + (ang1 - ang0) * sm
            p0 = c + 0.03 * V(np.cos(ang), 0, np.sin(ang))
            q, n = project(uln, p0, off=0.0010, it=30)
            pts.append(q)
        return np.array(pts)

    wa = strand(-1)
    wb = strand(1)
    # laço no topo, passando à frente (cranial) das pontas dos pinos
    pm_, pl_ = top + V(0.0030, 0, 0), top + V(-0.0030, 0, 0)
    loop = [pm_ + V(0.0026, -0.0030, -0.0030), pm_ + V(0.0024, -0.0012, 0.0016), pm_ + V(0.0006, -0.0006, 0.0036),
            pl_ + V(-0.0006, -0.0006, 0.0036), pl_ + V(-0.0024, -0.0012, 0.0016), pl_ + V(-0.0026, -0.0030, -0.0030)]
    lp = []
    for p in loop:
        d = f1(uln, p)
        if d < 0.0010:
            p = p + grad(uln, p) * (0.0010 - d)
        lp.append(p)
    wa = np.vstack([wa, np.array(lp)])
    wa, _ = resample(wa, 0.003)
    wb, _ = resample(wb, 0.003)
    knot = (wb[-1]).round(5).tolist()

    extra = dict(
        screwsLat=sl, screwsMed=sm, tcs=tcs,
        hpin=np.round(hp, 5).tolist(),
        upins=[np.round(p, 5).tolist() for p in pins],
        wires=[np.round(wa, 5).tolist(), np.round(wb, 5).tolist()],
        hole=hole, knot=knot,
        C=B.C.tolist(), TUB=B.TUB.tolist(), OAX=B.OAX.round(5).tolist(), OQ=B.OQ.tolist(), FOR=B.FOR.tolist(),
    )
    write(P, "implants", extra)


if __name__ == "__main__":
    main()
