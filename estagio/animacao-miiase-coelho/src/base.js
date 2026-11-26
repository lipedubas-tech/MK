"use strict";
/* Miíase em coelho: animação 3D em 11 cenas.
   Ideia central (Felipe, 25/11): "O pelo escondia. A tricotomia mostrou."
   Tudo é função do tempo global t: dá para pular para qualquer instante e o estado sai sempre igual.
   Unidade do mundo: a do modelo (1 u ≈ 1,5 cm; o coelho tem cerca de 24 u de comprimento). */

/* ============================================================ utilidades */
function dec(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function lerp(a, b, k) { return a + (b - a) * k; }
function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
function suave(k) { return k * k * (3 - 2 * k); }
function eio(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }   /* ease in-out cúbico */
function sai(k) { return 1 - Math.pow(1 - k, 3); }                                    /* ease out */
function ss(a, b, x) { return suave(seg(x, a, b)); }
function sino(t, a, b) { return Math.min(seg(t, a, a + (b - a) * .25), 1 - seg(t, b - (b - a) * .25, b)); }   /* sobe, fica, desce */
var PI = Math.PI, TAU = PI * 2;
var $ = function (id) { return document.getElementById(id); };
var V3 = THREE.Vector3;
function v3(a) { return new V3(a[0], a[1], a[2]); }
var semente = 7;
function rnd() { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

/* ============================================================ roteiro */
var CENAS = [
  { nome: "Abertura", dur: 6, leg: "Miíase em coelho (25/11, perto das 18h). Por fora, um coelho normal e fofo",
    desc: "Um coelho de pelo longo, cinza-escuro e branco, deitado. Por fora, nenhuma ferida aparece." },
  { nome: "Como começa", dur: 9, leg: "Por baixo do pelo longo, umidade e sujeira atraem a mosca, que põe os ovos",
    desc: "Uma lente deixa o pelo transparente na garupa: junto da pele há umidade e sujeira, e uma mosca põe ovos." },
  { nome: "As larvas", dur: 10, leg: "Por baixo do pelo, as larvas comem o tecido vivo. Por fora, nada muda",
    desc: "As larvas nascem e abrem feridas no dorso, na garupa e na região genital. Fechada a lente, o coelho parece normal." },
  { nome: "Antes da clínica", dur: 8, leg: "Antes da clínica: spray prata de agropecuária. Não alcançou várias feridas",
    desc: "Um spray prata cobre o pelo e parte das feridas; pela lente, várias feridas ficaram sem o produto." },
  { nome: "Chegada", dur: 8, leg: "Chegada perto das 18h, muito desidratado. Contenção física, sem sedação",
    desc: "Na mesa de granito, sobre um pano branco, o coelho acordado é contido com as mãos." },
  { nome: "Tricotomia", dur: 12, leg: "O pelo escondia. A tricotomia mostrou",
    desc: "A máquina de tosa passa pelo dorso, pela garupa e pela região perineal e revela as feridas e as larvas." },
  { nome: "Álcool e retirada", dur: 12, leg: "Álcool nas feridas e retirada das larvas, uma a uma",
    desc: "Álcool nas feridas; as larvas se agitam, sobem e são retiradas uma a uma para uma gaze." },
  { nome: "Com a luva", dur: 8, leg: "As larvas mais acima: tiradas com o dedo, de luva",
    desc: "Um dedo com luva azul retira as larvas que ficaram mais acima." },
  { nome: "Acesso e soro", dur: 12, leg: "Acesso na veia marginal da orelha e soro: ele estava muito desidratado",
    desc: "Um cateter entra na veia da borda da orelha, é fixado com esparadrapo e ligado ao soro." },
  { nome: "Rifamicina", dur: 9, leg: "Rifamicina spray (rifamicina SV sódica 10 mg/mL) sobre as feridas",
    desc: "De barriga para cima, as feridas recebem o spray laranja de rifamicina, que mancha o pano." },
  { nome: "Internamento", dur: 10, leg: "18h45: internado, com o soro, comendo",
    desc: "Na baia do internamento, sobre a manta verde, ele come ração com o soro preso na orelha." }
];
var NC = CENAS.length, S = [], TOTAL = 0;
CENAS.forEach(function (c) { S.push(TOTAL); TOTAL += c.dur; });
function cenaDe(t) { for (var k = NC - 1; k > 0; k--) if (t >= S[k]) return k; return 0; }
/* tempo local dentro da cena k */
function tl(t, k) { return t - S[k]; }

/* ============================================================ modo suave (tecla S) */
var SUAVE = { on: false };
try { SUAVE.on = localStorage.getItem("miiase-suave") === "1"; } catch (e) { }
function guardaSuave() { try { localStorage.setItem("miiase-suave", SUAVE.on ? "1" : "0"); } catch (e) { } }

/* ============================================================ renderizador */
var palco = $("palco");
var CELULAR = Math.min(screen.width, screen.height) < 760 || /Mobi|Android/i.test(navigator.userAgent);
var ren;
try {
  ren = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: /[?&]captura/.test(location.search) });
} catch (e) {
  $("carregando").textContent = "Este navegador não mostra 3D. Use o Chrome ou o vídeo do plano B.";
  throw e;
}
ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, CELULAR ? 1.5 : 2));
ren.outputEncoding = THREE.sRGBEncoding;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.1;
ren.shadowMap.enabled = !CELULAR;
ren.shadowMap.type = THREE.PCFSoftShadowMap;
ren.setClearColor(0x000000, 0);
palco.insertBefore(ren.domElement, palco.firstChild);
var cam = new THREE.PerspectiveCamera(30, 16 / 9, 0.4, 3000);
var cena3d = new THREE.Scene();

