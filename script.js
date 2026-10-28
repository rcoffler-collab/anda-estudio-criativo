document.querySelectorAll('[data-menu-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const nav=document.querySelector('.nav');nav.classList.toggle('menu-open');btn.setAttribute('aria-expanded',nav.classList.contains('menu-open')?'true':'false')}));
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('[data-category]').forEach(card=>card.hidden=!(f==='all'||card.dataset.category.split(' ').includes(f)))}));
const fileInput=document.querySelector('#attachments');const fileNames=document.querySelector('[data-file-names]');if(fileInput&&fileNames){fileInput.addEventListener('change',()=>{const files=[...fileInput.files];fileNames.textContent=files.length?files.map(f=>`${f.name} (${(f.size/1024/1024).toFixed(2)} MB)`).join(' · '):'Nenhum arquivo selecionado.'})}
const form=document.querySelector('[data-contact-form]');if(form){form.addEventListener('submit',e=>{const phone=form.querySelector('[name="phone"]');if(phone&&!phone.value.trim()){phone.setCustomValidity('Informe um telefone ou WhatsApp para retorno.')}else if(phone){phone.setCustomValidity('')} });}


// Carrega projetos do CMS e apresenta publicações em PageFlip ou mockups estáticos.
(async function loadPortfolio(){
  const grid = document.querySelector('[data-portfolio-grid]');
  if (!grid) return;
  const labels = {editorial:'Design editorial', identidade:'Identidade visual', grafico:'Materiais gráficos', digital:'Digital / Websites'};
  try {
    const response = await fetch('/content/portfolio.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Não foi possível carregar o portfólio');
    const data = await response.json();
    const projects = Array.isArray(data.projects) ? data.projects : [];
    if (!projects.length) { grid.innerHTML = '<p>Estamos preparando novos projetos para mostrar. Em breve, novidades por aqui.</p>'; return; }
    grid.innerHTML = projects.map((project,index) => {
      const category = String(project.category || 'grafico').replace(/[^a-z]/g, '');
      const presentation = project.presentation === 'pageflip' && project.pdf ? 'pageflip' : 'mockup';
      const title = String(project.title || 'Projeto Angá');
      const image = String(project.image || '');
      const alt = String(project.alt || title);
      return `<article class="project ${presentation==='pageflip'?'is-pageflip':''}" data-category="${category}"><div class="project-image" ${presentation==='pageflip'?'role="button" tabindex="0" data-open-flip="'+index+'"':''}><img src="${image.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" alt="${alt.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" loading="lazy"></div><div class="project-info"><div><h2></h2><p></p></div><span class="project-tag">${labels[category] || 'Projeto'} ↗</span></div></article>`;
    }).join('');
    [...grid.querySelectorAll('.project')].forEach((card,index) => { card.querySelector('h2').textContent = projects[index].title || 'Projeto Angá'; card.querySelector('p').textContent = projects[index].description || labels[projects[index].category] || 'Projeto criativo'; });
    document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const filter=btn.dataset.filter;grid.querySelectorAll('[data-category]').forEach(card=>card.hidden=!(filter==='all'||card.dataset.category===filter));}));
    grid.querySelectorAll('[data-open-flip]').forEach(el=>{const open=()=>openFlip(projects[Number(el.dataset.openFlip)]);el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}})});
  } catch (error) { grid.innerHTML = '<p>Não foi possível carregar os projetos agora. Tente atualizar a página.</p>'; }
})();

let activeFlip=null;
async function openFlip(project){
  const modal=document.querySelector('[data-flip-modal]'); if(!modal||!project?.pdf)return;
  modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('flip-open');
  const title=modal.querySelector('[data-flip-title]'), loading=modal.querySelector('[data-flip-loading]'), book=modal.querySelector('[data-flip-book]'), counter=modal.querySelector('[data-flip-counter]');
  title.textContent=project.title||'Publicação Angá';loading.hidden=false;loading.textContent='Preparando as páginas…';book.innerHTML='';counter.textContent='';
  try{
    if(!window.pdfjsLib||!window.St||!window.St.PageFlip)throw new Error('As bibliotecas do leitor não carregaram.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await window.pdfjsLib.getDocument(project.pdf).promise;
    const maxWidth=window.innerWidth<650?Math.max(240,window.innerWidth-42):420;
    const pageWidth=maxWidth,pageHeight=Math.round(pageWidth*1.414);
    for(let i=1;i<=pdf.numPages;i++){
      const page=await pdf.getPage(i);const viewport=page.getViewport({scale:1});const scale=Math.min(1.7,(pageWidth*2)/viewport.width);const vp=page.getViewport({scale});
      const wrap=document.createElement('div');wrap.className='page';wrap.dataset.density='soft';const canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);wrap.appendChild(canvas);book.appendChild(wrap);await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    }
    loading.hidden=true;
    activeFlip=new window.St.PageFlip(book,{width:pageWidth,height:pageHeight,size:'stretch',minWidth:240,maxWidth:pageWidth,minHeight:340,maxHeight:pageHeight,showCover:true,drawShadow:true,flippingTime:650,usePortrait:true,startPage:0,autoSize:true,maxShadowOpacity:.12});
    activeFlip.loadFromHTML(book.querySelectorAll('.page'));
    const update=()=>{counter.textContent=`Página ${Math.min(pdf.numPages,activeFlip.getCurrentPageIndex()+1)} de ${pdf.numPages}`;modal.querySelector('[data-flip-prev]').disabled=activeFlip.getCurrentPageIndex()===0;modal.querySelector('[data-flip-next]').disabled=activeFlip.getCurrentPageIndex()>=pdf.numPages-1};activeFlip.on('flip',update);update();
  }catch(e){loading.hidden=false;loading.textContent='Não foi possível abrir esta publicação. Verifique se o PDF está publicado e acessível.';console.error(e)}
}
function closeFlip(){const modal=document.querySelector('[data-flip-modal]');if(!modal)return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('flip-open');if(activeFlip){try{activeFlip.destroy()}catch(e){}activeFlip=null}modal.querySelector('[data-flip-book]').innerHTML='';}
document.querySelectorAll('[data-flip-close]').forEach(el=>el.addEventListener('click',closeFlip));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFlip()});document.querySelector('[data-flip-prev]')?.addEventListener('click',()=>activeFlip?.flipPrev());document.querySelector('[data-flip-next]')?.addEventListener('click',()=>activeFlip?.flipNext());document.querySelector('[data-flip-fullscreen]')?.addEventListener('click',()=>{const panel=document.querySelector('.flip-modal-panel');if(!document.fullscreenElement)panel?.requestFullscreen?.();else document.exitFullscreen?.()});
