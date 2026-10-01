import{a as h,j as n}from"./vendor-react-CptINutj.js";import{u as g}from"./AppShell-De-p0ptQ.js";import{a as i}from"./index-CvFPE0yl.js";import{k as s}from"./vendor-emotion-CS1ZSvAf.js";import{s as d,d as u}from"./vendor-mui-DXoPst2b.js";import"./vendor-intl-yz93lFsZ.js";import"./vendor-mui-icons-grj8BP03.js";const x=s`
  0%   { transform: translate3d(300px, 0, 0)   rotate(0deg);   opacity: 0.7; }
  100% { transform: translate3d(-350px, 100vh, 0) rotate(90deg);  opacity: 0; }
`,y=s`
  0%   { transform: translate3d(0, 0, 0)      rotate(90deg);  opacity: 0.7; }
  100% { transform: translate3d(-400px, 100vh, 0) rotate(0deg);  opacity: 0; }
`,v=s`
  0%   { transform: translate3d(0, 0, 0)      rotate(-20deg); opacity: 0.7; }
  100% { transform: translate3d(-230px, 100vh, 0) rotate(-70deg);opacity: 0; }
`,l=[x,y,v],w=10,M=d(u)(()=>({position:"fixed",top:0,left:0,width:"100vw",height:"100vh",pointerEvents:"none",overflow:"hidden"})),A=d("img",{shouldForwardProp:a=>!["animation","left","size","delay","duration"].includes(a)})(({animation:a,left:o,size:r,delay:e,duration:t})=>({position:"absolute",top:"-50px",left:`${o}vw`,width:`${r}px`,opacity:.7,pointerEvents:"none",animation:`${a} ${t}s infinite ease-in-out`,animationDelay:`${e}s`})),F=({sx:a})=>{const{selectedTheme:o}=g(),r=h.useMemo(()=>Array.from({length:w}).map((e,t)=>({id:t,left:Math.random()*100,size:12+Math.random()*8,delay:Math.random()*10,duration:15+Math.random()*5,animation:l[t%l.length]})),[]);return n.jsx(M,{sx:a,children:r.map(({id:e,animation:t,left:m,size:p,delay:f,duration:c})=>n.jsx(A,{src:o==="dark"?i("dark-leaf-small.webp"):i("light-leaf-small.webp"),"aria-hidden":"true",animation:t,left:m,size:p,delay:f,duration:c,alt:""},e))})};export{F as default};
