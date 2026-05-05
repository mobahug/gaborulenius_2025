import{a as O,j as $}from"./vendor-react-CptINutj.js";import{i as C,s as M,d as F}from"./vendor-mui-DXoPst2b.js";import{k as b}from"./vendor-emotion-CS1ZSvAf.js";const j=b`
  0% {
    /* Start off-screen or at an edge, invisible */
    transform: translate(var(--startX), var(--startY)) scale(0.7);
    opacity: 0;
  }
  5%, 10% { /* Fade in as it enters view */
    opacity: var(--maxOpacity);
    /* No specific transform here, allows it to move towards first major point */
  }
  25% {
    transform: translate(var(--point1X), var(--point1Y)) scale(1);
    opacity: var(--maxOpacity);
  }
  50% {
    transform: translate(var(--point2X), var(--point2Y)) scale(0.9);
    opacity: var(--maxOpacity);
  }
  75% {
    transform: translate(var(--point3X), var(--point3Y)) scale(1.1);
    opacity: var(--maxOpacity);
  }
  90%, 95% { /* Start fading out as it moves towards exit */
    opacity: var(--maxOpacity);
    /* No specific transform here, allows it to move towards its final off-screen point */
  }
  100% {
    /* End off-screen or at an opposite edge, invisible */
    transform: translate(var(--endX), var(--endY)) scale(0.7);
    opacity: 0;
  }
`,k=b`
  0%, 100% {
    opacity: 0.35;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.4);
  }
`,B=M(F)({position:"fixed",top:0,left:0,width:"100vw",height:"100vh",pointerEvents:"none",overflow:"hidden"}),S=M(F,{shouldForwardProp:a=>!["startTop","startLeft","startX","startY","point1X","point1Y","point2X","point2Y","point3X","point3Y","endX","endY","driftDuration","driftDelay","maxOpacity","animationDirection","glowDuration","glowDelay","baseColor","glowColorDim","glowColorBright","size"].includes(a)})(({startX:a,startTop:e,startLeft:s,startY:r,point1X:o,point1Y:h,point2X:i,point2Y:v,point3X:D,point3Y:g,endX:l,endY:w,driftDuration:u,driftDelay:t,maxOpacity:p,animationDirection:c,glowDuration:d,glowDelay:f,baseColor:n,glowColorDim:x,glowColorBright:X,size:m})=>({"--startX":a,"--startY":r,"--point1X":o,"--point1Y":h,"--point2X":i,"--point2Y":v,"--point3X":D,"--point3Y":g,"--endX":l,"--endY":w,"--maxOpacity":p,"--baseColor":n,"--glowColorDim":x,"--glowColorBright":X,position:"absolute",top:e,left:s,width:m,height:m,backgroundColor:n,borderRadius:"50%",opacity:0,willChange:"transform, opacity",animation:`${j} ${u} infinite linear`,animationDelay:t,animationDirection:c,"&::before":{content:'""',position:"absolute",inset:"-6px",borderRadius:"50%",background:"radial-gradient(circle, var(--glowColorBright) 0%, var(--glowColorDim) 45%, transparent 72%)",opacity:.35,transform:"scale(0.8)",willChange:"transform, opacity",animation:`${k} ${d} infinite ease-in-out`,animationDelay:f}})),E=[.4,.8],_=({sx:a,count:e=70,baseColor:s="#DAF7A6",glowColor:r="#FFFACD",minMaxOpacity:o=E})=>{const h=O.useMemo(()=>Array.from({length:e}).map((i,v)=>{const D=`${Math.random()*1.8+.8}px`,g=Math.random()*40+60,l=Math.random()*30-25,w=`${g}s`,u=`${l}s`,t=y=>({x:`${Math.random()*y-y/2}vw`,y:`${Math.random()*y-y/2}vh`}),p=t(60),c=t(40),d=t(40),f=t(40),n=t(60),x=`${Math.random()*6+4}s`,X=`${l+Math.random()*5}s`,m=Math.random()*(o[1]-o[0])+o[0],Y=["normal","reverse","alternate"],A=Y[Math.floor(Math.random()*Y.length)];return{id:`firefly-${v}`,size:D,startTop:`${Math.random()*100}vh`,startLeft:`${Math.random()*100}vw`,startX:p.x,startY:p.y,point1X:c.x,point1Y:c.y,point2X:d.x,point2Y:d.y,point3X:f.x,point3Y:f.y,endX:n.x,endY:n.y,driftDuration:w,driftDelay:u,maxOpacity:m,animationDirection:A,glowDuration:x,glowDelay:X,baseColor:s,glowColorDim:C(r,.25),glowColorBright:C(r,.75)}}),[e,s,r,o]);return $.jsx(B,{sx:a,children:h.map(i=>$.jsx(S,{...i},i.id))})};export{_ as default};
