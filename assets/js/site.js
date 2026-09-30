'use strict';

const D2H = {
  api: '/api/public',
  lang: document.documentElement.lang === 'pt' ? 'pt' : 'en',
  projects: [],
  loaded: false,
  copy: {
    en: {
      loading: 'LOADING THE ARCHIVE…',
      emptyEyebrow: 'ISSUE ZERO / ARCHIVE OPEN',
      emptyTitle: 'NEW STORIES ARE ON THE WAY.',
      emptyBody: 'Our selected work will appear here soon. Have a project in mind? Get in touch with the collective.',
      view: 'VIEW STORY',
      feature: 'FEATURED STORY',
      unavailable: 'D2H ARCHIVE / TEMPORARILY UNAVAILABLE',
      unavailableBody: 'We could not load the archive. Please try again shortly.',
      send: 'SEND PROJECT →',
      sending: 'SENDING…',
      received: 'RECEIVED. WE WILL GET BACK TO YOU.',
      sendFail: 'COULD NOT SEND. PLEASE TRY AGAIN SHORTLY.',
      project404: 'THIS STORY IS NOT IN THE ARCHIVE.',
      backWork: 'BACK TO WORK',
      next: 'NEXT STORY',
      credits: 'CREDITS',
      process: 'THE STORY',
      work: 'WORK',
    },
    pt: {
      loading: 'A CARREGAR O ARQUIVO…',
      emptyEyebrow: 'EDIÇÃO ZERO / ARQUIVO ABERTO',
      emptyTitle: 'NOVAS HISTÓRIAS A CAMINHO.',
      emptyBody: 'Os nossos projetos vão aparecer aqui em breve. Tens uma ideia em mente? Fala com o coletivo.',
      view: 'VER PROJETO',
      feature: 'PROJETO EM DESTAQUE',
      unavailable: 'ARQUIVO D2H / TEMPORARIAMENTE INDISPONÍVEL',
      unavailableBody: 'Não foi possível carregar o arquivo. Tenta novamente dentro de momentos.',
      send: 'ENVIAR PROJETO →',
      sending: 'A ENVIAR…',
      received: 'RECEBIDO. VAMOS RESPONDER-TE.',
      sendFail: 'NÃO FOI POSSÍVEL ENVIAR. TENTA NOVAMENTE DENTRO DE MOMENTOS.',
      project404: 'ESTE PROJETO NÃO ESTÁ NO ARQUIVO.',
      backWork: 'VOLTAR AO WORK',
      next: 'PRÓXIMO PROJETO',
      credits: 'CRÉDITOS',
      process: 'A HISTÓRIA',
      work: 'WORK',
    }
  }
};

const PUBLIC_PEOPLE_FALLBACK=[
  {name:'Tainara',role:'Model',handle:'@red_txy',sort_order:1},
  {name:'Osu',role:'Model',handle:'@lil_kisyaosu',sort_order:2},
  {name:'Kenzie',role:'Model',handle:'@t3kbrat',sort_order:3},
  {name:'Kwister',role:'Model',handle:'@khwach._',sort_order:4},
  {name:'Kyan',role:'Editor',handle:'@shotbykyan',sort_order:5},
  {name:'Samu',role:'Model',handle:'@swahll',sort_order:6},
  {name:'Felipe',role:'Photographer',handle:'@lp.mp3_',sort_order:7},
  {name:'Alex',role:'Photographer',handle:'@yatorasupremacy_',sort_order:8},
  {name:'Mendes',role:'Creative Director, Videographer',handle:'@44mendxs',sort_order:9},
  {name:'Daniel',role:'Manager',handle:'@lowkeysofly',sort_order:10},
];

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const C = key => D2H.copy[D2H.lang][key] || D2H.copy.en[key] || key;

