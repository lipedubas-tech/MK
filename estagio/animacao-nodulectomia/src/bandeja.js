
/* ============================================================ mesa de instrumentais (fotos 3 e 7)
   Bandeja de inox coberta com campo creme: gazes, cabo de bisturi, pinças e envelope de fio 3-0.
   A peça cai na gaze na cena 7 e fica ali. Não houve formol neste caso (correção do Felipe, 19/11),
   então a mesa não tem frasco e não há cena de histopatológico. */
var bandeja = new THREE.Scene();
var luzBandeja = luzes(bandeja, new V3(0, 0, 0), .32);
(function () {
  var tampo = new THREE.Mesh(new THREE.BoxGeometry(.62, .02, .44), M(0xc9ced3, { metalness: .85, roughness: .3 }));
  tampo.position.y = -.012; tampo.receiveShadow = true; bandeja.add(tampo);
  [[0, .29], [0, -.29]].forEach(function () {});
  var borda = new THREE.Mesh(new THREE.BoxGeometry(.62, .03, .012), ACO2);
  [[.0, -.005, .226], [.0, -.005, -.226]].forEach(function (p) { var b = borda.clone(); b.position.set(p[0], p[1], p[2]); bandeja.add(b); });
  var borda2 = new THREE.Mesh(new THREE.BoxGeometry(.012, .03, .44), ACO2);
  [[.316, -.005, 0], [-.316, -.005, 0]].forEach(function (p) { var b = borda2.clone(); b.position.set(p[0], p[1], p[2]); bandeja.add(b); });
  /* campo creme sobre a bandeja */
  var geo = new THREE.PlaneGeometry(.6, .42, 60, 42); geo.rotateX(-PI / 2); var p = geo.attributes.position;
  for (var i = 0; i < p.count; i++) { var x = p.getX(i), z = p.getZ(i); p.setY(i, .0015 * Math.sin(x * 40 + z * 13) * Math.sin(z * 31 - x * 7) + .0008 * Math.sin(x * 97 + z * 71)); }
  geo.computeVertexNormals();
  var pano2 = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: texPano })); pano2.receiveShadow = true; bandeja.add(pano2);
  /* gazes dobradas */
  [[.12, .0, -.11, .3], [.17, .0, -.06, -.2]].forEach(function (q) { var gz = gaze(.07, .07, .0015); gz.position.set(q[0], q[1] + .003, q[2]); gz.rotation.y = q[3]; bandeja.add(gz); });
  /* instrumental deitado (cabo de bisturi, hemostáticas, pinça, porta-agulhas) */
  var b1 = bisturi(); b1.rotation.set(-PI / 2, 0, .35); b1.position.set(-.05, .004, .02); bandeja.add(b1);
  [[.07, .1, .2], [.1, .11, .05], [.13, .095, -.1]].forEach(function (q, k) {
    var h = pinca(k === 2 ? "porta" : "kelly"); h.userData.abre(0); h.rotation.set(-PI / 2, 0, PI + q[2]); h.position.set(q[0], .004, q[1]); bandeja.add(h);
  });
  var ad = pincaDente(); ad.userData.abre(1); ad.rotation.set(-PI / 2, 0, PI - .15); ad.position.set(-.12, .003, .1); bandeja.add(ad);
  /* envelope do fio 3-0 */
  var texEnv = texCanvas(256, 128, function (g, w, h) {
    g.fillStyle = "#f4f2ee"; g.fillRect(0, 0, w, h); g.fillStyle = "#2f6f3f"; g.fillRect(0, 0, w, 26);
    g.fillStyle = "#fff"; g.font = "bold 18px sans-serif"; g.fillText("NÁILON", 10, 19);
    g.fillStyle = "#222"; g.font = "bold 46px sans-serif"; g.fillText("3-0", 12, 82); g.font = "16px sans-serif"; g.fillText("agulha 3/8 · 45 cm", 12, 110);
  });
  var env = new THREE.Mesh(new THREE.BoxGeometry(.075, .002, .038), [ACO2, ACO2, new THREE.MeshLambertMaterial({ map: texEnv }), M(0xe8e6e0), M(0xe8e6e0), M(0xe8e6e0)]);
  env.position.set(.2, .002, .13); env.rotation.y = -.25; env.castShadow = true; bandeja.add(env);
})();
/* peça sobre a gaze: cópia estática da peça do campo (pele + gordura + nódulo) */
var pecaBandeja = new THREE.Group(); bandeja.add(pecaBandeja);
(function () {
  var guarda = Object.assign({}, F);
  F.dInc = .017; F.gO = .0042; F.gI = .0018; F.kB = 1; F.rem = 1;
  atualizaLente(ilhaTopo, "topo"); atualizaParede(paredeDentro); atualizaLente(pecaFundo, "fundo");
  [ilhaTopo, paredeDentro, pecaFundo].forEach(function (m) {
    var mt = m.material === matTopo ? matTopoLivre : matLadoLivre;
    var c = new THREE.Mesh(m.geometry.clone(), mt); c.castShadow = true; c.receiveShadow = true; pecaBandeja.add(c);
  });
  /* a massa ulcerada fica em cima da pele, como na foto 7 */
  var nd = new THREE.Mesh(GEO_NOD, matNodulo()); nd.position.set(0, K.nc, 0); nd.castShadow = true; pecaBandeja.add(nd);
  Object.assign(F, guarda);
  pecaBandeja.scale.setScalar(.7);
})();
var gazePeca = gaze(.14, .1, .0012); gazePeca.position.set(.0, .003, .07); gazePeca.rotation.y = .5; bandeja.add(gazePeca);

function poseBandeja(t) {
  var s7 = S[6];
  var cai = sai(seg(t, s7 + 4.8, s7 + 6.4));
  /* a peça cai na gaze e fica ali, com o nódulo para cima (fotos 3 e 7); a base (gordura) encosta na gaze */
  pecaBandeja.position.set(0, .0185 + (1 - cai) * .14, .07);
  pecaBandeja.rotation.set(-.15 * (1 - cai), .5, .05 * cai);
  pecaBandeja.visible = t >= s7 + 4.7;
}
(function () {
  var s = S;
  tomada(s[6] + 4.6, "bandeja", [.04, .42, .5], [-.05, .0, .01], 30, true);
  tomada(s[6] + 8.8, "bandeja", [.03, .34, .4], [-.03, .0, .03], 30);
})();
rotulo(S[6] + 6.4, S[6] + 9, "bandeja", "Peça cirúrgica", "nódulo ulcerado e pele retirados em bloco", function () { return pecaBandeja.position.clone().add(new V3(0, .012, 0)); }, 12, -8);
