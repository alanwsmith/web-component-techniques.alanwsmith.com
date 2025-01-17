class AlansWebComponentState {
  constructor() {
    if (!AlansWebComponentState.instance) {
      AlansWebComponentState.instance = this
    }
    this.instances = {}
    return AlansWebComponentState.instance
  }

  registerInstance(instance) {
    this.instances[instance.uuid] = instance
  }

  toggle(uuid) {
    for (let checkId in this.instances) {
      if (checkId === uuid) {
        this.instances[checkId].switchOn()
      } else {
        this.instances[checkId].switchOff()
      }
    }
  }
}

const globalState = new AlansWebComponentState()

class AlansWebComponent extends HTMLElement {
  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addEventListeners() {
    this.button = this.shadowRoot.querySelector('button')
    this.button.addEventListener('click', (event) => {
      this.handleClick.call(this, event) 
    })
  }

  connectedCallback() {
    globalState.registerInstance(this)
    this.status = "OFF"
    const contents = 
      this.template().content.cloneNode(true)
    this.shadowRoot.append(contents)
    this.addEventListeners()
  }

  handleClick(event) {
    globalState.toggle(this.uuid)
  }

  switchOn() {
    this.button.innerHTML = "ON"
  }

  switchOff() {
    this.button.innerHTML = "OFF"
  }

  template() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `<button>${this.status}</button>`
    return template 
  }
}

customElements.define('aws-wc', AlansWebComponent)