function localizedPath(path){
  const clean = path.startsWith('/') ? path : '/' + path;
  if(D2H.lang === 'pt') return clean === '/' ? '/pt/' : '/pt' + clean;
  return clean;
}
function altLanguagePath(){
  const path = location.pathname;
  if(D2H.lang === 'pt'){
    const clean = path.replace(/^\/pt(?=\/|$)/,'') || '/';
    return clean;
  }
  return path === '/' ? '/pt/' : '/pt' + path;
}
function setLanguageLinks(){
  $$('[data-lang-switch]').forEach(a => {
    a.href = altLanguagePath() + location.search + location.hash;
    a.textContent = D2H.lang === 'pt' ? 'EN' : 'PT';
  });
}
function initTheme(){
  let saved='';try{saved=localStorage.getItem('d2h-theme')||''}catch{}
  const theme = saved === 'night' ? 'night' : 'day';
  document.documentElement.dataset.theme = theme;
  syncThemeLabels();
  $$('[data-theme-switch]').forEach(btn => btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'day' ? 'night' : 'day';
    document.documentElement.dataset.theme = next;
    try{localStorage.setItem('d2h-theme', next)}catch{}
    syncThemeLabels();
  }));
}
function syncThemeLabels(){
  const isDay = document.documentElement.dataset.theme === 'day';
  $$('[data-theme-switch]').forEach(btn => {btn.textContent = isDay ? 'DAY' : 'NIGHT';btn.setAttribute('aria-label',isDay?'Switch to night theme':'Switch to day theme');});
  const meta=$('meta[name="theme-color"]');if(meta)meta.content=isDay?'#F2EDE6':'#050505';
}

function initStudioLinks(){
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  $$('[data-studio-link]').forEach(a=>a.href=local?'http://127.0.0.1:8000':'https://die2hard-studio.onrender.com');
}

function initMenu(){
  const btn = $('[data-menu]');
  const menu = $('#mobileMenu');
  if(!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? '×' : '☰';
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    btn.textContent='☰';
  }));
}

function initReveals(){
  const els = $$('.reveal');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(el=>el.classList.add('on'));return;}
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){entry.target.classList.add('on');io.unobserve(entry.target);}
  }), {threshold:.08,rootMargin:'0px 0px -30px'});
  els.forEach(el=>io.observe(el));
}

function initParallax(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer:fine)').matches) return;
  const els = $$('.floaty');
  if(!els.length) return;
  let tx=0,ty=0,cx=0,cy=0,raf=0;
  const draw=()=>{
    cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
    els.forEach((el,i)=>{
      const depth=Number(el.dataset.depth || (i%3+1));
      const rot=Number(el.dataset.rot || 0);
      el.style.transform=`translate3d(${cx*depth}px,${cy*depth}px,0) rotate(${rot}deg)`;
    });
    raf=requestAnimationFrame(draw);
  };
  addEventListener('mousemove',e=>{tx=(e.clientX/innerWidth-.5)*5;ty=(e.clientY/innerHeight-.5)*5;});
  raf=requestAnimationFrame(draw);
  addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
}



function initVinylScroll(){
 const records=$$('[data-vinyl]');if(!records.length)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
 const draw=()=>{frame=0;const angle=motion.matches?0:(window.scrollY||0)*.22;records.forEach(record=>record.style.setProperty('--vinyl-rotation',`${angle}deg`));};
 const requestDraw=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 addEventListener('scroll',requestDraw,{passive:true});addEventListener('pageshow',requestDraw);motion.addEventListener('change',requestDraw);draw();
}

function initCursor(){
  if(!matchMedia('(pointer:fine)').matches) return;
  const cur=$('#cursor');if(!cur)return;
  addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';cur.classList.add('visible');});
  document.addEventListener('mouseover',e=>{
    const target=e.target.closest('a,button,[data-cursor]');
    if(!target)return;cur.classList.add('active');cur.dataset.label=target.dataset.cursor||'';
  });
  document.addEventListener('mouseout',e=>{
    if(e.target.closest('a,button,[data-cursor]')){cur.classList.remove('active');cur.dataset.label='';}
  });
}

