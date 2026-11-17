/* ===== sítio cirúrgico: tricotomia, antissepsia, incisão em camadas, cavidade, campo fenestrado, pinças de campo ===== */
var INC = { zc: -.0675, h: .0225, w: .0072 };          /* incisão retroumbilical: ~4 cm, de z = -0,045 a -0,090 */
var UMBIGO_Z = -.036, JAN = { x: .026, z0: -.108, z1: -.027 };
var UC = { uRaspa: { value: 0 }, uAnti: { value: 0 }, uTrac: { value: 0 }, uCorte: { value: 0 }, uVis: { value: 1 } };
var pele = null, ferida = null, cavidade = null, campo = null, UQ = { uQueda: { value: 1 }, uVis: { value: 1 } }, pincasCampo = [], sonda = null, gaze = null;
var ABRE = { pele: 0, sub: 0, mus: 0 };              /* abertura de cada plano (0–1) */

function wInc(z) { var t = (z - INC.zc) / INC.h; return Math.abs(t) >= 1 ? 0 : INC.w * Math.sqrt(1 - t * t) }
var _hPele = {};
function peleY(z) { var k = z.toFixed(4); if (_hPele[k] === undefined) _hPele[k] = alturaPele(0, z, .15) + .001; return _hPele[k] }

function blur2(a, nx, nz, it) {
  for (var k = 0; k < it; k++) {
    var b = a.slice();
    for (var j = 1; j < nz - 1; j++) for (var i = 1; i < nx - 1; i++) { var s = 0; for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) s += b[(j + dj) * nx + i + di]; a[j * nx + i] = s / 9 }
  }
  return a
}

