"use strict";
/* Nodulectomia em cão: animação 3D em 11 cenas.
   Três ambientes na mesma página: a sala (mesa, cadela, panos), o campo operatório em camadas
   e a mesa de instrumentais. Tudo é função do tempo global t, então dá para pular para qualquer
   cena (ou exportar quadro a quadro) e o estado sai sempre igual. */

/* ============================================================ utilidades */
function dec(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function lerp(a, b, k) { return a + (b - a) * k; }
function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
function suave(k) { return k * k * (3 - 2 * k); }
function eio(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }   /* ease in-out cúbico */
function sai(k) { return 1 - Math.pow(1 - k, 3); }                                    /* ease out */
function ss(a, b, x) { return suave(seg(x, a, b)); }
var PI = Math.PI, TAU = PI * 2;
var $ = function (id) { return document.getElementById(id); };

/* ============================================================ roteiro */
var CENAS = [
  { nome: "Abertura", dur: 8, leg: "Nodulectomia em cão" },
  { nome: "Preparo", dur: 14, leg: "Anestesia geral, tricotomia, antissepsia e campos" },
  { nome: "Marcação", dur: 8, leg: "Incisão elíptica com margem de segurança" },
  { nome: "Incisão", dur: 9, leg: "Incisão de pele e subcutâneo" },
  { nome: "Dissecção", dur: 10, leg: "Dissecção pelo tecido sadio, sem cortar o nódulo" },
  { nome: "Vasos", dur: 9, leg: "Pinçamento e ligadura dos vasos" },
  { nome: "Retirada", dur: 9, leg: "Exérese em bloco, com a pele ao redor da úlcera" },
  { nome: "Hemostasia", dur: 8, leg: "Hemostasia por compressão e conferência do leito" },
  { nome: "Sutura", dur: 16, leg: "Redução do espaço morto e síntese da pele" },
  { nome: "Histopatológico", dur: 8, leg: "Peça em formol 10% para exame histopatológico" },
  { nome: "Pós-operatório", dur: 12, leg: "Recuperação: analgesia, curativo e retorno com o laudo" }
];
var NC = CENAS.length, S = [], TOTAL = 0;
CENAS.forEach(function (c) { S.push(TOTAL); TOTAL += c.dur; });
function cenaDe(t) { for (var k = NC - 1; k > 0; k--) if (t >= S[k]) return k; return 0; }

/* ============================================================ renderizador */
var palco = $("palco");
var ren = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: /[?&]captura/.test(location.search) });
ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
ren.outputEncoding = THREE.sRGBEncoding;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.12;
ren.shadowMap.enabled = true;
ren.shadowMap.type = THREE.PCFSoftShadowMap;
ren.localClippingEnabled = true;
ren.setClearColor(0x000000, 0);
palco.insertBefore(ren.domElement, palco.firstChild);
var cam = new THREE.PerspectiveCamera(30, 16 / 9, 0.005, 30);
var V3 = THREE.Vector3;

/* ambiente para reflexos (aço, pelo, pele úmida): uma sala clara com janelas difusas */
function ambiente(tons) {
  var pm = new THREE.PMREMGenerator(ren), es = new THREE.Scene(), g = new THREE.SphereGeometry(5, 32, 16), cols = [], p = g.attributes.position;
  for (var i = 0; i < p.count; i++) { var yy = p.getY(i) / 5, v = tons[0] + tons[1] * Math.max(0, yy); cols.push(v, v * .985, v * .96); }
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  [[2.5, 3.5, 2], [-3, 2.5, 2.5], [0, 4.5, -1.5], [-3.5, 1.5, -2.5]].forEach(function (q) {
    var p2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    p2.position.set(q[0], q[1], q[2]); p2.lookAt(0, 0, 0); es.add(p2);
  });
  var t = pm.fromScene(es, 0.04).texture; pm.dispose(); return t;
}
var ENV = ambiente([.32, .55]);

function luzes(sc, alvo, raio) {
  var hemi = new THREE.HemisphereLight(0xf7f9fb, 0x7b7266, .55); sc.add(hemi);
  var sol = new THREE.DirectionalLight(0xfff3e4, 1.35);
  sol.position.set(alvo.x - 0.9, alvo.y + 2.4, alvo.z + 1.3); sol.target.position.copy(alvo);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
  var sc2 = sol.shadow.camera; sc2.left = -raio; sc2.right = raio; sc2.top = raio; sc2.bottom = -raio; sc2.near = .2; sc2.far = 6;
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.012; sol.shadow.radius = 3;
  sc.add(sol, sol.target);
  var cheio = new THREE.DirectionalLight(0xcfe3ff, .38); cheio.position.set(alvo.x + 2, alvo.y + 1, alvo.z - 1); sc.add(cheio);
  var borda = new THREE.DirectionalLight(0xffffff, .55); borda.position.set(alvo.x + .3, alvo.y + 1.2, alvo.z - 2.5); sc.add(borda);
  sc.environment = ENV;
  return { hemi: hemi, sol: sol };
}