function initTilt(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer:fine)').matches) return;
  document.addEventListener('mousemove',e=>{
    const card=e.target.closest('[data-tilt]');
    if(!card)return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateX(${-y*1.6}deg) rotateY(${x*1.6}deg)`;
  });
  document.addEventListener('mouseout',e=>{const card=e.target.closest('[data-tilt]');if(card)card.style.transform='';});
}

async function fetchJSON(path,options){
  const r=await fetch(D2H.api+path,options);
  if(!r.ok){let detail='';try{detail=(await r.json()).detail||''}catch{};throw new Error(detail||`HTTP ${r.status}`);}
  return r.json();
}
async function getProjects(){
  if(D2H.loaded)return D2H.projects;
  try{
    const data=await fetchJSON('/projects');
    D2H.projects=Array.isArray(data.projects)?data.projects:[];
    D2H.loaded=true;
    return D2H.projects;
  }catch(err){D2H.loaded=true;D2H.projects=[];D2H.apiError=err;return [];}
}

function projectTitle(p){return D2H.lang==='pt'?(p.title_pt||p.title):(p.title||p.title_pt);}
function projectSummary(p){return D2H.lang==='pt'?(p.summary_pt||p.summary):(p.summary||p.summary_pt);}
function projectBody(p){return D2H.lang==='pt'?(p.body_pt||p.body):(p.body||p.body_pt);}
function projectSeoTitle(p){return D2H.lang==='pt'?(p.seo_title_pt||p.seo_title):(p.seo_title||p.seo_title_pt);}
function projectSeoDescription(p){return D2H.lang==='pt'?(p.seo_description_pt||p.seo_description):(p.seo_description||p.seo_description_pt);}
function projectHref(p){return localizedPath('/work/'+encodeURIComponent(p.slug));}

function safeMediaUrl(u){
  const value=String(u||'').trim();
  if(!value)return '';
  if(value.startsWith('/api/public/'))return value;
  if(/^https?:\/\//i.test(value))return value;
  return '';
}
function videoInfo(url){
  try{
    const u=new URL(url,location.origin);
    if(/youtu\.be$/i.test(u.hostname))return {type:'youtube',id:u.pathname.slice(1)};
    if(/youtube\.com$|youtube-nocookie\.com$/i.test(u.hostname))return {type:'youtube',id:u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop()};
    if(/vimeo\.com$/i.test(u.hostname))return {type:'vimeo',id:u.pathname.split('/').filter(Boolean).pop()};
  }catch{}
  return null;
}
function mediaMarkup(url,title,{hero=false}={}){
  const safe=safeMediaUrl(url);
  if(!safe)return `<div class="story-placeholder"><img src="/assets/brand/logo-orange.png" alt=""></div>`;
  const v=videoInfo(safe);
  if(hero&&v?.type==='youtube')return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}?rel=0&modestbranding=1" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  if(hero&&v?.type==='vimeo')return `<iframe src="https://player.vimeo.com/video/${esc(v.id)}?title=0&byline=0&portrait=0" title="${esc(title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  if(/\.(mp4|webm)(\?|$)/i.test(safe))return `<video src="${esc(safe)}" ${hero?'controls':''} playsinline ${hero?'':'muted loop'}></video>`;
  if(v)return `<div class="story-placeholder"><img src="/assets/brand/logo-orange.png" alt=""><span class="story-badge">VIDEO</span></div>`;
  return `<img src="${esc(safe)}" alt="${esc(title)}" loading="lazy">`;
}

function storyCard(p,index){
  const title=projectTitle(p)||'UNTITLED';
  const summary=projectSummary(p)||'';
  const cover=safeMediaUrl(p.cover_url)||safeMediaUrl(p.hero_url);
  const services=(p.services||[]).join(' · ')||'PROJECT';
  return `<a class="story-card reveal" data-tilt data-cursor="${esc(C('view'))}" href="${esc(projectHref(p))}" data-services="${esc((p.services||[]).join('|').toLowerCase())}">
    <div class="story-media">${mediaMarkup(cover,title)}<span class="story-badge">${index===0?'COVER STORY':'D2H '+String(index+1).padStart(3,'0')}</span></div>
    <div class="story-info"><span class="story-no">${String(index+1).padStart(2,'0')}</span><div><h3>${esc(title)}</h3>${summary?`<p>${esc(summary)}</p>`:''}</div><div class="story-meta">${esc(services)}${p.year?`<br>${esc(p.year)}`:''}</div></div>
  </a>`;
}
function emptyMarkup(apiError=false){
  return `<section class="issue-zero reveal"><div class="zero-grid"></div><div><span class="kicker alt">${esc(apiError?C('unavailable'):C('emptyEyebrow'))}</span><h3>${apiError?'ARCHIVE<br><span>READY</span>':'ISSUE<br><span>ZERO</span>'}</h3><p>${esc(apiError?C('unavailableBody'):C('emptyBody'))}</p>${apiError?`<a class="button primary" data-studio-link href="http://localhost:8000">${D2H.lang==='pt'?'ENTRA NO D2H STUDIO':'ENTER D2H STUDIO'} ↗</a>`:''}</div><img class="zero-disc" src="/assets/decor/disc.svg" alt=""></section>`;
}

async function renderHomeFeature(){
  const host=$('#homeFeature');if(!host)return;
  const projects=await getProjects();
  if(!projects.length){host.innerHTML=emptyMarkup(Boolean(D2H.apiError));initReveals();initStudioLinks();return;}
  const p=projects[0],title=projectTitle(p),summary=projectSummary(p),services=(p.services||[]).join(' / ');
  const hero=safeMediaUrl(p.hero_url)||safeMediaUrl(p.cover_url);
  host.innerHTML=`<div class="feature-story reveal"><a class="feature-media" data-cursor="${esc(C('view'))}" href="${esc(projectHref(p))}">${mediaMarkup(hero,title)}</a><aside class="feature-meta"><div><span class="kicker">${esc(C('feature'))}</span><h3>${esc(title)}</h3><p>${esc(summary||'')}</p></div><div><div class="feature-tags">${(p.services||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join('')}${p.year?`<span class="tag">${esc(p.year)}</span>`:''}</div><a class="button primary" href="${esc(projectHref(p))}" style="margin-top:20px">${esc(C('view'))} ↗</a></div></aside></div>`;
  initReveals();
}

async function renderHomeStories(){
  const host=$('#homeStories');if(!host)return;
  const projects=await getProjects();
  const list=projects.slice(1,5);
  if(!list.length){host.innerHTML='';const section=$('#latestSection');if(section)section.hidden=true;return;}
  host.innerHTML=list.map((p,i)=>storyCard(p,i+1)).join('');
  initReveals();
}

async function renderWork(){
  const host=$('#workGrid');if(!host)return;
  host.innerHTML=`<div class="loading-card">${esc(C('loading'))}</div>`;
  const projects=await getProjects();
  if(!projects.length){host.classList.remove('story-grid');host.innerHTML=emptyMarkup(Boolean(D2H.apiError));initReveals();initStudioLinks();return;}
  host.classList.add('story-grid');
  host.innerHTML=projects.map(storyCard).join('');
  buildFilters(projects);
  initReveals();
}
function buildFilters(projects){
  const host=$('#filters');if(!host)return;
  const services=[...new Set(projects.flatMap(p=>p.services||[]).map(String).filter(Boolean))].slice(0,10);
  if(!services.length){host.hidden=true;return;}
  host.innerHTML=`<button class="active" data-filter="all">ALL</button>`+services.map(s=>`<button data-filter="${esc(s.toLowerCase())}">${esc(s)}</button>`).join('');
  host.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    $$('button',host).forEach(x=>x.classList.toggle('active',x===b));
    $$('.story-card','#workGrid').forEach(card=>{const vals=(card.dataset.services||'').split('|');card.hidden=b.dataset.filter!=='all'&&!vals.includes(b.dataset.filter);});
  });
}

