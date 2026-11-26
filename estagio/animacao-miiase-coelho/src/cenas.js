/* ============================================================ estado no tempo
   Cada cena calcula o seu estado a partir do tempo local u (segundos desde o começo da cena).
   Cenas 1 a 4 (passo 2): estúdio de fundo neutro; o coelho deitado parece normal por fora e a lente mostra o que
   acontece por baixo do pelo: a mosca e os ovos, as larvas abrindo as feridas, o spray prata.
   Cenas 5 a 11: rascunho (câmera, ambiente, pose e máscaras), ainda sem mãos e instrumentos. */
var DBG = (function () {
  var q = location.search, o = {};
  var m = /[?&]cam=([-\d.,]+)/.exec(q); if (m) o.cam = m[1].split(",").map(parseFloat);
  m = /[?&]rot=([^&]+)/.exec(q); if (m) o.rot = decodeURIComponent(m[1]).split(";").map(function (x) { var k = x.split(","); return [k[0], +k[1] || 0, +k[2] || 0, +k[3] || 0]; });
  m = /[?&]raiz=([-\d.,]+)/.exec(q); if (m) o.raiz = m[1].split(",").map(parseFloat);
  m = /[?&]u=([^&]+)/.exec(q); if (m) o.u = decodeURIComponent(m[1]).split(";").map(function (x) { var k = x.split(":"); return [k[0], k[1].split(",").map(parseFloat)]; });
  m = /[?&]lente=(\w+)/.exec(q); if (m) o.lente = m[1];
  m = /[?&]amb=(\w+)/.exec(q); if (m) o.amb = m[1];
  return o;
})();

/* ------------------------------------------------------------ pose */
var DEITA_Y = -3.6, CENTRO_Y = 10;   /* o coelho vira em volta do centro do corpo (altura 10 no espaço de ligação) */
/* tremida de orelha: um giro rápido que volta */
function tremida(t, em, dur, k) { return Math.sin(seg(t, em, em + dur) * PI) * k; }
/* decúbito esternal (cenas 1 a 9 e 11): barriga no chão (o que passa do chão é cortado pelo plano CHAO),
   patas recolhidas, orelhas inclinadas para trás */
function poseDeitado(t) {
  var tr = tremida(t, 2.2, .35, .16) + tremida(t, 13.4, .3, .12) + tremida(t, 47.5, .3, .12) + tremida(t, 97, .3, .1);
  var tl = tremida(t, 4.3, .35, .16) + tremida(t, 21.2, .3, .12) + tremida(t, 60.5, .3, .1);
  gira("Ear_R", 0, .5 - tr, .28 + .03 * Math.sin(t * 1.3));
  gira("Ear_L", 0, .5 - tl, .28 + .03 * Math.sin(t * 1.1 + 1));
  gira("frontHip_R", 0, 0, .5); gira("frontHip_L", 0, 0, .5);
  gira("backHip_R", 0, 0, -.5); gira("backHip_L", 0, 0, -.5);
  gira("Neck_M", 0, 0, .12);
}
/* respiração (0,9 Hz): o tórax sobe e alarga um pouco */
function respira(t, k) { var r = Math.sin(t * TAU * .9) * k; corpo.scale.set(1 + .012 * r, 1 + .018 * r, 1); }
/* lugar do coelho: deitado de barriga para baixo (vira = 0) ou de barriga para cima (vira = 1, cena 10) */
function poeCorpo(x, z, vira) {
  raiz.position.set(x, lerp(DEITA_Y + CENTRO_Y, 8.7, vira), z);
  raiz.rotation.set(0, 0, PI * vira);
  corpo.position.set(0, -CENTRO_Y, 0);
}

/* ------------------------------------------------------------ lente: um ponto do corpo, ou o caminho entre dois */
var LENTE = { de: "garupa", para: "garupa", k: 0 };
var _l1 = new V3(), _l2 = new V3();
function lenteMundo(alvo) {
  pontoMundo(LENTES[LENTE.de].c, _l1); pontoMundo(LENTES[LENTE.para].c, _l2);
  return alvo.lerpVectors(_l1, _l2, LENTE.k);
}
function lente(de, para, k, abre) {
  LENTE.de = de; LENTE.para = para; LENTE.k = k;
  U.uLensR.value = lerp(LENTES[de].r, LENTES[para].r, k); U.uLensA.value = abre;
}

