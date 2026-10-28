document.querySelectorAll('[data-menu-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const nav=document.querySelector('.nav');nav.classList.toggle('menu-open');btn.setAttribute('aria-expanded',nav.classList.contains('menu-open')?'true':'false')}));
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('[data-category]').forEach(card=>card.hidden=!(f==='all'||card.dataset.category.split(' ').includes(f)))}));
const fileInput=document.querySelector('#attachments');const fileNames=document.querySelector('[data-file-names]');if(fileInput&&fileNames){fileInput.addEventListener('change',()=>{const files=[...fileInput.files];fileNames.textContent=files.length?files.map(f=>`${f.name} (${(f.size/1024/1024).toFixed(2)} MB)`).join(' · '):'Nenhum arquivo selecionado.'})}
const form=document.querySelector('[data-contact-form]');if(form){form.addEventListener('submit',e=>{const phone=form.querySelector('[name="phone"]');if(phone&&!phone.value.trim()){phone.setCustomValidity('Informe um telefone ou WhatsApp para retorno.')}else if(phone){phone.setCustomValidity('')} });}


// Carrega projetos publicados pelo painel administrativo Decap CMS.
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
    grid.innerHTML = projects.map(project => {
      const category = String(project.category || 'grafico').replace(/[^a-z]/g, '');
      const title = String(project.title || 'Projeto Angá');
      const description = String(project.description || labels[category] || 'Projeto criativo');
      const image = String(project.image || '');
      const alt = String(project.alt || title);
      return `<article class="project" data-category="${category}"><div class="project-image"><img src="${image.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" alt="${alt.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" loading="lazy"></div><div class="project-info"><div><h2></h2><p></p></div><span class="project-tag">${labels[category] || 'Projeto'} ↗</span></div></article>`;
    }).join('');
    [...grid.querySelectorAll('.project')].forEach((card, index) => { card.querySelector('h2').textContent = projects[index].title || 'Projeto Angá'; card.querySelector('p').textContent = projects[index].description || labels[projects[index].category] || 'Projeto criativo'; });
    document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      const filter = btn.dataset.filter; grid.querySelectorAll('[data-category]').forEach(card=>card.hidden=!(filter==='all'||card.dataset.category===filter));
    }));
  } catch (error) { grid.innerHTML = '<p>Não foi possível carregar os projetos agora. Tente atualizar a página.</p>'; }
})();
