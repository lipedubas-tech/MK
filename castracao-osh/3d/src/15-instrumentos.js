/* ===== instrumentos cirúrgicos =====
   Mesma construção dos instrumentos da animação da Katita (haste plana com seção arredondada, aros, catraca).
   Desenhados em "unidades Katita" e escalados por ESC: eixo +Y = cabo, ponta de trabalho na origem,
   o instrumento fica no plano XY e as pontas abrem em X. */
var ESC = 1.05, box = new THREE.BoxGeometry(1, 1, 1);
var STL = MS(0xdfe4ea, { metalness: 1, roughness: .2, envMapIntensity: 1.3 }),     /* aço polido */
  SAT = MS(0xc8cfd7, { metalness: 1, roughness: .4, envMapIntensity: 1.15 }),       /* aço escovado */
  DST = MS(0x6d7680, { metalness: 1, roughness: .45, envMapIntensity: .9 }),        /* frestas */
  FIO = MS(0x5b47c9, { roughness: .45, metalness: 0, envMapIntensity: .6 });       /* fio de sutura azul-violeta */
var INS = new THREE.Group(); scene.add(INS);

function arm(pts, w, h, mt, n) {   /* haste plana no plano XY; w(t) meia-largura, h(t) meia-espessura */
  var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return P(p[0], p[1], 0) })), N = n || 40, R = 12, Ps = [], ix = [], T = new V();
  for (var i = 0; i <= N; i++) {
    var t = i / N, p = c.getPointAt(t); c.getTangentAt(t, T); var nx = -T.y, ny = T.x, ww = w(t), hh = h(t);
    for (var j = 0; j < R; j++) {
      var a = j / R * PI * 2, cs = Math.cos(a), sn = Math.sin(a), ex = Math.sign(cs) * Math.pow(Math.abs(cs), .72), ez = Math.sign(sn) * Math.pow(Math.abs(sn), .72);
      Ps.push(p.x + nx * ex * ww, p.y + ny * ex * ww, ez * hh)
    }
  }
  for (i = 0; i < N; i++) for (j = 0; j < R; j++) { var a1 = i * R + j, b1 = a1 + R, a2 = i * R + (j + 1) % R, b2 = a2 + R; ix.push(a1, b1, a2, b1, b2, a2) }
  var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(Ps, 3)); g.setIndex(ix); g.computeVertexNormals();
  var m = new THREE.Mesh(g, mt); m.castShadow = true; return m
}
function ends(t, a, b) { var s = 1; if (t < a) s = Math.sqrt(Math.max(0, 1 - Math.pow((a - t) / a, 2))); if (t > 1 - b) s = Math.min(s, Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + b) / b, 2)))); return Math.max(s, .08) }
function slab(sh, d, bv, mt) {
  var g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: bv > 0, bevelThickness: bv, bevelSize: bv, bevelSegments: 2, curveSegments: 18 });
  g.translate(0, 0, -d / 2); g.computeVertexNormals(); var m = new THREE.Mesh(g, mt); m.castShadow = true; return m
}
function poly(pts, holes) {
  var s = new THREE.Shape(); pts.forEach(function (p, i) { i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]) }); s.closePath();
  (holes || []).forEach(function (hp) { var hh = new THREE.Path(); hp.forEach(function (p, i) { i ? hh.lineTo(p[0], p[1]) : hh.moveTo(p[0], p[1]) }); hh.closePath(); s.holes.push(hh) }); return s
}
function oval(cx, cy, rx, ry, n) { var a = []; for (var i = 0; i < (n || 16); i++) { var t = i / (n || 16) * PI * 2; a.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]) } return a }
function ratchet(x0, y0, len, ang, n, mt) {
  var p = [[0, 0]]; for (var i = 0; i < n; i++) { p.push([len * (i + .55) / n, .0016]); p.push([len * (i + 1) / n, 0]) } p.push([len, -.0012]); p.push([0, -.0012]);
  var o = slab(poly(p), .0012, .0002, mt); o.position.set(x0, y0, 0); o.rotation.z = ang; return o
}
function aro(x, y, r, mt) { var rg = new THREE.Mesh(new THREE.TorusGeometry(r, .0012, 8, 28), mt); rg.scale.set(1, 1.25, 1); rg.position.set(x, y, 0); rg.castShadow = true; return rg }

