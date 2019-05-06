document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.product-thumbnail')) return

  document.querySelectorAll('.product-thumbnail').forEach((thumbnail) => {
    thumbnail.addEventListener('click', (event) => {
      document.querySelector('.product-thumbnail.selected').classList.remove('selected')

      document.querySelector('.product-image img').src = event.currentTarget.dataset.source
      thumbnail.classList.add('selected')
    })
  })
})

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('options')) return

  const price_element = document.querySelector('.product-price')
  const hyphen = /\s*-\s*/g
  const cents = /\s*.00/g

  let new_price

  price_element.dataset.basePrice = price_element.innerText

  document.getElementById('options').addEventListener('change', (event) => {
    new_price = event.currentTarget.selectedOptions[0].innerHTML

    if (new_price.split(hyphen)[1] == null) {
      price_element.innerHTML = price_element.dataset.basePrice
    } else {
      price_element.innerHTML = new_price.split(hyphen)[1].split(cents)[0]
    }
  })
})