const WORK_CATEGORIES={
  visual:['visual content','film','video','photography','photo','production'],
  talent:['talent','model','models','artist','artists','creative','creatives'],
  brand:['brand','branding','identity','design','visual design'],
  events:['event','events','culture','nightlife','social organisation'],
  direction:['creative direction','direction','strategy']
};
function applyCategory(category){
  const aliases=WORK_CATEGORIES[category]||[];
  $$('.category-card').forEach(c=>c.classList.toggle('active',c.dataset.workCategory===category));
  const cards=$$('.story-card','#workGrid');
  if(!cards.length)return;
  cards.forEach(card=>{
    const vals=(card.dataset.services||'').split('|').filter(Boolean);
    card.hidden=category!=='all'&&!vals.some(v=>aliases.some(a=>v.includes(a)));
  });
}
function initWorkCategories(){
  $$('[data-work-category]').forEach(card=>{
    const go=()=>{const key=card.dataset.workCategory||'all';if(document.body.dataset.page==='work')applyCategory(key);else location.href=localizedPath('/work/')+'?category='+encodeURIComponent(key);};
    card.addEventListener('click',go);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
  });
}
function currentSlug(){
  const m=location.pathname.match(/\/(?:pt\/)?work\/([^/?#]+)/);
  if(m && m[1] !== 'project.html') return decodeURIComponent(m[1]);
  return new URLSearchParams(location.search).get('slug')||'';
}
async function renderProject(){
  const root=$('#projectPage');if(!root)return;
  const slug=currentSlug();
  if(!slug){location.replace(localizedPath('/work/'));return;}
  try{
    const p=await fetchJSON('/projects/'+encodeURIComponent(slug));
    const title=projectTitle(p)||'UNTITLED',summary=projectSummary(p),body=projectBody(p),layout=['film','editorial','experiment'].includes(p.layout)?p.layout:'film';
    const seoTitle=projectSeoTitle(p)||`${title} — Die2Hard Die2Fly`;
    const seoDescription=projectSeoDescription(p)||summary||'';
    document.title=seoTitle;
    const meta=$('meta[name="description"]');if(meta&&seoDescription)meta.content=seoDescription;
    document.body.classList.add('project-layout-'+layout);
    root.innerHTML=`
      <section class="project-mast"><div class="shell"><div class="project-topline"><span>PROJECT / ${esc((p.kind||'WORK').toUpperCase())}</span><span>${esc(p.year||'D2H ARCHIVE')}</span></div><h1>${esc(title)}</h1><div class="project-services">${(p.services||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div></div></section>
      <div class="project-hero-media">${mediaMarkup(p.hero_url||p.cover_url,title,{hero:true})}</div>
      <section class="section"><div class="shell project-intro"><div><span class="kicker">${esc(C('process'))}</span>${summary?`<p class="project-summary">${esc(summary)}</p>`:''}</div><div class="project-body">${esc(body||summary||'')}</div></div></section>
      ${(p.gallery||[]).length?`<section class="section-tight"><div class="shell project-gallery">${p.gallery.map((url,i)=>`<figure class="reveal">${mediaMarkup(url,`${title} ${i+1}`)}</figure>`).join('')}</div></section>`:''}
      ${(p.credits||[]).length?`<section class="section"><div class="shell"><div class="mag-head"><div><span class="section-number">CREDITS</span><h2>${esc(C('credits'))}.</h2></div></div><div class="credits-grid">${p.credits.map(c=>`<div class="credit">${esc(c)}</div>`).join('')}</div></div></section>`:''}
      <section class="section"><div class="shell issue-zero"><div class="zero-grid"></div><div><span class="kicker alt">${esc(C('next'))}</span><h3>KEEP<br><span>GOING.</span></h3><p>${D2H.lang==='pt'?'Volta ao arquivo para explorar o próximo projeto.':'Return to the archive and open the next story.'}</p><a class="button primary" href="${localizedPath('/work/')}">${esc(C('backWork'))} ↗</a></div><img class="zero-disc" src="/assets/decor/disc.svg" alt=""></section>
    `;
    initReveals();
  }catch(err){
    root.innerHTML=`<div class="shell error-screen"><div><span class="kicker">404 / PROJECT</span><h1>404.</h1><p>${esc(C('project404'))}</p><a class="button primary" href="${localizedPath('/work/')}">${esc(C('backWork'))} ↗</a></div></div>`;
  }
}


function localizedRole(role){
  if(D2H.lang!=='pt')return role||'Creative';
  const map={
    'Model':'Modelo',
    'Editor':'Editor',
    'Photographer':'Fotógrafo',
    'Manager':'Manager',
    'Creative Director, Videographer':'Diretor Criativo, Videógrafo',
  };
  return map[role]||role||'Criativo';
}
function instagramHref(handle){
  const clean=String(handle||'').trim().replace(/^@/,'');
  return clean?`https://instagram.com/${encodeURIComponent(clean)}`:'';
}
async function renderPublicPeople(){
  const host=$('#publicPeople');if(!host)return;
  let people=PUBLIC_PEOPLE_FALLBACK;
  try{
    const data=await fetchJSON('/people');
    if(Array.isArray(data.people)) people=data.people;
  }catch{}
  people=[...people].sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)||String(a.name).localeCompare(String(b.name)));
  host.innerHTML=people.map((p,i)=>{
    const role=localizedRole(p.role),href=instagramHref(p.handle);
    return `<article class="person reveal"><span class="kicker ${i%3===2?'alt':''}">${esc((role||'D2H').toUpperCase())} / D2H</span><h3>${esc(p.name)}</h3><p>${esc(role)}</p>${p.handle?`<a class="person-handle" href="${esc(href)}" target="_blank" rel="noopener">${esc(p.handle)} ↗</a>`:''}</article>`;
  }).join('');
  initReveals();
}

function initContact(){
  const form=$('#contactForm');if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();const btn=form.querySelector('button[type="submit"]'),status=$('#formStatus');
    const fd=new FormData(form);const body=Object.fromEntries(fd.entries());
    btn.disabled=true;btn.textContent=C('sending');status.textContent='';
    try{
      await fetchJSON('/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      form.reset();status.textContent=C('received');
    }catch(err){status.textContent=(err.message&&err.message!=='Failed to fetch')?err.message:C('sendFail');}
    finally{btn.disabled=false;btn.textContent=C('send');}
  });
}

