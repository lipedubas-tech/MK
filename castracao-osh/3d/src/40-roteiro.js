/* ===== roteiro: as 11 cenas do briefing. O estado de tudo é função pura do tempo u (índice da cena + fração) ===== */
var CENAS = [
  { t: "Abertura", d: 8, leg: "Ovariosalpingohisterectomia (OSH) em felina" },
  { t: "Preparo", d: 13, leg: "Anestesia, tricotomia, antissepsia e colocação dos campos" },
  { t: "Incisão", d: 11, leg: "Celiotomia retroumbilical na linha média ventral" },
  { t: "Localizar o útero", d: 11, leg: "Exteriorização do corno uterino com gancho" },
  { t: "Ovário", d: 9, leg: "Ruptura do ligamento suspensor do ovário" },
  { t: "Pedículo ovariano", d: 13, leg: "Técnica das três pinças: pinçar, ligar e seccionar" },
  { t: "Outro lado", d: 8, leg: "O mesmo procedimento no ovário contralateral" },
  { t: "Corpo do útero", d: 12, leg: "Ligadura e secção do corpo uterino, cranial ao cérvix" },
  { t: "Hemostasia", d: 8, leg: "Conferência da hemostasia dos cotos" },
  { t: "Sutura", d: 13, leg: "Síntese em três planos: muscular, subcutâneo e pele" },
  { t: "Pós-operatório", d: 10, leg: "Recuperação: analgesia, fluidoterapia e roupa cirúrgica" }
];
var NC = CENAS.length;

/* instrumentos da cirurgia */
var F = {};
var ligs = [], pontos = [], continua = null, manta = null, roupa = null, acesso = null;
function Ligadura() {   /* laço de fio que aperta em volta de uma estrutura */
  var g = new THREE.Group(); scene.add(g); this.g = g; this.r = -1;
  this.anel = new THREE.Mesh(new THREE.TorusGeometry(1, .14, 8, 28), FIO); g.add(this.anel);
  this.no = new THREE.Mesh(new THREE.SphereGeometry(.0011, 10, 8), FIO); g.add(this.no);
  this.ponta = fio(.00035); this.ponta2 = fio(.00035)
}
Ligadura.prototype.set = function (vis, c, eixo, r) {
  this.g.visible = this.ponta.mesh.visible = this.ponta2.mesh.visible = !!vis; if (!vis) return;
  this.g.position.copy(c); this.g.quaternion.setFromUnitVectors(P(0, 0, 1), eixo.clone().normalize());
  this.anel.scale.set(r, r, r * .9); this.anel.material = FIO;
  var lado = new V().crossVectors(eixo, P(0, 0, 1)); if (lado.lengthSq() < 1e-6) lado.set(1, 0, 0); lado.normalize();
  var nPos = c.clone().addScaledVector(lado, r); this.no.position.copy(lado.clone().multiplyScalar(r).applyQuaternion(this.g.quaternion.clone().invert()));
  var sobe = P(0, 1, 0);
  this.ponta.set([nPos, nPos.clone().addScaledVector(lado, .003).addScaledVector(sobe, .002), nPos.clone().addScaledVector(lado, .006).addScaledVector(sobe, .001)]);
  this.ponta2.set([nPos, nPos.clone().addScaledVector(lado, .0028).addScaledVector(sobe, -.0012), nPos.clone().addScaledVector(lado, .0055).addScaledVector(sobe, -.003)])
};

function iniciaRoteiro() {
  F.bisturi = ferramenta("bisturi"); F.gancho = ferramenta("gancho"); F.tesoura = ferramenta("tesoura"); F.porta = ferramenta("portaAgulha");
  F.hem = [0, 1, 2, 3, 4, 5, 6].map(function () { return ferramenta("hemostatica") });   /* 3 por pedículo + 1 no corpo */
  for (var i = 0; i < 4; i++) ligs.push(new Ligadura());   /* 2 pedículos + 2 no corpo */
  /* pontos da síntese: 6 na linha alba, 5 na pele (simples separados) e um contínuo no subcutâneo */
  for (i = 0; i < 6; i++) pontos.push({ t: fio(.0004), no: new THREE.Mesh(new THREE.SphereGeometry(.0009, 8, 6), FIO), plano: "mus", z: INC.zc + INC.h * (.8 - 1.6 * i / 5) });
  for (i = 0; i < 5; i++) pontos.push({ t: fio(.0004), no: new THREE.Mesh(new THREE.SphereGeometry(.0009, 8, 6), FIO), plano: "pele", z: INC.zc + INC.h * (.72 - 1.44 * i / 4) });
  pontos.forEach(function (p) { scene.add(p.no) });
  continua = fio(.00038); continua.seg = 220;
  criaPosOp()
}

