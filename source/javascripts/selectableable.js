document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('')

  if (!select) return



  // Hide the #options element
  select.classList.add('options-are-hidden')



  // Build an object with all the available key/value pairs

  let lookup = {}
  let groups = {}

  select.querySelectorAll('option').forEach((opt) => {
    let lookup_key = []

    for (let pair of opt.innerText.split(/\s*,\s*/g)) {
      let [key, value] = pair.split(/\s*:\s*/g)

      lookup_key.push(value)

      if (!groups[key]) {
        groups[key] = new Set
      }

      groups[key].add(value)
    }

    lookup[lookup_key.join(', ')] = opt.value
  })



  // Build the html

  let fieldsets = []

  for (let key of Object.keys(groups)) {
    let fieldset = document.createElement('div')
    let legend = document.createElement('div')

    legend.className = 'selectableable_legend'
    legend.innerHTML = key

    fieldset.className = 'selectableable_fieldset selectableable_' + key
    fieldset.appendChild(legend)

    fieldsets.push(fieldset)

    for (let value of groups[key]) {
      let choice  = document.createElement('div')
      let input = document.createElement('input')
      let label = document.createElement('label')

      choice.className = 'selectableable_choice'

      input.type = 'radio'
      input.name = 'selectableable_' + key
      input.value = value
      input.id = 'selectableable_' + value.replace(/\s/, '_')
      input.className = 'selectableable_input'

      input.addEventListener('click', () => {
        let key = fieldsets.map((fieldset) => fieldset.querySelector('input:checked').value).join(', ')
        select.value = lookup[key]
      })

      label.className = 'selectableable_label'
      label.htmlFor = 'selectableable_' + value.replace(/\s/, '_')

      choice.appendChild(input)
      label.appendChild(document.createTextNode(value))
      choice.appendChild(label)
      fieldset.appendChild(choice)
    }

    document.getElementById('product-options').appendChild(fieldset)
    fieldset.querySelector('input').checked = true
  }
})
