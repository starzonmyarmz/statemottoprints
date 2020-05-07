const cartButton = document.getElementById('add-to-cart')

document.addEventListener('change', ({target}) => {
  if (!target.closest('[data-price]')) return
  document.querySelector('.product-price-amount').innerText = target.dataset.price.replace('.00', '')
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
  if (!target.closest('[name="product-choice-dimension"]')) return
  cartButton.dataset.itemCustom1Value = target.value
})

document.addEventListener('change', ({target}) => {
  if (!target.closest('[name="product-choice-color"]')) return
  cartButton.dataset.itemCustom2Value = target.value
})

document.addEventListener('change', ({target}) => {
  if (!target.closest('[name="product-choice-size"]')) return
  cartButton.dataset.itemCustom3Value = target.value
})

document.addEventListener('change', ({target}) => {
  if (!target.closest('.product-choice-input')) return
  const fields = document.querySelectorAll('.product-choices').length
  const selected = document.querySelectorAll('.product-choice-input[type="radio"]:checked')
  cartButton.disabled = fields !== selected.length
})

// Change product image based on selected color
// document.addEventListener('input', ({target}) => {
//   const input = target.closest('.product-choice-input')
//   if (!input) return
//   const color = input.value
//   document.querySelectorAll('button.product-thumbnail').forEach((button) => {
//     button.dataset.source.includes(color) ? button.click() : ''
//   })
// })