/* ============================================================ materiais e peças reutilizáveis */
function M(c, o) { o = o || {}; o.color = c; return new THREE.MeshStandardMaterial(o); }
var ACO = M(0xdfe4ea, { metalness: 1, roughness: .2, envMapIntensity: 1.25 });       /* aço polido */
var ACO2 = M(0xc5ccd4, { metalness: 1, roughness: .38, envMapIntensity: 1.1 });      /* aço escovado */
var ACO3 = M(0x6c7580, { metalness: 1, roughness: .45, envMapIntensity: .9 });       /* frestas */
function texCanvas(w, h, desenha, rep) {
  var c = document.createElement("canvas"); c.width = w; c.height = h; desenha(c.getContext("2d"), w, h);
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
var semente = 11;
function rnd() { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }

/* GLSL comum: ruído e hash */
var GLSL_RUIDO = [
  "float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
  "float vr(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1.,0.)),f.x),mix(h12(i+vec2(0.,1.)),h12(i+vec2(1.,1.)),f.x),f.y);}",
  "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vr(p);p*=2.03;a*=.5;}return s;}",
  "vec2 h22(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}",
  /* distância ao centro da célula de Voronoi mais próxima (lóbulos de gordura) e à borda entre células */
  "vec2 voro(vec2 p){vec2 n=floor(p),f=fract(p);float d1=8.,d2=8.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=h22(n+g);vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2){d2=d;}}return vec2(sqrt(d1),sqrt(d2)-sqrt(d1));}",
  "vec3 lin(vec3 c){return pow(c,vec3(2.2));}"
].join("\n");

/* ============================================================ nódulo ulcerado
   No dia da cirurgia o nódulo já tinha rompido a pele: metade da massa fica para fora, aberta (ulcerada)
   e infeccionada, e a base entra no subcutâneo. É a mesma peça na cadela, no campo e na bandeja.
   Referencial (v, n, u) do sítio: x = largura do fuso, y = para fora da pele, z = eixo maior. Medidas em m. */
var NOD = { ru: .022, rv: .018, rn: .015, sobe: .004 };   /* sobe: altura do centro da massa acima da pele */
var GEO_NOD = (function () {
  var g = new THREE.SphereGeometry(1, 72, 48), p = g.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    var k = 1 + .06 * Math.sin(x * 6 + y * 4) * Math.sin(z * 5 - y * 3) + .035 * Math.sin(x * 13 + z * 11 + y * 5) + .02 * Math.sin(x * 23 - z * 19);
    if (y > 0) k += .045 * y * Math.sin(x * 17 + 1) * Math.sin(z * 15);   /* superfície de cima mais irregular */
    p.setXYZ(i, x * NOD.rv * k, y * NOD.rn * k, z * NOD.ru * k);
  }
  g.computeVertexNormals(); return g;
})();
function matNodulo(planos) {
  var m = new THREE.MeshStandardMaterial({ roughness: .4, metalness: 0, envMapIntensity: .55 });
  if (planos) m.clippingPlanes = planos;
  m.onBeforeCompile = function (sh) {
    sh.vertexShader = "varying vec3 vNo;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvNo = position;");
    sh.fragmentShader = GLSL_RUIDO + "\nvarying vec3 vNo;\n" + sh.fragmentShader
      .replace("#include <map_fragment>", [
        "#include <map_fragment>",
        "float yy = vNo.y / " + NOD.rn.toFixed(4) + ";",
        "vec2 vo = voro(vNo.xz * 380. + vNo.y * 200.);",
        "vec3 c = lin(vec3(.46,.15,.3)) * (.82 + .26 * (1. - vo.x));",
        "c = mix(lin(vec3(.3,.08,.19)), c, smoothstep(.02, .09, vo.y));",
        /* parte exposta (úlcera infeccionada): crostas castanhas e exsudato creme, discretos e sem sangue */
        "float crosta = smoothstep(.6, .74, fbm(vNo.xz * 240. + 3.)) * smoothstep(.15, .55, yy);",
        "c = mix(c, lin(vec3(.55,.42,.27)) * (.85 + .3 * vr(vNo.xz * 2000.)), crosta * .8);",
        "float fibrina = smoothstep(.72, .86, fbm(vNo.xz * 480. + 9.)) * smoothstep(.35, .75, yy);",
        "c = mix(c, lin(vec3(.86,.8,.62)), fibrina * .45);",
        "diffuseColor.rgb = c;"].join("\n"))
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(.3, .72, crosta);");
  };
  return m;
}

/* ============================================================ dados do cão */
var CM = KC.meta, CB = dec(KC.bin).buffer;
function vista(T, off, n) { return new T(CB, off, n); }
var NV = CM.nv;
var geoCao = (function () {
  var q = vista(Uint16Array, CM.pos, NV * 3), pos = new Float32Array(NV * 3);
  for (var i = 0; i < NV; i++) for (var k = 0; k < 3; k++) pos[i * 3 + k] = CM.pmin[k] + q[i * 3 + k] / 65535 * (CM.pmax[k] - CM.pmin[k]);
  var n8 = vista(Int8Array, CM.nrm, NV * 3), nrm = new Float32Array(NV * 3);
  for (i = 0; i < NV * 3; i++) nrm[i] = n8[i] / 127;
  var d16 = vista(Int16Array, CM.dpos_dei, NV * 3), dp = new Float32Array(NV * 3);
  for (i = 0; i < NV * 3; i++) dp[i] = d16[i] * CM.esc_dei;
  var dn8 = vista(Int8Array, CM.dnrm_dei, NV * 3), dn = new Float32Array(NV * 3);
  for (i = 0; i < NV * 3; i++) dn[i] = dn8[i] / 63;
  var uq = vista(Uint16Array, CM.uv, NV * 2), uv = new Float32Array(NV * 2);
  for (i = 0; i < NV * 2; i++) uv[i] = uq[i] / 65535;
  var nn = CM.nod_n_count, ni = vista(Uint16Array, CM.nod_i, nn), np = vista(Float32Array, CM.nod_p, nn * 3), nnr = vista(Float32Array, CM.nod_n, nn * 3);
  var mp = new Float32Array(NV * 3), mn = new Float32Array(NV * 3);
  for (i = 0; i < nn; i++) for (k = 0; k < 3; k++) { mp[ni[i] * 3 + k] = np[i * 3 + k]; mn[ni[i] * 3 + k] = nnr[i * 3 + k]; }
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("aux", new THREE.BufferAttribute(vista(Uint8Array, CM.aux, NV * 4), 4, true));
  g.setIndex(new THREE.BufferAttribute(vista(Uint16Array, CM.idx, CM.ni), 1));
  g.morphAttributes.position = [new THREE.BufferAttribute(dp, 3), new THREE.BufferAttribute(mp, 3)];
  g.morphAttributes.normal = [new THREE.BufferAttribute(dn, 3), new THREE.BufferAttribute(mn, 3)];
  g.morphTargetsRelative = true;
  g.computeBoundingSphere(); g.boundingSphere.radius *= 1.4;
  return g;
})();
function vec(a) { return new V3(a[0], a[1], a[2]); }
var SIT = { c: vec(CM.sitio.c), n: vec(CM.sitio.n), u: vec(CM.sitio.u), v: vec(CM.sitio.v) };

function carregaTex(src, srgb) {
  var t = new THREE.Texture(); t.flipY = false; if (srgb) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = Math.min(8, ren.capabilities.getMaxAnisotropy());
  var im = new Image(); im.onload = function () { t.image = im; t.needsUpdate = true; pendentes--; }; im.src = src; pendentes++;
  return t;
}
var pendentes = 0;
var texCao = carregaTex(KC.cor, true), texRug = carregaTex(KC.rug, false);

/* material da cadela: textura recolorida + tricotomia, antissepsia, ferida suturada e pálpebras feitas no shader,
   no referencial (u, v, n) do sítio do nódulo */
