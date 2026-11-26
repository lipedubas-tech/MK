/* ============================================================ o coelho
   Modelo: "Rabbit Rigged", de FourthGreen (Sketchfab), CC BY 4.0, modificado: sem a textura original,
   com a pelagem do paciente (pelo longo em camadas), olhos novos, feridas, tosa e produtos feitos no shader.
   Todas as máscaras (feridas, tosa, lente, sprays) ficam no espaço de ligação da malha (as posições guardadas
   no arquivo), então acompanham o corpo em qualquer pose. Nesse espaço: +Y para cima, +Z para a frente,
   a garupa em z ≈ -8, o dorso em y ≈ 18, a região perineal em (0, 6,5, -7). */

var NCAM = CELULAR ? 8 : 18;          /* camadas de pelo */
var PELO = 3.3;                       /* comprimento do pelo no corpo, em u (≈ 5 cm) */

/* regiões no espaço de ligação (medidas no próprio arquivo) */
var OLHO_D = new V3(-2.25, 18.55, 9.3), OLHO_E = new V3(2.25, 18.55, 9.3);
var NARIZ = new V3(0, 17.0, 12.15);   /* ponta do focinho (o vértice mais à frente da cabeça está em 0, 17,1, 12,25) */
var FERIDAS = [   /* centro, raios: dorso, garupa, base da cauda, região genital e perineal */
  { c: [0, 18.3, -1.6], r: [2.5, 2.2, 3.4] },
  { c: [0, 14.6, -7.7], r: [3.3, 2.8, 2.6] },
  { c: [0, 9.9, -9.0], r: [2.3, 2.0, 2.0] },
  { c: [0, 6.5, -6.9], r: [2.4, 1.9, 2.5] }
];
var ZONAS = [     /* tosa: centro, raios, sentido em que a máquina avança */
  { c: [0, 18.0, -1.6], r: [5.6, 3.8, 6.2], a: [0, 0, -1] },
  { c: [0, 12.6, -8.4], r: [5.8, 5.8, 3.9], a: [0, -1, 0] },
  { c: [0, 6.3, -6.6], r: [4.4, 3.2, 4.0], a: [0, 0, 1] }
];
var LENTES = {    /* onde a lente olha */
  garupa: { c: new V3(0, 14.2, -8.4), r: 4.6 },
  dorso: { c: new V3(0, 18.6, -1.6), r: 4.2 },
  perineo: { c: new V3(0, 6.3, -7.6), r: 3.9 },
  cauda: { c: new V3(0, 10.2, -9.6), r: 3.6 }
};
var PRATA = { c: [0, 15.5, -5.5], r: [6.5, 6.0, 6.5] };   /* onde o spray prata caiu */

function g3(a) { return "vec3(" + a.map(function (x) { return x.toFixed(3); }).join(",") + ")"; }

/* a lente é um círculo na tela (uLensS: centro e raio em pixels do canvas), preso a um ponto do corpo (uLensC,
   no espaço de ligação) e com o raio uLensR medido no corpo; fim.js projeta os dois a cada quadro */
var U = {
  uLayer: { value: 0 }, uLensC: { value: new V3() }, uLensR: { value: 4 }, uLensA: { value: 0 }, uLensS: { value: new V3(0, 0, 1) },
  uTosa: { value: new V3() }, uFerida: { value: 0 }, uPrata: { value: 0 }, uRif: { value: 0 }, uAlcool: { value: 0 },
  uSujo: { value: 0 }, uGrav: { value: new V3(0, -1, 0) }, uVeia: { value: 0 }, uSuave: { value: 0 }, uTempo: { value: 0 },
  uFurL: { value: PELO }, uOvos: { value: 0 }
};