/* ---------- pós-operatório: manta, roupa cirúrgica e acesso venoso ---------- */
function criaPosOp() {
  var g = new THREE.PlaneGeometry(.46, .62, 60, 80); g.rotateX(-PI / 2);
  var pa = g.attributes.position; for (var i = 0; i < pa.count; i++) { var x = pa.getX(i), z = pa.getZ(i); pa.setY(i, .006 + .006 * Math.sin(x * 40 + z * 12) * Math.cos(z * 23) + .004 * Math.sin(z * 55 + x * 9)) }
  g.computeVertexNormals();
  manta = new THREE.Mesh(g, MS(0xffffff, { map: texturaTecido("#b98f86", 18), roughness: 1, envMapIntensity: .2 })); manta.receiveShadow = true; scene.add(manta);
  /* roupa cirúrgica: cópia do corpo, inflada, só no tronco */
  var c = partes.corpo, gg = c.geometry, n = gg.attributes.position.count, tor = new Float32Array(n), Jt = gg.attributes.skinIndex, Wt = gg.attributes.skinWeight;
  var nomes = c.skeleton.bones.map(function (b) { return b.name }), PES = { Back: 1, Butt: .85, Neck: .55, L_Shoulder: .9, R_Shoulder: .9, L_Thigh: .7, R_Thigh: .7 };
  for (i = 0; i < n; i++) { var s = 0; for (var k = 0; k < 4; k++) s += (PES[nomes[Jt.array[i * 4 + k]]] || 0) * Wt.array[i * 4 + k]; tor[i] = s }
  var g2 = gg.clone(); g2.setAttribute("aTronco", new THREE.BufferAttribute(tor, 1));
  var mt = MS(0xffffff, { map: texturaEstampa(), roughness: .85, envMapIntensity: .25, side: THREE.DoubleSide, skinning: true });
  mt.onBeforeCompile = function (sh) {
    sh.vertexShader = "attribute float aTronco;\nvarying float vTr;\n" + sh.vertexShader.replace("#include <skinning_vertex>", "#include <skinning_vertex>\n transformed += normalize(objectNormal) * .0045;\n vTr = aTronco;");
    sh.fragmentShader = "varying float vTr;\n" + sh.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\n if (vTr < .62) discard;\n diffuseColor.rgb *= mix(.75, 1., smoothstep(.62, .7, vTr));")
  };
  mt.customProgramCacheKey = function () { return "roupa" };
  roupa = new THREE.SkinnedMesh(g2, mt); roupa.bind(c.skeleton, c.bindMatrix); roupa.frustumCulled = false; roupa.castShadow = true;
  c.parent.add(roupa);
  /* acesso venoso na pata dianteira: esparadrapo e equipo */
  acesso = { fita: new THREE.Mesh(new THREE.CylinderGeometry(.0105, .0105, .022, 20, 1, true), MS(0xf4f1ea, { roughness: .9, side: THREE.DoubleSide })), equipo: new Tubo(MF(0xe9f3f8, { roughness: .2, transparent: true, opacity: .6, clearcoat: 1 }), .0016, 50, 8) };
  scene.add(acesso.fita); scene.add(acesso.equipo.mesh)
}
function texturaEstampa() {
  var c = document.createElement("canvas"); c.width = c.height = 512; var x = c.getContext("2d");
  x.fillStyle = "#5f9e99"; x.fillRect(0, 0, 512, 512);
  for (var i = 0; i < 260; i++) { x.fillStyle = ["#f3efe2", "#e7b84f", "#2f6763"][i % 3]; x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 6, 0, PI * 2); x.fill() }
  var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t
}