var UC = {
  uC: { value: SIT.c }, uN: { value: SIT.n }, uU: { value: SIT.u }, uV: { value: SIT.v },
  uTrico: { value: 0 }, uAntis: { value: 0 }, uFerida: { value: 0 }, uAnel: { value: 0 }, uMassa: { value: 0 },
  uOlhoE: { value: new V3() }, uOlhoD: { value: new V3() }, uPalp: { value: 0 },
  uResp: { value: 0 }, uCauda: { value: 0 }, uCaudaPiv: { value: new V3(0, .33, -.245) }
};
var matCao = new THREE.MeshStandardMaterial({ map: texCao, roughnessMap: texRug, roughness: 1, metalness: 0, envMapIntensity: .75, morphTargets: true, morphNormals: true });
matCao.onBeforeCompile = function (sh) {
  Object.assign(sh.uniforms, UC);
  sh.vertexShader = "attribute vec4 aux;\nuniform float uResp,uCauda;\nuniform vec3 uCaudaPiv;\nvarying vec3 vObj;\nvarying float vTronco;\n" + sh.vertexShader.replace(
    "#include <morphtarget_vertex>",
    ["#include <morphtarget_vertex>",
      "transformed += objectNormal * aux.x * uResp;",
      "if (aux.y > 0.) { vec3 dq = transformed - uCaudaPiv; float aa = uCauda * aux.y; float ca = cos(aa), sa = sin(aa); transformed = uCaudaPiv + vec3(dq.x, dq.y * ca - dq.z * sa, dq.y * sa + dq.z * ca); }",
      "vObj = transformed; vTronco = aux.z;"].join("\n"));
  sh.fragmentShader = ["uniform vec3 uC,uN,uU,uV,uOlhoE,uOlhoD;", "uniform float uTrico,uAntis,uFerida,uAnel,uPalp,uMassa;", "varying vec3 vObj;", "varying float vTronco;", GLSL_RUIDO,
    "float dseg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}"].join("\n") + "\n" + sh.fragmentShader
    .replace("#include <map_fragment>", ["#include <map_fragment>",
      "vec3 dq = vObj - uC; float su = dot(dq, uU), sv = dot(dq, uV), sn = dot(dq, uN);",
      "float lado = smoothstep(-.075, -.05, sn) * smoothstep(.3, .8, vTronco);",
      /* tricotomia: elipse ampla em volta do nódulo, borda irregular de máquina */
      "float re = length(vec2(su / .108, sv / .078));",
      "float bor = (vr(vec2(su, sv) * 110.) - .5) * .07 + (vr(vec2(su, sv) * 420.) - .5) * .03;",
      /* a máquina passa em faixas paralelas ao eixo u, contra o pelo; uTrico vai de 0 a 1 ao longo das 8 faixas */
      "float sf = uTrico * 8.; float jf = floor((sv + .084) / .024 + .5);",
      "float feita = step(jf + 1., sf); float atual = step(jf, sf) * (1. - feita);",
      "float ucur = .118 - .236 * fract(sf);",
      "float faixa = max(feita, atual * smoothstep(ucur - .002, ucur + .002, su)) * step(-.5, jf) * step(jf, 7.5);",
      "float rasp = faixa * (1. - smoothstep(.97, 1.03, re + bor)) * lado * step(.001, uTrico);",
      "vec3 pele = lin(vec3(.53, .43, .41)) * (.84 + .3 * vr(vec2(su, sv) * 160.)) * (.92 + .16 * vr(vec2(su, sv) * 31.));",
      "float toco = smoothstep(.62, .9, h12(floor(vec2(su, sv) * 1700.)));",
      "pele = mix(pele, lin(vec3(.16, .14, .16)), toco * .7);",
      "diffuseColor.rgb = mix(diffuseColor.rgb, pele, rasp);",
      /* antissepsia em espiral, do centro para fora */
      /* lesão infeccionada: a antissepsia vai da periferia para a lesão; rs = raio onde a gaze está agora */
      "float th = atan(sv / .078, su / .108); float voltas = 5.; float rs = .98 - uAntis * .68;",
      "float atras = 1. - fract((uAntis * voltas * 6.2832 - th) / 6.2832);",
      "float pint = smoothstep(rs + atras * (.68 / voltas) - .01, rs + atras * (.68 / voltas) + .02, re) * (1. - smoothstep(.98, 1.01, re)) * step(.001, uAntis) * rasp;",
      "pint = max(pint, step(.999, uAntis) * (1. - smoothstep(.98, 1.01, re)) * smoothstep(.27, .3, re) * rasp);",
      "diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * lin(vec3(.95, .66, .42)), pint * .85);",
      /* ferida suturada (pós-operatório): linha da incisão com pontos contínuos de náilon */
      "float LL = .085; float ao = smoothstep(LL + .004, LL - .004, abs(su));",
      "float lin_inc = (1. - smoothstep(.0007, .0016, abs(sv))) * ao;",
      "float passo = .0075; float kk = floor(su / passo + .5); vec2 pq = vec2(su - kk * passo, sv);",
      "float fio = (1. - smoothstep(.0006, .0012, dseg(pq, vec2(-.0027, -.0045), vec2(.0027, .0045)))) * smoothstep(LL + .001, LL - .005, abs(su));",
      "float eri = exp(-sv * sv / (.007 * .007)) * ao;",
      "float fer = uFerida * rasp;",
      "diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * lin(vec3(1., .62, .6)), eri * .55 * fer);",
      "diffuseColor.rgb = mix(diffuseColor.rgb, lin(vec3(.32, .07, .07)), lin_inc * fer);",
      "diffuseColor.rgb = mix(diffuseColor.rgb, lin(vec3(.13, .22, .6)), fio * fer);",
      /* em volta da massa ulcerada: pele inflamada, sem pelo (some depois da cirurgia) */
      "float rmm = length(vec2(su / " + NOD.ru.toFixed(3) + ", sv / " + NOD.rv.toFixed(3) + "));",
      "float infl = (1. - smoothstep(1.05, 1.75, rmm + (vr(vec2(su, sv) * 300.) - .5) * .25)) * lado * (1. - uFerida);",
      "diffuseColor.rgb = mix(diffuseColor.rgb, lin(vec3(.58,.33,.33)) * (.85 + .3 * vr(vec2(su, sv) * 400.)), infl * .7 * uMassa);",
      /* pálpebras: escurece o olho como se estivesse fechado */
      "float pal = max(1. - smoothstep(.007, .0115, distance(vObj, uOlhoE)), 1. - smoothstep(.007, .0115, distance(vObj, uOlhoD)));",
      "diffuseColor.rgb = mix(diffuseColor.rgb, lin(vec3(.11, .1, .115)), pal * uPalp);"
    ].join("\n"))
    .replace("#include <roughnessmap_fragment>", ["#include <roughnessmap_fragment>",
      "roughnessFactor = mix(roughnessFactor, .55, rasp);",
      "roughnessFactor = mix(roughnessFactor, .42, pint);",
      "roughnessFactor = mix(roughnessFactor, .75, pal * uPalp);"].join("\n"))
    .replace("#include <emissivemap_fragment>", ["#include <emissivemap_fragment>",
      /* anel que destaca o volume do nódulo na abertura */
      "float rn2 = length(vec2(su / .038, sv / .033));",
      "float anel = exp(-pow((rn2 - 1.) / .09, 2.)) * lado;",
      "totalEmissiveRadiance += vec3(1., .62, .16) * anel * uAnel * 1.6;"].join("\n"));
};

/* ============================================================ sala: mesa, toalha, cadela */
var sala = new THREE.Scene();
var luzSala = luzes(sala, new V3(0, .1, 0), .75);

/* mesa de inox */
(function () {
  var tampo = new THREE.Mesh(new THREE.BoxGeometry(1.5, .035, .86), M(0xc9ced3, { metalness: .85, roughness: .32, envMapIntensity: 1 }));
  tampo.position.set(0, -.0225, 0); tampo.receiveShadow = true; sala.add(tampo);
  var aba = new THREE.Mesh(new THREE.BoxGeometry(1.52, .05, .012), ACO2); aba.position.set(0, -.03, .436); sala.add(aba);
  var aba2 = aba.clone(); aba2.position.z = -.436; sala.add(aba2);
})();

