(() => {
  const root=document.documentElement, preference=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('.motion-toggle');
  let paused=false;
  try{paused=localStorage.getItem('jb-motion')==='paused';}catch{}
  const reduced=()=>preference.matches||paused;
  function applyMotion(){
    root.classList.toggle('motion-on',!reduced()); root.classList.toggle('motion-paused',reduced());
    if(toggle){toggle.disabled=preference.matches;toggle.setAttribute('aria-pressed',String(reduced()));toggle.title=preference.matches?'Movimento reduzido nas preferências do dispositivo':reduced()?'Ativar animações':'Pausar animações';toggle.innerHTML=(reduced()?'▶':'Ⅱ')+' <span>'+(reduced()?'Ativar movimento':'Pausar movimento')+'</span>';}
  }
  applyMotion();preference.addEventListener('change',applyMotion);
  toggle?.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('jb-motion',paused?'paused':'active');}catch{}applyMotion();});
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.04});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));}
  const dock=[...document.querySelectorAll('.bottom-nav a')];
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
    if(chapters.length){let current=chapters[0].id;chapters.forEach(s=>{if(s.getBoundingClientRect().top<150)current=s.id;});indexLinks.forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
  document.querySelectorAll('a[href*="#"]').forEach(a=>a.addEventListener('click',event=>{
    const url=new URL(a.href,location.href);if(url.pathname!==location.pathname||!url.hash)return;
    const target=document.getElementById(url.hash.slice(1));if(!target)return;
    event.preventDefault();document.querySelector('.mobile-toc')?.removeAttribute('open');
    history.pushState(null,'',url.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({behavior:reduced()?'instant':'smooth'});
  }));
  const dialog=document.querySelector('.image-dialog');let trigger=null;
  document.querySelectorAll('.zoom-image').forEach(button=>button.addEventListener('click',()=>{
    trigger=button;const img=dialog.querySelector('img');img.src=button.dataset.full;img.alt=button.dataset.caption;dialog.querySelector('p').textContent=button.dataset.caption;dialog.showModal();
  }));
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>{dialog.querySelector('img').removeAttribute('src');trigger?.focus({preventScroll:true});});
})();