function initServices(){
  $$('.department').forEach(row=>{
    row.addEventListener('click',()=>{
      const value=row.dataset.service||'';
      location.href=localizedPath('/work/')+(value?`?service=${encodeURIComponent(value)}`:'');
    });
  });
}

function applyQueryFilter(){
  const params=new URLSearchParams(location.search);const category=params.get('category');if(category){setTimeout(()=>applyCategory(category),180);return;}
  const q=params.get('service');if(!q)return;
  const target=q.toLowerCase();
  const categoryByService={
    'visual content production':'visual','talent platform & development':'talent','brand identity & visual design':'brand',
    'events & social organisation':'events','creative direction & strategy':'direction'
  };
  if(categoryByService[target]){setTimeout(()=>applyCategory(categoryByService[target]),180);return;}
  const check=()=>{const b=$(`#filters button[data-filter="${CSS.escape(target)}"]`);if(b)b.click();};setTimeout(check,180);
}

function initCoverStatus(){
  const stamp=$('[data-local-stamp]');if(!stamp)return;
  const d=new Date();stamp.textContent=`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

function init(){
  setLanguageLinks();initTheme();initStudioLinks();initMenu();initReveals();initParallax();initVinylScroll();initCursor();initTilt();initCoverStatus();
  renderHomeFeature();renderHomeStories();renderWork().then(applyQueryFilter);initWorkCategories();renderProject();renderPublicPeople();initContact();initServices();
}

document.addEventListener('DOMContentLoaded',init);