/* ------------------------------------------------------------ estado de cada instante */
var EST = {};
function mundoDe(t) { var m = TOMADAS[0].mundo; TOMADAS.forEach(function (T) { if (T.t <= t) m = T.mundo; }); return m; }
function estado(t) {
  var k = cenaDe(t), u = t - S[k];
  ambienteVisivel(DBG.amb || mundoDe(t));
  if (!CO.ok) return;
  repouso();
  U.uTempo.value = t; U.uSuave.value = SUAVE.on ? 1 : 0;
  /* ponto de partida: tudo fechado */
  lente("garupa", "garupa", 0, 0);
  U.uFerida.value = 0; U.uTosa.value.set(0, 0, 0); U.uPrata.value = 0; U.uRif.value = 0; U.uAlcool.value = 0; U.uSujo.value = 1;
  UL.uAgita.value = 0;
  EST.ovos = -1; EST.eclode = 0; EST.cresce = 0; EST.tira = -1; EST.tiraAlto = -1; EST.mosca = -1; EST.lata = -1;
  var vira = 0, cz = 0, fome = 0;

  /* o que já aconteceu continua: feridas abertas desde a cena 3, prata no pelo desde a 4, tosa desde a 6 */
  if (k >= 2) { U.uFerida.value = k === 2 ? sai(seg(u, .6, 5.6)) : 1; EST.cresce = k === 2 ? lerp(.3, 1, sai(seg(u, .5, 6))) : 1; }
  if (k >= 3) U.uPrata.value = k === 3 ? sai(seg(u, 2, 3.6)) : 1;
  if (k >= 6) U.uTosa.value.set(1, 1, 1);

  if (k === 1) {                 /* 2. Como começa: a lente abre na garupa; a mosca pousa, entra no pelo e põe os ovos */
    lente("garupa", "garupa", 0, sai(seg(u, 1.8, 3)));
    EST.mosca = u; EST.ovos = u - 5.4;
  } else if (k === 2) {          /* 3. As larvas: os ovos eclodem e as feridas abrem; a lente passeia e fecha */
    EST.ovos = 99; EST.eclode = seg(u, .2, 1.4);
    var a = 1 - seg(u, 8.5, 9.2);
    if (u < 3.4) lente("garupa", "garupa", 0, a);
    else if (u < 5.8) lente("garupa", "dorso", eio(seg(u, 3.4, 4.4)), a);
    else lente("dorso", "perineo", eio(seg(u, 5.8, 7)), a);
  } else if (k === 3) {          /* 4. Antes da clínica: o spray prata; a lente mostra as feridas que ele não alcançou */
    EST.lata = u;
    lente("garupa", "garupa", 0, sai(seg(u, 4.8, 5.8)) * (1 - seg(u, 7.3, 7.9)));
  } else if (k === 5) {          /* 6. Tricotomia (rascunho: a máscara de tosa avança em faixas, sem a máquina) */
    U.uTosa.value.set(eio(seg(u, 1, 4.4)), eio(seg(u, 4.2, 7.6)), eio(seg(u, 7.4, 10.4)));
  } else if (k === 6) {          /* 7. Álcool e retirada (rascunho: as larvas se agitam, sobem e saem uma a uma) */
    U.uAlcool.value = sai(seg(u, .3, 1.6)); UL.uAgita.value = seg(u, .8, 1.6); EST.tira = u;
  } else if (k === 7) {          /* 8. Com a luva (rascunho: saem as que ficavam mais acima) */
    U.uAlcool.value = 1; UL.uAgita.value = .7; EST.tira = 99; EST.tiraAlto = u;
  } else if (k >= 8) {
    U.uAlcool.value = k === 8 ? 1 - seg(u, 0, 4) : 0; EST.tira = 99; EST.tiraAlto = 99;
    if (k === 9) { vira = eio(seg(u, 0, 1.5)); U.uRif.value = sai(seg(u, 2.5, 6.5)); }   /* 10. vira e recebe a rifamicina */
    if (k === 10) { U.uRif.value = 1; cz = -6; fome = 1; }                               /* 11. na baia, comendo */
  }

  poseDeitado(t);
  if (fome) {   /* cabeça baixa no pote, mastigando (3 Hz) */
    gira("Neck_M", 0, 0, .85);
    gira("Head_M", 0, 0, .3 + .035 * Math.sin(t * TAU * 3));
  }
  poeCorpo(0, cz, vira);
  respira(t, vira > 0 ? .5 : 1);

  if (DBG.rot) DBG.rot.forEach(function (r) { gira(r[0], r[1], r[2], r[3]); });
  if (DBG.u) DBG.u.forEach(function (r) { var v = U[r[0]].value; if (typeof v === "number") U[r[0]].value = r[1][0]; else v.set(r[1][0], r[1][1], r[1][2]); });
  if (DBG.lente) { LENTE.de = LENTE.para = DBG.lente; LENTE.k = 0; U.uLensR.value = LENTES[DBG.lente].r; }
  if (DBG.raiz) { raiz.position.set(DBG.raiz[0], DBG.raiz[1], DBG.raiz[2]); raiz.rotation.set(DBG.raiz[3] || 0, DBG.raiz[4] || 0, DBG.raiz[5] || 0); }
}

