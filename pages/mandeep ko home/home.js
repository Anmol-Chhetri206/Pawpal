const petsSlider = document.querySelector('.pets-slider');
const previousPetButton = document.querySelector('.prev-btn');
const nextPetButton = document.querySelector('.next-btn');

if (petsSlider && previousPetButton && nextPetButton) {
  const getSlideDistance = () => {
    const firstCard = petsSlider.querySelector('.pet-card');
    const sliderStyles = window.getComputedStyle(petsSlider);
    const gap = Number.parseFloat(sliderStyles.columnGap) || 0;

    return firstCard ? firstCard.getBoundingClientRect().width + gap : petsSlider.clientWidth;
  };

  const updateControls = () => {
    const maximumScroll = petsSlider.scrollWidth - petsSlider.clientWidth;
    previousPetButton.disabled = petsSlider.scrollLeft <= 2;
    nextPetButton.disabled = petsSlider.scrollLeft >= maximumScroll - 2;
  };

  const moveSlider = (direction) => {
    petsSlider.scrollBy({
      left: getSlideDistance() * direction,
      behavior: 'smooth'
    });
  };

  previousPetButton.addEventListener('click', () => moveSlider(-1));
  nextPetButton.addEventListener('click', () => moveSlider(1));

  petsSlider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveSlider(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  let updateFrame;
  petsSlider.addEventListener('scroll', () => {
    window.cancelAnimationFrame(updateFrame);
    updateFrame = window.requestAnimationFrame(updateControls);
  }, { passive: true });

  window.addEventListener('resize', updateControls);
  updateControls();
}
