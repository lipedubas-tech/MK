/* ===== interface: navegação por cenas, modo contínuo, legendas, rótulos e laço de renderização ===== */
var $ = function (id) { return document.getElementById(id) };
var u = 0, tocando = true, modoTudo = false, ultimo = 0, kAnt = -1, prontoTudo = false;
var svgNS = "http://www.w3.org/2000/svg", elRot = [], W = 1, H = 1;

function tamanho() {
  W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
  ren.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
  host.style.setProperty("--u", (W / 100) + "px"); $("linhas").setAttribute("viewBox", "0 0 " + W + " " + H)
}
window.addEventListener("resize", tamanho);

function vaiPara(k, tocar) { u = cl(k, 0, NC - 1e-4); tocando = tocar !== false; kAnt = -1 }
function proxima() { modoTudo = false; vaiPara(Math.floor(u) + 1 >= NC ? 0 : Math.floor(u) + 1); syncBotoes() }
function anterior() { modoTudo = false; var k = Math.floor(u); vaiPara(u - k > .15 ? k : Math.max(0, k - 1)); syncBotoes() }
function tudo() {
  modoTudo = !modoTudo;
  if (modoTudo) { if (u >= NC - .01) u = 0; tocando = true } else tocando = false;
  syncBotoes()
}
function syncBotoes() { $("btTudo").setAttribute("aria-pressed", String(modoTudo)); $("btTudo").textContent = modoTudo ? "❚❚ Pausar" : "Reproduzir tudo" }
function telaCheia() { if (document.fullscreenElement) document.exitFullscreen(); else if (host.requestFullscreen) host.requestFullscreen(); else if (host.webkitRequestFullscreen) host.webkitRequestFullscreen() }

function liga() {
  for (var i = 0; i < NC; i++) $("pontos").appendChild(document.createElement("i"));
  $("btAnt").onclick = function (e) { e.stopPropagation(); anterior() };
  $("btProx").onclick = function (e) { e.stopPropagation(); proxima() };
  $("btTudo").onclick = function (e) { e.stopPropagation(); tudo() };
  $("btTela").onclick = function (e) { e.stopPropagation(); telaCheia() };
  host.addEventListener("click", function () { proxima() });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") { proxima(); e.preventDefault() }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { anterior(); e.preventDefault() }
    else if (e.key === " ") { if (modoTudo) { tocando = !tocando } else tocando = !tocando; e.preventDefault() }
    else if (e.key === "f" || e.key === "F") telaCheia();
    else if (e.key === "Home") { vaiPara(0); modoTudo = false; syncBotoes() }
  });
  /* rótulos: um elemento e uma linha-guia para cada */
  ROTULOS.forEach(function (r) {
    var el = document.createElement("div"); el.className = "rot"; el.textContent = r.t; $("rotulos").appendChild(el);
    var ln = document.createElementNS(svgNS, "path"); ln.setAttribute("stroke", "rgba(238,245,244,.85)"); ln.setAttribute("stroke-width", "1.5"); ln.setAttribute("fill", "none");
    var dot = document.createElementNS(svgNS, "circle"); dot.setAttribute("r", "3.5"); dot.setAttribute("fill", "#7fd3c9");
    $("linhas").appendChild(ln); $("linhas").appendChild(dot); elRot.push({ r: r, el: el, ln: ln, dot: dot })
  });
  for (i = 0; i < 3; i++) { var ok = document.createElement("div"); ok.className = "ok"; ok.textContent = "sem sangramento"; $("oks").appendChild(ok) }
}

var _v = new V();
function tela(p) { _v.copy(p).project(cam); return [(_v.x * .5 + .5) * W, (-_v.y * .5 + .5) * H, _v.z < 1] }