/* ---------- pele tricotomizada: duas metades que se afastam quando a incisão abre ---------- */
function criaPele() {
  var W = .054, Z0 = -.14, Z1 = .014, NX = 24, NZ = 96, metades = [];
  [1, -1].forEach(function (s) {
    var pos = [], loc = [], ix = [], base = [];
    for (var j = 0; j <= NZ; j++) for (var i = 0; i <= NX; i++) {
      var x = s * W * Math.pow(i / NX, 1.5), z = lerp(Z0, Z1, j / NZ), y = alturaPele(x, z, .12);
      base.push([x, y, z]); loc.push(x, z)
    }
    var hs = base.map(function (p) { return p[1] }); var hb = blur2(hs.slice(), NX + 1, NZ + 1, 3);
    base.forEach(function (p, k) { p[1] = Math.max(hs[k], hb[k]) + .0011; pos.push(p[0], p[1], p[2]) });
    for (j = 0; j < NZ; j++) for (i = 0; i < NX; i++) { var a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; if (s > 0) ix.push(a, c, b, b, c, d); else ix.push(a, b, c, b, d, c) }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("aLoc", new THREE.Float32BufferAttribute(loc, 2)); g.setIndex(ix); g.computeVertexNormals();
    metades.push({ g: g, base: base, s: s })
  });
  var mt = MS(0xf0cbbd, { roughness: .55, envMapIntensity: .35 });
  mt.onBeforeCompile = function (sh) {
    Object.keys(UC).forEach(function (k) { sh.uniforms[k] = UC[k] });
    sh.vertexShader = "attribute vec2 aLoc;\nvarying vec2 vLoc;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vLoc = aLoc;");
    sh.fragmentShader = "varying vec2 vLoc;\nuniform float uRaspa, uAnti, uTrac, uCorte, uVis;\n" +
      "float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n" +
      "float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x),f.y);}\n" +
      sh.fragmentShader.replace("#include <color_fragment>", [
        "#include <color_fragment>",
        " vec2 L = vLoc;",
        /* borda irregular da área depilada e avanço da máquina (do cranial para o caudal) */
        " float bx = .049 + .003 * ns(vec2(L.y * 300., 1.)), frente = mix(.03, -.15, uRaspa) + .004 * ns(vec2(L.x * 400., 3.));",
        " if (abs(L.x) > bx || L.y < -.136 + .003 * ns(vec2(L.x * 300., 5.)) || L.y < frente || uVis < .01) discard;",
        " float n = ns(L * 900.) * .5 + ns(L * 2600.) * .5;",
        " diffuseColor.rgb *= .93 + .1 * n;",
        /* pontos de pelo raspado (sombra azulada), mamilos e cicatriz umbilical */
        " diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.62,.6,.66), step(.93, hsh(floor(L * 2200.))) * .35);",
        " for (int k = 0; k < 3; k++) { float zk = -.005 - float(k) * .05; float dm = min(length(L - vec2(.031, zk)), length(L - vec2(-.031, zk)));",
        "   diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.78,.5,.47), smoothstep(.0028, .0016, dm)); }",
        " float um = length((L - vec2(0., " + UMBIGO_Z.toFixed(4) + ")) * vec2(1., .5));",
        " diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.72,.55,.52), smoothstep(.0016, .0008, um));",
        /* antissepsia: espiral do centro para fora; a área já passada fica âmbar (iodopovidona) */
        " vec2 c = L - vec2(0., -.066); float r = length(c), th = atan(c.y, c.x);",
        " float fr = uAnti * .085, pass = smoothstep(fr + .002, fr - .004, r);",
        " float esp = fract(r / .0075 - th / 6.2832);",
        " float traco = smoothstep(.18, .0, abs(esp - .5) - .32) * smoothstep(.012, .0, abs(r - fr + .006));",
        " diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.95,.72,.45), pass * .55 + traco * .35 * step(.001, uAnti) * (1. - step(.999, uAnti)));",
        /* linha de marcação tracejada e traço da incisão */
        " float zt = clamp((L.y - " + (INC.zc - INC.h).toFixed(4) + ") / " + (2 * INC.h).toFixed(4) + ", 0., 1.);",
        " float noTraco = step(abs(L.x), .0005) * step(" + (INC.zc - INC.h).toFixed(4) + ", L.y) * step(L.y, " + (INC.zc + INC.h).toFixed(4) + ");",
        " diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.33,.2,.52), noTraco * uTrac * step(.5, fract(L.y * 380.)) * (1. - step(.01, uCorte)));",
        " float feito = step(1. - uCorte, zt);",
        " diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.62,.12,.12), smoothstep(.0011, .0003, abs(L.x)) * noTraco * feito);",
        " diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.8,.42,.4), smoothstep(.0035, .0, abs(L.x)) * noTraco * feito * .4);"
      ].join("\n"))
  };
  mt.customProgramCacheKey = function () { return "pele" };
  pele = new THREE.Group(); scene.add(pele);
  metades.forEach(function (m) { var o = new THREE.Mesh(m.g, mt); o.receiveShadow = true; o.renderOrder = 1; pele.add(o); m.o = o });
  pele.userData.metades = metades; pele.userData.ab = -1
}
function abrePele(a) {   /* afasta a borda da pele na incisão */
  if (Math.abs(a - pele.userData.ab) < 1e-5) return; pele.userData.ab = a;
  pele.userData.metades.forEach(function (m) {
    var pos = m.g.attributes.position;
    m.base.forEach(function (p, k) {
      var w = wInc(p[2]) * a, ax = Math.abs(p[0]), f = Math.exp(-ax / .011);
      pos.setXYZ(k, p[0] + m.s * w * f * 1.02, p[1] - w * .25 * Math.exp(-ax / .003), p[2])
    });
    pos.needsUpdate = true; m.g.computeVertexNormals()
  })
}

/* ---------- parede da ferida: pele, subcutâneo, linha alba/músculo e peritônio, cada plano com sua abertura ---------- */
var CAMADAS = [  /* [profundidade do topo, da base, cor do topo, cor da base, qual abertura] */
  [0, .0016, 0xe9b3a6, 0xd88f80, "pele"], [.0016, .0046, 0xf2d483, 0xe8c56a, "sub"],
  [.0046, .0064, 0xf1ece4, 0xb84a40, "mus"], [.0064, .0085, 0xc0574c, 0x9d3d38, "mus"]];