/* ------------------------------------------------------------ depois da pose: o que fica preso à pele */
var _g = new V3(), _m3 = new THREE.Matrix3(), _x = new V3(1, 0, 0), _ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
var _lp = new V3(), _ln = new V3(), _t1 = new V3(), _t2 = new V3(), _di = new V3(), _o = new V3(), _qs = new THREE.Quaternion();
function depoisDaPose(t) {
  if (!CO.ok) return;
  /* gravidade no espaço do objeto, para o pelo cair */
  _m3.setFromMatrix4(CO.sk.matrixWorld).invert();
  U.uGrav.value.set(0, -1, 0).applyMatrix3(_m3).normalize();
  CO.olhos.forEach(function (O) { pontoMundo(O.bind, O.m.position); });
  bigodes();
  poeLarvas(); poeOvos(); poeMosca(t); poeLata();
  MANCHA.material.opacity = U.uRif.value * .9;
  if (DBG.cam) { var c = DBG.cam; cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); }
}

/* larvas: nascem quando a ferida chega até elas, crescem, e saem na retirada (cenas 7 e 8).
   A cabeça (y = 1 na geometria) fica dentro da pele; a ponta de trás, com os espiráculos, fica para fora. */
function poeLarvas() {
  var off = lerp(-1.45, 0, U.uFerida.value), n = ANC.larvas.length;
  for (var i = 0; i < n; i++) {
    var L = ANC.larvas[i];
    var s = L.tam * clamp(((L.f + off) * 2.4 - .25) / .45, 0, 1) * EST.cresce, sobe = 0;
    var tt = L.alto ? EST.tiraAlto : EST.tira;
    if (tt >= 0) {
      var vez = L.alto ? 1.2 + L.ordem * 5.2 : 2.2 + L.ordem * 9;
      sobe = seg(tt, vez - .6, vez); s *= 1 - seg(tt, vez, vez + .25);
    }
    if (s < .01) { larvas.setMatrixAt(i, _ZERO); continue; }
    ancora(L, _lp, _ln);
    _t1.crossVectors(_ln, Math.abs(_ln.y) < .9 ? _y : _x).normalize(); _t2.crossVectors(_ln, _t1);
    var al = .35 + L.incl * .6;
    _di.copy(_ln).multiplyScalar(-Math.cos(al)).addScaledVector(_t1, Math.cos(L.gira) * Math.sin(al)).addScaledVector(_t2, Math.sin(L.gira) * Math.sin(al)).normalize();
    _o.copy(_lp).addScaledVector(_di, -s * (.5 + .45 * sobe));
    _q.setFromUnitVectors(_y, _di); _qs.setFromAxisAngle(_y, L.fase); _q.multiply(_qs);
    _m4.compose(_o, _q, _s.set(s, s, s)); larvas.setMatrixAt(i, _m4);
  }
  larvas.count = n; larvas.instanceMatrix.needsUpdate = true;
}
/* ovos: cada grupo aparece em 0,4 s, deitados lado a lado na pele, "descendo" o corpo; somem quando eclodem */
var _ov = new V3(0, -1, -.3), _od = new V3();
function poeOvos() {
  for (var i = 0; i < ANC.ovos.length; i++) {
    var E2 = ANC.ovos[i], quando = E2.grupo * .4 + E2.k * .022;
    var s = EST.ovos < 0 ? 0 : seg(EST.ovos, quando, quando + .12) * (1 - EST.eclode);
    if (s < .01) { ovos.setMatrixAt(i, _ZERO); continue; }
    ancora(E2, _lp, _ln);
    _t1.copy(_ov).addScaledVector(_ln, -_ov.dot(_ln)).normalize(); _t2.crossVectors(_ln, _t1);
    _od.copy(_t1).multiplyScalar(Math.cos(E2.gira)).addScaledVector(_t2, Math.sin(E2.gira))
      .multiplyScalar(Math.cos(E2.incl)).addScaledVector(_ln, Math.sin(E2.incl)).normalize();
    _o.copy(_lp).addScaledVector(_ln, .03);
    _q.setFromUnitVectors(_y, _od);
    _m4.compose(_o, _q, _s.set(s, s, s)); ovos.setMatrixAt(i, _m4);
  }
  ovos.instanceMatrix.needsUpdate = true;
}

