"""Leitura mínima de um .glb (uma malha, um material) com numpy."""
import io, json, struct
import numpy as np
from PIL import Image


def carrega(caminho):
    """Devolve posições (m), normais, uv, triângulos e as imagens do material.

    Sistema de saída: patas em y=0, corpo centrado em x=0, cabeça para +z;
    o lado esquerdo do cão fica em +x.
    """
    f = open(caminho, "rb").read()
    n = struct.unpack("<I", f[12:16])[0]
    j = json.loads(f[20:20 + n])
    b0 = 20 + n + 8

    def acessor(i):
        a = j["accessors"][i]
        bv = j["bufferViews"][a["bufferView"]]
        tipo = {5123: np.uint16, 5125: np.uint32, 5126: np.float32}[a["componentType"]]
        nc = {"SCALAR": 1, "VEC2": 2, "VEC3": 3}[a["type"]]
        ini = b0 + bv.get("byteOffset", 0) + a.get("byteOffset", 0)
        arr = np.frombuffer(f, dtype=tipo, count=a["count"] * nc, offset=ini)
        return arr.reshape(a["count"], nc) if nc > 1 else arr

    def imagem(ind_textura):
        im = j["images"][j["textures"][ind_textura]["source"]]
        bv = j["bufferViews"][im["bufferView"]]
        ini = b0 + bv.get("byteOffset", 0)
        return Image.open(io.BytesIO(f[ini:ini + bv["byteLength"]]))

    prim = j["meshes"][0]["primitives"][0]
    escala = j["nodes"][1]["scale"][0]
    P = acessor(prim["attributes"]["POSITION"]).astype(np.float64) * escala
    N = acessor(prim["attributes"]["NORMAL"]).astype(np.float64)
    UV = acessor(prim["attributes"]["TEXCOORD_0"]).astype(np.float64)
    T = acessor(prim["indices"]).astype(np.int64).reshape(-1, 3)
    P[:, 1] -= P[:, 1].min()
    P[:, 0] -= (P[:, 0].min() + P[:, 0].max()) / 2
    mat = j["materials"][prim["material"]]["pbrMetallicRoughness"]
    cor = imagem(mat["baseColorTexture"]["index"]).convert("RGB")
    return P, N, UV, T, cor
