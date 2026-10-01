(()=>{"use strict";

const tracks=[
  {
    id:"ruby_paranoia_instrumental",
    title:"ルビー・パラノイア",
    artist:"Instrumental",
    src:"/assets/music/%E3%83%AB%E3%83%93%E3%83%BC%E3%83%BB%E3%83%91%E3%83%A9%E3%83%8E%E3%82%A4%E3%82%A2%EF%BC%88RUBY%20PARANOIA%EF%BC%89%20-%20%E4%BC%B4%E5%A5%8F.mp3"
  },
  {
    id:"fanatic_nocturne_instrumental",
    title:"狂信者のノクターン",
    artist:"Instrumental",
    src:"/assets/music/fanatic-nocturne.mp3"
  },
  {
    id:"waga_shien_instrumental",
    title:"我が始焉",
    artist:"Instrumental",
    src:"/assets/music/%E6%88%91%E3%81%8C%E5%A7%8B%E7%84%89%20(Instrumental).mp3"
  },
  {
    id:"stillness_instrumental",
    title:"Stillness",
    artist:"Instrumental",
    src:"/assets/music/Stillness%20(Instrumental).mp3"
  }
];

const KEY="rp_music_state_v2";
const LEGACY_KEY="rp_music_state_v1";
const fmt=s=>{
  if(!Number.isFinite(s))return"0:00";
  s=Math.max(0,Math.floor(s));
  return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
};

async function buildTrack(t){
  if(!t.src)throw new Error("missing direct MP3 source for "+t.id);
  return t.src;
}

function mount(){
  if(location.pathname.replace(/\/+$/,"")==="/extras/diary")return;
  if(document.querySelector(".rp-music"))return;

  const root=document.createElement("div");
  root.className="rp-music is-collapsed";
  root.innerHTML='<button class="rp-music-toggle" type="button" aria-label="音乐播放器" aria-expanded="false" title="展开音乐播放器"><span aria-hidden="true">♪</span></button><div class="rp-music-shell"><div class="rp-music-panel"><div class="rp-music-score"><small class="rp-music-kicker">Musica Nocturna</small><strong class="rp-music-title"></strong><span class="rp-music-artist"></span></div><div class="rp-music-keys"><button class="rp-music-key prev" aria-label="上一首">‹</button><button class="rp-music-key main play" aria-label="播放">▶</button><button class="rp-music-key next" aria-label="下一首">›</button></div><div class="rp-music-tools"><input class="rp-music-progress" type="range" min="0" max="1" step="0.01" value="0" aria-label="播放进度"><span class="rp-music-time">0:00 / 0:00</span></div><div class="rp-music-volume-row"><button class="rp-music-small mute" aria-label="静音">♩</button><input class="rp-music-volume" type="range" min="0" max="1" step=".02" aria-label="音量"><button class="rp-music-small loop" aria-label="单曲循环" aria-pressed="false" title="单曲循环">↻</button></div><div class="rp-music-status">正在唤醒夜曲…</div></div></div>';
  const actions=document.querySelector(".topbar .actions");
  if(actions){actions.classList.add("has-music-player");const share=actions.querySelector("[data-share]");if(share){actions.insertBefore(root,share)}else{actions.prepend(root)}}else{root.classList.add("rp-music-fallback");document.body.appendChild(root)}

  const audio=new Audio();
  audio.preload="auto";

  const toggle=root.querySelector(".rp-music-toggle");
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

  const defaults={
    track:0,time:0,volume:.62,muted:false,loopMode:"list",
    collapsed:true,playing:true,savedAt:0
  };

  let raw=null;
  try{
    raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY);
  }catch(e){}

  const hadState=!!raw;
  let state={...defaults};
  if(raw){
    try{
      const parsed=JSON.parse(raw);
      state={...state,...parsed};
      if(typeof parsed.loop==="boolean" && !parsed.loopMode)state.loopMode=parsed.loop?"single":"list";
    }catch(e){}
  }

  let firstEntryThisSession=false;
  try{
    firstEntryThisSession=sessionStorage.getItem("rp_music_session_started")!=="1";
    if(firstEntryThisSession)sessionStorage.setItem("rp_music_session_started","1");
  }catch(e){}
  if(firstEntryThisSession){
    state.track=0;
    state.time=0;
    state.playing=true;
    state.savedAt=0;
  }

  state.track=Math.max(0,Math.min(tracks.length-1,state.track|0));
  state.loopMode=state.loopMode==="single"?"single":"list";
  audio.volume=Math.max(0,Math.min(1,Number.isFinite(+state.volume)?+state.volume:.62));
  audio.muted=!!state.muted;
  audio.loop=state.loopMode==="single";
  volume.value=audio.volume;
  state.collapsed=true;
  root.classList.add("is-collapsed");
  mute.textContent=audio.muted?"×":"♩";

  let unloading=false;
  let loadSerial=0;
  let gestureArmed=false;
  let seeking=false;

  function syncDuration(){
    if(Number.isFinite(audio.duration)&&audio.duration>0){
      progress.max=String(audio.duration);
      if(!seeking)progress.value=String(Math.min(audio.currentTime,audio.duration));
      time.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);
    }
  }

  function renderLoopMode(){
    const single=state.loopMode==="single";
    audio.loop=single;
    loop.textContent=single?"↻₁":"↻";
    loop.classList.toggle("is-active",single);
    loop.setAttribute("aria-pressed",String(single));
    loop.setAttribute("aria-label",single?"单曲循环：点击切换列表循环":"列表循环：点击切换单曲循环");
    loop.title=single?"单曲循环（点击切换列表循环）":"列表循环（点击切换单曲循环）";
  }
  renderLoopMode();

  function setCollapsed(collapsed){
    root.classList.toggle("is-collapsed",collapsed);
    toggle.setAttribute("aria-expanded",String(!collapsed));
    toggle.title=collapsed?"展开音乐播放器":"收起音乐播放器";
    state.collapsed=collapsed;
    persist();
  }

  function persist(forcePlaying){
    state.volume=audio.volume;
    state.muted=audio.muted;
    state.loopMode=audio.loop?"single":"list";
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

  async function load(index,autoplay=false,resume=0){
    const serial=++loadSerial;
    state.track=(index+tracks.length)%tracks.length;
    const t=tracks[state.track];

    title.textContent=t.title;
    artist.textContent=t.artist;
    root.classList.add("loading");
    status.textContent="正在整理琴谱…";
    play.disabled=true;
    prev.disabled=true;
    next.disabled=true;

    try{
      const src=await buildTrack(t);
      if(serial!==loadSerial)return;

      audio.src=src;
      audio.load();

      await new Promise((resolve,reject)=>{
        if(audio.readyState>=1)return resolve();
        const ok=()=>{cleanup();resolve()};
        const bad=()=>{cleanup();reject(new Error("audio metadata failed"))};
        const cleanup=()=>{
          audio.removeEventListener("loadedmetadata",ok);
          audio.removeEventListener("error",bad);
        };
        audio.addEventListener("loadedmetadata",ok,{once:true});
        audio.addEventListener("error",bad,{once:true});
      });

      if(serial!==loadSerial)return;

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
      status.textContent="乐曲资源读取失败";
      play.textContent="▶";
      state.playing=false;
      persist(false);
    }finally{
      if(serial===loadSerial){
        root.classList.remove("loading");
        play.disabled=false;
        prev.disabled=false;
        next.disabled=false;
      }
    }
  }

  toggle.onclick=()=>setCollapsed(!root.classList.contains("is-collapsed"));

  function pauseForegroundAudio(){
    document.querySelectorAll(".song-audio").forEach(a=>{
      if(!a.paused){
        try{a.pause()}catch(e){}
      }
    });
  }

  play.onclick=async()=>{
    if(audio.paused)pauseForegroundAudio();
    if(!audio.src){
      await load(state.track,false,resumeTime());
    }
    if(audio.paused){
      try{
        state.playing=true;
        await audio.play();
        status.textContent="";
      }catch(e){
        state.playing=true;
        persist(true);
        armGestureStart();
      }
    }else{
      audio.pause();
    }
  };

  prev.onclick=()=>{
    state.time=0;
    state.playing=true;
    persist(true);
    load(state.track-1,true,0);
  };

  next.onclick=()=>{
    state.time=0;
    state.playing=true;
    persist(true);
    load(state.track+1,true,0);
  };

  const seekToValue=()=>{
    if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
    const target=Math.max(0,Math.min(Number(progress.value)||0,audio.duration));
    seeking=true;
    try{audio.currentTime=target}catch(e){}
    state.time=target;
    time.textContent=fmt(target)+" / "+fmt(audio.duration);
  };
  progress.addEventListener("pointerdown",()=>{seeking=true});
  progress.addEventListener("input",seekToValue);
  progress.addEventListener("change",()=>{seekToValue();seeking=false;persist()});
  progress.addEventListener("pointerup",()=>{seekToValue();seeking=false;persist()});
  progress.addEventListener("pointercancel",()=>{seeking=false});
  progress.addEventListener("click",e=>{
    if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
    const r=progress.getBoundingClientRect();
    if(r.width>0){
      progress.value=String(((e.clientX-r.left)/r.width)*audio.duration);
      seekToValue();
      seeking=false;
      persist();
    }
  });
  progress.addEventListener("keyup",e=>{
    if(["ArrowLeft","ArrowRight","Home","End","PageUp","PageDown"].includes(e.key)){
      seekToValue();seeking=false;persist();
    }
  });

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
    state.loopMode=state.loopMode==="single"?"list":"single";
    renderLoopMode();
    status.textContent=state.loopMode==="single"?"单曲循环":"列表循环";
    setTimeout(()=>{if(status.textContent==="单曲循环"||status.textContent==="列表循环")status.textContent=""},1200);
    persist();
  };

  audio.ondurationchange=syncDuration;
  audio.onloadedmetadata=syncDuration;
  audio.ontimeupdate=()=>{
    if(Number.isFinite(audio.duration)&&audio.duration>0){
      if(!seeking)progress.value=String(audio.currentTime);
      time.textContent=fmt(seeking?+progress.value:audio.currentTime)+" / "+fmt(audio.duration);
      state.time=audio.currentTime;
      if(Math.floor(audio.currentTime)%2===0)persist();
    }
  };

  audio.onplay=()=>{
    play.textContent="Ⅱ";
    state.playing=true;
    status.textContent="";
    persist(true);
  };

  audio.onpause=()=>{
    play.textContent="▶";
    if(!unloading){
      state.playing=false;
      persist(false);
    }
  };

  audio.onended=()=>{
    if(state.loopMode==="single"){
      state.time=0;
      state.playing=true;
      persist(true);
      try{audio.currentTime=0;audio.play()}catch(e){}
      return;
    }
    state.time=0;
    state.playing=true;
    persist(true);
    load(state.track+1,true,0);
  };

  document.querySelectorAll(".song-audio").forEach(fg=>{
    fg.addEventListener("play",()=>{
      if(!audio.paused)audio.pause();
      state.playing=false;
      persist(false);
      status.textContent="背景音乐已暂停";
    });
  });

  window.RPBackgroundMusic={
    pause(){
      if(!audio.paused)audio.pause();
      state.playing=false;
      persist(false);
    },
    play(){
      pauseForegroundAudio();
      state.playing=true;
      return audio.play();
    },
    get mode(){return state.loopMode}
  };

  window.addEventListener("pagehide",()=>{
    const wasPlaying=state.playing||!audio.paused;
    unloading=true;
    persist(wasPlaying);
  },{capture:true});

  window.addEventListener("beforeunload",()=>{
    const wasPlaying=state.playing||!audio.paused;
    unloading=true;
    persist(wasPlaying);
  },{capture:true});

  title.textContent=tracks[state.track].title;
  artist.textContent=tracks[state.track].artist;

  const shouldAutoplay=firstEntryThisSession||!hadState||state.playing;
  load(state.track,shouldAutoplay,resumeTime());
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);
else mount();

})();