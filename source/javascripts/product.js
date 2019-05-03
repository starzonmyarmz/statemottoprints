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
