"""Gera build/preview.html para conferir as malhas (uso interno)."""
import base64, json, os, sys
here = os.path.dirname(__file__); out = os.path.join(here, "..", "build")
names = sys.argv[1:] or ["bones"]
data = {}
for n in names:
    data[n] = dict(meta=json.load(open(os.path.join(out, n + ".json"))), bin=base64.b64encode(open(os.path.join(out, n + ".bin"), "rb").read()).decode())
html = """<!doctype html><meta charset=utf-8><style>html,body{margin:0;height:100%;background:#10181a}#stage{width:100vw;height:100vh}</style><div id=stage></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>var DATA=@@DATA@@;
function dec(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
var Q=new URLSearchParams(location.search),view=Q.get('view')||'lat',ex=+(Q.get('ex')||0),only=Q.get('only'),hide=(Q.get('hide')||'').split(','),zoom=+(Q.get('zoom')||1),ty=+(Q.get('ty')||-.05),tz=+(Q.get('tz')||.12),tx=+(Q.get('tx')||-.092);
var ren=new THREE.WebGLRenderer({antialias:true});ren.setSize(innerWidth,innerHeight);ren.outputEncoding=THREE.sRGBEncoding;document.getElementById('stage').appendChild(ren.domElement);
var sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x334455,.45));var sun=new THREE.DirectionalLight(0xffffff,.75);sc.add(sun);
var cam=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,.01,10);
var EX={hLat:[-.02,.012,0],hMed:[.02,.008,0],uOlec:[0,.012,-.02],radius:[0,0,.03],uBody:[0,0,-.012],uFull:[0,0,-.012]};
Object.keys(DATA).forEach(function(k){var D=DATA[k],buf=dec(D.bin).buffer,lo=D.meta.lo,hi=D.meta.hi;
 D.meta.pieces.forEach(function(p){ if(only&&only.split(',').indexOf(p.name)<0)return; if(hide.indexOf(p.name)>=0)return;
  var q=new Uint16Array(buf.slice(p.off,p.off+p.nv*6)),o=p.off+p.nv*6,ib=p.big?4:2,idx=p.big?new Uint32Array(buf.slice(o,o+p.nt*3*4)):new Uint16Array(buf.slice(o,o+p.nt*3*2));o+=p.nt*3*ib;
  var nb=new Int8Array(buf.slice(o,o+p.nv*3));o+=p.nv*3;var ao=new Uint8Array(buf.slice(o,o+p.nv)),cut=new Uint8Array(buf.slice(o+p.nv,o+2*p.nv));
  var P=new Float32Array(p.nv*3),Cc=new Float32Array(p.nv*3),Nn=new Float32Array(p.nv*3);
  for(var i=0;i<p.nv;i++){for(var j=0;j<3;j++){P[i*3+j]=lo[j]+q[i*3+j]/65535*(hi[j]-lo[j]);Nn[i*3+j]=nb[i*3+j]/127}
   var a=p.metal?1:(.35+.65*Math.pow(ao[i]/255,1.3)),c=cut[i]/255;
   if(p.metal){Cc[i*3]=.72;Cc[i*3+1]=.77;Cc[i*3+2]=.84}else{Cc[i*3]=(.93*(1-c)+.62*c)*a;Cc[i*3+1]=(.88*(1-c)+.25*c)*a;Cc[i*3+2]=(.76*(1-c)+.2*c)*a}}
  var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(Cc,3));g.setAttribute('normal',new THREE.BufferAttribute(Nn,3));g.setIndex(new THREE.BufferAttribute(idx,1));
  var m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:p.metal?.3:.75,metalness:p.metal?.9:0}));
  var e=EX[p.name];if(ex&&e)m.position.set(e[0]*ex,e[1]*ex,e[2]*ex);sc.add(m)})});
var MT=new THREE.MeshStandardMaterial({color:0xb8c4d2,metalness:.9,roughness:.35});
function seg(a,b,r){var A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]),d=B.clone().sub(A),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),10),MT);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());sc.add(m)}
function tub(pts,r){var c=new THREE.CatmullRomCurve3(pts.map(function(p){return new THREE.Vector3(p[0],p[1],p[2])}));sc.add(new THREE.Mesh(new THREE.TubeGeometry(c,pts.length*4,r,6),MT))}
if(DATA.implants&&!Q.get('noimp')){var I=DATA.implants.meta;I.screwsLat.concat(I.screwsMed).forEach(function(s){seg(s.a,s.b,s.r)});seg(I.tcs.a,I.tcs.b,I.tcs.r);tub(I.hpin,.0011);I.upins.forEach(function(p){tub(p,.0011)});I.wires.forEach(function(p){tub(p,.0007)});seg(I.hole.a,I.hole.b,I.hole.r)}
var T=new THREE.Vector3(tx,ty,tz),d=.42*zoom,VW={lat:[-1,.12,.25],med:[1,.12,.25],cra:[-.2,.1,1],cau:[.25,.15,-1],top:[-.2,1,-.3],q:[-.8,.3,-.6],q2:[.7,.25,.75]}[view];
var o=new THREE.Vector3(VW[0],VW[1],VW[2]).normalize().multiplyScalar(d);cam.position.copy(T).add(o);cam.lookAt(T);sun.position.copy(cam.position).add(new THREE.Vector3(.2,.5,.1));
ren.render(sc,cam);window.__done=1;
</script>""".replace("@@DATA@@", json.dumps(data))
open(os.path.join(out, "preview.html"), "w").write(html)
print("preview ok", len(html))