var GLSL_COELHO = [
  GLSL_RUIDO,
  "uniform vec3 uLensC, uTosa, uGrav;",
  "uniform float uLensR, uLensA, uFerida, uPrata, uRif, uAlcool, uSujo, uVeia, uSuave, uTempo, uFurL;",
  "float elip(vec3 p, vec3 c, vec3 r){ return 1. - length((p - c) / r); }",
  "float zona(vec3 p, vec3 c, vec3 r, vec3 a, float prog){",
  "  if (prog <= 0.) return 0.;",
  "  float dentro = smoothstep(-.02, .14, elip(p, c, r) + (vn3(p * 1.3) - .5) * .22);",
  "  float s = dot(p - c, a) / dot(abs(a), r) * .5 + .5;",
  "  return dentro * (1. - smoothstep(prog * 1.12 - .05, prog * 1.12 + .02, s));",
  "}",
  "float tosa(vec3 p){",
  "  return max(max(zona(p," + g3(ZONAS[0].c) + "," + g3(ZONAS[0].r) + "," + g3(ZONAS[0].a) + ",uTosa.x),",
  "             zona(p," + g3(ZONAS[1].c) + "," + g3(ZONAS[1].r) + "," + g3(ZONAS[1].a) + ",uTosa.y)),",
  "             zona(p," + g3(ZONAS[2].c) + "," + g3(ZONAS[2].r) + "," + g3(ZONAS[2].a) + ",uTosa.z));",
  "}",
  "float campoFerida(vec3 p){",
  "  float f = max(max(" + FERIDAS.map(function (F, i) { return "elip(p," + g3(F.c) + "," + g3(F.r) + ")" + (i === 1 ? "), max(" : i === 3 ? "))" : ","); }).join("") + ";",
  "  return f + (fbm3(p * .9 + 1.7) - .5) * .75;",
  "}",
  "float ferida(vec3 p){ return clamp((campoFerida(p) + mix(-1.45, 0., uFerida)) * 2.4, 0., 1.); }",   /* em 0, nenhuma ferida */
  "float prataM(vec3 p){ return uPrata * smoothstep(0., .35, elip(p," + g3(PRATA.c) + "," + g3(PRATA.r) + ") + (fbm3(p * .7 + 9.) - .5) * .6); }",
  /* pelagem do paciente: frente branca, corpo cinza-escuro acastanhado, manchas cinza-claras */
  "vec3 corPelo(vec3 p, vec4 rg){",
  "  vec3 escuro = lin(vec3(.231,.208,.192)), claro = lin(vec3(.608,.584,.561)), branco = lin(vec3(.925,.91,.886));",
  "  float nz = fbm3(p * .33) * 2. - 1.;",
  "  float frente = smoothstep(3.6, 7.2, p.z + nz * 2.4) * (1. - rg.x * .6);",
  "  float meio = smoothstep(-4.5, -.5, p.z + nz * 2.2) * (1. - frente);",
  "  float mancha = smoothstep(.56, .7, vn3(p * .36 + 2.)) * meio;",
  "  vec3 c = escuro * (.85 + .3 * vn3(p * .8 + 5.));",
  "  c = mix(c, claro, mancha * .8);",
  "  c = mix(c, mix(claro, branco, .35), smoothstep(-.5, 4., p.z + nz * 3.) * (1. - frente) * .5);",
  "  c = mix(c, branco, frente);",
  "  c = mix(c, mix(escuro, claro, .3), rg.x);",
  "  return c;",
  "}",
  "float dseg(vec3 p, vec3 a, vec3 b){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }"
].join("\n");

