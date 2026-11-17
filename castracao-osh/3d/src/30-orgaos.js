/* ===== órgãos: rins, grandes vasos, ovários, útero bicorno em Y, ligamentos, pedículos, bexiga, alças intestinais =====
   Lado direito da paciente = +X (s = +1); o rim direito é mais cranial; ovários na extremidade cranial dos cornos,
   caudais aos rins; cérvix caudal ao corpo uterino. */
var ORG = new THREE.Group(); scene.add(ORG);
var UTERO = MF(0xe58f7b, { roughness: .32, clearcoat: .7, clearcoatRoughness: .25, envMapIntensity: .7 }),
  OVM = MF(0xf1dca8, { roughness: .4, clearcoat: .5, clearcoatRoughness: .3, envMapIntensity: .6 }),
  ART = MF(0xc93a35, { roughness: .3, clearcoat: .6, envMapIntensity: .6 }), VEI = MF(0x37589d, { roughness: .3, clearcoat: .6, envMapIntensity: .6 }),
  LIG = MF(0xf2e2d6, { roughness: .45, clearcoat: .4, envMapIntensity: .5 }),
  MEMB = MF(0xf3c1b1, { roughness: .4, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false, clearcoat: .4 }),
  GORD = MF(0xf2d68a, { roughness: .45, transparent: true, opacity: .55, clearcoat: .5, depthWrite: false }),
  RIM = MF(0x8a3a30, { roughness: .35, clearcoat: .6, envMapIntensity: .6 }),
  BEX = MF(0xf3e4a6, { roughness: .25, transparent: true, opacity: .62, clearcoat: .8, depthWrite: false }),
  ALCA = MF(0xdc9289, { roughness: .3, clearcoat: .7, envMapIntensity: .6, transparent: true, opacity: 1 });
var LADOS = [1, -1], B0 = P(0, .104, -.071), BX = P(0, .186, -.07);
var cfg = {}, tubos = {}, ovarios = {}, ligSusp = {}, membr = {}, coto = {}, alcas = [];

function ladoCfg(s) {
  var dz = s > 0 ? 0 : -.014;
  function L(a) { return a.map(function (p) { return P(p[0] * s, p[1], p[2]) }) }
  return {
    IN: L([[.028, .096, -.002 + dz], [.027, .099, -.012 + dz * .8], [.022, .102, -.03 + dz * .5], [.014, .104, -.048 + dz * .25], [.006, .105, -.062], [.002, .105, -.068]]),
    GA: L([[.028, .096, -.002 + dz], [.025, .101, -.016 + dz * .8], [.014, .124, -.036], [.004, .168, -.05], [.002, .148, -.058], [.002, .114, -.066]]),
    OV: L([[.013, .152, -.04], [.012, .162, -.045], [.008, .17, -.05], [.004, .164, -.055], [.003, .14, -.061], [.002, .113, -.067]]),
    EX: L([[.016, .19, -.037], [.015, .184, -.043], [.01, .172, -.049], [.005, .158, -.055], [.003, .135, -.062], [.002, .112, -.067]]),
    FO: L([[.03, .166, -.03], [.026, .165, -.04], [.016, .163, -.049], [.006, .158, -.055], [.003, .135, -.062], [.002, .112, -.067]]),
    CF: L([[.036, .18, -.01], [.032, .184, -.024], [.024, .188, -.04], [.013, .19, -.055], [.006, .189, -.064], [.002, .187, -.069]]),
    SUSP: P(.036 * s, .083, .036 + dz), PA: P(.006 * s, .08, .004 + dz * .6),
    WP: P(.006 * s, .156, -.044), OVIN: P(.028 * s, .096, -.002 + dz)
  }
}
function tuboMesh(mat, r, seg) { var t = new Tubo(mat, r, seg || 48, 12); ORG.add(t.mesh); return t }

