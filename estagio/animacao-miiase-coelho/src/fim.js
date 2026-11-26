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
function alternaSuave() { SUAVE.on = !SUAVE.on; guardaSuave(); $("suave").setAttribute("aria-pressed", SUAVE.on); if (!E.tocando) desenha(E.t); }
$("suave").setAttribute("aria-pressed", SUAVE.on);
$("ant").onclick = anterior; $("prox").onclick = proxima; $("tocar").onclick = tocaPausa; $("suave").onclick = alternaSuave;
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
  else if (k === "s" || k === "S") { alternaSuave(); e.preventDefault(); }
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
  palco.addEventListener("click", function (e) { if (!("ontouchstart" in window)) tocaPausa(); });
})();
var quietoT = 0;
function acorda() { document.body.classList.remove("quieto"); clearTimeout(quietoT); quietoT = setTimeout(function () { if (E.tocando) document.body.classList.add("quieto"); }, 2600); }
document.addEventListener("mousemove", acorda);

function mostra(forca) {
  var k = cenaDe(E.t), c = CENAS[k];
  if (k !== E.cena || forca) {
    E.cena = k; $("num").textContent = (k + 1) + "/" + NC; $("nome").textContent = c.nome;
    palco.setAttribute("aria-label", "Cena " + (k + 1) + " de " + NC + ", " + c.nome + ": " + c.desc);
  }
  for (var i = 0; i < NC; i++) barras[i].style.width = (100 * clamp((E.t - S[i]) / CENAS[i].dur, 0, 1)).toFixed(1) + "%";
  $("icone-tocar").setAttribute("d", E.tocando ? "M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" : "M7 4.5v15l13-7.5z");
  $("tocar").setAttribute("aria-label", E.tocando ? "Pausar" : "Reproduzir");
}
function legenda(t) {
  var k = cenaDe(t), txt = CENAS[k].leg, el = $("legenda");
  if (el.textContent !== txt) el.textContent = txt;
  var ab = $("abertura"); ab.style.opacity = (Math.min(seg(t, .2, 1), 1 - seg(t, 3.2, 4.2))).toFixed(3);
  $("aviso").style.opacity = (Math.min(seg(t, 3.3, 3.8), 1 - seg(t, 5.6, 6))).toFixed(3);
  el.style.opacity = k === 0 && t < 3.6 ? 0 : 1;
}
/* anel da lente: centro e raio projetados na tela */
var _lc = new V3(), _lr = new V3(), _dir = new V3();
function anelLente() {
  var a = U.uLensA.value, anel = $("anel"), anel2 = $("anel2");
  if (a < .02 || !CO.ok) { anel.style.opacity = anel2.style.opacity = 0; return; }
  pontoMundo(U.uLensC.value, _lc);
  _dir.set(1, 0, 0).applyQuaternion(cam.quaternion);
  _lr.copy(_lc).addScaledVector(_dir, U.uLensR.value * .95 * Math.min(1, a * 1.4));
  var W = palco.clientWidth, H = palco.clientHeight;
  _lc.project(cam); _lr.project(cam);
  var x = (_lc.x * .5 + .5) * W, y = (-_lc.y * .5 + .5) * H, r = Math.abs(_lr.x - _lc.x) * .5 * W;
  [anel, anel2].forEach(function (c) { c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("r", r.toFixed(1)); c.style.opacity = clamp(a * 1.5, 0, 1); });
}

/* ============================================================ quadro */
var DESLOC_Y = .06;
function ajusta() {
  var hb = document.body.classList.contains("cheia") ? 0 : (innerWidth < 760 ? 56 : 64);
  document.documentElement.style.setProperty("--hb", hb + "px");
  var W = palco.clientWidth, H = palco.clientHeight; if (!W || !H) return;
  ren.setSize(W, H, false); cam.setViewOffset(W, H, 0, H * DESLOC_Y, W, H);
}
addEventListener("resize", ajusta);
function desenha(t) {
  _quadro++;
  estado(t);
  camara(t);
  cena3d.updateMatrixWorld(true);
  depoisDaPose(t);
  rotulos(t); legenda(t); anelLente();
  ren.render(cena3d, cam);
}
/* qualidade: se a média de quadros ficar abaixo de 30 por segundo por 2 s, usa metade das camadas de pelo */
var Q = { soma: 0, n: 0, baixou: false };
function mede(dt) {
  if (Q.baixou || !dt) return;
  Q.soma += dt; Q.n++;
  if (Q.soma > 2) { if (Q.n / Q.soma < 30 && CO.ok) { Q.baixou = true; CO.camadas.forEach(function (m, i) { m.visible = i % 2 === 1; }); } Q.soma = 0; Q.n = 0; }
}
var ult = 0;
function laco(agora) {
  var dt = ult ? Math.min(.1, (agora - ult) / 1000) : 0; ult = agora;
  if (E.tocando) {
    var k = cenaDe(E.t), fim = S[k] + CENAS[k].dur;
    E.t += dt;
    if (!E.tudo && E.t >= fim - .001 && k === E.cena) { E.t = fim - .001; E.tocando = false; }
    if (E.t >= TOTAL) { E.t = TOTAL - .001; E.tocando = false; E.tudo = false; $("tudo").setAttribute("aria-pressed", "false"); }
    mede(dt);
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
  if (/[?&]limpo/.test(location.search)) document.body.classList.add("limpo");
  if (/[?&]suave/.test(location.search)) { SUAVE.on = true; $("suave").setAttribute("aria-pressed", "true"); }
  var espera = setInterval(function () {
    if (pendentes > 0) return; clearInterval(espera);
    var c = $("carregando"); if (c) c.remove();
    window.__pronto = true; requestAnimationFrame(laco);
  }, 30);
})();