/* nada do coelho aparece abaixo da mesa ou do chão (patas e pelo da barriga) */
var CHAO = new THREE.Plane(new V3(0, 1, 0), -.05);
ren.localClippingEnabled = true;
function matCoelho(camada) {
  var m = new THREE.MeshStandardMaterial({ roughness: .9, metalness: 0, envMapIntensity: .55, skinning: true, clippingPlanes: [CHAO] });
  m.extensions = { derivatives: true };
  var meu = { value: camada };
  m.onBeforeCompile = function (sh) {
    for (var k in U) sh.uniforms[k] = U[k];
    sh.uniforms.uLayer = meu;
    sh.vertexShader = "attribute vec4 aReg;\nuniform float uLayer;\nvarying vec3 vBind;\nvarying vec4 vReg;\nvarying float vL;\n" + GLSL_COELHO + "\n" +
      sh.vertexShader.replace("#include <skinning_vertex>", [
        "#include <skinning_vertex>",
        "vBind = position; vReg = aReg;",
        "float L = uFurL;",
        "L *= 1. - .72 * aReg.y;",                                   /* cabeça: pelo curto, para o rosto aparecer */
        "L *= 1. - .9 * aReg.x;",                                    /* orelhas */
        "L *= 1. - .55 * aReg.z;",                                   /* patas */
        "L *= smoothstep(.55, 1.5, min(distance(position, " + g3(OLHO_D.toArray()) + "), distance(position, " + g3(OLHO_E.toArray()) + ")));",
        "L *= 1. - .9 * smoothstep(9.6, 11.4, position.z) * step(14.5, position.y);",   /* focinho */
        "L *= smoothstep(.6, 1.8, distance(position, " + g3(NARIZ.toArray()) + "));",  /* nariz e boca sem pelo */
        /* tosa: as camadas descem até a pele onde a máquina passou, e a borda do pelo cortado fica em rampa,
           sem degraus (a máscara fina, por pixel, termina o corte no fragment shader) */
        "L *= 1. - smoothstep(0., .7, tosa(position));",
        "vL = L;",
        "transformed += normalize(objectNormal) * L * uLayer + uGrav * L * uLayer * uLayer * .55;"
      ].join("\n"));
    sh.fragmentShader = "uniform float uLayer;\nvarying vec3 vBind;\nvarying vec4 vReg;\nvarying float vL;\n" + GLSL_COELHO + "\n" +
      sh.fragmentShader
        .replace("#include <clipping_planes_pars_fragment>", "#include <clipping_planes_pars_fragment>\n" +
          "vec3 relevo(vec3 n, float h, float k){ vec3 dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition); float hx = dFdx(h), hy = dFdy(h);" +
          " vec3 q1 = cross(dpy, n), q2 = cross(n, dpx); float det = dot(dpx, q1); vec3 g = sign(det) * (hx * q1 + hy * q2) * k; return normalize(abs(det) * n - g); }\n" +
          "float gFerida, gRug, gCrosta, gBrilho, gMetal;\n" +
          /* lente na tela: tudo o que cai dentro do círculo perde o pelo, com a borda desfiada */
          "uniform vec3 uLensS;\n" +
          "float lente(){ return uLensA * (1. - smoothstep(uLensS.z * .8, uLensS.z, distance(gl_FragCoord.xy, uLensS.xy))); }\n")
        .replace("#include <map_fragment>", [
          "#include <map_fragment>",
          "vec3 p = vBind;",
          "float sh = tosa(p), le = lente(), w = ferida(p);",
          "gFerida = 0.; gRug = 0.; gCrosta = 0.; gBrilho = 0.; gMetal = 0.;",
          "if (uLayer > 0.) {",
          /* ----- camada de pelo: fios por ruído, mais finos na ponta */
          "  float len = vL * (1. - sh);",
          "  if (len < .08 || sh > .5) discard;",
          "  vec3 pc = p + vec3(sin(p.y * 2.1 + p.z * 1.3), sin(p.z * 1.7 + p.x * 1.1), sin(p.x * 1.9 + p.y * 1.4)) * .22 * uLayer;",
          "  float n = .58 * vn3(pc * 7.6) + .42 * vn3(pc * 2.1 + 3.1);",
          "  float lim = uLayer * uLayer * .5 + uLayer * .38 + vReg.x * .35 + (h12(gl_FragCoord.xy) - .5) * .05 + sh * 1.1;",
          "  if (n < lim) discard;",
          "  if (le > .3 + .35 * n) discard;",
          "  vec3 c = corPelo(p, vReg) * (.86 + .3 * vn3(p * 2.3 + 7.));",
          "  c *= mix(.4, 1.06, pow(uLayer, .75));",
          "  c = mix(c, c * 1.2 + .02, smoothstep(.7, 1., uLayer) * .6);",
          "  float pr = prataM(p) * smoothstep(.35, .85, uLayer);",
          "  c = mix(c, lin(vec3(.74,.76,.79)), pr * .85); gMetal = pr * .7;",
          "  diffuseColor.rgb = c;",
          "} else {",
          /* ----- pele: raiz escura sob o pelo; pele, restolho e feridas onde a tosa ou a lente mostram */
          "  float vis = max(sh, smoothstep(.25, .6, le));",
          "  vec3 raiz = corPelo(p, vReg) * .32;",
          /* pele tosada (fotos 2 e 3): cinza-rosada, com o restolho do pelo, claro sob o pelo branco e escuro sob o cinza */
          "  vec3 pele = lin(vec3(.62,.57,.55)) * (.92 + .16 * vn3(p * 2.6));",
          "  float rq = vn3(p * 7.) * .6 + vn3(p * 21.) * .4;",
          "  vec3 rest = mix(pele, corPelo(p, vReg) * .85 + .03, .34 + .3 * rq);",
          "  vec3 c = mix(raiz, rest, vis);",
          /* rosto: pelo curto e branco no focinho, nariz rosado com as narinas, boca em Y */
          "  float face = smoothstep(9.8, 11.2, p.z) * step(14.5, p.y);",
          "  float dOlho = min(distance(p, " + g3(OLHO_D.toArray()) + "), distance(p, " + g3(OLHO_E.toArray()) + "));",
          "  c = mix(c, lin(vec3(.2,.15,.13)), 1. - smoothstep(.65, 1.05, dOlho));",   /* pálpebra escura em volta do olho */
          "  c = mix(c, mix(lin(vec3(.84,.81,.78)), lin(vec3(.93,.92,.9)), vn3(p * 9.)), face);",
          "  float nariz = 1. - smoothstep(.75, 1., length((p - " + g3(NARIZ.toArray()) + ") / vec3(.7, .42, .55)));",
          "  c = mix(c, lin(vec3(.74,.5,.5)), nariz);",
          "  float narina = (1. - smoothstep(.06, .14, abs(abs(p.x) - .32))) * (1. - smoothstep(.05, .16, abs(p.y - 16.98))) * nariz;",
          "  c = mix(c, lin(vec3(.25,.13,.13)), narina * .8);",
          "  float boca = (1. - smoothstep(.05, .11, abs(p.x))) * step(16.15, p.y) * step(p.y, 16.72) * step(11.2, p.z);",
          "  float labio = (1. - smoothstep(.05, .11, abs(p.y - 16.2 - abs(p.x) * .45))) * step(abs(p.x), .75) * step(11., p.z);",
          "  c = mix(c, lin(vec3(.32,.22,.22)), max(boca, labio) * .85);",
          /* umidade e sujeira presas junto da pele (cena 2) */
          "  float sj = uSujo * smoothstep(0., .4, elip(p, vec3(0.,9.,-8.), vec3(5.,6.5,4.)) + (fbm3(p * 1.4) - .5) * .5) * vis;",
          "  c = mix(c, lin(vec3(.36,.29,.2)) * (.8 + .4 * vn3(p * 6.)), sj * .7);",
          /* feridas: halo inflamado, centro em carne viva, crostas amareladas */
          /* feridas (fotos 2 e 3): pele inchada e enrugada, avermelhada; placas de crosta amarelada com fendas
             escuras; no centro, carne viva com os buracos onde as larvas entram; borda úmida e escura.
             Ruído em frequência baixa (q deformado), para não granular de longe. */
          "  vec3 q = p + (vec3(fbm3(p * .45 + 3.), fbm3(p * .45 + 7.), fbm3(p * .45 + 11.)) - .5) * 1.6;",
          "  float nucleo = smoothstep(.42, .78, w), halo = smoothstep(.03, .3, w);",
          "  float dobra = pow(1. - abs(vn3(q * vec3(1.4, 2.6, 1.4)) * 2. - 1.), 3.);",
          "  float placa = smoothstep(.42, .55, fbm3(q * 1.1 + 5.)) * smoothstep(.05, .4, w) * (1. - nucleo * .55);",
          "  float fenda = smoothstep(.84, .96, 1. - abs(vn3(q * 2.2 + 2.) * 2. - 1.)) * placa;",
          "  float poco = smoothstep(.62, .78, vn3(q * 3.1 + 9.)) * nucleo;",
          "  vec3 inflam = lin(vec3(.6,.44,.41)), cru = lin(vec3(.55,.23,.25)), fundo = lin(vec3(.22,.06,.08));",
          "  vec3 wc = mix(inflam, cru, nucleo * (.7 + .3 * dobra));",
          "  wc *= 1. - .42 * dobra * halo;",                         /* sulcos escuros entre as dobras inchadas */
          "  wc = mix(wc, fundo, poco * .85);",
          "  vec3 crostaC = mix(lin(vec3(.76,.63,.36)), lin(vec3(.55,.42,.26)), vn3(q * 3.3 + 1.));",
          "  wc = mix(wc, crostaC * (.88 + .2 * vn3(q * 4.)), placa * .92);",
          "  wc = mix(wc, lin(vec3(.26,.17,.11)), fenda * .85);",
          "  float borda = smoothstep(0., .1, w) * (1. - smoothstep(.1, .26, w));",
          "  wc = mix(wc, lin(vec3(.36,.22,.2)), borda * .45);",
          "  wc = mix(wc, vec3(dot(wc, vec3(.3,.5,.2))) * vec3(1.05,.98,.95), uSuave * .55);",
          "  c = mix(c, wc, halo * vis);",
          "  gFerida = halo * vis; gRug = (-dobra * halo * .6 + placa * .45 - fenda * .4 - poco * .8) * vis; gCrosta = placa * vis;",
          /* prata em parte das feridas (vista pela lente) */
          "  float pw = prataM(p) * step(.48, vn3(p * .55 + 4.)) * halo * vis;",
          "  c = mix(c, lin(vec3(.7,.72,.75)), pw * .85); gMetal = pw * .6;",
          /* rifamicina: laranja onde foi tosado */
          "  float rf = clamp(uRif * 1.7 - fbm3(p * .7 + 2.) * .9, 0., 1.) * smoothstep(.05, .45, halo + sh * .25);",
          "  c = mix(c, lin(vec3(.9,.47,.1)) * (.78 + .32 * vn3(p * 5.)), rf * .92);",
          "  gBrilho = max(nucleo * .5, max(uAlcool * halo, rf * .6)) * vis;",
          "  gBrilho = max(gBrilho, sj * .45);",
          /* vasos da orelha (cena 9): veia marginal na borda, artéria central no meio */
          "  diffuseColor.rgb = c;",
          "}"
        ].join("\n"))
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .32, gBrilho);")
        .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = gMetal;")
        .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\nif (uLayer <= 0.) normal = relevo(normal, gRug, 1.0);");
  };
  m.customProgramCacheKey = function () { return "coelho"; };
  return m;
}

