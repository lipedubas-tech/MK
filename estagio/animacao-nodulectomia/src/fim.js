
/* ============================================================ tomadas e rótulos da sala */
(function () {
  var s = S;
  /* 1. abertura: cadela em pé, de lado; a câmera se aproxima do nódulo */
  tomada(s[0], "sala", [-0.75, 0.44, 1.32], [-0.36, 0.25, 0], 30);
  tomada(s[0] + 3.4, "sala", [-0.42, 0.37, 1.2], [-0.2, 0.25, 0], 30);
  tomada(s[0] + 7.6, "sala", [-0.16, 0.31, 0.62], [-0.08, 0.255, 0.04], 30);
  /* 2. preparo: deita, intubação, tricotomia, antissepsia, panos */
  tomada(s[1], "sala", [-0.16, 0.31, 0.62], [-0.08, 0.255, 0.04], 30);
  tomada(s[1] + 1.9, "sala", [0.06, 0.6, 1.2], [-0.02, 0.12, -0.02], 30);
  tomada(s[1] + 3.7, "sala", [0.02, 0.9, 1.0], [-0.02, 0.06, -0.02], 30);
  tomada(s[1] + 5.0, "sala", [-0.05, 0.6, 0.46], [-0.09, 0.16, -0.025], 30);
  tomada(s[1] + 9.8, "sala", [-0.02, 0.58, 0.42], [-0.09, 0.16, -0.025], 30);
  tomada(s[1] + 12.6, "sala", [0.0, 0.78, 0.64], [-0.07, 0.11, -0.03], 30);
  tomada(s[1] + 13.95, "sala", [-0.07, 0.44, 0.24], [-0.095, 0.17, -0.024], 30);
  /* 11. pós-operatório */
  tomada(s[10], "sala", [0.12, 0.66, 0.86], [-0.05, 0.1, -0.05], 30, true);
  tomada(s[10] + 11.8, "sala", [-0.02, 0.5, 0.55], [-0.08, 0.13, -0.03], 30);
})();
var _sitioMundo = new V3();
function sitioMundo() { return cao.localToWorld(_sitioMundo.copy(SIT.c).addScaledVector(SIT.n, (NOD.sobe + NOD.rn * .8) * massaCao.scale.x)); }
rotulo(S[0] + 3.6, S[0] + 7.8, "sala", "Nódulo ulcerado", "aberto para fora e infeccionado, perto da axila", sitioMundo, 9, -9);
rotulo(S[1] + 7.2, S[1] + 9.9, "sala", "Lesão infeccionada", "antissepsia da periferia para a lesão", sitioMundo, 10, -8);
/* pós-operatório (fotos 4 a 6): ferida suturada, acesso venoso e extubação */
var _ferida = new V3(), _acesso = new V3(), _boca = new V3();
rotulo(S[10] + .9, S[10] + 4.8, "sala", "Ferida suturada", "pele em sutura contínua com náilon", function () { return cao.localToWorld(_ferida.copy(SIT.c).addScaledVector(SIT.n, .004)); }, 11, -9);
rotulo(S[10] + 2.0, S[10] + 4.8, "sala", "Acesso venoso", "no membro torácico", function () { return acesso.localToWorld(_acesso.set(0, 0, 0)); }, -2, 8);
rotulo(S[10] + 5.2, S[10] + 8.4, "sala", "Extubação", "quando volta o reflexo de deglutição", function () { return anest.localToWorld(_boca.copy(anest.boca)); }, 10, -10);

/* ============================================================ interface */
var E = { t: 0, tocando: false, tudo: false, cena: -1 };
var trilha = $("trilha"), barras = [];
CENAS.forEach(function (c, k) {
  var b = document.createElement("button"); b.type = "button"; b.title = (k + 1) + ". " + c.nome; b.setAttribute("aria-label", "Cena " + (k + 1) + ": " + c.nome);
  var i = document.createElement("i"); b.appendChild(i); b.onclick = function () { vai(k); }; trilha.appendChild(b); barras.push(i);
});
function vai(k, parado) { k = clamp(k, 0, NC - 1); E.t = S[k]; E.tocando = !parado; mostra(true); }
function anterior() { var k = cenaDe(E.t); vai(E.t - S[k] > 1.2 ? k : k - 1); }
function proxima() { var k = cenaDe(E.t); if (k < NC - 1) vai(k + 1); }
function tocaPausa() {
  if (!E.tocando) { var k = cenaDe(E.t); if (E.t >= S[k] + CENAS[k].dur - .05 && !E.tudo) { if (k < NC - 1) { vai(k + 1); return; } E.t = 0; } if (E.t >= TOTAL - .05) E.t = 0; }
  E.tocando = !E.tocando; mostra(true);
}
$("ant").onclick = anterior; $("prox").onclick = proxima; $("tocar").onclick = tocaPausa;
$("tudo").onclick = function () { E.tudo = !E.tudo; this.setAttribute("aria-pressed", E.tudo); if (E.tudo) { if (E.t >= TOTAL - .05) E.t = 0; E.tocando = true; } mostra(true); };
function telaCheia() {
  var d = document, el = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  var rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (rq) { var p = rq.call(el); if (p && p.catch) p.catch(function () { document.body.classList.toggle("cheia"); ajusta(); }); }
  else { document.body.classList.toggle("cheia"); ajusta(); }
}
$("cheia").onclick = telaCheia;
["fullscreenchange", "webkitfullscreenchange"].forEach(function (ev) { document.addEventListener(ev, function () { document.body.classList.toggle("cheia", !!(document.fullscreenElement || document.webkitFullscreenElement)); ajusta(); }); });
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  var k = e.key;
  if ((k === " " || k === "Enter") && e.target && e.target.tagName === "BUTTON") return;   /* o botão em foco responde sozinho */
  if (k === "ArrowRight" || k === "PageDown") { proxima(); e.preventDefault(); }
  else if (k === "ArrowLeft" || k === "PageUp") { anterior(); e.preventDefault(); }
  else if (k === " " || k === "Enter" && e.target === document.body) { tocaPausa(); e.preventDefault(); }
  else if (k === "f" || k === "F") { telaCheia(); e.preventDefault(); }
  else if (k === "Home") { vai(0); e.preventDefault(); }
  else if (k === "End") { vai(NC - 1); e.preventDefault(); }
  acorda();
});
/* toque: arrastar para o lado troca de cena; toque curto reproduz ou pausa */
(function () {
  var x0 = 0, y0 = 0, t0 = 0;
  palco.addEventListener("touchstart", function (e) { var p = e.changedTouches[0]; x0 = p.clientX; y0 = p.clientY; t0 = Date.now(); }, { passive: true });
  palco.addEventListener("touchend", function (e) {
    var p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) proxima(); else anterior(); }
    else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && Date.now() - t0 < 350) tocaPausa();
    acorda();
  }, { passive: true });
  palco.addEventListener("click", function (e) { if (e.pointerType === "mouse" || e.detail) { if (!("ontouchstart" in window)) tocaPausa(); } });
})();
var quietoT = 0;
function acorda() { document.body.classList.remove("quieto"); clearTimeout(quietoT); quietoT = setTimeout(function () { if (E.tocando) document.body.classList.add("quieto"); }, 2600); }
document.addEventListener("mousemove", acorda);