/* ---------- ajuda: pinça hemostática fechando sobre uma estrutura ---------- */
function pinca(f, ponto, dirEstrutura, ladoCabo, ap, abre, vis) {
  if (!vis || ap <= .001) { f.g.visible = false; return }
  var d = dirEstrutura.clone().normalize(), h = ladoCabo.clone().sub(d.clone().multiplyScalar(ladoCabo.dot(d))).normalize();
  var alvo = ponto.clone().addScaledVector(h, -.0055).addScaledVector(h, .09 * (1 - ap)).add(P(0, .05 * (1 - ap), 0));
  posiciona(f, alvo, h, d, true); abreRamos(f, abre)
}
function ligRaio(t) { return lerp(.0055, .0017, RP(t, .45, 1)) }

/* ---------- câmera: quadros-chave [u, posição, alvo] ---------- */
var CAMS = [
  [1.0, [.7, .42, .7], [0, .13, .02]], [1.26, [.6, .5, .22], [0, .12, -.02]], [1.32, [.24, .5, -.32], [0, .14, -.06]],
  [1.66, [.2, .62, -.42], [0, .11, -.07]], [1.98, [.14, .52, -.36], [0, .13, -.065]],
  [2.0, [.1, .4, -.27], [0, .152, -.066]], [2.5, [.08, .37, -.25], [0, .152, -.066]], [2.98, [.07, .36, -.24], [0, .148, -.064]],
  [3.0, [.02, .5, -.2], [0, .105, -.045]], [3.45, [.03, .49, -.2], [.004, .108, -.045]], [3.8, [.08, .4, -.23], [.004, .15, -.055]], [3.98, [.09, .39, -.22], [.005, .155, -.055]],
  [4.0, [.1, .38, -.21], [.006, .16, -.05]], [4.98, [.12, .38, -.19], [.008, .165, -.048]],
  [5.0, [.13, .39, -.18], [.008, .168, -.046]], [5.6, [.12, .37, -.16], [.008, .17, -.046]], [5.98, [.1, .39, -.21], [.004, .16, -.05]],
  [6.0, [-.1, .39, -.21], [-.004, .16, -.05]], [6.98, [-.12, .39, -.19], [-.008, .165, -.048]],
  [7.0, [.04, .43, -.25], [0, .17, -.06]], [7.4, [.08, .38, -.22], [0, .168, -.07]], [7.98, [.05, .42, -.25], [0, .16, -.065]],
  [8.0, [0, .5, -.17], [0, .1, -.045]], [8.98, [0, .5, -.17], [0, .1, -.045]],
  [9.0, [.08, .37, -.23], [0, .153, -.067]], [9.98, [.08, .38, -.24], [0, .153, -.067]],
  [10.0, [.5, .24, .52], [0, .07, .06]], [11, [.5, .24, .52], [0, .07, .06]]
];
var _cp = new V(), _ct = new V();
function camera(u) {
  if (u < 1) {   /* abertura: órbita lenta em volta da gata acordada */
    var a = lerp(.95, -.35, RP(u, 0, 1)), r = lerp(1.2, 1.05, RP(u, 0, 1));
    cam.position.set(Math.sin(a) * r, .36, .02 + Math.cos(a) * r); cam.up.set(0, 1, 0); cam.lookAt(-.12 * Math.cos(a), .17, .02 + .12 * Math.sin(a)); return
  }
  if (u >= 10) {
    var b2 = lerp(.8, .45, RP(u, 10, 11)), r2 = .92, alvo = P(-.01, .1, .05);
    cam.position.set(Math.sin(b2) * r2, .3, .05 + Math.cos(b2) * r2); cam.up.set(0, 1, 0);
    var dir = alvo.clone().sub(cam.position).normalize(), dir2 = new V().crossVectors(dir, P(0, 1, 0)).normalize();
    cam.lookAt(alvo.addScaledVector(dir2, .13)); return
  }
  var i = 0; while (i < CAMS.length - 2 && CAMS[i + 1][0] <= u) i++;
  var a = CAMS[i], b = CAMS[i + 1], t = cl((u - a[0]) / (b[0] - a[0]), 0, 1), e = t * t * (3 - 2 * t);
  if (Math.floor(a[0] + 1e-6) !== Math.floor(b[0] + 1e-6) && b[0] - a[0] < .1) e = t;   /* corte entre cenas: transição curta */
  _cp.set(lerp(a[1][0], b[1][0], e), lerp(a[1][1], b[1][1], e), lerp(a[1][2], b[1][2], e));
  _ct.set(lerp(a[2][0], b[2][0], e), lerp(a[2][1], b[2][1], e), lerp(a[2][2], b[2][2], e));
  cam.position.copy(_cp); cam.up.set(0, 1, 0); cam.lookAt(_ct)
}

