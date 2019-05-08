document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-toggle-nav]')) return
  document.body.classList.toggle('navigation-visible')
  document.getElementById('toggle-nav-menu').hidden = !document.getElementById('toggle-nav-menu').hidden
  document.getElementById('toggle-nav-x').hidden = !document.getElementById('toggle-nav-x').hidden
})