/* ruído igual ao do shader, para pôr larvas e ovos onde a ferida aparece */
function fract(x) { return x - Math.floor(x); }
function h13(x, y, z) {
  x = fract(x * .1031); y = fract(y * .1031); z = fract(z * .1031);
  var d = x * (z + 31.32) + y * (y + 31.32) + z * (x + 31.32); x += d; y += d; z += d;
  return fract((x + y) * z);
}
function vn3(x, y, z) {
  var ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  function L(a, b, k) { return a + (b - a) * k; }
  return L(L(L(h13(ix, iy, iz), h13(ix + 1, iy, iz), fx), L(h13(ix, iy + 1, iz), h13(ix + 1, iy + 1, iz), fx), fy),
    L(L(h13(ix, iy, iz + 1), h13(ix + 1, iy, iz + 1), fx), L(h13(ix, iy + 1, iz + 1), h13(ix + 1, iy + 1, iz + 1), fx), fy), fz);
}
function fbm3(x, y, z) { var s = 0, a = .5; for (var i = 0; i < 4; i++) { s += a * vn3(x, y, z); x *= 2.03; y *= 2.03; z *= 2.03; a *= .5; } return s; }
function elipJS(p, F) { var dx = (p.x - F.c[0]) / F.r[0], dy = (p.y - F.c[1]) / F.r[1], dz = (p.z - F.c[2]) / F.r[2]; return 1 - Math.sqrt(dx * dx + dy * dy + dz * dz); }
function campoFeridaJS(p) {
  var f = -9; FERIDAS.forEach(function (F) { f = Math.max(f, elipJS(p, F)); });
  return f + (fbm3(p.x * .9 + 1.7, p.y * .9 + 1.7, p.z * .9 + 1.7) - .5) * .75;
}