function criaFerida() {
  var mt = MS(0xffffff, { vertexColors: true, roughness: .38, envMapIntensity: .6, side: THREE.DoubleSide });
  ferida = new THREE.Mesh(new THREE.BufferGeometry(), mt); ferida.renderOrder = 2; scene.add(ferida); ferida.userData.k = ""
}
function atualizaFerida() {
  var k = [ABRE.pele, ABRE.sub, ABRE.mus].map(function (x) { return x.toFixed(4) }).join();
  ferida.visible = ABRE.pele > .002 && UG.uRaio.value < .5; if (!ferida.visible || k === ferida.userData.k) return; ferida.userData.k = k;
  var NZ = 40, pos = [], col = [], ix = [], c = new COR(), lin = 0;
  [1, -1].forEach(function (s) {
    CAMADAS.forEach(function (cm) {
      [0, 1].forEach(function (bt) {
        c.setHex(bt ? cm[3] : cm[2]);
        var ab = bt && cm[4] === "pele" ? ABRE.sub * .3 + ABRE.pele * .7 : ABRE[cm[4]];
        if (cm[4] === "mus" && cm === CAMADAS[3]) ab *= .92;
        for (var j = 0; j <= NZ; j++) {
          var z = INC.zc - INC.h + 2 * INC.h * j / NZ, w = wInc(z) * ab * 1.02;
          pos.push(s * w, peleY(z) - (bt ? cm[1] : cm[0]) - (cm === CAMADAS[0] && !bt ? wInc(z) * ABRE.pele * .25 : 0), z); col.push(c.r, c.g, c.b)
        }
        lin++
      })
    })
  });
  var R = NZ + 1, L = lin / 2;
  for (var sd = 0; sd < 2; sd++) for (var l = 0; l < L - 1; l++) {
    for (var j = 0; j < NZ; j++) { var a = (sd * L + l) * R + j, b = a + 1, cc = a + R, d = cc + 1; ix.push(a, cc, b, b, cc, d) }
  }
  var g = ferida.geometry; g.dispose(); g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(ix); g.computeVertexNormals();
  ferida.geometry = g
}

/* ---------- cavidade: fundo peritoneal visto pela incisão ---------- */
function criaCavidade() {
  var g = new THREE.SphereGeometry(1, 40, 28); g.scale(.044, .04, .085);
  cavidade = new THREE.Mesh(g, MS(0x8f3a35, { roughness: .35, envMapIntensity: .5, side: THREE.BackSide }));
  cavidade.position.set(0, .107, -.052); scene.add(cavidade)
}

/* ---------- campo cirúrgico fenestrado ---------- */
function texturaTecido(cor, fios) {
  var c = document.createElement("canvas"); c.width = c.height = 256; var x = c.getContext("2d");
  x.fillStyle = cor; x.fillRect(0, 0, 256, 256);
  for (var i = 0; i < 256; i += 2) { x.fillStyle = "rgba(255,255,255," + (.04 + .05 * Math.random()) + ")"; x.fillRect(0, i, 256, 1); x.fillStyle = "rgba(0,30,60," + (.03 + .04 * Math.random()) + ")"; x.fillRect(i, 0, 1, 256) }
  for (i = 0; i < 1800; i++) { x.fillStyle = "rgba(255,255,255," + .06 * Math.random() + ")"; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * fios, 1) }
  var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t
}
function criaCampo() {
  var X0 = -.3, X1 = .3, Z0 = -.5, Z1 = .17, NX = 120, NZ = 150, hs = [];
  for (var j = 0; j <= NZ; j++) for (var i = 0; i <= NX; i++) {
    var x = lerp(X0, X1, i / NX), z = lerp(Z0, Z1, j / NZ); hs.push(Math.max(0, alturaPele(x, z, 0)))
  }
  /* o tecido “tenda”: dilata e suaviza a silhueta da gata */
  var W = NX + 1, H = NZ + 1, d = hs.slice();
  for (var it = 0; it < 4; it++) { var e = d.slice(); for (j = 1; j < H - 1; j++) for (i = 1; i < W - 1; i++) { var m = e[j * W + i]; for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) m = Math.max(m, e[(j + dj) * W + i + di] - .004); d[j * W + i] = m } }
  blur2(d, W, H, 6);
  var pos = [], uv = [], loc = [], ix = [];
  for (j = 0; j <= NZ; j++) for (i = 0; i <= NX; i++) {
    x = lerp(X0, X1, i / NX); z = lerp(Z0, Z1, j / NZ);
    var y = Math.max(d[j * W + i], hs[j * W + i]) + .0075, ex = Math.abs(x) - .246;
    if (ex > 0) y = Math.max(.003, y) - ex * 3.2 + (ex < .01 ? ex * ex * 40 : .004);   /* cai pela borda da mesa */
    else y = Math.max(y, .0035);
    pos.push(x, y, z); uv.push(x * 6, z * 6); loc.push(x, z)
  }
  for (j = 0; j < NZ; j++) for (i = 0; i < NX; i++) { var a = j * W + i, b = a + 1, c = a + W, dd = c + 1; ix.push(a, c, b, b, c, dd) }
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("aLoc", new THREE.Float32BufferAttribute(loc, 2));
  g.setIndex(ix); g.computeVertexNormals();
  var mt = MS(0xffffff, { map: texturaTecido("#93c3e6", 6), roughness: .88, envMapIntensity: .3, side: THREE.DoubleSide, transparent: true });
  mt.onBeforeCompile = function (sh) {
    sh.uniforms.uQueda = UQ.uQueda; sh.uniforms.uVis = UQ.uVis;
    sh.vertexShader = "attribute vec2 aLoc;\nvarying vec2 vLoc;\nuniform float uQueda;\n" + sh.vertexShader.replace("#include <begin_vertex>",
      "#include <begin_vertex>\n vLoc = aLoc;\n float alto = .23 + .012 * sin(aLoc.x * 23. + aLoc.y * 9.) * cos(aLoc.y * 17.);\n" +
      " float atraso = clamp(uQueda * 1.4 - length(aLoc - vec2(0., -.06)) * 1.1, 0., 1.);\n transformed.y = mix(transformed.y, alto, atraso);\n transformed.x *= mix(1., .92, atraso);");
    sh.fragmentShader = "varying vec2 vLoc;\nuniform float uVis;\n" + sh.fragmentShader.replace("#include <map_fragment>", [
      "#include <map_fragment>",
      " vec2 L = vLoc; float jx = abs(L.x) - " + JAN.x.toFixed(4) + ", jz = max(" + JAN.z0.toFixed(4) + " - L.y, L.y - " + JAN.z1.toFixed(4) + ");",
      " if (jx < 0. && jz < 0.) discard;",
      " float bd = max(jx, jz); diffuseColor.rgb *= mix(.82, 1., smoothstep(.0, .006, bd));",       /* bainha da fenestra */
      " diffuseColor.a *= uVis;"].join("\n"))
  };
  mt.customProgramCacheKey = function () { return "campo" };
  campo = new THREE.Mesh(g, mt); campo.receiveShadow = true; campo.castShadow = true; campo.renderOrder = 3; scene.add(campo);
  campo.userData.altura = function (x, z) {
    var i = Math.round((x - X0) / (X1 - X0) * NX), j = Math.round((z - Z0) / (Z1 - Z0) * NZ); i = cl(i, 0, NX); j = cl(j, 0, NZ); return pos[(j * W + i) * 3 + 1]
  };
  /* quatro pinças de campo nos cantos da fenestra */
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (c) {
    var f = ferramenta("backhaus"), x = c[0] * (JAN.x + .002), z = c[1] > 0 ? JAN.z1 + .002 : JAN.z0 - .002;
    f.alvo = P(x, campo.userData.altura(x, z) - .002, z); f.cabo = P(c[0] * 1, .32, c[1] * .55).normalize();
    f.normal = new V().crossVectors(f.cabo, P(0, 1, 0)).normalize(); abreRamos(f, 0); pincasCampo.push(f)
  })
}

