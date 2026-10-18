"""Case narratives and future media, independent from the site's visual shell."""
import html, math, json, re
from urllib.parse import urlparse
E=html.escape
ICONS={
'home':'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
'grid':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
'book':'<path d="M12 5v16M3 3c4 0 7 0 9 2 2-2 5-2 9-2v16c-4 0-7 0-9 2-2-2-5-2-9-2Z"/>',
'chat':'<path d="M21 11a9 9 0 0 1-13 8l-5 2 1-5A9 9 0 1 1 21 11Z"/><path d="M8 10h8M8 14h5"/>',
'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
'play':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m10 8 6 4-6 4Z"/>'}
def icon(name):return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'
def dock(case=False):
 items=[('home','inicio','Início'),('grid','projetos','Projetos'),('user','sobre','Sobre'),('book','escritos','Escritos'),('chat','contato','Contato')]
 return '<nav class="bottom-nav" aria-label="Navegação principal">'+''.join(f'<a href="/#{key}" data-destination="{key}"'+(' aria-current="page"' if case and key=='projetos' else '')+f'><span class="nav-icon">{icon(ic)}</span><span>{label}</span></a>' for ic,key,label in items)+'</nav>'
def text_paragraphs(text):
 # Keep every sentence. Introduce a paragraph break after two sentences for comfortable reading.
 parts=re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ý])',text)
 return ''.join('<p>'+E(' '.join(parts[n:n+2]))+'</p>' for n in range(0,len(parts),2))
def safe_url(url):
 return bool(url) and (url.startswith('/') and not url.startswith('//') or urlparse(url).scheme=='https')
def media(slot):
 title=E(slot['title']); caption=E(slot['caption']); typ=slot['type'];src=slot.get('src','')
 if typ=='gallery' and slot.get('items'):
  body='<div class="media-gallery">'+''.join(f'<button class="zoom-image" data-full="{E(x["src"],quote=True)}" data-caption="{E(x.get("alt",slot["title"]),quote=True)}" aria-label="Ampliar: {E(x.get("alt",slot["title"]),quote=True)}"><img src="{E(x["src"],quote=True)}" alt="{E(x.get("alt",""),quote=True)}" loading="lazy"><span>Ampliar ↗</span></button>' for x in slot['items'] if safe_url(x.get('src','')))+'</div>'
 elif safe_url(src):
  u=E(src,quote=True)
  if typ=='video':
   poster=f' poster="{E(slot["poster"],quote=True)}"' if safe_url(slot.get('poster','')) else ''
   body=f'<video controls playsinline preload="metadata"{poster} aria-label="{title}"><source src="{u}">Seu navegador não suporta este vídeo. <a href="{u}">Abrir vídeo</a></video>'
  else:
   body=f'<button class="zoom-image" data-full="{u}" data-caption="{title}" aria-label="Ampliar: {title}"><img src="{u}" alt="{E(slot.get("alt",slot["title"]),quote=True)}" loading="lazy"><span>Ampliar ↗</span></button>'
 else:
  return f'<figure class="media-slot" data-media-id="{E(slot["id"])}"><div class="media-placeholder">{icon("play" if typ=="video" else "image")}<div><span class="media-kicker">ESPAÇO PARA {"VÍDEO OU PROTÓTIPO" if typ=="video" else "IMAGENS DO PROCESSO"}</span><strong>{title}</strong><p>{caption}</p></div><span class="media-pending">Em breve</span></div></figure>'
 return f'<figure class="media-slot filled">{body}<figcaption><strong>{title}</strong><span>{caption}</span></figcaption></figure>'
def extras(c,stage):
 return ''.join('<details class="case-details"><summary>'+E(x['title'])+'<span aria-hidden="true">+</span></summary><div>'+''.join(text_paragraphs(p) for p in x['paragraphs'])+'</div></details>' for x in c.get('extras',{}).get(stage,[]))
