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

const formspreeEndpoint = 'https://formspree.io/f/mdeegyeq';

const setupFormspreeForm = form => {
  const submitButton = form.querySelector('[type="submit"]');
  const buttonLabel = submitButton.querySelector('.button-label');
  const success = form.querySelector('.form-success');
  const error = form.querySelector('.form-error');
  let submitting = false;
  let sent = false;

  form.addEventListener('input', () => {
    error.hidden = true;
    if (!sent) return;
    sent = false;
    submitButton.disabled = false;
    success.hidden = true;
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || sent || !form.reportValidity()) return;

    if (form.querySelector('[name="_gotcha"]').value) {
      form.reset();
      success.hidden = true;
      error.hidden = true;
      return;
    }

    submitting = true;
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    form.setAttribute('aria-busy', 'true');
    buttonLabel.textContent = 'Envoi en cours…';
    success.hidden = true;
    error.hidden = true;

    const data = new FormData(form);
    data.set('_subject', form.id === 'estimator' ? 'Demande d’estimation de projet TACNET' : 'Contact / demande de devis TACNET');

    if (form.id === 'estimator') {
      const selectedProject = form.querySelector('[name="project"]:checked');
      const selectedPages = form.querySelector('[name="pages"]:checked');
      const selectedFeatures = [...form.querySelectorAll('[name="feature"]:checked')]
        .map(input => input.closest('label').querySelector('span').textContent.trim());

      data.set('Type de projet', selectedProject.closest('label').querySelector('span').textContent.trim());
      data.set('Nombre de pages', selectedPages.closest('label').querySelector('span').textContent.trim());
      data.set('Fonctionnalités sélectionnées', selectedFeatures.length ? selectedFeatures.join(', ') : 'Aucune sélection');
      data.set('Estimation affichée - Budget', document.getElementById('estimate-budget').textContent.trim());
      data.set('Estimation affichée - Complexité', document.getElementById('estimate-complexity').textContent.trim());
      data.set('Estimation affichée - Délai', document.getElementById('estimate-time').textContent.trim());
    }

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const details = result?.errors?.map(item => item.message).filter(Boolean).join(' ');
        throw new Error(details || `Formspree a répondu avec le statut ${response.status}.`);
      }

      success.hidden = false;
      sent = true;
    } catch (requestError) {
      console.error('Échec de l’envoi Formspree :', requestError);
      error.hidden = false;
      submitButton.disabled = false;
    } finally {
      submitting = false;
      form.removeAttribute('aria-busy');
      submitButton.classList.remove('is-loading');
      buttonLabel.textContent = form.id === 'estimator' ? 'Envoyer ma demande d’estimation' : 'Envoyer ma demande';
    }
  });
};

document.querySelectorAll('form[data-formspree]').forEach(setupFormspreeForm);

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
  estimator.addEventListener('input', event => {
    if (event.target.matches('input[name="project"], input[name="pages"], input[name="feature"]')) updateEstimate();
  });
  updateEstimate();
}
