(()=>{"use strict";

function setupLanguage(){
  const btn=document.querySelector("[data-lang]");
  if(!btn)return;
  const NAV={"/":"Home","/world/":"World","/characters/":"Characters","/texts/":"Texts","/music/":"Music","/film/":"Film","/gallery/":"Gallery","/extras/":"Extras","/author/":"About"};
  const MAIN=["The Embrace","Violence and Peace","Into the Night","The Vampire's Mask","Underground","Undercurrents","Nightmares","Tempering","A Father's Love","The Great Artist","Curiosity Killed the Cat","Profane Communion","The Impostor","The Troublesome Succubus","What Makes a Home","Scars","The Purpose of a Whore","The Vampire Society","The City Streets","The Scales of Justice","The Trial","A Turn at the Theater"];
  const PREQUEL=["The Ruby Dagger","A Winter Night's Pact","Night of Impalement","Legacy of the Dead","Lydia","The Music Teacher","The Lady's Elopement"];
  const EXTRAS={"/texts/diary/":"Duke Amai's Diary","/texts/first-battle/":"The First Battle","/texts/bride/":"The Bride in the Well","/texts/monk/":"The Bald Nun of the Monastery","/texts/phantom/":"The Phantom of the Opera","/texts/star/":"The Star"};
  const ZH={
    "Home":"首页","World":"世界","Characters":"角色","Texts":"文本","Music":"音乐","Film":"影片","Gallery":"画廊","Extras":"附录","About":"作者"
  };
  const original=new WeakMap();
  const startingTitle=document.title;
  const pathname=location.pathname.replace(/index\.html$/,"").replace(/\/?$/,"/");
  let lang="zh";
  try{lang=localStorage.getItem("rp_ui_lang")==="en"?"en":"zh"}catch(e){}
  const text=(el,english)=>{
    if(!el)return;
    if(!original.has(el))original.set(el,el.textContent);
    const value=lang==="en"?english:original.get(el);
    if(el.textContent!==value)el.textContent=value;
  };
  const chapterTitle=(href)=>{
    const main=href.match(/^\/texts\/chapter-(\d+)\/$/);
    if(main)return MAIN[Number(main[1])-1]||null;
    const prequel=href.match(/^\/texts\/prequel-(\d+)\/$/);
    if(prequel)return PREQUEL[Number(prequel[1])-1]||null;
    return EXTRAS[href]||null;
  };
  const render=()=>{
    btn.textContent=lang==="zh"?"EN":"中";
    btn.setAttribute("aria-pressed",String(lang==="en"));
    btn.setAttribute("aria-label",lang==="zh"?"当前为中文，点击切换英文":"Currently English. Switch to Chinese");
    btn.title=lang==="zh"?"Switch to English":"切换为中文";
    document.documentElement.lang=lang==="zh"?"zh-CN":"en";
    document.querySelectorAll(".topbar .nav a, .topbar .mobile-nav a").forEach(a=>text(a,NAV[a.getAttribute("href")]||a.textContent));
    if(pathname==="/texts/"){
      text(document.querySelector(".primary-hero h1"),"Texts");
      text(document.querySelector(".primary-hero p"),"The main story, prequel, extra stories, and personal records.");
      document.querySelectorAll(".content .section-title h2").forEach((el,i)=>text(el,["Main Story","Extra Stories","Prequel: The Fiend Amai Mask"][i]||el.textContent));
      document.querySelectorAll(".chapter-chip, .extra-entry").forEach(a=>{
        const title=chapterTitle(a.getAttribute("href")||"");
        if(title)text(a.querySelector("strong"),title);
      });
      const diary=document.querySelector(".diary-entry");
      if(diary){
        text(diary.querySelector("h3"),"Duke Amai's Diary");
        text(diary.querySelector("p"),"Personal notes · Read as an interactive diary");
        text(diary.querySelector(".diary-entry-mark"),"OPEN DIARY →");
      }
      document.title=lang==="en"?"Texts — RUBY PARANOIA / One Punch Man":startingTitle;
    }
    const match=pathname.match(/^\/texts\/(chapter|prequel)-(\d+)\/$/);
    if(match){
      const n=Number(match[2]);
      const heading=match[1]==="chapter"?MAIN[n-1]:PREQUEL[n-1];
      if(heading)text(document.querySelector(".chapter-head h1"),heading);
      text(document.querySelector(".chapter-back"),"← Back to Texts");
      document.querySelectorAll(".chapter-prev-next a").forEach(a=>{
        const title=chapterTitle(a.getAttribute("href")||"");
        if(title){
          const prev=a.textContent.trim().startsWith("←");
          const num=(a.getAttribute("href")||"").match(/(\d+)\/$/)?.[1]||"";
          text(a,(prev?"← ":"")+(num?Number(num)+". ":"")+title+(prev?"":" →"));
        }
      });
      document.querySelectorAll(".chapter-prev-next .chapter-nav-disabled").forEach((el,i)=>{
        text(el,(original.get(el)||el.textContent).trim().startsWith("←")?"← Previous Chapter":"Next Chapter →");
      });
      document.querySelectorAll(".chapter-toc").forEach(toc=>{
        text(toc.querySelector(".chapter-toc-toggle span"),"TOC");
        text(toc.querySelector(".chapter-toc-head strong"),"Chapter List");
        text(toc.querySelector(".chapter-toc-all"),"Back to Texts");
        toc.querySelectorAll(".chapter-toc-list a").forEach(a=>{
          const title=chapterTitle(a.getAttribute("href")||"");
          if(title)text(a.querySelector("b"),title);
        });
      });
      document.title=lang==="en"?(match[1]==="chapter"?"Chapter ":"Prequel Chapter ")+n+" · "+heading+" — RUBY PARANOIA":startingTitle;
    }
  };
  btn.addEventListener("click",()=>{
    lang=lang==="zh"?"en":"zh";
    try{localStorage.setItem("rp_ui_lang",lang)}catch(e){}
    render();
  });
  render();
  // Chapter TOC is mounted by a separate deferred script, after site controls.
  if(pathname.startsWith("/texts/")&&pathname!=="/texts/"){
    const observer=new MutationObserver(records=>{
      if(records.some(r=>Array.from(r.addedNodes).some(n=>n.nodeType===1&&(n.matches?.(".chapter-toc")||n.querySelector?.(".chapter-toc")))))render();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
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

function setupRelationshipLinks(){
  const routes={
    "甜美公爵":"/characters/amai-mask/",
    "Amai Mask":"/characters/amai-mask/",
    "66号":"/characters/zombieman/",
    "66号 / 僵尸男":"/characters/zombieman/",
    "僵尸男":"/characters/zombieman/",
    "维比佳莎":"/characters/webigaza/",
    "玛考伊":"/characters/mccoy/",
    "童帝":"/characters/child-emperor/",
    "性感囚犯":"/characters/puri-puri-prisoner/",
    "西奇":"/characters/sitch/",
    "龙卷":"/characters/tatsumaki/",
    "吹雪":"/characters/fubuki/",
    "埼玉":"/characters/saitama/",
    "杰诺斯":"/characters/genos/",
    "KING":"/characters/king/",
    "布鲁":"/characters/blue/",
    "居合铁":"/characters/iaian/",
    "巴德":"/characters/bad/",
    "波弗伊":"/characters/bofoi/",
    "基诺斯":"/characters/genus/",
    "12号":"/characters/servant-12/",
    "26号":"/characters/servant-26/",
    "39号":"/characters/servant-39/",
    "赛克斯":"/characters/psykos/",
    "弩S":"/characters/do-s/",
    "流浪帝":"/characters/homeless-emperor/",
    "丑陋大总统":"/characters/fuhrer-ugly/"
  };
  document.querySelectorAll(".dossier-network span").forEach(tag=>{
    const name=(tag.textContent||"").trim();
    const href=routes[name];
    if(!href)return;
    const a=document.createElement("a");
    a.href=href;
    a.className="dossier-network-link";
    a.textContent=name;
    tag.replaceWith(a);
  });
}

function setupInternalLinks(){
  document.querySelectorAll("a[href]").forEach(a=>{
    const href=a.getAttribute("href")||"";
    if(!href||href.startsWith("#")||href.startsWith("javascript:"))return;
    let url;
    try{url=new URL(href,location.href)}catch(e){return}
    if(url.origin===location.origin){
      a.removeAttribute("target");
      a.removeAttribute("rel");
      a.target="_self";
    }
  });
}

function init(){setupLanguage();setupShare();setupMenu();setupRelationshipLinks();setupInternalLinks()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();