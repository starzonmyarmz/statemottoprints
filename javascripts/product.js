const cartButton = document.getElementById('add-to-cart')

document.addEventListener('change', ({target}) => {
  if (!target.closest('[data-price]')) return
  document.querySelector('.product-price-amount').innerText = target.dataset.price.replace('.00', '')
  cartButton.dataset.itemPrice = target.dataset.price
})

document.addEventListener('change', ({target}) => {
  if (!target.closest('[data-image]')) return
  cartButton.dataset.itemImage = target.dataset.image
})

document.querySelectorAll('.product-thumbnail').forEach((thumbnail) => {
  thumbnail.addEventListener('click', (event) => {
    document.querySelector('.product-thumbnail.selected').classList.remove('selected')
    document.querySelector('.product-image img').src = event.currentTarget.dataset.source
    thumbnail.classList.add('selected')
  })
})

document.addEventListener('change', ({target}) => {
  if (!target.closest('.product-choice-input')) return
  const fields = document.querySelectorAll('.product-choices').length
  const selected = document.querySelectorAll('.product-choice-input[type="radio"]:checked')

  if (fields === selected.length) {
    let productAttrs = []
    selected.forEach((option) => productAttrs.push(option.value))

    cartButton.dataset.itemId = `${cartButton.dataset.itemState}_${cartButton.dataset.itemType}_${productAttrs.join('_')}`
    cartButton.dataset.itemName = `${document.querySelector('.product-title').innerText} ${productAttrs.join(' ')}`
    cartButton.disabled = false
  }
})

document.addEventListener('input', ({target}) => {
  const input = target.closest('.product-choice-input')
  if (!input) return
  const color = input.value
  document.querySelectorAll('button.product-thumbnail').forEach((button) => {
    button.dataset.source.includes(color) ? button.click() : ''
  })
})
