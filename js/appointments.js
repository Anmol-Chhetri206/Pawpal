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

document.querySelectorAll('.favorite').forEach(button => {
  button.addEventListener('click', () => {
    const saved = button.classList.toggle('saved');
    button.querySelector('i').className = saved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    button.setAttribute('aria-pressed', saved);
    showToast(saved ? 'Doctor saved to your favorites.' : 'Doctor removed from favorites.');
  });
});

document.querySelectorAll('.book-button-placeholder').forEach(button => {
  button.addEventListener('click', () => {
    showToast(`${button.dataset.doctor} selected — appointment times are ready.`);
    button.innerHTML = 'Selected <i class="fa-solid fa-check"></i>';
    setTimeout(() => { button.innerHTML = 'View availability <i class="fa-solid fa-arrow-right"></i>'; }, 2400);
  });
});

const BOOKING_STORAGE_KEY = 'pawpalVetBookings';
const bookingDialog = document.querySelector('#booking-dialog');
const bookingForm = document.querySelector('#booking-form');
const closeDialogButton = document.querySelector('.dialog-close');
const doctorField = document.querySelector('#booking-doctor');
const dateField = document.querySelector('#booking-date');
const timeField = document.querySelector('#booking-time');
const doctorImage = document.querySelector('#booking-doctor-image');
const bookingTitle = document.querySelector('#booking-title');
const doctorSpecialty = document.querySelector('#booking-doctor-specialty');
const dateOptions = document.querySelector('.date-options');
const timeOptions = document.querySelector('.time-options');
const selectionSummary = document.querySelector('#selection-summary');
const bookingsSection = document.querySelector('#saved-bookings');
const bookingsList = document.querySelector('.bookings-list');
const bookingCount = document.querySelector('.booking-count');

const timeSlots = [
  '9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM',
  '3:30 PM', '5:00 PM', '6:30 PM', '7:30 PM'
];

