(()=>{
const root=document.querySelector('[data-relationship-network]');
if(!root||root.dataset.ready)return;root.dataset.ready='1';
const svg=root.querySelector('svg'), detail=root.querySelector('[data-relation-detail]'), filters=[...root.querySelectorAll('[data-relation-filter]')];
const nodes=[
{id:'amai',name:'甜美公爵',en:'Amai Mask',group:'core',href:'/characters/amai-mask/'},
{id:'zbm',name:'僵尸男',en:'Zombieman / No.66',group:'core',href:'/characters/zombieman/'},
{id:'webigaza',name:'维比佳莎',en:'Webigaza',group:'vampire',href:'/characters/webigaza/'},
{id:'mccoy',name:'玛考伊',en:'McCoy',group:'vampire',href:'/characters/mccoy/'},
{id:'psykos',name:'赛克斯',en:'Psykos',group:'night',href:'/characters/psykos/'},
{id:'dos',name:'弩S',en:'Do-S',group:'night',href:'/characters/do-s/'},
{id:'ugly',name:'丑陋大总统',en:'Fuhrer Ugly',group:'night',href:'/characters/fuhrer-ugly/'},
{id:'homeless',name:'流浪帝',en:'Homeless Emperor',group:'night',href:'/characters/homeless-emperor/'},
{id:'tatsumaki',name:'龙卷',en:'Tatsumaki',group:'human',href:'/characters/tatsumaki/'},
{id:'fubuki',name:'吹雪',en:'Fubuki',group:'human',href:'/characters/fubuki/'},
{id:'child',name:'童帝',en:'Child Emperor',group:'human',href:'/characters/child-emperor/'},
{id:'bofoi',name:'波弗伊',en:'Bofoi',group:'human',href:'/characters/bofoi/'},
{id:'saitama',name:'埼玉',en:'Saitama',group:'human',href:'/characters/saitama/'},
{id:'genos',name:'杰诺斯',en:'Genos',group:'human',href:'/characters/genos/'},
{id:'blue',name:'布鲁',en:'Blue',group:'human',href:'/characters/blue/'},
{id:'iaian',name:'居合铁',en:'Iaian',group:'human',href:'/characters/iaian/'},
{id:'king',name:'KING',en:'KING',group:'human',href:'/characters/king/'},
{id:'bad',name:'巴德',en:'Bad',group:'human',href:'/characters/bad/'},
{id:'prisoner',name:'性感囚犯',en:'Puri-Puri Prisoner',group:'human',href:'/characters/puri-puri-prisoner/'},
{id:'sitch',name:'西奇',en:'Sitch',group:'human',href:'/characters/sitch/'},
{id:'genus',name:'基诺斯',en:'Dr. Genus',group:'human',href:'/characters/genus/'},
{id:'s12',name:'12号',en:'Servant No.12',group:'human',href:'/characters/servant-12/'},
{id:'s26',name:'26号',en:'Servant No.26',group:'human',href:'/characters/servant-26/'},
{id:'s39',name:'39号',en:'Servant No.39',group:'human',href:'/characters/servant-39/'}
];
const edges=[
['amai','zbm','长亲—后裔 / 情感关系','emotion'],
['amai','webigaza','剧场搭档 / 血族同僚','alliance'],
['zbm','webigaza','朋友 / 血族社会引路人','alliance'],
['amai','mccoy','血族协会权力冲突','conflict'],
['mccoy','psykos','共同对付甜美公爵','conflict'],
['amai','psykos','恶魔力量关联 / 敌对','conflict'],
['amai','dos','操控未遂 / 敌对','conflict'],
['amai','ugly','袭击与对抗','conflict'],
['psykos','dos','上司—部下 / 单恋','emotion'],
['psykos','ugly','暗夜协会上下级','faction'],
['psykos','homeless','暗夜协会上下级','faction'],
['dos','ugly','暗夜协会同僚','faction'],
['dos','homeless','暗夜协会同僚','faction'],
['amai','tatsumaki','旧识 / 曾介入援助','alliance'],
['tatsumaki','fubuki','姐妹','emotion'],
['amai','fubuki','委托 / 魔法诊察','alliance'],
['zbm','child','猎人同伴 / 装备支援','alliance'],
['child','bofoi','师徒','mentor'],
['saitama','genos','师徒','mentor'],
['blue','iaian','领主—骑士','faction'],
['blue','king','领主—骑士','faction'],
['bad','child','同行 / 协作','alliance'],
['bad','prisoner','同行 / 协作','alliance'],
['zbm','sitch','酒馆熟人 / 情报联络','alliance'],
['zbm','genus','个人帮助 / 研究咨询','alliance'],
['amai','s12','领主—血仆','faction'],
['amai','s26','领主—血仆','faction'],
['amai','s39','领主—血仆','faction'],
['zbm','s26','城堡同伴 / 相互帮助','alliance'],
['zbm','s39','盟友 / 庇护','alliance'],
['zbm','s12','旧识 / 后期和解','alliance']
].map((e,i)=>({id:'e'+i,source:e[0],target:e[1],label:e[2],type:e[3]}));
const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
const W=1000,H=620;
const cluster={core:[500,310],vampire:[360,165],night:[780,250],human:[300,420]};
nodes.forEach((n,i)=>{const c=cluster[n.group];const a=(i*2.399)+(n.group==='human'?1.2:0);const r=n.group==='human'?190:(n.group==='night'?150:110);n.x=c[0]+Math.cos(a)*r;n.y=c[1]+Math.sin(a)*r;n.vx=0;n.vy=0;});
const NS='http://www.w3.org/2000/svg';
const edgeLayer=document.createElementNS(NS,'g'),labelLayer=document.createElementNS(NS,'g'),nodeLayer=document.createElementNS(NS,'g');
svg.append(edgeLayer,labelLayer,nodeLayer);
edges.forEach(e=>{const line=document.createElementNS(NS,'line');line.classList.add('relationship-edge');line.dataset.edge=e.id;edgeLayer.append(line);e.el=line;
const t=document.createElementNS(NS,'text');t.classList.add('relationship-edge-label');t.dataset.edgeLabel=e.id;t.textContent=e.label;labelLayer.append(t);e.labelEl=t;});
nodes.forEach(n=>{const g=document.createElementNS(NS,'g');g.classList.add('relationship-node');g.dataset.node=n.id;g.dataset.group=n.group;g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',n.name+'，查看关系');
const c=document.createElementNS(NS,'circle');c.setAttribute('r',n.group==='core'?'30':'24');g.append(c);
const t=document.createElementNS(NS,'text');t.textContent=n.name;t.setAttribute('font-size',n.name.length>5?'9':'11');g.append(t);nodeLayer.append(g);n.el=g;});
let filter='all',active=null,drag=null,moved=false,raf=0,frames=0;
function visibleEdge(e){return filter==='all'||e.type===filter}
function render(){edges.forEach(e=>{const a=byId[e.source],b=byId[e.target];e.el.setAttribute('x1',a.x);e.el.setAttribute('y1',a.y);e.el.setAttribute('x2',b.x);e.el.setAttribute('y2',b.y);e.labelEl.setAttribute('x',(a.x+b.x)/2);e.labelEl.setAttribute('y',(a.y+b.y)/2-4);
const vis=visibleEdge(e);e.el.style.display=vis?'':'none';e.labelEl.style.display=vis?'':'none';});
nodes.forEach(n=>n.el.setAttribute('transform',`translate(${n.x},${n.y})`));
applyFocus();}
function applyFocus(){const linked=active?new Set([active,...edges.filter(e=>visibleEdge(e)&&(e.source===active||e.target===active)).flatMap(e=>[e.source,e.target])]):null;
edges.forEach(e=>{const hit=active&&(e.source===active||e.target===active)&&visibleEdge(e);e.el.classList.toggle('is-active',!!hit);e.el.classList.toggle('is-dimmed',!!active&&!hit);e.labelEl.style.opacity=active?(hit?'1':'.08'):(visibleEdge(e)?'.72':'0');});
nodes.forEach(n=>{const keep=!active||linked.has(n.id);n.el.classList.toggle('is-active',n.id===active);n.el.classList.toggle('is-dimmed',!keep);});}
function step(){for(const n of nodes){if(drag===n)continue;const c=cluster[n.group];n.vx+=(c[0]-n.x)*.0009;n.vy+=(c[1]-n.y)*.0009;}
for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d2=Math.max(900,dx*dx+dy*dy),d=Math.sqrt(d2),f=1100/d2,fx=dx/d*f,fy=dy/d*f;a.vx-=fx;a.vy-=fy;b.vx+=fx;b.vy+=fy;}
edges.forEach(e=>{const a=byId[e.source],b=byId[e.target],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),target=e.type==='conflict'?155:130,f=(d-target)*.00055,fx=dx/d*f,fy=dy/d*f;if(drag!==a){a.vx+=fx;a.vy+=fy}if(drag!==b){b.vx-=fx;b.vy-=fy}});
nodes.forEach(n=>{if(drag===n)return;n.vx*=.91;n.vy*=.91;n.x=Math.max(42,Math.min(W-42,n.x+n.vx));n.y=Math.max(42,Math.min(H-42,n.y+n.vy));});render();if(frames++<190)raf=requestAnimationFrame(step);}
function showNode(id){active=active===id?null:id;const n=active?byId[active]:null;if(!n){detail.innerHTML='<small>RELATIONSHIP MAP</small><h3>人物关系</h3><p>点击任意角色节点，查看与其直接相连的人物与关系；拖动节点可以重新整理布局。</p><div class="relationship-list"></div>';render();return;}
const rel=edges.filter(e=>visibleEdge(e)&&(e.source===id||e.target===id));detail.innerHTML=`<small>${n.en}</small><h3>${n.name}</h3><p>当前筛选下共 ${rel.length} 条直接关系。</p><div class="relationship-list">${rel.map(e=>{const other=byId[e.source===id?e.target:e.source];return `<button type="button" data-jump="${other.id}">${other.name}<span>${e.label}</span></button>`}).join('')}</div>`;
detail.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>showNode(b.dataset.jump)));render();}
function point(ev){const r=svg.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*W,y:(ev.clientY-r.top)/r.height*H}}
nodes.forEach(n=>{n.el.addEventListener('click',()=>{if(!moved)showNode(n.id);moved=false});n.el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showNode(n.id)}});
n.el.addEventListener('pointerdown',e=>{drag=n;moved=false;n.el.setPointerCapture(e.pointerId);const p=point(e);n.ox=p.x-n.x;n.oy=p.y-n.y});
n.el.addEventListener('pointermove',e=>{if(drag!==n)return;const p=point(e);if(Math.abs(p.x-n.x)>2||Math.abs(p.y-n.y)>2)moved=true;n.x=Math.max(35,Math.min(W-35,p.x-n.ox));n.y=Math.max(35,Math.min(H-35,p.y-n.oy));render()});
n.el.addEventListener('pointerup',e=>{if(drag===n){drag=null;try{n.el.releasePointerCapture(e.pointerId)}catch(_){}}});});
filters.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.relationFilter;active=null;filters.forEach(x=>x.classList.toggle('is-active',x===b));showNode(null);render()}));
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){frames=190;render();}else{step();}
})();