/* ================= UTILITÁRIOS ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)');
let nomotion=RM.matches;
if(nomotion){document.body.classList.add('nomotion');$('#motionBtn').setAttribute('aria-pressed','true');}
const motionOK=()=>!nomotion;
const fmt=(n,d=1)=>n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const hcOn=()=>document.body.classList.contains('hc');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function wl2rgb(w){let r,g,b;
  if(w<440){r=(440-w)/60;g=0;b=1}else if(w<490){r=0;g=(w-440)/50;b=1}
  else if(w<510){r=0;g=1;b=(510-w)/20}else if(w<580){r=(w-510)/70;g=1;b=0}
  else if(w<645){r=1;g=(645-w)/65;b=0}else{r=1;g=0;b=0}
  return `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;}
function scramble(el){const fin=el.dataset.text||el.textContent;el.dataset.text=fin;
  if(!motionOK()){el.textContent=fin;return}
  const ch='☀◣◢#%/<>*+=0123456789';let f=0,tot=fin.length*3+22;
  (function st(){f++;el.textContent=fin.split('').map((c,i)=>c===' '?' ':(i<(f-8)/2?c:ch[Math.random()*ch.length|0])).join('');
   if(f<tot)requestAnimationFrame(st);else el.textContent=fin})();}

/* ================= ACESSIBILIDADE: TOOLBAR ================= */
const scales=[.9,1,1.12,1.28]; let fsIdx=1;
function applyFont(){document.documentElement.style.fontSize=(100*scales[fsIdx])+'%';}
$('#fontPlus').addEventListener('click',()=>{fsIdx=Math.min(scales.length-1,fsIdx+1);applyFont();});
$('#fontMinus').addEventListener('click',()=>{fsIdx=Math.max(0,fsIdx-1);applyFont();});
$('#contrastBtn').addEventListener('click',e=>{
  const on=document.body.classList.toggle('hc');
  e.currentTarget.setAttribute('aria-pressed',on);
});
$('#motionBtn').addEventListener('click',e=>{
  nomotion=!nomotion;
  document.body.classList.toggle('nomotion',nomotion);
  e.currentTarget.setAttribute('aria-pressed',nomotion);
});

/* ================= MENU MOBILE ================= */
const hamb=$('#hambBtn'),nav=$('#mainnav');
hamb.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  hamb.setAttribute('aria-expanded',open);
});
nav.addEventListener('click',e=>{ if(e.target.tagName==='A'){nav.classList.remove('open');hamb.setAttribute('aria-expanded','false');} });

/* ================= SCRAMBLE DO TÍTULO ================= */
(function(){
  const el=$('#scrambleTitle'),final=el.dataset.text;
  if(!motionOK()){el.textContent=final;return;}
  const chars='☀#%&/<>*+=ABCDEFG0123456789';let f=0,total=final.length*4+26;
  (function step(){f++;
    el.textContent=final.split('').map((c,i)=>c===' '||c==='·'?c:(i<(f-10)/2?c:chars[Math.random()*chars.length|0])).join('');
    if(f<total)requestAnimationFrame(step);else el.textContent=final;
  })();
})();

/* ================= TELEMETRIA DO PAINEL ================= */
const telem={pool:30.6,coll:46,irr:812,flow:5.4,pump:true,auto:true,hist:[]};
const spark=$('#spark'),sctx=spark.getContext('2d');
function drawSpark(){
  const w=spark.width=spark.clientWidth*2,h=spark.height=112;
  sctx.clearRect(0,0,w,h);
  const data=telem.hist;if(data.length<2)return;
  const min=24,max=42;
  sctx.strokeStyle=hcOn()?'#ffd23f':'#f5a71c';sctx.lineWidth=3;sctx.beginPath();
  data.forEach((v,i)=>{const x=i/(data.length-1)*w,y=h-(v-min)/(max-min)*h;i?sctx.lineTo(x,y):sctx.moveTo(x,y);});
  sctx.stroke();
}
function tickTelem(){
  if(telem.auto) telem.pump=(telem.coll-telem.pool)>4;
  telem.irr=Math.max(300,Math.min(980,telem.irr+(Math.random()*80-40)));
  const difrBonus=1.18;
  const target=telem.pump?(telem.pool+17)*difrBonus:telem.irr/14+26;
  telem.coll+=(target-telem.coll)*.14;
  telem.pool+= telem.pump? .036 : -.015;
  telem.flow=telem.pump? 5.2+Math.random()*.5 : 0;
  telem.hist.push(telem.pool); if(telem.hist.length>42)telem.hist.shift();
  $('#pPool').textContent=fmt(telem.pool);$('#pColl').textContent=fmt(telem.coll);
  $('#pIrr').textContent=Math.round(telem.irr);$('#pFlow').textContent=fmt(telem.flow);
  $('#pumpState').textContent=telem.pump?'LIGADA':'DESLIGADA';
  $('#pumpIcon').classList.toggle('on',telem.pump);
  $('#panelMode').textContent=telem.auto?'AUTO':'MANUAL';
  drawSpark();
}
for(let i=0;i<40;i++)telem.hist.push(30+Math.sin(i/5)*.4);
setInterval(tickTelem,2000);tickTelem();
$('#btnMode').addEventListener('click',()=>{telem.auto=!telem.auto;});
$('#btnPump').addEventListener('click',()=>{telem.auto=false;telem.pump=!telem.pump;});

