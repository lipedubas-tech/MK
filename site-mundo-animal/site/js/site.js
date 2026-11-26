// Mundo Animal — comportamento do site
"use strict";

// WhatsApp da clínica (bio do Instagram, 25/11/2026). Só dígitos, com 55 e DDD.
const ZAP = "5548999247977";
const linkZap = msg => "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(msg);

function prepararZap(a, msg) {
  a.href = linkZap(msg);
  a.target = "_blank";
  a.rel = "noopener";
}
document.querySelectorAll("a.zap[data-msg]").forEach(a => prepararZap(a, a.dataset.msg));

// ---------- menu do celular ----------
const botaoMenu = document.querySelector(".botao-menu");
const menu = document.getElementById("menu");
function fecharMenu() {
  menu.classList.remove("aberto");
  botaoMenu.setAttribute("aria-expanded", "false");
}
botaoMenu.addEventListener("click", () => {
  const abrir = !menu.classList.contains("aberto");
  menu.classList.toggle("aberto", abrir);
  botaoMenu.setAttribute("aria-expanded", String(abrir));
});
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", fecharMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });

// ---------- "O que o seu pet precisa hoje?" ----------
const OPCOES = [
  { nome: "Vacina", servico: "Vacina", icone: "i-vacina", titulo: "Vacinas e reforços",
    texto: "Traga a carteirinha de vacinação, se tiver. A equipe diz qual vacina está na hora.",
    msg: "Olá! Quero vacinar meu pet. Ele é um (cão/gato) de (idade). Qual dia posso levar?" },
  { nome: "Consulta", servico: "Consulta", icone: "i-esteto", titulo: "Consulta",
    texto: "Conte o que está acontecendo: desde quando, se come, se bebe água, se mudou o comportamento.",
    msg: "Olá! Gostaria de marcar uma consulta. Meu pet é um (cão/gato) e está com: " },
  { nome: "Está mancando", servico: "Consulta", icone: "i-coracao", titulo: "Dor, manqueira ou queda",
    texto: "Evite dar remédio por conta própria. Se puder, mande um vídeo dele andando.",
    msg: "Olá! Meu pet está mancando / com dor. Desde quando: . Posso mandar um vídeo?" },
  { nome: "Exames", servico: "Exames", icone: "i-lab", titulo: "Exames, raio-X e ultrassom",
    texto: "Alguns exames de sangue pedem jejum. Pergunte antes de sair de casa.",
    msg: "Olá! Preciso fazer exames no meu pet. Precisa de jejum?" },
  { nome: "Castração", servico: "Castração (avaliação)", icone: "i-cirurgia", titulo: "Castração",
    texto: "A castração é marcada com antecedência e pede jejum. A equipe orienta o preparo.",
    msg: "Olá! Quero castrar meu pet. Ele é um (cão/gato), (macho/fêmea), de (idade). Como funciona?" },
  { nome: "Banho e tosa", servico: "Banho e tosa", icone: "i-tesoura", titulo: "Banho e tosa",
    texto: "Diga o porte e o tipo de pelo para a equipe reservar o tempo certo. Também buscamos e entregamos.",
    msg: "Olá! Quero agendar banho e tosa. Porte: . Pelo curto ou longo: . Preciso de busca e entrega? (sim/não)" },
  { nome: "Pet shop", icone: "i-tigela", titulo: "Pet shop",
    texto: "Pergunte se o produto está em estoque antes de sair de casa. Dá para reservar pelo WhatsApp.",
    msg: "Olá! Vocês têm em estoque: " },
];

const listaOpcoes = document.getElementById("opcoes");
const rTitulo = document.getElementById("r-titulo");
const rTexto = document.getElementById("r-texto");
const rIcone = document.querySelector("#r-icone use");
const rZap = document.getElementById("r-zap");
const rAgendar = document.getElementById("r-agendar");

function escolher(i) {
  listaOpcoes.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
  const o = OPCOES[i];
  rTitulo.textContent = o.titulo;
  rTexto.textContent = o.texto;
  rIcone.setAttribute("href", "#" + o.icone);
  prepararZap(rZap, o.msg);
  rAgendar.hidden = !o.servico;
  rAgendar.dataset.servico = o.servico || "";
}
OPCOES.forEach((o, i) => {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = o.nome;
  b.addEventListener("click", () => escolher(i));
  li.appendChild(b);
  listaOpcoes.appendChild(li);
});
escolher(0);

// ---------- agendamento ----------
// Atendimento das 8h às 12h e das 13h às 18h (Felipe, 26/11). Os dias são de exemplo: fecha aos domingos, sábado só de manhã.
const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const form = document.getElementById("form-agenda");
const campoDia = document.getElementById("f-dia");
const grade = document.getElementById("horarios");
const dica = document.getElementById("dica-hora");
const erro = document.getElementById("erro");
const confirmado = document.getElementById("confirmado");
const selServico = document.getElementById("f-servico");
const blocoBanho = document.getElementById("f-banho");
let hora = "";

const doisDig = n => String(n).padStart(2, "0");
const amanha = new Date();
amanha.setDate(amanha.getDate() + 1);
campoDia.min = amanha.getFullYear() + "-" + doisDig(amanha.getMonth() + 1) + "-" + doisDig(amanha.getDate());

