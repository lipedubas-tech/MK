
/* ============================================================ mesa de instrumentais (fotos 3 e 7)
   Bandeja de inox coberta com campo creme: gazes, cabo de bisturi, pinças, envelope de fio 3-0
   e o frasco de formol com etiqueta. A peça cai na gaze (cena 7) e depois vai para o frasco (cena 10). */
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
/* frasco de formol: pote transparente, líquido, tampa branca de rosca e etiqueta */
var frasco = new THREE.Group(); frasco.position.set(-.16, 0, -.06); bandeja.add(frasco);
var tampaFrasco;
(function () {
  var vidro = new THREE.Mesh(new THREE.CylinderGeometry(.068, .065, .1, 48, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .06, metalness: 0, transparent: true, opacity: .26, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }));
  vidro.position.y = .05; frasco.add(vidro);
  var fundo = new THREE.Mesh(new THREE.CircleGeometry(.065, 48), new THREE.MeshPhysicalMaterial({ color: 0xeef6f8, roughness: .1, transparent: true, opacity: .5 })); fundo.rotation.x = -PI / 2; fundo.position.y = .001; frasco.add(fundo);
  var liq = new THREE.Mesh(new THREE.CylinderGeometry(.0655, .063, .07, 48), new THREE.MeshPhysicalMaterial({ color: 0xe9f3d8, roughness: .05, transparent: true, opacity: .32, depthWrite: false }));
  liq.position.y = .036; frasco.add(liq); frasco.userData.liq = liq;
  tampaFrasco = new THREE.Group();
  var tp = lathe([[0, 0], [.07, 0], [.0705, .004], [.0705, .02], [.068, .022], [0, .023]], M(0xf4f4f2, { roughness: .45 }), 48); tampaFrasco.add(tp);
  var matRan = M(0xe2e2df, { roughness: .5 }); for (var i = 0; i < 64; i++) { var r = new THREE.Mesh(new THREE.BoxGeometry(.0016, .013, .002), matRan); var a = i / 64 * TAU; r.position.set(Math.cos(a) * .0708, .012, Math.sin(a) * .0708); r.rotation.y = -a; tampaFrasco.add(r); }
  frasco.add(tampaFrasco);
  var texEt = texCanvas(512, 256, function (g, w, h) {
    g.fillStyle = "#fffdf6"; g.fillRect(0, 0, w, h); g.fillStyle = "#c0392b"; g.fillRect(0, 0, w, 44);
    g.fillStyle = "#fff"; g.font = "bold 30px sans-serif"; g.fillText("FORMOL 10%", 18, 32);
    g.fillStyle = "#1b2836"; g.font = "bold 30px sans-serif"; g.fillText("Histopatológico", 18, 92);
    g.font = "24px sans-serif"; g.fillText("Cão · fêmea · SRD", 18, 134); g.fillText("Nódulo ulcerado, reg. axilar", 18, 170); g.fillText("Coleta: 17/11/2026", 18, 206);
    g.strokeStyle = "#c9c2b0"; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
  });
  texEt.wrapS = THREE.ClampToEdgeWrapping;
  var et = new THREE.Mesh(new THREE.CylinderGeometry(.0685, .0675, .052, 48, 1, true, -PI * .3, PI * .6), new THREE.MeshLambertMaterial({ map: texEt, transparent: false }));
  et.position.y = .045; frasco.add(et);
  frasco.traverse(function (o) { if (o.isMesh && o !== vidro && o !== liq) o.castShadow = true; });
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
var adsonB = pincaDente(); adsonB.visible = false; bandeja.add(adsonB);

function poseBandeja(t) {
  var s7 = S[6], s10 = S[9];
  var cai = sai(seg(t, s7 + 4.8, s7 + 6.4));
  /* posição na gaze, de cabeça para baixo um pouco (mostra o nódulo e a pele) */
  var naGaze = new V3(0, .0185, .07);   /* a base da peça (gordura) encosta na gaze */
  var pega = eio(seg(t, s10 + .8, s10 + 2.2)), leva = eio(seg(t, s10 + 2.2, s10 + 3.4)), afunda = eio(seg(t, s10 + 3.4, s10 + 4.4));
  var noFrasco = frasco.position.clone().add(new V3(0, .028, 0));
  var p = naGaze.clone();
  if (t < s10) { p.y += (1 - cai) * .14; pecaBandeja.rotation.set(-.15 * (1 - cai), .5, .05 * cai); }
  else {
    var alto = naGaze.clone().lerp(noFrasco.clone().add(new V3(0, .1, 0)), leva); alto.y = lerp(naGaze.y, noFrasco.y + .1, Math.max(pega * .6, leva));
    p = afunda > 0 ? noFrasco.clone().add(new V3(0, .1 * (1 - afunda), 0)) : alto;
    pecaBandeja.rotation.set(-.15 * pega, .5 + .6 * leva, lerp(.05, .3, leva));
  }
  pecaBandeja.position.copy(p);
  pecaBandeja.visible = t >= s7 + 4.7;
  /* tampa: fica ao lado do frasco e rosqueia depois que a peça afunda */
  var fecha = eio(seg(t, s10 + 4.5, s10 + 5.6));
  tampaFrasco.position.set(lerp(.075, 0, fecha), lerp(.0, .09, fecha) + .002 * Math.sin(fecha * PI), lerp(.03, 0, fecha));
  tampaFrasco.rotation.set(lerp(PI, 0, Math.min(1, fecha * 1.4)), fecha * 3 * TAU, 0);
  /* pinça que leva a peça ao frasco */
  adsonB.visible = t > s10 + .5 && t < s10 + 3.8;
  if (adsonB.visible) {
    var ponta = p.clone().add(new V3(.012, .008, 0)); ponta.y += .04 * (1 - ss(s10 + .5, s10 + .9, t));
    var Y = new V3(.35, .9, .25).normalize(), Z = new V3().crossVectors(new V3(1, 0, 0), Y).normalize(), X = new V3().crossVectors(Y, Z);
    adsonB.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); adsonB.position.copy(ponta);
    adsonB.userData.abre(1 - ss(s10 + .9, s10 + 1.2, t) + ss(s10 + 3.3, s10 + 3.5, t));
  }
}
(function () {
  var s = S;
  tomada(s[6] + 4.6, "bandeja", [.04, .42, .5], [-.05, .0, .01], 30, true);
  tomada(s[6] + 8.8, "bandeja", [.03, .34, .4], [-.03, .0, .03], 30);
  tomada(s[9], "bandeja", [.06, .38, .44], [-.05, .02, .0], 30, true);
  tomada(s[9] + 4.2, "bandeja", [-.02, .34, .4], [-.12, .03, -.04], 30);
  tomada(s[9] + 7.8, "bandeja", [-.04, .3, .36], [-.13, .035, -.05], 30);
})();
rotulo(S[6] + 6.4, S[6] + 9, "bandeja", "Peça cirúrgica", "nódulo ulcerado e pele retirados em bloco", function () { return pecaBandeja.position.clone().add(new V3(0, .012, 0)); }, 12, -8);
rotulo(S[9] + 5.4, S[9] + 8, "bandeja", "Formol 10%", "volume cerca de 10 vezes o da peça", function () { return frasco.position.clone().add(new V3(0, .06, .04)); }, 13, -9);
rotulo(S[9] + 5.9, S[9] + 8, "bandeja", "Laboratório de patologia →", "o diagnóstico vem do laudo histopatológico", function () { return frasco.position.clone().add(new V3(.03, .02, .03)); }, 15, 5);
