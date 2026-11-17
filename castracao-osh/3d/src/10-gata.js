/* ===== a paciente: modelo "Cat by Sumpitueslag" (photon, CC BY 4.0), repintado como colorpoint =====
   Poses feitas no esqueleto do próprio modelo: em pé (cena 1), decúbito dorsal (cirurgia) e esternal (pós-operatório). */
var gata = null, ossos = {}, partes = {}, POSE = {}, EIXO = {}, EX = P(1, 0, 0);
var UG = {                                     /* uniformes dos materiais da gata */
  uCorte: { value: new THREE.Vector4(-.0675, .0225, .0072, 0) },   /* centro z, meio comprimento, meia largura máx., abertura */
  uOlho: { value: 1 },                          /* 1 = olhos abertos */
  uRaio: { value: 0 }                           /* modo transparência (0–1) */
};
var corpoPosado = null, raycaster = new THREE.Raycaster();

function injetaGata(mt, corpo) {
  mt.onBeforeCompile = function (sh) {
    sh.uniforms.uCorte = UG.uCorte; sh.uniforms.uOlho = UG.uOlho;
    sh.vertexShader = "varying vec3 vWp;\n" + sh.vertexShader.replace("#include <skinning_vertex>",
      "#include <skinning_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = "varying vec3 vWp;\nuniform vec4 uCorte;\nuniform float uOlho;\n" + sh.fragmentShader.replace("#include <map_fragment>",
      "#include <map_fragment>\n" +
      /* a pelagem some dentro da incisão aberta (a ferida tem malha própria) */
      " { float zz = (vWp.z - uCorte.x) / uCorte.y; if (uCorte.w > .001 && abs(zz) < 1.0 && vWp.y > .12 &&\n" +
      "   abs(vWp.x) < uCorte.w * uCorte.z * sqrt(1.0 - zz * zz) * 1.25 + .0006) discard; }\n" +
      (corpo ? /* pálpebras: o globo ocular some e aparece a pálpebra fechada desenhada na textura do rosto */
        " if (uOlho < .5 && distance(vUv, vec2(.094, .402)) < .085) discard;\n" : ""));
  };
  mt.customProgramCacheKey = function () { return corpo ? "gata-corpo" : "gata" };
}

/* eixo de cada osso = direção do filho (no lado direito do modelo alguns apontam para -X) */
function eixo(n) {
  if (EIXO[n]) return EIXO[n]; var b = ossos[n], f = b.children.filter(function (c) { return c.isBone })[0];
  EIXO[n] = f ? f.position.clone().normalize() : (b.parent.isBone ? eixo(b.parent.name) : EX.clone()); return EIXO[n]
}
function mira(nome, dir) {
  var b = ossos[nome]; gata.updateMatrixWorld(true);
  var qw = b.getWorldQuaternion(new Q()), cur = EIXO[nome].clone().applyQuaternion(qw),
    qd = new Q().setFromUnitVectors(cur, dir.clone().normalize()), qp = b.parent.getWorldQuaternion(new Q());
  b.quaternion.copy(qp.invert().multiply(qd).multiply(qw))
}
function giraLocal(nome, eixoMundo, ang) {
  var b = ossos[nome]; gata.updateMatrixWorld(true);
  var qw = b.getWorldQuaternion(new Q()), qd = new Q().setFromAxisAngle(eixoMundo, ang), qp = b.parent.getWorldQuaternion(new Q());
  b.quaternion.copy(qp.invert().multiply(qd).multiply(qw))
}
function ladoX(nome) { gata.updateMatrixWorld(true); return Math.sign(ossos[nome].getWorldPosition(new V()).x) || 1 }
function posOsso(nome) { gata.updateMatrixWorld(true); return ossos[nome].getWorldPosition(new V()) }
var PATA = { L: "L__FrontPaw", R: "R_FrontPaw" };

function gravaPose(nome, raizPos, raizQ, fn) {
  Object.keys(POSE.repouso.q).forEach(function (n) { ossos[n].quaternion.copy(POSE.repouso.q[n]) });
  gata.position.copy(raizPos); gata.quaternion.copy(raizQ); gata.updateMatrixWorld(true);
  fn();
  var q = {}; Object.keys(ossos).forEach(function (n) { q[n] = ossos[n].quaternion.clone() });
  POSE[nome] = { q: q, pos: raizPos.clone(), rq: raizQ.clone() }
}
/* mistura de duas poses; a raiz gira em torno do eixo longo (Z) para a virada de decúbito */
function aplicaPose(a, b, t, ang) {
  var A = POSE[a], B = POSE[b];
  Object.keys(A.q).forEach(function (n) { ossos[n].quaternion.copy(A.q[n]).slerp(B.q[n], t) });
  gata.position.lerpVectors(A.pos, B.pos, t);
  if (ang !== undefined) { gata.quaternion.setFromAxisAngle(P(0, 0, 1), ang); gata.position.y += .07 * Math.sin(PI * t) }
  else gata.quaternion.copy(A.rq).slerp(B.rq, t)
}

