const b = document.querySelector('.burger');
const ul = document.querySelector('nav ul');
if (b) b.addEventListener('click', () => {
  const o = ul.classList.toggle('open');
  b.setAttribute('aria-expanded', o);
});

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// Ouvre le client mail. Remplacez par Formspree/Netlify Forms pour un envoi direct.
const f = document.getElementById('contact-form');
if (f) f.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(f);
  const body = `Nom : ${d.get('nom')}\nSociété : ${d.get('societe')}\nTéléphone : ${d.get('tel')}\nEmail : ${d.get('email')}\n\n${d.get('message')}`;
  location.href = `mailto:tacnet-vidier@outlook.fr?subject=${encodeURIComponent('Demande de devis - ' + d.get('nom'))}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-ok').hidden = false;
});

const estimator = document.getElementById('estimator');
if (estimator) {
  const projectTypes = {
    vitrine: { title: 'Site vitrine', start: 300, complexity: 1 },
    catalogue: { title: 'Catalogue produits', start: 700, complexity: 2 },
    ecommerce: { title: 'Site e-commerce', start: 1000, complexity: 4 },
    refonte: { title: 'Refonte de site', start: null, complexity: 2 }
  };
  const pageRanges = {
    small: { start: 0, complexity: 0 },
    medium: { start: 150, complexity: 1 },
    large: { start: 350, complexity: 2 }
  };
  const featureRanges = {
    contact: { start: 0, complexity: 0 },
    gallery: { start: 0, complexity: 0 },
    maps: { start: 0, complexity: 0 },
    local: { start: 50, complexity: 0 },
    blog: { start: 120, complexity: 1 },
    products: { start: 200, complexity: 2 },
    accounts: { start: 200, complexity: 2 },
    orders: { start: 250, complexity: 2 },
    invoices: { start: 120, complexity: 1 },
    payments: { start: 150, complexity: 2 },
    custom: { start: 300, complexity: 3 }
  };
  const formatPrice = amount => `${amount.toLocaleString('fr-FR')} €`;
  const updateEstimate = () => {
    const projectKey = estimator.querySelector('input[name="project"]:checked').value;
    const pagesKey = estimator.querySelector('input[name="pages"]:checked').value;
    const project = projectTypes[projectKey];
    const pages = pageRanges[pagesKey];
    const selected = [...estimator.querySelectorAll('input[name="feature"]:checked')];
    let start = project.start;
    let complexity = project.complexity + pages.complexity;

    selected.forEach(input => {
      const feature = featureRanges[input.value];
      complexity += feature.complexity;
      if (start !== null) start += feature.start;
    });

    complexity += selected.length > 4 ? 1 : 0;
    if (start !== null) start += pages.start;

    const level = complexity <= 2 ? 'Simple' : complexity <= 5 ? 'Modérée' : 'Soutenue';
    const delay = projectKey === 'ecommerce' || complexity > 6
      ? '4 à 8 semaines'
      : complexity > 3
        ? '2 à 4 semaines'
        : '1 à 3 semaines';
    const budget = start === null ? 'Sur étude du projet' : `À partir de ${formatPrice(start)}`;

    document.getElementById('estimate-title').textContent = project.title;
    document.getElementById('estimate-budget').textContent = budget;
    document.getElementById('estimate-complexity').textContent = level;
    document.getElementById('estimate-time').textContent = delay;
    document.getElementById('estimate-note').textContent = projectKey === 'ecommerce'
      ? 'Budget indicatif à partir de 1 000 €. Le montant final dépend du catalogue, des fonctionnalités, des contenus et du niveau de personnalisation. Un devis précis est établi après étude du projet.'
      : projectKey === 'refonte'
        ? 'Le budget est établi après étude de l’existant, des fonctionnalités, des contenus et du niveau de personnalisation. La complexité et le délai restent indicatifs.'
      : 'Ce montant est un point de départ indicatif, ajusté selon les pages et fonctionnalités sélectionnées. Un devis précis est établi après échange sur votre projet.';
  };

  estimator.addEventListener('change', updateEstimate);
  updateEstimate();
}
