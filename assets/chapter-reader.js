(()=>{
const chapters=["初拥","暴力与和平","步入黑夜","血族的假面","地下","暗流涌动","梦魇","锤炼","舐犊情深","大艺术家","好奇害死猫","亵渎的交融","冒牌货","麻烦的魅魔","何以为家","伤痕","荡妇的作用","血族协会","闹市","正义的天秤","庭审","剧场之变"];
const current=Number(document.body.dataset.chapter||0);
if(!current)return;
const wrap=document.createElement("div");
wrap.className="chapter-toc";
wrap.innerHTML=`
<button class="chapter-toc-toggle" type="button" aria-expanded="false" aria-label="打开章节目录"><span>目录</span></button>
<div class="chapter-toc-scrim"></div>
<aside class="chapter-toc-drawer" aria-label="章节目录">
  <div class="chapter-toc-head"><div><small>MAIN STORY</small><strong>章节目录</strong></div><button class="chapter-toc-close" type="button" aria-label="关闭目录">×</button></div>
  <nav class="chapter-toc-list">
  ${chapters.map((t,i)=>`<a href="/texts/chapter-${String(i+1).padStart(2,"0")}/" class="${i+1===current?"active":""}"><span>${String(i+1).padStart(2,"0")}</span><b>${t}</b></a>`).join("")}
  </nav>
  <a class="chapter-toc-all" href="/texts/">返回文本档案</a>
</aside>`;
document.body.appendChild(wrap);
const toggle=wrap.querySelector(".chapter-toc-toggle"),drawer=wrap.querySelector(".chapter-toc-drawer"),scrim=wrap.querySelector(".chapter-toc-scrim"),close=wrap.querySelector(".chapter-toc-close");
const setOpen=open=>{wrap.classList.toggle("is-open",open);document.body.classList.toggle("chapter-toc-open",open);toggle.setAttribute("aria-expanded",String(open));if(open){const active=drawer.querySelector(".active");active&&setTimeout(()=>active.scrollIntoView({block:"center"}),180)}};
toggle.addEventListener("click",()=>setOpen(!wrap.classList.contains("is-open")));
close.addEventListener("click",()=>setOpen(false));
scrim.addEventListener("click",()=>setOpen(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape")setOpen(false)});
})();