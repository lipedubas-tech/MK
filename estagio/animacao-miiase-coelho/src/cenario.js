/* ============================================================ ambientes
   estúdio (cenas 1 a 4): só a sombra no chão, sobre o fundo do palco;
   mesa (cenas 5 a 10): granito e pano branco, como nas fotos;
   baia (cena 11): parede, porta de vidro, manta verde-acinzentada e o pote de ração. */
var AMB = {};

/* estúdio: chão invisível que só recebe sombra, e uma sombra de contato macia */
AMB.estudio = (function () {
  var g = new THREE.Group();
  var chao = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: .22 }));
  chao.rotation.x = -PI / 2; chao.receiveShadow = true; g.add(chao);
  g.add(sombraContato(34, 26, .42));
  cena3d.add(g); return g;
})();
function sombraContato(lx, lz, op) {
  var tx = texCanvas(128, 128, function (c, w, h) {
    var gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(.55, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  }, null, true);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(lx, lz), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: op, depthWrite: false, color: 0x000000 }));
  m.rotation.x = -PI / 2; m.position.set(0, .06, 3); m.renderOrder = -1; return m;   /* sob o corpo deitado (do rabo, z -7, ao focinho, z 16) */
}

/* mesa de granito com o pano branco */
var texGranito = texCanvas(1024, 1024, function (c, w, h) {
  /* granito das fotos: fundo cinza-amarronzado, pintas pretas densas e grãos bege, pequenos e irregulares */
  c.fillStyle = "#6f675e"; c.fillRect(0, 0, w, h);
  semente = 5;
  var cores = ["#1d1b19", "#1d1b19", "#2a2724", "#2a2724", "#c2b29a", "#a89a86", "#585049", "#8a8075"];
  for (var i = 0; i < 70000; i++) {
    var x = rnd() * w, y = rnd() * h, r = .5 + Math.pow(rnd(), 2.4) * 4.2, k = Math.floor(rnd() * cores.length);
    c.fillStyle = cores[k]; c.globalAlpha = .6 + rnd() * .4;
    c.beginPath();
    /* grão poligonal, não círculo */
    var lados = 4 + Math.floor(rnd() * 3), a0 = rnd() * TAU;
    for (var j = 0; j < lados; j++) { var a = a0 + j / lados * TAU, rr = r * (.55 + rnd() * .7); c[j ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.fill();
  }
  c.globalAlpha = 1;
}, [3, 3]);
var texPano = texCanvas(512, 512, function (c, w, h) {
  c.fillStyle = "#f4f1ea"; c.fillRect(0, 0, w, h);
  c.globalAlpha = .07; c.fillStyle = "#8a8170";
  for (var y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  for (var x = 0; x < w; x += 3) c.fillRect(x, 0, 1, h);
  c.globalAlpha = 1;
}, [6, 6]);
AMB.mesa = (function () {
  var g = new THREE.Group();
  var tampo = new THREE.Mesh(new THREE.BoxGeometry(220, 5, 120), new THREE.MeshStandardMaterial({ map: texGranito, roughness: .28, metalness: 0, envMapIntensity: .9 }));
  tampo.position.set(0, -2.5, 0); tampo.receiveShadow = true; g.add(tampo);
  /* pano dobrado, com rugas */
  var gp = new THREE.PlaneGeometry(56, 46, 90, 74), p = gp.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i);
    var z = .35 + .5 * Math.max(0, Math.sin(x * .21 + y * .05) * Math.sin(y * .17 - x * .04)) + .25 * Math.sin(x * .9 + y * .3) * Math.sin(y * .7);
    z += 1.1 * Math.exp(-Math.pow((y + 9) / 2.2, 2)) * (.6 + .4 * Math.sin(x * .3));   /* uma dobra larga atravessando o pano */
    p.setZ(i, Math.max(.15, z));
  }
  gp.computeVertexNormals();
  /* cor abaixo do branco puro, para o pano não estourar na exposição e mostrar dobras e sombra */
  var matPano = new THREE.MeshStandardMaterial({ map: texPano, color: 0xa8a49c, roughness: .95, metalness: 0, side: THREE.DoubleSide, envMapIntensity: .6 });
  var pano = new THREE.Mesh(gp, matPano); pano.rotation.x = -PI / 2; pano.position.set(0, 0, -1); pano.receiveShadow = true; g.add(pano);
  AMB.pano = pano; AMB.matPano = matPano;
  g.add(sombraContato(30, 24, .3));
  cena3d.add(g); g.visible = false; return g;
})();

/* baia do internamento */
var texManta = texCanvas(512, 512, function (c, w, h) {
  c.fillStyle = "#8f9a86"; c.fillRect(0, 0, w, h);
  semente = 9;
  for (var i = 0; i < 9000; i++) { c.fillStyle = rnd() < .5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"; c.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 5); }
}, [4, 4]);
AMB.baia = (function () {
  var g = new THREE.Group();
  var parede = M(0x9aa0a4, { roughness: .45, metalness: .15 });
  var fundo = new THREE.Mesh(new THREE.BoxGeometry(110, 70, 1), parede); fundo.position.set(0, 33, -26); fundo.receiveShadow = true; g.add(fundo);
  var lado = new THREE.Mesh(new THREE.BoxGeometry(1, 70, 60), parede); lado.position.set(42, 33, 2); lado.receiveShadow = true; g.add(lado);
  var piso = new THREE.Mesh(new THREE.BoxGeometry(110, 2, 60), M(0x7d8387, { roughness: .6 })); piso.position.set(0, -1.6, 2); piso.receiveShadow = true; g.add(piso);
  /* porta de vidro à esquerda, com a dobradiça */
  var vidro = new THREE.Mesh(new THREE.BoxGeometry(.6, 70, 50), new THREE.MeshPhysicalMaterial({ color: 0xdfe9ea, roughness: .05, metalness: 0, transmission: .0, transparent: true, opacity: .18 }));
  vidro.position.set(-40, 33, 4); g.add(vidro);
  var dob = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8, 3), ACO2); dob.position.set(-39.5, 30, -18); g.add(dob);
  /* manta com dobras */
  var gm = new THREE.PlaneGeometry(76, 52, 80, 60), p = gm.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i);
    p.setZ(i, .6 + .9 * Math.sin(x * .16 + 1) * Math.sin(y * .19) + .5 * Math.sin(x * .41 + y * .23) + 1.6 * Math.exp(-Math.pow((x + 30) / 5, 2)));
  }
  gm.computeVertexNormals();
  var manta = new THREE.Mesh(gm, new THREE.MeshStandardMaterial({ map: texManta, roughness: 1, metalness: 0 }));
  manta.rotation.x = -PI / 2; manta.position.set(0, -.4, 0); manta.receiveShadow = true; g.add(manta);
  /* pote de inox com pellets */
  var pote = lathe([[0, 0], [5.4, 0], [6.2, .3], [7.6, 3.2], [7.9, 3.4], [7.4, 3.5], [6.0, .8], [0, .8]], ACO, 40);
  pote.position.set(0, .2, 11); pote.scale.setScalar(.75); sombras(pote, true); g.add(pote);
  var pel = new THREE.InstancedMesh(new THREE.CylinderGeometry(.32, .32, .9, 8), M(0x4a3c22, { roughness: .9, envMapIntensity: .3 }), 110);
  semente = 21; var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (var k = 0; k < 110; k++) {
    var a = rnd() * TAU, r = Math.sqrt(rnd()) * 5.6;
    e.set(rnd() * PI, rnd() * PI, rnd() * PI); q.setFromEuler(e);
    m4.compose(new V3(Math.cos(a) * r, 1.2 + rnd() * 1.1, Math.sin(a) * r), q, new V3(1, 1, 1));
    pel.setMatrixAt(k, m4);
  }
  pel.position.copy(pote.position); pel.scale.setScalar(.75); g.add(pel);
  AMB.pote = pote;
  cena3d.add(g); g.visible = false; return g;
})();
function ambienteVisivel(nome) {
  AMB.estudio.visible = nome === "estudio"; AMB.mesa.visible = nome === "mesa"; AMB.baia.visible = nome === "baia";
  palco.classList.toggle("escuro", nome === "baia");
}