/* toalha creme com bolinhas, como nas fotos */
var texToalha = texCanvas(1024, 1024, function (g, w, h) {
  g.fillStyle = "#ece4d0"; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 9000; i++) { g.fillStyle = "rgba(" + (190 + rnd() * 50 | 0) + "," + (180 + rnd() * 50 | 0) + "," + (150 + rnd() * 50 | 0) + ",.18)"; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
  for (i = 0; i < 70; i++) {
    var x = rnd() * w, y = rnd() * h, r = 7 + rnd() * 9, cor = rnd() < .45 ? "rgba(176,150,74,.55)" : "rgba(170,178,92,.5)";
    g.fillStyle = cor; g.beginPath(); g.ellipse(x, y, r, r * .85, rnd() * 3, 0, TAU); g.fill();
  }
});
var toalha = (function () {
  var geo = new THREE.PlaneGeometry(1.18, .74, 90, 60); geo.rotateX(-PI / 2);
  var p = geo.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), z = p.getZ(i);
    var dobra = .0025 * Math.sin(x * 23 + z * 7) * Math.sin(z * 17 - x * 3) + .001 * Math.sin(x * 61 + z * 41);
    var borda = Math.max(0, Math.abs(z) - .32) * .06;
    p.setY(i, .002 + dobra * .6 + borda);
  }
  geo.computeVertexNormals();
  var m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: texToalha }));   /* tecido: sem brilho especular */
  m.receiveShadow = true; m.position.set(.03, -.006, .02); m.rotation.y = .03; sala.add(m); return m;
})();

/* a cadela: grupo que rola para o decúbito lateral; dentro dele a malha gira para a cabeça ficar em −x */
var rolo = new THREE.Group(); sala.add(rolo);
var cao = new THREE.Mesh(geoCao, matCao); cao.rotation.y = -PI / 2; cao.castShadow = true; cao.receiveShadow = true; rolo.add(cao);
cao.frustumCulled = false;
function localParaMundo(p) { return cao.localToWorld(p.clone()); }

/* língua para fora (anestesiada), tubo endotraqueal e oxímetro: presos à cabeça no referencial do cão deitado */
var anest = new THREE.Group(); cao.add(anest);
(function () {
  var L = vec(CM.lingua_dei), B = vec(CM.boca_dei);
  /* língua: lâmina rosada que sai pela frente da boca e cai para o lado da mesa (−x local) */
  var lg = new THREE.SphereGeometry(1, 24, 14); lg.scale(.017, .0045, .034);
  var lp = lg.attributes.position;
  for (var i = 0; i < lp.count; i++) { var zz = lp.getZ(i); lp.setX(i, lp.getX(i) - Math.max(0, zz) * zz * 9); lp.setY(i, lp.getY(i) - Math.max(0, zz) * .25); }
  lg.computeVertexNormals();
  var lingua = new THREE.Mesh(lg, M(0xd9707e, { roughness: .32, metalness: 0, envMapIntensity: .9 }));
  lingua.position.set(L.x - .006, L.y - .006, L.z + .006); lingua.rotation.set(.35, 0, -.25); lingua.castShadow = true;
  anest.add(lingua); anest.lingua = lingua;
  /* tubo endotraqueal: entra pela boca e sai em direção ao aparelho de anestesia */
  var cur = new THREE.CatmullRomCurve3([new V3(B.x, B.y - .004, B.z - .05), new V3(B.x, B.y - .002, B.z), new V3(B.x - .006, B.y - .01, B.z + .05),
    new V3(B.x - .02, B.y - .04, B.z + .1), new V3(B.x - .03, B.y - .12, B.z + .14), new V3(B.x - .03, B.y - .3, B.z + .16)]);
  var tubo = new THREE.Mesh(new THREE.TubeGeometry(cur, 80, .0055, 12), new THREE.MeshPhysicalMaterial({ color: 0xeaf2f6, roughness: .12, metalness: 0, transparent: true, opacity: .62, clearcoat: 1, envMapIntensity: 1.2 }));
  tubo.castShadow = true; anest.add(tubo);
  var con = new THREE.Mesh(new THREE.CylinderGeometry(.0075, .0075, .022, 16), M(0xf4f6f7, { roughness: .4 }));
  var p0 = cur.getPointAt(.38), tg = cur.getTangentAt(.38); con.position.copy(p0); con.quaternion.setFromUnitVectors(new V3(0, 1, 0), tg); anest.add(con);
  /* oxímetro: prendedor branco na língua, com cabo azul */
  var ox = new THREE.Group(), corpo = new THREE.Mesh(new THREE.BoxGeometry(.012, .007, .026), M(0xf2f3f0, { roughness: .45 }));
  ox.add(corpo); var corpo2 = corpo.clone(); corpo2.position.y = -.0105; ox.add(corpo2);
  var cabo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0, -.005, .012), new V3(0, -.004, .04), new V3(-.01, -.02, .08), new V3(-.02, -.08, .12), new V3(-.02, -.25, .15)]), 50, .0022, 8), M(0x2f6fd0, { roughness: .4 }));
  ox.add(cabo);
  ox.position.set(lingua.position.x - .012, lingua.position.y - .004, lingua.position.z + .026); ox.rotation.set(.3, 0, -.2);
  ox.traverse(function (o) { o.castShadow = true; }); anest.add(ox);
  /* guardados para a extubação na cena 11 (o tubo sai deslizando pela boca) */
  anest.tubo = tubo; anest.con = con; anest.ox = ox; anest.boca = B.clone();
  anest.con0 = con.position.clone(); anest.ox0 = ox.position.clone(); anest.lingua0 = lingua.position.clone();
})();

var massaCao = new THREE.Mesh(GEO_NOD, matNodulo());
massaCao.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(SIT.v, SIT.n, SIT.u));
massaCao.position.copy(SIT.c).addScaledVector(SIT.n, NOD.sobe); massaCao.castShadow = true; cao.add(massaCao);

