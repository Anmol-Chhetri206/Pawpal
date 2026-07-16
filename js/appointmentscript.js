const carousel = document.querySelector('.vet-carousel');
const prevButton = document.querySelector('.carousel-button.prev');
const nextButton = document.querySelector('.carousel-button.next');
const progressBar = document.querySelector('.progress-bar');
const countLabel = document.querySelector('#visible-count');
const filterButtons = document.querySelectorAll('.filter-chip');
const allCards = [...document.querySelectorAll('.vet-card')];

function visibleCards() {
  return allCards.filter(card => !card.hidden);
}

function cardStep() {
  const first = visibleCards()[0];
  if (!first) return carousel.clientWidth;
  return first.getBoundingClientRect().width + 24;
}

function updateControls() {
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  prevButton.disabled = carousel.scrollLeft <= 4;
  nextButton.disabled = carousel.scrollLeft >= maxScroll - 4 || maxScroll <= 0;
  const ratio = maxScroll > 0 ? carousel.scrollLeft / maxScroll : 1;
  const baseWidth = Math.min(100, (carousel.clientWidth / carousel.scrollWidth) * 100);
  progressBar.style.width = `${Math.min(100, baseWidth + ratio * (100 - baseWidth))}%`;
}

function moveCarousel(direction) {
  carousel.scrollBy({ left: direction * cardStep(), behavior: 'smooth' });
}

prevButton.addEventListener('click', () => moveCarousel(-1));
nextButton.addEventListener('click', () => moveCarousel(1));
carousel.addEventListener('scroll', updateControls, { passive: true });
window.addEventListener('resize', updateControls);
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); moveCarousel(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveCarousel(-1); }
});

let isDragging = false;
let startX = 0;
let startScroll = 0;
carousel.addEventListener('pointerdown', event => {
  if (event.target.closest('button')) return;
  isDragging = true;
  startX = event.clientX;
  startScroll = carousel.scrollLeft;
  carousel.setPointerCapture(event.pointerId);
});
carousel.addEventListener('pointermove', event => {
  if (isDragging) carousel.scrollLeft = startScroll - (event.clientX - startX);
});
carousel.addEventListener('pointerup', () => { isDragging = false; });
carousel.addEventListener('pointercancel', () => { isDragging = false; });

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    allCards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.specialty !== filter; });
    countLabel.textContent = visibleCards().length;
    carousel.scrollTo({ left: 0, behavior: 'smooth' });
    requestAnimationFrame(updateControls);
  });
});

const toast = document.querySelector('.toast');
let toastTimer;
function showToast(message) {
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

document.querySelectorAll('.book-button').forEach(button => {
  button.addEventListener('click', () => {
    showToast(`${button.dataset.doctor} selected — appointment times are ready.`);
    button.innerHTML = 'Selected <i class="fa-solid fa-check"></i>';
    setTimeout(() => { button.innerHTML = 'View availability <i class="fa-solid fa-arrow-right"></i>'; }, 2400);
  });
});

updateControls();
