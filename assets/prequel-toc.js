(()=>{
"use strict";
const chapters=["红宝石小刀","冬夜契约","穿刺之夜","亡者的遗产","莉迪亚","音乐教师","夫人的私奔"];
const current=Number(document.body.dataset.prequelChapter||0);
if(!Number.isInteger(current)||current<1||current>chapters.length)return;
const wrap=document.createElement("div");
wrap.className="chapter-toc";
wrap.innerHTML=`
<button class="chapter-toc-toggle" type="button" aria-expanded="false" aria-label="打开前传章节目录" aria-controls="prequel-chapter-toc"><span>目录</span></button>
<div class="chapter-toc-scrim"></div>
<aside class="chapter-toc-drawer" id="prequel-chapter-toc" aria-label="前传章节目录" aria-hidden="true">
 <div class="chapter-toc-head"><div><small>THE FIEND AMAI MASK · PREQUEL</small><strong>章节目录</strong></div><button class="chapter-toc-close" type="button" aria-label="关闭目录">×</button></div>
 <nav class="chapter-toc-list">
 ${chapters.map((t,i)=>`<a href="/texts/prequel-${String(i+1).padStart(2,"0")}/" class="${i+1===current?"active":""}"${i+1===current?' aria-current="page"':''}><span>${String(i+1).padStart(2,"0")}</span><b>${t}</b></a>`).join("")}
 </nav>
 <a class="chapter-toc-all" href="/texts/">返回文本档案</a>
</aside>`;
document.body.appendChild(wrap);
const toggle=wrap.querySelector(".chapter-toc-toggle");
const drawer=wrap.querySelector(".chapter-toc-drawer");
const scrim=wrap.querySelector(".chapter-toc-scrim");
const close=wrap.querySelector(".chapter-toc-close");
let previouslyFocused=null;
function setOpen(open){
 wrap.classList.toggle("is-open",open);
 document.body.classList.toggle("chapter-toc-open",open);
 toggle.setAttribute("aria-expanded",String(open));
 drawer.setAttribute("aria-hidden",String(!open));
 if(open){previouslyFocused=document.activeElement;close.focus();const active=drawer.querySelector(".active");if(active)requestAnimationFrame(()=>active.scrollIntoView({block:"center"}));}
 else if(previouslyFocused && typeof previouslyFocused.focus==="function")previouslyFocused.focus();
}
toggle.addEventListener("click",()=>setOpen(!wrap.classList.contains("is-open")));
close.addEventListener("click",()=>setOpen(false));
scrim.addEventListener("click",()=>setOpen(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&wrap.classList.contains("is-open"))setOpen(false)});
})();