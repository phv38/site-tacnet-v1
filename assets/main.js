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