/* ============================================================ montagem */
var CO = { ok: false, ossos: {}, q0: {}, camadas: [] };
var raiz = new THREE.Group(); cena3d.add(raiz);          /* posição e giro do coelho inteiro */
var corpo = new THREE.Group(); raiz.add(corpo);           /* respiração e pequenos ajustes */

pendentes++;
new THREE.GLTFLoader().parse(dec(KC.glb).buffer, "", function (g) {
  montaCoelho(g); pendentes--;
}, function (e) { $("carregando").textContent = "Não foi possível abrir o modelo 3D."; console.error(e); });

function montaCoelho(g) {
  var sk = null;
  g.scene.traverse(function (o) {
    if (o.isBone) { var nome = o.name.replace(/_\d+$/, ""); CO.ossos[nome] = o; CO.q0[nome] = o.quaternion.clone(); }
    if (o.isSkinnedMesh) sk = o;
  });
  CO.sk = sk;
  var geo = sk.geometry, ossos = sk.skeleton.bones;
  /* regiões pelo peso dos ossos: orelha, cabeça, pata, cauda */
  var si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight, n = si.count, reg = new Float32Array(n * 4);
  var tipo = ossos.map(function (b) {
    var nm = b.name;
    return /^Ear/.test(nm) ? 0 : /^(Head|Nose|HeadEnd)/.test(nm) ? 1 : /(Toes|Ankle)/.test(nm) ? 2 : /^Tail/.test(nm) ? 3 : -1;
  });
  var GET = ["getX", "getY", "getZ", "getW"];
  for (var i = 0; i < n; i++) for (var j = 0; j < 4; j++) {
    var w = sw[GET[j]](i), tp = tipo[si[GET[j]](i)];
    if (tp >= 0) reg[i * 4 + tp] += w;
  }
  CO.pos = geo.attributes.position;
  /* bigodes e sobrancelhas: peças soltas pequenas (até 20 vértices) que viram palitos grossos sem a textura
     original; são recolhidas para o centro e somem */
  (function () {
    var ix = geo.index.array, par = new Int32Array(n), k, q;
    for (k = 0; k < n; k++) par[k] = k;
    function raizUF(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
    for (k = 0; k < ix.length; k += 3) { par[raizUF(ix[k])] = raizUF(ix[k + 1]); par[raizUF(ix[k + 1])] = raizUF(ix[k + 2]); }
    var grupos = {};
    for (k = 0; k < n; k++) { q = raizUF(k); (grupos[q] = grupos[q] || []).push(k); }
    var P = CO.pos;
    Object.keys(grupos).forEach(function (g) {
      var vs = grupos[g]; if (vs.length > 20) return;
      vs.forEach(function (v) { P.setXYZ(v, 0, 17.6, 7.2); reg[v * 4] = 1; reg[v * 4 + 1] = 1; });
    });
    P.needsUpdate = true;
  })();
  geo.setAttribute("aReg", new THREE.BufferAttribute(reg, 4));
  /* camada 0 (pele) e as camadas de pelo, todas no mesmo esqueleto */
  sk.material = matCoelho(0); sk.castShadow = true; sk.receiveShadow = true; sk.frustumCulled = false;
  for (var c = 1; c <= NCAM; c++) {
    var m = new THREE.SkinnedMesh(geo, matCoelho(c / NCAM));
    m.bind(sk.skeleton, sk.bindMatrix); m.frustumCulled = false; m.renderOrder = c;
    m.castShadow = c === Math.round(NCAM * .45);
    sk.parent.add(m); CO.camadas.push(m);
  }
  corpo.add(g.scene);
  /* olhos: esferas escuras e brilhantes presas ao osso da cabeça */
  var cab = CO.ossos.Head_M; g.scene.updateMatrixWorld(true);
  var matOlho = new THREE.MeshStandardMaterial({ color: 0x150d08, roughness: .1, metalness: 0, envMapIntensity: 1.2 });
  [OLHO_D, OLHO_E].forEach(function (P) {
    var o = new THREE.Mesh(new THREE.SphereGeometry(.56, 24, 16), matOlho);
    CO.olhos = CO.olhos || []; CO.olhos.push({ m: o, bind: P.clone() });
    cena3d.add(o);
  });
  preparaAncoras();
  CO.ok = true;
}

/* posição atual (já com a pose) de um vértice e de um ponto qualquer do espaço de ligação */
var _bt = new V3(), _cache = {}, _quadro = 0;
function verticeMundo(i, alvo) {
  var c = _cache[i];
  if (c && c.q === _quadro) return alvo.copy(c.v);
  _bt.fromBufferAttribute(CO.pos, i); CO.sk.boneTransform(i, _bt); _bt.applyMatrix4(CO.sk.matrixWorld);
  _cache[i] = { q: _quadro, v: _bt.clone() };
  return alvo.copy(_bt);
}
var _vb = new V3();
function maisProximo(P) {
  var best = 0, bd = 1e9;
  for (var i = 0; i < CO.pos.count; i++) { _vb.fromBufferAttribute(CO.pos, i); var d = _vb.distanceToSquared(P); if (d < bd) { bd = d; best = i; } }
  return best;
}
var _pm = new V3();
function pontoMundo(P, alvo) {
  if (!CO.ok) return alvo.set(0, 10, 0);
  if (P._v === undefined) P._v = maisProximo(P);
  _vb.fromBufferAttribute(CO.pos, P._v);
  verticeMundo(P._v, alvo);
  return alvo.add(_pm.copy(P).sub(_vb).multiplyScalar(.6));
}

/* ============================================================ larvas e ovos presos à pele */
var ANC = { larvas: [], ovos: [], grupos: [] };
/* centros dos grupos de ovos (espaço de ligação), no lado da garupa que a câmera vê (x > 0) */
var GRUPOS_OVOS = [[.6, 14.7, -7.9], [1.7, 14.1, -7.7], [1.0, 15.6, -7.0], [-.3, 13.7, -8.4], [2.0, 15.3, -6.9]].map(function (q) { return new V3(q[0], q[1], q[2]); });
function preparaAncoras() {
  var idx = CO.sk.geometry.index.array, P = CO.pos, a = new V3(), b = new V3(), c = new V3(), m = new V3();
  var cand = [];
  for (var t = 0; t < idx.length; t += 3) {
    a.fromBufferAttribute(P, idx[t]); b.fromBufferAttribute(P, idx[t + 1]); c.fromBufferAttribute(P, idx[t + 2]);
    m.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    var f = campoFeridaJS(m);
    if (f > .12) cand.push({ t: t, f: f, m: m.clone() });
  }
  semente = 31;
  cand.sort(function (x, y) { return y.f - x.f; });
  /* até 3 larvas por triângulo, mais nos triângulos de ferida mais funda */
  cand.forEach(function (C) {
    var k = C.f > .45 ? 3 : C.f > .3 ? 2 : 1;
    for (var q = 0; q < k && ANC.larvas.length < 220; q++) {
      var u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      ANC.larvas.push({ i: [idx[C.t], idx[C.t + 1], idx[C.t + 2]], b: [1 - u - v, u, v], f: C.f, fase: rnd() * TAU, incl: rnd(), gira: rnd() * TAU, tam: .75 + rnd() * .5, m: C.m, ordem: rnd() });
    }
  });
  /* as larvas "mais acima" (as mais altas no corpo, no dorso) ficam para a cena 8, tiradas com o dedo de luva */
  ANC.larvas.slice().sort(function (x, y) { return y.m.y - x.m.y; }).forEach(function (L, j, todas) { L.alto = j < todas.length * .18; });
  /* ovos (cena 2): 5 grupos de 14 na garupa, onde a ferida da garupa vai abrir; cada grupo fica em volta do
     vértice mais próximo do centro pedido. ANC.grupos guarda o centro de cada grupo (para a mosca e o rótulo). */
  ANC.grupos = [];
  GRUPOS_OVOS.forEach(function (C, g) {
    var c0 = new V3().fromBufferAttribute(P, maisProximo(C)), tris = [], melhor = -1, md = 1e9;
    for (var t = 0; t < idx.length; t += 3) {
      a.fromBufferAttribute(P, idx[t]); b.fromBufferAttribute(P, idx[t + 1]); c.fromBufferAttribute(P, idx[t + 2]);
      m.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      var d = m.distanceTo(c0);
      if (d < 1.2) tris.push(t);
      if (d < md) { md = d; melhor = t; }
    }
    ANC.grupos.push({ i: [idx[melhor], idx[melhor + 1], idx[melhor + 2]], b: [1 / 3, 1 / 3, 1 / 3] });
    var n = 0, tent = 0, q3 = new V3();
    while (n < 14 && tent++ < 600) {
      var t2 = tris[Math.floor(rnd() * tris.length)], u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      a.fromBufferAttribute(P, idx[t2]); b.fromBufferAttribute(P, idx[t2 + 1]); c.fromBufferAttribute(P, idx[t2 + 2]);
      q3.set(0, 0, 0).addScaledVector(a, 1 - u - v).addScaledVector(b, u).addScaledVector(c, v);
      if (q3.distanceTo(c0) > .45) continue;
      ANC.ovos.push({ i: [idx[t2], idx[t2 + 1], idx[t2 + 2]], b: [1 - u - v, u, v], grupo: g, k: n, gira: (rnd() - .5) * .5, incl: .3 + rnd() * .25 });
      n++;
    }
  });
  criaLarvas(); criaOvos();
}
var _a = new V3(), _b = new V3(), _c = new V3(), _n = new V3(), _q = new THREE.Quaternion(), _m4 = new THREE.Matrix4(), _s = new V3(), _y = new V3(0, 1, 0);
/* posição e normal atuais de uma âncora */
function ancora(A, pos, nor) {
  verticeMundo(A.i[0], _a); verticeMundo(A.i[1], _b); verticeMundo(A.i[2], _c);
  pos.set(0, 0, 0).addScaledVector(_a, A.b[0]).addScaledVector(_b, A.b[1]).addScaledVector(_c, A.b[2]);
  nor.copy(_b).sub(_a).cross(_c.sub(_a)).normalize();
  return pos;
}

var GEO_LARVA = (function () {
  /* corpo em fuso com ~11 segmentos; ponta da frente (y=1) fina, a de trás (y=0) larga e cortada */
  var pr = [], N = 60;
  for (var i = 0; i <= N; i++) {
    var y = i / N, base = Math.sin(Math.pow(y, .85) * PI) * .9 + .1;
    base = y < .08 ? lerp(.55, .92, y / .08) : base;
    var anel = 1 - .09 * Math.pow(Math.abs(Math.sin(y * 11 * PI)), 3);
    pr.push(new THREE.Vector2(Math.max(.002, .2 * base * anel * (y > .97 ? (1 - y) / .03 * .6 + .2 : 1)), y));
  }
  pr.unshift(new THREE.Vector2(0.001, 0));
  var g = new THREE.LatheGeometry(pr, 14); g.computeVertexNormals(); return g;
})();
var matLarva = new THREE.MeshStandardMaterial({ color: 0xe3d7bd, roughness: .5, metalness: 0, envMapIntensity: .8, clippingPlanes: [CHAO] });
var UL = { uAgita: { value: 0 } };
matLarva.onBeforeCompile = function (sh) {
  sh.uniforms.uTempo = U.uTempo; sh.uniforms.uSuave = U.uSuave; sh.uniforms.uAgita = UL.uAgita;
  sh.vertexShader = "attribute vec4 aEst;\nuniform float uTempo, uSuave, uAgita;\nvarying float vY;\nvarying vec2 vXZ;\n" + sh.vertexShader.replace("#include <begin_vertex>", [
    "#include <begin_vertex>",
    "vY = position.y; vXZ = position.xz;",
    "float fr = 2.2 + uAgita * 4.5;",
    "float livre = 1. - smoothstep(0., .62, position.y);",                     /* a ponta de trás, fora da pele, é a que mexe */
    "float onda = sin(position.y * 7. - uTempo * fr * 6.283 + aEst.x) * (.07 + uAgita * .12) * livre;",
    "transformed.x += onda; transformed.z += cos(position.y * 5. - uTempo * fr * 4. + aEst.x) * (.05 + uAgita * .08) * livre;",
    "transformed.xz *= 1. + .12 * sin(position.y * 22. - uTempo * fr * 9. + aEst.x);",
    "transformed.y += sin(uTempo * fr * 3.1 + aEst.x) * (.035 + uAgita * .05);",  /* entra e sai um pouco da ferida */
    "if (uSuave > .5) { transformed = normalize(position - vec3(0.,.5,0.)) * .16 + vec3(0.,.3,0.); }"
  ].join("\n"));
  sh.fragmentShader = "varying float vY;\nvarying vec2 vXZ;\nuniform float uSuave;\n" + sh.fragmentShader.replace("#include <map_fragment>", [
    "#include <map_fragment>",
    "float sulco = pow(abs(sin(vY * 11. * 3.14159)), 6.);",
    "diffuseColor.rgb *= 1. - .22 * (1. - sulco);",
    /* placa de trás (fora da pele): creme-amarelada, com os dois espiráculos escuros */
    "if (vY < .045 && uSuave < .5) {",
    "  float e = min(length(vXZ - vec2(.05, 0.)), length(vXZ + vec2(.05, 0.)));",
    "  diffuseColor.rgb = mix(vec3(.2,.12,.07), vec3(.84,.74,.56), smoothstep(.026, .038, e));",
    "}",
    "if (vY > .96 && uSuave < .5) diffuseColor.rgb = vec3(.15,.1,.07);",      /* ganchos bucais */
    "if (uSuave > .5) diffuseColor.rgb = vec3(.95,.93,.88);"
  ].join("\n"));
};
var larvas, ovos;
function criaLarvas() {
  var n = ANC.larvas.length, g = GEO_LARVA.clone(), est = new Float32Array(n * 4);
  ANC.larvas.forEach(function (L, i) { est[i * 4] = L.fase; });
  g.setAttribute("aEst", new THREE.InstancedBufferAttribute(est, 4));
  larvas = new THREE.InstancedMesh(g, matLarva, n); larvas.frustumCulled = false; larvas.castShadow = false;
  larvas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cena3d.add(larvas);
}
function criaOvos() {
  var g = new THREE.SphereGeometry(.06, 10, 8); g.scale(1, 3.3, 1); g.translate(0, .2, 0);
  ovos = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: .45, clippingPlanes: [CHAO] }), ANC.ovos.length);
  ovos.frustumCulled = false; ovos.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cena3d.add(ovos);
}

