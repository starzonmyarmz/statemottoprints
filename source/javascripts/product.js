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

  // Set data-price to price of item
  document.querySelector('#options option').dataset.price = price_element.innerText
  document.querySelectorAll('#options option:not(:first-child)').forEach((opt) => {
    if (opt.innerText.includes('$')) {
      opt.dataset.price = opt.innerText.split(hyphen)[1].split(cents)[0]
      opt.innerText = opt.innerText.split(hyphen)[0]
    } else {
      opt.dataset.price = document.getElementById('default-price').innerText
    }
  })

  // Change price display when selecting different items
  document.getElementById('options').addEventListener('change', (event) => {
    price_element.innerHTML = event.currentTarget.selectedOptions[0].dataset.price
  })
})