function mostra(forca) {
  var k = cenaDe(E.t), c = CENAS[k];
  if (k !== E.cena || forca) {
    E.cena = k; $("num").textContent = (k + 1) + "/" + NC; $("nome").textContent = c.nome;
  }
  for (var i = 0; i < NC; i++) barras[i].style.width = (100 * clamp((E.t - S[i]) / CENAS[i].dur, 0, 1)).toFixed(1) + "%";
  $("icone-tocar").setAttribute("d", E.tocando ? "M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" : "M7 4.5v15l13-7.5z");
  $("tocar").setAttribute("aria-label", E.tocando ? "Pausar" : "Reproduzir");
}
function legenda(t) {
  var k = cenaDe(t), txt = CENAS[k].leg, el = $("legenda");
  if (el.textContent !== txt) el.textContent = txt;
  var ab = $("abertura"); ab.style.opacity = (Math.min(seg(t, .2, 1), 1 - seg(t, 3.2, 4.2))).toFixed(3);
  el.style.opacity = k === 0 && t < 3.6 ? 0 : 1;
}

/* ============================================================ quadro */
/* a imagem 3D sobe 6% da altura do palco: o centro de cada tomada fica acima da legenda, que ocupa a faixa de baixo */
var DESLOC_Y = .06;
function ajusta() {
  var hb = document.body.classList.contains("cheia") ? 0 : (innerWidth < 760 ? 56 : 64);
  document.documentElement.style.setProperty("--hb", hb + "px");
  var W = palco.clientWidth, H = palco.clientHeight; if (!W || !H) return;
  ren.setSize(W, H, false); cam.setViewOffset(W, H, 0, H * DESLOC_Y, W, H);   /* também acerta o aspecto */
}
addEventListener("resize", ajusta);
var MUNDOS = { sala: sala, campo: typeof campo !== "undefined" ? campo : sala, bandeja: typeof bandeja !== "undefined" ? bandeja : sala };
function desenha(t) {
  poseSala(t);
  if (window.poseCampo) poseCampo(t);
  if (window.poseBandeja) poseBandeja(t);
  var mundo = camara(t);
  rotulos(t, mundo); legenda(t);
  ren.render(MUNDOS[mundo] || sala, cam);
}
var ult = 0;
function laco(agora) {
  var dt = ult ? Math.min(.1, (agora - ult) / 1000) : 0; ult = agora;
  if (E.tocando) {
    var k = cenaDe(E.t), fim = S[k] + CENAS[k].dur;
    E.t += dt;
    if (!E.tudo && E.t >= fim - .001 && k === E.cena) { E.t = fim - .001; E.tocando = false; }
    if (E.t >= TOTAL) { E.t = TOTAL - .001; E.tocando = false; E.tudo = false; $("tudo").setAttribute("aria-pressed", "false"); }
  }
  mostra(); desenha(E.t);
  requestAnimationFrame(laco);
}
/* para conferir quadros: ?t=12.5 abre parado nesse instante; window.__vai(t) desenha um instante */
window.__vai = function (t) { E.t = t; E.tocando = false; mostra(true); desenha(t); return pendentes; };
(function inicia() {
  TOMADAS.sort(function (a, b) { return a.t - b.t; });
  ajusta();
  var m = /[?&]t=([\d.]+)/.exec(location.search);
  if (m) { E.t = parseFloat(m[1]); E.tocando = false; } else { E.t = 0; E.tocando = !matchMedia("(prefers-reduced-motion: reduce)").matches; }
  var espera = setInterval(function () {
    if (pendentes > 0) return; clearInterval(espera);
    var c = $("carregando"); if (c) c.remove();
    window.__pronto = true; requestAnimationFrame(laco);
  }, 30);
})();
