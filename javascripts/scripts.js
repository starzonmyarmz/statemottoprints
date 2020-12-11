document.addEventListener('click', ({target}) => {
  if (!target.closest('button')) return
  target.closest('button').classList.toggle('big')
})
