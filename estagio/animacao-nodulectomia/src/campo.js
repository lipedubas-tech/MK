
/* ============================================================ campo operatório: bloco de tecido em camadas
   Referencial do bloco: x = v (largura do fuso), y = n (para fora da pele), z = u (eixo maior do fuso;
   a ponta ventral, perto do cotovelo, fica para o lado da câmera). Pele 4 mm, subcutâneo 17 mm, fáscia, músculo.
   O nódulo (4,4 × 3,6 × 3 cm) já tinha rompido a pele: metade da massa fica para fora, ulcerada e
   infeccionada, e a base entra no subcutâneo. O corte esquemático é o plano z = c:
   o que está à frente dele some e a face de corte mostra as camadas, o nódulo e os vasos.
   Todo movimento do tecido é um deslocamento lateral (em x) calculado a partir das coordenadas originais
   de cada ponto: assim a abertura da incisão, a retirada e o fechamento ficam coerentes em todas as malhas. */
var campo = new THREE.Scene();
var luzCampo = luzes(campo, new V3(0, 0, 0), .26);
luzCampo.sol.position.set(-.55, 1.6, .9);
var K = { U0: .15, V0: .11, L: .085, W: .03, tS: .004, tF: .017, tFa: .0018, fundo: .046, hB: .006, ru: NOD.ru, rv: NOD.rv, rn: NOD.rn, rasU: .108, rasV: .078 };
K.fasc = K.tS + K.tF;                       /* profundidade da fáscia */
K.nc = NOD.sobe;                            /* centro da massa: um pouco acima da pele (metade para fora) */
function S0(u, v) { return -(v * v) / (2 * .45) - (u * u) / (2 * .8); }
function bossa(u, v) { var r2 = (u / .04) * (u / .04) + (v / .032) * (v / .032); return r2 < 1 ? K.hB * (1 - r2) * (1 - r2) : 0; }
function hw(u) { return Math.abs(u) < K.L ? K.W * (1 - (u / K.L) * (u / K.L)) : 0; }
function pele(u, v) { return S0(u, v) + F.kB * bossa(u, v); }

/* estado do campo, preenchido a cada quadro por poseCampo(t) */
var F = { kB: 1, c: K.U0, marca: 0, inc: 0, dInc: 0, gO: 0, gI: 0, f1: -1, f2: -1, k1: 0, k2: 0, rem: 0, margem: 0, tensao: 0, leito: 0, peca: 0 };
function frente(f, u) { return clamp((f - u) / .016 + .5, 0, 1); }
function fecha(u, prof) {
  var fas = K.fasc + F.kB * bossa(u, 0) * 0;   /* a fáscia não acompanha a bossa */
  var k1 = F.k1 * frente(F.f1, u), k2 = F.k2 * frente(F.f2, u);
  var k = lerp(k2, k1, ss(K.tS - .0005, K.tS + .004, prof));
  return k * ss(fas + .002, fas - .001, prof);
}
/* deslocamento lateral de um ponto (u0, v0) a uma profundidade prof abaixo da pele; ilha = dentro do fuso */
function desloc(u0, v0, prof, ilha) {
  var h = hw(u0); if (h <= 0) return 0;
  var av = Math.abs(v0), sg = v0 < 0 ? -1 : 1;
  var corte = ss(F.dInc + .004, F.dInc - .001, prof);
  var afina = Math.sqrt(Math.max(0, 1 - (u0 / K.L) * (u0 / K.L)));
  if (ilha) return -sg * F.gI * afina * corte * Math.exp(-(h - av) / .008);
  var dist = Math.max(0, av - h), ab = F.gO * afina * corte;
  var d = sg * ab * Math.exp(-dist / .012);
  var k = fecha(u0, prof);
  if (k > 0) d -= sg * k * (h + ab) * Math.exp(-dist / .035);
  return d;
}

/* ---------------- shaders das camadas (cor por profundidade), usados na face de corte, nas laterais e nas paredes */
var UK = {
  uTS: { value: K.tS }, uTFa: { value: K.tFa }, uC: { value: K.U0 }, uNod: { value: new THREE.Vector4(0, 0, K.nc, 0) },
  uDInc: { value: 0 }, uHwC: { value: 0 }, uRem: { value: 0 }, uEps: { value: .0004 }, uLeito: { value: 0 },
  uMarca: { value: 0 }, uInc: { value: 0 }, uMargem: { value: 0 }, uTensao: { value: 0 }, uAberto: { value: 0 }, uKB: { value: 1 }
};
var GLSL_CAMADAS = [
  "uniform float uTS,uTFa,uC,uDInc,uHwC,uRem,uEps,uLeito,uMarca,uInc,uMargem,uTensao,uAberto,uKB;", "uniform vec4 uNod;",
  /* q: coordenadas no plano da face (m), prof: profundidade abaixo da pele, fasc: profundidade da fáscia */
  "vec3 camada(vec2 q, float prof, float fasc, out float rug){",
  "  vec3 c; rug = .5;",
  "  if (prof < .0006) { c = lin(vec3(.5,.38,.36)); rug = .5; }",
  "  else if (prof < uTS) { c = lin(vec3(.88,.62,.6)) * (.94 + .1 * vr(q * 900.));",
  "    float fo = fract((q.x + prof * .8) * 430.); c = mix(c, lin(vec3(.38,.26,.26)), smoothstep(.9, .96, fo) * step(prof, uTS * .85) * .8); rug = .55; }",
  "  else if (prof < fasc) { vec2 vo = voro(q * 430.); c = lin(vec3(.99,.87,.5)) * (.9 + .14 * (1. - vo.x));",
  "    c = mix(lin(vec3(.88,.66,.34)), c, smoothstep(.03, .1, vo.y)); rug = .38;",
  "    c = mix(c, lin(vec3(.9,.42,.36)), .35 * smoothstep(.985, 1., h12(floor(q * 900.)))); }",
  "  else if (prof < fasc + uTFa) { c = lin(vec3(.95,.93,.88)) * (.94 + .08 * vr(vec2(q.x * 300., prof * 4000.))); rug = .28; }",
  "  else { float fb = .5 + .5 * sin(q.y * 2400. + sin(q.x * 260.) * 1.8 + vr(q * 90.) * 3.);",
  "    c = lin(vec3(.66,.2,.21)) * (.82 + .24 * fb); rug = .42;",
  "    float pr = smoothstep(.955, .995, fract(q.y * 160. + vr(q * 40.) * .6)); c = mix(c, lin(vec3(.86,.6,.6)), pr * .55); }",
  "  float ln = min(min(abs(prof - uTS), abs(prof - fasc)), abs(prof - fasc - uTFa));",
  "  c *= .74 + .26 * smoothstep(.00008, .0004, ln);",
  "  return c; }",
  /* nódulo no corte: r = raio normalizado da elipse (0 no centro, 1 na borda) */
  "vec3 nodulo(vec2 q, float r, float dy){",
  "  vec2 vo = voro(q * 260.); vec3 c = lin(vec3(.5,.13,.22)) * (.85 + .25 * (1. - vo.x));",
  "  c = mix(lin(vec3(.32,.06,.14)), c, smoothstep(.02, .08, vo.y));",
  "  c = mix(c, lin(vec3(.62,.22,.34)), .2 * (1. - r));",
  "  float borda = smoothstep(.9, .965, r), fora = smoothstep(-.001, .003, dy);",
  "  c = mix(c, lin(vec3(.76,.62,.31)) * (.85 + .3 * vr(q * 900.)), borda * fora);",
  "  c = mix(c, lin(vec3(.82,.56,.62)), borda * (1. - fora) * .7);",
  "  c *= .82 + .18 * smoothstep(.0, .02, 1. - r);",
  "  return c; }"
].join("\n");

