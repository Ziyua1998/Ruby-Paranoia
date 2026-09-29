(()=>{"use strict";
const tracks=[
{id:"moonlit_castle",title:"月夜の古城",artist:"Instrumental",chunks:8},
{id:"fanatic_nocturne",title:"狂信者のノクターン（狂信徒的夜曲）",artist:"AMAI MASK",chunks:9},
{id:"dark_hymn",title:"闇の讃美歌（暗夜赞歌）",artist:"AMAI MASK & ZOMBIEMAN & OTHERS",chunks:7}
];
const KEY="rp_music_state_v1",cache=new Map();
const fmt=s=>{if(!Number.isFinite(s))return"0:00";s=Math.max(0,Math.floor(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
async function buildTrack(t){
 if(cache.has(t.id))return cache.get(t.id);
 const parts=[];
 for(let i=1;i<=t.chunks;i++){
  const n=String(i).padStart(2,"0");
  const r=await fetch("/assets/music/"+t.id+"-"+n+".txt",{cache:"force-cache"});
  if(!r.ok)throw new Error("missing music asset");
  parts.push(await r.text());
 }
 const b64=parts.join("").replace(/\s/g,"");
 const bin=atob(b64),bytes=new Uint8Array(bin.length);
 for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
 const url=URL.createObjectURL(new Blob([bytes],{type:"audio/mpeg"}));
 cache.set(t.id,url);return url;
}
function mount(){
 if(document.querySelector(".rp-music"))return;
 const root=document.createElement("div");root.className="rp-music is-collapsed";
 root.innerHTML='<div class="rp-music-shell"><div class="rp-music-lid" title="展开/收起播放器"><span class="rp-music-brand">Nocturne Cabinet</span><i class="rp-music-gem"></i></div><div class="rp-music-panel"><div class="rp-music-score"><small class="rp-music-kicker">Musica Nocturna</small><strong class="rp-music-title"></strong><span class="rp-music-artist"></span></div><div class="rp-music-keys"><button class="rp-music-key prev" aria-label="上一首">‹</button><button class="rp-music-key main play" aria-label="播放">▶</button><button class="rp-music-key next" aria-label="下一首">›</button></div><div class="rp-music-tools"><input class="rp-music-progress" type="range" min="0" max="1000" value="0" aria-label="播放进度"><span class="rp-music-time">0:00 / 0:00</span></div><div class="rp-music-volume-row"><button class="rp-music-small mute" aria-label="静音">♩</button><input class="rp-music-volume" type="range" min="0" max="1" step=".02" aria-label="音量"><button class="rp-music-small loop" aria-label="循环播放">↻</button></div><div class="rp-music-status">点击琴键开始播放</div></div></div>';
 document.body.appendChild(root);
 const audio=new Audio();audio.preload="metadata";
 const lid=root.querySelector(".rp-music-lid"),title=root.querySelector(".rp-music-title"),artist=root.querySelector(".rp-music-artist"),play=root.querySelector(".play"),prev=root.querySelector(".prev"),next=root.querySelector(".next"),progress=root.querySelector(".rp-music-progress"),time=root.querySelector(".rp-music-time"),volume=root.querySelector(".rp-music-volume"),mute=root.querySelector(".mute"),loop=root.querySelector(".loop"),status=root.querySelector(".rp-music-status");
 let state={track:0,time:0,volume:.62,muted:false,loop:false,collapsed:true,playing:false};
 try{state={...state,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){}
 state.track=Math.max(0,Math.min(tracks.length-1,state.track|0));audio.volume=Math.max(0,Math.min(1,+state.volume||.62));audio.muted=!!state.muted;audio.loop=!!state.loop;volume.value=audio.volume;root.classList.toggle("is-collapsed",state.collapsed!==false);loop.style.color=audio.loop?"#efd477":"";
 const save=()=>{state.volume=audio.volume;state.muted=audio.muted;state.loop=audio.loop;state.collapsed=root.classList.contains("is-collapsed");state.playing=!audio.paused;state.time=audio.currentTime||0;localStorage.setItem(KEY,JSON.stringify(state))};
 async function load(index,autoplay=false,resume=0){
  state.track=(index+tracks.length)%tracks.length;
  const t=tracks[state.track];title.textContent=t.title;artist.textContent=t.artist;root.classList.add("loading");status.textContent="正在整理琴谱…";
  try{audio.src=await buildTrack(t);audio.load();audio.addEventListener("loadedmetadata",()=>{if(resume>0&&resume<audio.duration-2)audio.currentTime=resume},{once:true});if(autoplay)await audio.play();status.textContent=""}
  catch(e){console.error(e);status.textContent="乐曲资源尚未就绪";play.textContent="▶"}
  finally{root.classList.remove("loading");save()}
 }
 lid.onclick=()=>{root.classList.toggle("is-collapsed");save()};
 play.onclick=async()=>{if(!audio.src)await load(state.track,false,state.time||0);if(audio.paused){try{await audio.play()}catch(e){status.textContent="请再次点击琴键播放"}}else audio.pause()};
 prev.onclick=()=>load(state.track-1,true,0);next.onclick=()=>load(state.track+1,true,0);
 progress.oninput=()=>{if(audio.duration)audio.currentTime=(+progress.value/1000)*audio.duration};
 volume.oninput=()=>{audio.volume=+volume.value;audio.muted=false;save()};
 mute.onclick=()=>{audio.muted=!audio.muted;mute.textContent=audio.muted?"×":"♩";save()};
 loop.onclick=()=>{audio.loop=!audio.loop;loop.style.color=audio.loop?"#efd477":"";save()};
 audio.ontimeupdate=()=>{if(audio.duration){progress.value=String(Math.round(audio.currentTime/audio.duration*1000));time.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration)}};
 audio.onplay=()=>{play.textContent="Ⅱ";state.playing=true;save()};audio.onpause=()=>{play.textContent="▶";state.playing=false;save()};audio.onended=()=>{if(!audio.loop)load(state.track+1,true,0)};
 title.textContent=tracks[state.track].title;artist.textContent=tracks[state.track].artist;mute.textContent=audio.muted?"×":"♩";
 window.addEventListener("beforeunload",save);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();