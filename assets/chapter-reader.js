(()=>{
const chapters=["初拥","暴力与和平","步入黑夜","血族的假面","地下","暗流涌动","梦魇","锤炼","舐犊情深","大艺术家","好奇害死猫","亵渎的交融","冒牌货","麻烦的魅魔","何以为家","伤痕","荡妇的作用","血族协会","闹市","正义的天秤","庭审","剧场之变"];
const current=Number(document.body.dataset.chapter||0);
if(!current)return;
// Display chapter title without the numeric prefix; chapter number remains in the MAIN STORY · CHAPTER XX eyebrow.
const titleEl=document.querySelector(".chapter-head h1");
if(titleEl)titleEl.textContent=titleEl.textContent.replace(/^\\s*\\d+\\.\\s*/,"");

// Scene breaks are restored from the finalized Word manuscript.
// Each entry is the normalized beginning of the paragraph that follows an intentional blank paragraph.
const sceneBreakAnchors={
"1":["为了维持生计，僵尸男在几年前成为了一","在那以后，僵尸男的意识便断片，且被转","经历半刻的沉默，僵尸男向甜公发去了迎","换好衣服后，僵尸男是光着脚被甜公硬扯","僵尸男闭眼朝甜公的下腹蹬去。这让甜公"],
"2":["今天已经是初拥仪式后的第10天。","约过了半日后，有客人来访了甜美公爵的","结束工作以后，吹雪拿到了报酬，直到踏"],
"3":["甜公却对后裔的各种变化喜形于色。他过","甜公最终愉悦地抽走手，并掏出帕子细致","要在城堡里进行的，只是小规模的家宴，","66号在获得短暂自由以后，要做的第一","“喂，你们俩在那边闲聊些什么呢？还不"],
"4":["放置棺材的这个房间，是城堡整层最大的","不过，那也已经是一个多月之前的事了。"],
"5":["66号做了个梦。他梦见了一间小的面包","66号拖来箱子，加上踮脚之后的高度才","黎明的迹象出现在森林的尽头。那叫作龙","与此同时，甜公对地下发生的事并非毫无","可最近又有哪里不一样了。"],
"6":["至此，66号从血仆口中交流了一些信息","门禁解除后，在一个甜公不在城堡的契机"],
"7":["那瞬间，胆小的教徒作鸟散状纷纷逃出石","糟糕的是，66号已经有一段时间没有摄","回到城堡后，66号脱掉身上一切带血的","游于遥远的梦中，66号的身躯瑟缩成一"],
"8":["“既然你已经了解了我的想法，那么接下","充满疼痛的整夜很快就过去，天边第一缕","初次化形后，甜公针对66号的战斗训练","不过，人生并不总是基于理性规划的，一"],
"9":["那天之后，两人谁也没有再提那场意外。","几个小时后的夜里，甜公便从66号的床"],
"10":["他们的目的是哈普西科德(Harpsi","琴声最终戛然而止。","凌晨，维比佳莎终于结束课程，刚踏出练","甜公正整理乐谱，66号顺势闪了进来，","或许是为了表示决心，最终甜公还是打算"],
"11":["过度摄入的毒性过了片刻才彻底平息。血","甜公弯下腰，拾起无法行动的后裔，朝着"],
"12":["“喂！不要这样……想做什么回去再说，","66号本对神明之说敬而远之，逐渐扰动","还没想出答案，拜堂深处的阴影里，突然","“喂，比吾特。刚才的话还算数吗？”","两人沿着山路往回走了一段，66号忽然"],
"13":["离开忏悔室后，66号的下一个目的地便","赶回城堡后，甜公显然已经发现了猎人的"],
"14":["夕阳的余晖燃尽，夜幕降临，河岸边亮起","正当66号想站起身时，几道巨大的黑影","很快，大屠杀的结局便见分晓。血雨萧萧","当66号安置好26号赶来时，战斗早已","26号醒来时，发现自己正躺在66号的","暗夜协会地下某处，厚重的鞋跟声沿着走"],
"15":["就在此时，隔壁桌一个脸带伤疤的醉汉，","在黄昏的广场上，教士们在地面挖出一个","随着黄昏的晚祷钟响起，最后一抹夕阳的","就在主教宣布下一个祭品，教士们准备将","随着教会势力的遁走，风暴渐渐平息，周","龙卷吹雪两姐妹吵得不可开交，但广场的"],
"16":["由于魔女造成的混乱，教会暂时无力追踪","66号回到城堡后，马上到主卧里寻找甜"],
"17":["房间里充斥着臀肉拍打的清脆声音，以及"],
"18":["而在处理这些事情的过程中，66号也开","他随甜公踏入会议室。这里的氛围比城堡","玛考伊始终没有参与这场争执。直到众人","桌边的气氛却没有因此缓和。","会议最终在无形的硝烟中落幕。甜公在这","血族内部会议结束后的几日，甜公的城堡","等大门彻底合上，66号才把最后一块点"],
"19":["离开面包房以后，66号转身走向贩卖食","当66号拎着大包小包回到城堡，却得知","66号刚走出会长的办公室，维比佳莎便"],
"20":["夜深了，府邸的女主人打着哈欠，慵懒地","顶层厅堂的门紧闭着。在无声地处理掉门","“给我住手，比吾特！！！”","夜风穿过墓地。"],
"21":["与此同时，66号正拖着疲惫不堪的甜公","几日后，血族协会的传召抵达城堡。","“演得不错。”"],
"22":["演出落幕后，后台的空气很快被香槟、鲜","很快，66号被带到一处位于S市的地下","然而，骑士团没有取得进展，并不意味着","布鲁与居合退到审讯室之外，谁也没有立","之后，关于阿麦·马斯克收留血族同党的"]
};
const norm=s=>(s||"").replace(/\\s+/g,"");
const anchors=sceneBreakAnchors[String(current)]||[];
if(anchors.length){
  const paragraphs=[...document.querySelectorAll(".chapter-body p")];
  anchors.forEach(anchor=>{
    const target=paragraphs.find(p=>norm(p.textContent).startsWith(norm(anchor)));
    if(target && !(target.previousElementSibling&&target.previousElementSibling.classList.contains("chapter-scene-space"))){
      const gap=document.createElement("div");
      gap.className="chapter-scene-space";
      gap.setAttribute("aria-hidden","true");
      target.before(gap);
    }
  });
}

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