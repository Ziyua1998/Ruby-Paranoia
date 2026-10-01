(()=>{"use strict";

function setupLanguage(){
  const btn=document.querySelector("[data-lang]");
  if(!btn)return;
  let lang="zh";
  try{lang=localStorage.getItem("rp_ui_lang")||"zh"}catch(e){}
  const render=()=>{
    btn.textContent=lang==="zh"?"中":"EN";
    btn.setAttribute("aria-pressed",String(lang==="en"));
    btn.setAttribute("aria-label",lang==="zh"?"语言：中文（点击切换英文）":"Language: English placeholder (click for Chinese)");
    btn.title=lang==="zh"?"中文 / English":"English version coming soon";
    document.documentElement.lang=lang==="zh"?"zh-CN":"en";
  };
  btn.onclick=()=>{lang=lang==="zh"?"en":"zh";try{localStorage.setItem("rp_ui_lang",lang)}catch(e){}render()};
  render();
}

function setupShare(){
  const btn=document.querySelector("[data-share]");
  if(!btn)return;
  btn.innerHTML='<svg class="share-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18c1.8-5.8 5.6-8.7 11.2-8.7H19"/><path d="M15 5l4 4-4 4"/></svg>';
  btn.title="分享";
  btn.setAttribute("aria-label","分享");

  const menu=document.createElement("div");
  menu.className="rp-share-menu";
  menu.hidden=true;
  menu.innerHTML='<a class="share-x" target="_blank" rel="noopener noreferrer">𝕏 <span>分享到 X</span></a><button type="button" class="share-system">↗ <span>系统分享</span></button><button type="button" class="share-copy">⧉ <span>复制链接</span><small class="share-copy-state"></small></button>';
  document.body.appendChild(menu);
  const x=menu.querySelector(".share-x");
  const sys=menu.querySelector(".share-system");
  const copy=menu.querySelector(".share-copy");
  const state=menu.querySelector(".share-copy-state");

  const position=()=>{
    const r=btn.getBoundingClientRect();
    const w=190;
    menu.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+"px";
    menu.style.top=(r.bottom+8)+"px";
  };
  const close=()=>{menu.hidden=true;btn.setAttribute("aria-expanded","false")};
  const open=()=>{
    const url=encodeURIComponent(location.href);
    const text=encodeURIComponent(document.title+" — RUBY PARANOIA");
    x.href="https://twitter.com/intent/tweet?text="+text+"&url="+url;
    position();menu.hidden=false;btn.setAttribute("aria-expanded","true");
  };

  btn.onclick=(e)=>{e.preventDefault();e.stopPropagation();menu.hidden?open():close()};
  x.onclick=()=>close();

  sys.onclick=async()=>{
    if(navigator.share){
      try{await navigator.share({title:document.title,text:"RUBY PARANOIA / One Punch Man",url:location.href});close();return}catch(e){if(e&&e.name==="AbortError")return}
    }
    state.textContent="不可用";
    setTimeout(()=>state.textContent="",1400);
  };

  copy.onclick=async()=>{
    let ok=false;
    try{
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(location.href);ok=true}
      else{
        const ta=document.createElement("textarea");ta.value=location.href;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();ok=document.execCommand("copy");ta.remove();
      }
    }catch(e){}
    state.textContent=ok?"已复制":"复制失败";
    if(!ok)window.prompt("复制此链接",location.href);
    setTimeout(()=>state.textContent="",1400);
  };

  document.addEventListener("click",e=>{if(!menu.hidden&&!menu.contains(e.target)&&e.target!==btn)close()});
  addEventListener("resize",()=>{if(!menu.hidden)position()});
  addEventListener("scroll",()=>{if(!menu.hidden)position()},{passive:true});
}

function setupMenu(){
  const btn=document.querySelector("[data-menu]");
  const nav=document.querySelector(".mobile-nav");
  if(!btn||!nav)return;

  const render=()=>{
    const open=!nav.hidden;
    btn.textContent=open?"×":"☰";
    btn.setAttribute("aria-expanded",String(open));
    btn.setAttribute("aria-label",open?"关闭菜单":"打开菜单");
    btn.title=open?"关闭菜单":"打开菜单";
  };

  const close=()=>{
    nav.hidden=true;
    render();
  };

  btn.onclick=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    nav.hidden=!nav.hidden;
    render();
  };

  nav.addEventListener("click",e=>{
    if(e.target.closest("a"))close();
  });

  document.addEventListener("click",e=>{
    if(!nav.hidden&&!nav.contains(e.target)&&!btn.contains(e.target))close();
  });

  addEventListener("resize",()=>{
    if(innerWidth>940&& !nav.hidden)close();
  });

  render();
}

function init(){setupLanguage();setupShare();setupMenu()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();