/* ambiente para reflexos: sala clara com janelas difusas */
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
cena3d.environment = ambiente([.3, .55]);

/* luzes: as mesmas nos três ambientes (estúdio, mesa, baia); o sol acompanha o coelho */
var LUZ = (function () {
  var hemi = new THREE.HemisphereLight(0xf4f6f8, 0x6f665c, .62); cena3d.add(hemi);
  var sol = new THREE.DirectionalLight(0xfff1e0, 1.45);
  sol.position.set(-30, 70, 45); sol.target.position.set(0, 8, 0);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
  var c = sol.shadow.camera; c.left = -40; c.right = 40; c.top = 40; c.bottom = -40; c.near = 10; c.far = 200;
  sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.4; sol.shadow.radius = 4;
  cena3d.add(sol, sol.target);
  var cheio = new THREE.DirectionalLight(0xcfe0ff, .42); cheio.position.set(60, 30, -20); cena3d.add(cheio);
  var borda = new THREE.DirectionalLight(0xffffff, .7); borda.position.set(10, 40, -70); cena3d.add(borda);
  return { hemi: hemi, sol: sol, cheio: cheio, borda: borda };
})();

/* ============================================================ materiais e peças reutilizáveis */
function M(c, o) { o = o || {}; o.color = c; return new THREE.MeshStandardMaterial(o); }
var ACO = M(0xdfe4ea, { metalness: 1, roughness: .2, envMapIntensity: 1.2 });
var ACO2 = M(0xc3cad2, { metalness: 1, roughness: .38, envMapIntensity: 1.1 });
function texCanvas(w, h, desenha, rep, linear) {
  var c = document.createElement("canvas"); c.width = w; c.height = h; desenha(c.getContext("2d"), w, h);
  var t = new THREE.CanvasTexture(c); if (!linear) t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function lathe(pr, mt, n) { return new THREE.Mesh(new THREE.LatheGeometry(pr.map(function (p) { return new THREE.Vector2(Math.max(p[0], 1e-4), p[1]); }), n || 28), mt); }
function sombras(o, recebe) { o.traverse(function (q) { if (q.isMesh) { q.castShadow = true; if (recebe) q.receiveShadow = true; } }); return o; }
/* cápsula ao longo de +Y, da base (y=0) até y=c, raio r */
function capsula(r, c, mt, n) {
  var pr = [], N = 8, i;
  for (i = 0; i <= N; i++) { var a = -PI / 2 + PI / 2 * i / N; pr.push([r * Math.cos(a), r + r * Math.sin(a)]); }
  for (i = 0; i <= N; i++) { var b = PI / 2 * i / N; pr.push([r * Math.cos(b), c - r + r * Math.sin(b)]); }
  return lathe(pr, mt, n || 16);
}

/* GLSL comum: ruído 2D e 3D */
var GLSL_RUIDO = [
  "float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
  "float vr(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1.,0.)),f.x),mix(h12(i+vec2(0.,1.)),h12(i+vec2(1.,1.)),f.x),f.y);}",
  "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vr(p);p*=2.03;a*=.5;}return s;}",
  "float h13(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}",
  "float vn3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
  " return mix(mix(mix(h13(i),h13(i+vec3(1.,0.,0.)),f.x),mix(h13(i+vec3(0.,1.,0.)),h13(i+vec3(1.,1.,0.)),f.x),f.y),",
  "            mix(mix(h13(i+vec3(0.,0.,1.)),h13(i+vec3(1.,0.,1.)),f.x),mix(h13(i+vec3(0.,1.,1.)),h13(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}",
  "float fbm3(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn3(p);p*=2.03;a*=.5;}return s;}",
  "vec3 lin(vec3 c){return pow(c,vec3(2.2));}"
].join("\n");

/* ============================================================ câmera: tomadas no tempo global */
var TOMADAS = [];
function tomada(t, mundo, p, a, fov, corte) { TOMADAS.push({ t: t, mundo: mundo, p: v3(p), a: v3(a), fov: fov || 30, corte: !!corte }); }
var camAlvo = new V3();
function camara(t) {
  var i = 0; while (i + 1 < TOMADAS.length && TOMADAS[i + 1].t <= t) i++;
  var A = TOMADAS[i], B = TOMADAS[i + 1], k = 0;
  if (B && !B.corte && B.mundo === A.mundo) k = eio(seg(t, A.t, B.t));
  cam.position.lerpVectors(A.p, B && k > 0 ? B.p : A.p, k);
  camAlvo.lerpVectors(A.a, B && k > 0 ? B.a : A.a, k);
  /* modo suave: os closes das cenas 3, 7 e 8 ficam 35% mais longe */
  var kc = cenaDe(t);
  if (SUAVE.on && (kc === 2 || kc === 6 || kc === 7)) cam.position.sub(camAlvo).multiplyScalar(1.35).add(camAlvo);
  cam.fov = lerp(A.fov, B && k > 0 ? B.fov : A.fov, k); cam.updateProjectionMatrix();
  cam.lookAt(camAlvo);
  var veu = 0;
  TOMADAS.forEach(function (T, j) { if (T.corte && j > 0) veu = Math.max(veu, 1 - Math.abs(t - T.t) / .32); });
  $("veu").style.opacity = clamp(veu, 0, 1).toFixed(3);
  return A.mundo;
}

/* ============================================================ rótulos com linha de chamada */
var ROTULOS = [];
/* ponto: função que devolve a posição no mundo; dx, dy: deslocamento do rótulo em % da largura do palco */
function rotulo(de, ate, txt, sub, ponto, dx, dy, cls) {
  var el = document.createElement("div"); el.className = "r" + (cls ? " " + cls : ""); el.textContent = txt;
  if (sub) { var s = document.createElement("small"); s.textContent = sub; el.appendChild(s); }
  el.style.opacity = 0; $("rotulos").appendChild(el);
  var svg = $("rotulos").querySelector("svg");
  var ln = document.createElementNS("http://www.w3.org/2000/svg", "path");
  ln.setAttribute("fill", "none"); ln.setAttribute("stroke", "#13202b"); ln.setAttribute("stroke-width", "2"); ln.setAttribute("stroke-linecap", "round");
  var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"); dot.setAttribute("r", "3.5"); dot.setAttribute("fill", "#13202b");
  var halo = ln.cloneNode(); halo.setAttribute("stroke", "rgba(255,255,255,.75)"); halo.setAttribute("stroke-width", "5");
  svg.appendChild(halo); svg.appendChild(ln); svg.appendChild(dot);
  ROTULOS.push({ de: de, ate: ate, el: el, ln: ln, halo: halo, dot: dot, ponto: ponto, dx: dx, dy: dy });
}
var _p = new V3();
function rotulos(t) {
  var W = palco.clientWidth, H = palco.clientHeight;
  ROTULOS.forEach(function (R) {
    var a = Math.min(seg(t, R.de, R.de + .35), 1 - seg(t, R.ate - .35, R.ate));
    if (a <= 0) { R.el.style.opacity = 0; R.ln.style.opacity = R.halo.style.opacity = R.dot.style.opacity = 0; return; }
    _p.copy(R.ponto(t)).project(cam);
    var x = (_p.x * .5 + .5) * W, y = (-_p.y * .5 + .5) * H, lx = x + R.dx * W / 100, ly = y + R.dy * W / 100;
    R.el.style.left = lx + "px"; R.el.style.top = ly + "px"; R.el.style.opacity = a;
    var d = "M" + x.toFixed(1) + " " + y.toFixed(1) + "L" + lx.toFixed(1) + " " + ly.toFixed(1);
    R.ln.setAttribute("d", d); R.halo.setAttribute("d", d); R.dot.setAttribute("cx", x.toFixed(1)); R.dot.setAttribute("cy", y.toFixed(1));
    R.ln.style.opacity = R.halo.style.opacity = R.dot.style.opacity = a;
  });
}
var pendentes = 0;
