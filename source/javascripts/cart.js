document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('tr.cart-item').forEach((row) => {
    const pair = row.querySelector('[data-option]').innerText.split(',')[0].toLowerCase()

    if (pair.includes('color')) {
      row.querySelectorAll('img').forEach((img) => img.hidden = !img.src.includes(pair.split(': ')[1]))
    } else {
      row.querySelector('img').hidden = false
    }
  })
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-remove]')) return

  const product = event.target.closest('tr')
  const input = product.querySelector('input[id$="_qty"]')

  input.value = 0
  input.form.submit()
})
