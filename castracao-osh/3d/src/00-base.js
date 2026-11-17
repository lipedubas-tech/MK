/* ===== base: renderizador, cena, luzes, mesa e utilidades =====
   Unidades da cena: 1 unidade ≈ 87 cm (a gata do modelo tem ~0,53 do focinho à base da cauda, ~46 cm).
   Paciente em decúbito dorsal: cranial = +Z, ventral = +Y, lado direito da paciente = +X. */
"use strict";
var PI = Math.PI, V = THREE.Vector3, Q = THREE.Quaternion, COR = THREE.Color;
var CM = 0.0115;                                   /* 1 cm na escala da cena */
function dec(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u }
function cl(x, a, b) { return Math.min(b, Math.max(a, x)) }
function lerp(a, b, t) { return a + (b - a) * t }
function RP(u, a, b) { var t = cl((u - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }   /* rampa suave de a até b */
function WN(u, a, b, c, d) { return RP(u, a, b) * (1 - RP(u, c, d)) }                     /* janela: sobe em a–b, desce em c–d */
function P(x, y, z) { return new V(x, y, z) }
function vl(a, b, t) { return new V().lerpVectors(a, b, t) }
function vlist(a, b, t) { return a.map(function (p, i) { return vl(p, b[i], t) }) }

var host = document.getElementById("palco");
var ren = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
ren.outputEncoding = THREE.sRGBEncoding; ren.physicallyCorrectLights = true;
ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = .95;
ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap;
host.insertBefore(ren.domElement, host.firstChild);
var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 16 / 9, .005, 20);

/* luzes: foco cirúrgico (chave, com sombra), preenchimento frio e céu/chão */
var hemi = new THREE.HemisphereLight(0xeef5fb, 0x3a3230, 1.1); scene.add(hemi);
var key = new THREE.DirectionalLight(0xfff4e6, 2.4); key.position.set(.9, 2, 1.1); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .002;
(function () { var c = key.shadow.camera; c.left = c.bottom = -.6; c.right = c.top = .6; c.near = .5; c.far = 4 })();
scene.add(key);
var fill = new THREE.DirectionalLight(0xbfd6ff, .7); fill.position.set(-1.5, .8, -.6); scene.add(fill);
var foco = new THREE.SpotLight(0xfff8ee, 0, 2.2, .35, .6, 1); foco.position.set(.15, 1.1, .05); scene.add(foco); scene.add(foco.target);

/* reflexos do inox e do tecido úmido: sala procedural escura com painéis de luz */
(function () {
  var pm = new THREE.PMREMGenerator(ren), sala = new THREE.Scene(), cx = new THREE.BoxGeometry(1, 1, 1);
  sala.add(new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshBasicMaterial({ color: 0x1d2629, side: THREE.BackSide })));
  [[0, 2.9, 0, 3, .1, 1.2, 2.2], [4.9, 1.2, -1, .1, 1.4, 4, 2.2], [-4.9, 1.5, 1.5, .1, 1, 2.5, 2.6], [0, 1.4, -4.9, 5, .5, .1, 1.2]].forEach(function (a) {
    var l = new THREE.Mesh(cx, new THREE.MeshBasicMaterial({ color: new COR(1, 1, 1).multiplyScalar(a[6]) }));
    l.position.set(a[0], a[1], a[2]); l.scale.set(a[3], a[4], a[5]); sala.add(l)
  });
  scene.environment = pm.fromScene(sala, .02).texture; pm.dispose()
})();

/* materiais comuns */
function MS(c, o) { o = o || {}; o.color = c; return new THREE.MeshStandardMaterial(o) }
function MF(c, o) { o = o || {}; o.color = c; return new THREE.MeshPhysicalMaterial(o) }
var INOX = MS(0x8e979f, { metalness: .9, roughness: .42, envMapIntensity: 1.2 });

/* mesa cirúrgica de inox (tampo em y = 0) */
var mesa = new THREE.Group(); scene.add(mesa);
(function () {
  var w = .5, c = 1.0, r = .05, s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -c / 2); s.lineTo(w / 2 - r, -c / 2); s.quadraticCurveTo(w / 2, -c / 2, w / 2, -c / 2 + r);
  s.lineTo(w / 2, c / 2 - r); s.quadraticCurveTo(w / 2, c / 2, w / 2 - r, c / 2); s.lineTo(-w / 2 + r, c / 2);
  s.quadraticCurveTo(-w / 2, c / 2, -w / 2, c / 2 - r); s.lineTo(-w / 2, -c / 2 + r); s.quadraticCurveTo(-w / 2, -c / 2, -w / 2 + r, -c / 2);
  var g = new THREE.ExtrudeGeometry(s, { depth: .025, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 3, curveSegments: 10 });
  g.rotateX(PI / 2); g.translate(0, -.006, -.02);
  var tampo = new THREE.Mesh(g, INOX); tampo.receiveShadow = true; mesa.add(tampo);
  var pe = new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, .8, 24), INOX); pe.position.set(0, -.43, -.02); mesa.add(pe)
})();

/* tubo por pontos (refeito quando os pontos mudam) */
function Tubo(mat, r, seg, rad) {
  this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); this.r = r; this.seg = seg || 48; this.rad = rad || 10; this.chave = ""; this.mesh.castShadow = true
}
Tubo.prototype.set = function (pts, r) {
  var k = pts.map(function (p) { return p.x.toFixed(5) + "," + p.y.toFixed(5) + "," + p.z.toFixed(5) }).join(";") + (r || this.r);
  if (k === this.chave) return; this.chave = k;
  this.mesh.geometry.dispose();
  this.mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "centripetal"), this.seg, r || this.r, this.rad, false)
};

/* lista de funções chamadas a cada quadro com o tempo do roteiro u (cena + fração) */
var ATUALIZA = [];
var ROTULOS = [];   /* [texto, ponto-ou-função, u0, u1] — preenchidos pelos módulos */
