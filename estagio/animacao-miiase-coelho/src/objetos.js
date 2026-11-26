/* ============================================================ objetos
   mosca (cena 2), lata de spray prata e a nuvem (cena 4), mancha de rifamicina no pano (cena 10).
   Cada objeto tem uma função que o põe no lugar a partir do tempo; fora do seu trecho, fica invisível. */

/* base ortonormal: frente f e cima n (mundo) -> quaternion de um objeto com +z para a frente e +y para cima */
var _bx = new V3(), _by = new V3(), _bz = new V3(), _mb = new THREE.Matrix4();
function orienta(obj, frente, cima) {
  _bz.copy(frente).normalize();
  _bx.crossVectors(cima, _bz); if (_bx.lengthSq() < 1e-6) _bx.set(1, 0, 0); _bx.normalize();
  _by.crossVectors(_bz, _bx).normalize();
  _mb.makeBasis(_bx, _by, _bz); obj.quaternion.setFromRotationMatrix(_mb);
}
/* curva de Bézier cúbica */
function bezier(a, b, c, d, k, alvo) {
  var m = 1 - k;
  return alvo.set(0, 0, 0).addScaledVector(a, m * m * m).addScaledVector(b, 3 * m * m * k).addScaledVector(c, 3 * m * k * k).addScaledVector(d, k * k * k);
}

/* ------------------------------------------------------------ mosca
   Corpo verde-azulado metálico, olhos castanho-avermelhados, asas translúcidas e seis patas. Cerca de 1,1 u
   (1,7 cm): um pouco maior que a real, para aparecer na tela. +z é a frente, +y é o dorso, os pés ficam em y = 0. */
var MOSCA = (function () {
  var g = new THREE.Group();
  var metal = M(0x2b7466, { metalness: .7, roughness: .3, envMapIntensity: 1.6 });
  var escuro = M(0x1b1e1d, { roughness: .55 });
  var olhoM = M(0x8e3420, { roughness: .32, envMapIntensity: 1.2 });
  function bola(mt, sx, sy, sz, x, y, z, pai) { var b = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), mt); b.scale.set(sx, sy, sz); b.position.set(x, y, z); (pai || g).add(b); return b; }
  bola(metal, .2, .17, .24, 0, .27, .03);                         /* tórax */
  var abd = new THREE.Group(); abd.position.set(0, .27, -.16); g.add(abd);
  bola(metal, .21, .16, .3, 0, -.02, -.24, abd);                  /* abdome, preso pela junta: dobra para pôr os ovos */
  bola(escuro, .17, .15, .12, 0, .27, .32);                       /* cabeça */
  bola(olhoM, .1, .12, .09, -.1, .3, .35); bola(olhoM, .1, .12, .09, .1, .3, .35);
  /* asas: elipses translúcidas, presas no alto do tórax */
  var forma = new THREE.Shape(); forma.absellipse(0, -.32, .12, .33, 0, TAU, false, 0);
  var geoAsa = new THREE.ShapeGeometry(forma, 20); geoAsa.rotateX(-PI / 2);   /* deitada no plano xz, apontando para trás */
  var matAsa = new THREE.MeshStandardMaterial({ color: 0xe3e9ec, transparent: true, opacity: .38, roughness: .2, metalness: .1, side: THREE.DoubleSide, depthWrite: false });
  var asas = [-1, 1].map(function (s) {
    var piv = new THREE.Group(); piv.position.set(s * .07, .42, .06); g.add(piv);
    var a = new THREE.Mesh(geoAsa, matAsa); a.position.x = s * .1; a.rotation.y = s * .22; piv.add(a);
    return { piv: piv, s: s };
  });
  /* patas: coxa para fora e para cima, canela até o chão */
  var matPata = M(0x141615, { roughness: .6 });
  function haste(a, b) {
    var d = new V3().subVectors(b, a), h = new THREE.Mesh(new THREE.CylinderGeometry(.018, .014, d.length(), 5), matPata);
    h.position.copy(a).add(b).multiplyScalar(.5); h.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); g.add(h);
  }
  [.16, .03, -.1].forEach(function (z, i) {
    [-1, 1].forEach(function (s) {
      var raizP = new V3(s * .1, .18, z), joelho = new V3(s * .3, .26, z + (1 - i) * .08), pe = new V3(s * .36, 0, z + (1 - i) * .2);
      haste(raizP, joelho); haste(joelho, pe);
    });
  });
  g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  g.visible = false; cena3d.add(g);
  return { g: g, abd: abd, asas: asas };
})();
function asasMosca(voando, t) {
  MOSCA.asas.forEach(function (A) {
    if (voando) { A.piv.rotation.set(0, A.s * .15, A.s * (.25 + .85 * Math.sin(t * TAU * 17))); }
    else { A.piv.rotation.set(0, A.s * .05, A.s * .06); }
  });
}

