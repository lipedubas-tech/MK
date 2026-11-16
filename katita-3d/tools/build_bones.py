"""Gera as malhas dos ossos e grava build/bones.bin + build/bones.json."""
import json
import os
import sys
import time

import numpy as np
import fast_simplification as fs

sys.path.insert(0, os.path.dirname(__file__))
import bones as B

OUT = os.path.join(os.path.dirname(__file__), "..", "build")
os.makedirs(OUT, exist_ok=True)
LO = np.array([-0.135, -0.256, 0.060])
HI = np.array([-0.045, 0.100, 0.205])


def piece(name, fn_piece, fn_intact, lo, hi, h, ao_fn, keep=0.4, metal=False):
    t = time.time()
    X, Y, Z = B.grid(lo, hi, h)
    f = fn_piece(X, Y, Z)
    v, tri = B.mesh(f, lo, h)
    n0 = len(tri)
    if keep < 1:
        v, tri = fs.simplify(v.astype(np.float32), tri.astype(np.int32), target_reduction=1 - keep)
        v = v.astype(np.float64)
    inner = B.sample(fn_intact, v)
    cut = np.clip((-inner - 0.00035) / 0.0006, 0, 1)
    n_out = B.normals(fn_intact, v)
    n_cut = B.normals(fn_piece, v)
    n = np.where(cut[:, None] > 0.5, n_cut, n_out)
    if metal:
        ao = np.ones(len(v))
    else:
        ao = B.ambient(ao_fn, v, n_out)
        ao = np.where(cut > 0.5, 1.0, ao)
    print(f"{name}: {len(v)} vértices, {len(tri)} triângulos (de {n0}), {time.time() - t:.1f}s")
    return dict(name=name, v=v, tri=np.asarray(tri), n=n, ao=ao, cut=cut, metal=metal)


def write(P, base, extra=None):
    blob = bytearray()
    meta = []
    for p in P:
        q = np.clip(np.round((p["v"] - LO) / (HI - LO) * 65535), 0, 65535).astype("<u2")
        big = len(p["v"]) > 65535
        tri = p["tri"].astype("<u4" if big else "<u2")
        ent = dict(name=p["name"], nv=int(len(q)), nt=int(len(tri)), big=bool(big), off=len(blob), metal=bool(p.get("metal")))
        blob += q.tobytes()
        blob += tri.tobytes()
        blob += np.clip(np.round(p["n"] * 127), -127, 127).astype("i1").tobytes()
        blob += np.round(p["ao"] * 255).astype("u1").tobytes()
        blob += np.round(p["cut"] * 255).astype("u1").tobytes()
        if len(blob) % 2:
            blob += b"\0"
        meta.append(ent)
    with open(os.path.join(OUT, base + ".bin"), "wb") as f:
        f.write(blob)
    d = dict(lo=LO.tolist(), hi=HI.tolist(), pieces=meta)
    if extra:
        d.update(extra)
    with open(os.path.join(OUT, base + ".json"), "w") as f:
        json.dump(d, f)
    print(base, "bytes", len(blob), "triângulos", sum(m["nt"] for m in meta))


def main():
    h = B.H
    hum = lambda X, Y, Z: B.humerus(X, Y, Z)
    uln = lambda X, Y, Z: B.ulna(X, Y, Z)
    rad = lambda X, Y, Z: B.radius(X, Y, Z)
    allb = lambda X, Y, Z: B.all_bones(X, Y, Z)
    hl, hh = (-0.131, -0.083, 0.097), (-0.052, 0.098, 0.203)
    ul, uh = (-0.117, -0.250, 0.065), (-0.066, -0.016, 0.133)
    rl, rh = (-0.109, -0.254, 0.111), (-0.065, -0.068, 0.151)
    P = []
    P.append(piece("hShaft", lambda X, Y, Z: B.humerus_parts(X, Y, Z)[1], hum, hl, hh, h, allb, 0.36))
    P.append(piece("hLat", lambda X, Y, Z: B.humerus_parts(X, Y, Z)[2], hum, hl, (-0.052, -0.005, 0.203), h, allb, 0.5))
    P.append(piece("hMed", lambda X, Y, Z: B.humerus_parts(X, Y, Z)[3], hum, hl, (-0.052, -0.005, 0.203), h, allb, 0.5))
    P.append(piece("uFull", uln, uln, ul, uh, h, allb, 0.34))
    P.append(piece("uOlec", lambda X, Y, Z: B.ulna_parts(X, Y, Z)[1], uln, ul, (-0.066, -0.016, 0.110), h, allb, 0.6))
    P.append(piece("uBody", lambda X, Y, Z: B.ulna_parts(X, Y, Z)[2], uln, ul, uh, h, allb, 0.36))
    P.append(piece("radius", rad, rad, rl, rh, h, allb, 0.3))
    write(P, "bones")


if __name__ == "__main__":
    main()
