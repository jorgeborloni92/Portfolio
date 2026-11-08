// Localized labels for interactive states.
const jbText = (() => {
 const en = {"Movimento reduzido nas preferências do dispositivo": "Reduced motion is enabled in your device settings", "Ativar animações": "Enable animations", "Pausar animações": "Pause animations", "Ativar movimento": "Enable motion", "Pausar movimento": "Pause motion", "Virar o disco: voltar ao lado A": "Flip the record: return to side A", "Virar o disco: conhecer meu repertório brasileiro": "Flip the record: discover my Brazilian influences", "Fachadas do Pelourinho, Salvador: repertório brasileiro": "Facades in Pelourinho, Salvador: Brazilian influences", "Jorge Borloni sorrindo": "Jorge Borloni smiling", "LADO B — O QUE ME MOVE": "SIDE B — WHAT MOVES ME", "LADO A — QUEM FAZ": "SIDE A — THE PERSON BEHIND IT"};
 return text => document.documentElement.lang.startsWith('en') ? (en[text] || text) : text;
})();
(() => {
  const root=document.documentElement, preference=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('.motion-toggle');
  let paused=false;
  try{paused=localStorage.getItem('jb-motion')==='paused';}catch{}
  const reduced=()=>preference.matches||paused;
  function applyMotion(){
    root.classList.toggle('motion-on',!reduced()); root.classList.toggle('motion-paused',reduced());
    if(reduced())document.getAnimations().forEach(a=>{try{a.finish();}catch{a.cancel();}});
    root.dispatchEvent(new Event('jb-motion-change'));
    if(toggle){toggle.disabled=preference.matches;toggle.setAttribute('aria-pressed',String(reduced()));toggle.title=preference.matches?jbText("Movimento reduzido nas preferências do dispositivo"):reduced()?jbText("Ativar animações"):jbText("Pausar animações");toggle.setAttribute('aria-label',toggle.title);toggle.innerHTML=(reduced()?'▶':'Ⅱ')+' <span>'+(reduced()?jbText("Ativar movimento"):jbText("Pausar movimento"))+'</span>';}
  }
  applyMotion();preference.addEventListener('change',applyMotion);
  toggle?.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('jb-motion',paused?'paused':'active');}catch{}applyMotion();});
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.04});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));}
  const dock=[...document.querySelectorAll('.bottom-nav a')];
  const nav=document.querySelector('.bottom-nav');
  const homeSections=['inicio','projetos','sobre','escritos','contato'].map(id=>document.getElementById(id)).filter(Boolean);
  const chapters=[...document.querySelectorAll('.case-chapter')];
  const indexLinks=[...document.querySelectorAll('.case-index nav a,.mobile-toc nav a')];
  let ticking=false;
  function update(){
    ticking=false;
    const max=root.scrollHeight-innerHeight;
    const progress=document.querySelector('.reading-progress');if(progress)progress.style.transform=`scaleX(${max>0?Math.max(0,Math.min(1,scrollY/max)):0})`;
    if(document.body.classList.contains('home')){
      let current=homeSections[0]?.id;
      homeSections.forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.45)current=s.id;});
      if(scrollY+innerHeight>=root.scrollHeight-10)current='contato';
      dock.forEach(a=>{if(a.dataset.destination===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    }
    const activeIndex=Math.max(0,dock.findIndex(a=>a.hasAttribute('aria-current')));
    nav?.style.setProperty('--nav-index',activeIndex);
    const footer=document.querySelector('footer');
    if(nav&&footer)nav.classList.toggle('over-dark',footer.getBoundingClientRect().top<innerHeight-30);
    if(chapters.length){let current=chapters[0].id;chapters.forEach(s=>{if(s.getBoundingClientRect().top<150)current=s.id;});const mobileLabel=document.querySelector('.mobile-toc summary .current-chapter');if(mobileLabel)mobileLabel.textContent=indexLinks.find(a=>a.hash==='#'+current)?.textContent||'';indexLinks.forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();nav?.classList.add('has-indicator');
  document.querySelectorAll('a[href*="#"]').forEach(a=>a.addEventListener('click',event=>{
    const url=new URL(a.href,location.href);if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
    const target=document.getElementById(url.hash.slice(1));if(!target)return;
    event.preventDefault();document.querySelector('.mobile-toc')?.removeAttribute('open');
    history.pushState(null,'',location.pathname+location.search+url.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({behavior:reduced()?'instant':'smooth'});
  }));
  const dialog=document.querySelector('.image-dialog');let trigger=null;
  document.querySelectorAll('.zoom-image').forEach(button=>button.addEventListener('click',()=>{
    trigger=button;const img=dialog.querySelector('img');img.src=button.dataset.full;img.alt=button.dataset.caption;dialog.querySelector('p').textContent=button.dataset.caption;dialog.showModal();root.classList.add('dialog-open');
  }));
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>{root.classList.remove('dialog-open');dialog.querySelector('img').removeAttribute('src');trigger?.focus({preventScroll:true});});
})();

// Two visual sides of the same repertoire; no autoplay audio.
(() => {
 const record=document.querySelector('.record-switch');
 if(!record)return;
 record.addEventListener('click',()=>{
  const b=record.getAttribute('aria-pressed')!=='true';
  record.setAttribute('aria-pressed',String(b));
  record.setAttribute('aria-label',b?jbText("Virar o disco: voltar ao lado A"):jbText("Virar o disco: conhecer meu repertório brasileiro"));
  record.querySelector('.record-front').setAttribute('aria-hidden',String(b));
  record.querySelector('.record-back').setAttribute('aria-hidden',String(!b));
  document.querySelector('.record-caption').textContent=b?jbText("LADO B — O QUE ME MOVE"):jbText("LADO A — QUEM FAZ");
 });
})();

// Progressive enhancement: all projects remain available without JavaScript.
(() => {
 const toolbar=document.querySelector('.project-tools');
 if(!toolbar)return;
 const buttons=[...toolbar.querySelectorAll('[data-filter]')];
 const cards=[...document.querySelectorAll('.project-card')];
 const english=document.documentElement.lang.startsWith('en');
 function applyFilter(){
  const requested=new URL(location.href).searchParams.get('work')||'all';
  const filter=buttons.some(b=>b.dataset.filter===requested)?requested:'all';
  let count=0;
  cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden)count++;});
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  toolbar.querySelector('.project-count').textContent=english?`${count} ${count===1?'project':'projects'}`:`${count} ${count===1?'projeto':'projetos'}`;
 }
 toolbar.hidden=false;
 buttons.forEach(b=>b.addEventListener('click',()=>{
  const url=new URL(location.href);
  if(b.dataset.filter==='all')url.searchParams.delete('work');else url.searchParams.set('work',b.dataset.filter);
  history.pushState(null,'',url);applyFilter();
 }));
 addEventListener('popstate',applyFilter);applyFilter();
})();

// Motion is progressive enhancement: nothing waits for animation to be readable.
(() => {
 const root=document.documentElement;
 const reduced=()=>root.classList.contains('motion-paused')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  if(!reduced()&&entry.target.animate)entry.target.animate(
   [{opacity:.72,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],
   {duration:620,easing:'cubic-bezier(.2,.7,.2,1)'}
  );
 }),{threshold:.12});
 document.querySelectorAll('.project-art,.article-thumb,.case-banner,.media-slot,.footer-portrait').forEach(el=>observer.observe(el));
 document.querySelectorAll('.project-filters button').forEach(button=>button.addEventListener('click',()=>{
  if(reduced())return;
  document.querySelectorAll('.project-card:not([hidden]) .project-art').forEach((el,index)=>{
   el.getAnimations().forEach(a=>a.cancel());
   el.animate([{opacity:.65,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:index*35,easing:'ease-out'});
  });
 }));
})();