/* ---------- estado de cada lado ao longo do roteiro ---------- */
function estadoLado(s, u) {
  /* lado direito nas cenas 4–6; o esquerdo, acelerado, na cena 7 do briefing */
  var st = { g: RP(u, 3.5, 3.78), o: RP(u, 4.05, 4.4), r: RP(u, 4.42, 4.55), e: RP(u, 4.58, 4.9), f: RP(u, 5.86, 5.99) };
  if (s < 0) st = { g: RP(u, 6.05, 6.18), o: RP(u, 6.18, 6.3), r: RP(u, 6.3, 6.36), e: RP(u, 6.36, 6.46), f: RP(u, 6.9, 6.99) };
  st.cortado = s > 0 ? u >= 5.68 : u >= 6.75;
  st.volta = s > 0 ? RP(u, 5.75, 5.95) : RP(u, 6.78, 6.9);
  return st
}
var TEMPOS = {
  1: { pinca: [[5.03, 5.12], [5.12, 5.21], [5.21, 5.3]], lig: [5.34, 5.55], tes: [5.56, 5.7], corte: 5.68, solta: [5.72, 5.84] },
  "-1": { pinca: [[6.46, 6.51], [6.51, 6.56], [6.56, 6.61]], lig: [6.61, 6.7], tes: [6.68, 6.76], corte: 6.75, solta: [6.77, 6.85] }
};
var FR = [.28, .5, .74], LIG_F = .14, CORTE_F = .62;
var ancora = {};   /* pinça distal e ligadura presas ao lado do ovário depois da secção */

