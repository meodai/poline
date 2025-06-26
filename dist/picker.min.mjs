var w=(e,t)=>{let[o,n,i]=e,c=.5,l=.5,r=Math.atan2(n-l,o-c)*(180/Math.PI);r=(360+r)%360;let a=i,d=Math.sqrt(Math.pow(n-l,2)+Math.pow(o-c,2))/c;return[r,a,t?1-d:d]},b=(e,t)=>{let[o,n,i]=e,c=.5,l=.5,s=o/(180/Math.PI),r=(t?1-i:i)*c,a=c+r*Math.cos(s),u=l+r*Math.sin(s);return[a,u,n]},_=(e=Math.random()*360,t=[Math.random(),Math.random()],o=[.75+Math.random()*.2,.3+Math.random()*.2])=>[[e,t[0],o[0]],[(e+60+Math.random()*180)%360,t[1],o[1]]];var F=(e,t,o,n=!1,i=(s,r)=>r?1-s:s,c=(s,r)=>r?1-s:s,l=(s,r)=>r?1-s:s)=>{let s=i(e,n),r=c(e,n),a=l(e,n),u=(1-s)*t[0]+s*o[0],d=(1-r)*t[1]+r*o[1],x=(1-a)*t[2]+a*o[2];return[u,d,x]},y=(e,t,o=4,n=!1,i=(s,r)=>r?1-s:s,c=(s,r)=>r?1-s:s,l=(s,r)=>r?1-s:s)=>{let s=[];for(let r=0;r<o;r++){let[a,u,d]=F(r/(o-1),e,t,n,i,c,l);s.push([a,u,d])}return s},A=e=>e,S=(e,t=!1)=>t?1-(1-e)**2:e**2,M=(e,t=!1)=>t?1-(1-e)**3:e**3,V=(e,t=!1)=>t?1-(1-e)**4:e**4,L=(e,t=!1)=>t?1-(1-e)**5:e**5,p=(e,t=!1)=>t?1-Math.sin((1-e)*Math.PI/2):Math.sin(e*Math.PI/2),E=(e,t=!1)=>t?1-Math.asin(1-e)/(Math.PI/2):Math.asin(e)/(Math.PI/2),k=(e,t=!1)=>t?1-Math.sqrt(1-e**2):1-Math.sqrt(1-e),z=e=>e**2*(3-2*e),G={linearPosition:A,exponentialPosition:S,quadraticPosition:M,cubicPosition:V,quarticPosition:L,sinusoidalPosition:p,asinusoidalPosition:E,arcPosition:k,smoothStepPosition:z},C=(e,t,o=!1)=>{let n=e[0],i=t[0],c=0;o&&n!==null&&i!==null?(c=Math.min(Math.abs(n-i),360-Math.abs(n-i)),c=c/360):c=n===null||i===null?0:n-i;let l=c,s=e[1]===null||t[1]===null?0:t[1]-e[1],r=e[2]===null||t[2]===null?0:t[2]-e[2];return Math.sqrt(l*l+s*s+r*r)},f=class{constructor({xyz:t,color:o,invertedLightness:n=!1}={}){this.x=0;this.y=0;this.z=0;this.color=[0,0,0];this._invertedLightness=!1;this._invertedLightness=n,this.positionOrColor({xyz:t,color:o,invertedLightness:n})}positionOrColor({xyz:t,color:o,invertedLightness:n=!1}){if(t&&o||!t&&!o)throw new Error("Point must be initialized with either x,y,z or hsl");t?(this.x=t[0],this.y=t[1],this.z=t[2],this.color=w([this.x,this.y,this.z],n)):o&&(this.color=o,[this.x,this.y,this.z]=b(o,n))}set position([t,o,n]){this.x=t,this.y=o,this.z=n,this.color=w([this.x,this.y,this.z],this._invertedLightness)}get position(){return[this.x,this.y,this.z]}set hsl([t,o,n]){this.color=[t,o,n],[this.x,this.y,this.z]=b(this.color,this._invertedLightness)}get hsl(){return this.color}get hslCSS(){let[t,o,n]=this.color;return`hsl(${t.toFixed(2)}, ${(o*100).toFixed(2)}%, ${(n*100).toFixed(2)}%)`}get oklchCSS(){let[t,o,n]=this.color;return`oklch(${(n*100).toFixed(2)}% ${(o*.4).toFixed(3)} ${t.toFixed(2)})`}get lchCSS(){let[t,o,n]=this.color;return`lch(${(n*100).toFixed(2)}% ${(o*150).toFixed(2)} ${t.toFixed(2)})`}shiftHue(t){this.color[0]=(360+(this.color[0]+t))%360,[this.x,this.y,this.z]=b(this.color,this._invertedLightness)}},m=class{constructor({anchorColors:t=_(),numPoints:o=4,positionFunction:n=p,positionFunctionX:i,positionFunctionY:c,positionFunctionZ:l,closedLoop:s,invertedLightness:r}={anchorColors:_(),numPoints:4,positionFunction:p,closedLoop:!1}){this._needsUpdate=!0;this._positionFunctionX=p;this._positionFunctionY=p;this._positionFunctionZ=p;this.connectLastAndFirstAnchor=!1;this._animationFrame=null;this._invertedLightness=!1;if(!t||t.length<2)throw new Error("Must have at least two anchor colors");this._anchorPoints=t.map(a=>new f({color:a,invertedLightness:r})),this._numPoints=o+2,this._positionFunctionX=i||n||p,this._positionFunctionY=c||n||p,this._positionFunctionZ=l||n||p,this.connectLastAndFirstAnchor=s||!1,this._invertedLightness=r||!1,this.updateAnchorPairs()}get numPoints(){return this._numPoints-2}set numPoints(t){if(t<1)throw new Error("Must have at least one point");this._numPoints=t+2,this.updateAnchorPairs()}set positionFunction(t){if(Array.isArray(t)){if(t.length!==3)throw new Error("Position function array must have 3 elements");if(typeof t[0]!="function"||typeof t[1]!="function"||typeof t[2]!="function")throw new Error("Position function array must have 3 functions");this._positionFunctionX=t[0],this._positionFunctionY=t[1],this._positionFunctionZ=t[2]}else this._positionFunctionX=t,this._positionFunctionY=t,this._positionFunctionZ=t;this.updateAnchorPairs()}get positionFunction(){return this._positionFunctionX===this._positionFunctionY&&this._positionFunctionX===this._positionFunctionZ?this._positionFunctionX:[this._positionFunctionX,this._positionFunctionY,this._positionFunctionZ]}set positionFunctionX(t){this._positionFunctionX=t,this.updateAnchorPairs()}get positionFunctionX(){return this._positionFunctionX}set positionFunctionY(t){this._positionFunctionY=t,this.updateAnchorPairs()}get positionFunctionY(){return this._positionFunctionY}set positionFunctionZ(t){this._positionFunctionZ=t,this.updateAnchorPairs()}get positionFunctionZ(){return this._positionFunctionZ}get anchorPoints(){return this._anchorPoints}set anchorPoints(t){this._anchorPoints=t,this.updateAnchorPairs()}updateAnchorPairs(){this._anchorPairs=[];let t=this.connectLastAndFirstAnchor?this.anchorPoints.length:this.anchorPoints.length-1;for(let o=0;o<t;o++){let n=[this.anchorPoints[o],this.anchorPoints[(o+1)%this.anchorPoints.length]];this._anchorPairs.push(n)}this.points=this._anchorPairs.map((o,n)=>{let i=o[0]?o[0].position:[0,0,0],c=o[1]?o[1].position:[0,0,0];return y(i,c,this._numPoints,!!(n%2),this.positionFunctionX,this.positionFunctionY,this.positionFunctionZ).map(l=>new f({xyz:l,invertedLightness:this._invertedLightness}))})}addAnchorPoint({xyz:t,color:o,insertAtIndex:n}){let i=new f({xyz:t,color:o,invertedLightness:this._invertedLightness});return n!==void 0?this.anchorPoints.splice(n,0,i):this.anchorPoints.push(i),this.updateAnchorPairs(),i}removeAnchorPoint({point:t,index:o}){if(!t&&o===void 0)throw new Error("Must provide a point or index");if(this.anchorPoints.length<3)throw new Error("Must have at least two anchor points");let n;if(o!==void 0?n=o:t&&(n=this.anchorPoints.indexOf(t)),n>-1&&n<this.anchorPoints.length)this.anchorPoints.splice(n,1),this.updateAnchorPairs();else throw new Error("Point not found")}updateAnchorPoint({point:t,pointIndex:o,xyz:n,color:i}){if(o!==void 0&&(t=this.anchorPoints[o]),!t)throw new Error("Must provide a point or pointIndex");if(!n&&!i)throw new Error("Must provide a new xyz position or color");return n&&(t.position=n),i&&(t.hsl=i),this.updateAnchorPairs(),t}getClosestAnchorPoint({xyz:t,hsl:o,maxDistance:n=1}){if(!t&&!o)throw new Error("Must provide a xyz or hsl");let i;t?i=this.anchorPoints.map(s=>C(s.position,t)):o&&(i=this.anchorPoints.map(s=>C(s.hsl,o,!0)));let c=Math.min(...i);if(c>n)return null;let l=i.indexOf(c);return this.anchorPoints[l]||null}set closedLoop(t){this.connectLastAndFirstAnchor=t,this.updateAnchorPairs()}get closedLoop(){return this.connectLastAndFirstAnchor}set invertedLightness(t){this._invertedLightness=t,this.updateAnchorPairs()}get invertedLightness(){return this._invertedLightness}get flattenedPoints(){return this.points.flat().filter((t,o)=>o!=0?o%this._numPoints:!0)}get colors(){let t=this.flattenedPoints.map(o=>o.color);return this.connectLastAndFirstAnchor&&t.pop(),t}cssColors(t="hsl"){let o={hsl:i=>i.hslCSS,oklch:i=>i.oklchCSS,lch:i=>i.lchCSS},n=this.flattenedPoints.map(o[t]);return this.connectLastAndFirstAnchor&&n.pop(),n}get colorsCSS(){return this.cssColors("hsl")}get colorsCSSlch(){return this.cssColors("lch")}get colorsCSSoklch(){return this.cssColors("oklch")}shiftHue(t=20){this.anchorPoints.forEach(o=>o.shiftHue(t)),this.updateAnchorPairs()}},{p5:P}=globalThis;if(P){console.info("p5 detected, adding poline to p5 prototype");let e=new m;P.prototype.poline=e;let t=()=>e.colors.map(o=>`hsl(${Math.round(o[0])},${o[1]*100}%,${o[2]*100}%)`);P.prototype.polineColors=t,P.prototype.registerMethod("polineColors",P.prototype.polineColors),globalThis.poline=e,globalThis.polineColors=t}var g="http://www.w3.org/2000/svg",h=100,v=class extends HTMLElement{constructor(){super();this.currentPoint=null;this.allowAddPoints=!1;this.attachShadow({mode:"open"}),this.interactive=this.hasAttribute("interactive"),this.allowAddPoints=this.hasAttribute("allow-add-points")}connectedCallback(){this.render(),this.interactive&&this.addEventListeners()}setPoline(o){this.poline=o,this.updateSVG(),this.updateLightnessBackground()}setAllowAddPoints(o){this.allowAddPoints=o}addPointAtPosition(o,n){if(!this.poline)return null;let i=o/this.svg.clientWidth,c=n/this.svg.clientHeight,l=this.poline.addAnchorPoint({xyz:[i,c,c]});return this.updateSVG(),this.dispatchEvent(new CustomEvent("poline-change",{detail:{poline:this.poline}})),l}updateLightnessBackground(){let o=this.shadowRoot?.querySelector(".picker");o&&this.poline&&(this.poline.invertedLightness?(o.style.setProperty("--maxL","#202125"),o.style.setProperty("--minL","#fff")):(o.style.setProperty("--maxL","#fff"),o.style.setProperty("--minL","#000")))}render(){if(!this.shadowRoot)return;this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: inline-block;
          width: 200px;
          height: 200px;
          position: relative;
        }
        .picker {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          --s: .4;
          --l: .5;
          --minL: #000;
          --maxL: #fff;
          --grad: #ff0000 0deg, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg;
        }
        .picker::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(closest-side, var(--minL), rgba(255, 255, 255, 0), var(--maxL)), 
                      conic-gradient(from 90deg, var(--grad));
          z-index: 1;
        }
        svg {
          position: relative;
          z-index: 2;
          overflow: visible !important;
          width: 100%;
        }
        .wheel__line {
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: 0.15;
          fill: none;
        }
        .wheel__anchor {
          cursor: grab;
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: 0.2;
          fill: var(--poline-picker-bg-color, #fff);
        }
        .wheel__anchor:hover {
          cursor: grabbing;
        }
        .wheel__bg {
          stroke-width: 10;
          fill: transparent;
        }
        .wheel__point {
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: 0.15;
          pointer-events: none;
        }
      </style>
    `,this.svg=this.createSVG();let o=document.createElement("div");o.className="picker",o.appendChild(this.svg),this.shadowRoot.appendChild(o),this.wheel=this.svg.querySelector(".wheel"),this.line=this.svg.querySelector(".wheel__line"),this.anchors=this.svg.querySelector(".wheel__anchors"),this.points=this.svg.querySelector(".wheel__points"),this.poline&&this.updateSVG()}createSVG(){let o=document.createElementNS(g,"svg");return o.setAttribute("viewBox",`0 0 ${h} ${h}`),o.innerHTML=`
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
      <g class="wheel" filter="url(#goo)">
        <polyline class="wheel__line" points="" />
        <g class="wheel__anchors"></g>
        <g class="wheel__points"></g>
      </g>
    `,o}updateSVG(){if(!this.poline||!this.svg)return;let o=this.poline.flattenedPoints.map(n=>{let i=this.pointToCartesian(n);if(!i)return"";let[c,l]=i;return`${c},${l}`}).filter(n=>n!=="").join(" ");this.line.setAttribute("points",o),this.anchors.innerHTML="",this.points.innerHTML="",this.poline.anchorPoints.forEach(n=>{let i=this.pointToCartesian(n);if(!i)return;let[c=0,l=0]=i,s=document.createElementNS(g,"circle");s.setAttribute("class","wheel__anchor"),s.setAttribute("cx",c.toString()),s.setAttribute("cy",l.toString()),s.setAttribute("r","2"),s.setAttribute("fill",n.hslCSS),this.anchors.appendChild(s)}),this.poline.flattenedPoints.forEach(n=>{if(this.poline.anchorPoints.some(u=>u.x===n.x&&u.y===n.y&&u.z===n.z))return;let c=this.pointToCartesian(n);if(!c)return;let[l=0,s=0]=c,r=document.createElementNS(g,"circle");r.setAttribute("class","wheel__point"),r.setAttribute("cx",l.toString()),r.setAttribute("cy",s.toString());let a=.5+n.color[1];r.setAttribute("r",a.toString()),r.setAttribute("fill",n.hslCSS),this.points.appendChild(r)})}pointToCartesian(o){let n=h/2,i=n+(o.x-.5)*h,c=n+(o.y-.5)*h;return[i,c]}addEventListeners(){this.svg.addEventListener("pointerdown",o=>{o.stopPropagation();let n=this.svg.getBoundingClientRect(),i=(o.clientX-n.left)/n.width*h,c=(o.clientY-n.top)/n.height*h,l=i/h,s=c/h,r=this.poline.getClosestAnchorPoint({xyz:[l,s,null],maxDistance:.1});r?this.currentPoint=r:this.allowAddPoints&&(this.currentPoint=this.poline.addAnchorPoint({xyz:[l,s,s]}),this.updateSVG(),this.dispatchEvent(new CustomEvent("poline-change",{detail:{poline:this.poline}})))}),this.svg.addEventListener("pointermove",o=>{if(this.currentPoint){let n=this.svg.getBoundingClientRect(),i=(o.clientX-n.left)/n.width*h,c=(o.clientY-n.top)/n.height*h,l=i/h,s=c/h;this.poline.updateAnchorPoint({point:this.currentPoint,xyz:[l,s,this.currentPoint.z]}),this.updateSVG(),this.dispatchEvent(new CustomEvent("poline-change",{detail:{poline:this.poline}}))}}),this.svg.addEventListener("pointerup",()=>{this.currentPoint=null})}getPointerPosition(o){let n=this.svg.getBoundingClientRect();return{x:o.clientX-n.left,y:o.clientY-n.top}}};customElements.define("poline-picker",v);export{m as Poline,v as PolinePicker,G as positionFunctions};
