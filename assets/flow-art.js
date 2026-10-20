window.MelodyFlow=function(canvas,score){
 const riverLayer=document.createElement('canvas');
 const painting=new Image();painting.src=window.STARRY_PAINTING||'assets/starry-painting.png';
 const ctx=canvas.getContext('2d'),notes=score.notes,TAU=2*Math.PI;let hitTargets=[];
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),hash=n=>{let v=Math.sin(n*157.71+13.7)*43758.54;return v-Math.floor(v)};
 const noteName=p=>['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][p%12]+(Math.floor(p/12)-1);
 function draw(t,opts={}){
 const c=ctx,W=canvas.width,H=canvas.height,S=Math.min(W/1600,H/900),compact=W/H<.9;
 const left=W*.47,speed=W*(compact?.12:.068),pitchY=p=>H*(compact?.38:.43)-(p-70)*H*.021;
 hitTargets=[];c.globalCompositeOperation='source-over';c.globalAlpha=1;
 c.fillStyle='#0b1318';c.fillRect(0,0,W,H);let bg=c.createRadialGradient(W*.52,H*.45,0,W*.52,H*.45,W*.8);bg.addColorStop(0,'#163139');bg.addColorStop(.6,'#101e28');bg.addColorStop(1,'#0b1318');c.fillStyle=bg;c.fillRect(0,0,W,H);
 function glow(x,y,r,rgb,a){let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.3,`rgba(${rgb},${a*.25})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)}
 const phraseOf=n=>score.chords?.length?Math.max(0,score.chords.filter(ch=>ch.start<=n.start).length-1):Math.floor(n.start/4);
 // Display the supplied painting directly; ignore only its white screenshot margins.
 const iw=painting.naturalWidth||1588,ih=painting.naturalHeight||1588,sy=ih*.1,sh=ih*.8,scale=Math.min(W/iw,H/sh),dw=iw*scale,dh=sh*scale,ox=(W-dw)/2,oy=(H-dh)/2;
 c.fillStyle='#071127';c.fillRect(0,0,W,H);if(painting.complete&&painting.naturalWidth)c.drawImage(painting,0,sy,iw,sh,ox,oy,dw,dh);
 // Coordinates are anchored to the actual painted stars, not a random scatter.
 const stars=[[.105,.045],[.23,.032],[.344,.040],[.411,.065],[.614,.088],[.708,.231],[.912,.164],[.325,.326],[.354,.533],[.13,.48],[.24,.174]];
 function loc(n,at=t){const k=phraseOf(n),phase=(n.pitch%12)*TAU/12,cx=.22+(k%4)*.19,cy=.49+(Math.floor(k/4)%2)*.13,age=Math.max(0,at-n.start),drift=age*.022;return{x:ox+dw*(cx+Math.cos(phase)*.045+drift),y:oy+dh*(cy-(n.pitch-69)*.007+Math.sin(phase)*.025+Math.sin(age*.65+phase)*.018-Math.sin(phase)*.018-age*.0018)}}
 // Animate the painting's own pixels in feathered patches, keeping the canvas intact.
 const energy=notes.filter(n=>n.start<=t&&n.end>t).reduce((v,n)=>v+n.velocity/127,0);
 function livingPatch(nx,ny,nr,angle,zoom,opacity){if(!painting.complete||!painting.naturalWidth)return;const px=nx*iw,py=sy+ny*sh,rad=nr*iw,dx=ox+nx*dw,dy=oy+ny*dh,rr=rad*scale;
 c.save();c.translate(dx,dy);c.rotate(angle);c.scale(zoom,zoom);
 // Concentric clips blend rotation into the untouched surrounding brushwork.
 for(let j=0;j<8;j++){const outer=rr*(1-j*.0825),inner=rr*(1-(j+1)*.0825);c.save();c.beginPath();c.arc(0,0,outer,0,TAU);c.arc(0,0,Math.max(0,inner),0,TAU,true);c.clip('evenodd');c.globalAlpha=opacity*(j/7);c.drawImage(painting,px-rad,py-rad,rad*2,rad*2,-rr,-rr,rr*2,rr*2);c.restore()}
 c.save();c.beginPath();c.arc(0,0,rr*.34,0,TAU);c.clip();c.globalAlpha=opacity;c.drawImage(painting,px-rad,py-rad,rad*2,rad*2,-rr,-rr,rr*2,rr*2);c.restore();c.restore();}
 // One continuous feathered displacement field carries the whole painted river.
 if(painting.complete&&painting.naturalWidth){
 if(riverLayer.width!==W||riverLayer.height!==H){riverLayer.width=W;riverLayer.height=H;}const q=riverLayer.getContext('2d');q.clearRect(0,0,W,H);q.globalCompositeOperation='source-over';
 const bassEnergy=notes.filter(n=>n.role==='bass'&&n.start<=t&&n.end>t).reduce((a,n)=>a+n.velocity/127,0);
 for(let j=0;j<96;j++){const u=j/96,sw=iw/96,shift=Math.sin(u*TAU*1.6-t*1.0)*(7+3*bassEnergy)*Math.max(.6,S);q.drawImage(painting,u*iw,sy,sw+1,sh,ox+u*dw,oy+shift,dw/96+1,dh)}
 q.globalCompositeOperation='destination-in';q.lineWidth=dh*.24;q.lineCap='round';q.strokeStyle='#fff';q.shadowColor='#fff';q.shadowBlur=30*Math.max(.65,S);q.beginPath();q.moveTo(ox,oy+dh*.24);q.bezierCurveTo(ox+dw*.16,oy+dh*.43,ox+dw*.32,oy+dh*.03,ox+dw*.49,oy+dh*.24);q.bezierCurveTo(ox+dw*.69,oy+dh*.54,ox+dw*.70,oy+dh*.40,ox+dw,oy+dh*.42);q.stroke();q.shadowBlur=0;q.globalCompositeOperation='source-over';c.drawImage(riverLayer,0,0);
 }
 // The two main vortices move in opposite directions along the painted current.
 livingPatch(.51,.345,.19,t*.14,1,.8);
 livingPatch(.662,.472,.105,t*.17,1,.8);
 stars.forEach((a,k)=>{const related=notes.filter(n=>phraseOf(n)%stars.length===k&&n.start<=t&&n.end>t);const pulse=related.length?Math.min(1,related.length*.4):0;livingPatch(a[0],a[1],k===6?.082:.036,t*(.10+(k%3)*.025)+k*.18,1+.018*Math.sin(t*.8+k)+pulse*.018,.92);glow(ox+a[0]*dw,oy+a[1]*dh,(k===6?65:30)*Math.max(.65,S),'255,211,111',.035+.035*(.5+.5*Math.sin(t*.8+k))+pulse*.1)});
 // Secondary painted clusters rotate with the larger sky, at a quieter pace.
 [[.045,.455,.033],[.22,.79,.04],[.48,.80,.045],[.74,.76,.05],[.91,.76,.044],[.80,.90,.035]].forEach((a,k)=>livingPatch(a[0],a[1],a[2],t*(.07+k*.006),1,.55));
 // Continuous one-way brush dashes travel along the full river, not separate loops.
 const riverPoint=u=>{const xx=ox+dw*u,yy=oy+dh*(.29+.105*Math.sin(u*TAU*1.35+.3));return{x:xx,y:yy}};
 for(let lane=0;lane<14;lane++)for(let j=0;j<28;j++){const u=((j/28+t*.045+lane*.013)%1),v=Math.min(.999,u+.009),a=riverPoint(u),b=riverPoint(v),offset=(lane-6.5)*dh*.006;const edge=Math.min(1,u*12,(1-u)*12);c.strokeStyle=`rgba(${lane%4===0?'230,213,136':'160,208,210'},${edge*.30})`;c.lineWidth=(1.5+lane%3)*Math.max(.65,S);c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y+offset);c.lineTo(b.x,b.y+offset);c.stroke()}
 const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(3,10,25,.65)');shade.addColorStop(.24,'rgba(3,10,25,0)');shade.addColorStop(.68,'rgba(3,10,25,0)');shade.addColorStop(1,'rgba(3,10,25,.8)');c.fillStyle=shade;c.fillRect(0,0,W,H);
 const visible=notes.filter(n=>n.end>t-14&&n.start<t+5);const melody=visible.filter(n=>n.role==='melody');const leadSounding=notes.some(n=>n.role==='melody'&&n.start<=t&&n.end>t);const orchestral=notes.length>500;
 // Each note writes its own comet tail; length directly represents held duration.
 melody.forEach(n=>{const age=t-n.start,life=9+Math.min(4,(n.end-n.start)*2);if(age<0||age>life)return;const fade=clamp(1-age/life),trail=Math.min(age,.6+(n.end-n.start)*1.8);for(let j=1;j<=18;j++){const a=loc(n,t-trail+(j-1)/18*trail),b=loc(n,t-trail+j/18*trail);c.strokeStyle=`rgba(255,216,118,${fade*j/18*.7})`;c.lineWidth=(1+j/18*2)*Math.max(.65,S);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}});
 if(opts.mode==='score'){
  [66,69,73,76,78].forEach(p=>{let y=pitchY(p);c.strokeStyle='rgba(205,222,218,.08)';c.lineWidth=.7*S;c.beginPath();c.moveTo(W*.06,y);c.lineTo(W*.94,y);c.stroke();c.font=`${11*S}px monospace`;c.fillStyle='#a6bcb8';c.fillText(noteName(p),W*.025,y+4*S)})
 }
 visible.forEach((n,i)=>{
  let {x,y}=loc(n);if(x<-100||x>W+100)return;let age=t-n.start,active=age>=0&&t<n.end,mel=n.role==='melody';
  const rgb=mel?'239,201,103':n.role==='bass'?'103,158,186':'169,189,161',future=age<0;
  const a=future?.18+.16*clamp(1+age/8):clamp(1-age/14)*.95;
  const featured=mel||(orchestral&&!leadSounding);const durationX=Math.max(7*S,(n.end-n.start)*speed),r=(featured?9:5)*Math.max(.85,S);
  if(opts.mode!=='bloom'){
   c.strokeStyle=`rgba(${rgb},${a*(active?.7:.28)})`;c.lineWidth=(mel?3:2)*S;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+durationX,y);c.stroke();
   if(active){glow(left,y,39*S,rgb,.43);c.fillStyle='#fff1d4';c.beginPath();c.arc(left,y,3.1*S,0,TAU);c.fill()}
  }
  if(!future){glow(x,y,(featured?55:30)*Math.max(.85,S),rgb,a*.45);if(age<1.4){c.strokeStyle=`rgba(${rgb},${(1-age/1.4)*.45})`;c.lineWidth=.8*S;c.beginPath();c.arc(x,y,(6+age*25)*S,0,TAU);c.stroke()}}
  c.fillStyle=`rgba(${rgb},${a})`;c.beginPath();c.arc(x,y,r*(future?.7:1),0,TAU);c.fill();
  if((mel||(orchestral&&age<4))&&!future&&age<9+Math.min(4,(n.end-n.start)*2)){
   const size=(active?(featured?38:25):(featured?26:16))*Math.max(.85,S)*(1+.15*Math.sin(age*4)),fade=clamp(1-age/(9+Math.min(4,(n.end-n.start)*2)));c.save();c.translate(x,y);c.globalAlpha=fade;c.shadowColor='#ffd478';c.shadowBlur=26*Math.max(.65,S);c.fillStyle='#fff1b6';c.beginPath();for(let j=0;j<8;j++){const angle=j*TAU/8-Math.PI/2,rr=j%2?size*.21:size;if(j)c.lineTo(Math.cos(angle)*rr,Math.sin(angle)*rr);else c.moveTo(Math.cos(angle)*rr,Math.sin(angle)*rr)}c.closePath();c.fill();c.shadowBlur=0;c.strokeStyle='rgba(244,207,102,.6)';c.lineWidth=1.4*Math.max(.65,S);for(let j=0;j<3;j++){c.beginPath();c.ellipse(0,0,size*(1.2+j*.25),size*(.95+j*.19),age*.12+j*.3,0,TAU);c.stroke()}c.restore();
  }
  if(mel&&!future&&age<3){c.font=`${14*Math.max(.7,S)}px monospace`;c.shadowColor='#06142b';c.shadowBlur=5;c.fillStyle=`rgba(255,242,181,${1-age/3})`;c.fillText(noteName(n.pitch),x+15*S,y-22*S);c.shadowBlur=0;}
  if((opts.labels||opts.mode==='score')&&mel){c.font=`${12*S}px monospace`;c.fillStyle=`rgba(236,223,213,${Math.max(.35,a)})`;c.fillText(noteName(n.pitch),x-10*S,y-22*S)}
  hitTargets.push({x,y,pitch:n.pitch,time:n.start,role:n.role,r:22*S});
 });
 // The current melody's moving tip follows the actual note currently sounding.
 const active=notes.filter(n=>n.role==='melody'&&n.start<=t&&n.end>t);
 active.forEach(n=>{const p=loc(n),x=opts.mode==='bloom'?p.x:left;glow(x,p.y,65*S,'255,228,185',.22);for(let j=0;j<8;j++){let a=(t-n.start)*2+j*TAU/8,r=(9+((t-n.start)*24+j*5)%34)*S;c.fillStyle=`rgba(255,230,193,${.4*(1-r/(44*S))})`;c.beginPath();c.arc(x+Math.cos(a)*r,p.y+Math.sin(a)*r,.9*S,0,TAU);c.fill()}});
 if(opts.pointer){const p=opts.pointer;glow(p.x,p.y,80*S,'207,232,223',.12);let nearest=hitTargets.reduce((a,b)=>Math.hypot(b.x-p.x,b.y-p.y)<Math.hypot(a.x-p.x,a.y-p.y)?b:a,{x:-9999,y:-9999});if(Math.hypot(nearest.x-p.x,nearest.y-p.y)<65*S){c.strokeStyle='#f4dfbd';c.lineWidth=S;c.beginPath();c.arc(nearest.x,nearest.y,13*S,0,TAU);c.stroke();c.font=`${13*S}px monospace`;c.fillStyle='#f4dfbd';c.fillText(noteName(nearest.pitch)+' · click to hear',nearest.x+18*S,nearest.y-16*S)}}
 (opts.touches||[]).forEach(p=>{let age=p.age;if(age>=0&&age<2){glow(p.x,p.y,(35+age*50)*S,'255,224,187',.25*(1-age/2));for(let k=0;k<3;k++){c.strokeStyle=`rgba(255,224,187,${.45*(1-age/2)})`;c.lineWidth=S;c.beginPath();c.arc(p.x,p.y,(10+age*45+k*12)*S,0,TAU);c.stroke()}}});
 return {active:active.map(n=>noteName(n.pitch)),hitTargets};
 }
 return{draw,get hits(){return hitTargets},noteName};
};