/* ------------------------------------------------------------ lata de spray prata (genérica, sem marca)
   Eixo +y, bico virado para +z. Cerca de 9 u de altura (13 cm). */
var LATA = (function () {
  var g = new THREE.Group();
  var corpoL = lathe([[0, 0], [1.42, 0], [1.5, .18], [1.5, 7.3], [1.36, 7.9], [.95, 8.5], [.55, 8.75], [.5, 8.95], [0, 8.95]],
    M(0xc9cdd2, { metalness: .9, roughness: .26, envMapIntensity: 1.3 }), 40);
  g.add(corpoL);
  /* rótulo: faixa escura com um filete prata, sem texto */
  var tex = texCanvas(256, 128, function (c, w, h) {
    c.fillStyle = "#33414f"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#b9bfc6"; c.fillRect(0, h * .62, w, h * .07);
    c.fillStyle = "#8f9aa5"; c.fillRect(0, h * .2, w, h * .04);
  });
  var rot = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 4.6, 40, 1, true), new THREE.MeshStandardMaterial({ map: tex, roughness: .5, metalness: .2 }));
  rot.position.y = 3.6; g.add(rot);
  /* válvula e atuador com o bico */
  var atu = new THREE.Group(); atu.position.y = 8.95; g.add(atu);
  var cap = new THREE.Mesh(new THREE.CylinderGeometry(.48, .52, .7, 24), M(0x2b2f33, { roughness: .45 })); cap.position.y = .35; atu.add(cap);
  var bico = new THREE.Mesh(new THREE.CylinderGeometry(.1, .12, .32, 12), M(0x15181a, { roughness: .4 }));
  bico.rotation.x = PI / 2; bico.position.set(0, .45, .5); atu.add(bico);
  sombras(g);
  g.visible = false; cena3d.add(g);
  return { g: g, atu: atu, bicoLocal: new V3(0, 9.4, .68) };
})();