function matCamadas(tampa) {
  var m = new THREE.MeshStandardMaterial({ roughness: .5, metalness: 0, envMapIntensity: .55, side: THREE.DoubleSide });
  m.onBeforeCompile = function (sh) {
    Object.assign(sh.uniforms, UK);
    sh.vertexShader = "attribute vec4 aQ;\nvarying vec4 vQ;\nvarying float vY;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvQ = aQ; vY = position.y;");
    sh.fragmentShader = GLSL_RUIDO + "\n" + GLSL_CAMADAS + "\nvarying vec4 vQ;\nvarying float vY;\n" + sh.fragmentShader
      .replace("#include <map_fragment>", [
        "#include <map_fragment>",
        /* vQ: x = coordenada horizontal na face (v0 na frente/fundo, u0 nas laterais), y = profundidade, z = prof. da fáscia, w = lado (1 = ilha) */
        "float prof = vQ.y, fasc = vQ.z; float rug;",
        "vec2 q = vec2(vQ.x, vY);",
        tampa ? [
          /* acima da pele: pelos pretos fora da área raspada */
          "float rn = length(vec2(vQ.x / max(uNod.x, 1e-5), (vY - uNod.z) / max(uNod.y, 1e-5)));",
          "if (uNod.w > .5 && rn < 1. && uRem < .5) { diffuseColor.rgb = nodulo(q, rn, vY - uNod.z); rug = .35; }",
          "else if (prof < 0.) {",
          "  if (-prof > .0085) discard;",
          "  float ras = length(vec2(uC / " + K.rasU.toFixed(3) + ", vQ.x / " + K.rasV.toFixed(3) + "));",
          "  float w = vQ.x - prof * (.45 + .3 * h12(vec2(floor((vQ.x - prof * .55) * 1500.), 5.))); float fi = floor(w * 1500.); float tam = .0022 + .0038 * h12(vec2(fi, 3.));",
          "  float fio = smoothstep(.36, .12, abs(fract(w * 1500.) - .5)) * step(-prof, tam) * step(.35, h12(vec2(fi, 7.))) * step(1.03, ras + (vr(vec2(vQ.x * 120., 1.)) - .5) * .08);",
          "  if (fio < .5) discard;",
          "  diffuseColor.rgb = lin(vec3(.08,.075,.085)) * (.7 + .6 * h12(vec2(fi, 9.)));",
          "} else {",
          /* fenda da incisão (quando aberta) e cavidade depois da retirada */
          "  float bordaG = abs(abs(vQ.x) - uHwC);",
          "  if (bordaG < uEps && prof < uDInc + .004 && uHwC > 0. && uAberto > .5) discard;",
          "  if (uRem > .5 && abs(vQ.x) < uHwC && prof < fasc - .0002) discard;",
          "  diffuseColor.rgb = camada(q, prof, fasc, rug);",
          "  if (uRem > .5 && abs(vQ.x) < uHwC + .0006 && prof < fasc + uTFa && prof > fasc - .0008) diffuseColor.rgb = mix(diffuseColor.rgb, lin(vec3(.3,.8,.45)), uLeito * .5);",
          "}"].join("\n") : [
          "if (prof < 0.) discard;",
          "diffuseColor.rgb = camada(q, prof, fasc, rug);",
          "if (vQ.w > 1.5) { float fb2 = .5 + .5 * sin(vQ.x * 900. + sin(q.x * 300.) * 2.);",
          "  diffuseColor.rgb = mix(lin(vec3(.93,.84,.82)), lin(vec3(.78,.36,.36)), .32 + .18 * fb2); rug = .22;",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, lin(vec3(.3,.8,.45)), uLeito * .45); }"].join("\n"),
        "diffuseColor.rgb *= .9 + .1 * smoothstep(.05, .0, prof);"
      ].join("\n"))
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = rug;");
  };
  return m;
}
var PLANO = new THREE.Plane(new V3(0, 0, -1), K.U0);   /* mantém z <= c */
var matTampa = matCamadas(true), matLado = matCamadas(false), matLadoLivre = matCamadas(false);
matLado.clippingPlanes = [PLANO];

/* superfície da pele (topo): pelo preto, área raspada, antissepsia, marcação, margem, linha de incisão */
var matTopo = new THREE.MeshStandardMaterial({ roughness: .6, metalness: 0, envMapIntensity: .35, clippingPlanes: [PLANO] });
matTopo.onBeforeCompile = function (sh) {
  Object.assign(sh.uniforms, UK);
  sh.vertexShader = "attribute vec4 aQ;\nvarying vec4 vQ;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvQ = aQ;");
  sh.fragmentShader = GLSL_RUIDO + "\n" + GLSL_CAMADAS + "\nvarying vec4 vQ;\n" + sh.fragmentShader
    .replace("#include <map_fragment>", [
      "#include <map_fragment>",
      "float uu = vQ.x, vv = vQ.y; float L = " + K.L.toFixed(3) + ", W = " + K.W.toFixed(3) + ";",
      "float re = length(vec2(uu / " + K.rasU.toFixed(3) + ", vv / " + K.rasV.toFixed(3) + "));",
      "float bor = (vr(vec2(uu, vv) * 110.) - .5) * .07 + (vr(vec2(uu, vv) * 420.) - .5) * .03;",
      "float rasp = 1. - smoothstep(.97, 1.03, re + bor);",
      "vec3 pelo = lin(vec3(.105,.098,.11)) * (.7 + .55 * vr(vec2(uu * 1400., vv * 160.))) * (.85 + .3 * vr(vec2(uu, vv) * 70.));",
      "vec3 pl = lin(vec3(.53,.43,.41)) * (.84 + .3 * vr(vec2(uu, vv) * 160.)) * (.92 + .16 * vr(vec2(uu, vv) * 31.));",
      "pl = mix(pl, lin(vec3(.2,.17,.18)), smoothstep(.8, .95, h12(floor(vec2(uu, vv) * 2600.))) * .55);",
      "pl *= lin(vec3(.97,.78,.6)) * .7 + .3;",
      "vec3 c = mix(pelo, pl, rasp);",
      "float rmm = length(vec2(uu / " + K.ru.toFixed(3) + ", vv / " + K.rv.toFixed(3) + "));",
      "if (rmm < .955) discard;",
      "float infl = 1. - smoothstep(1., 1.6, rmm + (vr(vec2(uu, vv) * 300.) - .5) * .2);",
      "c = mix(c, lin(vec3(.62,.3,.3)) * (.85 + .3 * vr(vec2(uu, vv) * 400.)), infl * .8);",
      /* linhas de tensão da pele: finas, paralelas ao eixo maior */
      "float lt = (1. - smoothstep(.0, .0007, abs(fract(vv * 60. + .5) - .5) / 60.)) * rasp * uTensao * (1. - smoothstep(.06, .1, abs(uu)));",
      "c = mix(c, lin(vec3(.25,.5,.85)), lt * .55);",
      /* fuso: distância à borda e posição ao longo do contorno (0 a 1: lado direito e depois o esquerdo) */
      "float h = abs(uu) < L ? W * (1. - (uu / L) * (uu / L)) : 0.; float dh = -2. * W * uu / (L * L);",
      "float dG = abs(uu) < L ? (abs(vv) - h) / sqrt(1. + dh * dh) : length(vec2(abs(uu) - L, vv));",
      "float sG = vv >= 0. ? acos(clamp(-uu / L, -1., 1.)) / 6.2832 : .5 + acos(clamp(uu / L, -1., 1.)) / 6.2832;",
      /* margem: faixa de pele sã entre o nódulo e a linha */
      "float rnod = length(vec2(uu / " + (K.ru + .002).toFixed(4) + ", vv / " + (K.rv + .002).toFixed(4) + "));",
      "float faixa = smoothstep(.96, 1.04, rnod) * step(dG, 0.) * uMargem;",
      "c = mix(c, lin(vec3(.35,.78,.5)), faixa * .45);",
      "float contorno = (1. - smoothstep(.0, .025, abs(rnod - 1.))) * uMargem * step(.5, fract(atan(vv, uu) * 7.));",
      "c = mix(c, lin(vec3(.98,.95,.9)), contorno * .9);",
      /* marcação tracejada com caneta cirúrgica (violeta) */
      "float tr = step(.45, fract(sG * 34.));",
      "float mk = (1. - smoothstep(.0006, .0011, abs(dG))) * step(sG, uMarca) * tr;",
      "c = mix(c, lin(vec3(.36,.18,.6)), mk * .95);",
      /* linha de incisão por onde o bisturi já passou, com borda levemente avermelhada */
      "float ic = (1. - smoothstep(.0003, .0009, abs(dG))) * step(sG, uInc);",
      "c = mix(c, lin(vec3(.45,.06,.07)), ic);",
      "c = mix(c, c * lin(vec3(1.,.55,.52)), (1. - smoothstep(.0, .004, abs(dG))) * uAberto * .6);",
      "diffuseColor.rgb = c;"
    ].join("\n"))
    .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(.72, .6, rasp);");
};