function aplica(u) {
  var k = Math.min(NC - 1, Math.floor(u));
  /* ----- gata: pose, olhos, transparência ----- */
  var vira = RP(u, 1.02, 1.24), pos = u >= 10;
  if (pos) aplicaPose("esternal", "esternal", 1); else if (vira <= 0) aplicaPose("empe", "empe", 1); else aplicaPose("empe", "dorsal", vira, PI * vira);
  UG.uOlho.value = u < 1.06 || pos ? 1 : 0;
  var raio = Math.max(WN(u, 3.0, 3.16, 3.74, 3.9), WN(u, 8.0, 8.12, 8.86, 8.98));
  UG.uRaio.value = raio;
  [partes.corpo, partes.cabeca, partes.cauda].forEach(function (m) { var mt = m.material, tr = raio > .001; if (mt.transparent !== tr) { mt.transparent = tr; mt.needsUpdate = true } mt.opacity = 1 - .9 * raio; mt.depthWrite = !tr });
  /* ----- sítio cirúrgico ----- */
  var cir = u >= 1.28 && !pos;
  pele.visible = cir; UC.uRaspa.value = RP(u, 1.3, 1.48); UC.uAnti.value = RP(u, 1.5, 1.66); UC.uTrac.value = RP(u, 2.04, 2.12); UC.uCorte.value = RP(u, 2.16, 2.44);
  pele.children.forEach(function (o) { var mt = o.material, tr = raio > .001; if (mt.transparent !== tr) { mt.transparent = tr; mt.needsUpdate = true } mt.opacity = 1 - raio });
  var fecha = { mus: RP(u, 9.02, 9.32), sub: RP(u, 9.34, 9.62), pele: RP(u, 9.64, 9.94) };
  ABRE.pele = RP(u, 2.48, 2.62) * (1 - fecha.pele); ABRE.sub = RP(u, 2.62, 2.76) * (1 - fecha.sub); ABRE.mus = RP(u, 2.76, 2.92) * (1 - fecha.mus);
  if (pos) ABRE.pele = ABRE.sub = ABRE.mus = 0;
  abrePele(ABRE.pele * .95); atualizaFerida();
  UG.uCorte.value.w = Math.max(ABRE.pele, ABRE.mus * .9);
  cavidade.visible = ABRE.mus > .01 && raio < .3 && !pos;
  gaze.visible = u > 1.49 && u < 1.67;
  if (gaze.visible) { var fr = UC.uAnti.value * .085 - .004, th = (fr / .0075) * PI * 2; gaze.position.set(Math.cos(th) * fr, peleY(-.066 + Math.sin(th) * fr) + .004, -.066 + Math.sin(th) * fr) }
  posicionaSonda(u > 1.22 && !pos);
  /* campo: cai entre 1,68 e 1,86 */
  campo.visible = u > 1.68 && !pos && raio < .98; UQ.uQueda.value = 1 - RP(u, 1.68, 1.88); UQ.uVis.value = (1 - raio) * RP(u, 1.68, 1.72);
  pincasCampo.forEach(function (f, i) { var a = RP(u, 1.86 + i * .025, 1.92 + i * .025); if (a <= 0 || pos || raio > .4) { f.g.visible = false; return } var al = f.alvo.clone().add(P(0, .08 * (1 - a), 0)); posiciona(f, al, f.cabo, f.normal, true); abreRamos(f, .25 * (1 - RP(u, 1.9 + i * .025, 1.94 + i * .025))) });
  /* ----- bisturi ----- */
  var bv = WN(u, 2.12, 2.16, 2.45, 2.5);
  if (bv > 0) { var zc = lerp(INC.zc + INC.h, INC.zc - INC.h, UC.uCorte.value), al = P(0, peleY(zc) - .0012 + .05 * (1 - bv), zc); posiciona(F.bisturi, al, P(0, .74, .67), P(-1, 0, 0), true) } else F.bisturi.g.visible = false;
  /* ----- órgãos ----- */
  ORG.visible = u >= 2.85 && !pos || raio > .01;
  alcas.forEach(function (a) { a.mesh.material.opacity = 1 - .85 * raio; a.mesh.material.depthWrite = raio < .01 });
  var cf = RP(u, 7.02, 7.25), sai = P(0, .3, .05).multiplyScalar(RP(u, 7.72, 7.95)), corpoCortado = u >= 7.66, removido = sai.y > .001 ? sai : null;
  LADOS.forEach(function (s) {
    var st = estadoLado(s, u), corn = atualizaLado(s, st, cf, removido), T = TEMPOS[s], c = cfg[s];
    var ex = vlist(c.IN, c.EX, 1)[0].clone().add(P(s * .0028, .0012, .002));   /* posição do ovário exteriorizado */
    var d = ex.clone().sub(c.WP), LEQUE = [P(s, .3, -.4), P(s, .45, .1), P(s, .6, .55)];
    function noPed(f) { return vl(c.WP, ex, f) }
    /* três pinças: proximal, média e distal; a distal acompanha o ovário depois da secção */
    for (var i = 0; i < 3; i++) {
      var f = F.hem[(s > 0 ? 0 : 3) + i], ap = RP(u, T.pinca[i][0], T.pinca[i][1]), fecha = RP(u, T.pinca[i][1] - .02, T.pinca[i][1] + (s > 0 ? .02 : .01));
      var solta = i < 2 ? RP(u, T.solta[0], T.solta[1]) : 0, vis = ap > 0 && solta < 1 && u < 7.98;
      var pto = noPed(FR[i]), dd = d.clone();
      if (i === 2 && st.cortado) pto = ovarios[s].position.clone().add(pto.sub(ex));   /* segue o ovário */
      pinca(f, pto.add(P(s * .03 * solta, .03 * solta, 0)), dd, LEQUE[i], ap * (1 - solta * 0), lerp(.28, 0, fecha) + .3 * solta, vis)
    }
    /* ligadura logo abaixo da pinça proximal; depois da secção desce com o coto */
    var lt = RP(u, T.lig[0], T.lig[1]), lp = st.cortado && coto[s] ? vl(noPed(LIG_F), coto[s].clone().add(P(-s * .001, -.001, 0)), st.volta) : noPed(LIG_F);
    ligs[s > 0 ? 0 : 1].set(lt > 0 && u < 10, lp, st.cortado ? vl(d, P(s, .3, 0), st.volta) : d, ligRaio(lt));
  });
  atualizaCorpo(cf, corpoCortado, RP(u, 7.75, 7.95), sai);
  /* tesoura: pedículos e corpo do útero */
  var tes = null;
  LADOS.forEach(function (s) { var T = TEMPOS[s]; if (u > T.tes[0] && u < T.tes[1]) tes = [s, RP(u, T.tes[0], T.tes[1])] });
  if (tes) {
    var s = tes[0], c = cfg[s], ex = vlist(c.IN, c.EX, 1)[0].clone().add(P(s * .0028, .0012, .002)), pc = vl(c.WP, ex, CORTE_F);
    pinca(F.tesoura, pc, ex.clone().sub(c.WP), P(s, -.1, .9), WN(tes[1], 0, .3, .85, 1), .3 * (1 - RP(tes[1], .45, .62)), true)
  } else if (u > 7.6 && u < 7.7) { var tt = RP(u, 7.6, 7.7); pinca(F.tesoura, naAltura(CORTE_Y), P(0, 1, 0), P(-1, 0, .6), WN(tt, 0, .3, .85, 1), .3 * (1 - RP(tt, .45, .62)), true) }
  else F.tesoura.g.visible = false;
  /* corpo do útero: duas ligaduras craniais ao cérvix e uma pinça cranial a elas */
  ligs[2].set(u > 7.28 && u < 10, removido ? coto.corpo || naAltura(.161) : naAltura(.161), P(0, 1, .2), ligRaio(RP(u, 7.28, 7.4)));
  var l2 = RP(u, 7.4, 7.5), p2 = naAltura(.166); if (corpoCortado) p2 = vl(p2, (coto.corpo || p2).clone().add(P(0, .003, .002)), RP(u, 7.75, 7.95));
  ligs[3].set(u > 7.4 && u < 10, p2, P(0, 1, .2), ligRaio(l2));
  var hc = F.hem[6], apc = RP(u, 7.5, 7.58); pinca(hc, naAltura(.177).add(sai), P(0, 1, .25), P(-1, .35, .3), apc, lerp(.28, 0, RP(u, 7.56, 7.6)), apc > 0 && u < 7.98);
  /* gancho de Snook: entra pela incisão, desce pela parede lateral e traz o corno */
  var gk = null;
  if (u > 3.2 && u < 4.12) {
    var cam = [P(.03, .26, -.05), P(.004, .17, -.055), P(.024, .118, -.046), P(.02, .1, -.04), P(.006, .1, -.05)].map(function (p) { return p });
    var g1 = cfg[1].GA[3], tt = u;
    if (tt < 3.5) { var q = RP(tt, 3.2, 3.5) * 4, i0 = Math.min(3, Math.floor(q)); gk = vl(cam[i0], cam[i0 + 1], q - i0) }
    else if (tt < 3.78) gk = vl(cam[4], g1, RP(tt, 3.5, 3.78));
    else gk = vl(g1, P(.05, .26, -.05), RP(tt, 3.98, 4.12));
    posiciona(F.gancho, gk, P(.45, 1, .1), P(0, 0, 1), true)
  } else if (u > 6.0 && u < 6.3) {
    var g2 = cfg[-1].GA[3], q2 = RP(u, 6.0, 6.05);
    gk = u < 6.05 ? vl(P(-.03, .26, -.05), P(-.006, .1, -.05), q2) : u < 6.18 ? vl(P(-.006, .1, -.05), g2, RP(u, 6.05, 6.18)) : vl(g2, P(-.05, .26, -.05), RP(u, 6.2, 6.3));
    posiciona(F.gancho, gk, P(-.45, 1, .1), P(0, 0, -1), true)
  } else F.gancho.g.visible = false;
  /* ----- síntese ----- */
  var faz = { mus: [9.02, 9.32], pele: [9.64, 9.94] }, npl = { mus: 6, pele: 5 }, cont = { mus: 0, pele: 0 }, alvoPorta = null;
  pontos.forEach(function (p) {
    var j = cont[p.plano]++, a = faz[p.plano], t0 = a[0] + (a[1] - a[0]) * j / npl[p.plano], t1 = t0 + (a[1] - a[0]) / npl[p.plano];
    var on = u > t0 + (t1 - t0) * .6 && !pos, y = peleY(p.z), w = wInc(p.z) * ABRE[p.plano] + .0016;
    p.t.mesh.visible = p.no.visible = on; if (u > t0 && u < t1) alvoPorta = [p.z, p.plano === "mus" ? y - .005 : y + .001, (u - t0) / (t1 - t0)];
    if (!on) return;
    if (p.plano === "mus") { var yy = y - .0055; p.t.set([P(-w, yy - .001, p.z), P(-w * .6, yy + .0008, p.z), P(0, yy + .0014, p.z), P(w * .6, yy + .0008, p.z), P(w, yy - .001, p.z)]); p.no.position.set(.0006, yy + .0016, p.z) }
    else { var yp = y + .0004; p.t.set([P(-w - .001, yp - .0008, p.z), P(-w * .7, yp + .0012, p.z), P(0, yp + .0016, p.z), P(w * .7, yp + .0012, p.z), P(w + .001, yp - .0008, p.z)]); p.no.position.set(w * .5, yp + .0017, p.z + .0004) }
  });
  /* contínuo simples no subcutâneo, do cranial para o caudal */
  var cs = RP(u, 9.34, 9.62); continua.mesh.visible = cs > 0 && !pos;
  if (cs > 0) {
    var pts = [], N = 9, ate = cs * N;
    for (var i = 0; i <= Math.ceil(ate); i++) {
      var z = INC.zc + INC.h * .85 - 1.7 * INC.h * Math.min(i, ate) / N, w = wInc(z) * ABRE.sub + .0014, y = peleY(z) - .0031;
      pts.push(P(i % 2 ? w : -w, y, z)); if (i < ate) pts.push(P(0, y + .0012, z - .85 * INC.h / N))
    }
    if (pts.length > 1) continua.set(pts.length > 2 ? pts : [pts[0], pts[0].clone().add(P(0, .0001, 0)), pts[1]]);
    if (cs < 1) alvoPorta = [pts[pts.length - 1].z, pts[pts.length - 1].y, (ate % 1)]
  }
  if (alvoPorta && !pos) {
    var bob = Math.sin(alvoPorta[2] * PI);
    posiciona(F.porta, P(.003 + .004 * bob, alvoPorta[1] + .004 + .01 * (1 - bob), alvoPorta[0]), P(.7, .9, -.25), P(0, .25, 1), true); abreRamos(F.porta, 0)
  } else F.porta.g.visible = false;
  /* ----- pós-operatório ----- */
  manta.visible = roupa.visible = acesso.fita.visible = acesso.equipo.mesh.visible = pos;
  if (pos) {
    manta.position.set(0, 0, .03);
    var a0 = posOsso("R_Arm"), a1 = posOsso("R_FrontPaw"), mid = vl(a0, a1, .55), dir = a1.clone().sub(a0).normalize();
    acesso.fita.position.copy(mid); acesso.fita.quaternion.setFromUnitVectors(P(0, 1, 0), dir);
    acesso.equipo.set([mid.clone().add(P(0, .008, 0)), mid.clone().add(P(.02, .03, -.03)), P(mid.x + .06, .12, mid.z - .02), P(mid.x + .1, .45, mid.z - .15)])
  }
  /* luz de foco cirúrgico durante a cirurgia */
  foco.intensity = cir && u < 9.98 ? 3 * (1 - raio) : 0;
  key.intensity = 2.4 * (1 - .55 * raio); hemi.intensity = 1.1 * (1 - .6 * raio); INOX.color.setHex(raio > .5 ? 0x4a5258 : 0x8e979f); foco.target.position.set(0, .15, -.065);
  return k
}

