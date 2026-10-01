(()=>{"use strict";
async function initAudio(audio){
  const src=audio.getAttribute("src");
  if(!src)return;
  audio.preload="auto";
  try{
    const response=await fetch(src);
    if(!response.ok)return;
    const blob=await response.blob();
    const objectUrl=URL.createObjectURL(blob);
    const t=audio.currentTime||0;
    audio.src=objectUrl;
    audio.load();
    audio.addEventListener("loadedmetadata",()=>{
      if(t>0&&Number.isFinite(audio.duration)){
        try{audio.currentTime=Math.min(t,audio.duration-.1)}catch(e){}
      }
    },{once:true});
    window.addEventListener("pagehide",()=>URL.revokeObjectURL(objectUrl),{once:true});
  }catch(e){}
}
function start(){
  document.querySelectorAll(".song-audio").forEach(initAudio);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();