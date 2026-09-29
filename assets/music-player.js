(()=>{"use strict";

const tracks=[
  {id:"moonlit_castle",title:"月夜の古城",artist:"Instrumental",src:"/assets/music/moonlit-castle.mp3"},
  {id:"fanatic_nocturne",title:"狂信者のノクターン（狂信徒的夜曲）",artist:"AMAI MASK",src:"/assets/music/fanatic-nocturne.mp3"},
  {id:"dark_hymn",title:"闇の讃美歌（暗夜赞歌）",artist:"AMAI MASK & ZOMBIEMAN & OTHERS",src:"/assets/music/dark-hymn.mp3"}
];

const KEY="rp_music_state_v3";
const LEGACY_KEYS=["rp_music_state_v2","rp_music_state_v1"];
const fmt=s=>{
  if(!Number.isFinite(s))return"0:00";
  s=Math.max(0,Math.floor(s));
  return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
};

function readState(){
  const defaults={track:0,time:0,volume:.62,muted:false,loop:false,collapsed:true,playing:true,savedAt:0};
  let raw=null;
  try{
    raw=localStorage.getItem(KEY);
    if(!raw){
      for(const k of LEGACY_KEYS){
        raw=localStorage.getItem(k);
        if(raw)break;
      }
    }
  }catch(e){}
  if(!raw)return {state:defaults,hadState:false};
  try{return {state:{...defaults,...JSON.parse(raw)},hadState:true}}
  catch(e){return {state:defaults,hadState:false}}
}

function mount(){
  if(document.querySelector(".rp-music"))return;

  const root=document.createElement("div");
  root.className="rp-music is-collapsed";
  root.innerHTML='<div class="rp-music-shell"><div class="rp-music-lid" title="展开/收起播放器"><span class="rp-music-brand">Nocturne Cabinet</span><i class="rp-music-gem"></i></div><div class="rp-music-panel"><div class="rp-music-score"><small class="rp-music-kicker">Musica Nocturna</small><strong class="rp-music-title"></strong><span class="rp-music-artist"></span></div><div class="rp-music-keys"><button class="rp-music-key prev" aria-label="上一首">‹</button><button class="rp-music-key main play" aria-label="播放">▶</button><button class="rp-music-key next" aria-label="下一首">›</button></div><div class="rp-music-tools"><input class="rp-music-progress" type="range" min="0" max="1000" value="0" aria-label="播放进度"><span class="rp-music-time">0:00 / 0:00</span></div><div class="rp-music-volume-row"><button class="rp-music-small mute" aria-label="静音">♩</button><input class="rp-music-volume" type="range" min="0" max="1" step=".02" aria-label="音量"><button class="rp-music-small loop" aria-label="循环播放">↻</button></div><div class="rp-music-status">正在唤醒夜曲…</div></div></div>';
  document.body.appendChild(root);

  const audio=new Audio();
  audio.preload="metadata";
  audio.playsInline=true;

  const lid=root.querySelector(".rp-music-lid");
  const title=root.querySelector(".rp-music-title");
  const artist=root.querySelector(".rp-music-artist");
  const play=root.querySelector(".play");
  const prev=root.querySelector(".prev");
  const next=root.querySelector(".next");
  const progress=root.querySelector(".rp-music-progress");
  const time=root.querySelector(".rp-music-time");
  const volume=root.querySelector(".rp-music-volume");
  const mute=root.querySelector(".mute");
  const loop=root.querySelector(".loop");
  const status=root.querySelector(".rp-music-status");

  const loaded=readState();
  let state=loaded.state;
  const hadState=loaded.hadState;
  state.track=Math.max(0,Math.min(tracks.length-1,state.track|0));

  audio.volume=Math.max(0,Math.min(1,Number.isFinite(+state.volume)?+state.volume:.62));
  audio.muted=!!state.muted;
  audio.loop=!!state.loop;
  volume.value=String(audio.volume);
  mute.textContent=audio.muted?"×":"♩";
  loop.style.color=audio.loop?"#efd477":"";
  root.classList.toggle("is-collapsed",state.collapsed!==false);

  let unloading=false;
  let gestureArmed=false;

  function persist(forcePlaying){
    state.volume=audio.volume;
    state.muted=audio.muted;
    state.loop=audio.loop;
    state.collapsed=root.classList.contains("is-collapsed");
    state.time=Number.isFinite(audio.currentTime)?audio.currentTime:(state.time||0);
    if(typeof forcePlaying==="boolean")state.playing=forcePlaying;
    else if(!unloading)state.playing=!audio.paused;
    state.savedAt=Date.now();
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
  }

  function resumeTime(){
    let t=Math.max(0,+state.time||0);
    if(state.playing&&state.savedAt){
      const elapsed=Math.max(0,(Date.now()-state.savedAt)/1000);
      if(elapsed<120)t+=elapsed;
    }
    return t;
  }

  function armGestureStart(){
    if(gestureArmed)return;
    gestureArmed=true;
    status.textContent="点击页面任意位置开启夜曲";
    const start=async()=>{
      document.removeEventListener("pointerdown",start,true);
      document.removeEventListener("keydown",start,true);
      gestureArmed=false;
      try{
        await audio.play();
        status.textContent="";
      }catch(e){
        status.textContent="点击琴键开始播放";
      }
    };
    document.addEventListener("pointerdown",start,true);
    document.addEventListener("keydown",start,true);
  }

  function setTrackMeta(){
    const t=tracks[state.track];
    title.textContent=t.title;
    artist.textContent=t.artist;
  }

  async function load(index,autoplay=false,resume=0){
    state.track=(index+tracks.length)%tracks.length;
    const t=tracks[state.track];
    setTrackMeta();

    root.classList.add("loading");
    status.textContent="正在读取琴谱…";
    play.disabled=prev.disabled=next.disabled=true;

    try{
      if(audio.src!==new URL(t.src,location.href).href){
        audio.src=t.src;
        audio.load();
      }

      await new Promise((resolve,reject)=>{
        if(audio.readyState>=1)return resolve();
        const ok=()=>{cleanup();resolve()};
        const bad=()=>{cleanup();reject(new Error("audio load failed: "+t.src))};
        const cleanup=()=>{
          audio.removeEventListener("loadedmetadata",ok);
          audio.removeEventListener("error",bad);
        };
        audio.addEventListener("loadedmetadata",ok,{once:true});
        audio.addEventListener("error",bad,{once:true});
      });

      const target=Math.max(0,+resume||0);
      if(target>0&&Number.isFinite(audio.duration)){
        audio.currentTime=Math.min(target,Math.max(0,audio.duration-.25));
      }

      time.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);

      if(autoplay){
        try{
          await audio.play();
          status.textContent="";
        }catch(e){
          state.playing=true;
          persist(true);
          armGestureStart();
        }
      }else{
        status.textContent="";
      }
    }catch(e){
      console.error(e);
      state.playing=false;
      play.textContent="▶";
      status.textContent="乐曲资源读取失败";
      persist(false);
    }finally{
      root.classList.remove("loading");
      play.disabled=prev.disabled=next.disabled=false;
    }
  }

  lid.onclick=()=>{root.classList.toggle("is-collapsed");persist()};

  play.onclick=async()=>{
    if(!audio.src)await load(state.track,false,resumeTime());
    if(audio.paused){
      try{
        state.playing=true;
        await audio.play();
      }catch(e){
        state.playing=true;
        persist(true);
        armGestureStart();
      }
    }else{
      audio.pause();
    }
  };

  prev.onclick=()=>{state.time=0;state.playing=true;persist(true);load(state.track-1,true,0)};
  next.onclick=()=>{state.time=0;state.playing=true;persist(true);load(state.track+1,true,0)};

  progress.oninput=()=>{
    if(audio.duration){
      audio.currentTime=(+progress.value/1000)*audio.duration;
      state.time=audio.currentTime;
      persist();
    }
  };

  volume.oninput=()=>{
    audio.volume=+volume.value;
    audio.muted=false;
    mute.textContent="♩";
    persist();
  };

  mute.onclick=()=>{
    audio.muted=!audio.muted;
    mute.textContent=audio.muted?"×":"♩";
    persist();
  };

  loop.onclick=()=>{
    audio.loop=!audio.loop;
    loop.style.color=audio.loop?"#efd477":"";
    persist();
  };

  audio.ontimeupdate=()=>{
    if(audio.duration){
      progress.value=String(Math.round(audio.currentTime/audio.duration*1000));
      time.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);
      state.time=audio.currentTime;
    }
  };

  audio.onplay=()=>{play.textContent="Ⅱ";state.playing=true;status.textContent="";persist(true)};
  audio.onpause=()=>{play.textContent="▶";if(!unloading){state.playing=false;persist(false)}};

  audio.onended=()=>{
    if(!audio.loop){
      state.time=0;
      state.playing=true;
      persist(true);
      load(state.track+1,true,0);
    }
  };

  const leave=()=>{
    const wasPlaying=state.playing||!audio.paused;
    unloading=true;
    persist(wasPlaying);
  };
  window.addEventListener("pagehide",leave,{capture:true});
  window.addEventListener("beforeunload",leave,{capture:true});

  setTrackMeta();
  load(state.track,!hadState||state.playing,resumeTime());
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);
else mount();

})();