/* ================= SCROLL: PROGRESSO + SOL + SPY + REVEAL ================= */
const bar=$('#progressBar'),sun=$('#sunDot');
addEventListener('scroll',()=>{requestAnimationFrame(()=>{
  const p=scrollY/(document.documentElement.scrollHeight-innerHeight||1);
  bar.style.width=(p*100)+'%';
  sun.style.left=(6+p*86)+'%';sun.style.top=(88-34*Math.sin(p*Math.PI))+'px';
});},{passive:true});
const spy=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting)$$('.topbar nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
}),{rootMargin:'-42% 0px -52% 0px'});
$$('main section[id]').forEach(s=>spy.observe(s));
const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target);}}),{threshold:.12});
$$('.rv, .lm').forEach(el=>rv.observe(el));

/* ================= CONTADORES ================= */
const cnt=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cnt.unobserve(e.target);
  const el=e.target,to=+el.dataset.to;
  if(!motionOK()||to===0){el.textContent=to.toLocaleString('pt-BR');return;}
  const t0=performance.now();
  (function run(t){const k=Math.min(1,(t-t0)/1500),v=Math.round(to*(1-Math.pow(1-k,3)));
    el.textContent=v.toLocaleString('pt-BR');if(k<1)requestAnimationFrame(run);})(t0);
}),{threshold:.6});
$$('.count').forEach(el=>cnt.observe(el));

/* ================= DIAGRAMA INTERATIVO ================= */
const dInfo={
  coletor:['Coletores solares com grade de difração','Chapas metálicas pretas (alta absorção α ≈ 0,95), cobertas por uma grade de difração (ranhuras microscópicas de ~1,6 µm, como num CD) e por vidro. A grade redireciona a luz incidente para dentro da placa, concentrando a energia antes que escape por reflexão. Inclinação ≈ latitude local para incidência quase perpendicular.'],
  bomba:['Bomba de circulação','Movimenta a água da piscina até os coletores e de volta. É comandada pelo controlador e só funciona quando existe calor útil disponível — ligá-la sem ΔT suficiente desperdiçaria eletricidade.'],
  filtro:['Filtro','Retém impurezas da água antes dos coletores, protegendo os tubos finos contra entupimento. Aproveita o mesmo circuito já existente de tratamento da piscina.'],
  valvula:['Válvula de 3 vias','Direciona o fluxo. À noite, fecha o circuito dos coletores para impedir o termossifão reverso — situação em que a água quente da piscina subiria, esfriaria na placa fria e retornaria, roubando calor.'],
  sensores:['Sensores T1 e T2','Dois DS18B20 à prova d\'água: T1 mede a temperatura na saída da piscina e T2 no coletor. A diferença ΔT = T2 − T1 é o coração da lógica de decisão.'],
  piscina:['Piscina térmica','O "reservatório" de calor. A capa térmica reduz drasticamente a perda por evaporação (≈ 70% das perdas totais), multiplicando o efeito do aquecimento solar e da grade difratora.'],
  controlador:['Controlador (Arduino)','Lê os sensores a cada ciclo, aplica a lógica com histerese, aciona relé, bomba e válvula e registra os dados que alimentam o painel deste site.']
};
$$('.dnode').forEach(n=>{
  const act=()=>{
    $$('.dnode').forEach(x=>x.classList.remove('sel'));n.classList.add('sel');
    const[title,desc]=dInfo[n.dataset.id];
    $('#dTitle').textContent=title;$('#dDesc').textContent=desc;
  };
  n.addEventListener('click',act);
  n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
});