var matTopoLivre = matTopo.clone(); matTopoLivre.clippingPlanes = []; matTopoLivre.onBeforeCompile = matTopo.onBeforeCompile;   /* sem corte (peça na bandeja) */

/* ---------------- malhas deformáveis: guardam (u0, v0, prof) de cada vértice e são recalculadas a cada quadro */
function malha(nv, idx, mat, info) {
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
  g.setAttribute("aQ", new THREE.BufferAttribute(new Float32Array(nv * 4), 4));
  g.setIndex(idx);
  var m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
  m.userData = info; return m;
}
function grade(ni, nj, fechadoI, inverte) {   /* índices de uma grade ni x nj (i = coluna); inverte = face para o outro lado */
  var ix = [];
  for (var j = 0; j < nj - 1; j++) for (var i = 0; i < (fechadoI ? ni : ni - 1); i++) {
    var i2 = (i + 1) % ni, a = j * ni + i, b = j * ni + i2, c = (j + 1) * ni + i, d = (j + 1) * ni + i2;
    if (inverte) ix.push(a, b, c, b, d, c); else ix.push(a, c, b, b, c, d);
  }
  return ix;
}
/* contorno do fuso: s de 0 a 1 (lado direito da ponta dorsal à ventral, depois o esquerdo de volta) */
function gama(s) {
  s = ((s % 1) + 1) % 1;
  if (s < .5) { var u = -K.L * Math.cos(PI * 2 * s); return [u, hw(u)]; }
  var u2 = K.L * Math.cos(PI * (2 * s - 1)); return [u2, -hw(u2)];
}
var NG = 240;                         /* pontos no contorno */
var SG = [];
for (var i = 0; i < NG; i++) SG.push(i / NG);

/* anel de pele em volta do fuso, até as bordas do bloco */
var anel = (function () {
  var NK = 34, nv = NG * (NK + 1), info = { u: new Float32Array(nv), v: new Float32Array(nv) };
  for (var i = 0; i < NG; i++) {
    var g = gama(SG[i]), ang = Math.atan2(g[1], g[0]), du = Math.cos(ang), dv = Math.sin(ang);
    var t = Math.min(K.U0 / Math.max(1e-6, Math.abs(du)), K.V0 / Math.max(1e-6, Math.abs(dv))), R = [du * t, dv * t];
    for (var k = 0; k <= NK; k++) {
      var w = Math.pow(k / NK, 1.7), id = k * NG + i;
      info.u[id] = lerp(g[0], R[0], w); info.v[id] = lerp(g[1], R[1], w);
    }
  }
  /* cantos do bloco exatos */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (cq) {
    var melhor = 0, md = 9;
    for (var i = 0; i < NG; i++) { var id = NK * NG + i, d = Math.hypot(info.u[id] - cq[0] * K.U0, info.v[id] - cq[1] * K.V0); if (d < md) { md = d; melhor = i; } }
    info.u[NK * NG + melhor] = cq[0] * K.U0; info.v[NK * NG + melhor] = cq[1] * K.V0;
  });
  var m = malha(nv, grade(NG, NK + 1, true, true), matTopo, info); campo.add(m); return m;
})();
/* paredes da incisão: lado de fora (no anel) e lado de dentro (na peça) */
var NP = 14;
function parede(ilha) {
  var nv = NG * NP, info = { u: new Float32Array(nv), v: new Float32Array(nv), p: new Float32Array(nv), ilha: ilha };
  for (var i = 0; i < NG; i++) { var g = gama(SG[i]); for (var j = 0; j < NP; j++) { var id = j * NG + i; info.u[id] = g[0]; info.v[id] = g[1]; info.p[id] = j / (NP - 1); } }
  return malha(nv, grade(NG, NP, true), matLado, info);
}
var paredeFora = parede(false); campo.add(paredeFora);
/* fundo da cavidade (fáscia) depois da retirada */
var NLS = 90, NLT = 13;
var leito = (function () {
  var nv = NLS * NLT, info = { u: new Float32Array(nv), v: new Float32Array(nv) };
  for (var i = 0; i < NLS; i++) { var u = -K.L * Math.cos(PI * i / (NLS - 1)); for (var j = 0; j < NLT; j++) { info.u[j * NLS + i] = u; info.v[j * NLS + i] = hw(u) * (2 * j / (NLT - 1) - 1); } }
  var m = malha(nv, grade(NLS, NLT, false, true), matLado, info); m.visible = false; campo.add(m); return m;
})();
/* peça: pele da ilha + parede de dentro + fundo de gordura + nódulo; levantada em bloco na retirada */
var peca = new THREE.Group(); campo.add(peca);
var ilhaTopo = (function () {
  var nv = NLS * NLT, info = { u: new Float32Array(nv), v: new Float32Array(nv), ilha: true };
  for (var i = 0; i < NLS; i++) { var u = -K.L * Math.cos(PI * i / (NLS - 1)); for (var j = 0; j < NLT; j++) { info.u[j * NLS + i] = u; info.v[j * NLS + i] = hw(u) * (2 * j / (NLT - 1) - 1) * .999; } }
  var m = malha(nv, grade(NLS, NLT, false, true), matTopo, info); peca.add(m); return m;
})();
var paredeDentro = parede(true); peca.add(paredeDentro);
var pecaFundo = (function () {
  var nv = NLS * NLT, info = { u: new Float32Array(nv), v: new Float32Array(nv) };
  for (var i = 0; i < NLS; i++) { var u = -K.L * Math.cos(PI * i / (NLS - 1)); for (var j = 0; j < NLT; j++) { info.u[j * NLS + i] = u; info.v[j * NLS + i] = hw(u) * (2 * j / (NLT - 1) - 1) * .999; } }
  var m = malha(nv, grade(NLS, NLT, false), matLado, info); peca.add(m); return m;
})();
/* nódulo em 3D (aparece inteiro quando a peça sai): elipsoide levemente lobulado, cápsula brilhante */
var noduloMesh = (function () {
  var m = new THREE.Mesh(GEO_NOD, matNodulo([PLANO]));
  m.position.set(0, K.nc, 0); m.castShadow = true; m.receiveShadow = true; peca.add(m); return m;
})();