/* ---------- rótulos (texto, ponto, u0, u1) ---------- */
function Rot(t, p, a, b, dx, dy) { ROTULOS.push({ t: t, p: p, a: a, b: b, dx: dx || 0, dy: dy || -1 }) }
function rotulos() {
  var ovR = function () { return ovarios[1].position }, ovL = function () { return ovarios[-1].position };
  Rot("Tricotomia", function () { return P(.03, peleY(-.03), -.03) }, 1.32, 1.5, 1, -1);
  Rot("Antissepsia", function () { return P(-.02, peleY(-.08), -.08) }, 1.52, 1.68, -1, -1);
  Rot("Campo fenestrado", function () { return P(-.08, .1, -.15) }, 1.75, 2.0, -1, -1);
  Rot("Pinça de campo", function () { return P(JAN.x + .01, .19, JAN.z1 + .006) }, 1.9, 2.0, 1, -1);
  Rot("Umbigo", function () { return P(0, peleY(UMBIGO_Z), UMBIGO_Z) }, 2.03, 2.48, -1, -1);
  Rot("Linha média, caudal ao umbigo", function () { return P(0, peleY(-.08), -.08) }, 2.06, 2.45, 1, 1);
  Rot("Pele", function () { return P(-wInc(-.06) * ABRE.pele, peleY(-.06) - .0005, -.06) }, 2.5, 2.98, -1, -1);
  Rot("Subcutâneo", function () { return P(wInc(-.07) * ABRE.sub, peleY(-.07) - .003, -.07) }, 2.64, 2.98, 1, -1);
  Rot("Linha alba", function () { return P(-wInc(-.078) * ABRE.mus, peleY(-.078) - .0055, -.078) }, 2.78, 2.98, -1, 1);
  Rot("Rim", function () { return P(.027, .088, .022) }, 3.08, 3.8, 1, -1);
  Rot("Ovário", ovR, 3.1, 3.8, 1, 1);
  Rot("Corno uterino", function () { return tubos[-1].corno.mesh.visible ? cfg[-1].IN[3] : P(0, 0, 0) }, 3.1, 3.8, -1, -1);
  Rot("Corpo do útero", function () { return P(0, .104, -.083) }, 3.12, 3.8, -1, 1);
  Rot("Bexiga", function () { return P(0, .126, -.106) }, 3.14, 3.8, 1, 1);
  Rot("Gancho de Snook", function () { return F.gancho.g.position.clone().add(P(.02, .04, 0)) }, 3.3, 3.98, 1, -1);
  Rot("Ligamento suspensor", function () { return vl(cfg[1]._ov, cfg[1].SUSP, .3) }, 4.15, 4.6, 1, -1);
  Rot("Ovário", ovR, 4.6, 5.0, -1, -1);
  Rot("Pedículo ovariano", function () { return pontoPed(1, .3) }, 4.75, 5.05, 1, 1);
  Rot("Pinça proximal", function () { return pontoPed(1, FR[0]) }, 5.1, 5.34, 1, 1);
  Rot("Pinça média", function () { return pontoPed(1, FR[1]) }, 5.19, 5.34, 1, -1);
  Rot("Pinça distal", function () { return pontoPed(1, FR[2]) }, 5.28, 5.34, -1, -1);
  Rot("Ligadura", function () { return ligs[0].g.position }, 5.45, 5.7, -1, 1);
  Rot("Secção entre as pinças", function () { return pontoPed(1, CORTE_F) }, 5.6, 5.74, 1, -1);
  Rot("Coto volta à cavidade", function () { return coto[1] || P(0, 0, 0) }, 5.8, 5.98, 1, 1);
  Rot("Ovário esquerdo", ovL, 6.3, 6.95, -1, -1);
  Rot("Útero exteriorizado", function () { return BX }, 7.1, 7.3, 1, -1);
  Rot("Ligaduras", function () { return naAltura(.163) }, 7.36, 7.62, -1, 1);
  Rot("Cérvix", function () { return CERV_EX[0] }, 7.3, 7.62, 1, 1);
  Rot("Secção", function () { return naAltura(CORTE_Y) }, 7.62, 7.72, 1, -1);
  Rot("Coto ovariano direito", function () { return coto[1] }, 8.15, 8.4, 1, -1);
  Rot("Coto ovariano esquerdo", function () { return coto[-1] }, 8.4, 8.64, -1, -1);
  Rot("Coto uterino", function () { return coto.corpo }, 8.64, 8.9, 1, 1);
  Rot("Linha alba: pontos simples", function () { return P(0, peleY(-.06) - .004, -.06) }, 9.08, 9.34, 1, -1);
  Rot("Subcutâneo: contínuo", function () { return P(0, peleY(-.07) - .002, -.07) }, 9.38, 9.64, -1, -1);
  Rot("Pele: pontos simples", function () { return P(0, peleY(-.06), -.06) }, 9.7, 9.98, 1, -1);
  Rot("Acesso venoso", function () { return acesso.fita.position }, 10.15, 10.98, 1, -1);
  Rot("Roupa cirúrgica", function () { return posOsso("Back").add(P(0, .05, -.04)) }, 10.25, 10.98, -1, -1)
}