/* ================= TESTE DE MATERIAIS ================= */
const materiais=[
  {nome:'Chapa preta fosca (tinta seletiva)',abs:95,refl:4,nota:'🏆 Excelente: quase toda a luz vira calor. O padrão ideal para coletores — a tinta seletiva absorve no visível e emite pouco infravermelho.'},
  {nome:'Chapa preta + grade de difração',abs:99,refl:1,nota:'🏆🏆 Padrão HÉLIOS·CEP: a grade difrata a luz incidente para dentro da placa, reduzindo reflexões e elevando absorção efetiva acima de 99%.'},
  {nome:'Galvanizada pintada de preto',abs:88,refl:12,nota:'Muito boa e barata: solução acessível para protótipos escolares, com pequena perda por reflexão difusa.'},
  {nome:'Alumínio pintado de branco',abs:21,refl:79,nota:'Ruim para aquecer: o branco devolve quase todo o "disco de Newton" — é por isso que telhados brancos refrescam ambientes.'},
  {nome:'Espelho de vidro prateado',abs:6,refl:94,nota:'Péssimo como absorvedor: reflete praticamente todas as cores. Só seria útil para redirecionar luz a outra placa.'}
];
const chipsBox=$('#matChips');
materiais.forEach((m,i)=>{
  const b=document.createElement('button');
  b.textContent=m.nome;b.setAttribute('aria-pressed',i===0);
  b.addEventListener('click',()=>{
    chipsBox.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');setMat(m);
  });
  chipsBox.appendChild(b);
});
function setMat(m){
  $('#barAbs').style.width=m.abs+'%';$('#barRefl').style.width=m.refl+'%';
  $('#absVal').textContent=m.abs+'%';$('#reflVal').textContent=m.refl+'%';
  $('#matVerdict').innerHTML=`<strong>${m.nome} —</strong> ${m.nota}`;
}
setMat(materiais[0]);

/* ================= DISCO DE NEWTON ================= */
const disk=$('#newtonDisk'),blend=$('#newtonBlend'),nSpeed=$('#newtonSpeed'),nLabel=$('#newtonLabel');
let diskSpd=0,ang=0;
function diskLoop(){
  if(motionOK()){ang=(ang+diskSpd*1.6)%360;disk.style.transform=`rotate(${ang}deg)`;}
  blend.style.opacity=Math.max(0,Math.min(1,(diskSpd-4.5)/5)).toFixed(2);
  requestAnimationFrame(diskLoop);
}
requestAnimationFrame(diskLoop);
function diskText(){
  nLabel.textContent=diskSpd===0?'Parado — sete cores nítidas.':
    diskSpd<5?`Girando (${diskSpd}×) — as bordas começam a se misturar…`:
    `Alta rotação (${diskSpd}×): a persistência retiniana soma as cores — vemos BRANCO!`;
}
nSpeed.addEventListener('input',()=>{diskSpd=+nSpeed.value;diskText();});
$('#btnSpinFast').addEventListener('click',()=>{nSpeed.value=10;diskSpd=10;diskText();});

/* ================= CÂMARA ESCURA ================= */
const camDist=$('#camDist'),camObj=$('#camObj'),camImg=$('#camImg'),camR1=$('#camRay1'),camR2=$('#camRay2'),camRead=$('#camReadout');
const PX=392,PY=165,OBJ_H=70,IMG_X=640;
function camUpdate(){
  const d=+camDist.value, doPx=d*88, x=PX-doPx;
  const hi=OBJ_H*(0.2/d), s=hi/OBJ_H;
  camObj.setAttribute('transform',`translate(${x},${PY})`);
  camImg.setAttribute('transform',`translate(${IMG_X+12},${PY}) scale(${s},${s})`);
  const yTop=PY-OBJ_H, yAfter=PY+OBJ_H*((IMG_X-PX)/doPx);
  camR1.setAttribute('x1',x);camR1.setAttribute('y1',yTop);
  camR1.setAttribute('x2',IMG_X+20);camR1.setAttribute('y2',yAfter);
  camR2.setAttribute('x1',x);camR2.setAttribute('x2',IMG_X+20);
  const iCm=30*0.2/d;
  camRead.textContent=`i = o · (dᵢ/dₒ) = 30 · (0,2/${fmt(d)}) ≈ ${fmt(iCm)} cm ${d<1.4?'— perto: imagem MAIOR':'— longe: imagem MENOR'}`;
}
camDist.addEventListener('input',camUpdate);camUpdate();

