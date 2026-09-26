const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AppShell-C_3zcJho.js","assets/vendor-react-CptINutj.js","assets/vendor-mui-DXoPst2b.js","assets/vendor-emotion-CS1ZSvAf.js","assets/vendor-intl-yz93lFsZ.js","assets/vendor-mui-icons-C4syp0xR.js"])))=>i.map(i=>d[i]);
import{r as p,j as n,a as x,d as j}from"./vendor-react-CptINutj.js";(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))g(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&g(r)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function g(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();const k="modulepreload",S=function(a){return"/gaborulenius_2025/"+a},w={},H=function(c,s,g){let t=Promise.resolve();if(s&&s.length>0){let r=function(i){return Promise.all(i.map(h=>Promise.resolve(h).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),u=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));t=r(s.map(i=>{if(i=S(i),i in w)return;w[i]=!0;const h=i.endsWith(".css"),f=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${f}`))return;const l=document.createElement("link");if(l.rel=h?"stylesheet":k,h||(l.as="script"),l.crossOrigin="",l.href=i,u&&l.setAttribute("nonce",u),document.head.appendChild(l),h)return new Promise((L,B)=>{l.addEventListener("load",L),l.addEventListener("error",()=>B(new Error(`Unable to preload CSS for ${i}`)))})}))}function e(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return t.then(r=>{for(const o of r||[])o.status==="rejected"&&e(o.reason);return c().catch(e)})},d={bgDark:"#1e2a20",textLight:"#f2f3ef",textLightRgb:"242, 243, 239",textHeading:"#d8d8b4",accent:"#c0cc9c",accentHover:"#c8e59f",glassBg:"rgba(255, 255, 255, 0.05)",glassBorder:"rgba(255, 255, 255, 0.08)",navBg:"rgba(30, 42, 32, 0.9)",drawerBg:"rgba(30, 42, 32, 0.98)",overlayBg:"rgba(0, 0, 0, 0.4)",dividerBg:"rgba(255, 255, 255, 0.2)",btnBg:"#3a5223",btnBgHover:"#4c6e36"},m={bgDark:"#0e1a18",textLight:"#e7f5f3",textLightRgb:"231, 245, 243",textHeading:"#bfded5",accent:"#4e8375",accentHover:"#5c9d8c",glassBg:"rgba(255, 255, 255, 0.05)",glassBorder:"rgba(255, 255, 255, 0.08)",navBg:"rgba(8, 34, 48, 0.92)",drawerBg:"rgba(8, 34, 48, 0.92)",overlayBg:"rgba(0, 0, 0, 0.40)",dividerBg:"rgba(255, 255, 255, 0.20)",btnBg:"#1c3a54",btnBgHover:"#2a5e8e"},R=300,$=.85,P=()=>Math.max(R,window.innerHeight*$),C=()=>{const a=window.innerHeight,c=a/2,s=document.getElementById("home");if(!s){const r=P();return Math.max(0,1-window.scrollY/r)}const t=s.getBoundingClientRect().top-c,e=a*.25;return Math.min(1,Math.max(0,t/e))},I=[{id:"navHome",href:"#home"},{id:"navAbout",href:"#about"},{id:"navProjects",href:"#projects"},{id:"navExperience",href:"#experience"},{id:"navSkills",href:"#skills"},{id:"navContact",href:"#contact"}],F=[{key:"effects",id:"tabsEffects"},{key:"appearance",id:"tabsAppearance"},{key:"language",id:"tabsLanguage"}],v=a=>`/gaborulenius_2025/${a.replace(/^\/+/,"")}`,y={en:"Hi, I'm Gábor",fi:"Hei, olen Gábor"},E={en:"Scroll Down",fi:"Vieritä alas"},b=()=>typeof document>"u"?"en":document.documentElement.dataset.locale==="fi"?"fi":"en",_=()=>{const a=p.useRef(null),[c,s]=p.useState(b),g=y[c]??y.en,t=E[c]??E.en;return p.useEffect(()=>{const e=document.documentElement;s(b());const r=new MutationObserver(()=>{s(b())});return r.observe(e,{attributes:!0,attributeFilter:["data-locale"]}),()=>r.disconnect()},[]),p.useEffect(()=>{let e=null;const r=()=>{if(!a.current)return;const u=a.current,i=C();u.style.opacity=i.toString(),u.style.pointerEvents=i===0?"none":"auto",u.style.display=i===0?"none":"flex"},o=()=>{e===null&&(e=window.requestAnimationFrame(()=>{e=null,r()}))};return window.addEventListener("scroll",o,{passive:!0}),r(),()=>{e!==null&&window.cancelAnimationFrame(e),window.removeEventListener("scroll",o)}},[]),n.jsxs(n.Fragment,{children:[n.jsxs("section",{ref:a,id:"cover",className:"cover-section",style:{position:"fixed",top:0,left:0,right:0,height:"100svh",minHeight:"100vh",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",backgroundColor:d.glassBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",color:d.textLight,paddingLeft:16,paddingRight:16,transition:"opacity 0.5s ease-out",boxSizing:"border-box"},children:[n.jsxs("div",{style:{maxWidth:600},children:[n.jsx("img",{alt:"Gábor Ulenius",src:v("profile-160.webp"),srcSet:`${v("profile-160.webp")} 160w, ${v("profile-320.webp")} 320w`,sizes:"(max-width: 600px) 140px, (max-width: 900px) 150px, 160px",width:160,height:160,decoding:"async",fetchpriority:"high",loading:"eager",className:"cover-avatar"}),n.jsx("h1",{className:"cover-greeting",children:g}),n.jsxs("a",{href:"#home",className:"cover-scroll","aria-label":t,children:[n.jsx("svg",{className:"cover-scroll-icon",width:"35",height:"35",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",focusable:"false",children:n.jsx("path",{d:"M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"})}),n.jsx("span",{className:"cover-scroll-label",children:t})]})]}),n.jsx("style",{children:`
          .cover-avatar {
            display: block;
            width: 140px;
            height: 140px;
            margin: 0 auto 40px auto;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid ${d.accent};
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
            background-color: ${d.glassBg};
          }
          @media (min-width: 600px) {
            .cover-avatar { width: 150px; height: 150px; }
          }
          @media (min-width: 900px) {
            .cover-avatar { width: 160px; height: 160px; }
          }
          .cover-greeting {
            margin: 0 0 16px 0;
            font-size: 2rem;
            font-weight: 600;
            line-height: 1.2;
            color: ${d.textHeading};
          }
          @media (min-width: 600px) { .cover-greeting { font-size: 2.5rem; } }
          @media (min-width: 900px) { .cover-greeting { font-size: 3rem; } }
          .cover-scroll {
            margin-top: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: ${d.accentHover};
            text-decoration: none;
            animation: cover-bounce 2s infinite;
          }
          .cover-scroll-icon { color: ${d.accentHover}; }
          .cover-scroll-label {
            font-size: 1.5rem;
            font-weight: 400;
            line-height: 1.334;
            color: ${d.accentHover};
          }
          @keyframes cover-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .cover-scroll { animation: none; }
          }
          html[data-theme="dark"] .cover-section {
            color: ${m.textLight} !important;
            background-color: ${m.glassBg} !important;
          }
          html[data-theme="dark"] .cover-avatar {
            border-color: ${m.accent};
            background-color: ${m.glassBg};
          }
          html[data-theme="dark"] .cover-greeting { color: ${m.textHeading}; }
          html[data-theme="dark"] .cover-scroll,
          html[data-theme="dark"] .cover-scroll-icon,
          html[data-theme="dark"] .cover-scroll-label { color: ${m.accentHover}; }
        `})]}),n.jsx("div",{"aria-hidden":"true",style:{height:"100svh",minHeight:"100vh"}})]})},O=x.lazy(()=>H(()=>import("./AppShell-C_3zcJho.js").then(a=>a.g),__vite__mapDeps([0,1,2,3,4,5]))),A=j.createRoot(document.getElementById("root"));A.render(n.jsxs(x.StrictMode,{children:[n.jsx(_,{}),n.jsx(x.Suspense,{fallback:null,children:n.jsx(O,{})})]}));export{H as _,v as a,d as b,m as c,C as g,I as n,F as t};