function painel(u) {
  var k = Math.min(NC - 1, Math.floor(u)), s = u - k;
  if (k !== kAnt) {
    kAnt = k; $("num").textContent = (k + 1) + "/" + NC; $("titulo").textContent = CENAS[k].t; $("leg").textContent = CENAS[k].leg;
    Array.prototype.forEach.call($("pontos").children, function (el, i) { el.className = i < k ? "feito" : i === k ? "agora" : "" });
    $("badge").style.display = k === 6 ? "inline-block" : "none"
  }
  $("abertura").style.opacity = k === 0 ? 1 - RP(s, .85, 1) : 0;
  $("credito").style.opacity = k === 0 || k === 10 ? 1 : 0;
  $("foto").style.opacity = k === 10 && s > .42 ? 1 : 0;
  $("veu").style.opacity = cl(1 - Math.abs(u - 10) / .035, 0, 1);
  var vazio = $("carregando"); if (vazio) vazio.remove();
  /* rótulos */
  var esc = W / 100;
  elRot.forEach(function (o) {
    var r = o.r, a = WN(u, r.a, r.a + .03, r.b - .03, r.b), vis = a > .01;
    if (vis) { var p = r.p(); if (!p) vis = false; else { var t = tela(p); vis = t[2] } }
    o.el.style.opacity = vis ? a : 0; o.ln.style.opacity = o.dot.style.opacity = vis ? a : 0;
    if (!vis) return;
    var lx = t[0] + r.dx * esc * 7, ly = t[1] + r.dy * esc * 5.2, bw = o.el.offsetWidth, bh = o.el.offsetHeight;
    lx = cl(lx, esc + (r.dx < 0 ? bw : 0), W - esc - (r.dx < 0 ? 0 : bw)); ly = cl(ly, esc * 6 + bh / 2, H - esc * 8 - bh / 2);
    o.el.style.transform = "translate(" + (r.dx < 0 ? lx - bw : lx) + "px," + (ly - bh / 2) + "px)";
    o.ln.setAttribute("d", "M" + t[0] + "," + t[1] + " L" + lx + "," + ly); o.dot.setAttribute("cx", t[0]); o.dot.setAttribute("cy", t[1])
  });
  /* lupa da hemostasia */
  var lupa = $("lupa"), alvos = [coto[1], coto[-1], coto.corpo], tem = [[8.13, 8.38], [8.4, 8.63], [8.65, 8.88]], li = -1;
  tem.forEach(function (tt, i) { if (u > tt[0] && u < tt[1]) li = i });
  if (li >= 0 && alvos[li]) {
    var a0 = li > 0 && alvos[li - 1] ? alvos[li - 1] : alvos[li], mv = RP(u, tem[li][0], tem[li][0] + .08), q = tela(vl(a0, alvos[li], mv));
    lupa.style.opacity = 1; lupa.style.transform = "translate(" + q[0] + "px," + q[1] + "px)"
  } else lupa.style.opacity = 0;
  Array.prototype.forEach.call($("oks").children, function (el, i) {
    var on = u > tem[i][0] + .12 && u < 8.98 && alvos[i]; el.style.opacity = on ? 1 : 0;
    if (on) { var q = tela(alvos[i]); el.style.transform = "translate(" + q[0] + "px," + (q[1] + esc * 4.6) + "px) translate(-50%,-50%)" }
  })
}

function quadro(agora) {
  requestAnimationFrame(quadro);
  var dt = Math.min(.1, (agora - (ultimo || agora)) / 1000); ultimo = agora;
  if (!prontoTudo) return;
  if (tocando) {
    var k = Math.floor(u); u += dt / CENAS[Math.min(NC - 1, k)].d;
    if (!modoTudo && Math.floor(u) > k) { u = k + .9999; tocando = false }
    if (u >= NC) { u = NC - 1e-4; tocando = false; modoTudo = false; syncBotoes() }
  }
  desenha()
}
function desenha() { aplica(u); camera(u); ren.render(scene, cam); painel(u) }

tamanho();
carregaGata(function () {
  iniciaCampo(); criaOrgaos(); iniciaRoteiro(); rotulos(); liga();
  prontoTudo = true;
  window.DBG = { pronto: true, ir: function (x) { u = x; tocando = false; desenha() }, get u() { return u }, THREE: THREE, scene: scene, cam: cam, ossos: ossos,
    olhar: function (p, t, up) { cam.position.set(p[0], p[1], p[2]); cam.up.set(0, 1, 0); if (up) cam.up.set(up[0], up[1], up[2]); cam.lookAt(t[0], t[1], t[2]); ren.render(scene, cam) } }
});
requestAnimationFrame(quadro);