/* mosca (cena 2, tempo local u): entra voando pela direita, pousa na ponta do pelo, desce até a pele, anda pelos
   5 grupos pondo os ovos (0,4 s cada) e vai embora */
var _cr = new V3(), _cu = new V3(), _pA = new V3(), _nA = new V3(), _pB = new V3(), _nB = new V3();
var _b0 = new V3(), _b1 = new V3(), _b2 = new V3(), _b3 = new V3(), _mp = new V3(), _mq = new V3(), _mf = new V3(), _mup = new V3();
function grupoPele(g, p, n) { ancora(ANC.grupos[clamp(g, 0, ANC.grupos.length - 1)], p, n); return p; }
function poeMosca(t) {
  var u = EST.mosca, G = ANC.grupos.length;
  if (u < 2.6 || u > 9) { MOSCA.g.visible = false; return; }
  MOSCA.g.visible = true;
  _cr.set(1, 0, 0).applyQuaternion(cam.quaternion); _cu.set(0, 1, 0).applyQuaternion(cam.quaternion);
  var voa = false, curva = 0;
  _mup.set(0, 1, 0);
  if (u < 5.4) {                          /* chega: voo, pouso na ponta do pelo, descida até a pele */
    grupoPele(0, _pA, _nA);
    _b3.copy(_pA).addScaledVector(_nA, PELO * 1.05);                        /* ponta do pelo */
    if (u < 4.6) {
      voa = true;
      _b0.copy(_b3).addScaledVector(_cr, 15).addScaledVector(_cu, 8);
      _b1.copy(_b0).addScaledVector(_cr, -6).addScaledVector(_cu, -5);
      _b2.copy(_b3).addScaledVector(_nA, 4).addScaledVector(_cr, 3);
      var kv = eio(seg(u, 2.6, 4.6));
      bezier(_b0, _b1, _b2, _b3, kv, _mp); bezier(_b0, _b1, _b2, _b3, Math.min(1, kv + .02), _mq);
      var trem = (1 - kv) * .35;
      _mp.x += Math.sin(u * 23) * trem; _mp.y += Math.sin(u * 17 + 1) * trem;
      _mf.subVectors(_mq, _mp); if (_mf.lengthSq() < 1e-6) _mf.copy(_cr).negate();
      _mf.y *= .3;
    } else {
      _mp.copy(_b3).lerp(_mq.copy(_pA).addScaledVector(_nA, .05), eio(seg(u, 5, 5.4)));
      _mf.copy(_cr).negate(); _mup.copy(_nA);
    }
  } else if (u < 7.4) {                   /* põe os ovos: um grupo a cada 0,4 s */
    var gk = Math.floor((u - 5.4) / .4), fr = (u - 5.4) / .4 - gk;
    grupoPele(gk, _pA, _nA); grupoPele(gk + 1, _pB, _nB);
    var anda = gk < G - 1 ? eio(seg(fr, .78, 1)) : 0;
    _mp.copy(_pA).lerp(_pB, anda).addScaledVector(_nA, .05);
    _mf.subVectors(_pB, _pA); if (gk >= G - 1 || _mf.lengthSq() < 1e-4) _mf.copy(_cr).negate();
    _mup.copy(_nA);
    curva = Math.sin(seg(fr, .05, .7) * PI);
  } else {                                /* sobe até a ponta do pelo e vai embora */
    grupoPele(G - 1, _pA, _nA);
    _b0.copy(_pA).addScaledVector(_nA, PELO * 1.05);
    if (u < 7.8) { _mp.copy(_pA).addScaledVector(_nA, .05).lerp(_b0, eio(seg(u, 7.4, 7.8))); _mf.copy(_cr).negate(); _mup.copy(_nA); }
    else {
      voa = true;
      _b1.copy(_b0).addScaledVector(_nA, 4);
      _b2.copy(_b0).addScaledVector(_cr, -8).addScaledVector(_cu, 8);
      _b3.copy(_b0).addScaledVector(_cr, -18).addScaledVector(_cu, 14);
      var ks = sai(seg(u, 7.8, 9));
      bezier(_b0, _b1, _b2, _b3, ks, _mp); bezier(_b0, _b1, _b2, _b3, Math.min(1, ks + .02), _mq);
      _mf.subVectors(_mq, _mp); _mf.y *= .3;
    }
  }
  /* a frente fica no plano da pele (perpendicular ao "cima") */
  _mf.addScaledVector(_mup, -_mf.dot(_mup)); if (_mf.lengthSq() < 1e-6) _mf.set(0, 0, 1);
  MOSCA.g.position.copy(_mp); orienta(MOSCA.g, _mf, _mup);
  MOSCA.abd.rotation.x = -.5 * curva;
  asasMosca(voa, t);
}

