const adoptionTrack = document.querySelector('.adoption-track');
const adoptionCards = [...document.querySelectorAll('.adoption-card')];
const previousButton = document.querySelector('.adoption-prev');
const nextButton = document.querySelector('.adoption-next');
const filterButtons = document.querySelectorAll('.pet-filter');
const progressBar = document.querySelector('.adoption-progress span');
const countLabel = document.querySelector('.adoption-count strong');
const adoptionDialog = document.querySelector('.adoption-dialog');

if (adoptionTrack && previousButton && nextButton) {
  const visibleCards = () => adoptionCards.filter((card) => !card.hidden);

  const slideDistance = () => {
    const firstCard = visibleCards()[0];
    const gap = Number.parseFloat(getComputedStyle(adoptionTrack).columnGap) || 0;
    return firstCard ? firstCard.getBoundingClientRect().width + gap : adoptionTrack.clientWidth;
  };

  const updateCarousel = () => {
    const maximumScroll = Math.max(0, adoptionTrack.scrollWidth - adoptionTrack.clientWidth);
    const progress = maximumScroll === 0 ? 100 : (adoptionTrack.scrollLeft / maximumScroll) * 100;
    countLabel.textContent = visibleCards().length;
    previousButton.disabled = adoptionTrack.scrollLeft <= 2;
    nextButton.disabled = adoptionTrack.scrollLeft >= maximumScroll - 2;
    progressBar.style.width = `${Math.max(8, Math.min(100, progress))}%`;
  };

  const moveCarousel = (direction) => {
    adoptionTrack.scrollBy({ left: slideDistance() * direction, behavior: 'smooth' });
  };

  previousButton.addEventListener('click', () => moveCarousel(-1));
  nextButton.addEventListener('click', () => moveCarousel(1));

  adoptionTrack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveCarousel(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  let scrollFrame;
  adoptionTrack.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateCarousel);
  }, { passive: true });

  let dragStart = 0;
  let scrollStart = 0;
  let isDragging = false;

  adoptionTrack.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    isDragging = true;
    dragStart = event.clientX;
    scrollStart = adoptionTrack.scrollLeft;
    adoptionTrack.classList.add('is-dragging');
    adoptionTrack.setPointerCapture(event.pointerId);
  });

  adoptionTrack.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    adoptionTrack.scrollLeft = scrollStart - (event.clientX - dragStart);
  });

  const endDrag = () => {
    isDragging = false;
    adoptionTrack.classList.remove('is-dragging');
  };

  adoptionTrack.addEventListener('pointerup', endDrag);
  adoptionTrack.addEventListener('pointercancel', endDrag);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedType = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      adoptionCards.forEach((card) => {
        card.hidden = selectedType !== 'all' && card.dataset.type !== selectedType;
      });
      adoptionTrack.scrollTo({ left: 0, behavior: 'smooth' });
      countLabel.textContent = visibleCards().length;
      window.setTimeout(updateCarousel, 250);
    });
  });

  window.addEventListener('resize', updateCarousel);
  updateCarousel();

  const requestedPetId = new URLSearchParams(window.location.search).get('pet');
  const requestedPetCard = adoptionCards.find((card) => card.id === requestedPetId);

  if (requestedPetCard) {
    requestAnimationFrame(() => {
      const targetPosition = requestedPetCard.getBoundingClientRect().left
        - adoptionTrack.getBoundingClientRect().left
        + adoptionTrack.scrollLeft;
      adoptionTrack.scrollTo({ left: targetPosition, behavior: 'smooth' });
      window.setTimeout(updateCarousel, 500);
    });
  }
}

document.querySelectorAll('.pet-details-button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.adoption-card');
    const fields = ['breed', 'age', 'location', 'fee'];
    adoptionDialog.querySelector('#dialog-pet-name').textContent = card.dataset.name;
    fields.forEach((field) => {
      adoptionDialog.querySelector(`[data-dialog="${field}"]`).textContent = card.dataset[field];
    });
    const contactLink = adoptionDialog.querySelector('.dialog-contact');
    contactLink.href = `tel:${card.dataset.contact.replace(/\s/g, '')}`;
    contactLink.textContent = `Call ${card.dataset.contact}`;
    adoptionDialog.showModal();
  });
});

adoptionDialog?.addEventListener('click', (event) => {
  if (event.target === adoptionDialog) adoptionDialog.close();
});