/* malha estática da gata em decúbito dorsal, para medir a superfície (altura da pele, do campo etc.) */
function assaPose() {
  gata.updateMatrixWorld(true);
  var m = partes.corpo; m.skeleton.update();
  var pos = m.geometry.attributes.position, n = pos.count, arr = new Float32Array(n * 3), v = new V();
  for (var i = 0; i < n; i++) { v.fromBufferAttribute(pos, i); m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z }
  var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr, 3)); g.setIndex(m.geometry.index);
  g.computeBoundingSphere(); corpoPosado = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  corpoPosado.updateMatrixWorld(true)
}
var _baixo = P(0, -1, 0);
function alturaPele(x, z, padrao) {
  raycaster.set(P(x, 1, z), _baixo); var h = raycaster.intersectObject(corpoPosado, false);
  return h.length ? h[0].point.y : (padrao === undefined ? -1 : padrao)
}

function carregaGata(pronto) {
  new THREE.GLTFLoader().parse(dec(GLB).buffer, "", function (g) {
    gata = g.scene; scene.add(gata);
    var MAPA = { "66D0F3B7": "corpo", "CFB4CB77": "rosto", "49EEE8A5": "pelo" }, tl = new THREE.TextureLoader();
    gata.traverse(function (o) {
      if (o.isBone) ossos[o.name] = o;
      if (o.isMesh) {
        o.frustumCulled = false; o.castShadow = true; o.receiveShadow = true;
        var mt = o.material, k = MAPA[mt.name]; partes[k === "rosto" ? "cabeca" : k === "pelo" ? "cauda" : "corpo"] = o;
        mt.envMapIntensity = .25; mt.roughness = .75;
        if (k && TEX[k]) { var t = tl.load(TEX[k]); t.flipY = false; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; mt.map = t }
        if (k !== "pelo") injetaGata(mt, k === "corpo");
        mt.needsUpdate = true
      }
    });
    Object.keys(ossos).forEach(eixo);
    var q0 = {}; Object.keys(ossos).forEach(function (n) { q0[n] = ossos[n].quaternion.clone() });
    POSE.repouso = { q: q0, pos: P(0, 0, 0), rq: new Q() };
    gravaPose("empe", P(0, 0, .02), new Q(), function () { mira("Head", P(0, .05, 1)); giraLocal("Head", P(0, 1, 0), -.25) });
    gravaPose("dorsal", P(0, .285, 0), new Q().setFromAxisAngle(P(0, 0, 1), PI), function () {
      mira("Back", P(0, .04, 1)); mira("Neck", P(0, .1, 1)); mira("Head", P(0, .75, 1));
      ["L", "R"].forEach(function (s) {
        var sx = ladoX(s + "_Shoulder");
        mira(s + "_Shoulder", P(sx * .5, -.45, 1)); mira(s + "_Arm", P(sx * .3, -.3, 1)); mira(PATA[s], P(sx * .25, -.35, 1));
        var tx = ladoX(s + "_Thigh");
        mira(s + "_Thigh", P(tx * .45, -.05, -1)); mira(s + "_Leg", P(tx * .25, -.2, -1)); mira(s + "_BackPaw", P(tx * .2, -.35, -1))
      });
      mira("Tail", P(0, -.12, -1)); mira("Tail1", P(.1, -.05, -1)); mira("Tail2", P(.2, 0, -1))
    });
    assaPose();
    /* esternal: deitada sobre a manta, patas dianteiras à frente, traseiras dobradas, cauda ao lado */
    gravaPose("esternal", P(0, -.083, .02), new Q(), function () {
      mira("Back", P(0, .02, 1)); mira("Neck", P(0, .75, 1)); mira("Head", P(0, .12, 1)); giraLocal("Head", P(0, 1, 0), -.35);
      ["L", "R"].forEach(function (s) {
        var sx = ladoX(s + "_Shoulder");
        mira(s + "_Shoulder", P(sx * .15, -.85, .5)); mira(s + "_Arm", P(sx * .05, -.12, 1)); mira(PATA[s], P(sx * .02, -.05, 1));
        var tx = ladoX(s + "_Thigh");
        mira(s + "_Thigh", P(tx * .35, -.35, 1)); mira(s + "_Leg", P(tx * .2, -.18, -1)); mira(s + "_BackPaw", P(tx * .05, -.05, -1))
      });
      mira("Tail", P(-.6, -.35, -1)); mira("Tail1", P(-1, 0, -.2)); mira("Tail2", P(-.6, 0, 1))
    });
    aplicaPose("empe", "empe", 0);
    pronto()
  }, function (e) { console.error(e) })
}
