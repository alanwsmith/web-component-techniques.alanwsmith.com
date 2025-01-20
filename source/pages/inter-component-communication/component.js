class AlansWebComponent extends HTMLElement {

  static instances = {}

  static registerInstance(el) {
    this.instances[el.uuid] = el
  }

  static toggle(uuid) {
    for (let checkId in this.instances) {
      if (checkId === uuid) {
        this.instances[checkId].switchOn()
      } else {
        this.instances[checkId].switchOff()
      }
    }
  }

  constructor() {
    super()
    this.status = "OFF"
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `<button>${this.status}</button>`
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
  }

  addEventListeners() {
    this.button = this.shadowRoot.querySelector('button')
    this.button.addEventListener('click', (event) => {
      this.handleClick.call(this, event) 
    })
  }

  connectedCallback() {
    this.constructor.registerInstance(this)
    this.addContent()
    this.addEventListeners()
  }

  handleClick(event) {
    this.constructor.toggle(this.uuid)
  }

  switchOn() {
    this.button.innerHTML = "ON"
  }

  switchOff() {
    this.button.innerHTML = "OFF"
  }
}

customElements.define('alans-wc', AlansWebComponent)
