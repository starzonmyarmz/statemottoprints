document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('')

  if (!select) return



  // Hide the #options element
  select.style.visibility = 'hidden'



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
    let fieldset = document.createElement('fieldset')
    let legend = document.createElement('legend')

    legend.className = 'selectableable_legend'
    legend.innerHTML = key

    fieldset.className = 'selectableable_fieldset'
    fieldset.appendChild(legend)

    fieldsets.push(fieldset)

    for (let value of groups[key]) {
      let input = document.createElement('input')
      let label = document.createElement('label')

      input.type = 'radio'
      input.name = 'selectableable_' + key
      input.value = value
      input.className = 'selectableable_input'

      input.addEventListener('click', () => {
        let key = fieldsets.map((fieldset) => fieldset.querySelector('input:checked').value).join(', ')
        select.value = lookup[key]
      })

      label.className = 'selectableable_label'
      label.appendChild(input)
      label.appendChild(document.createTextNode(value))

      fieldset.appendChild(label)
    }

    document.getElementById('product-options').appendChild(fieldset)
    fieldset.querySelector('input').checked = true
  }
})