/* ============================================================ poses */
var _qd = new THREE.Quaternion(), _eixo = new V3();
function gira(nome, x, y, z) {   /* rotação extra (radianos, eixos do próprio osso) sobre a pose de repouso */
  var o = CO.ossos[nome]; if (!o) return;
  o.quaternion.copy(CO.q0[nome]);
  if (x) o.quaternion.multiply(_qd.setFromAxisAngle(_eixo.set(1, 0, 0), x));
  if (y) o.quaternion.multiply(_qd.setFromAxisAngle(_eixo.set(0, 1, 0), y));
  if (z) o.quaternion.multiply(_qd.setFromAxisAngle(_eixo.set(0, 0, 1), z));
}
function repouso() { for (var k in CO.ossos) CO.ossos[k].quaternion.copy(CO.q0[k]); }

/* ============================================================ bigodes: 4 fios de cada lado do focinho, presos à pele */
var BIGODES = (function () {
  var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(8 * 2 * 3), 3));
  var l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xf2efe8, transparent: true, opacity: .7 }));
  l.frustumCulled = false; cena3d.add(l); return l;
})();
var BASE_BIG = [new V3(-.8, 16.5, 11.7), new V3(.8, 16.5, 11.7)], _bb = new V3(), _bd = new V3();
function bigodes() {
  if (!CO.ok) return;
  var arr = BIGODES.geometry.attributes.position.array, k = 0;
  BASE_BIG.forEach(function (B, lado) {
    var s = lado ? 1 : -1;
    pontoMundo(B, _bb);
    for (var j = 0; j < 4; j++) {
      _bd.set(s, -.12 + j * .1, .3 - j * .05).normalize().multiplyScalar(5 - j * .5).transformDirection(CO.sk.matrixWorld).multiplyScalar(5 - j * .5);
      arr[k++] = _bb.x; arr[k++] = _bb.y + (j - 1.5) * .12; arr[k++] = _bb.z;
      arr[k++] = _bb.x + _bd.x; arr[k++] = _bb.y + _bd.y; arr[k++] = _bb.z + _bd.z;
    }
  });
  BIGODES.geometry.attributes.position.needsUpdate = true;
}