/* ============================================================ estado no tempo (sala) */
var _puxa = new V3();
var OLHO = { e: vec(CM.olho_e), d: vec(CM.olho_d), ed: vec(CM.olho_e_dei), dd: vec(CM.olho_d_dei) };
function poseSala(t) {
  var c2 = S[1];
  var deita = eio(seg(t, c2 + .2, c2 + 2.6));                 /* a cadela deita */
  var morph = eio(seg(t, c2 + .6, c2 + 2.8));                 /* membros relaxam */
  rolo.rotation.x = -PI / 2 * deita;
  rolo.position.set(0, -CM.xmin * deita + .04 * Math.sin(deita * PI), CM.dz * deita);
  cao.morphTargetInfluences[0] = morph;
  var aparece = ss(S[0] + 1.6, S[0] + 3.6, t), operado = t >= S[10];
  cao.morphTargetInfluences[1] = operado ? 0 : aparece;   /* o nódulo aparece: base levantando a pele e a massa aberta para fora */
  massaCao.visible = !operado && aparece > 0; massaCao.scale.setScalar(Math.max(.001, aparece));
  UC.uMassa.value = operado ? 0 : aparece;
  UC.uOlhoE.value.lerpVectors(OLHO.e, OLHO.ed, morph); UC.uOlhoD.value.lerpVectors(OLHO.d, OLHO.dd, morph);
  var acorda = ss(S[10] + 4, S[10] + 6.5, t);
  UC.uPalp.value = ss(c2 + .3, c2 + 1.6, t) * (1 - acorda);
  UC.uAnel.value = ss(S[0] + 3.2, S[0] + 4.2, t) * (1 - ss(S[0] + 6.5, S[0] + 7.6, t));
  var trico = seg(t, c2 + 4.0, c2 + 6.9);
  UC.uTrico.value = trico;
  UC.uAntis.value = t < S[10] ? seg(t, c2 + 7.1, c2 + 9.7) : 0;
  UC.uFerida.value = t >= S[10] ? 1 : 0;
  /* máquina de tosa: oito passadas paralelas ao eixo u */
  maquina.visible = trico > 0 && trico < 1;
  if (maquina.visible) {
    var sf = trico * 8, j = Math.min(7, Math.floor(sf)), f = sf - j, uu = .118 - .236 * f, vv = -.084 + .024 * j;
    var ergue = Math.max(0, 1 - Math.min(f, 1 - f) / .08) * .02;
    var pz = SIT.c.clone().addScaledVector(SIT.u, uu).addScaledVector(SIT.v, vv).addScaledVector(SIT.n, .004 + ergue);
    maquina.position.copy(pz);
    var yy = SIT.u.clone().multiplyScalar(.82).addScaledVector(SIT.n, .57).normalize(), zz = new V3().crossVectors(SIT.v, yy).normalize();
    maquina.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(SIT.v, yy, zz));
  }
  /* gaze com antisséptico em espiral, da periferia para a lesão (área contaminada por último) */
  var an = UC.uAntis.value; bola.visible = an > 0 && an < 1;
  if (bola.visible) {
    var th = an * 5 * TAU, rr = .98 - an * .68, ps = SIT.c.clone().addScaledVector(SIT.u, Math.cos(th) * rr * .108).addScaledVector(SIT.v, Math.sin(th) * rr * .078).addScaledVector(SIT.n, .007);
    bola.position.copy(ps);
    var yb = SIT.n.clone().multiplyScalar(.75).addScaledVector(SIT.u, -.66).normalize(), zb = new V3().crossVectors(SIT.v, yb).normalize();
    bola.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(SIT.v, yb, zb));
  }
  /* pano de campo desce sobre a cadela; as pinças de Backhaus prendem os cantos da janela */
  var desce = sai(seg(t, c2 + 9.9, c2 + 11.6)), fica = t >= c2 + 9.9 && t < S[10];
  pano.visible = fica; pano.position.y = (1 - desce) * .22; matPano.opacity = Math.min(1, desce * 2.2); matPano.transparent = desce < 1; matPano.depthWrite = desce >= 1;
  backhaus.forEach(function (b, i) {
    var k = sai(seg(t, c2 + 11.4 + i * .45, c2 + 12.1 + i * .45)); b.visible = fica && k > 0;
    var cp = b.userData.canto; b.position.set(cp.x, alturaPano(cp.x, cp.z) + .007, cp.z).addScaledVector(SITW.n, (1 - k) * .08).addScaledVector(b.userData.fora, (1 - k) * .03);
    b.userData.abre(.18 * (1 - k));
  });
  acesso.visible = t >= S[10];
  /* extubação: com o reflexo de deglutição de volta, o tubo (com o oxímetro) sai pela boca e a língua recolhe */
  var extuba = eio(seg(t, S[10] + 5.4, S[10] + 6.6)), recolhe = eio(seg(t, S[10] + 6.2, S[10] + 7.2));
  anest.visible = t >= c2 + 2.2 && t < S[10] + 7.2;
  anest.scale.setScalar(1);
  var puxa = .085 * extuba;
  anest.tubo.position.set(-.012 * extuba, -.004 * extuba, puxa); anest.tubo.material.opacity = .62 * (1 - ss(.6, 1, extuba));
  anest.con.position.copy(anest.con0).add(_puxa.set(-.012 * extuba, -.004 * extuba, puxa));
  anest.ox.position.copy(anest.ox0).add(_puxa.set(-.02 * extuba, -.01 * extuba, puxa));
  anest.ox.visible = anest.con.visible = extuba < .85;
  anest.lingua.position.copy(anest.lingua0).lerp(anest.boca, recolhe * .7); anest.lingua.scale.setScalar(1 - .65 * recolhe);
  UC.uResp.value = .0028 * Math.sin(t * TAU / (t >= c2 && t < S[10] + 4 ? 4.2 : 2.6));
  UC.uCauda.value = t >= S[10] + 6.5 ? .16 * Math.sin((t - S[10]) * 5.2) * ss(S[10] + 6.5, S[10] + 7.5, t) : 0;
}

/* ============================================================ câmera: tomadas no tempo global */
/* cada tomada fixa onde a câmera está num instante; entre duas tomadas do mesmo ambiente ela desliza,
   e "corte" faz a câmera pular (troca de ambiente com um escurecimento rápido) */
var TOMADAS = [];
function tomada(t, mundo, p, a, fov, corte) { TOMADAS.push({ t: t, mundo: mundo, p: new V3(p[0], p[1], p[2]), a: new V3(a[0], a[1], a[2]), fov: fov || 30, corte: !!corte }); }
var camAlvo = new V3();
function camara(t) {
  var i = 0; while (i + 1 < TOMADAS.length && TOMADAS[i + 1].t <= t) i++;
  var A = TOMADAS[i], B = TOMADAS[i + 1], k = 0;
  if (B && !B.corte && B.mundo === A.mundo) k = eio(seg(t, A.t, B.t));
  cam.position.lerpVectors(A.p, B && k > 0 ? B.p : A.p, k);
  camAlvo.lerpVectors(A.a, B && k > 0 ? B.a : A.a, k);
  cam.fov = lerp(A.fov, B && k > 0 ? B.fov : A.fov, k); cam.updateProjectionMatrix();
  cam.lookAt(camAlvo);
  /* escurece perto de cada corte entre ambientes */
  var veu = 0;
  TOMADAS.forEach(function (T, j) { if (T.corte && j > 0) veu = Math.max(veu, 1 - Math.abs(t - T.t) / .32); });
  $("veu").style.opacity = clamp(veu, 0, 1).toFixed(3);
  return A.mundo;
}

