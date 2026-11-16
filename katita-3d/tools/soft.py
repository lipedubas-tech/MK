"""Pele e plano muscular em volta do cotovelo, com a incisão (caudolateral).
Grava build/soft.bin + build/soft.json. Cada vértice leva: s (posição ao longo da incisão)
e d (distância até a linha da incisão), usados para abrir e fechar a ferida no shader."""
import json
import os
import sys

import numpy as np
import fast_simplification as fs

sys.path.insert(0, os.path.dirname(__file__))
import bones as B
from build_bones import OUT, LO, HI
from implants import project, resample, f1, grad

V = B.V
SLO = np.array([-0.150, -0.230, 0.040])
SHI = np.array([-0.040, 0.100, 0.215])


def skin(X, Y, Z):
    pts = [
        (V(-0.0990, 0.105, 0.1760), 0.0335, 0.0400),
        (V(-0.1010, 0.040, 0.1580), 0.0310, 0.0370),
        (V(-0.0990, -0.015, 0.1310), 0.0295, 0.0340),
        (V(-0.0920, -0.055, 0.1090), 0.0330, 0.0350),
        (V(-0.0950, -0.100, 0.1160), 0.0250, 0.0275),
        (V(-0.0930, -0.160, 0.1260), 0.0200, 0.0215),
        (V(-0.0880, -0.232, 0.1290), 0.0170, 0.0175),
    ]
    d = B.tube(X, Y, Z, pts, step=0.006)
    d = B.smin(d, B.sphere(X, Y, Z, V(-0.0985, -0.036, 0.0830), 0.0150), 0.012)
    # garante que ossos e placas fiquem cobertos, com as saliências ósseas aparecendo sob a pele
    d = B.smin(d, B.all_bones(X, Y, Z) - 0.0130, 0.012)
    return d


def muscle(X, Y, Z):
    return skin(X, Y, Z) + 0.0065


GUIDE = [V(-0.135, 0.040, 0.140), V(-0.132, 0.005, 0.118), V(-0.128, -0.030, 0.092),
         V(-0.124, -0.062, 0.088), V(-0.122, -0.095, 0.096), V(-0.118, -0.125, 0.106)]


def path_on(fn):
    pts = [project(fn, g)[0] for g in GUIDE]
    P, _ = resample(pts, 0.003)
    P = np.array([project(fn, p)[0] for p in P])
    return P


def path_attrs(v, P):
    """Para cada vértice: parâmetro s (0..1) e distância à polilinha P."""
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])
    best = np.full(len(v), 1e9)
    sbest = np.zeros(len(v))
    for i in range(len(P) - 1):
        a, b = P[i], P[i + 1]
        ab = b - a
        t = np.clip(((v - a) @ ab) / (ab @ ab), 0, 1)
        q = a + t[:, None] * ab
        d = np.linalg.norm(v - q, axis=1)
        m = d < best
        best = np.where(m, d, best)
        sbest = np.where(m, (cum[i] + t * seg[i]) / cum[-1], sbest)
    return sbest, best


def surface(name, fn, h, keep):
    X, Y, Z = B.grid(SLO, SHI, h)
    f = fn(X, Y, Z)
    v, tri = B.mesh(f, SLO, h)
    v, tri = fs.simplify(v.astype(np.float32), tri.astype(np.int32), target_reduction=1 - keep)
    v = v.astype(np.float64)
    tri = np.asarray(tri)
    # remove as tampas: fica só o trecho entre o braço e o antebraço
    cy = v[tri].mean(1)[:, 1]
    tri = tri[(cy < 0.088) & (cy > -0.212)]
    used = np.unique(tri)
    remap = -np.ones(len(v), dtype=np.int64)
    remap[used] = np.arange(len(used))
    v = v[used]
    tri = remap[tri]
    n = B.normals(fn, v)
    P = path_on(fn)
    s, d = path_attrs(v, P)
    print(name, len(v), "vértices", len(tri), "triângulos")
    return dict(name=name, v=v, tri=tri, n=n, s=s, d=d), P


def main():
    sk, Ps = surface("skin", skin, 0.0025, 0.5)
    mu, Pm = surface("muscle", muscle, 0.0025, 0.4)
    # confere se a pele cobre ossos e placas com folga
    for nm in ("bones", "implants"):
        meta = json.load(open(os.path.join(OUT, nm + ".json")))
        raw = np.fromfile(os.path.join(OUT, nm + ".bin"), dtype=np.uint8)
        worst = -1
        for p in meta["pieces"]:
            q = np.frombuffer(raw[p["off"]:p["off"] + p["nv"] * 6].tobytes(), dtype="<u2").reshape(-1, 3)
            vv = LO + q / 65535.0 * (HI - LO)
            vv = vv[(vv[:, 1] < 0.08) & (vv[:, 1] > -0.20)]
            worst = max(worst, float(B.sample(muscle, vv).max()))
        print("folga do músculo sobre", nm, round(-worst * 1000, 2), "mm")
    blob = bytearray()
    meta = []
    for p in (sk, mu):
        q = np.clip(np.round((p["v"] - SLO) / (SHI - SLO) * 65535), 0, 65535).astype("<u2")
        tri = p["tri"].astype("<u2")
        ent = dict(name=p["name"], nv=int(len(q)), nt=int(len(tri)), off=len(blob))
        blob += q.tobytes()
        blob += tri.tobytes()
        blob += np.clip(np.round(p["n"] * 127), -127, 127).astype("i1").tobytes()
        blob += np.clip(np.round((p["s"] + 0.1) / 1.2 * 255), 0, 255).astype("u1").tobytes()
        blob += np.clip(np.round(p["d"] / 0.00025), 0, 255).astype("u1").tobytes()
        if len(blob) % 2:
            blob += b"\0"
        meta.append(ent)
    # pontos (com normal) para os pontos de sutura, ao longo da incisão
    def stitches(fn, P, n=9):
        out = []
        for s in np.linspace(0.10, 0.90, n):
            i = int(round(s * (len(P) - 1)))
            p = P[i]
            nn = grad(fn, p)
            t = B.unit(P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)])
            out.append(dict(p=p.round(5).tolist(), n=nn.round(4).tolist(), t=t.round(4).tolist(), s=round(float(s), 3)))
        return out
    with open(os.path.join(OUT, "soft.bin"), "wb") as f:
        f.write(blob)
    with open(os.path.join(OUT, "soft.json"), "w") as f:
        json.dump(dict(lo=SLO.tolist(), hi=SHI.tolist(), pieces=meta, stSkin=stitches(skin, Ps), stMus=stitches(muscle, Pm),
                       path=np.round(Ps, 5).tolist()), f)
    print("soft bytes", len(blob))


if __name__ == "__main__":
    main()