/* sub-nav de óptica */
const optSpy=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting)$$('.opt-side nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));
}),{rootMargin:'-30% 0px -60% 0px'});
$$('.opt-block').forEach(b=>optSpy.observe(b));

/* ================= DISPERSÃO (PRISMA) ================= */
const prism={x:430,y:200};let dispers=false;
const raysG=$('#raysG'),SVG=$('#prismSvg');
const RAYC=['#ff4d3d','#ff9f1c','#ffe14d','#3ddc84','#38a3ff','#b06bff'];
const RAYN=['vermelho','laranja','amarelo','verde','azul','violeta'];
RAYC.forEach((c,i)=>{
  const l=document.createElementNS('http://www.w3.org/2000/svg','line');
  l.setAttribute('class','rayline');l.setAttribute('stroke',c);l.setAttribute('stroke-width','5');
  l.style.color=c;l.dataset.i=i;raysG.appendChild(l);
  const h=document.createElementNS('http://www.w3.org/2000/svg','line');
  h.setAttribute('class','hitline');h.dataset.i=i;
  h.setAttribute('role','button');h.setAttribute('tabindex','0');
  h.setAttribute('aria-label','Cor '+RAYN[i]+'. Clique para explicar a separação.');
  h.addEventListener('click',()=>rayExplain(i));
  h.addEventListener('keydown',e=>{if(e.key==='Enter')rayExplain(i)});
  raysG.appendChild(h);
});
function rayExplain(i){
  const extra=i>=4?'O violeta é o que MAIS se desvia.':i<=1?'O vermelho é o que MENOS se desvia.':'Cada cor desvia um pouco diferente.';
  $('#p2fb').className='fb ok';
  $('#p2fb').innerHTML=`<strong>Por que ela se separou?</strong> Cada comprimento de onda sofre um desvio diferente ao atravessar o material do prisma. Esse fenômeno é chamado de <strong>dispersão luminosa</strong>. ${extra}`;
}
function renderPrism(){
  $('#prismPoly').setAttribute('points',`${prism.x},${prism.y-52} ${prism.x+50},${prism.y+38} ${prism.x-50},${prism.y+38}`);
  $('#beamIn').setAttribute('x2',prism.x-8);$('#beamIn').setAttribute('y2',prism.y);
  const ey=prism.y+6,tilt=(prism.y-200)*.5;
  if(dispers){
    $('#beamOut').style.display='none';
    const lines=raysG.querySelectorAll('line');
    for(let i=0;i<6;i++){
      const yEnd=ey+tilt+(i-2.5)*52+(prism.x-430)*.06;
      const x2=880,y2=Math.max(20,Math.min(380,yEnd));
      lines[i*2].setAttribute('x1',prism.x+30);lines[i*2].setAttribute('y1',ey);
      lines[i*2].setAttribute('x2',x2);lines[i*2].setAttribute('y2',y2);
      lines[i*2+1].setAttribute('x1',prism.x+30);lines[i*2+1].setAttribute('y1',ey);
      lines[i*2+1].setAttribute('x2',x2);lines[i*2+1].setAttribute('y2',y2);
    }
  }else{
    raysG.style.display='none';$('#beamOut').style.display='';
    $('#beamOut').setAttribute('x1',prism.x+30);$('#beamOut').setAttribute('y1',ey);
    $('#beamOut').setAttribute('x2',880);$('#beamOut').setAttribute('y2',Math.max(20,Math.min(380,ey+tilt+12)));
  }
  if(dispers)raysG.style.display='';
}
$('#btnDispers').addEventListener('click',e=>{
  dispers=!dispers;e.currentTarget.setAttribute('aria-pressed',dispers);
  e.currentTarget.textContent=dispers?'[ DESATIVAR DISPERSÃO ]':'[ ATIVAR DISPERSÃO ]';
  $('#p2fb').className='fb';
  $('#p2fb').textContent=dispers?'Branco → Vermelho → Laranja → Amarelo → Verde → Azul → Violeta. Clique em uma cor! 🌈':'Com a dispersão desligada, a luz branca apenas atravessa o prisma.';
  renderPrism();
});
let dragP=false;
const svgPt=e=>{const p=SVG.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(SVG.getScreenCTM().inverse());};
$('#prismG').addEventListener('pointerdown',e=>{dragP=true;$('#prismG').setPointerCapture(e.pointerId);});
SVG.addEventListener('pointermove',e=>{if(!dragP)return;const p=svgPt(e);
  prism.x=Math.max(250,Math.min(680,p.x));prism.y=Math.max(110,Math.min(300,p.y));renderPrism();});
