document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-toggle-nav]')) return
  document.body.classList.toggle('navigation-visible')
  document.getElementById('toggle-nav-menu').hidden = !document.getElementById('toggle-nav-menu').hidden
  document.getElementById('toggle-nav-x').hidden = !document.getElementById('toggle-nav-x').hidden
})

const cart_count_observer = new MutationObserver((element) => {
  const count = element[0].target
  count.hidden = count.innerText === '0'
})
cart_count_observer.observe(document.querySelector('.cart-count'), { childList: true })