/* instrumento de aros (pinça hemostática, tesoura, porta-agulha, Backhaus): dois braços que giram no pino */
function ramos(g, pt, YP, ponta, haste, aroXY, aroR, mt, catraca) {
  [1, -1].forEach(function (s) {
    var a = new THREE.Group(); a.position.y = YP;
    a.add(ponta(s));
    a.add(arm(haste.map(function (p) { return [-s * p[0], p[1]] }), function (t) { return (.0014 - .0003 * t) * ends(t, .02, .02) }, function () { return .0012 }, SAT, 30));
    a.add(aro(-s * aroXY[0], aroXY[1], aroR, SAT));
    if (catraca) a.add(ratchet(-s * catraca[0], s > 0 ? catraca[1] : catraca[1] + .003, catraca[2], s > 0 ? 0 : PI, 5, SAT));
    if (s > 0) pt.A = a; else pt.B = a; g.add(a)
  });
  var bx = new THREE.Mesh(box, SAT); bx.scale.set(.0042, .0046, .0026); bx.position.y = YP; g.add(bx)
}

function ferramenta(tipo) {
  var g = new THREE.Group(), pt = { tipo: tipo };
  if (tipo === "bisturi") {   /* lâmina nº 15 no cabo nº 3; o fio fica do lado +X */
    var bl = slab(poly([[0, 0], [.0016, .003], [.0036, .0075], [.0042, .012], [.0038, .0165], [.003, .0195], [-.0018, .0195], [-.0019, .012], [-.0012, .005]]), .00022, .00006, SAT); bl.position.z = .0015; g.add(bl);
    var ed = slab(poly([[0, 0], [.0016, .003], [.0036, .0075], [.0042, .012], [.0035, .012], [.0029, .0078], [.0011, .0034]]), .0003, 0, STL); ed.position.z = .0015; g.add(ed);
    var hd = slab(poly([[-.0016, .018], [.0022, .018], [.0024, .027], [.0038, .036], [.0038, .09], [.0032, .095], [0, .0965], [-.0032, .095], [-.0038, .09], [-.0038, .036], [-.0024, .027]]), .0015, .0005, SAT); g.add(hd);
    for (var gi = 0; gi < 10; gi++) { var gr = new THREE.Mesh(box, DST); gr.scale.set(.0058, .0007, .0029); gr.position.set(0, .052 + gi * .0026, 0); g.add(gr) }
  } else if (tipo === "hemostatica") {   /* pinça hemostática reta (tipo Halsted/Kelly), mordentes serrilhados */
    ramos(g, pt, .024, function (s) {
      var j = arm([[s * .0006, 0], [s * .0011, -.01], [s * .001, -.019], [s * .0004, -.024]], function (t) { return .0012 * (1 - .45 * t) * ends(t, .03, .04) }, function () { return .0011 }, STL, 30);
      for (var k = 0; k < 7; k++) { var sr = new THREE.Mesh(box, DST); sr.scale.set(.0002, .0006, .0018); sr.position.set(s * .0002, -.004 - k * .0028, 0); j.add(sr) }
      return j
    }, [[0, 0], [.003, .02], [.0062, .046], [.0082, .061]], [.0132, .0675], .0064, STL, [.0075, .052, .0085]);
  } else if (tipo === "tesoura") {   /* tesoura de Metzenbaum: lâminas largas de ponta romba */
    ramos(g, pt, .03, function (s) {
      var b = arm([[s * .0006, 0], [s * .0016, -.012], [s * .0014, -.024], [s * .0005, -.03]], function (t) { return .0021 * (1 - .55 * t) * ends(t, .02, .1) }, function () { return .00045 }, STL, 34);
      b.position.z = s * .00055; return b
    }, [[0, 0], [.0032, .022], [.0066, .05], [.0086, .066]], [.0134, .073], .0066, STL, null);
  } else if (tipo === "portaAgulha") {   /* porta-agulhas (tipo Mayo-Hegar) com agulha curva e fio */
    ramos(g, pt, .017, function (s) {
      return arm([[s * .0004, 0], [s * .0012, -.006], [s * .0011, -.012], [s * .0005, -.017]], function (t) { return .0016 * (1 - .35 * t) * ends(t, .02, .04) }, function () { return .0011 }, STL, 24)
    }, [[0, 0], [.0028, .02], [.006, .045], [.008, .06]], [.0128, .0662], .0068, STL, [.0074, .0515, .0085]);
    var nd = new THREE.Mesh(new THREE.TorusGeometry(.0058, .00032, 6, 28, PI * .75), STL); nd.rotation.set(PI / 2, 0, -PI * .42); nd.position.set(-.0006, .0004, .0034); g.add(nd); pt.agulha = nd;
  } else if (tipo === "gancho") {   /* gancho de ovariectomia (Snook): cabo achatado, haste e ponta em gancho com bolinha */
    var R = .0034, cabo = slab(poly(oval(0, .088, .0075, .028, 24)), .005, .0012, SAT); cabo.position.y = .0034; g.add(cabo);
    for (var gk = 0; gk < 8; gk++) { var sk = new THREE.Mesh(box, DST); sk.scale.set(.011, .0007, .0064); sk.position.set(0, .075 + gk * .0035, 0); g.add(sk) }
    var hs = new THREE.Mesh(new THREE.CylinderGeometry(.0012, .0013, .058, 14), STL); hs.position.y = .035; g.add(hs);
    var ar = new THREE.Mesh(new THREE.TorusGeometry(R, .0012, 10, 24, PI), STL); ar.rotation.z = PI; ar.position.set(R, .006, 0); g.add(ar);
    var bo = new THREE.Mesh(new THREE.SphereGeometry(.0016, 14, 10), STL); bo.position.set(2 * R, .0072, 0); g.add(bo);
    g.children.forEach(function (c) { c.position.y -= .006 - R; c.position.x -= R });   /* origem no fundo do gancho */
  } else if (tipo === "backhaus") {   /* pinça de campo (Backhaus): pontas curvas que se cruzam */
    ramos(g, pt, .015, function (s) {
      return arm([[0, 0], [s * .004, -.004], [s * .0052, -.009], [s * .0025, -.0135], [-s * .0008, -.015]], function (t) { return .00075 * (1 - .5 * t) * ends(t, .02, .05) }, function () { return .0007 }, STL, 26)
    }, [[0, 0], [.0025, .014], [.0055, .03], [.007, .04]], [.0108, .046], .0052, STL, [.006, .031, .0065]);
  }
  g.scale.setScalar(ESC); INS.add(g); g.visible = false;
  return { g: g, pt: pt }
}
/* abre os ramos: a = ângulo de cada ramo (rad) */
function abreRamos(f, a) { if (f.pt.A) { f.pt.A.rotation.z = a; f.pt.B.rotation.z = -a } }
/* posiciona: ponta em 'alvo', cabo na direção 'cabo', plano do instrumento com normal 'normal' */
var _m4 = new THREE.Matrix4();
function posiciona(f, alvo, cabo, normal, vis) {
  f.g.visible = vis === undefined ? true : !!vis; if (!f.g.visible) return;
  var y = cabo.clone().normalize(), z = normal.clone().sub(y.clone().multiplyScalar(normal.dot(y))).normalize(), x = new V().crossVectors(y, z);
  _m4.makeBasis(x, y, z); f.g.quaternion.setFromRotationMatrix(_m4); f.g.position.copy(alvo)
}
/* fio: tubo violeta por pontos */
function fio(r) { var t = new Tubo(FIO, r || .00045, 40, 6); scene.add(t.mesh); return t }