/* laterais e fundo do bloco (fixas) */
function lateral(tipo) {
  var NA = 120, NR = 40, nv = NA * NR, P = new Float32Array(nv * 3), Q = new Float32Array(nv * 4);
  for (var a = 0; a < NA; a++) for (var r = 0; r < NR; r++) {
    var id = r * NA + a, s = a / (NA - 1), pr = Math.pow(r / (NR - 1), 1.6) * K.fundo, u, v;
    if (tipo === "esq" || tipo === "dir") { u = lerp(-K.U0, K.U0, s); v = tipo === "esq" ? K.V0 : -K.V0; }
    else { u = -K.U0; v = lerp(-K.V0, K.V0, s); }
    var y = S0(u, v) - pr;
    P[id * 3] = v; P[id * 3 + 1] = y; P[id * 3 + 2] = u;
    Q[id * 4] = tipo === "fundo" ? v : u; Q[id * 4 + 1] = pr; Q[id * 4 + 2] = K.fasc; Q[id * 4 + 3] = 0;
  }
  var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(P, 3)); g.setAttribute("aQ", new THREE.BufferAttribute(Q, 4));
  g.setIndex(grade(NA, NR, false)); g.computeVertexNormals();
  var m = new THREE.Mesh(g, matLado); m.receiveShadow = true; campo.add(m); return m;
}
["esq", "dir", "fundo"].forEach(lateral);
/* face de corte: grade em (v0, profundidade) no plano z = c, refeita a cada quadro */
var NTV = 150, NTR = 80;
var tampa = (function () {
  var nv = (NTV + 4) * NTR;
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
  g.setAttribute("aQ", new THREE.BufferAttribute(new Float32Array(nv * 4), 4));
  g.setIndex(grade(NTV + 4, NTR, false));
  var m = new THREE.Mesh(g, matTampa); m.receiveShadow = true; m.frustumCulled = false; campo.add(m); return m;
})();
/* linhas da face de corte: as primeiras ficam acima da pele (pelos); as outras vão da pele até o fundo do bloco */
var FR_TAMPA = [];
for (var r = 0; r < NTR; r++) { var f = r / (NTR - 1); FR_TAMPA.push(f < .2 ? -(1 - f / .2) : Math.pow((f - .2) / .8, 1.5)); }

/* ---------------- atualização das malhas */
function atualizaAnel() {
  var I = anel.userData, P = anel.geometry.attributes.position.array, Q = anel.geometry.attributes.aQ.array;
  for (var i = 0; i < I.u.length; i++) {
    var u = I.u[i], v = I.v[i];
    P[i * 3] = v + desloc(u, v, 0, false); P[i * 3 + 1] = pele(u, v); P[i * 3 + 2] = u;
    Q[i * 4] = u; Q[i * 4 + 1] = v;
  }
  anel.geometry.attributes.position.needsUpdate = true; anel.geometry.attributes.aQ.needsUpdate = true; anel.geometry.computeVertexNormals();
}
function atualizaParede(m) {
  var I = m.userData, P = m.geometry.attributes.position.array, Q = m.geometry.attributes.aQ.array;
  var fundoP = I.ilha ? K.fasc : (F.rem > .5 ? K.fasc : F.dInc + .004);
  for (var i = 0; i < I.u.length; i++) {
    var u = I.u[i], v = I.v[i], topo = pele(u, v), fas = topo - (S0(u, v) - K.fasc);
    var pr = I.p[i] * (I.ilha ? fas : Math.min(fundoP, fas));
    P[i * 3] = v + desloc(u, v, pr, I.ilha); P[i * 3 + 1] = topo - pr; P[i * 3 + 2] = u;
    Q[i * 4] = u * (v < 0 ? -1 : 1) + (v < 0 ? .3 : 0); Q[i * 4 + 1] = pr; Q[i * 4 + 2] = fas; Q[i * 4 + 3] = I.ilha ? 1 : 0;
  }
  m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.aQ.needsUpdate = true; m.geometry.computeVertexNormals();
}
function atualizaLente(m, modo) {
  var I = m.userData, P = m.geometry.attributes.position.array, Q = m.geometry.attributes.aQ.array;
  for (var i = 0; i < I.u.length; i++) {
    var u = I.u[i], v = I.v[i], y, x;
    if (modo === "topo") { y = pele(u, v); x = v + desloc(u, v, 0, true); Q[i * 4] = u; Q[i * 4 + 1] = v; }
    else if (modo === "leito") { var k1 = F.k1 * frente(F.f1, u); y = S0(u, v) - K.fasc; x = v * (1 - k1); Q[i * 4] = u; Q[i * 4 + 1] = K.fasc + .0003; Q[i * 4 + 2] = K.fasc; Q[i * 4 + 3] = 2; }
    else { y = S0(u, v) - K.fasc + .0002; x = v + desloc(u, v, K.fasc, true); Q[i * 4] = u; Q[i * 4 + 1] = K.fasc - .002; Q[i * 4 + 2] = K.fasc; }
    P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = u;
  }
  m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.aQ.needsUpdate = true; m.geometry.computeVertexNormals();
}
function atualizaTampa() {
  var c = F.c, h = hw(c), P = tampa.geometry.attributes.position.array, Q = tampa.geometry.attributes.aQ.array, ncol = NTV + 4;
  var cols = [];
  for (var i = 0; i < NTV; i++) cols.push(lerp(-K.V0, K.V0, i / (NTV - 1)));
  var e = UK.uEps.value * .5;
  if (h > 0) cols.push(-h - e, -h + e, h - e, h + e); else cols.push(-K.V0 * .5 + 1e-4, -K.V0 * .5 + 2e-4, K.V0 * .5 + 1e-4, K.V0 * .5 + 2e-4);
  cols.sort(function (a, b) { return a - b; });
  for (i = 0; i < ncol; i++) {
    var v = cols[i], ilha = Math.abs(v) < h, topo = pele(c, v), fas = topo - (S0(c, v) - K.fasc), base = S0(c, v) - K.fundo;
    for (var r = 0; r < NTR; r++) {
      var fr = FR_TAMPA[r], pr = fr < 0 ? fr * .024 : (topo - lerp(topo, base, fr)) + 1e-5, id = r * ncol + i, x;
      if (F.rem > .5 && ilha) x = v * (1 - F.k1 * frente(F.f1, c));
      else x = v + (pr < 0 ? desloc(c, v, 0, ilha) : desloc(c, v, pr, ilha));
      P[id * 3] = x; P[id * 3 + 1] = topo - pr; P[id * 3 + 2] = c;
      Q[id * 4] = v; Q[id * 4 + 1] = pr; Q[id * 4 + 2] = fas; Q[id * 4 + 3] = ilha ? 1 : 0;
    }
  }
  tampa.geometry.attributes.position.needsUpdate = true; tampa.geometry.attributes.aQ.needsUpdate = true; tampa.geometry.computeVertexNormals();
  UK.uC.value = c; UK.uHwC.value = h;
  var k = 1 - (c / K.ru) * (c / K.ru);
  UK.uNod.value.set(K.rv * Math.sqrt(Math.max(0, k)), K.rn * Math.sqrt(Math.max(0, k)), K.nc, k > 0 ? 1 : 0);
}