function getBookings() {
  try {
    const stored = JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  try {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch {
    showToast('This browser could not save the appointment.');
    return false;
  }
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(key) {
  return new Date(`${key}T00:00:00`);
}

function appointmentDates(startsTomorrow) {
  const dates = [];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (startsTomorrow) date.setDate(date.getDate() + 1);

  while (dates.length < 5) {
    if (date.getDay() !== 0) dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function updateSelectionSummary() {
  if (!dateField.value || !timeField.value) {
    selectionSummary.textContent = 'Choose a date and time';
    return;
  }

  const dateText = dateFromKey(dateField.value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const visitType = bookingForm.elements.visitType.value;
  selectionSummary.textContent = `${dateText} at ${timeField.value} · ${visitType}`;
}

function slotMinutes(time) {
  const [clock, period] = time.split(' ');
  let [hours, minutes] = clock.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function renderTimeOptions() {
  timeOptions.replaceChildren();
  timeField.value = '';
  const bookings = getBookings();
  const doctor = doctorField.value;
  const now = new Date();
  const isToday = dateField.value === localDateKey(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  timeSlots.forEach(time => {
    const isTaken = bookings.some(booking =>
      booking.doctor === doctor &&
      booking.date === dateField.value &&
      booking.time === time
    );
    const isPast = isToday && slotMinutes(time) <= currentMinutes;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-option';
    button.textContent = time;
    button.disabled = isTaken || isPast;
    if (isTaken) button.title = 'This time is already booked';
    if (isPast) button.title = 'This time has already passed';
    button.addEventListener('click', () => {
      timeOptions.querySelectorAll('.time-option').forEach(option => option.classList.remove('selected'));
      button.classList.add('selected');
      timeField.value = time;
      updateSelectionSummary();
    });
    timeOptions.append(button);
  });

  const firstAvailable = timeOptions.querySelector('.time-option:not(:disabled)');
  if (firstAvailable) firstAvailable.click();
  else updateSelectionSummary();
}

function renderDateOptions(startsTomorrow) {
  dateOptions.replaceChildren();
  dateField.value = '';

  appointmentDates(startsTomorrow).forEach((date, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-option';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    const dayName = index === 0 && !startsTomorrow
      ? 'Today'
      : date.toLocaleDateString(undefined, { weekday: 'short' });
    const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    button.innerHTML = `<span>${dayName}</span><strong>${dateLabel}</strong>`;
    button.addEventListener('click', () => {
      dateOptions.querySelectorAll('.date-option').forEach(option => {
        option.classList.remove('selected');
        option.setAttribute('aria-checked', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-checked', 'true');
      dateField.value = localDateKey(date);
      renderTimeOptions();
    });
    dateOptions.append(button);
  });

  dateOptions.querySelector('.date-option')?.click();
}

function openBookingDialog(button) {
  const card = button.closest('.vet-card');
  const doctor = button.dataset.doctor;
  const image = card.querySelector('.vet-photo img');
  const specialty = card.querySelector('.specialty').textContent;
  const startsTomorrow = card.querySelector('.availability').classList.contains('tomorrow');

  bookingForm.reset();
  doctorField.value = doctor;
  doctorImage.src = image.src;
  doctorImage.alt = doctor;
  bookingTitle.textContent = doctor;
  doctorSpecialty.textContent = specialty;
  renderDateOptions(startsTomorrow);
  updateSelectionSummary();

  if (typeof bookingDialog.showModal === 'function') bookingDialog.showModal();
  else bookingDialog.setAttribute('open', '');
}

function bookingCard(booking) {
  const card = document.createElement('article');
  card.className = 'saved-booking-card';

  const date = dateFromKey(booking.date);
  const dateBox = document.createElement('div');
  dateBox.className = 'saved-booking-date';
  const month = document.createElement('span');
  month.textContent = date.toLocaleDateString(undefined, { month: 'short' });
  const day = document.createElement('strong');
  day.textContent = date.getDate();
  dateBox.append(month, day);

  const details = document.createElement('div');
  details.className = 'saved-booking-details';
  const title = document.createElement('h3');
  title.textContent = booking.doctor;
  const meta = document.createElement('p');
  meta.className = 'booking-meta';
  meta.textContent = `${booking.time} · ${booking.visitType}`;
  const pet = document.createElement('p');
  pet.textContent = booking.reason
    ? `${booking.petName} (${booking.petType}) · ${booking.reason}`
    : `${booking.petName} (${booking.petType})`;
  details.append(title, meta, pet);

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'cancel-booking';
  cancel.setAttribute('aria-label', `Cancel appointment with ${booking.doctor}`);
  cancel.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  cancel.addEventListener('click', () => {
    if (!window.confirm(`Cancel ${booking.petName}'s appointment with ${booking.doctor}?`)) return;
    saveBookings(getBookings().filter(item => item.id !== booking.id));
    renderBookings();
    showToast('Appointment cancelled.');
  });

  card.append(dateBox, details, cancel);
  return card;
}

function renderBookings() {
  const bookings = getBookings().sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );
  bookingsList.replaceChildren(...bookings.map(bookingCard));
  bookingsSection.classList.toggle('has-bookings', bookings.length > 0);
  bookingCount.textContent = `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`;
}

document.querySelectorAll('.book-button').forEach(button => {
  button.addEventListener('click', () => openBookingDialog(button));
});

[...bookingForm.elements.visitType].forEach(option => {
  option.addEventListener('change', updateSelectionSummary);
});

closeDialogButton.addEventListener('click', () => bookingDialog.close());
bookingDialog.addEventListener('click', event => {
  if (event.target === bookingDialog) bookingDialog.close();
});

bookingForm.addEventListener('submit', event => {
  event.preventDefault();

  if (!dateField.value || !timeField.value) {
    showToast('Please choose an available date and time.');
    return;
  }

  const formData = new FormData(bookingForm);
  const existingBookings = getBookings();
  const conflict = existingBookings.some(booking =>
    booking.doctor === doctorField.value &&
    booking.date === dateField.value &&
    booking.time === timeField.value
  );

  if (conflict) {
    showToast('That time was just booked. Please select another slot.');
    renderTimeOptions();
    return;
  }

  const booking = {
    id: typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `booking-${Date.now()}`,
    doctor: doctorField.value,
    specialty: doctorSpecialty.textContent,
    date: dateField.value,
    time: timeField.value,
    visitType: formData.get('visitType'),
    petName: formData.get('petName').trim(),
    petType: formData.get('petType'),
    ownerName: formData.get('ownerName').trim(),
    phone: formData.get('phone').trim(),
    email: formData.get('email').trim(),
    reason: formData.get('reason').trim(),
    createdAt: new Date().toISOString()
  };

  existingBookings.push(booking);
  if (!saveBookings(existingBookings)) return;
  renderBookings();
  bookingDialog.close();
  showToast(`Appointment confirmed with ${booking.doctor}.`);
  bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

updateControls();
renderBookings();
