document.querySelectorAll('.pawpal-site-header').forEach((header) => {
  const menuButton = header.querySelector('.pawpal-menu-toggle');
  const navigation = header.querySelector('.pawpal-nav-content');
  const services = header.querySelector('.pawpal-services');
  const servicesButton = header.querySelector('.pawpal-services-toggle');
  const accountAction = header.querySelector('.pawpal-nav-action');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isLoggedIn = localStorage.getItem('pawpalLoggedIn') === 'true';

  if (accountAction && isLoggedIn && currentPage !== 'index.html') {
    accountAction.textContent = 'Log Out';
    accountAction.setAttribute('aria-label', 'Log out of PawPal');
    accountAction.addEventListener('click', () => {
      localStorage.removeItem('pawpalLoggedIn');
    });
  }

  header.querySelectorAll('a[href]').forEach((link) => {
    const linkedPage = link.getAttribute('href').split('#')[0].split('/').pop();
    if (linkedPage === currentPage) {
      link.setAttribute('aria-current', 'page');
      if (link.closest('.pawpal-submenu')) servicesButton?.setAttribute('aria-current', 'page');
    }
  });

  const closeServices = () => {
    services?.classList.remove('is-open');
    servicesButton?.setAttribute('aria-expanded', 'false');
  };

  const closeMenu = () => {
    navigation?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation menu');
    closeServices();
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = !navigation.classList.contains('is-open');
    navigation.classList.toggle('is-open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  servicesButton?.addEventListener('click', () => {
    const willOpen = !services.classList.contains('is-open');
    services.classList.toggle('is-open', willOpen);
    servicesButton.setAttribute('aria-expanded', String(willOpen));
  });

  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuButton?.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) closeMenu();
  });

  header.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });
});