/* ---------------- vasos que nutrem o nódulo: artéria e veia sobem do plexo profundo até o polo do nódulo */
var C_CORTE = .003;
var matArt = M(0x8c0f1a, { roughness: .6, envMapIntensity: .25 }), matVei = M(0x1a3288, { roughness: .6, envMapIntensity: .25 });
var vasos = new THREE.Group(); campo.add(vasos);
var VASOS = {
  art: [[-.112, .0047], [-.08, .0045], [-.055, .005], [-.04, .0062], [-.03, .0085], [-.022, .0122], [-.0155, .0148]],
  vei: [[-.112, .0019], [-.08, .0018], [-.055, .0022], [-.04, .0032], [-.03, .0052], [-.021, .0086], [-.0135, .0112]],
  xLig: -.042, xCorte: -.035, xPinca: -.027
};
function caminhoVaso(lista, x0, x1, abre) {
  var pts = [], c = F.c;
  for (var i = 0; i < 26; i++) {
    var x = lerp(x0, x1, i / 25), y = 0;
    for (var j = 0; j < lista.length - 1; j++) if (x >= lista[j][0] && x <= lista[j + 1][0]) { var k = (x - lista[j][0]) / (lista[j + 1][0] - lista[j][0]); y = lerp(lista[j][1], lista[j + 1][1], suave(k)); }
    if (x > lista[lista.length - 1][0]) y = lista[lista.length - 1][1];
    var yy = S0(c, x) - K.fasc + y, pr = pele(c, x) - yy, ilha = Math.abs(x) < hw(c);
    pts.push(new V3(x + desloc(c, x, pr, ilha) + (abre || 0), yy, c + .0016));
  }
  return new THREE.CatmullRomCurve3(pts);
}
var vasoMeshes = [];
function refazVasos(cortado) {
  vasoMeshes.forEach(function (m) { vasos.remove(m); m.geometry.dispose(); }); vasoMeshes = [];
  var partes = cortado > 0 ? [[-.115, VASOS.xCorte - .0012, 0], [VASOS.xCorte + .0012, -.012, .0012 * cortado]] : [[-.115, -.012, 0]];
  partes.forEach(function (pp) {
    [[VASOS.art, .0014, matArt], [VASOS.vei, .0017, matVei]].forEach(function (vq) {
      var m = new THREE.Mesh(new THREE.TubeGeometry(caminhoVaso(vq[0], pp[0], pp[1], pp[2]), 40, vq[1], 10), vq[2]); m.castShadow = true; vasos.add(m); vasoMeshes.push(m);
    });
  });
}
/* fio da ligadura: laço que aperta os dois vasos, com nó por cima */
var matFioAbs = M(0x6a2fb0, { roughness: .5, envMapIntensity: .4, clippingPlanes: [PLANO] }), matNailon = M(0x2450c8, { roughness: .4, envMapIntensity: .4, clippingPlanes: [PLANO] });
var matLig = M(0x6a2fb0, { roughness: .5, envMapIntensity: .4 });
var ligadura = new THREE.Group(); campo.add(ligadura);
var ligLaco = new THREE.Mesh(new THREE.TorusGeometry(1, .00045 / .004, 8, 30), matLig); ligLaco.rotation.y = PI / 2; ligadura.add(ligLaco);
var ligNo = new THREE.Mesh(new THREE.SphereGeometry(.0011, 10, 8), matLig); ligadura.add(ligNo);
var ligPontas = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-.0015, 0, 0), new V3(-.002, .004, .001), new V3(-.001, .008, .0025)]), 12, .00045, 6), matLig); ligadura.add(ligPontas);
var ligPontas2 = ligPontas.clone(); ligPontas2.scale.x = -1; ligadura.add(ligPontas2);

/* ---------------- instrumental do campo */
var caneta = (function () {
  var g = new THREE.Group();
  g.add(lathe([[0, 0], [.0012, .0015], [.0024, .006], [.0045, .012], [.0045, .11], [.0040, .118], [0, .119]], M(0x6b3fa0, { roughness: .4 })));
  var ponta = lathe([[0, 0], [.0006, .0002], [.0013, .004], [0, .004]], M(0x3a1f60, { roughness: .6 })); g.add(ponta);
  var anelC = lathe([[.0047, .03], [.0049, .031], [.0049, .04], [.0047, .041]], M(0xf2f2f2, { roughness: .4 })); g.add(anelC);
  return sombras(g);
})();
var bist = bisturi(), kelly = pinca("kelly"), kellyVaso = pinca("kelly"), tesoura = pinca("tesoura"), adson = pincaDente(), porta = pinca("porta");
var agulhaP = new THREE.Mesh(new THREE.TorusGeometry(.0075, .00042, 6, 30, PI * .75), ACO); agulhaP.castShadow = true;
porta.add(agulhaP); agulhaP.position.set(.0005, .0005, 0); agulhaP.rotation.set(PI / 2, 0, PI * .1);
/* compressa de gaze dobrada (foto 2): almofada macia com trama aparente e uma dobra por cima, num branco frio
   para não sumir contra a fáscia creme do leito. O eixo maior (z) segue o eixo maior do fuso. */