addEventListener('pointerup',()=>dragP=false);
$('#prismG').addEventListener('keydown',e=>{
  const d={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];
  if(d){e.preventDefault();prism.x=Math.max(250,Math.min(680,prism.x+d[0]));prism.y=Math.max(110,Math.min(300,prism.y+d[1]));renderPrism();}});
renderPrism();

/* ================= DIFRAÇÃO (FENDA) ================= */
const sc=$('#slitCanvas'),sx=sc.getContext('2d');
function sizeSC(){sc.width=sc.clientWidth*2;sc.height=300*2;}
addEventListener('resize',()=>{sizeSC();drawSlit(performance.now())});
function drawSlit(t){
  sizeSC();const w=sc.width,h=sc.height,bx=w*.42,cy=h/2,slit=(+$('#slitSlider').value)/150;
  const gap=20+slit*(h*.55);
  sx.clearRect(0,0,w,h);
  const speed=motionOK()?t*.12:t*.0+40;
  sx.strokeStyle='rgba(150,220,255,.8)';sx.lineWidth=3;
  for(let x=((speed)%70);x<bx-8;x+=70){sx.beginPath();sx.moveTo(x,20);sx.lineTo(x,h-20);sx.stroke();}
  sx.fillStyle='#1a2a4a';sx.strokeStyle='#3b537f';
  sx.fillRect(bx-8,0,16,cy-gap/2);sx.fillRect(bx-8,cy+gap/2,16,h-(cy+gap/2));
  const spread=1.25-(slit)*1.05;
  const R0=(speed*1.4)%90;
  for(let r=R0+30;r<w*.62;r+=90){
    sx.beginPath();sx.strokeStyle=`rgba(140,225,255,${Math.max(0,.85-r/(w*.7))})`;sx.lineWidth=3.5;
    sx.arc(bx+6,cy,r,-spread,spread);sx.stroke();
  }
  sx.fillStyle='rgba(160,230,255,.9)';sx.font='26px Space Mono';
  sx.fillText('FENDA',bx-34,cy-gap/2-14);
}
(function slitLoop(t){if(motionOK())drawSlit(t);requestAnimationFrame(slitLoop)})(0);
drawSlit(0);
$('#slitSlider').addEventListener('input',e=>{
  const v=+e.target.value;
  $('#slitRead').textContent=v<50?'Fenda PEQUENA — a luz se espalha MUITO! 🌊':v<100?'Fenda média — espalhamento médio.':'Fenda GRANDE — a luz quase não se espalha. ➡️';
  if(!motionOK())drawSlit(performance.now());
});
$$('#slitQuiz button').forEach(b=>b.addEventListener('click',()=>{
  const f=$('#slitFb');f.style.display='block';
  if(b.dataset.ok==='1'){f.className='fb ok';
    f.textContent='✅ Isso! Quanto menor a abertura em relação ao comprimento de onda, mais a luz se espalha. Esse espalhamento é a DIFRAÇÃO.';}
  else{f.className='fb err';f.textContent='❌ Tente novamente! Dica: olhe o que acontece com as ondas quando a fenda fica pequenininha.';}
}));