/* ------------------------------------------------------------ nuvem do spray: partículas, todas funções do tempo */
var NUVEM = (function () {
  var N = 560, pos = new Float32Array(N * 3), tam = new Float32Array(N), alfa = new Float32Array(N), sem = [];
  semente = 77;
  for (var i = 0; i < N; i++) sem.push({ nasce: i / N, ang: rnd() * TAU, abre: Math.sqrt(rnd()), alc: .82 + rnd() * .3, tam: .7 + rnd() * .8, gira: rnd() * TAU });
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
  g.setAttribute("aAlfa", new THREE.BufferAttribute(alfa, 1));
  var tx = texCanvas(64, 64, function (c, w, h) {
    var gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.45, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  }, null, true);
  var mat = new THREE.ShaderMaterial({
    uniforms: { uMapa: { value: tx }, uEscala: { value: 400 } },
    vertexShader: "attribute float aTam, aAlfa; varying float vA; uniform float uEscala;" +
      "void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = aTam * uEscala / -mv.z; vA = aAlfa; }",
    fragmentShader: "uniform sampler2D uMapa; varying float vA;" +
      "void main(){ float a = texture2D(uMapa, gl_PointCoord).a; gl_FragColor = vec4(vec3(.7,.72,.76), a * vA); }",
    transparent: true, depthWrite: false
  });
  var p = new THREE.Points(g, mat); p.frustumCulled = false; p.renderOrder = 40; p.visible = false; cena3d.add(p);
  return { p: p, sem: sem, N: N };
})();
var _np = new V3(), _nd = new V3(), _n1 = new V3(), _n2 = new V3();
/* u: tempo da cena 4; de: bico (mundo); para: alvo (mundo) */
function nuvem(u, de, para, ini, dur) {
  var S2 = NUVEM, at = S2.p.geometry.attributes, vis = false;
  _nd.subVectors(para, de); var D = _nd.length(); _nd.normalize();
  _n1.crossVectors(_nd, _y); if (_n1.lengthSq() < 1e-4) _n1.set(1, 0, 0); _n1.normalize(); _n2.crossVectors(_nd, _n1);
  for (var i = 0; i < S2.N; i++) {
    var q = S2.sem[i], idade = u - (ini + q.nasce * dur), vida = 1.5;
    if (idade < 0 || idade > vida) { at.aAlfa.array[i] = 0; continue; }
    vis = true;
    var anda = D * q.alc * (1 - Math.exp(-4.2 * idade)) / (1 - Math.exp(-4.2 * vida));
    var abre = (.16 * anda + 1.6 * Math.sqrt(idade)) * q.abre;
    _np.copy(de).addScaledVector(_nd, anda)
      .addScaledVector(_n1, Math.cos(q.ang + idade * .8) * abre).addScaledVector(_n2, Math.sin(q.ang + idade * .8) * abre);
    _np.y += Math.sin(q.gira + idade * 3) * .3 - idade * .6;
    at.position.array[i * 3] = _np.x; at.position.array[i * 3 + 1] = _np.y; at.position.array[i * 3 + 2] = _np.z;
    at.aTam.array[i] = q.tam * (.5 + 2.6 * Math.sqrt(idade));
    at.aAlfa.array[i] = Math.min(1, idade / .07) * Math.pow(1 - idade / vida, 1.4) * .5;
  }
  at.position.needsUpdate = at.aTam.needsUpdate = at.aAlfa.needsUpdate = true;
  S2.p.visible = vis;
  S2.p.material.uniforms.uEscala.value = palco.clientHeight * ren.getPixelRatio() / (2 * Math.tan(cam.fov * PI / 360));
}

/* ------------------------------------------------------------ mancha de rifamicina no pano (cena 10)
   Usa a mesma malha do pano (com as dobras), por cima dele; a textura cobre o pano inteiro e a mancha fica
   embaixo da garupa (mundo z ≈ -3, ou seja, v ≈ 0,54 na textura do pano). */
var MANCHA = (function () {
  var tx = texCanvas(512, 512, function (c, w, h) {
    semente = 13;
    for (var i = 0; i < 120; i++) {
      var a = rnd() * TAU, r = Math.pow(rnd(), .7) * w * .1, x = w * .5 + Math.cos(a) * r * 1.2, y = h * .46 + Math.sin(a) * r, rr = 6 + rnd() * 20;
      var gr = c.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, "rgba(214,118,28,.55)"); gr.addColorStop(1, "rgba(230,152,40,0)");
      c.fillStyle = gr; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
    }
  });
  var m = new THREE.Mesh(AMB.pano.geometry, new THREE.MeshStandardMaterial({ map: tx, transparent: true, opacity: 0, roughness: .95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.copy(AMB.pano.rotation); m.position.copy(AMB.pano.position); m.renderOrder = 2; AMB.mesa.add(m);
  return m;
})();