/* ============================================================ rótulos com linha de chamada */
var ROTULOS = [];
/* ponto: função que devolve a posição no mundo; dx, dy: deslocamento do rótulo em % da largura do palco */
function rotulo(de, ate, mundo, txt, sub, ponto, dx, dy, cls) {
  var el = document.createElement("div"); el.className = "r" + (cls ? " " + cls : ""); el.textContent = txt;
  if (sub) { var s = document.createElement("small"); s.textContent = sub; el.appendChild(s); }
  el.style.opacity = 0; $("rotulos").appendChild(el);
  var ln = document.createElementNS("http://www.w3.org/2000/svg", "path");
  ln.setAttribute("fill", "none"); ln.setAttribute("stroke", "#13202b"); ln.setAttribute("stroke-width", "2"); ln.setAttribute("stroke-linecap", "round");
  var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"); dot.setAttribute("r", "3.5"); dot.setAttribute("fill", "#13202b");
  var halo = ln.cloneNode(); halo.setAttribute("stroke", "rgba(255,255,255,.75)"); halo.setAttribute("stroke-width", "5");
  var svg = $("rotulos").querySelector("svg"); svg.appendChild(halo); svg.appendChild(ln); svg.appendChild(dot);
  ROTULOS.push({ de: de, ate: ate, mundo: mundo, el: el, ln: ln, halo: halo, dot: dot, ponto: ponto, dx: dx, dy: dy });
}
var _p = new V3();
function rotulos(t, mundo) {
  var W = palco.clientWidth, H = palco.clientHeight;
  ROTULOS.forEach(function (R) {
    var a = R.mundo === mundo ? Math.min(seg(t, R.de, R.de + .35), 1 - seg(t, R.ate - .35, R.ate)) : 0;
    if (a <= 0) { R.el.style.opacity = 0; R.ln.style.opacity = R.halo.style.opacity = R.dot.style.opacity = 0; return; }
    _p.copy(R.ponto(t)).project(cam);
    var x = (_p.x * .5 + .5) * W, y = (-_p.y * .5 + .5) * H, lx = x + R.dx * W / 100, ly = y + R.dy * W / 100;
    R.el.style.left = lx + "px"; R.el.style.top = ly + "px"; R.el.style.opacity = a;
    var d = "M" + x.toFixed(1) + " " + y.toFixed(1) + "L" + lx.toFixed(1) + " " + ly.toFixed(1);
    R.ln.setAttribute("d", d); R.halo.setAttribute("d", d); R.dot.setAttribute("cx", x.toFixed(1)); R.dot.setAttribute("cy", y.toFixed(1));
    R.ln.style.opacity = R.halo.style.opacity = R.dot.style.opacity = a;
  });
}

/* ============================================================ instrumental (medidas em metros)
   Convenção: eixo +Y = cabo; a ponta de trabalho fica na origem. Peças modeladas como na mesa das fotos:
   aço inox polido e escovado, argolas, cremalheira. */
function lathe(pr, mt, seg) { return new THREE.Mesh(new THREE.LatheGeometry(pr.map(function (p) { return new THREE.Vector2(Math.max(p[0], 1e-5), p[1]); }), seg || 28), mt); }
/* haste plana no plano XY, seção de cantos arredondados; w(t) meia-largura, h(t) meia-espessura */
function haste(pts, w, h, mt, n) {
  var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return new V3(p[0], p[1], p[2] || 0); })), N = n || 40, R = 10, P = [], ix = [], T = new V3();
  for (var i = 0; i <= N; i++) {
    var t = i / N, p = c.getPointAt(t); c.getTangentAt(t, T); var nx = -T.y, ny = T.x, ww = w(t), hh = h(t);
    for (var j = 0; j < R; j++) {
      var a = j / R * TAU, cs = Math.cos(a), sn = Math.sin(a), ex = Math.sign(cs) * Math.pow(Math.abs(cs), .7), ez = Math.sign(sn) * Math.pow(Math.abs(sn), .7);
      P.push(p.x + nx * ex * ww, p.y + ny * ex * ww, p.z + ez * hh);
    }
  }
  for (i = 0; i < N; i++) for (j = 0; j < R; j++) { var a1 = i * R + j, b1 = a1 + R, a2 = i * R + (j + 1) % R, b2 = a2 + R; ix.push(a1, b1, a2, b1, b2, a2); }
  var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setIndex(ix); g.computeVertexNormals();
  return new THREE.Mesh(g, mt);
}
function pontas(t, a, b) { var s = 1; if (t < a) s = Math.sqrt(Math.max(0, 1 - Math.pow((a - t) / a, 2))); if (t > 1 - b) s = Math.min(s, Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + b) / b, 2)))); return Math.max(s, .1); }
function placa(sh, d, bv, mt) { var g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: bv > 0, bevelThickness: bv, bevelSize: bv, bevelSegments: 2, curveSegments: 16 }); g.translate(0, 0, -d / 2); g.computeVertexNormals(); return new THREE.Mesh(g, mt); }
function poli(pts) { var s = new THREE.Shape(); pts.forEach(function (p, i) { i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); }); s.closePath(); return s; }
function cremalheira(x0, y0, len, ang, n, mt) {
  var p = [[0, 0]]; for (var i = 0; i < n; i++) { p.push([len * (i + .55) / n, .0013]); p.push([len * (i + 1) / n, 0]); }
  p.push([len, -.001]); p.push([0, -.001]);
  var o = placa(poli(p), .001, .00015, mt); o.position.set(x0, y0, 0); o.rotation.z = ang; return o;
}
function sombras(o) { o.traverse(function (q) { if (q.isMesh) q.castShadow = true; }); return o; }

/* pinça com duas hastes que giram no eixo (hemostática, Backhaus, porta-agulhas, tesoura):
   ponta(s) = curva da ponta da haste do lado s; abre(ang) gira as hastes em torno do eixo Z */