/* ================= CD DIFRATOR ================= */
const cdArea=$('#cdArea'),cdL=$('#cdLight');let lx=0,ly=0,cdDrag=false;
function cdPos(x,y){
  const r=cdArea.getBoundingClientRect();
  lx=Math.max(10,Math.min(r.width-40,x));ly=Math.max(8,Math.min(r.height-44,y));
  cdL.style.left=lx+'px';cdL.style.top=ly+'px';
  const cx=r.width/2,cy=r.height*.52;
  const ang=Math.round(Math.atan2(ly+16-cy,lx+16-cx)*180/Math.PI);
  $('#cdDisc').style.setProperty('--sheen',ang+'deg');
  $('#cdRays').style.transform=`rotate(${ang+180}deg)`;
  $('#cdRays').style.filter=`blur(1.5px) hue-rotate(${ang}deg) drop-shadow(0 0 10px #fff)`;
  $('#cdRead').textContent=`Ângulo da luz: ${ang}° — as cores que você vê mudam com a posição! 💿`;
}
cdL.addEventListener('pointerdown',e=>{cdDrag=true;cdL.setPointerCapture(e.pointerId);e.preventDefault();});
cdArea.addEventListener('pointermove',e=>{if(!cdDrag)return;const r=cdArea.getBoundingClientRect();cdPos(e.clientX-r.left-16,e.clientY-r.top-16);});
addEventListener('pointerup',()=>cdDrag=false);
cdL.addEventListener('keydown',e=>{
  const d={ArrowLeft:[-14,0],ArrowRight:[14,0],ArrowUp:[0,-14],ArrowDown:[0,14]}[e.key];
  if(d){e.preventDefault();cdPos(lx+d[0],ly+d[1]);}});
function cdWhy(){const f=$('#cdFb');f.style.display='block';f.className='fb ok';
  f.innerHTML='<strong>🌈 Mas de onde vêm essas cores?</strong> As pequenas trilhas presentes na superfície do CD funcionam de maneira semelhante a uma <strong>rede de difração</strong>. A luz branca é difratada e seus diferentes comprimentos de onda seguem direções diferentes. No coletor HÉLIOS·CEP, fazemos o processo ao contrário: aplicamos uma película parecida que <em>redireciona</em> a luz para dentro da placa preta, em vez de espalhá-la para fora.';}
$('#cdDisc').addEventListener('click',cdWhy);
$('#cdDisc').addEventListener('keydown',e=>{if(e.key==='Enter')cdWhy()});
$('#btnCdWhy').addEventListener('click',cdWhy);
setTimeout(()=>{const r=cdArea.getBoundingClientRect();cdPos(r.width*.12,r.height*.18)},300);

/* ================= QUIZ DISPERSSÃO VS DIFRAÇÃO ================= */
const QUIZ=[
 {e:'🔺',t:'Um prisma separa a luz branca em um arco-íris.',a:'disp'},
 {e:'💿',t:'Cores aparecem ao refletir luz em um CD.',a:'difr'},
 {e:'🌊',t:'Uma onda passa por uma abertura pequena e se espalha.',a:'difr'},
 {e:'🌈',t:'Gotas de chuva separam a luz do sol no céu.',a:'disp'},
 {e:'🔬',t:'Uma rede com milhares de ranhuras espalha a luz formando espectros.',a:'difr'},
 {e:'☀️',t:'A grade do coletor HÉLIOS·CEP redireciona a luz para dentro da placa.',a:'difr'}];
let qi=0,score=0,acertos=0,wrongs=0,quizStarted=false;
function startQuiz(){qi=0;score=0;acertos=0;quizStarted=true;renderQ();}
function renderQ(){
  const box=$('#quizBox');
  if(qi>=QUIZ.length){
    const msg=acertos===6?'🌟 MESTRE DA LUZ!':acertos>=4?'👏 Mandou muito bem!':'💡 Reviva as experiências e tente de novo!';
    box.innerHTML=`<div class="quizcard"><span class="emo" style="font-size:3rem;display:block;margin-bottom:.8rem">🏆</span>
      <p style="font-family:var(--f-disp);font-size:1.3rem">Você acertou ${acertos}/${QUIZ.length}!</p>
      <p class="mono" style="margin-top:.6rem;font-size:.75rem;letter-spacing:.2em;color:var(--orange)">PONTUAÇÃO: ${score} PONTOS</p>
      <p style="margin-top:.8rem;color:var(--ink2)">${msg}</p>
      <button class="btn-mini" id="btnQuizRestart" style="margin-top:1rem">↺ Jogar novamente</button></div>`;
    $('#btnQuizRestart').addEventListener('click',startQuiz);
    return;}
  const q=QUIZ[qi];wrongs=0;
  box.innerHTML=`<div class="quizcard"><span class="mono" style="font-size:.75rem;letter-spacing:.2em;color:var(--orange)">SITUAÇÃO ${qi+1}/${QUIZ.length} · ${score} PTS</span>
    <span style="font-size:3rem;display:block;margin:.6rem 0">${q.e}</span><p style="font-weight:700;font-size:1.05rem">${q.t}</p>
    <p style="color:var(--ink2);font-size:.9rem;margin-top:.3rem">Isso é:</p>
    <div class="ansrow"><button class="b-disp" data-a="disp">🟦 DISPERSÃO</button>
    <button class="b-difr" data-a="difr">🟥 DIFRAÇÃO</button></div>
    <div class="fb" id="qzFb" aria-live="polite" style="display:none"></div></div>`;
  box.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{
    const f=$('#qzFb');f.style.display='block';
    if(b.dataset.a===q.a){if(wrongs===0){score+=10;acertos++;}
      f.className='fb ok';f.textContent='✅ CORRETO! +10 pontos';
      box.querySelectorAll('[data-a]').forEach(x=>x.disabled=true);
      setTimeout(()=>{qi++;renderQ()},1000);}
    else{wrongs++;f.className='fb err';f.textContent='❌ Tente novamente!';}
  }));
}
const quizObserver=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting && !quizStarted){startQuiz();quizObserver.unobserve(e.target);}
}),{threshold:.3});
quizObserver.observe($('#quiz-opt'));