var texCompressa = texCanvas(256, 256, function (g, w, h) {
  /* trama exagerada de propósito (fios a cada ~3 mm): na distância da câmera a trama real some e a gaze vira papel */
  g.fillStyle = "#f4f6f6"; g.fillRect(0, 0, w, h);
  for (var i = 0; i < w; i += 12) {
    g.fillStyle = "rgba(128,138,144," + (.34 + .2 * rnd()) + ")"; g.fillRect(i + (rnd() - .5) * 2, 0, 3, h);
    g.fillStyle = "rgba(128,138,144," + (.34 + .2 * rnd()) + ")"; g.fillRect(0, i + (rnd() - .5) * 2, w, 3);
  }
  for (i = 0; i < 120; i++) { g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(rnd() * w, rnd() * h, 4 + rnd() * 6, 1.5); }   /* fiapos */
  var vg = g.createRadialGradient(w / 2, h / 2, w * .3, w / 2, h / 2, w * .72); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(70,80,90,.22)");
  g.fillStyle = vg; g.fillRect(0, 0, w, h);   /* bordas um pouco mais escuras: as camadas dobradas */
});
function almofada(lx, lz, esp, ruga) {
  var geo = new THREE.BoxGeometry(1, 1, 1, 28, 2, 24), p = geo.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    var perfil = Math.sqrt(Math.max(0, 1 - Math.pow(2 * Math.abs(x), 4))) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * Math.abs(z), 4)));
    var X = x * lx, Z = z * lz;
    var onda = ruga * (Math.sin(X * 190 + Z * 60) * .6 + Math.sin(Z * 230 - X * 70) * .4);
    p.setXYZ(i, X, y * esp * (.3 + .7 * perfil) + (y > 0 ? onda * perfil : 0), Z);
  }
  geo.computeVertexNormals();
  var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texCompressa, color: 0xf0f5f9, roughness: .95, metalness: 0, envMapIntensity: .45 }));
  m.castShadow = true; m.receiveShadow = true; return m;
}
function compressa(lx, lz, esp) {
  var g = new THREE.Group();
  g.add(almofada(lx, lz, esp, .0005));
  var dobra = almofada(lx * .94, lz * .58, esp * .55, .0004);   /* a dobra de cima, deslocada para um lado */
  dobra.position.set(.0015, esp * .55, lz * .17); g.add(dobra);
  return g;
}
var gazeH = compressa(.044, .068, .0055);
[caneta, bist, kelly, kellyVaso, tesoura, adson, porta, gazeH].forEach(function (o) { o.visible = false; campo.add(o); });
/* coloca um instrumento: ponta em p, cabo na direção y, "lado" na direção x */
function orienta(o, p, y, x) {
  var Y = y.clone().normalize(), Z = new V3().crossVectors(x, Y).normalize(), X = new V3().crossVectors(Y, Z);
  o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); o.position.copy(p); o.visible = true;
}
function pontoGama(s, prof) {   /* ponto do contorno no estado atual, com tangente */
  var a = gama(s), b = gama(s + .002), u = a[0], v = a[1];
  var y = pele(u, v) - (prof || 0), x = v + desloc(u, v, prof || 0, false);
  return { p: new V3(x, y, u), t: new V3(b[1] - a[1], 0, b[0] - a[0]).normalize(), v: v };
}

/* ---------------- suturas */
var fioSub = new THREE.Mesh(new THREE.BufferGeometry(), matFioAbs), fioPele = new THREE.Mesh(new THREE.BufferGeometry(), matNailon);
fioSub.castShadow = fioPele.castShadow = true; campo.add(fioSub, fioPele);
var PONTOS_PELE = []; for (var pi = 0; pi < 19; pi++) PONTOS_PELE.push(-K.L + .006 + pi * .0086);
function tubo(m, pts, r) {
  m.geometry.dispose();
  if (pts.length < 2) { m.visible = false; m.geometry = new THREE.BufferGeometry(); return; }
  m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 6), r, 6); m.visible = true;
}
function pontoMaterial(u, v, prof) { return new V3(v + desloc(u, v, prof, false), pele(u, v) - prof, u); }
function atualizaSuturas() {
  /* subcutâneo: zigue-zague entre as paredes, a 9 mm de profundidade */
  var ps = [];
  if (F.k1 > 0) for (var u = -K.L + .004; u < Math.min(F.f1, K.L - .004); u += .0045) {
    var lado = Math.round((u + K.L) / .0045) % 2 ? 1 : -1, h = hw(u);
    ps.push(pontoMaterial(u, lado * (h + .0004), .009));
  }
  tubo(fioSub, ps, .0005);
  /* pele: contínua simples de náilon, pontos diagonais por cima da linha */
  var pp = [];
  if (F.k2 > 0) PONTOS_PELE.forEach(function (u) {
    if (u + .004 > F.f2) return;
    var h1 = hw(u), h2 = hw(u + .0043);
    var a = pontoMaterial(u, h1 + .0042, 0), b = pontoMaterial(u + .0043, -(h2 + .0042), 0);
    a.y += .0008; b.y += .0008; var m = a.clone().lerp(b, .5); m.y += .0022;
    pp.push(a, m, b);
    var b2 = b.clone(); b2.y -= .002; pp.push(b2);
  });
  tubo(fioPele, pp, .0006);
}