/* lata de spray prata (cena 4, tempo local u): entra pela direita da tela, aponta para a garupa, borrifa e sai */
var _alvo = new V3(), _bico = new V3(), _lf = new V3();
function poeLata() {
  var u = EST.lata;
  if (u < 0 || u > 4.9) { LATA.g.visible = false; NUVEM.p.visible = false; return; }
  _cr.set(1, 0, 0).applyQuaternion(cam.quaternion); _cu.set(0, 1, 0).applyQuaternion(cam.quaternion);
  pontoMundo(LENTES.garupa.c, _alvo); _alvo.y += 2.6;                     /* o pelo da garupa */
  var entra = sai(seg(u, .3, 1.4)), vai = eio(seg(u, 3.7, 4.7));
  _bico.copy(_alvo).addScaledVector(_cr, 12 + 10 * (1 - entra) + 14 * vai).addScaledVector(_cu, 3 + 4 * (1 - entra) + 3 * vai);
  /* lata em pé, girada para o alvo e inclinada para a frente: o bico aponta para a garupa */
  _lf.subVectors(_alvo, _bico); _lf.y = 0; _lf.normalize();
  orienta(LATA.g, _lf, _y);
  LATA.g.rotateX(.3);
  LATA.g.position.set(0, 0, 0); LATA.g.updateMatrixWorld();
  _lp.copy(LATA.bicoLocal).applyMatrix4(LATA.g.matrixWorld);                 /* onde o bico fica com a lata na origem */
  LATA.g.position.copy(_bico).sub(_lp);
  LATA.atu.position.y = 8.95 - .14 * sino(u, 1.55, 3.4);                     /* o dedo aperta a válvula */
  LATA.g.visible = true; LATA.g.updateMatrixWorld();
  _lp.copy(LATA.bicoLocal).applyMatrix4(LATA.g.matrixWorld);
  nuvem(u, _lp, _alvo, 1.7, 1.6);
}

/* ------------------------------------------------------------ rótulos */
var _r1 = new V3(), _r2 = new V3(), _r3 = new V3(), P_SUJO = new V3(1.2, 12.2, -9), P_FLANCO = new V3(5.4, 12.5, -1);
var ESCOLHA = {};
/* a larva que o rótulo aponta: a mais perto do centro da lente na tela, do lado virado para a câmera (e, na cena 4,
   numa parte da ferida sem prata). A escolha fica guardada, para o rótulo não pular de uma larva para outra. */
/* a mesma conta do shader (prataM e o recorte em manchas): esta parte da ferida ficou com prata? */
function temPrata(m) {
  return elipJS(m, PRATA) + (fbm3(m.x * .7 + 9, m.y * .7 + 9, m.z * .7 + 9) - .5) * .6 > .12 && vn3(m.x * .55 + 4, m.y * .55 + 4, m.z * .55 + 4) >= .48;
}
function larvaNaLente(semPrata) {
  var chave = semPrata ? "sem" : "com";
  if (ESCOLHA[chave] === undefined) {
    lenteMundo(_r3).project(cam);
    var rl = U.uLensS.value.z / (palco.clientWidth * ren.getPixelRatio()) * 2;   /* raio da lente na tela (unidades de x) */
    var melhor = 0, md = 1e9;
    ANC.larvas.forEach(function (L, i) {
      if (semPrata && temPrata(L.m)) return;
      ancora(L, _r1, _r2);
      if (_r2.dot(_lp.subVectors(cam.position, _r1)) < 0) return;      /* do outro lado do corpo */
      _r1.project(cam);
      var d = Math.hypot(_r1.x - _r3.x, (_r1.y - _r3.y) * 9 / 16);
      d += d > rl * .75 ? 10 : -L.f * .03;                                   /* fora da lente, só em último caso */
      if (d < md) { md = d; melhor = i; }
    });
    ESCOLHA[chave] = melhor;
  }
  return ancora(ANC.larvas[ESCOLHA[chave]], _r1, _r2);
}
rotulo(9.4, 11.8, "umidade e sujeira", "presas junto da pele", function () { return pontoMundo(P_SUJO, _r1); }, -15, 5);
rotulo(12.2, 14.9, "ovos", "postos na base do pelo", function () { return ancora(ANC.grupos[2], _r1, _r2); }, 11, -8);
rotulo(16.6, 18.4, "larvas", "cabeça para dentro, espiráculos para fora", function () { return larvaNaLente(false); }, 12, -9);
rotulo(26.6, 28.7, "spray prata", "de agropecuária", function () { return _r1.set(0, 5.5, 0).applyMatrix4(LATA.g.matrixWorld); }, -13, -6);
rotulo(30.9, 32.9, "ferida sem o produto", "as larvas continuam vivas", function () { return larvaNaLente(true); }, 12, -8);
rotulo(35, 40.4, "muito desidratado", null, function () { return pontoMundo(P_FLANCO, _r1); }, 11, -9);