/* ================= BANCADA DE LÓGICA ================= */
let pumpBench=true;
function benchUpdate(){
  const p=+$('#bPool').value,c=+$('#bColl').value,delta=c-p;
  $('#bPoolOut').textContent=fmt(p)+' °C';$('#bCollOut').textContent=fmt(c)+' °C';
  $('#bDelta').textContent=fmt(delta)+' °C';
  if(!pumpBench&&delta>=5)pumpBench=true;
  if(pumpBench&&delta<=1)pumpBench=false;
  const lamp=$('#bLamp');
  lamp.className='lamp '+(pumpBench?'on':'off');
  lamp.textContent=pumpBench?'● BOMBA LIGADA':'○ BOMBA DESLIGADA';
  $('#benchLive').textContent=`Diferença de ${fmt(delta)} graus. Bomba ${pumpBench?'ligada':'desligada'}.`;
}
$('#bPool').addEventListener('input',benchUpdate);
$('#bColl').addEventListener('input',benchUpdate);
benchUpdate();

/* ================= FLUXOGRAMA EXECUTÁVEL ================= */
let flowRunning=false;
$('#btnRunFlow').addEventListener('click',async()=>{
  if(flowRunning)return;flowRunning=true;
  const steps=['fs1','fs2','fs3'];
  const branch=(+$('#bColl').value-+$('#bPool').value)>=5?'fsY':'fsN';
  const seq=[...steps,branch,'fs6','fs7'];
  $('#flowLive').textContent='Executando a lógica de controle.';
  for(const id of seq){
    $('#'+id).classList.add('now');
    await sleep(motionOK()?800:120);
    if(id!=='fs7')$('#'+id).classList.remove('now');
  }
  $('#flowLive').textContent='Ciclo concluído. '+(branch==='fsY'?'A bomba foi ligada: calor disponível (grade difratora ativa).':'A bomba permanece desligada: economia de energia.');
  await sleep(900);$('#fs7').classList.remove('now');
  flowRunning=false;
});

