(function(){var n=document.getElementById("nojs");if(n)n.parentNode.removeChild(n)})();
function dec(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
var steps=[
{t:"O esqueleto e o cotovelo",est:"Escápula, úmero, rádio, ulna e olécrano (membro anterior esquerdo)",obj:"Localizar a região operada antes da intervenção",ins:"Nenhum nesta etapa",
 ph:[[0,"Katita, 7 anos, SRD, 35 kg, foi atropelada. No esqueleto inteiro, o úmero do membro anterior esquerdo está fraturado junto ao cotovelo."],[.5,"De perto: a ponta do úmero está partida em três pedaços, a diáfise e os dois côndilos."]]},
{t:"A lesão: fratura em Y",est:"Diáfise do úmero e côndilos lateral e medial",obj:"Reconhecer a fratura do úmero distal em três partes",ins:"Radiografia (diagnóstico por imagem)",
 ph:[[0,"O úmero quebrou em formato de Y: uma linha separa os dois côndilos e outras duas os soltam da diáfise, o corpo do osso."],[.3,"O côndilo lateral (vermelho) e o medial (âmbar) estão fora do lugar. O contorno brilhante mostra a posição original de cada um."],[.65,"As faces rosadas são o osso esponjoso exposto pela fratura. As radiografias reais mostram a mesma lesão."]]},
{t:"Acesso: osteotomia do olécrano",est:"Pele, músculo, olécrano, ulna proximal e tríceps braquial",obj:"Expor a articulação para enxergar e reduzir o úmero distal",ins:"Bisturi, afastador autoestático, afastador de Hohmann, serra oscilatória",
 ph:[[0,"O acesso é pela face caudal do cotovelo. O bisturi abre a pele sobre a articulação."],[.15,"Um afastador autoestático mantém a pele e o músculo abertos, e o osso aparece no fundo da incisão."],[.24,"Com os tecidos afastados, o cotovelo fica exposto por trás. Daqui em diante a pele e o músculo ficam ocultos, para mostrar o osso."],[.356,"Com um afastador de Hohmann protegendo os tecidos do lado medial, a serra oscilatória faz um corte transversal no olécrano, de lateral para medial."],[.615,"O olécrano é rebatido para cima, junto com a inserção do tríceps, e abre o acesso à articulação."]]},
{t:"Redução e parafuso intercondilar",est:"Côndilos medial e lateral do úmero",obj:"Recompor a superfície articular e comprimir os fragmentos",ins:"Pinça de redução pontiaguda, furadeira ortopédica, chave sextavada, parafuso de compressão",
 ph:[[0,"A pinça de redução pontiaguda apoia uma ponta em cada epicôndilo e leva os côndilos de volta ao lugar, até a superfície articular ficar contínua."],[.5,"A furadeira abre um túnel que atravessa os dois côndilos, de lateral para medial."],[.8,"Com a chave sextavada, o parafuso intercondilar avança girando e comprime um côndilo contra o outro. O trecho dentro do osso aparece em azul-claro."]]},
{t:"Placas e parafusos",est:"Úmero distal e diáfise (faces lateral e medial), canal medular",obj:"Fixar os côndilos ao corpo do úmero com estabilidade",ins:"Placas ortopédicas, furadeira, parafusos corticais, pino intramedular",
 ph:[[0,"Duas placas moldadas ao osso são apoiadas nas faces lateral e medial do úmero."],[.22,"Cada parafuso é precedido por uma perfuração e depois apertado até encostar na placa, atravessando o osso."],[.8,"Um pino intramedular é introduzido pelo canal do úmero."]]},
{t:"Banda de tensão e pinos",est:"Olécrano, ulna e canal medular da ulna",obj:"Refixar o olécrano, transformando a tração do tríceps em compressão",ins:"Furadeira, pinos de Kirschner, fio de cerclagem",
 ph:[[0,"O olécrano volta à posição anatômica."],[.3,"Dois pinos longos entram pela ponta do olécrano e descem pela ulna."],[.62,"Um túnel fino é perfurado na ulna, abaixo do corte, para ancorar o fio de aço."],[.74,"O fio de cerclagem cruza em oito por trás do osso e é preso nas pontas dos pinos."]]},
{t:"Fechamento",est:"Músculo, tecido subcutâneo e pele",obj:"Reconstruir os planos de tecido e proteger a fixação",ins:"Porta-agulhas, fio absorvível (violeta) e nylon (escuro)",
 ph:[[0,"Pela incisão ainda aberta dá para ver as placas. Os planos musculares são reaproximados."],[.32,"Sutura do músculo com fio absorvível, ponto a ponto."],[.62,"Sutura da pele com fio de nylon. A pele em volta foi raspada antes da cirurgia."]]}
];
var LB={r:[["Escápula",-.09,.21,.13],["Úmero",-.102,.03,.168],["Cotovelo fraturado",-.092,-.05,.12],["Ulna e rádio",-.09,-.17,.125]],
1:[["Diáfise do úmero",-.104,.012,.166],["Côndilo lateral",-.128,-.05,.128],["Côndilo medial",-.066,-.05,.136],["Rádio",-.088,-.125,.142],["Ulna",-.108,-.14,.112]],
inc:[["Incisão de pele",-.1287,.0341,.1393]],
2:[["Olécrano",-.0985,-.02,.075],["Corte (osteotomia)",-.108,-.043,.088]],
3:[["Parafuso intercondilar",-.1195,-.0612,.1245]],
4:[["Placa lateral",-.1195,.004,.153],["Parafusos",-.1235,-.0315,.128]],
5:[["Pinos",-.105,-.14,.112],["Banda de tensão",-.103,-.062,.083]],
6:[["Músculo: fio absorvível",-.117,-.02,.1],["Pele: nylon",-.1235,-.09,.094]]};
var N=steps.length,DUR=[8,8,14,11,14,12,11],A3={u:0},api=null,speed=1,playing=!matchMedia("(prefers-reduced-motion: reduce)").matches,$=function(x){return document.getElementById(x)};
var tickEl=$("ticks"),lastK=-1,lastP=-1,figs=document.querySelectorAll(".rf");
/* três páginas no mesmo endereço: #caso, #cirurgia, #discussao */
var PGS=["caso","cirurgia","discussao"],curPg="caso";
function route(){var h=(location.hash||"").replace("#",""),pg=PGS.indexOf(h)>=0?h:(h==="s2"?"cirurgia":"caso"),chg=pg!==curPg;curPg=pg;
  Array.prototype.forEach.call(document.querySelectorAll(".pg"),function(e){e.hidden=e.getAttribute("data-pg")!==pg});$("wrap").setAttribute("data-pg",pg);
  Array.prototype.forEach.call(document.querySelectorAll(".tabs a"),function(a){if(a.getAttribute("data-pg")===pg)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  if(pg==="cirurgia"&&api)api.resize();if(chg)window.scrollTo(0,0)}
addEventListener("hashchange",route);route();
/* galeria: uma miniatura por figura do caso; o clique leva à etapa correspondente */
var thumbs=[];Array.prototype.forEach.call(figs,function(g){var im=g.querySelector("img"),k=+g.getAttribute("data-k"),cap=g.querySelector("figcaption"),b=document.createElement("button");
  b.type="button";b.className="th"+(g.querySelector(".veil")?" vl":"");var fn=cap.querySelector("b").textContent;
  b.innerHTML='<span class="im"><img alt=""></span><b><i></i></b>';b.querySelector("img").src=im.src;b.querySelector("i").textContent=fn;b.querySelector("b").appendChild(document.createTextNode(" · etapa "+(k+1)+": "+steps[k].t));
  b.setAttribute("aria-label",fn+", etapa "+(k+1)+": "+steps[k].t);b.onclick=function(){go(k);var st=$("stage");if(st&&st.getBoundingClientRect().top<0)st.scrollIntoView({behavior:"smooth",block:"start"})};
  $("thumbs").appendChild(b);thumbs.push({b:b,k:k})});
steps.forEach(function(s,n){var b=document.createElement("button");b.className="tk";b.textContent=n+1;b.setAttribute("aria-label","Etapa "+(n+1)+": "+s.t);b.title=(n+1)+". "+s.t;b.onclick=function(){go(n)};tickEl.appendChild(b)});
function go(n,end){n=((n%N)+N)%N;A3.u=n+(end?.995:.0);lastK=-1;uiTick()}
function uiTick(){var u=A3.u>=0?A3.u:0,k=Math.min(N-1,Math.floor(u)),f=u-k,S=steps[k],pi=0;
  for(var q=0;q<S.ph.length;q++)if(f>=S.ph[q][0])pi=q;
  if(k!==lastK){lastK=k;$("chip").textContent="Etapa "+(k+1)+" de "+N;$("hchip").textContent="Etapa "+(k+1)+" de "+N;$("t").textContent=S.t;$("pt").textContent=S.t;$("m1").textContent=S.est;$("m2").textContent=S.obj;$("m3").textContent=S.ins;
    Array.prototype.forEach.call(figs,function(g){g.hidden=g.getAttribute("data-k")!==String(k)});thumbs.forEach(function(t){t.b.className=t.b.className.replace(" on","")+(t.k===k?" on":"")});
    Array.prototype.forEach.call(tickEl.children,function(b,i){b.className="tk"+(i===k?" on":(i<k?" done":""))});lastP=-1}
  if(pi!==lastP||lastP===-1){lastP=pi;$("d").textContent=S.ph[pi][1];$("pd").textContent=S.ph[pi][1]}
  var tl=$("tl");if(document.activeElement!==tl)tl.value=Math.round(u*1000);
  $("pp").textContent=playing?"Pausar":"Reproduzir"}
function stepBack(){var k=Math.floor(A3.u);go(A3.u-k>.15?k:k-1)}
function stepFwd(){go(Math.floor(A3.u)+1)}
function togglePlay(){playing=!playing;if(playing&&A3.u>=6.99)go(0);uiTick()}
$("prev").onclick=stepBack;$("next").onclick=stepFwd;
$("rst").onclick=function(){go(Math.floor(A3.u));playing=true};
$("pp").onclick=togglePlay;
var tlb=$("tl");
tlb.addEventListener("input",function(){A3.u=Math.min(6.999,tlb.value/1000);lastK=-1;if(window.setDragSlider)setDragSlider(true);uiTick()});
["change","pointerup","keyup","blur"].forEach(function(ev){tlb.addEventListener(ev,function(){if(window.setDragSlider)setDragSlider(false)})});
$("spd").onchange=function(){speed=parseFloat(this.value)};
function press(id,fn){$(id).onclick=function(){var on=this.getAttribute("aria-pressed")!=="true";this.setAttribute("aria-pressed",on);fn(on,this)}}
Array.prototype.forEach.call(document.querySelectorAll("#views button"),function(b){b.onclick=function(){if(api)api.view(b.getAttribute("data-v"))}});
press("iso",function(on){if(api)api.iso(on)});
press("cmp",function(on){if(api)api.cmp(on)});
press("xr",function(on){if(api)api.xray(on)});
press("pov",function(on,b){b.textContent=on?"Voltar à visão externa":"Visão do cirurgião";if(api)api.pov(on)});
press("pres",function(on,b){b.textContent=on?"Sair da apresentação":"Modo apresentação";$("wrap").classList.toggle("present",on);
  try{if(on){var el=document.documentElement,rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq){var pr=rq.call(el);if(pr&&pr.catch)pr.catch(function(){})}}
    else if(document.fullscreenElement||document.webkitFullscreenElement){var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex){var p2=ex.call(document);if(p2&&p2.catch)p2.catch(function(){})}}}catch(e){}
  if(api)api.resize()});
$("zin").onclick=function(){if(api)api.zoom(.8)};$("zout").onclick=function(){if(api)api.zoom(1.25)};$("zrs").onclick=function(){if(api)api.zoom(0)};
Array.prototype.forEach.call(document.querySelectorAll(".veil button"),function(b){b.onclick=function(){b.parentNode.classList.add("open")}});
document.addEventListener("keydown",function(e){var tg=e.target&&e.target.tagName;if(curPg!=="cirurgia"&&!$("wrap").classList.contains("present"))return;if(tg==="INPUT"||tg==="SELECT"||tg==="TEXTAREA"||e.ctrlKey||e.metaKey||e.altKey)return;
  var k=e.key;
  if(k==="ArrowRight"||k==="PageDown"){stepFwd();e.preventDefault()}
  else if(k==="ArrowLeft"||k==="PageUp"){stepBack();e.preventDefault()}
  else if(k===" "&&tg!=="BUTTON"){togglePlay();e.preventDefault()}
  else if(k==="x"||k==="X")$("xr").click();
  else if(k==="f"||k==="F")$("pres").click();
  else if(k==="Escape"&&$("wrap").classList.contains("present"))$("pres").click()});

function build(){
  var host=$("stage"),V=THREE.Vector3,Y=new V(0,1,0),PI=Math.PI;
  var calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ren=new THREE.WebGLRenderer({antialias:true,alpha:true});ren.setPixelRatio(Math.min(devicePixelRatio||1,2));ren.outputEncoding=THREE.sRGBEncoding;ren.setClearColor(0,0);
  host.insertBefore(ren.domElement,host.firstChild);
  var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,.8,.01,40);
  try{var pmg=new THREE.PMREMGenerator(ren),es=new THREE.Scene(),eg=new THREE.SphereGeometry(5,24,16),ecol=[],ep=eg.attributes.position;
    for(var q=0;q<ep.count;q++){var yy=ep.getY(q)/5,v=.3+.5*Math.max(0,yy)+.1*Math.abs(Math.sin(ep.getX(q)*2));ecol.push(v,v*.97,v*.92)}
    eg.setAttribute("color",new THREE.Float32BufferAttribute(ecol,3));es.add(new THREE.Mesh(eg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
    [[3,3,2],[-3,2,3],[0,4,-2],[-4,1,-2]].forEach(function(p){var sb=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.4),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));sb.position.set(p[0],p[1],p[2]);sb.lookAt(0,0,0);es.add(sb)});
    sc.environment=pmg.fromScene(es).texture}catch(e){}
  var hemi=new THREE.HemisphereLight(0xfbfdff,0x4f6a68,.62);sc.add(hemi);
  var sun=new THREE.DirectionalLight(0xfff1dc,1.25);sun.position.set(-4,5,6);sc.add(sun);
  var rim=new THREE.DirectionalLight(0x9fd8ff,.6);rim.position.set(5,2,-5);sc.add(rim);
  [hemi,sun,rim].forEach(function(l){l.layers.enableAll()});
  function M(c,o){o=o||{};o.color=c;return new THREE.MeshStandardMaterial(o)}
  function P(x,y,z){return new V(x,y,z)}
  function P3(a){return new V(a[0],a[1],a[2])}
  var cyl=new THREE.CylinderGeometry(1,1,1,14),sph=new THREE.SphereGeometry(1,16,12),box=new THREE.BoxGeometry(1,1,1);
  function m(g,mt,x,y,z,sx,sy,sz){var o=new THREE.Mesh(g,mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o}

  /* ---------- esqueleto de fundo (.glb): corpo inteiro, menos o cotovelo esquerdo ---------- */
  var kb=dec(KK.bin).buffer,NV=KK.meta.nv,pos=new Float32Array(kb,KK.meta.pos,NV*3),uv=new Float32Array(dec(A.UV).buffer),idx=new Uint16Array(dec(A.IDX).buffer),left=dec(A.LEFT);
  /* ajustes de render sem remodelar (tools/skel_clean.py): normais suavizadas nas costuras de UV, sombra de contato
     calculada na própria malha e textura limpa, que entra só como grão leve sobre a cor de osso */
  var n8=new Int8Array(kb,KK.meta.nrm,NV*3),a8=new Uint8Array(kb,KK.meta.ao,NV),nrm=new Float32Array(NV*3),aoc=new Float32Array(NV*3);
  for(var q=0;q<NV*3;q++)nrm[q]=n8[q]/127;
  for(q=0;q<NV;q++){var ak=.5+.5*Math.pow(a8[q]/255,1.6);aoc[q*3]=aoc[q*3+1]=aoc[q*3+2]=ak}
  var tex=new THREE.Texture();tex.flipY=false;tex.encoding=THREE.sRGBEncoding;tex.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy());
  var timg=new Image();timg.onload=function(){tex.image=timg;tex.needsUpdate=true};timg.src=KK.tex;
  var SKC=new THREE.Color(.64,.56,.4);
  var skelM=new THREE.MeshStandardMaterial({map:tex,vertexColors:true,metalness:0,roughness:.8,envMapIntensity:.5,side:THREE.DoubleSide,transparent:true});
  var skelPre=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide,transparent:true});
  var limbSk=new THREE.MeshStandardMaterial({map:tex,vertexColors:true,metalness:0,roughness:.8,envMapIntensity:.5,side:THREE.DoubleSide});
  /* nas etapas de perto o esqueleto de fundo vira contorno nítido, em vez de uma névoa translúcida:
     uma passada só de profundidade e outra que acende as bordas das superfícies mais próximas */
  var ghostM=new THREE.ShaderMaterial({uniforms:{op:{value:0},col:{value:new THREE.Color(0xe6e0cf)}},
    vertexShader:"varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}",
    fragmentShader:"uniform float op;uniform vec3 col;varying vec3 vN;varying vec3 vV;void main(){float d=length(vV);float f=pow(1.-abs(dot(normalize(vN),vV/d)),2.4);gl_FragColor=vec4(col,op*smoothstep(.06,.2,d)*(.022+.3*f));}",
    transparent:true,depthWrite:false,side:THREE.DoubleSide}),depthM=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide});
  var rest=[],main=[];
  for(var a=0;a<idx.length;a+=3){var p=idx[a],q=idx[a+1],r=idx[a+2];
    if(!left[p]){rest.push(p,q,r);continue}
    var cy=(pos[p*3+1]+pos[q*3+1]+pos[r*3+1])/3;
    if(cy<.07&&cy>-.2)continue;main.push(p,q,r)}
  function geo(list){var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("uv",new THREE.BufferAttribute(uv,2));g.setAttribute("normal",new THREE.BufferAttribute(nrm,3));g.setAttribute("color",new THREE.BufferAttribute(aoc,3));g.setIndex(list);return g}
  var gRest=geo(rest),skel=new THREE.Mesh(gRest,skelM),skelP=new THREE.Mesh(gRest,skelPre);skel.renderOrder=1;skelP.renderOrder=0;sc.add(skelP,skel);
  var limbMain=new THREE.Mesh(geo(main),limbSk);sc.add(limbMain);
  /* cauda: 21 vértebras caudais articuladas. As primeiras têm processos transversos, arco e espinhoso;
     as do meio são longas, em forma de carretel; as finais viram bastonetes curtos. Em repouso o rabo sai
     na linha do sacro e cai pendurado, com a ponta levemente virada. */
  var tailM=new THREE.MeshStandardMaterial({vertexColors:true,metalness:0,roughness:.82,envMapIntensity:.5,side:THREE.DoubleSide,transparent:true});
  var tailRoot=new THREE.Group();tailRoot.position.set(0,.099,-.452);tailRoot.rotation.x=-.42;sc.add(tailRoot);
  var tailJ=[],TN=21,tprev=tailRoot,tl=0;
  function tcol(g,fn){var ps=g.attributes.position,n=ps.count,c=new Float32Array(n*3);
    for(var q=0;q<n;q++){var x=ps.getX(q),y=ps.getY(q),z=ps.getZ(q),k=fn(x,y,z),h=.94+.1*hash(Math.round(x*900),Math.round(y*900),Math.round(z*900));
      c[q*3]=SKC.r*.8*k*h;c[q*3+1]=SKC.g*.8*k*h;c[q*3+2]=SKC.b*.8*k*h}
    g.setAttribute("color",new THREE.BufferAttribute(c,3));g.deleteAttribute("uv");return g}
  function blob(gj,L,sx,sy,sz,x,y,z,ry,rz,sh){var g=new THREE.SphereGeometry(1,10,8);g.scale(sx,sy,sz);if(rz)g.rotateZ(rz);if(ry)g.rotateY(ry);g.translate(x,y,z);
    tcol(g,function(xx,yy,zz){return sh*(.78+.22*Math.min(1,Math.max(0,(yy+sy)/(2*sy))))});gj.add(new THREE.Mesh(g,tailM))}
  for(var ti2=0;ti2<TN;ti2++){
    var f=ti2/(TN-1),L=.84*(.0125+.0185*Math.exp(-Math.pow((f-.3)/.42,2))),r=.0032+.0118*Math.pow(1-f,1.3),BL=L*.86,gj=new THREE.Group();
    gj.position.set(0,0,ti2?-tl:0);
    gj.userData.rx=ti2?(-.105*Math.exp(-Math.pow((ti2-4)/4.5,2))-.012+(ti2>TN-5?.035:0)):0;gj.rotation.x=gj.userData.rx;tprev.add(gj);
    /* corpo: carretel com as pontas alargadas e cintura no meio (mais marcada nas vértebras longas) */
    var wa=.62+.25*Math.max(0,1-Math.abs(f-.35)*2.2),pr=[],prof=[[0,0],[.8,0],[.97,.03],[1,.1],[.86,.24],[wa,.42],[wa*.97,.5],[wa,.58],[.86,.76],[1,.9],[.97,.97],[.8,1],[0,1]];
    prof.forEach(function(p){pr.push(new THREE.Vector2(r*p[0]*(1-.08*p[1]),BL*p[1]))});
    var vg=new THREE.LatheGeometry(pr,14);vg.rotateX(-PI/2);vg.scale(1,.92,1);
    tcol(vg,function(x,y,z){var t=-z/BL,e=Math.min(t,1-t);return .66+.34*Math.min(1,e/.14)});
    gj.add(new THREE.Mesh(vg,tailM));
    /* processos transversos (asas voltadas para trás), arco neural com espinhoso e processos articulares */
    if(ti2<7){var w=1-ti2/7,tw=r*(.4+.62*w);
      [-1,1].forEach(function(sd){blob(gj,L,tw,r*.17,BL*(.26+.1*w),sd*(r*.7+tw*.7),-r*.05,-BL*.52,sd*.22,0,.9)});
      blob(gj,L,r*.32,r*(.3+.25*w),BL*.3,0,r*.82,-BL*.48,0,0,.92);
      if(ti2<5)[-1,1].forEach(function(sd){blob(gj,L,r*.2,r*.18,BL*.2,sd*r*.42,r*.72,-BL*.04,sd*.25,0,.88)})}
    /* arcos hemais (ventrais), pequenos, nas vértebras proximais e médias */
    if(ti2>=3&&ti2<11){var hw=1-(ti2-3)/8;[-1,1].forEach(function(sd){blob(gj,L,r*.16,r*(.12+.12*hw),BL*.12,sd*r*.3,-r*.86,-BL*.07,0,0,.82)})}
    tailJ.push(gj);tl=L;tprev=gj}
  var skelMeshes=[skel,limbMain];tailRoot.traverse(function(o){if(o.isMesh){skelMeshes.push(o);o.renderOrder=1}});
  [skel,skelP].forEach(function(o){o.layers.set(1)});tailRoot.traverse(function(o){o.layers.set(1)});

  /* ---------- malhas esculpidas: ossos do cotovelo, placas, pele e músculo ---------- */
  function lin(c){return Math.pow(c,2.2)}
  function hash(x,y,z){var s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)}
  var BONE=[.80,.745,.62],CANC=[.62,.25,.21];
  function pieces(K,soft){var buf=dec(K.bin).buffer,lo=K.meta.lo,hi=K.meta.hi,out={};
    K.meta.pieces.forEach(function(p){
      var o=p.off,qv=new Uint16Array(buf.slice(o,o+p.nv*6));o+=p.nv*6;
      var ix=p.big?new Uint32Array(buf.slice(o,o+p.nt*12)):new Uint16Array(buf.slice(o,o+p.nt*6));o+=p.nt*(p.big?12:6);
      var nb=new Int8Array(buf.slice(o,o+p.nv*3));o+=p.nv*3;var b1=new Uint8Array(buf.slice(o,o+p.nv)),b2=new Uint8Array(buf.slice(o+p.nv,o+2*p.nv));
      var Pp=new Float32Array(p.nv*3),Nn=new Float32Array(p.nv*3),Cc=new Float32Array(p.nv*3),aS=soft?new Float32Array(p.nv):null,aD=soft?new Float32Array(p.nv):null;
      for(var i=0;i<p.nv;i++){var x=Pp[i*3]=lo[0]+qv[i*3]/65535*(hi[0]-lo[0]),y=Pp[i*3+1]=lo[1]+qv[i*3+1]/65535*(hi[1]-lo[1]),z=Pp[i*3+2]=lo[2]+qv[i*3+2]/65535*(hi[2]-lo[2]);
        Nn[i*3]=nb[i*3]/127;Nn[i*3+1]=nb[i*3+1]/127;Nn[i*3+2]=nb[i*3+2]/127;
        var rr,gg,bb,n1=hash(Math.round(x*700),Math.round(y*700),Math.round(z*700));
        if(soft){var d=b2[i]*.00025;aS[i]=b1[i]/255*1.2-.1;aD[i]=d;
          if(p.name==="skin"){var sh=Math.min(1,Math.max(0,(.05-d)/.022)),fu=.86+.28*n1;sh=sh*sh*(3-2*sh);rr=.70*fu*(1-sh)+.90*sh;gg=.47*fu*(1-sh)+.72*sh;bb=.27*fu*(1-sh)+.66*sh}
          else{var st=.8+.35*hash(Math.round(x*260),0,Math.round(z*260));rr=.66*st;gg=.2*st;bb=.2*st}}
        else if(p.metal){rr=gg=bb=1}
        else{var ao=.3+.7*Math.pow(b1[i]/255,1.35),c=b2[i]/255,n2=.7+.55*hash(x*9e4,y*9e4,z*9e4),mo=.95+.1*n1;
          rr=(BONE[0]*mo*(1-c)+CANC[0]*n2*c)*ao;gg=(BONE[1]*mo*(1-c)+CANC[1]*n2*c)*ao;bb=(BONE[2]*mo*(1-c)+CANC[2]*n2*c)*ao}
        Cc[i*3]=lin(rr);Cc[i*3+1]=lin(gg);Cc[i*3+2]=lin(bb)}
      var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(Pp,3));g.setAttribute("normal",new THREE.BufferAttribute(Nn,3));g.setAttribute("color",new THREE.BufferAttribute(Cc,3));
      if(soft){g.setAttribute("aS",new THREE.BufferAttribute(aS,1));g.setAttribute("aD",new THREE.BufferAttribute(aD,1))}
      g.setIndex(new THREE.BufferAttribute(ix,1));out[p.name]=g});
    return out}
  var G=pieces(KB),GI=pieces(KI),GS=pieces(KS,true),IM=KI.meta,SO=KS.meta;
  var Cc0=P3(IM.C),TUB=P3(IM.TUB),OAX=P3(IM.OAX),OQ=P3(IM.OQ);
  function boneMat(){return new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:0,envMapIntensity:.32})}
  var limbM=boneMat(),fragM=boneMat(),medM=boneMat();fragM.emissive=new THREE.Color(0xe0382c);fragM.emissiveIntensity=0;medM.emissive=new THREE.Color(0xe08a1c);medM.emissiveIntensity=0;
  var boneMats=[limbM,fragM,medM],preM=new THREE.MeshBasicMaterial({colorWrite:false,transparent:true}),pres=[],boneMeshes=[];
  var limb=new THREE.Group();sc.add(limb);
  function bone(name,mat){var o=new THREE.Mesh(G[name],mat);o.renderOrder=3;var p=new THREE.Mesh(G[name],preM);p.renderOrder=2;p.visible=false;o.add(p);pres.push(p);boneMeshes.push(o);return o}
  function wrap(g,pv){var w=new THREE.Group();w.position.copy(pv);g.position.copy(pv).multiplyScalar(-1);w.add(g);limb.add(w);return w}
  var hShaft=bone("hShaft",limbM),uFull=bone("uFull",limbM),uBody=bone("uBody",limbM),radius=bone("radius",limbM);limb.add(hShaft,uFull,uBody,radius);
  var FP=P(-.092,-.05,.124),OP=OQ.clone();
  var gL=wrap(bone("hLat",fragM),FP),gM=wrap(bone("hMed",medM),FP),gO=wrap(bone("uOlec",limbM),OP);
  /* contorno brilhante: posição original dos côndilos */
  function fres(col,base,gain,pw,add){return new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(col)},base:{value:base},gain:{value:gain},pw:{value:pw},op:{value:1},add:{value:add?1:0}},
    vertexShader:"varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader:"uniform vec3 col;uniform float base;uniform float gain;uniform float pw;uniform float op;uniform float add;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),pw);float k=base+gain*f;gl_FragColor=vec4(col*mix(1.,k*op,add),mix(k*op,1.,add));}",
    transparent:true,depthWrite:false,depthTest:!add,side:THREE.DoubleSide,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})}
  var ghM=fres(0xff6a55,0,.85,2.4,false),ghM2=fres(0xffb347,0,.85,2.4,false);
  var gh=new THREE.Mesh(G.hLat,ghM),gh2=new THREE.Mesh(G.hMed,ghM2);gh.renderOrder=gh2.renderOrder=5;limb.add(gh,gh2);
  /* plano da osteotomia */
  var cutM=new THREE.MeshBasicMaterial({color:0xff5a48,transparent:true,opacity:0,side:THREE.DoubleSide,depthTest:false});
  var cutP=m(box,cutM,OQ.x,OQ.y,OQ.z,.02,.0006,.03);cutP.quaternion.setFromUnitVectors(Y,OAX);cutP.renderOrder=6;sc.add(cutP);
  var CXL=-.1085,CW=.02;

  /* ---------- implantes ---------- */
  var MT=M(0xb4c0cd,{metalness:.95,roughness:.3,envMapIntensity:1.35,side:THREE.DoubleSide}),DK=M(0x6c7685,{metalness:.9,roughness:.4,envMapIntensity:1.1}),PLM=M(0xa9b6c4,{metalness:.95,roughness:.34,envMapIntensity:1.3});
  var SCR=[],qS=new THREE.Quaternion(),hex6=new THREE.CylinderGeometry(1,1,1,6);
  function mkScrew(a,b,r,grp){var d=new V().subVectors(b,a),L=d.length();d.normalize();
    var g=new THREE.Group();g.position.copy(a);g.quaternion.setFromUnitVectors(Y,d);
    g.add(m(cyl,MT,0,L/2,0,r,L,r));g.add(m(cyl,MT,0,0,0,r*1.85,.0016,r*1.85));g.add(m(hex6,DK,0,-.0009,0,r*1.05,.0005,r*1.05));
    for(var k=.14;k<.96;k+=.055)g.add(m(cyl,MT,0,L*k,0,r*1.3,.0007,r*1.3));
    var hg=new THREE.Group();hg.position.copy(a);hg.quaternion.copy(g.quaternion);
    var hole=m(cyl,M(0x2b1a12,{roughness:1}),0,0,0,r*.92,1,r*.92);hg.add(hole);
    g.visible=false;hg.visible=false;grp.add(g,hg);
    var e={g:g,hg:hg,hole:hole,a:a.clone(),d:d.clone(),L:L,q0:g.quaternion.clone()};SCR.push(e);return e}
  function animScrew(e,hp,sp){var hv=hp>.01&&sp<.9&&!xray;e.hg.visible=hv;if(hv){e.hole.scale.y=e.L*hp;e.hole.position.y=e.L*hp/2}
    e.g.visible=sp>.001;if(sp>.001){e.g.position.copy(e.a).addScaledVector(e.d,-.03*(1-sp));e.g.quaternion.copy(e.q0).multiply(qS.setFromAxisAngle(Y,sp*PI*12))}}
  var pl=new THREE.Group(),plL=new THREE.Mesh(GI.plateLat,PLM),plM=new THREE.Mesh(GI.plateMed,PLM);pl.add(plL,plM);sc.add(pl);
  var sL=IM.screwsLat.map(function(s){return mkScrew(P3(s.a),P3(s.b),s.r,pl)}),sM=IM.screwsMed.map(function(s){return mkScrew(P3(s.a),P3(s.b),s.r,pl)});
  var nL=P(-.86,.1,-.5).normalize(),nM=P(.86,.1,-.5).normalize();
  function tube(pts,r,segs,mat){var g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),segs,r,6),o=new THREE.Mesh(g,mat||MT);o.userData.segs=segs;return o}
  function drawTo(o,f){o.geometry.setDrawRange(0,Math.floor(Math.max(0,Math.min(1,f))*o.userData.segs)*36);o.visible=f>.002}
  var hpin=tube(IM.hpin.map(P3),.0011,70);sc.add(hpin);
  var scr=new THREE.Group();sc.add(scr);var tcs=mkScrew(P3(IM.tcs.a),P3(IM.tcs.b),IM.tcs.r,scr);
  var bd=new THREE.Group();sc.add(bd);
  var opins=IM.upins.map(function(pp){var o=tube(pp.map(P3),.0011,90);bd.add(o);return o});
  var owire=IM.wires.map(function(pp){var o=tube(pp.map(P3),.00068,110);bd.add(o);return o});
  var HA=P3(IM.hole.a),HB=P3(IM.hole.b),holeM=M(0x2b1a12,{roughness:1}),hmk=new THREE.Group();
  [HA,HB].forEach(function(h,i){var o=m(cyl,holeM,h.x+(i?-.0007:.0007),h.y,h.z,.0012,.0016,.0012);o.rotation.z=PI/2;hmk.add(o)});bd.add(hmk);
  var kd=P(-.55,.25,-.8).normalize(),ke1=new V().crossVectors(kd,Y).normalize(),ke2=new V().crossVectors(kd,ke1),kp=[],K0=P3(IM.knot);
  for(var ka=0;ka<=24;ka++){var an=ka/24*PI*5;kp.push(K0.clone().addScaledVector(kd,ka/24*.0042).addScaledVector(ke1,Math.cos(an)*.0008).addScaledVector(ke2,Math.sin(an)*.0008))}
  var knot=tube(kp,.00062,40);bd.add(knot);
  var metalMeshes=[];[pl,scr,bd,hpin].forEach(function(g){g.traverse(function(o){if(o.isMesh&&(o.material===MT||o.material===DK||o.material===PLM))metalMeshes.push(o)})});
  var ovM=new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:.36,depthTest:false,depthWrite:false}),ovs=[];
  metalMeshes.forEach(function(o){if(o===plL||o===plM||o.material===DK)return;var c=new THREE.Mesh(o.geometry,ovM);c.renderOrder=6;o.add(c);ovs.push(c)});

  /* ---------- pele, músculo e suturas ---------- */
  var US={front:{value:0},w:{value:.0078},cut:{value:2}},UM={front:{value:0},w:{value:.0062},cut:{value:2}};
  function wound(mat,U){mat.onBeforeCompile=function(sh){sh.uniforms.uFront=U.front;sh.uniforms.uW=U.w;sh.uniforms.uCut=U.cut;
    sh.vertexShader="attribute float aS;attribute float aD;varying float vS;varying float vD;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvS=aS;vD=aD;");
    sh.fragmentShader="uniform float uFront;uniform float uW;uniform float uCut;varying float vS;varying float vD;\n"+sh.fragmentShader.replace(/void main\(\) *\{/,"void main(){float kLens=pow(max(sin(3.14159*clamp(vS,0.,1.)),0.),.6);float kCut=1.-smoothstep(uCut-.03,uCut+.03,vS);float kW=uW*kLens*kCut*smoothstep(uFront-.03,uFront+.03,vS);if(vD<kW)discard;")
      .replace("#include <color_fragment>","#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.2,.012,.015),kCut*(1.-smoothstep(0.,.0017,vD-kW)));")};return mat}
  var skM=wound(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,envMapIntensity:.25,transparent:true}),US),
      skIn=wound(new THREE.MeshStandardMaterial({color:0x6e1a1c,roughness:.7,envMapIntensity:.2,side:THREE.BackSide,transparent:true}),US),
      muM=wound(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,envMapIntensity:.3,side:THREE.DoubleSide,transparent:true}),UM);
  var soft=new THREE.Group(),sk=new THREE.Mesh(GS.skin,skM),skI=new THREE.Mesh(GS.skin,skIn),mus=new THREE.Mesh(GS.muscle,muM);mus.renderOrder=7;skI.renderOrder=8;sk.renderOrder=9;soft.add(mus,skI,sk);sc.add(soft);
  var stG=new THREE.TorusGeometry(.0052,.0006,6,14,PI),stK=new THREE.SphereGeometry(.0012,8,6),nyM=M(0x10171f,{roughness:.5}),abM=M(0x7a48e0,{roughness:.5});
  function mkStitches(list,mat,w){return list.map(function(s){var g=new THREE.Group(),n=P3(s.n),t=P3(s.t),b=new V().crossVectors(t,n).normalize();
    g.position.copy(P3(s.p)).addScaledVector(n,-.0009);g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(b,n,t));
    var a=new THREE.Mesh(stG,mat);a.scale.set(w,.5,1);g.add(a);var kn=new THREE.Mesh(stK,mat);kn.position.set(.0052*w,.0007,0);g.add(kn);g.visible=false;soft.add(g);return{g:g,s:s.s,p:P3(s.p)}})}
  var stS=mkStitches(SO.stSkin,nyM,1),stMu=mkStitches(SO.stMus,abM,.8);

  /* ---------- instrumentos cirúrgicos (eixo +Y = cabo; ponta de trabalho na origem; medidas em unidades da cena) ----------
     Modelados a partir das fotos do campo cirúrgico: aço inox polido e escovado, cabos recartilhados,
     furadeira e serra com corpo metálico e cabo de força. */
  var INS=new THREE.Group();sc.add(INS);
  function stripes(cross){var c=document.createElement("canvas");c.width=c.height=64;var g=c.getContext("2d");g.fillStyle="#7a7a7a";g.fillRect(0,0,64,64);g.strokeStyle="#fff";g.lineWidth=5;
    for(var i=-64;i<128;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+(cross?64:0),64);g.stroke();if(cross){g.beginPath();g.moveTo(i+64,0);g.lineTo(i,64);g.stroke()}}
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
  var kT=stripes(true);kT.repeat.set(10,7);
  var STL=M(0xdfe4ea,{metalness:1,roughness:.2,envMapIntensity:1.3}),            /* aço polido */
      SAT=M(0xc8cfd7,{metalness:1,roughness:.4,envMapIntensity:1.15}),           /* aço escovado */
      DST=M(0x6d7680,{metalness:1,roughness:.45,envMapIntensity:.9}),            /* sulcos e frestas do aço */
      BLK=M(0x20262d,{metalness:.25,roughness:.5,envMapIntensity:.6}),           /* polímero escuro */
      ANO=M(0x7d8fa1,{metalness:.8,roughness:.3,envMapIntensity:1.05}),          /* alumínio anodizado */
      CAB=M(0x8f99a3,{metalness:0,roughness:.55,envMapIntensity:.4}),            /* cabo de força */
      GRP=M(0x2b3239,{metalness:.1,roughness:.75,envMapIntensity:.45,bumpMap:kT,bumpScale:.0012});  /* borracha recartilhada */
  function lathe(pr,mt,seg){return new THREE.Mesh(new THREE.LatheGeometry(pr.map(function(p){return new THREE.Vector2(Math.max(p[0],1e-5),p[1])}),seg||28),mt)}
  /* haste plana no plano XY com seção de cantos arredondados; w(t) meia-largura, h(t) meia-espessura */
  function arm(pts,w,h,mt,n){var c=new THREE.CatmullRomCurve3(pts.map(function(p){return new V(p[0],p[1],0)})),N=n||40,R=12,P=[],ix=[],T=new V();
    for(var i=0;i<=N;i++){var t=i/N,p=c.getPointAt(t);c.getTangentAt(t,T);var nx=-T.y,ny=T.x,ww=w(t),hh=h(t);
      for(var j=0;j<R;j++){var a=j/R*PI*2,cs=Math.cos(a),sn=Math.sin(a),ex=Math.sign(cs)*Math.pow(Math.abs(cs),.72),ez=Math.sign(sn)*Math.pow(Math.abs(sn),.72);
        P.push(p.x+nx*ex*ww,p.y+ny*ex*ww,ez*hh)}}
    for(i=0;i<N;i++)for(j=0;j<R;j++){var a1=i*R+j,b1=a1+R,a2=i*R+(j+1)%R,b2=a2+R;ix.push(a1,b1,a2,b1,b2,a2)}
    var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setIndex(ix);g.computeVertexNormals();return new THREE.Mesh(g,mt)}
  function ends(t,a,b){var s=1;if(t<a)s=Math.sqrt(Math.max(0,1-Math.pow((a-t)/a,2)));if(t>1-b)s=Math.min(s,Math.sqrt(Math.max(0,1-Math.pow((t-1+b)/b,2))));return Math.max(s,.08)}
  function slab(sh,d,bv,mt){var g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:bv>0,bevelThickness:bv,bevelSize:bv,bevelSegments:2,curveSegments:18});g.translate(0,0,-d/2);g.computeVertexNormals();return new THREE.Mesh(g,mt)}
  function poly(pts,holes){var s=new THREE.Shape();pts.forEach(function(p,i){i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1])});s.closePath();
    (holes||[]).forEach(function(hp){var hh=new THREE.Path();hp.forEach(function(p,i){i?hh.lineTo(p[0],p[1]):hh.moveTo(p[0],p[1])});hh.closePath();s.holes.push(hh)});return s}
  function oval(cx,cy,rx,ry,n){var a=[];for(var i=0;i<(n||16);i++){var t=i/(n||16)*PI*2;a.push([cx+Math.cos(t)*rx,cy+Math.sin(t)*ry])}return a}
  function cable(pts,r){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(function(p){return new V(p[0],p[1],p[2])})),40,r,8),CAB)}
  /* catraca: fileira de dentes de serra */
  function ratchet(x0,y0,len,ang,n,mt){var p=[[0,0]];for(var i=0;i<n;i++){p.push([len*(i+.55)/n,.0016]);p.push([len*(i+1)/n,0])}p.push([len,-.0012]);p.push([0,-.0012]);
    var o=slab(poly(p),.0012,.0002,mt);o.position.set(x0,y0,0);o.rotation.z=ang;return o}
  function mkTool(kind){var g=new THREE.Group(),pt={};
    if(kind==="scalpel"){ /* bisturi: lâmina nº 22 no cabo nº 4; o fio da lâmina fica do lado +X */
      var bl=slab(poly([[0,0],[.0019,.0035],[.0047,.0095],[.0058,.0155],[.0054,.0205],[.0043,.0245],[.0028,.0262],[-.0021,.0262],[-.0022,.017],[-.0014,.0075]],[[[.0003,.0196],[.0011,.0196],[.0011,.0252],[.0003,.0252]]]),.00022,.00006,SAT);bl.position.z=.0015;g.add(bl);
      var ed=slab(poly([[0,0],[.0019,.0035],[.0047,.0095],[.0058,.0155],[.0054,.0205],[.0047,.0205],[.0050,.0155],[.0040,.0097],[.0013,.0038]]),.00030,0,STL);ed.position.z=.0015;g.add(ed);   /* fio polido */
      var hd=slab(poly([[-.0018,.024],[.0026,.024],[.0028,.034],[.0042,.044],[.0042,.098],[.0036,.103],[.0,.1045],[-.0036,.103],[-.0042,.098],[-.0042,.044],[-.0028,.034]]),.0016,.0005,SAT);g.add(hd);
      for(var gi=0;gi<12;gi++){var gr=new THREE.Mesh(box,DST);gr.scale.set(.0062,.0007,.0031);gr.position.set(0,.06+gi*.0026,0);g.add(gr)}  /* sulcos da empunhadura */
      var nm=new THREE.Mesh(box,DST);nm.scale.set(.0012,.0085,.0028);nm.position.set(0,.03,0);g.add(nm)}                                   /* encaixe da lâmina */
    else if(kind==="saw"){ /* serra oscilatória sagital: lâmina dentada presa no cubo; o corpo tem empunhadura recartilhada e cabo */
      var LB=.026,bg=new THREE.Group();bg.position.y=LB;g.add(bg);pt.blade=bg;
      var tp=[[-.0058,-LB]];for(var ti=0;ti<9;ti++){tp.push([-.0058+.0116*(ti+.5)/9,-LB-.0013]);tp.push([-.0058+.0116*(ti+1)/9,-LB])}
      tp=tp.concat([[.0058,-LB+.004],[.0036,-.008],[.0036,.002],[.0024,.0042],[0,.0048],[-.0024,.0042],[-.0036,.002],[-.0036,-.008],[-.0058,-LB+.004]]);
      bg.add(slab(poly(tp,[oval(0,-.012,.0011,.0034,14),oval(-.0022,-.0045,.0006,.0006,10),oval(.0022,-.0045,.0006,.0006,10)]),.00045,.00005,STL));
      var hub=new THREE.Mesh(new THREE.CylinderGeometry(.0042,.0042,.0034,24),SAT);hub.rotation.x=PI/2;bg.add(hub);
      var hb2=new THREE.Mesh(new THREE.CylinderGeometry(.0018,.0018,.0038,6),DST);hb2.rotation.x=PI/2;bg.add(hb2);
      g.add(lathe([[0,LB+.001],[.0034,LB+.001],[.0046,LB+.004],[.0062,LB+.009],[.0074,LB+.015],[.0078,LB+.02],[0,LB+.02]],SAT));
      g.add(lathe([[.0078,LB+.02],[.0082,LB+.022],[.0082,LB+.07],[.0078,LB+.072]],GRP));
      g.add(lathe([[0,LB+.072],[.0082,LB+.072],[.0086,LB+.075],[.0086,LB+.086],[.0074,LB+.093],[.0042,LB+.097],[0,LB+.098]],ANO));
      var trg=slab(poly(oval(0,0,.0016,.0055,16)),.0016,.0005,BLK);trg.position.set(0,LB+.032,.0088);g.add(trg);
      g.add(cable([[0,LB+.096,0],[0,LB+.12,.004],[.004,LB+.14,.016],[.012,LB+.155,.034]],.0018))}
    else if(kind==="drill"){ /* furadeira ortopédica: broca helicoidal no mandril de três castanhas, corpo metálico e cabo */
      var rot=new THREE.Group();g.add(rot);pt.bit=rot;
      var bgm=new THREE.CylinderGeometry(.00095,.00095,.026,10,52),bp=bgm.attributes.position;bgm.translate(0,.013,0);
      for(var bi=0;bi<bp.count;bi++){var bx=bp.getX(bi),by=bp.getY(bi),bz=bp.getZ(bi),ba=Math.atan2(bz,bx),br=Math.hypot(bx,bz);if(br<1e-6)continue;
        var fl=1-.42*Math.pow(Math.max(0,Math.cos(2*(ba-by*420))),3),tipk=Math.min(1,by/.0011);bp.setX(bi,bx*fl*tipk);bp.setZ(bi,bz*fl*tipk)}
      bgm.computeVertexNormals();rot.add(new THREE.Mesh(bgm,STL));
      for(var ji=0;ji<3;ji++){var jw=new THREE.Mesh(box,SAT);jw.scale.set(.0012,.006,.0016);var ja=ji/3*PI*2;jw.position.set(Math.cos(ja)*.0016,.024,Math.sin(ja)*.0016);jw.rotation.y=-ja;jw.rotation.z=.12*Math.cos(ja);jw.rotation.x=-.12*Math.sin(ja);rot.add(jw)}
      rot.add(lathe([[.0012,.0225],[.0026,.0225],[.0046,.027],[.0055,.031],[.0055,.037],[.0048,.039],[.0012,.039]],SAT));
      var kn=lathe([[.0056,.0285],[.0058,.0292],[.0058,.0355],[.0056,.0362]],GRP,24);rot.add(kn);
      g.add(lathe([[0,.0395],[.0042,.0395],[.0064,.043],[.0074,.049],[.0074,.052],[0,.052]],ANO));
      g.add(lathe([[.0074,.052],[.0078,.054],[.0078,.098],[.0074,.1]],GRP));
      g.add(lathe([[0,.1],[.0076,.1],[.0078,.104],[.0072,.113],[.0046,.118],[0,.119]],ANO));
      for(var vi=0;vi<4;vi++){var vt=new THREE.Mesh(box,BLK);vt.scale.set(.0014,.0062,.0011);var va=vi/4*PI*2+PI/4;vt.position.set(Math.cos(va)*.0072,.106,Math.sin(va)*.0072);vt.rotation.y=-va;g.add(vt)}
      var tr=slab(poly(oval(0,0,.0017,.0062,16)),.0016,.0005,BLK);tr.position.set(0,.064,.0082);g.add(tr);
      g.add(cable([[0,.117,0],[0,.14,-.004],[-.004,.158,-.016],[-.012,.172,-.034]],.0019))}
    else if(kind==="forceps"){ /* pinça de redução pontiaguda (tipo Weber): pontas curvas que se encontram, articulação e catraca */
      var HS=.034,YP=.03;pt.HS=HS;pt.YP=YP;
      [[1],[-1]].forEach(function(sv){var s=sv[0],a=new THREE.Group();a.position.y=YP;
        a.add(arm([[0,0],[s*.013,-.004],[s*.03,-.01],[s*.042,-.018],[s*.045,-.025],[s*.042,-.0293],[s*(HS+.003),-YP],[s*HS,-YP]],
          function(t){return .0018*(1-.72*Math.pow(t,1.6))*ends(t,.04,.02)},function(t){return .0014*(1-.5*t)},STL,56));
        a.add(arm([[0,0],[-s*.004,.02],[-s*.009,.045],[-s*.011,.068]],function(t){return (.0024-.0006*t)*ends(t,.03,.06)},function(){return .0015},SAT,30));
        a.add(ratchet(-s*.011,s>0?.0655:.0685,.016,s>0?-.08:PI-.08,7,SAT));
        if(s>0)pt.A=a;else pt.B=a;g.add(a)});
      var pv=new THREE.Mesh(new THREE.CylinderGeometry(.0026,.0026,.0034,20),SAT);pv.rotation.x=PI/2;pv.position.y=YP;g.add(pv);
      var ps=new THREE.Mesh(box,DST);ps.scale.set(.0034,.0005,.0036);ps.position.y=YP;g.add(ps)}
    else if(kind==="holder"){ /* porta-agulhas (tipo Mayo-Hegar) com agulha curva e fio */
      var YH=.017;pt.YP=YH;
      [[1],[-1]].forEach(function(sv){var s=sv[0],a=new THREE.Group();a.position.y=YH;
        a.add(arm([[s*.0004,0],[s*.0012,-.006],[s*.0011,-.012],[s*.0005,-YH]],function(t){return .0016*(1-.35*t)*ends(t,.02,.04)},function(){return .0011},STL,24));
        a.add(arm([[0,0],[-s*.0028,.02],[-s*.006,.045],[-s*.008,.06]],function(t){return (.0014-.0003*t)*ends(t,.02,.02)},function(){return .0012},SAT,30));
        var rg=new THREE.Mesh(new THREE.TorusGeometry(.0068,.0012,8,28),SAT);rg.scale.set(1,1.25,1);rg.position.set(-s*.0128,.0662,0);a.add(rg);
        a.add(ratchet(-s*.0074,s>0?.0515:.0545,.0085,s>0?0:PI,5,SAT));
        if(s>0)pt.A=a;else pt.B=a;g.add(a)});
      var bx2=new THREE.Mesh(box,SAT);bx2.scale.set(.0042,.0046,.0026);bx2.position.y=YH;g.add(bx2);
      var nd=new THREE.Mesh(new THREE.TorusGeometry(.0058,.00032,6,28,PI*.75),STL);nd.rotation.set(PI/2,0,-PI*.42);nd.position.set(-.0006,.0004,.0034);g.add(nd);pt.needle=nd;
      var th=cable([[-.0006,.0004,-.0026],[.004,-.002,-.008],[.012,.002,-.014],[.02,.012,-.016]],.00034);g.add(th);pt.thread=th}
    else if(kind==="gelpi"){ /* afastador autoestático (tipo Gelpi): pontas curvas para fora, aros e catraca */
      var YG=.03;
      [[1],[-1]].forEach(function(sv){var s=sv[0],a=new THREE.Group();a.position.y=YG;
        a.add(arm([[0,0],[-s*.003,-.011],[-s*.0055,-.022],[-s*.0072,-.0272],[-s*.0094,-.0298],[-s*.0108,-.0312]],function(t){return .0013*(1-.75*Math.pow(t,1.5))*ends(t,.02,.01)},function(t){return .0009*(1-.4*t)},STL,40));
        a.add(arm([[0,0],[s*.003,.016],[s*.006,.03],[s*.008,.04]],function(t){return .0012*ends(t,.02,.02)},function(){return .0011},SAT,24));
        var rg=new THREE.Mesh(new THREE.TorusGeometry(.0058,.0011,8,26),SAT);rg.position.set(s*.0128,.0462,0);a.add(rg);
        if(s>0)pt.A=a;else pt.B=a;g.add(a)});
      var gp=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.0028,18),SAT);gp.rotation.x=PI/2;gp.position.y=YG;g.add(gp);
      g.add(ratchet(-.008,YG+.024,.016,0,8,SAT))}
    else if(kind==="hohmann"){ /* afastador de Hohmann: ponta estreita e curva que contorna o osso, lâmina larga e cabo */
      var hg=new THREE.ExtrudeGeometry(poly([[0,0],[.0016,.0012],[.0021,.006],[.0024,.012],[.0058,.02],[.0062,.05],[.0046,.058],[-.0046,.058],[-.0062,.05],[-.0058,.02],[-.0024,.012],[-.0021,.006],[-.0016,.0012]]),
        {depth:.0007,bevelEnabled:true,bevelThickness:.0002,bevelSize:.0002,bevelSegments:2,curveSegments:12});hg.translate(0,0,-.00035);
      var hp=hg.attributes.position,R0=.007;for(var hi=0;hi<hp.count;hi++){var hy=hp.getY(hi),hz=hp.getZ(hi);if(hy<.014){var th2=(.014-hy)/R0,rr=R0-hz;hp.setY(hi,.014-rr*Math.sin(th2));hp.setZ(hi,R0-rr*Math.cos(th2))}}
      hg.computeVertexNormals();g.add(new THREE.Mesh(hg,STL));
      g.add(arm([[0,.054],[0,.07],[0,.088]],function(t){return .0032*ends(t,.02,.1)},function(){return .0017},SAT,20));
      var hh2=new THREE.Mesh(new THREE.CylinderGeometry(.0013,.0013,.0042,14),DST);hh2.rotation.x=PI/2;hh2.position.y=.081;g.add(hh2)}
    else if(kind==="driver"){ /* chave hexagonal: ponta sextavada, haste e cabo canelado */
      var rd=new THREE.Group();g.add(rd);pt.rot=rd;
      var hx=new THREE.Mesh(new THREE.CylinderGeometry(.0011,.0011,.0045,6),STL);hx.position.y=.00225;rd.add(hx);
      rd.add(lathe([[.0011,.0045],[.0015,.006],[.0015,.05],[.0024,.053],[0,.053]],STL,16));
      var hpf=[];for(var fi=0;fi<=24;fi++){var fy=.053+fi/24*.058;hpf.push([.0058+.0006*Math.sin(fi/24*PI)-(fi===0||fi===24?.002:0),fy])}
      hpf.unshift([0,.053]);hpf.push([0,.111]);var hdl=lathe(hpf,GRP,10);rd.add(hdl);
      var cap2=lathe([[0,.108],[.0052,.108],[.005,.112],[0,.1125]],ANO,24);rd.add(cap2)}
    g.visible=false;INS.add(g);return{g:g,pt:pt}}
  var tSaw=mkTool("saw"),tDr=mkTool("drill"),tDr2=mkTool("drill"),tFo=mkTool("forceps"),tNH=mkTool("holder"),tSc=mkTool("scalpel"),tGe=mkTool("gelpi"),tHo=mkTool("hohmann"),tSd=mkTool("driver");
  var bX=new V(),bM=new THREE.Matrix4(),fpL=new V(),fpM=new V(),gP=new V(),gN=new V(),gB=new V();
  function place(t,target,dir,ap,dist,nrm){var on=ap>.01&&!cmp&&!xray;t.g.visible=on;if(!on)return;var dn=dir.clone().normalize();t.g.position.copy(target).addScaledVector(dn,dist*(1-ap));
    if(nrm){bX.crossVectors(dn,nrm).normalize();t.g.quaternion.setFromRotationMatrix(bM.makeBasis(bX,dn,new V().crossVectors(bX,dn)))}else t.g.quaternion.setFromUnitVectors(Y,dn)}
  /* como place, mas com o eixo X da ferramenta (abertura das pontas) apontado para "ax" */
  function placeX(t,target,dir,ap,dist,ax){var dn=dir.clone().normalize();place(t,target,dn,ap,dist,new V().crossVectors(ax,dn))}
  var cmp=false,iso=false,xray=false,pov=false;

  /* visão do cirurgião: câmera por cima do campo, com a borda azul do campo cirúrgico */
  var vig=document.createElement("div");vig.className="vig";host.appendChild(vig);
  sc.add(cam);
  /* ---------- modo raio-X ---------- */
  var xBone=fres(0xd2deff,.05,.62,1.5,true),xSkel=fres(0xb4c4ee,.018,.2,1.3,true),xMet=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthTest:false});
  function setXray(v){xray=v;host.classList.toggle("xr",v);
    boneMeshes.forEach(function(o){if(!o.userData.m0)o.userData.m0=o.material;o.material=v?xBone:o.userData.m0;o.renderOrder=v?10:3});
    skelMeshes.forEach(function(o){if(!o.userData.m0)o.userData.m0=o.material;o.material=v?xSkel:o.userData.m0});
    metalMeshes.forEach(function(o){if(!o.userData.m0)o.userData.m0=o.material;o.material=v?xMet:o.userData.m0;o.renderOrder=v?20:0});
    lastKey=""}

  /* ---------- tempo global e estado de cada objeto (função pura de u) ---------- */
  function RP(u,a,b){var t=Math.min(1,Math.max(0,(u-a)/(b-a)));return t*t*(3-2*t)}
  function WN(u,a,b,c,d){return RP(u,a,b)*(1-RP(u,c,d))}
  var ct=P(0,0,.04),cc=P(-1.9,.4,1.15),fvT=40;
  var VW={far:[P(-1.9,.4,1.15),P(0,.0,.04),40],near:[P(-.27,.035,.3),P(-.093,-.034,.126),40],cl:[P(-.275,.06,-.05),P(-.095,-.022,.13),40],lat:[P(-.33,-.005,.02),P(-.098,-.05,.1),40],wide:[P(-.43,.02,.0),P(-.1,-.04,.115),40],
    scw:[P(-.3,.0,-.085),P(-.092,-.052,.123),40],pov:[P(-.2,.085,-.02),P(-.094,-.035,.116),54],povw:[P(-.27,.07,.0),P(-.1,-.04,.112),54]};
  var lastLbl="",cl=ct.clone(),co=cc.clone(),yaw=0,pitch=0,zoom=1,panV=new V(),view="free",labs=[],lastKey="",STILL=/still/.test(location.search);
  var VIEWS={front:[0,.12],lat:[-PI/2,.1],cau:[PI,.12]};
  var sunT=new THREE.Object3D();sc.add(sunT);sun.target=sunT;sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.bias=-.0004;sun.shadow.normalBias=.0006;
  ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.0;
  var ground=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.ShadowMaterial({opacity:.34}));ground.rotation.x=-PI/2;ground.position.y=-.406;ground.receiveShadow=true;ground.layers.set(1);sc.add(ground);
  function camKey(u){var k=Math.min(6,Math.floor(u));if(cmp)return"cl";if(pov)return k===6?"povw":"pov";if(k===0)return u<.5?"far":"near";if(k===6)return"wide";if(k===2&&u<2+INC-.04)return"wide";if(k===2||k===5)return"lat";if(k===3)return u<3.52?"cl":"scw";if(k===4)return"cl";return"near"}
  function setLabels(list){labs.forEach(function(l){l.el.remove()});labs=(list||[]).map(function(a){var el=document.createElement("div");el.className="lb";el.textContent=a[0];host.appendChild(el);setTimeout(function(){el.classList.add("on")},60);return{el:el,v:new V(a[1],a[2],a[3])}})}
  var so=1,gA=0,tV=new V(),INC=.3;
  var IPATH=SO.path.map(P3),ICUM=[0];for(var ip=1;ip<IPATH.length;ip++)ICUM.push(ICUM[ip-1]+IPATH[ip].distanceTo(IPATH[ip-1]));
  var ISN=SO.stSkin.map(function(e){return{s:e.s,n:P3(e.n)}}),incR={p:new V(),n:new V(),t:new V()};
  function incAt(sv){var L=sv*ICUM[ICUM.length-1],i=1;while(i<IPATH.length-1&&ICUM[i]<L)i++;
    var a=IPATH[i-1],b=IPATH[i],q=(L-ICUM[i-1])/Math.max(1e-9,ICUM[i]-ICUM[i-1]);incR.p.copy(a).lerp(b,q);incR.t.copy(b).sub(a).normalize();
    var j=1;while(j<ISN.length-1&&ISN[j].s<sv)j++;var qa=ISN[j-1],qb=ISN[j],qq=Math.min(1,Math.max(0,(sv-qa.s)/(qb.s-qa.s)));incR.n.copy(qa.n).lerp(qb.n,qq).normalize();return incR}
  function applyState(u,t){
    var k=Math.min(6,Math.floor(u));
    /* fratura e olécrano */
    var f3=u-2,inc=u>=2&&u<2+INC,w=(u>=2&&u<3)?2+Math.max(0,f3-INC)/(1-INC):u; /* w: tempo da etapa 3 sem a incisão */
    var disp=1-RP(u,3.1,3.5),cutp=RP(w,2.08,2.42),od=RP(w,2.45,2.85)*(1-RP(u,5.02,5.3)),cutOn=w>=2.08;
    gL.rotation.set(-.1*disp,0,.3*disp);gL.position.set(FP.x-.018*disp,FP.y+.011*disp,FP.z-.005*disp);
    gM.rotation.set(.06*disp,0,-.17*disp);gM.position.set(FP.x+.011*disp,FP.y+.007*disp,FP.z+.003*disp);
    gO.rotation.x=-.42*od;gO.position.copy(OP).addScaledVector(OAX,.021*od+(cutOn?.0004:0));gO.position.z-=.007*od;
    uFull.visible=!cutOn;uBody.visible=gO.visible=cutOn;
        fragM.emissiveIntensity=.1*disp;medM.emissiveIntensity=.085*disp;
        var gv=disp>.02&&!xray&&!inc,pu=.8+.2*Math.sin(t*2.6);gh.visible=gh2.visible=gv;ghM.uniforms.op.value=disp*pu;ghM2.uniforms.op.value=disp*pu;
    var csh=RP(w,2.05,2.1)*(1-RP(w,2.45,2.6));cutM.opacity=.5*csh;cutP.visible=csh>.01&&!xray;cutP.scale.x=Math.max(.0001,CW*cutp);cutP.position.x=CXL+CW*cutp/2;
    /* implantes: furo, depois parafuso */
    animScrew(tcs,RP(u,3.58,3.78),RP(u,3.8,3.97));
    var lL=RP(u,4,4.2);plL.visible=plM.visible=lL>.002;plL.position.copy(nL).multiplyScalar(.035*(1-lL));plM.position.copy(nM).multiplyScalar(.035*(1-lL));
    var act=null,actH=0;SCR.forEach(function(e){if(e===tcs)return;var i=sL.indexOf(e),ix=i>=0?i:6+sM.indexOf(e),t0=4.22+ix*.0467,hp=RP(u,t0,t0+.026),sp=RP(u,t0+.024,t0+.0467);animScrew(e,hp,sp);if(hp>.01&&sp<.97){act=e;actH=hp}});
    drawTo(hpin,RP(u,4.8,4.97));
    drawTo(opins[0],RP(u,5.3,5.46));drawTo(opins[1],RP(u,5.46,5.62));
    var bp=RP(u,5.63,5.72);hmk.visible=bp>.5&&!xray;drawTo(owire[0],RP(u,5.74,5.87));drawTo(owire[1],RP(u,5.87,5.97));knot.visible=u>5.97;
    /* tecidos e suturas */
    var tisI=inc?RP(f3,0,.035)*(1-RP(f3,.235,INC)):0,tis=xray?0:Math.max(tisI,RP(u,6.0,6.22));soft.visible=tis>.01;
    var scS=Math.min(1,Math.max(0,(f3-.05)/.095)); /* posição do bisturi ao longo da incisão */
    gL.visible=gM.visible=!(inc&&tisI>.985&&!xray);
    ovM.opacity=.36*(1-tis);ovs.forEach(function(c){c.visible=!xray&&tis<.98});
    if(soft.visible){var op=tis>=.999;[skM,skIn,muM].forEach(function(mm){mm.transparent=!op;mm.opacity=tis});
      var fm=(u-6.3)/.3,fs=(u-6.62)/.3;UM.front.value=-.06+1.14*Math.min(1,Math.max(0,fm));US.front.value=-.06+1.14*Math.min(1,Math.max(0,fs));
      if(inc){US.cut.value=scS>0?scS*1.1+.03:-.06;US.w.value=.0026+(.0078-.0026)*RP(f3,.15,.225);UM.cut.value=-.06+1.14*Math.min(1,Math.max(0,(f3-.15)/.045));UM.w.value=.0062*RP(f3,.165,.235)}
      else{US.cut.value=UM.cut.value=2;US.w.value=.0078;UM.w.value=.0062}
      stMu.forEach(function(s){var a=RP(UM.front.value,s.s-.01,s.s+.03);s.g.visible=a>.01;s.g.scale.setScalar(Math.max(.001,a))});
      stS.forEach(function(s){var a=RP(US.front.value,s.s-.01,s.s+.03);s.g.visible=a>.01;s.g.scale.setScalar(Math.max(.001,a))})}
    /* esqueleto de fundo */
    so=u<.9?1:1-RP(u,.9,1.1);if(iso)so=0;gA=iso||xray?0:RP(u,.95,1.15);
    if(!xray){skelM.opacity=tailM.opacity=so;skelM.depthWrite=tailM.depthWrite=so>.999;skelP.visible=so<=.999&&so>.01}else skelP.visible=false;
    skel.visible=so>.01;skel.castShadow=so>.8&&!xray;tailRoot.visible=!iso;limbMain.visible=!iso;
    /* instrumentos */
    var sawA=WN(w,2.04,2.12,2.45,2.55);place(tSaw,P(CXL+CW*cutp,OQ.y,OQ.z),P(-.45,-.32,-.72),sawA,.07,OAX);if(tSaw.pt.blade)tSaw.pt.blade.rotation.z=Math.sin(t*48)*.1;
    var hoA=WN(w,2.0,2.06,2.58,2.64);place(tHo,P(-.0868,-.052,.0952),P(.42,.5,-.76),hoA,.06,P(-.6,.2,-.2));
    /* pinça de redução: uma ponta em cada epicôndilo, acompanhando os fragmentos até fechar */
    var fA=WN(u,3.05,3.14,3.5,3.6);if(fA>.01){fpL.set(-.1239-.018*disp,-.0545+.011*disp,.1193-.005*disp);fpM.set(-.0561+.011*disp,-.0516+.007*disp,.1155+.003*disp);
      var fax=fpM.clone().sub(fpL),hs=fax.length()/2;placeX(tFo,fpL.clone().add(fpM).multiplyScalar(.5),P(-.05,.9,.42),fA,.07,fax.normalize());
      var fo=Math.asin(Math.min(.9,Math.max(0,hs-tFo.pt.HS)/tFo.pt.YP))+.25*(1-fA);tFo.pt.A.rotation.z=fo;tFo.pt.B.rotation.z=-fo}else tFo.g.visible=false;
    var dTC=WN(u,3.54,3.6,3.77,3.81),dPin=WN(u,5.26,5.32,5.6,5.64);
    /* chave hexagonal: aperta o parafuso intercondilar, girando junto com ele */
    var sdA=WN(u,3.79,3.82,3.95,3.99),ssp=RP(u,3.8,3.97);if(sdA>.01){place(tSd,tcs.a.clone().addScaledVector(tcs.d,-.03*(1-ssp)-.0009),tcs.d.clone().negate(),sdA,.05);tSd.pt.rot.rotation.y=-ssp*PI*12}else tSd.g.visible=false;
    if(dPin>dTC)place(tDr,TUB.clone().addScaledVector(OAX,.0045),P(0,.88,-.47),dPin,.07);else place(tDr,tcs.a.clone().addScaledVector(tcs.d,tcs.L*RP(u,3.58,3.78)*.55),tcs.d.clone().negate(),dTC,.07);
    var dA=WN(u,4.2,4.26,4.78,4.84),dH=WN(u,5.6,5.64,5.71,5.75);
    if(dH>.01)place(tDr2,HA,P(-1,.2,-.25),dH,.06);else if(act)place(tDr2,act.a.clone().addScaledVector(act.d,act.L*actH*.5),act.d.clone().negate(),dA,.07);else place(tDr2,HA,Y,0,0);
    tDr.pt.bit.rotation.y=tDr2.pt.bit.rotation.y=t*60;
    /* afastador autoestático: entra quando pele e músculo se abrem e acompanha a abertura da ferida */
    var geA=inc?WN(f3,.15,.18,.255,.29):0;if(geA>.01){var gq=incAt(.5);gP.copy(gq.p).addScaledVector(gq.n,-.0028);gN.copy(gq.n);gB.crossVectors(gq.t,gq.n).normalize();
      placeX(tGe,gP,gN,geA,.05,gB);var gw=Math.min(.0094,(tisI>.01?US.w.value:.0026)+.0012),gth=(.0108-gw)/.0312;tGe.pt.A.rotation.z=gth;tGe.pt.B.rotation.z=-gth}else tGe.g.visible=false;
    var scA=inc?WN(f3,.03,.05,.145,.17):0;if(scA>.01){var sp=incAt(scS);tSc.g.visible=!cmp&&!xray;
      tV.copy(sp.n).multiplyScalar(.77).addScaledVector(sp.t,.64).normalize();tSc.g.position.copy(sp.p).addScaledVector(sp.n,-.0012).addScaledVector(tV,.07*(1-scA));
      bX.copy(sp.t).addScaledVector(tV,-sp.t.dot(tV)).normalize();bX.applyAxisAngle(tV,.5);tSc.g.quaternion.setFromRotationMatrix(bM.makeBasis(bX,tV,new V().crossVectors(bX,tV)))}else tSc.g.visible=false;
    var nA=WN(u,6.3,6.36,6.93,6.99),lst=u<6.62?stMu:stS,fr=u<6.62?UM.front.value:US.front.value,cur=lst[0];lst.forEach(function(s){if(fr>=s.s-.02)cur=s});
    place(tNH,cur.p,P(-.3,.62,-.72),nA,.06,P(-1,.1,.2));var jo=.015+.04*Math.abs(Math.sin(t*5));tNH.pt.A.rotation.z=jo;tNH.pt.B.rotation.z=-jo;tNH.pt.thread.material=u<6.62?abM:nyM;
    return k}
  /* ---------- câmera, controles e laço de renderização ---------- */
  function az0el(v){return[Math.atan2(v.x,v.z),Math.asin(v.y/v.length())]}
  function offsetFor(){var d=cc.length()*zoom*(lastKey==="far"?Math.min(1,Math.max(.6,.84/cam.aspect)):1),a,e;
    if(!pov&&!cmp&&view!=="free"){a=VIEWS[view][0];e=VIEWS[view][1]}
    else{var b=az0el(cc);a=b[0]+(pov?0:yaw);e=Math.max(-1.35,Math.min(1.5,b[1]+(pov?0:pitch)))}
    return P(Math.sin(a)*Math.cos(e)*d,Math.sin(e)*d,Math.cos(a)*Math.cos(e)*d)}
  var cv=ren.domElement,ptrs={},pinch=0,dragging=false,lx=0,ly=0;
  function toFree(){if(view!=="free"){var b=az0el(cc),c=az0el(co);yaw=c[0]-b[0];pitch=c[1]-b[1];view="free";syncViews()}}
  cv.addEventListener("pointerdown",function(e){if(cv.setPointerCapture)cv.setPointerCapture(e.pointerId);ptrs[e.pointerId]=[e.clientX,e.clientY];dragging=true;lx=e.clientX;ly=e.clientY;pinch=0});
  cv.addEventListener("pointerup",function(e){delete ptrs[e.pointerId];dragging=Object.keys(ptrs).length>0;pinch=0});
  cv.addEventListener("pointercancel",function(e){delete ptrs[e.pointerId];dragging=false});
  cv.addEventListener("pointermove",function(e){if(!ptrs[e.pointerId])return;var ks=Object.keys(ptrs);ptrs[e.pointerId]=[e.clientX,e.clientY];
    if(ks.length>=2){var p0=ptrs[ks[0]],p1=ptrs[ks[1]],d=Math.hypot(p0[0]-p1[0],p0[1]-p1[1]);if(pinch)zoom=Math.max(.3,Math.min(2.8,zoom*pinch/d));pinch=d;return}
    var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    if(e.shiftKey||e.buttons===2){var f=co.length()*zoom*.0016,r=new V().setFromMatrixColumn(cam.matrix,0),uu=new V().setFromMatrixColumn(cam.matrix,1);panV.addScaledVector(r,-dx*f).addScaledVector(uu,dy*f)}
    else{toFree();yaw-=dx*.01;pitch+=dy*.006}});
  cv.addEventListener("wheel",function(e){e.preventDefault();zoom=Math.max(.3,Math.min(2.8,zoom*Math.exp(e.deltaY*.0012)))},{passive:false});
  cv.addEventListener("dblclick",function(){yaw=pitch=0;zoom=1;panV.set(0,0,0);view="free";syncViews()});
  cv.addEventListener("contextmenu",function(e){e.preventDefault()});
  function syncViews(){Array.prototype.forEach.call(document.querySelectorAll("#views button"),function(b){b.className=b.getAttribute("data-v")===view?"on":""})}
  var W=1,H=1;function size(){W=Math.max(1,host.clientWidth);H=Math.max(1,host.clientHeight);ren.setSize(W,H);cam.aspect=W/H;cam.updateProjectionMatrix()}
  addEventListener("resize",size);if(window.ResizeObserver)new ResizeObserver(size).observe(host);size();
  var cmpL=document.createElement("div"),cmpR=document.createElement("div");cmpL.className="cmp l";cmpR.className="cmp r";cmpL.textContent="Antes: fratura";cmpR.textContent="Depois: fixação";cmpL.hidden=cmpR.hidden=true;host.appendChild(cmpL);host.appendChild(cmpR);
  api={view:function(v){view=v;if(v==="free"){yaw=pitch=0}syncViews()},zoom:function(f){if(f===0){zoom=1;panV.set(0,0,0);yaw=pitch=0;view="free";syncViews()}else zoom=Math.max(.3,Math.min(2.8,zoom*f))},
    iso:function(v){iso=v},xray:setXray,pov:function(v){pov=v;lastKey=""},resize:function(){setTimeout(size,60)},
    cmp:function(v){cmp=v;cmpL.hidden=cmpR.hidden=!v;lastKey="";if(!v){cam.aspect=W/H;cam.updateProjectionMatrix()}}};
  window.__api=api;
  var t0=performance.now(),tp=t0,pv=new V();
  function frame(u,t,k){
    var key=camKey(u);
    var kk=Math.min(6,Math.floor(u)),lk=key+"|"+kk+"|"+(kk===0&&u<.5)+"|"+(kk===2&&u<2+INC-.04)+"|"+pov+"|"+cmp;
    if(key!==lastKey){lastKey=key;ct.copy(VW[key][1]);cc.copy(VW[key][0]).sub(ct);fvT=VW[key][2]}
    if(lk!==lastLbl){lastLbl=lk;setLabels(pov||cmp?[]:(kk===0?(u<.5?LB.r:LB.r.slice(2,3)):(kk===2&&u<2+INC-.04?LB.inc:LB[kk])));vig.classList.toggle("on",pov&&kk>0)}
    cl.lerp(ct,k);co.lerp(offsetFor(),k);var tgt=cl.clone().add(panV);
    var sway=(STILL||!playing||calm)?0:Math.sin(t*.4)*.08;
    cam.position.copy(tgt).add(new V(co.x*Math.cos(sway)+co.z*Math.sin(sway),co.y,-co.x*Math.sin(sway)+co.z*Math.cos(sway)));
    if(pov&&!calm){cam.position.x+=Math.sin(t*1.3)*.0012;cam.position.y+=Math.sin(t*.9)*.001}
    cam.up.set(0,1,0);cam.lookAt(tgt);if(Math.abs(cam.fov-fvT)>.05){cam.fov+=(fvT-cam.fov)*k;cam.updateProjectionMatrix()}
    var sd=Math.max(.15,co.length()*.7);sun.shadow.camera.left=-sd;sun.shadow.camera.right=sd;sun.shadow.camera.top=sd;sun.shadow.camera.bottom=-sd;sun.shadow.camera.near=.1;sun.shadow.camera.far=9;sun.shadow.camera.updateProjectionMatrix();
    sunT.position.copy(cl);sun.position.copy(cl).add(tV.set(-.62,.6,.5).multiplyScalar(3.2));
    tailJ.forEach(function(j,q){var w=q/(TN-1);if(calm){return}j.rotation.y=Math.sin(t*1.2-q*.28)*.035*(.25+w);j.rotation.x=j.userData.rx+Math.sin(t*.9-q*.2)*.008*(.3+w)});
    tailRoot.rotation.y=calm?0:Math.sin(t*.8)*.05}
  /* com o esqueleto de fundo translúcido, ele é desenhado antes e o cotovelo por cima, em duas passadas */
  function draw(){
    if(xray||so>.999||(so<.011&&gA<.011)){cam.layers.enableAll();ren.render(sc,cam);return}
    cam.layers.set(1);ren.render(sc,cam);ren.autoClear=false;
    if(gA>.011){var v1=skel.visible,v2=skelP.visible;skel.visible=true;skelP.visible=ground.visible=false;
      sc.overrideMaterial=depthM;ren.render(sc,cam);ghostM.uniforms.op.value=gA;sc.overrideMaterial=ghostM;ren.render(sc,cam);
      sc.overrideMaterial=null;skel.visible=v1;skelP.visible=v2;ground.visible=true}
    ren.clearDepth();cam.layers.set(0);ren.render(sc,cam);ren.autoClear=true}
  function loop(now){requestAnimationFrame(loop);if(!host.offsetParent){tp=now;return}
    var dt=Math.max(0,Math.min((now-tp)/1000,.1)),t=(now-t0)/1000,kk=Math.min(1,dt*(calm||STILL?20:2.2));tp=now;
    var A=window.A3;if(playing&&!dragSlider){var k0=Math.min(6,Math.floor(A.u));A.u+=dt*speed/DUR[k0];if(A.u>=7){A.u=6.999;playing=false}}
    if(!(A.u>=0))A.u=0;var u=A.u;
    if(cmp){frame(1.5,t,kk);
      ren.setScissorTest(true);cam.aspect=W/2/H;cam.updateProjectionMatrix();
      ren.setViewport(0,0,W/2,H);ren.setScissor(0,0,W/2,H);applyState(1.5,t);draw();
      ren.setViewport(W/2,0,W/2,H);ren.setScissor(W/2,0,W/2,H);applyState(5.99,t);draw();
      ren.setScissorTest(false);ren.setViewport(0,0,W,H)}
    else{applyState(u,t);frame(u,t,kk);draw();
      labs.forEach(function(l){pv.copy(l.v);pv.project(cam);var ok=pv.z<1;l.el.style.display=ok?"block":"none";l.el.style.left=(pv.x*.5+.5)*W+"px";l.el.style.top=(-pv.y*.5+.5)*H+"px"})}
    if(window.uiTick)uiTick()}
  /* sombras: quem projeta e quem recebe */
  sc.traverse(function(o){if(!o.isMesh)return;var skip=(o===cutP||o===ground||o===gh||o===gh2||o===skelP||pres.indexOf(o)>=0||o.parent===soft||(o.parent&&o.parent.parent===soft));
    o.castShadow=!skip&&o!==skel;o.receiveShadow=!skip||o===sk||o===mus});
  var dragSlider=false;window.setDragSlider=function(v){dragSlider=v};
  requestAnimationFrame(loop);
}
try{build()}catch(e){$("stage").innerHTML='<p id="err">Não foi possível iniciar o 3D neste navegador. Tente abrir em outro navegador.</p>';console.error(e)}
go(0);uiTick();