function criaOrgaos() {
  /* rins e vasos renais */
  [[1, P(.027, .088, .022)], [-1, P(-.027, .088, .006)]].forEach(function (k) {
    var g = new THREE.SphereGeometry(1, 28, 20); g.scale(.0095, .0075, .0165);
    var pa = g.attributes.position, v = new V(); for (var i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); var hil = Math.exp(-Math.pow((v.x * -k[0] - .009) / .004, 2) - Math.pow(v.z / .006, 2)); pa.setX(i, v.x + k[0] * hil * .004) }
    g.computeVertexNormals(); var r = new THREE.Mesh(g, RIM); r.position.copy(k[1]); r.castShadow = true; ORG.add(r);
    tuboMesh(ART, .0011, 12).set([P(-.004, .079, k[1].z), P(k[0] * .009, .083, k[1].z + .001), P(k[1].x - k[0] * .006, .087, k[1].z)]);
    tuboMesh(VEI, .0015, 12).set([P(.0045, .08, k[1].z - .003), P(k[0] * .01, .084, k[1].z - .003), P(k[1].x - k[0] * .006, .087, k[1].z - .002)])
  });
  tuboMesh(ART, .0026, 30).set([P(-.004, .077, .07), P(-.004, .078, 0), P(-.004, .079, -.09), P(-.012, .08, -.13)]);
  tuboMesh(VEI, .0032, 30).set([P(.0045, .078, .07), P(.0045, .079, 0), P(.0045, .08, -.09), P(.012, .081, -.13)]);
  /* bexiga, caudal e ventral ao corpo do útero */
  var bx = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), BEX); bx.scale.set(.013, .011, .017); bx.position.set(0, .126, -.106); ORG.add(bx);
  /* alças intestinais (craniais e laterais à incisão) */
  [[-.018, .0], [.02, -.01], [-.004, .014]].forEach(function (c, n) {
    var pts = []; for (var i = 0; i <= 26; i++) { var t = i / 26 * PI * 2.4; pts.push(P(c[0] + .012 * Math.sin(t * 1.3 + n), .128 + .006 * Math.sin(t * 2.1), c[1] + .016 * Math.cos(t) - .004 * t)) }
    var a = tuboMesh(ALCA, .0042, 90); a.set(pts); alcas.push(a)
  });
  /* corpo do útero, cérvix e vagina */
  tubos.corpo = tuboMesh(UTERO, .0032, 30); tubos.cervix = tuboMesh(MF(0xd0705d, { roughness: .35, clearcoat: .6 }), .0036, 10); tubos.vagina = tuboMesh(MF(0xe8a597, { roughness: .4, clearcoat: .4 }), .0029, 20);
  tubos.cotoCorpo = tuboMesh(UTERO, .0032, 16);
  LADOS.forEach(function (s) {
    cfg[s] = ladoCfg(s);
    tubos[s] = { corno: tuboMesh(UTERO, .0024, 60), art: tuboMesh(ART, .0007, 50), vei: tuboMesh(VEI, .0009, 50),
      pedA: tuboMesh(ART, .00085, 40), pedV: tuboMesh(VEI, .0011, 40), pedG: tuboMesh(GORD, .0028, 40),
      cotoA: tuboMesh(ART, .00085, 20), cotoV: tuboMesh(VEI, .0011, 20), cotoG: tuboMesh(GORD, .0028, 20),
      susp1: tuboMesh(LIG, .001, 16), susp2: tuboMesh(LIG, .001, 16) };
    var ov = new THREE.Group(), g = new THREE.SphereGeometry(1, 24, 16); g.scale(.0047, .0033, .0029);
    var o = new THREE.Mesh(g, OVM); o.castShadow = true; ov.add(o);
    [[.002, .0022, .001], [-.0018, .0018, -.0012], [.0005, .0026, -.0014]].forEach(function (f) { var fo = new THREE.Mesh(new THREE.SphereGeometry(.0014, 12, 8), OVM); fo.position.set(f[0], f[1], f[2]); ov.add(fo) });
    /* bolsa ovárica / tuba uterina enrolada */
    var tb = new THREE.Mesh(new THREE.TorusGeometry(.0042, .0007, 8, 24, PI * 1.4), MF(0xeaa290, { roughness: .4, clearcoat: .5 })); tb.rotation.set(PI / 2, 0, 0); ov.add(tb);
    ovarios[s] = ov; ORG.add(ov);
    /* ligamento largo: membrana entre o corno e a parede dorsolateral */
    var mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6 * 2 * 3), 3));
    var ix = []; for (var i = 0; i < 5; i++) ix.push(i, i + 6, i + 1, i + 1, i + 6, i + 7); mg.setIndex(ix);
    membr[s] = new THREE.Mesh(mg, MEMB); ORG.add(membr[s])
  })
}

/* estado de um lado: g (enganchar), o (ovário até a incisão), e (exteriorizar), f (deixar repousando fora),
   r (ruptura do ligamento suspensor), cortado (pedículo seccionado), volta (coto voltando à cavidade) */