/* ------------------------------------------------------------ câmera: tomadas no tempo global (mundo: estudio, mesa, baia) */
var V_GARUPA = [[26, 25, -22], [0, 7, -2.5]], V_DORSO = [[30, 30, 10], [0, 9.5, 3]], V_PERINEO = [[6, 8, -34], [0, 3, -4.5]], V_LARGA = [[40, 22, -30], [0, 6, 1]];
function vista(t, mundo, v, fov, corte) { tomada(t, mundo, v[0], v[1], fov || 30, corte); }
/* 1. Abertura: a câmera se aproxima */
tomada(0, "estudio", [64, 30, 44], [-6.5, 6.5, 13.9]);   /* o coelho à direita, para o título caber à esquerda */
tomada(6, "estudio", [46, 22, 32], [0, 7, 3.5]);
/* 2. Como começa: vai para a garupa e fica */
vista(8.2, "estudio", V_GARUPA); vista(18.4, "estudio", V_GARUPA);
/* 3. As larvas: acompanha a lente (dorso, depois região perineal) e se afasta no fim */
vista(19.4, "estudio", V_DORSO); vista(20.8, "estudio", V_DORSO);
vista(22.0, "estudio", V_PERINEO); vista(23.5, "estudio", V_PERINEO);
vista(25, "estudio", V_LARGA);
/* 4. Antes da clínica: plano largo para o spray, depois a garupa para a lente */
vista(28.6, "estudio", V_LARGA); vista(30.2, "estudio", V_GARUPA);
/* 5. Chegada: corte para a mesa */
tomada(33, "mesa", [50, 36, 54], [0, 6, 3], 30, true); tomada(41, "mesa", [40, 29, 44], [0, 6, 3]);
/* 6. Tricotomia: garupa, região perineal, e se afasta para mostrar o tamanho das lesões */
vista(42.2, "mesa", V_GARUPA); vista(47.6, "mesa", V_GARUPA); vista(50.6, "mesa", V_PERINEO); vista(53, "mesa", [[38, 30, -34], [0, 6, 1]]);
/* 7. Álcool e retirada */
tomada(55, "mesa", [22, 22, -20], [0, 7, -2], 28); tomada(65, "mesa", [19, 20, -17], [0, 7, -2], 28);
/* 8. Com a luva: as de cima, no dorso */
tomada(66.4, "mesa", [26, 32, 12], [0, 10, 2], 28); tomada(73, "mesa", [24, 30, 12], [0, 10, 2], 28);
/* 9. Acesso e soro: a orelha direita */
tomada(74.6, "mesa", [-20, 22, 24], [-4.3, 12.8, 8.3], 26); tomada(85, "mesa", [-17, 20, 21], [-4.3, 12.8, 8.3], 26);
/* 10. Rifamicina: plano largo enquanto ele vira, depois de cima, sobre a garupa */
tomada(86, "mesa", [40, 34, 44], [0, 7, 3]); tomada(87.6, "mesa", [40, 34, 44], [0, 7, 3]);
tomada(89.2, "mesa", [4, 32, -30], [0, 12, -4.5]); tomada(94, "mesa", [4, 30, -27], [0, 12, -4.5]);   /* de trás: a região perineal, entre as patas */
/* 11. Internamento: corte para a baia */
tomada(94, "baia", [40, 20, 30], [0, 4.5, 4], 30, true); tomada(104, "baia", [34, 17, 26], [0, 4.5, 4]);
