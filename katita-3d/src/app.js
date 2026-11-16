(function(){var n=document.getElementById("nojs");if(n)n.parentNode.removeChild(n)})();
function dec(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
var steps=[
{t:"O esqueleto e o cotovelo",est:"Escápula, úmero, rádio, ulna e olécrano (membro anterior esquerdo)",obj:"Localizar a região operada antes da intervenção",ins:"Nenhum nesta etapa",
 ph:[[0,"Katita, 7 anos, SRD, 35 kg, foi atropelada. No esqueleto inteiro, o úmero do membro anterior esquerdo está fraturado junto ao cotovelo."],[.5,"De perto: a ponta do úmero está partida em três pedaços, a diáfise e os dois côndilos."]]},
{t:"A lesão: fratura em Y",est:"Diáfise do úmero e côndilos lateral e medial",obj:"Reconhecer a fratura do úmero distal em três partes",ins:"Radiografia (diagnóstico por imagem)",
 ph:[[0,"O úmero quebrou em formato de Y: uma linha separa os dois côndilos e outras duas os soltam da diáfise, o corpo do osso."],[.3,"O côndilo lateral (vermelho) e o medial (âmbar) estão fora do lugar. O contorno brilhante mostra a posição original de cada um."],[.65,"As faces rosadas são o osso esponjoso exposto pela fratura. As radiografias reais mostram a mesma lesão."]]},
{t:"Acesso: osteotomia do olécrano",est:"Pele, músculo, olécrano, ulna proximal e tríceps braquial",obj:"Expor a articulação para enxergar e reduzir o úmero distal",ins:"Bisturi, afastadores de Hohmann, serra oscilatória",
 ph:[[0,"O acesso é pela face caudal do cotovelo. O bisturi abre a pele sobre a articulação."],[.15,"A pele e o músculo são afastados, e o osso aparece no fundo da incisão."],[.24,"Com os tecidos afastados, o cotovelo fica exposto por trás. Daqui em diante a pele e o músculo ficam ocultos, para mostrar o osso."],[.356,"A serra oscilatória faz um corte transversal no olécrano, de lateral para medial."],[.615,"O olécrano é rebatido para cima, junto com a inserção do tríceps, e abre o acesso à articulação."]]},
{t:"Redução e parafuso intercondilar",est:"Côndilos medial e lateral do úmero",obj:"Recompor a superfície articular e comprimir os fragmentos",ins:"Pinça de redução, furadeira ortopédica, parafuso de compressão",
 ph:[[0,"A pinça de redução leva os côndilos de volta ao lugar, até a superfície articular ficar contínua."],[.5,"A furadeira abre um túnel que atravessa os dois côndilos, de lateral para medial."],[.8,"O parafuso intercondilar avança girando e comprime um côndilo contra o outro. O trecho dentro do osso aparece em azul-claro."]]},
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
steps.forEach(function(s,n){var b=document.createElement("button");b.className="tk";b.textContent=n+1;b.setAttribute("aria-label","Etapa "+(n+1)+": "+s.t);b.onclick=function(){go(n)};tickEl.appendChild(b)});
function go(n,end){n=((n%N)+N)%N;A3.u=n+(end?.995:.0);lastK=-1;uiTick()}
function uiTick(){var u=A3.u>=0?A3.u:0,k=Math.min(N-1,Math.floor(u)),f=u-k,S=steps[k],pi=0;
  for(var q=0;q<S.ph.length;q++)if(f>=S.ph[q][0])pi=q;
  if(k!==lastK){lastK=k;$("chip").textContent="Etapa "+(k+1)+" de "+N;$("hchip").textContent="Etapa "+(k+1)+" de "+N;$("t").textContent=S.t;$("pt").textContent=S.t;$("m1").textContent=S.est;$("m2").textContent=S.obj;$("m3").textContent=S.ins;
    Array.prototype.forEach.call(figs,function(g){g.hidden=g.getAttribute("data-k")!==String(k)});
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
document.addEventListener("keydown",function(e){var tg=e.target&&e.target.tagName;if(tg==="INPUT"||tg==="SELECT"||tg==="TEXTAREA"||e.ctrlKey||e.metaKey||e.altKey)return;
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
  var pos=new Float32Array(dec(A.POS).buffer),uv=new Float32Array(dec(A.UV).buffer),idx=new Uint16Array(dec(A.IDX).buffer),left=dec(A.LEFT);
  var tex=new THREE.Texture();tex.flipY=false;tex.encoding=THREE.sRGBEncoding;
  var timg=new Image();timg.onload=function(){try{var c=document.createElement("canvas");c.width=timg.width;c.height=timg.height;var g=c.getContext("2d");g.drawImage(timg,0,0);
      var d=g.getImageData(0,0,c.width,c.height),p=d.data,lut=[],i;for(i=0;i<256;i++)lut[i]=255*Math.pow(i/255,.58);
      for(i=0;i<p.length;i+=4){p[i]=lut[p[i]];p[i+1]=lut[p[i+1]]*.975;p[i+2]=lut[p[i+2]]*.91}
      g.putImageData(d,0,0);tex.image=c}catch(e){tex.image=timg}tex.needsUpdate=true};timg.src=A.TEX;
  var skelM=new THREE.MeshStandardMaterial({map:tex,metalness:0,roughness:.8,envMapIntensity:.5,side:THREE.DoubleSide,transparent:true});
  var skelPre=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide,transparent:true});
  var limbSk=new THREE.MeshStandardMaterial({map:tex,metalness:0,roughness:.8,envMapIntensity:.5,side:THREE.DoubleSide});
  var rest=[],main=[];
  for(var a=0;a<idx.length;a+=3){var p=idx[a],q=idx[a+1],r=idx[a+2];
    if(!left[p]){rest.push(p,q,r);continue}
    var cy=(pos[p*3+1]+pos[q*3+1]+pos[r*3+1])/3;
    if(cy<.07&&cy>-.2)continue;main.push(p,q,r)}
  function geo(list){var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("uv",new THREE.BufferAttribute(uv,2));g.setIndex(list);g.computeVertexNormals();return g}
  var gRest=geo(rest),skel=new THREE.Mesh(gRest,skelM),skelP=new THREE.Mesh(gRest,skelPre);skel.renderOrder=1;skelP.renderOrder=0;sc.add(skelP,skel);
  var limbMain=new THREE.Mesh(geo(main),limbSk);sc.add(limbMain);
  /* cauda: vértebras caudais articuladas */
  var TU=[0.022915709763765335,0.8021401166915894],tailRoot=new THREE.Group();tailRoot.position.set(0,.097,-.455);tailRoot.rotation.x=-.9;sc.add(tailRoot);
  var tailJ=[],TN=20,tprev=tailRoot,tl=0;
  function setUV(g){var n=g.attributes.position.count,a=new Float32Array(n*2);for(var q=0;q<n;q++){a[q*2]=TU[0];a[q*2+1]=TU[1]}g.setAttribute("uv",new THREE.BufferAttribute(a,2));return g}
  for(var ti2=0;ti2<TN;ti2++){
    var f=ti2/(TN-1),L=.03-.016*f,r=.0165*(1-.8*f)+.0018,gj=new THREE.Group();
    gj.position.set(0,0,ti2?-tl:0);gj.rotation.x=ti2?.075:0;tprev.add(gj);
    var pr=[];[[0,0],[.84,0],[1,.14],[.78,.5],[1,.86],[.84,1],[0,1]].forEach(function(p){pr.push(new THREE.Vector2(r*p[0],L*.92*p[1]))});
    var vg=setUV(new THREE.LatheGeometry(pr,10));vg.rotateX(-PI/2);gj.add(new THREE.Mesh(vg,skelM));
    if(ti2<6){var sp=setUV(new THREE.ConeGeometry(r*.38,.011*(1-f*1.2),6));var spm=new THREE.Mesh(sp,skelM);spm.position.set(0,r*.95+.004,-L*.5);gj.add(spm);
      var tp=setUV(new THREE.BoxGeometry(r*5.2,.0035,.009));var tpm=new THREE.Mesh(tp,skelM);tpm.position.set(0,0,-L*.32);gj.add(tpm)}
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
  var SCR=[],qS=new THREE.Quaternion();
  function mkScrew(a,b,r,grp){var d=new V().subVectors(b,a),L=d.length();d.normalize();
    var g=new THREE.Group();g.position.copy(a);g.quaternion.setFromUnitVectors(Y,d);
    g.add(m(cyl,MT,0,L/2,0,r,L,r));g.add(m(cyl,MT,0,0,0,r*1.85,.0016,r*1.85));g.add(m(box,DK,0,-.0009,0,r*2.9,.0005,r*.6));
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

  /* ---------- instrumentos cirúrgicos no campo (eixo +Y = cabo; ponta na origem) ---------- */
  var INS=new THREE.Group();sc.add(INS);
  var GRIP=M(0x3d5a73,{roughness:.42,metalness:.55,envMapIntensity:.9}),BLK=M(0x1a2129,{roughness:.4,metalness:.7,envMapIntensity:.8}),STL=M(0xc9d2dc,{metalness:.95,roughness:.25,envMapIntensity:1.3});
  function taper(r1,r2,len,y0,mt){var o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,len,18),mt);o.position.y=y0+len/2;return o}
  function armTube(pts,r){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),18,r,7),STL)}
  function mkTool(kind){var g=new THREE.Group(),pt={};
    if(kind==="saw"){ /* serra oscilatória: lâmina chata em leque na ponta de um corpo fino */
      var shp=new THREE.Shape();shp.moveTo(-.0022,0);shp.lineTo(-.0058,-.02);shp.quadraticCurveTo(0,-.0238,.0058,-.02);shp.lineTo(.0022,0);shp.closePath();
      var bg=new THREE.ExtrudeGeometry(shp,{depth:.0005,bevelEnabled:false});bg.translate(0,0,-.00025);
      var bl=new THREE.Mesh(bg,STL);bl.position.y=.0215;g.add(bl);pt.blade=bl;
      g.add(taper(.0026,.0044,.012,.0215,BLK),taper(.0044,.0052,.07,.0335,GRIP),taper(.0052,.0036,.02,.1035,BLK))}
    else if(kind==="scalpel"){ /* bisturi: lâmina com o fio voltado para +X, cabo chato */
      var bs=new THREE.Shape();bs.moveTo(0,0);bs.quadraticCurveTo(.0046,.006,.0036,.018);bs.lineTo(.0026,.03);bs.lineTo(-.0016,.03);bs.lineTo(-.0019,.012);bs.closePath();
      var sg2=new THREE.ExtrudeGeometry(bs,{depth:.0004,bevelEnabled:false});sg2.translate(0,0,-.0002);g.add(new THREE.Mesh(sg2,STL));
      g.add(m(box,STL,.0005,.036,0,.004,.012,.0016),m(box,GRIP,.0005,.097,0,.0078,.11,.0034),m(box,BLK,.0005,.048,0,.0082,.012,.0038))}
    else if(kind==="drill"){ /* furadeira tipo caneta */
      var bit=m(cyl,STL,0,.015,0,.00085,.03,.00085);g.add(bit);pt.bit=bit;
      g.add(taper(.0016,.003,.008,.03,STL),taper(.003,.0052,.012,.038,BLK),taper(.0052,.0056,.07,.05,GRIP),taper(.0056,.0038,.018,.12,BLK))}
    else{ /* pinça de redução com pontas / porta-agulhas: duas hastes cruzadas num pivô */
      pt.A=new THREE.Group();pt.B=new THREE.Group();pt.A.position.y=.03;pt.B.position.y=.03;
      [[pt.A,1],[pt.B,-1]].forEach(function(p){var a=p[0],sg=p[1],hold=kind==="holder";
        a.add(armTube(hold?[P(0,0,0),P(sg*.0012,-.015,0),P(sg*.0004,-.03,0)]:[P(0,0,0),P(sg*.0075,-.012,0),P(sg*.0062,-.023,0),P(sg*.0006,-.03,0)],.0011));
        a.add(armTube([P(0,0,0),P(-sg*.0035,.035,0),P(-sg*.0068,.07,0)],.0013));
        a.add(m(new THREE.TorusGeometry(.0058,.0011,6,16),STL,-sg*.0075,.0785,0,1,1,1));g.add(a)});
      g.add(m(cyl,BLK,0,.03,0,.0019,.0032,.0019));g.children[g.children.length-1].rotation.x=PI/2;
      if(kind==="holder"){var nd=new THREE.Mesh(new THREE.TorusGeometry(.0065,.00045,6,16,PI*1.1),STL);nd.position.set(0,-.0005,0);nd.rotation.set(0,PI/2,.4);g.add(nd)}}
    g.scale.setScalar(.72);g.visible=false;INS.add(g);return{g:g,pt:pt}}
  var tSaw=mkTool("saw"),tDr=mkTool("drill"),tDr2=mkTool("drill"),tFo=mkTool("forceps"),tNH=mkTool("holder"),tSc=mkTool("scalpel");
  var bX=new V(),bM=new THREE.Matrix4();
  function place(t,target,dir,ap,dist,nrm){var on=ap>.01&&!cmp&&!xray;t.g.visible=on;if(!on)return;var dn=dir.clone().normalize();t.g.position.copy(target).addScaledVector(dn,dist*(1-ap));
    if(nrm){bX.crossVectors(dn,nrm).normalize();t.g.quaternion.setFromRotationMatrix(bM.makeBasis(bX,dn,new V().crossVectors(bX,dn)))}else t.g.quaternion.setFromUnitVectors(Y,dn)}
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
  var so=1,tV=new V(),INC=.3,GHO=.07;
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
    so=u<.9?1:1-(1-GHO)*RP(u,.9,1.1);if(iso)so=0;
    if(!xray){skelM.opacity=so;skelM.depthWrite=so>.999;skelP.visible=so<=.999&&so>.01}else skelP.visible=false;
    skel.visible=so>.01;skel.castShadow=so>.8&&!xray;tailRoot.visible=!iso;limbMain.visible=!iso;
    /* instrumentos */
    var sawA=WN(w,2.04,2.12,2.45,2.55);place(tSaw,P(CXL+CW*cutp,OQ.y,OQ.z),P(-.45,-.32,-.72),sawA,.07,OAX);if(tSaw.pt.blade)tSaw.pt.blade.rotation.z=Math.sin(t*48)*.1;
        var fA=WN(u,3.05,3.14,3.5,3.6);place(tFo,P(-.1215-.016*disp,-.05+.01*disp,.119),P(-.7,.4,-.6),fA,.07);var opn=.06+.3*disp;tFo.pt.A.rotation.z=opn;tFo.pt.B.rotation.z=-opn;
    var dTC=WN(u,3.54,3.6,3.84,3.9),dPin=WN(u,5.26,5.32,5.6,5.64);
    if(dPin>dTC)place(tDr,TUB.clone().addScaledVector(OAX,.0045),P(0,.88,-.47),dPin,.07);else place(tDr,tcs.a.clone().addScaledVector(tcs.d,tcs.L*RP(u,3.58,3.78)*.55),tcs.d.clone().negate(),dTC,.07);
    var dA=WN(u,4.2,4.26,4.78,4.84),dH=WN(u,5.6,5.64,5.71,5.75);
    if(dH>.01)place(tDr2,HA,P(-1,.2,-.25),dH,.06);else if(act)place(tDr2,act.a.clone().addScaledVector(act.d,act.L*actH*.5),act.d.clone().negate(),dA,.07);else place(tDr2,HA,Y,0,0);
    tDr.pt.bit.rotation.y=tDr2.pt.bit.rotation.y=t*60;
    var scA=inc?WN(f3,.03,.05,.145,.17):0;if(scA>.01){var sp=incAt(scS);tSc.g.visible=!cmp&&!xray;
      tV.copy(sp.n).multiplyScalar(.77).addScaledVector(sp.t,.64).normalize();tSc.g.position.copy(sp.p).addScaledVector(sp.n,-.0012).addScaledVector(tV,.07*(1-scA));
      bX.copy(sp.t).addScaledVector(tV,-sp.t.dot(tV)).normalize();bX.applyAxisAngle(tV,.5);tSc.g.quaternion.setFromRotationMatrix(bM.makeBasis(bX,tV,new V().crossVectors(bX,tV)))}else tSc.g.visible=false;
    var nA=WN(u,6.3,6.36,6.93,6.99),lst=u<6.62?stMu:stS,fr=u<6.62?UM.front.value:US.front.value,cur=lst[0];lst.forEach(function(s){if(fr>=s.s-.02)cur=s});
    place(tNH,cur.p,P(-.8,.45,-.35),nA,.06);var jo=.1+.12*Math.abs(Math.sin(t*5));tNH.pt.A.rotation.z=jo;tNH.pt.B.rotation.z=-jo;
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
    tailJ.forEach(function(j,q){var w=q/(TN-1);if(calm){return}j.rotation.y=Math.sin(t*1.5-q*.3)*.05*(.4+w);j.rotation.x=(q?.075:0)+Math.sin(t*1.05-q*.22)*.012*(.3+w)});
    tailRoot.rotation.y=calm?0:Math.sin(t*.8)*.05}
  /* com o esqueleto de fundo translúcido, ele é desenhado antes e o cotovelo por cima, em duas passadas */
  function draw(){
    if(xray||so>.999||so<.011){cam.layers.enableAll();ren.render(sc,cam);return}
    cam.layers.set(1);ren.render(sc,cam);ren.autoClear=false;ren.clearDepth();cam.layers.set(0);ren.render(sc,cam);ren.autoClear=true}
  function loop(now){requestAnimationFrame(loop);
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