/* ================= SIMULADOR TÉRMICO ================= */
let sim={T:24,mins:360,day:1,kwh:0,hist:[],timer:null,playing:false,announce:0};
const chart=$('#simChart'),cctx=chart.getContext('2d');
const irr=m=>{const x=(m/60-6)/14;return(x<0||x>1)?0:Math.sin(Math.PI*x);};
function simTick(){
  sim.mins+=10;if(sim.mins>=1440){sim.mins=0;sim.day++;}
  const cloud=+$('#sCloud').value/100,I=1000*irr(sim.mins)*(1-cloud);
  const air=18+9*irr(sim.mins)+3*(1-cloud*.5),plates=+$('#sPlates').value;
  const difrPct=+$('#sDifr').value/100;
  const difrMult=1+0.25*difrPct;
  const Tc=air+(I/1000)*34*difrMult;
  const pump=plates>0&&($('#sAuto').checked?(Tc-sim.T>=4):true);
  if(pump){sim.T+=plates*(I/1000)*0.08*difrMult;sim.kwh+=plates*1.5*I*0.55*(10/60)/1000;}
  const dT=Math.max(0,sim.T-air);
  sim.T-=0.012*dT+($('#sCover').checked?0.004:0.02)*dT;
  sim.T=Math.max(16,Math.min(42,sim.T));
  sim.hist.push(sim.T);if(sim.hist.length>160)sim.hist.shift();
  const hh=String(Math.floor(sim.mins/60)).padStart(2,'0'),mm=String(sim.mins%60).padStart(2,'0');
  $('#simClock').textContent=`Dia ${sim.day} · ${hh}:${mm}`;
  $('#simTemp').textContent=fmt(sim.T);
  $('#simState').textContent=pump?`☀ COLETANDO (grade ${Math.round(difrPct*100)}%)`:'○ BOMBA EM ESPERA';
  $('#sKwh').textContent=fmt(sim.kwh);$('#sCo2').textContent=fmt(sim.kwh*0.09);$('#sMoney').textContent=Math.round(sim.kwh*0.92).toLocaleString('pt-BR');
  const k=Math.max(0,Math.min(1,(sim.T-24)/16));
  $('#poolWater').setAttribute('fill',`hsl(${205-185*k},${70+15*k}%,${52+6*k}%)`);
  $('#poolSteam').setAttribute('opacity',Math.max(0,Math.min(.85,(sim.T-32)/9)));
  drawChart();
  if(++sim.announce>=8){sim.announce=0;$('#simLive').textContent=`Simulação: água a ${fmt(sim.T)} graus às ${hh}:${mm}.`;}
}
function drawChart(){
  const w=chart.width=chart.clientWidth*2,h=chart.height=340;
  cctx.clearRect(0,0,w,h);
  const min=16,max=44,l=52,r=w-14,t=14,b=h-30;
  cctx.font='20px Space Mono';cctx.fillStyle=hcOn()?'#ffd23f':'rgba(255,255,255,.65)';
  for(let v=20;v<=40;v+=10){const y=t+(max-v)/(max-min)*(b-t);
    cctx.fillText(v+'°',6,y+6);cctx.strokeStyle='rgba(255,255,255,.14)';cctx.beginPath();cctx.moveTo(l,y);cctx.lineTo(r,y);cctx.stroke();}
  if(sim.hist.length>1){
    cctx.strokeStyle='#f5a71c';cctx.lineWidth=4;cctx.beginPath();
    sim.hist.forEach((v,i)=>{const x=l+i/(sim.hist.length-1)*(r-l),y=t+(max-v)/(max-min)*(b-t);
      i?cctx.lineTo(x,y):cctx.moveTo(x,y);});
    cctx.stroke();
    const lastX=r,lastY=t+(max-sim.hist.at(-1))/(max-min)*(b-t);
    cctx.fillStyle='#f5a71c';cctx.beginPath();cctx.arc(lastX,lastY,8,0,7);cctx.fill();
  }
}
function setPlay(on){
  sim.playing=on;$('#btnPlay').textContent=on?'⏸ Pausar':'▶ Iniciar';
  clearInterval(sim.timer);
  if(on)sim.timer=setInterval(simTick,650/+$('#sSpeed').value);
}
$('#btnPlay').addEventListener('click',()=>setPlay(!sim.playing));
$('#sSpeed').addEventListener('change',()=>{if(sim.playing)setPlay(true);});
$('#btnReset').addEventListener('click',()=>{setPlay(false);sim={T:24,mins:360,day:1,kwh:0,hist:[],timer:null,playing:false,announce:0};simTick();});
$('#sPlates').addEventListener('input',e=>$('#sPlatesOut').textContent=e.target.value);
$('#sDifr').addEventListener('input',e=>$('#sDifrOut').textContent=e.target.value+'%');
$('#sCloud').addEventListener('input',e=>$('#sCloudOut').textContent=e.target.value+'%');
simTick();addEventListener('resize',()=>{drawSpark();drawChart();});

/* ================= DEMONSTRAÇÃO DE CONTRASTE ================= */
$('#btnContrastDemo').addEventListener('click',e=>{
  const box=$('#demoBox'),good=box.classList.toggle('good');
  box.classList.toggle('bad',!good);
  e.currentTarget.setAttribute('aria-pressed',!good);
});