function pontoPed(s, f) { var c = cfg[s], o = c._ov; return vl(c.WP, o, f) }
function atualizaLado(s, st, cf, sai) {
  var c = cfg[s], pts = c.IN.map(function (p) { return p.clone() });
  [["GA", st.g], ["OV", st.o], ["EX", st.e], ["FO", st.f], ["CF", cf]].forEach(function (k) { if (k[1] > 0) pts = vlist(pts, c[k[0]], k[1]) });
  var B = vl(B0, BX, cf);
  var corn = pts.concat([B]); if (sai) corn = corn.map(function (p) { return p.clone().add(sai) });
  var t = tubos[s]; t.corno.set(corn);
  /* vasos uterinos ao longo da borda lateral do corno */
  var lat = function (dx, dy) { return corn.map(function (p, i) { return p.clone().add(P(s * dx * (1 - i / 9), dy, 0)) }) };
  t.art.set(lat(.0034, -.0008)); t.vei.set(lat(.0042, -.0016));
  var ov = corn[0].clone().add(P(s * .0028, .0012, .002)); c._ov = ov; ovarios[s].position.copy(ov);
  ovarios[s].rotation.set(0, s * .5, s * .3);
  /* ligamento suspensor: tenso até romper; depois as duas pontas se retraem */
  var r = st.r, A = c.SUSP, meio = vl(ov, A, .5);
  t.susp1.mesh.visible = !sai; t.susp2.mesh.visible = r > .02 && !sai;
  if (r < .02) t.susp1.set([ov, vl(ov, A, .5).add(P(0, -.002 * (1 - st.o), 0)), A], .001 * (1 - .35 * st.o));
  else { t.susp1.set([ov, vl(ov, meio, 1 - r * .85)], .0012); t.susp2.set([A, vl(A, meio, 1 - r * .85)], .0012) }
  /* pedículo ovariano (artéria, veia e gordura do mesovário), do ovário à origem junto à aorta/cava */
  var dentro = st.e > .5 || st.f > 0 ? c.WP : vl(ov, c.PA, .35).add(P(0, .01, 0));
  var ped = [ov, dentro, vl(dentro, c.PA, .5).add(P(0, -.004, .006)), c.PA];
  if (!st.cortado) {
    t.pedA.set(ped.map(function (p, i) { return p.clone().add(P(s * .0009, 0, .0008 * (i % 2 ? 1 : -1))) }));
    t.pedV.set(ped.map(function (p, i) { return p.clone().add(P(-s * .0009, .0004, -.0008 * (i % 2 ? 1 : -1))) }));
    t.pedG.set(ped); t.pedA.mesh.visible = t.pedV.mesh.visible = t.pedG.mesh.visible = !sai
  } else t.pedA.mesh.visible = t.pedV.mesh.visible = t.pedG.mesh.visible = false;
  /* coto do pedículo: da origem até o ponto de secção; volta para dentro da cavidade */
  var cortoAt = st.cortado ? vl(pontoPed(s, .62), c.OVIN.clone().add(P(-s * .004, -.002, .002)), st.volta) : null;
  [t.cotoA, t.cotoV, t.cotoG].forEach(function (k) { k.mesh.visible = !!st.cortado });
  if (st.cortado) {
    var meioC = vl(cortoAt, c.PA, .5).add(P(0, .004 * (1 - st.volta), 0)), cp = [cortoAt, meioC, c.PA];
    t.cotoA.set(cp.map(function (p) { return p.clone().add(P(s * .0009, 0, 0)) })); t.cotoV.set(cp.map(function (p) { return p.clone().add(P(-s * .0009, .0004, 0)) })); t.cotoG.set(cp);
    coto[s] = cortoAt
  }
  /* membrana do ligamento largo */
  var mp = membr[s].geometry.attributes.position;
  for (var i = 0; i < 6; i++) { var p = corn[i]; mp.setXYZ(i, p.x, p.y - .001, p.z); var a = c.IN[i]; mp.setXYZ(i + 6, s * .034, .085, a.z) }
  mp.needsUpdate = true; membr[s].geometry.computeVertexNormals(); membr[s].visible = !sai;
  return corn
}
/* corpo do útero: ao ser exteriorizado sobe pela parte caudal da incisão.
   Exteriorizado, de cima para baixo: bifurcação (y .186), pinça (.177), secção (.171), ligaduras (.166 e .161), cérvix (~.15). */
var CORPO_IN = [B0, P(0, .104, -.08), P(0, .103, -.088), P(0, .103, -.092)], CORPO_EX = [BX, P(0, .177, -.0765), P(0, .166, -.081), P(0, .155, -.085)];
var CERV_IN = [P(0, .103, -.092), P(0, .102, -.1)], CERV_EX = [P(0, .155, -.085), P(0, .143, -.09)];
function naAltura(y) {   /* ponto do corpo exteriorizado numa altura y */
  var c = CORPO_EX; for (var i = 0; i < c.length - 1; i++) if (y <= c[i].y && y >= c[i + 1].y) return vl(c[i], c[i + 1], (c[i].y - y) / (c[i].y - c[i + 1].y));
  return c[c.length - 1].clone()
}
var CORTE_Y = .171;
function atualizaCorpo(cf, cortado, volta, sai) {
  var body = vlist(CORPO_IN, CORPO_EX, cf), cerv = vlist(CERV_IN, CERV_EX, cf);
  var vag = [cerv[1], vl(P(0, .1, -.112), P(0, .12, -.104), cf), P(0, .097, -.135)];
  if (!cortado) { tubos.corpo.set(body); tubos.corpo.mesh.visible = true; tubos.cotoCorpo.mesh.visible = false }
  else {
    var cut = naAltura(CORTE_Y);
    tubos.corpo.set([body[0], body[1], cut].map(function (p) { return p.clone().add(sai) })); tubos.corpo.mesh.visible = sai.y < .2;
    var dentro = [P(0, .103, -.089), P(0, .103, -.092)], fora = [cut, CERV_EX[0]];
    var cp = vlist(fora, dentro, volta); tubos.cotoCorpo.set([cp[0], vl(cp[0], cp[1], .5), cp[1]]); tubos.cotoCorpo.mesh.visible = true; coto.corpo = cp[0];
    cerv = vlist(CERV_EX, CERV_IN, volta); vag = [cerv[1], vl(P(0, .12, -.104), P(0, .1, -.112), volta), P(0, .097, -.135)]
  }
  tubos.cervix.set(cerv); tubos.vagina.set(vag)
}