def render_case(c,nxt,art):
 minutes=max(3,math.ceil(len(json.dumps(c,ensure_ascii=False).split())/210))
 jump=[('produto','O produto'),('implantacao','Desafios'),('s','Situação'),('t','Tarefa'),('a','Ação'),('r','Resultado'),('aprendizados','Aprendizados')]
 toc=''.join(f'<a href="#{k}">{label}</a>' for k,label in jump)
 sections=''
 stage_titles=[('s','S','Situação','O ponto de partida'),('t','T','Tarefa','Meu papel no desafio'),('a','A','Ação','As decisões e o caminho'),('r','R','Resultado','O que mudou — e o que ficou aberto')]
 for key,letter,label,title in stage_titles:
  if key=='a':
   content='<ol class="action-list">'+''.join(f'<li><span class="action-index">{i+1:02}</span><div><h3>{E(c.get("actionTitles",[])[i] if i<len(c.get("actionTitles",[])) else "Da intenção à prática")}</h3>{text_paragraphs(p)}</div></li>' for i,p in enumerate(c[key]))+'</ol>'
  else:content=text_paragraphs(c[key])
  if key=='r':content=f'<div class="result-callout"><strong>{E(c["metric"])}</strong><span>{E(c["metricLabel"])}</span></div>'+content
  visual=''
  if key=='a' and c.get('detail'):
   visual=media({'id':c['slug']+'-original','type':'image','src':'/assets/'+c['detail'],'title':'Registro do projeto','caption':'Material do portfólio original · '+c['name'],'alt':'Material original do projeto '+c['name']})
  slots=''.join(media(m) for m in c.get('media',[]) if m.get('stage')==key)
  prototype=f'<a class="text-link" href="{E(c["prototype"],quote=True)}" target="_blank" rel="noopener">Explorar o protótipo no Figma ↗</a>' if key=='a' and c.get('prototype') else ''
  sections+=f'<section class="case-chapter" id="{key}"><p class="chapter-label"><span>{letter}</span>{label}</p><h2>{title}</h2>{content}{extras(c,key)}{visual}{slots}{prototype}</section>'
 product_source=f'<a class="text-link" href="{E(c["productSource"],quote=True)}">Conheça o produto na Motorola ↗</a>' if c.get('productSource') else ''
 challenges=''.join(f'<article><span>{i+1:02}</span><div><h3>{E(t)}</h3>{text_paragraphs(p)}</div></article>' for i,(t,p) in enumerate(c['deployment']))
 source=f'<a class="text-link" href="{E(c["source"],quote=True)}">Ler o relato original ↗</a>' if c.get('source') else ''
 team='<div class="team-credit"><h3>Quem construiu junto</h3><p>'+E(c['team'])+'</p></div>' if c.get('team') else ''
 return f'''<main id="conteudo"><section class="case-hero section" id="inicio"><a class="back" href="/#projetos">← Voltar aos projetos</a><div class="case-status"><span>{E(c['status'])}</span><span>{minutes} min de leitura completa</span></div><p class="eyebrow">{E(c['name'])}</p><h1>{E(c['title'])}</h1><p class="case-intro">{E(c['intro'])}</p><div class="case-meta"><div><small>CLIENTE / CONTEXTO</small><p>{E(c['client'])}</p></div><div><small>MINHA ATUAÇÃO</small><p>{E(c['role'])}</p></div><div><small>PERÍODO</small><p>{E(c['period'])}</p></div></div><div class="case-quick"><div><small>O PROJETO EM POUCAS LINHAS</small><p>{E(c['summary'])}</p></div><div><small>PRINCIPAL ENTREGA / RESULTADO</small><strong>{E(c['metric'])}</strong><p>{E(c['metricLabel'])}</p><a href="#r">Entender o resultado ↓</a></div></div></section><div class="case-banner card-{c['slug']}">{art(c)}</div><details class="mobile-toc"><summary>Neste case <span aria-hidden="true">⌄</span></summary><nav aria-label="Índice do case no celular">{toc}</nav></details><div class="case-body"><aside class="case-index"><span>NESTE CASE</span><nav aria-label="Índice do case">{toc}</nav><a class="back-top" href="#inicio">Voltar ao topo ↑</a></aside><div class="case-narrative"><section class="case-chapter" id="produto"><p class="chapter-label">Antes de começar</p><h2>Que produto é esse?</h2>{text_paragraphs(c['product'])}<div class="audience"><strong>Para quem</strong><p>{E(c['audience'])}</p></div>{product_source}</section><section class="case-chapter" id="implantacao"><p class="chapter-label">Desafios de implantação</p><h2>O que tornava essa entrega complexa</h2><p class="chapter-lead">{E(c['challenge'])}</p><div class="challenge-list">{challenges}</div></section>{sections}<section class="case-chapter learning" id="aprendizados"><p class="chapter-label">O que ficou comigo</p><h2>Aprendizados para o próximo trampo</h2>{text_paragraphs(c['learning'])}{team}</section><aside class="evidence"><strong>Sobre este relato</strong><p>{E(c['evidence'])}</p>{source}</aside></div></div><a class="next-case section" href="/projetos/{nxt['slug']}/"><span>CONTINUE EXPLORANDO</span><h2>{E(nxt['name'])} ↗</h2><p>{E(nxt['summary'])}</p></a></main>'''
