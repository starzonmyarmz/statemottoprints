document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-remove]')) return

  const product = event.target.closest('tr')
  const input = product.querySelector('input[id$="_qty"]')

  input.value = 0
  input.form.submit()
})