function pinca(tipo) {
  var g = new THREE.Group(), pt = { tipo: tipo };
  var EIXO = tipo === "backhaus" ? .028 : tipo === "porta" ? .03 : .038;
  [1, -1].forEach(function (s) {
    var a = new THREE.Group(); a.position.y = EIXO;
    var ponta;
    if (tipo === "kelly") ponta = haste([[0, 0], [s * .0006, -.012], [s * .0004, -.026], [s * .0032 + .0012, -.034], [.0058, -.038]], function (t) { return .0017 * (1 - .55 * t) * pontas(t, .02, .05); }, function (t) { return .0011 * (1 - .35 * t); }, ACO, 30);
    else if (tipo === "backhaus") ponta = haste([[0, 0], [s * .004, -.008], [s * .009, -.017], [s * .006, -.025], [-s * .002, -.027], [-s * .0035, -.0245]], function (t) { return .0012 * (1 - .8 * Math.pow(t, 1.4)) * pontas(t, .02, .01); }, function (t) { return .001 * (1 - .6 * t); }, ACO, 34);
    else if (tipo === "porta") ponta = haste([[0, 0], [s * .0011, -.008], [s * .001, -.016], [s * .0004, -.021]], function (t) { return .0019 * (1 - .3 * t) * pontas(t, .02, .05); }, function () { return .0013; }, ACO, 20);
    else if (tipo === "tesoura") ponta = haste([[0, 0], [s * .0002, -.012], [.0008, -.024], [.0034, -.033], [.0052, -.036]], function (t) { return .0021 * (1 - .75 * t) * pontas(t, .01, .03); }, function (t) { return .0007; }, ACO, 30);
    a.add(ponta);
    var cabo = haste([[0, 0], [-s * .0028, .022], [-s * .0062, .05], [-s * .0085, .072]], function (t) { return (.0015 - .0003 * t) * pontas(t, .02, .02); }, function () { return .0012; }, ACO2, 26);
    a.add(cabo);
    var arg = new THREE.Mesh(new THREE.TorusGeometry(.0072, .0013, 8, 28), ACO2); arg.scale.set(1, 1.2, 1); arg.position.set(-s * .0138, .0795, 0); a.add(arg);
    if (tipo !== "tesoura") a.add(cremalheira(-s * .0085, s > 0 ? .0655 : .0685, .009, s > 0 ? 0 : PI, 5, ACO2));
    if (s > 0) pt.A = a; else pt.B = a; g.add(a);
  });
  var eixo = new THREE.Mesh(new THREE.CylinderGeometry(.0026, .0026, .0034, 18), ACO2); eixo.rotation.x = PI / 2; eixo.position.y = EIXO; g.add(eixo);
  pt.abre = function (ang) { pt.A.rotation.z = ang; pt.B.rotation.z = -ang; };
  g.userData = pt; return sombras(g);
}
function bisturi() {
  var g = new THREE.Group();
  var lam = placa(poli([[0, 0], [.0019, .0035], [.0047, .0095], [.0058, .0155], [.0054, .0205], [.0043, .0245], [.0028, .0262], [-.0021, .0262], [-.0022, .017], [-.0014, .0075]]), .00022, .00006, ACO2); g.add(lam);
  var fio = placa(poli([[0, 0], [.0019, .0035], [.0047, .0095], [.0058, .0155], [.0054, .0205], [.0047, .0205], [.005, .0155], [.004, .0097], [.0013, .0038]]), .0003, 0, ACO); g.add(fio);
  var cabo = placa(poli([[-.0018, .024], [.0026, .024], [.0028, .034], [.0042, .044], [.0042, .098], [.0036, .103], [0, .1045], [-.0036, .103], [-.0042, .098], [-.0042, .044], [-.0028, .034]]), .0016, .0005, ACO2); cabo.position.z = -.0012; g.add(cabo);
  for (var i = 0; i < 12; i++) { var r = new THREE.Mesh(new THREE.BoxGeometry(.0062, .0007, .0031), ACO3); r.position.set(0, .06 + i * .0026, -.0012); g.add(r); }
  return sombras(g);
}
/* pinça de dissecção com dente de rato (Adson): duas lâminas que se tocam na ponta */
function pincaDente() {
  var g = new THREE.Group(), pt = {};
  [1, -1].forEach(function (s) {
    var a = new THREE.Group(); a.position.y = .1;
    a.add(haste([[0, 0, 0], [s * .0045, -.03, 0], [s * .0042, -.07, 0], [s * .0008, -.1, 0]], function (t) { return .0028 * (1 - .65 * t) * pontas(t, .01, .02); }, function () { return .0006; }, ACO2, 30));
    if (s > 0) pt.A = a; else pt.B = a; g.add(a);
  });
  pt.abre = function (k) { pt.A.rotation.z = .035 * k; pt.B.rotation.z = -.035 * k; };
  g.userData = pt; return sombras(g);
}
/* agulha curva com fio: arco de 3/8 de círculo */
function agulha(cor) {
  var g = new THREE.Group();
  var ag = new THREE.Mesh(new THREE.TorusGeometry(.007, .00035, 6, 30, PI * .75), ACO); g.add(ag);
  return sombras(g);
}
/* gaze dobrada: quadrado macio com trama */
var texGaze = texCanvas(256, 256, function (g, w, h) {
  g.fillStyle = "#f7f7f2"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(170,170,160,.55)"; g.lineWidth = 1;
  for (var i = 0; i < w; i += 6) { g.beginPath(); g.moveTo(i + .5, 0); g.lineTo(i + .5, h); g.stroke(); g.beginPath(); g.moveTo(0, i + .5); g.lineTo(w, i + .5); g.stroke(); }
}, [4, 4]);
var matGaze = new THREE.MeshLambertMaterial({ map: texGaze, side: THREE.DoubleSide });
function gaze(lx, lz, amp) {
  var geo = new THREE.PlaneGeometry(lx, lz, 24, 24); geo.rotateX(-PI / 2); var p = geo.attributes.position;
  for (var i = 0; i < p.count; i++) { var x = p.getX(i), z = p.getZ(i); p.setY(i, (amp || .002) * (Math.sin(x * 160 + z * 40) * .6 + Math.sin(z * 210 - x * 90) * .4) + .0035 * (1 - Math.pow(2 * x / lx, 2)) * (1 - Math.pow(2 * z / lz, 2))); }
  geo.computeVertexNormals(); var m = new THREE.Mesh(geo, matGaze); m.castShadow = true; m.receiveShadow = true; return m;
}

