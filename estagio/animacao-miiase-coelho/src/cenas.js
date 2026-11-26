/* ============================================================ estado no tempo */
var DBG = (function () {
  var q = location.search, o = {};
  var m = /[?&]cam=([-\d.,]+)/.exec(q); if (m) o.cam = m[1].split(",").map(parseFloat);
  m = /[?&]dbg=(\w+)/.exec(q); if (m) o.modo = m[1];
  m = /[?&]rot=([^&]+)/.exec(q); if (m) o.rot = decodeURIComponent(m[1]).split(";").map(function (x) { var k = x.split(","); return [k[0], +k[1] || 0, +k[2] || 0, +k[3] || 0]; });
  m = /[?&]raiz=([-\d.,]+)/.exec(q); if (m) o.raiz = m[1].split(",").map(parseFloat);
  m = /[?&]u=([^&]+)/.exec(q); if (m) o.u = decodeURIComponent(m[1]).split(";").map(function (x) { var k = x.split(":"); return [k[0], k[1].split(",").map(parseFloat)]; });
  m = /[?&]lente=(\w+)/.exec(q); if (m) o.lente = m[1];
  m = /[?&]amb=(\w+)/.exec(q); if (m) o.amb = m[1];
  return o;
})();

/* decúbito esternal (cenas 1 a 9): o corpo desce até a barriga encostar no chão (o que passa do chão é
   cortado pelo plano CHAO), as patas se recolhem e as orelhas deitam para trás, sobre o dorso */
var DEITA_Y = -3.6;
function poseDeitado(t) {
  raiz.position.set(0, DEITA_Y, 0); raiz.rotation.set(0, 0, 0);
  gira("Ear_R", 0, .95, .12 + .03 * Math.sin(t * 1.3));
  gira("Ear_L", 0, .95, .12 + .03 * Math.sin(t * 1.1 + 1));
  gira("frontHip_R", 0, 0, .5); gira("frontHip_L", 0, 0, .5);
  gira("backHip_R", 0, 0, -.5); gira("backHip_L", 0, 0, -.5);
  gira("Neck_M", 0, 0, .12);
  /* respiração (0,9 Hz): o tórax sobe e alarga um pouco */
  var r = Math.sin(t * TAU * .9);
  corpo.scale.set(1 + .012 * r, 1 + .018 * r, 1);
}

function estado(t) {
  ambienteVisivel(DBG.amb || "estudio");
  if (!CO.ok) return;
  repouso();
  U.uTempo.value = t;
  poseDeitado(t);
  if (DBG.rot) DBG.rot.forEach(function (r) { gira(r[0], r[1], r[2], r[3]); });
  if (DBG.u) DBG.u.forEach(function (r) { var v = U[r[0]].value; if (typeof v === "number") U[r[0]].value = r[1][0]; else v.set(r[1][0], r[1][1], r[1][2]); });
  if (DBG.lente) { U.uLensC.value.copy(LENTES[DBG.lente].c); U.uLensR.value = LENTES[DBG.lente].r; }
  if (DBG.raiz) { raiz.position.set(DBG.raiz[0], DBG.raiz[1], DBG.raiz[2]); raiz.rotation.set(DBG.raiz[3] || 0, DBG.raiz[4] || 0, DBG.raiz[5] || 0); }
}

var _g = new V3(), _m3 = new THREE.Matrix3(), _pos = new V3(), _nor = new V3();
function depoisDaPose(t) {
  if (!CO.ok) return;
  /* gravidade no espaço do objeto, para o pelo cair */
  _m3.setFromMatrix4(CO.sk.matrixWorld).invert();
  U.uGrav.value.set(0, -1, 0).applyMatrix3(_m3).normalize();
  /* olhos */
  CO.olhos.forEach(function (O) { pontoMundo(O.bind, O.m.position); });
  /* larvas e ovos: escondidos por enquanto */
  larvas.count = 0; ovos.count = 0;
  if (DBG.cam) { var c = DBG.cam; cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); }
}

/* tomadas provisórias */
tomada(0, "estudio", [48, 22, 30], [0, 9, 0], 30);