/* ---------------- pose do campo no tempo global */
function poseCampo(t) {
  var s3 = S[2], s4 = S[3], s5 = S[4], s6 = S[5], s7 = S[6], s8 = S[7], s9 = S[8];
  F.kB = 1;
  F.marca = seg(t, s3 + .8, s3 + 5);
  F.tensao = ss(s3 + .4, s3 + 1.2, t) * (1 - ss(s3 + 4.6, s3 + 5.4, t));
  F.margem = ss(s3 + 5, s3 + 5.8, t) * (1 - ss(s4 + .2, s4 + .9, t));
  F.inc = seg(t, s4 + .3, s4 + 5.3);
  F.dInc = t < s4 + .3 ? 0 : t < s5 ? .0095 : lerp(.0095, .017, ss(s5 + .5, s5 + 8, t));
  F.gO = .0016 * ss(s4 + 5, s4 + 6.2, t) + .0026 * ss(s5 + .5, s5 + 8, t);
  F.gI = .0007 * ss(s4 + 5, s4 + 6.2, t) + .0011 * ss(s5 + .5, s5 + 8, t);
  F.rem = t >= s7 + 1.6 ? 1 : 0;
  if (F.rem) { F.dInc = .017; }
  /* plano de corte: entra na incisão, sai antes da retirada, volta para mostrar o subcutâneo fechando */
  var cIn = ss(s4 + 5.6, s4 + 7.6, t), cOut = ss(s7, s7 + 1.4, t), cIn2 = ss(s9, s9 + 1.2, t), cOut2 = ss(s9 + 6.6, s9 + 7.6, t);
  F.c = t < s7 + 1.5 ? lerp(K.U0, C_CORTE, cIn * (1 - cOut)) : lerp(K.U0, C_CORTE, cIn2 * (1 - cOut2));
  F.k1 = t >= s9 + 1.2 ? 1 : 0; F.f1 = lerp(-K.L - .02, K.L + .02, seg(t, s9 + 1.3, s9 + 6.4));
  F.k2 = t >= s9 + 7.8 ? 1 : 0; F.f2 = lerp(-K.L - .02, K.L + .02, seg(t, s9 + 7.9, s9 + 15.3));
  F.leito = ss(s8 + 5, s8 + 5.8, t) * (1 - ss(s9, s9 + .6, t));
  PLANO.constant = F.c;
  UK.uMarca.value = F.marca; UK.uInc.value = F.inc; UK.uMargem.value = F.margem; UK.uTensao.value = F.tensao;
  UK.uDInc.value = F.dInc; UK.uRem.value = F.rem; UK.uLeito.value = F.leito; UK.uAberto.value = F.gO > .0002 ? 1 : 0;

  atualizaAnel(); atualizaParede(paredeFora); atualizaTampa();
  leito.visible = F.rem > .5; if (leito.visible) atualizaLente(leito, "leito");
  /* a peça: ilha de pele + nódulo; levantada em bloco na cena 7 */
  var sobe = eio(seg(t, s7 + 1.8, s7 + 3.6)), sai2 = eio(seg(t, s7 + 3.5, s7 + 4.7));
  peca.visible = t < s7 + 4.7;
  if (peca.visible) {
    atualizaLente(ilhaTopo, "topo"); atualizaParede(paredeDentro); atualizaLente(pecaFundo, "fundo");
    peca.position.set(sai2 * .16, sobe * .055 + sai2 * .06, sobe * .01);
    peca.rotation.set(-.32 * sobe, 0, -.25 * sai2);
  }
  /* vasos, ligadura */
  var mostraVasos = Math.abs(F.c - C_CORTE) < .004 && t < s7 + 1;
  vasos.visible = mostraVasos;
  var corte = ss(s6 + 5.4, s6 + 6.6, t);
  if (mostraVasos) refazVasos(corte);
  var lg = ss(s6 + 2.2, s6 + 4.6, t);
  ligadura.visible = mostraVasos && t > s6 + 2.2;
  if (ligadura.visible) {
    var xL = VASOS.xLig, yL = S0(F.c, xL) - K.fasc + .0045, r = lerp(.0058, .0034, lg);
    ligadura.position.set(xL + desloc(F.c, xL, .016, false), yL, F.c + .0016);
    ligLaco.scale.set(r, r * .82, r); ligNo.position.set(0, r * .82 + .0004, 0); ligPontas.position.copy(ligNo.position); ligPontas2.position.copy(ligNo.position);
    ligPontas.visible = ligPontas2.visible = lg > .8;
  }
  UK.uEps.value = .0004;
  atualizaSuturas();

  /* instrumental */
  [caneta, bist, kelly, kellyVaso, tesoura, adson, porta, gazeH].forEach(function (o) { o.visible = false; });
  var up = new V3(0, 1, 0), vx = new V3(1, 0, 0);
  if (t > s3 + .5 && t < s3 + 5.6) {          /* caneta desenha o fuso */
    var q = pontoGama(clamp(F.marca, 0, 1), 0), pr = q.p.clone(); pr.y += .0005 + .02 * (1 - ss(s3 + .5, s3 + .9, t) + ss(s3 + 5.1, s3 + 5.6, t));
    orienta(caneta, pr, new V3(.35, 1, .45), vx);
  }
  if (t > s4 && t < s4 + 5.9) {               /* bisturi percorre o fuso */
    var qb = pontoGama(clamp(F.inc, 0, 1), .0015), Nn = up.clone(), T = qb.t;
    var Yb = Nn.clone().multiplyScalar(.72).addScaledVector(T, -.69).normalize(), Xb = Nn.clone().add(T).multiplyScalar(-1).normalize();
    var pb = qb.p.clone(); pb.y += .03 * (1 - ss(s4, s4 + .35, t) + ss(s4 + 5.3, s4 + 5.9, t));
    orienta(bist, pb, Yb, Xb);
  }
  if (t > s5 + .3 && t < s5 + 8.2) {          /* hemostática curva divulsiona em volta do fuso */
    var sk = seg(t, s5 + .5, s5 + 7.6), qk = pontoGama(.77 + sk * .46, F.dInc - .002);
    var pk = qk.p.clone(); pk.y += .03 * (1 - ss(s5 + .3, s5 + .7, t) + ss(s5 + 7.6, s5 + 8.2, t));
    var fora = new V3(Math.sign(qk.v) || 1, 0, 0);
    orienta(kelly, pk, up.clone().multiplyScalar(.8).addScaledVector(fora, .45).addScaledVector(qk.t, -.3), qk.t);
    kelly.userData.abre(.07 * (.5 + .5 * Math.sin((t - s5) * 9)));
  }
  if (t > s5 + 8 && t < s5 + 9.9) {           /* tesoura de Metzenbaum completa a dissecção no plano profundo */
    var qt = pontoGama(.25, F.dInc), pt2 = qt.p.clone(); pt2.y += .02 * (1 - ss(s5 + 8, s5 + 8.4, t) + ss(s5 + 9.5, s5 + 9.9, t));
    orienta(tesoura, pt2, up.clone().multiplyScalar(.7).add(new V3(-.5, 0, .45)), vx);
    tesoura.userData.abre(.12 * (.5 + .5 * Math.cos((t - s5 - 8) * 11)));
  }
  if (t > s6 + .3 && t < s7 + .8 && mostraVasos) {   /* pinça nos vasos, do lado da peça */
    var fecha2 = ss(s6 + .5, s6 + 1.6, t), xP = VASOS.xPinca;
    var pp2 = new V3(xP + desloc(F.c, xP, .015, true), S0(F.c, xP) - K.fasc + .0035, F.c + .004);
    orienta(kellyVaso, pp2.clone().add(new V3(0, .03 * (1 - ss(s6 + .3, s6 + .9, t)), 0)), new V3(.2, .75, .62), new V3(1, 0, 0));
    kellyVaso.userData.abre(.11 * (1 - fecha2));
  }
  if (t > s6 + 5 && t < s6 + 7.2) {           /* tesoura corta entre a ligadura e a pinça */
    var xc = VASOS.xCorte, pc = new V3(xc + desloc(F.c, xc, .016, false), S0(F.c, xc) - K.fasc + .004, F.c + .005);
    orienta(tesoura, pc.clone().add(new V3(0, .02 * (1 - ss(s6 + 5, s6 + 5.4, t) + ss(s6 + 6.8, s6 + 7.2, t)), 0)), new V3(-.3, .8, .6), new V3(0, 0, 1));
    tesoura.userData.abre(.14 * (1 - ss(s6 + 5.4, s6 + 6.4, t)));
  }
  if (t > s7 + 1.3 && t < s7 + 4.7) {         /* pinça dente de rato levanta a peça pela borda */
    var alvo = new V3(.004, pele(.05, .004) + .001, .05).applyMatrix4(peca.matrixWorld.clone());
    peca.updateMatrixWorld(); alvo = new V3(.004, pele(.05, .004) + .001, .05).applyMatrix4(peca.matrixWorld);
    var desce2 = 1 - ss(s7 + 1.3, s7 + 1.8, t);
    orienta(adson, alvo.clone().add(new V3(0, .03 * desce2, 0)), new V3(.15, .85, .5), new V3(1, 0, 0));
    adson.userData.abre(1 - ss(s7 + 1.6, s7 + 1.85, t));
  }
  if (t > s8 + .4 && t < s8 + 5.2) {          /* compressa de gaze desce até o leito, comprime (achata e pulsa) e sai limpa */
    var pz = ss(s8 + .4, s8 + 1.4, t) * (1 - ss(s8 + 4, s8 + 5.2, t));
    var aperta = ss(s8 + 1.2, s8 + 1.6, t) * (1 - ss(s8 + 4, s8 + 4.4, t)), pulso = .06 * aperta * (.5 - .5 * Math.cos((t - s8 - 1.6) * TAU / 1.2));
    var achata = 1 - .35 * aperta - pulso, fundoLeito = S0(0, 0) - K.fasc;
    gazeH.visible = true; gazeH.position.set(0, lerp(.06, fundoLeito + .0006, pz), .002); gazeH.rotation.set(0, .08, 0);
    gazeH.scale.set(1 + .06 * aperta, achata, 1 + .04 * aperta);
  }
  if (t > s9 + 7.6 && t < s9 + 15.8) {        /* porta-agulhas com agulha curva */
    var u2 = clamp(F.f2, -K.L + .006, K.L - .006), mergulho = .5 + .5 * Math.cos((t - s9) * TAU / (7.4 / 19));
    var pn = new V3(.006 + .004 * mergulho, pele(u2, 0) + .003 + .004 * mergulho, u2 + .004);
    pn.y += .03 * (1 - ss(s9 + 7.6, s9 + 8, t) + ss(s9 + 15.4, s9 + 15.8, t));
    orienta(porta, pn, new V3(.55, .8, .35), new V3(0, 0, -1));
    porta.userData.abre(.02);
    agulhaP.rotation.z = PI * .1 + mergulho * .8;
  }
  if (t > s9 + 1 && t < s9 + 6.8) {           /* subcutâneo: o mesmo porta-agulhas dentro da ferida */
    var u3 = clamp(F.f1, -K.L + .006, K.L - .006), m2 = .5 + .5 * Math.cos((t - s9) * 9);
    var pn2 = new V3(.004 * m2, pele(u3, 0) - .006 + .004 * m2, u3);
    pn2.y += .03 * (1 - ss(s9 + 1, s9 + 1.4, t) + ss(s9 + 6.4, s9 + 6.8, t));
    orienta(porta, pn2, new V3(.5, .82, .3), new V3(0, 0, -1));
    agulhaP.rotation.z = PI * .1 + m2 * .8;
  }
}

