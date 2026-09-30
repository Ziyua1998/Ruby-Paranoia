(()=>{"use strict";
function init(){
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
  btn.addEventListener("click",()=>{
    lang=lang==="zh"?"en":"zh";
    try{localStorage.setItem("rp_ui_lang",lang)}catch(e){}
    render();
  });
  render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();