function montarHorarios() {
  grade.innerHTML = "";
  hora = "";
  if (!campoDia.value) { dica.textContent = "Escolha um dia para ver os horários."; return; }
  const d = new Date(campoDia.value + "T12:00");
  if (d.getDay() === 0) { dica.textContent = "A clínica não abre aos domingos. Escolha outro dia."; return; }
  const lista = d.getDay() === 6 ? HORARIOS.filter(h => h < "12:00") : HORARIOS;
  dica.textContent = d.getDay() === 6 ? "Sábado: só pela manhã." : "";
  lista.forEach(h => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = h;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", "false");
    b.addEventListener("click", () => {
      grade.querySelectorAll("button").forEach(x => x.setAttribute("aria-checked", "false"));
      b.setAttribute("aria-checked", "true");
      hora = h;
      erro.hidden = true;
    });
    grade.appendChild(b);
  });
}
campoDia.addEventListener("change", montarHorarios);

function atualizarBanho() { blocoBanho.hidden = selServico.value !== "Banho e tosa"; }
selServico.addEventListener("change", atualizarBanho);

// Links e botões com data-servico já escolhem o serviço no formulário.
document.addEventListener("click", e => {
  const alvo = e.target.closest("[data-servico]");
  if (!alvo || !alvo.dataset.servico) return;
  selServico.value = alvo.dataset.servico;
  atualizarBanho();
  if (!confirmado.hidden) { confirmado.hidden = true; form.hidden = false; }
});

form.addEventListener("input", () => { erro.hidden = true; });
form.addEventListener("submit", ev => {
  ev.preventDefault();
  const f = new FormData(form);
  const falta = [];
  if (!f.get("servico")) falta.push("o serviço");
  const ehBanho = f.get("servico") === "Banho e tosa";
  if (ehBanho) {
    if (!f.get("banho_tipo")) falta.push("o tipo de banho");
    if (!f.get("porte")) falta.push("o porte");
    if (!f.get("pelo")) falta.push("o pelo");
  }
  if (!f.get("dia")) falta.push("o dia");
  if (!hora) falta.push("o horário");
  if (!f.get("animal")) falta.push("o nome do pet");
  if (!f.get("especie")) falta.push("a espécie");
  if (!f.get("tutor")) falta.push("o seu nome");
  if (!f.get("fone")) falta.push("o telefone");
  if (!f.get("aceite")) falta.push("a autorização");
  if (falta.length) {
    erro.textContent = "Falta preencher: " + falta.join(", ") + ".";
    erro.hidden = false;
    return;
  }
  const dataBR = new Date(f.get("dia") + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
  const servico = ehBanho
    ? f.get("banho_tipo") + " (porte " + f.get("porte").split(" ")[0].toLowerCase() + ", pelo " + f.get("pelo").toLowerCase() + ")"
      + (f.get("busca") ? ", com busca e entrega" : "")
    : f.get("servico");
  const resumo = servico + " para " + f.get("animal") + " (" + f.get("especie").toLowerCase() + "), " + dataBR + ", às " + hora + ".";
  document.getElementById("c-resumo").textContent = resumo;
  const msg = "Olá! Fiz um pedido de horário pelo site.\n" + resumo
    + "\nNome: " + f.get("tutor") + "\nTelefone: " + f.get("fone")
    + (f.get("obs") ? "\nObservação: " + f.get("obs") : "");
  document.getElementById("c-zap").href = linkZap(msg);
  form.hidden = true;
  confirmado.hidden = false;
  confirmado.focus();
});
document.getElementById("c-novo").addEventListener("click", () => {
  form.reset();
  montarHorarios();
  atualizarBanho();
  confirmado.hidden = true;
  form.hidden = false;
  selServico.focus();
});

// ---------- foto ampliada ----------
const lupa = document.getElementById("lupa");
const lupaImg = document.getElementById("lupa-img");
const lupaLegenda = document.getElementById("lupa-legenda");
document.querySelectorAll(".foto-botao").forEach(b => b.addEventListener("click", () => {
  const img = b.querySelector("img");
  if (typeof lupa.showModal !== "function") { window.open(img.src, "_blank"); return; }
  lupaImg.src = img.src;
  lupaImg.alt = img.alt;
  lupaLegenda.textContent = b.dataset.legenda || img.alt;
  lupa.showModal();
}));
lupa.addEventListener("click", e => { if (e.target === lupa) lupa.close(); });

// ---------- itens a confirmar (só enquanto o site está em revisão) ----------
const raiz = document.documentElement;
const alternar = document.querySelector(".alternar-revisao");
function aplicarRevisao(ligado) {
  raiz.classList.toggle("revisao", ligado);
  alternar.setAttribute("aria-pressed", String(ligado));
  alternar.textContent = ligado ? "Itens a confirmar: visíveis" : "Itens a confirmar: ocultos";
}
let revisaoSalva = null;
try { revisaoSalva = localStorage.getItem("ma-revisao"); } catch (e) { /* sem armazenamento */ }
aplicarRevisao(revisaoSalva !== "0");
alternar.addEventListener("click", () => {
  const ligado = !raiz.classList.contains("revisao");
  aplicarRevisao(ligado);
  try { localStorage.setItem("ma-revisao", ligado ? "1" : "0"); } catch (e) { /* sem armazenamento */ }
});