/* ============================================================ sala: pano de campo e pinças de Backhaus */
var SITW = {};   /* referencial do sítio no mundo, com a cadela deitada */
(function () {
  function mundoDeitado(p) { return new V3(-p.z, p.x - CM.xmin, -p.y + CM.dz); }
  function dirDeitada(p) { return new V3(-p.z, p.x, -p.y); }
  SITW.c = mundoDeitado(SIT.c); SITW.n = dirDeitada(SIT.n); SITW.u = dirDeitada(SIT.u); SITW.v = dirDeitada(SIT.v);
})();
var JANELA = { u: .102, v: .066 };
var texPano = texCanvas(512, 512, function (g, w, h) {
  g.fillStyle = "#ebe4d2"; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 6000; i++) { var c = 205 + rnd() * 40 | 0; g.fillStyle = "rgba(" + c + "," + (c - 6) + "," + (c - 22) + ",.25)"; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1); }
  for (i = 0; i < 9; i++) { g.fillStyle = "rgba(196,180,150,.10)"; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 30 + rnd() * 60, 18 + rnd() * 40, rnd() * 3, 0, TAU); g.fill(); }
}, [3, 3]);
var UP = { uCw: { value: SITW.c }, uUw: { value: SITW.u }, uVw: { value: SITW.v }, uJan: { value: new THREE.Vector2(JANELA.u, JANELA.v) } };
var matPano = new THREE.MeshLambertMaterial({ map: texPano, color: 0xe2dccb, side: THREE.DoubleSide, transparent: true, opacity: 1 });
matPano.onBeforeCompile = function (sh) {
  Object.assign(sh.uniforms, UP);
  sh.vertexShader = "varying vec3 vMundo;\n" + sh.vertexShader.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvMundo = (modelMatrix * vec4(transformed, 1.)).xyz;");
  sh.fragmentShader = "uniform vec3 uCw,uUw,uVw;\nuniform vec2 uJan;\nvarying vec3 vMundo;\n" + sh.fragmentShader
    .replace("void main() {", "void main() {\nvec3 dj = vMundo - uCw; vec2 qj = abs(vec2(dot(dj, uUw), dot(dj, uVw))) - uJan; if (qj.x < 0. && qj.y < 0.) discard;\nfloat bainha = 1. - smoothstep(.0, .008, max(qj.x, qj.y));")
    .replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.rgb *= 1. - .16 * bainha;");
};
var pano = (function () {
  var G = CM.pano_grade, alt = vista(Float32Array, CM.pano, G.nx * G.nz);
  function h(x, z) {
    var fx = clamp((x - G.x0) / G.passo, 0, G.nx - 1.001), fz = clamp((z - G.z0) / G.passo, 0, G.nz - 1.001), i = fx | 0, j = fz | 0, a = fx - i, b = fz - j;
    var q = function (ii, jj) { return alt[jj * G.nx + ii]; };
    return (q(i, j) * (1 - a) + q(i + 1, j) * a) * (1 - b) + (q(i, j + 1) * (1 - a) + q(i + 1, j + 1) * a) * b;
  }
  window.alturaPano = h;
  var X0 = -.3, X1 = .62, Z0 = -.34, Z1 = .35, NX = 140, NZ = 100;
  var geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ); geo.rotateX(-PI / 2); geo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  var p = geo.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), z = p.getZ(i), y = h(x, z);
    var ruga = .0045 * Math.sin(x * 37 + Math.sin(z * 9) * 2) * Math.sin(z * 23 + x * 5) + .0025 * Math.sin(x * 83 - z * 61) + .006 * Math.max(0, Math.sin(x * 17 + z * 4)) * Math.max(0, Math.sin(z * 11 - x * 2));
    var borda = Math.min(1, Math.min(x - X0, X1 - x, z - Z0, Z1 - z) / .05);
    p.setY(i, Math.max(.003, y + .006 + ruga * (y > .02 ? 1 : .35)) * (.6 + .4 * borda) + (1 - borda) * .001);
  }
  geo.computeVertexNormals();
  var m = new THREE.Mesh(geo, matPano); m.castShadow = true; m.receiveShadow = true; sala.add(m); return m;
})();
/* quatro pinças de Backhaus nos cantos da janela, com as pontas presas ao pano e à pele */
var backhaus = [];
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) {
  var b = pinca("backhaus"); b.userData.abre(.0);
  var canto = SITW.c.clone().addScaledVector(SITW.u, q[0] * JANELA.u).addScaledVector(SITW.v, q[1] * JANELA.v);
  var fora = SITW.u.clone().multiplyScalar(q[0]).addScaledVector(SITW.v, q[1] * .8).normalize();
  var eixoY = fora.clone().multiplyScalar(.96).addScaledVector(SITW.n, .28).normalize();   /* cabo deitado sobre o pano, para fora */
  var m = new THREE.Matrix4(), xx = new V3().crossVectors(eixoY, SITW.n).normalize(), zz = new V3().crossVectors(xx, eixoY).normalize();
  m.makeBasis(xx, eixoY, zz); b.quaternion.setFromRotationMatrix(m);
  b.position.copy(canto).addScaledVector(SITW.n, .004);
  b.userData.canto = canto.clone(); b.userData.fora = fora; b.visible = false; sala.add(b); backhaus.push(b);
});

/* máquina de tosa, gaze de antissepsia e acesso venoso: presos à malha da cadela (referencial local) */
var maquina = (function () {
  var g = new THREE.Group();
  var sh = new THREE.Shape(); var L = .15, W = .042, r = .016;
  sh.moveTo(-W / 2 + r, 0); sh.lineTo(W / 2 - r, 0); sh.quadraticCurveTo(W / 2, 0, W / 2, r); sh.lineTo(W / 2 * .8, L - r); sh.quadraticCurveTo(W / 2 * .8, L, W / 2 * .8 - r, L);
  sh.lineTo(-W / 2 * .8 + r, L); sh.quadraticCurveTo(-W / 2 * .8, L, -W / 2 * .8, L - r); sh.lineTo(-W / 2, r); sh.quadraticCurveTo(-W / 2, 0, -W / 2 + r, 0);
  var corpo = placa(sh, .026, .006, M(0x2b5f8f, { roughness: .35, metalness: .1 })); corpo.position.y = .012; g.add(corpo);
  var lamina = new THREE.Mesh(new THREE.BoxGeometry(.044, .012, .008), ACO2); lamina.position.y = .006; g.add(lamina);
  for (var i = 0; i < 14; i++) { var d = new THREE.Mesh(new THREE.BoxGeometry(.0018, .007, .006), ACO3); d.position.set(-.02 + i * .0031, -.002, 0); g.add(d); }
  var bot = new THREE.Mesh(new THREE.BoxGeometry(.012, .02, .004), M(0xe8e8e8, { roughness: .5 })); bot.position.set(0, .07, .016); g.add(bot);
  sombras(g); g.visible = false; cao.add(g); return g;
})();
var bola = (function () {
  var g = new THREE.Group();
  var esf = new THREE.Mesh(new THREE.SphereGeometry(.013, 20, 14), new THREE.MeshLambertMaterial({ map: texGaze, color: 0xf0d2b0 }));
  esf.scale.set(1, .7, 1); g.add(esf);
  var k = pinca("kelly"); k.userData.abre(0); k.position.set(-.004, .004, 0); k.rotation.z = .1; g.add(k);
  sombras(g); g.visible = false; cao.add(g); return g;
})();
var acesso = (function () {
  var A = vec(CM.antebraco_dei[0]), B = vec(CM.antebraco_dei[1]), ax = B.clone().sub(A), L = ax.length(); ax.normalize();
  var g = new THREE.Group(); g.position.copy(A).addScaledVector(ax, L * .45); g.quaternion.setFromUnitVectors(new V3(0, 1, 0), ax);
  var esp = new THREE.Mesh(new THREE.CylinderGeometry(.0235, .0235, .048, 28, 1, true), new THREE.MeshLambertMaterial({ color: 0xf4f4ee, side: THREE.DoubleSide }));
  g.add(esp);
  var esp2 = new THREE.Mesh(new THREE.CylinderGeometry(.0245, .0245, .016, 28, 1, true), new THREE.MeshLambertMaterial({ color: 0xe9e9e1, side: THREE.DoubleSide })); esp2.position.y = .012; g.add(esp2);
  var conector = new THREE.Mesh(new THREE.CylinderGeometry(.0035, .0035, .018, 12), M(0xf0c419, { roughness: .4 })); conector.position.set(.012, .03, .016); conector.rotation.x = -.5; g.add(conector);
  var linha = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(.012, .038, .02), new V3(.02, .07, .05), new V3(.05, .1, .12), new V3(.12, .1, .25), new V3(.2, .3, .4)]), 60, .0022, 8),
    new THREE.MeshPhysicalMaterial({ color: 0xf2f7fa, roughness: .15, transparent: true, opacity: .7 }));
  g.add(linha);
  sombras(g); g.visible = false; cao.add(g); return g;
})();
