let interval

const timer = 7000

const swap_slides = () => {
  const prev = document.querySelector('.slide-visible')
  const prev_button = document.querySelector('.slide-button-visible')
  const next = document.querySelector('.slide-visible + .slide')
  const next_button = document.querySelector('.slide-button-visible + .slide-button')

  prev.classList.remove('slide-visible')
  prev_button.classList.remove('slide-button-visible')
  next ? next.classList.add('slide-visible') : document.querySelector('.slide').classList.add('slide-visible')
  next_button ? next_button.classList.add('slide-button-visible') : document.querySelector('.slide-button').classList.add('slide-button-visible')
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelectorAll('[data-slide]').length < 2) return

  let buttons = ''

  document.querySelectorAll('[data-slide]').forEach((slide, index) => {
    buttons += `<button type="button" class="slide-button" data-view-slide="${index + 1}">View slide ${index + 1}</button>`
  })

  document.getElementById('hero').insertAdjacentHTML('afterend', `
    <div class="slide-buttons">${buttons}</div>
  `)

  document.getElementById('hero').classList.add('slideshow-initiated')
  document.querySelector('[data-slide]').classList.add('slide-visible')
  document.querySelector('[data-view-slide]').classList.add('slide-button-visible')

  interval = setInterval(swap_slides, timer)
})

document.addEventListener('click', ({target}) => {
  if (!target.closest('[data-view-slide]')) return

  clearInterval(interval)

  document.querySelector('.slide-visible').classList.remove('slide-visible')
  document.querySelector(`.slide:nth-child(${target.closest('[data-view-slide]').dataset.viewSlide})`).classList.add('slide-visible')

  document.querySelector('.slide-button-visible').classList.remove('slide-button-visible')
  document.querySelector(`.slide-button:nth-child(${target.closest('[data-view-slide]').dataset.viewSlide})`).classList.add('slide-button-visible')

  interval = setInterval(swap_slides, timer)
})
