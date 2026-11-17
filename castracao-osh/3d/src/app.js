(function(){
function dec(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
var host=document.getElementById("palco");
var ren=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
ren.setPixelRatio(Math.min(2,window.devicePixelRatio||1));ren.outputEncoding=THREE.sRGBEncoding;
ren.physicallyCorrectLights=true;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=.95;
host.appendChild(ren.domElement);
var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,16/9,.01,20);
cam.position.set(.9,.5,.9);cam.lookAt(0,.15,0);
ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xeef5fb,0x3a3230,1.1));
var key=new THREE.DirectionalLight(0xfff4e6,2.4);key.position.set(.9,2,1.1);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;key.shadow.normalBias=.002;
var sc=key.shadow.camera;sc.left=sc.bottom=-.7;sc.right=sc.top=.7;sc.near=.5;sc.far=4;scene.add(key);
var fill=new THREE.DirectionalLight(0xbfd6ff,.7);fill.position.set(-1.5,.8,-.6);scene.add(fill);
/* reflexos para o inox: ambiente procedural (sala clara com focos de luz) */
(function(){var pm=new THREE.PMREMGenerator(ren),sala=new THREE.Scene(),cx=new THREE.BoxGeometry(1,1,1);
  var paredes=new THREE.Mesh(new THREE.BoxGeometry(10,6,10),new THREE.MeshBasicMaterial({color:0x1d2629,side:THREE.BackSide}));sala.add(paredes);
  [[0,2.9,0,3,.1,1.2,2.2],[4.9,1.2,-1,.1,1.4,4,2.2],[-4.9,1.5,1.5,.1,1,2.5,2.6],[0,1.4,-4.9,5,.5,.1,1.2]].forEach(function(a){var l=new THREE.Mesh(cx,new THREE.MeshBasicMaterial({color:new THREE.Color(1,1,1).multiplyScalar(a[6])}));
    l.position.set(a[0],a[1],a[2]);l.scale.set(a[3],a[4],a[5]);sala.add(l)});
  scene.environment=pm.fromScene(sala,.02).texture;pm.dispose()})();
/* mesa cirúrgica de inox (tampo a y = 0) */
var mesa=new THREE.Group();scene.add(mesa);
(function(){var w=.5,c=1.0,r=.05,s=new THREE.Shape();s.moveTo(-w/2+r,-c/2);s.lineTo(w/2-r,-c/2);s.quadraticCurveTo(w/2,-c/2,w/2,-c/2+r);
  s.lineTo(w/2,c/2-r);s.quadraticCurveTo(w/2,c/2,w/2-r,c/2);s.lineTo(-w/2+r,c/2);s.quadraticCurveTo(-w/2,c/2,-w/2,c/2-r);s.lineTo(-w/2,-c/2+r);s.quadraticCurveTo(-w/2,-c/2,-w/2+r,-c/2);
  var g=new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:3,curveSegments:10});
  g.rotateX(Math.PI/2);g.translate(0,-.006,.02);
  var inox=new THREE.MeshStandardMaterial({color:0x8e979f,metalness:.9,roughness:.42,envMapIntensity:1.2});
  var tampo=new THREE.Mesh(g,inox);tampo.receiveShadow=true;mesa.add(tampo);
  var pe=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,.8,24),inox);pe.position.set(0,-.43,.02);mesa.add(pe)})();
var gata=null,ossos={};
new THREE.GLTFLoader().parse(dec(GLB).buffer,"",function(g){
  gata=g.scene;scene.add(gata);
  var MAPA={"66D0F3B7":"corpo","CFB4CB77":"rosto","49EEE8A5":"pelo"},tl=new THREE.TextureLoader();
  gata.traverse(function(o){if(o.isBone)ossos[o.name]=o;
    if(o.isMesh){o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;var mt=o.material,k=MAPA[mt.name];mt.envMapIntensity=.25;mt.roughness=.75;
      if(k&&TEX[k]){var t=tl.load(TEX[k]);t.flipY=false;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;mt.map=t;mt.needsUpdate=true}}});
  gata.updateMatrixWorld(true);
  Object.keys(ossos).forEach(function(n){REPOUSO[n]=ossos[n].quaternion.clone()});
  // eixo de cada osso = direção do filho (alguns ossos do lado direito apontam para -X)
  function eixo(n){var b=ossos[n];if(EIXO[n])return EIXO[n];var f=b.children.filter(function(c){return c.isBone})[0];
    EIXO[n]=f?f.position.clone().normalize():(b.parent.isBone?eixo(b.parent.name):EX.clone());return EIXO[n]}
  Object.keys(ossos).forEach(eixo);
  window.DBG.pronto=true;
},function(e){console.error(e)});
/* ---------- poses: cada osso aponta pelo seu eixo +X local (convenção do modelo) ---------- */
var V=THREE.Vector3,Q=THREE.Quaternion,REPOUSO={},EIXO={},EX=new V(1,0,0);
function mira(nome,dir){var b=ossos[nome];gata.updateMatrixWorld(true);
  var qw=b.getWorldQuaternion(new Q()),cur=EIXO[nome].clone().applyQuaternion(qw),
      qd=new Q().setFromUnitVectors(cur,dir.clone().normalize()),qp=b.parent.getWorldQuaternion(new Q());
  b.quaternion.copy(qp.invert().multiply(qd).multiply(qw))}
function gira(nome,eixoLocal,ang){ossos[nome].quaternion.multiply(new Q().setFromAxisAngle(eixoLocal,ang))}
function lado(nome){gata.updateMatrixWorld(true);return Math.sign(ossos[nome].getWorldPosition(new V()).x)||1}
var POSES={
  empe:function(){Object.keys(REPOUSO).forEach(function(n){ossos[n].quaternion.copy(REPOUSO[n])});gata.rotation.set(0,0,0);gata.position.set(0,0,0)},
  dorsal:function(){POSES.empe();gata.rotation.set(0,0,Math.PI);gata.position.set(0,.285,0);
    mira("Back",new V(0,.04,1));mira("Neck",new V(0,.1,1));mira("Head",new V(0,.75,1));
    ["L","R"].forEach(function(s){
      var sx=lado(s+"_Shoulder");
      mira(s+"_Shoulder",new V(sx*.5,-.45,1));mira(s+"_Arm",new V(sx*.3,-.3,1));mira(s+(s==="L"?"__FrontPaw":"_FrontPaw"),new V(sx*.25,-.35,1));
      var tx=lado(s+"_Thigh");
      mira(s+"_Thigh",new V(tx*.45,-.05,-1));mira(s+"_Leg",new V(tx*.25,-.2,-1));mira(s+"_BackPaw",new V(tx*.2,-.35,-1));
    });
    mira("Tail",new V(0,-.12,-1));mira("Tail1",new V(.1,-.05,-1));mira("Tail2",new V(.2,0,-1));
  }};
function size(){var W=host.clientWidth,H=host.clientHeight;ren.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix()}
window.addEventListener("resize",size);size();
function loop(){requestAnimationFrame(loop);ren.render(scene,cam)}loop();
window.DBG={THREE:THREE,scene:scene,cam:cam,ossos:ossos,get gata(){return gata},
  posa:function(n){POSES[n]()},
  olhar:function(p,t,u){cam.up.set(0,1,0);if(u)cam.up.set(u[0],u[1],u[2]);cam.position.set(p[0],p[1],p[2]);cam.lookAt(t[0],t[1],t[2])}};
})();