/* ---------- sonda endotraqueal (paciente intubada durante a cirurgia) ---------- */
function criaSonda() {
  var mt = MF(0xd9eef7, { roughness: .15, transmission: 0, transparent: true, opacity: .55, envMapIntensity: 1, clearcoat: 1 });
  sonda = new Tubo(mt, .0042, 60, 14); scene.add(sonda.mesh);
  var con = new THREE.Mesh(new THREE.CylinderGeometry(.0065, .0065, .02, 18), MS(0x3a8fd0, { roughness: .4 })); sonda.con = con; scene.add(con)
}
function posicionaSonda(vis) {
  sonda.mesh.visible = sonda.con.visible = vis; if (!vis) return;
  var b = posOsso("Mouth"), h = posOsso("Head"), d = b.clone().sub(h).normalize();
  var p0 = h.clone().addScaledVector(d, .055).add(P(0, .004, 0));
  var pts = [p0.clone().addScaledVector(d, -.03), p0, p0.clone().addScaledVector(d, .03).add(P(0, .01, 0)), P(p0.x + .01, p0.y + .07, p0.z + .07), P(.04, .3, .42)];
  sonda.set(pts); sonda.con.position.copy(pts[2]); sonda.con.quaternion.setFromUnitVectors(P(0, 1, 0), pts[3].clone().sub(pts[2]).normalize())
}

/* ---------- gaze com antisséptico (segue a espiral) ---------- */
function criaGaze() {
  gaze = new THREE.Mesh(new THREE.IcosahedronGeometry(.007, 2), MS(0xf3e6cf, { roughness: .95, flatShading: true })); gaze.scale.set(1, .7, 1); scene.add(gaze)
}

function iniciaCampo() { criaPele(); criaFerida(); criaCavidade(); criaCampo(); criaSonda(); criaGaze() }
