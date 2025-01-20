class PageControllerComponent extends HTMLElement {

  constructor() {
    super()
    this.counters = {
      "alfa-component": 0,
      "bravo-component": 0,
    }
    this.elements = {}
  }

  increment(el) {
    let elType = el.tagName.toLowerCase();
    this.counters[elType] += 1;
    for (const uuid in this.elements['report-component']) {
      this.elements['report-component'][uuid].update()
    }
    for (const uuid in this.elements[elType]) {
      const checkEl = this.elements[elType][uuid]
      if (el.uuid === checkEl.uuid) {
        checkEl.update(this.counters[elType])
      } else {
        checkEl.update('-')
      }
    }
  }

  registerEl(el) {
    let elType = el.tagName.toLowerCase();
    if (this.elements[elType] === undefined) {
      this.elements[elType] = {}
    }
    this.elements[elType][el.uuid] = el 
  }

  removeEl(el) {
    let elType = el.tagName.toLowerCase();
    this.elements[elType][el.uuid].remove();
  }

  totalCount() {
    return this.counters['alfa-component'] + this.counters['bravo-component']
  }

}

customElements.define('page-controller', PageControllerComponent)

class AlfaComponent extends HTMLElement {

  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `<button>-</button>`
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    this.button = this.shadowRoot.querySelector('button')
    this.button.addEventListener('click', (event) => {
      this.handleClick.call(this, event) 
    })
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.registerEl(this)
    this.addContent()
  }

  disconnectedCallback() {
    this.controller.removeEl(this)
  }

  handleClick(event) {
    this.controller.increment(this)
  }

  update(value) {
    this.button.innerHTML = value
  }
}

customElements.define('alfa-component', AlfaComponent)


class BravoComponent extends HTMLElement {

  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `<button>-</button>`
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    this.button = this.shadowRoot.querySelector('button')
    this.button.addEventListener('click', (event) => {
      this.handleClick.call(this, event) 
    })
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.registerEl(this)
    this.addContent()
  }

  disconnectedCallback() {
    this.controller.removeEl(this)
  }

  handleClick(event) {
    this.controller.increment(this)
  }

  update(value) {
    this.button.innerHTML = value
  }
}

customElements.define('bravo-component', BravoComponent)

class ReportComponent extends HTMLElement {

  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `
      <div>Alfa Count: <span class="alfa-count"></span></div>
      <div>Bravo Count: <span class="bravo-count"></span></div>
      <div>Total Count: <span class="total-count"></span></div>
      `
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    this.alfaCount = this.shadowRoot.querySelector('.alfa-count')
    this.bravoCount = this.shadowRoot.querySelector('.bravo-count')
    this.totalCount = this.shadowRoot.querySelector('.total-count')
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.registerEl(this)
    this.addContent()
    this.update()
  }

  disconnectedCallback() {
    this.controller.removeEl(this)
  }

  handleClick(event) {
    this.controller.increment(this)
  }

  update() {
    this.alfaCount.innerHTML = this.controller.counters['alfa-component']
    this.bravoCount.innerHTML = this.controller.counters['bravo-component']
    this.totalCount.innerHTML = this.controller.totalCount()
  }
}

customElements.define('report-component', ReportComponent)
