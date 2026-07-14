const hostelCards = [...document.querySelectorAll('.hostel-card')];
const hostelFilters = document.querySelectorAll('.hostel-filter');
const hostelSearch = document.querySelector('#hostel-search');
const resultCount = document.querySelector('.hostel-result-count strong');
const emptyState = document.querySelector('.hostel-empty');
const hostelDialog = document.querySelector('.hostel-dialog');

let selectedService = 'all';

const updateHostelResults = () => {
  const searchTerm = hostelSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  hostelCards.forEach((card) => {
    const services = card.dataset.services.split(' ');
    const searchableText = `${card.dataset.name} ${card.dataset.location}`.toLowerCase();
    const matchesService = selectedService === 'all' || services.includes(selectedService);
    const matchesSearch = searchableText.includes(searchTerm);
    card.hidden = !matchesService || !matchesSearch;
    if (!card.hidden) visibleCount += 1;
  });

  resultCount.textContent = visibleCount;
  emptyState.hidden = visibleCount !== 0;
};

hostelFilters.forEach((button) => {
  button.addEventListener('click', () => {
    selectedService = button.dataset.filter;
    hostelFilters.forEach((filter) => filter.classList.toggle('is-active', filter === button));
    updateHostelResults();
  });
});

hostelSearch?.addEventListener('input', updateHostelResults);

document.querySelectorAll('.hostel-details-button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.hostel-card');
    hostelDialog.querySelector('#hostel-dialog-name').textContent = card.dataset.name;
    hostelDialog.querySelector('[data-hostel-dialog="location"]').textContent = card.dataset.location;
    hostelDialog.querySelector('[data-hostel-dialog="pets"]').textContent = card.dataset.pets;
    hostelDialog.querySelector('[data-hostel-dialog="services"]').textContent = card.dataset.serviceLabel;

    const phoneLink = hostelDialog.querySelector('.hostel-call');
    phoneLink.href = `tel:${card.dataset.phone.replace(/\s/g, '')}`;
    phoneLink.textContent = `Call ${card.dataset.phone}`;

    const websiteLink = hostelDialog.querySelector('.hostel-website');
    const hasWebsite = Boolean(card.dataset.website);
    websiteLink.hidden = !hasWebsite;
    if (hasWebsite) websiteLink.href = card.dataset.website;

    hostelDialog.showModal();
  });
});

hostelDialog?.addEventListener('click', (event) => {
  if (event.target === hostelDialog) hostelDialog.close();
});

updateHostelResults();