/* ---------------- tomadas do campo */
(function () {
  var s = S;
  /* 3. marcação */
  tomada(s[2], "campo", [.12, .36, .36], [0, -.006, .006], 30, true);
  tomada(s[2] + 4.6, "campo", [.07, .3, .3], [0, -.006, .004], 30);
  tomada(s[2] + 7.8, "campo", [.05, .27, .26], [0, -.004, .002], 30);
  /* 4. incisão: de cima, depois de frente para a face de corte */
  tomada(s[3], "campo", [.05, .27, .26], [0, -.004, .002], 30);
  tomada(s[3] + 5.2, "campo", [.08, .26, .28], [0, -.006, .0], 30);
  tomada(s[3] + 7.8, "campo", [.07, .1, .3], [-.004, -.014, 0], 30);
  /* 5. dissecção */
  tomada(s[4] + 9.6, "campo", [.09, .14, .27], [-.004, -.012, 0], 30);
  /* 6. vasos: aproxima do pedículo */
  tomada(s[5] + 1.2, "campo", [-.005, .055, .16], [-.03, -.016, 0], 30);
  tomada(s[5] + 8.6, "campo", [.0, .06, .17], [-.028, -.016, 0], 30);
  /* 7. retirada */
  tomada(s[6] + 1.4, "campo", [.12, .22, .3], [0, -.004, 0], 30);
  tomada(s[6] + 4.5, "campo", [.16, .26, .32], [.03, .01, 0], 30);
  /* 8. hemostasia */
  tomada(s[7], "campo", [.08, .27, .27], [0, -.012, .002], 30, true);
  tomada(s[7] + 7.8, "campo", [.06, .25, .24], [0, -.014, .002], 30);
  /* 9. sutura: de frente (subcutâneo fechando no corte), depois de cima (pele) */
  tomada(s[8] + 1.2, "campo", [.07, .1, .3], [-.002, -.012, 0], 30);
  tomada(s[8] + 6.4, "campo", [.06, .11, .29], [-.002, -.012, 0], 30);
  tomada(s[8] + 8, "campo", [.07, .27, .27], [0, -.004, .002], 30);
  tomada(s[8] + 15.8, "campo", [.05, .23, .23], [0, -.004, .004], 30);
})();
function pontoCorte(v, y) { return function () { return new V3(v, y, F.c); }; }
function pontoTopo(u, v) { return function () { return new V3(v, pele(u, v), u); }; }
rotulo(S[2] + 1.0, S[2] + 4.6, "campo", "Linhas de tensão da pele", "o eixo maior do fuso segue essas linhas", pontoTopo(-.03, .045), 11, -7);
rotulo(S[2] + .6, S[2] + 4.6, "campo", "Nódulo ulcerado", "infeccionado; pele inflamada em volta", function () { return new V3(-.004, K.nc + K.rn * .9, .006); }, -15, -6);
rotulo(S[2] + 5.4, S[2] + 8, "campo", "Margem de segurança", "faixa de pele sã entre o nódulo e a incisão", pontoTopo(.0, .026), 14, -6);
rotulo(S[3] + 7.6, S[4] + 9.8, "campo", "Pele", null, pontoCorte(.075, S0(C_CORTE, .075) - .002), 8, -6);
rotulo(S[3] + 7.8, S[4] + 9.8, "campo", "Subcutâneo", "gordura", pontoCorte(.07, S0(C_CORTE, .07) - .012), 9, 0);
rotulo(S[3] + 8.0, S[4] + 9.8, "campo", "Fáscia", null, pontoCorte(.066, S0(C_CORTE, .066) - K.fasc - .0009), 9, 4);
rotulo(S[3] + 8.2, S[4] + 9.8, "campo", "Músculo", null, pontoCorte(.06, S0(C_CORTE, .06) - .034), 9, 6);
rotulo(S[3] + 7.9, S[4] + 9.8, "campo", "Nódulo", "rompeu a pele e ficou exposto", pontoCorte(-.004, K.nc - .002), -14, -10);
rotulo(S[4] + 3, S[4] + 9.8, "campo", "Úlcera infeccionada", "crostas e exsudato", pontoCorte(K.rv * .5, K.nc + K.rn * .84), 12, -9);
rotulo(S[5] + 1.4, S[5] + 8.8, "campo", "Artéria e veia do nódulo", null, function () { return new V3(-.07, S0(C_CORTE, -.07) - K.fasc + .004, F.c + .002); }, -6, 7);
rotulo(S[5] + 4.4, S[5] + 8.8, "campo", "Ligadura", "antes do corte", function () { return ligadura.position.clone(); }, -9, -7);
rotulo(S[7] + 1.7, S[7] + 4.4, "campo", "Compressão com gaze", "pressão direta, sem esfregar o leito", function () { return gazeH.position.clone().add(new V3(.018, .006, -.012)); }, 13, -8);
rotulo(S[7] + 5.4, S[7] + 8, "campo", "Leito sem sangramento", null, function () { return new V3(0, S0(0, 0) - K.fasc + .001, .02); }, 10, -7, "ok");
rotulo(S[8] + 2.5, S[8] + 6.6, "campo", "Subcutâneo aproximado", "fio absorvível, sem espaço morto", pontoCorte(0, -.012), 11, -8);
rotulo(S[8] + 10, S[8] + 16, "campo", "Pele: náilon 3-0", "sutura contínua", function () { return new V3(0, pele(-.03, 0) + .002, -.03); }, 10, -8);
