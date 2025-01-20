class PageControllerComponent extends HTMLElement {

  //   this.count += 1
  //   for (let checkId in this.instances) {
  //     if (checkId === instance.uuid) {
  //       this.instances[checkId].update(this.count)
  //     } else {
  //       this.instances[checkId].update("-")
  //     }
  //   }
  // }

  register(instance) {
    let instanceType = instance.tagName.toLowerCase();
    if (this.instances[instanceType] === undefined) {
      this.instances[instanceType] = {}
    }
    this.instances[instanceType][instance.uuid] = instance
    console.log(this.instances)
    //this.instances[instance.uuid] = instance
  }

  // static removeInstance(instance) {
  //   delete this.instances[instance.uuid]
  // }

  constructor() {
    super()
    this.counter = 0
    this.instances = {}
//    this.uuid = self.crypto.randomUUID()
 //   this.attachShadow({mode: 'open'})
  }

  // addContent() {
  //   const template = 
  //     this.ownerDocument.createElement('template')
  //   template.innerHTML = `<button>-</button>`
  //   const content = 
  //     template.content.cloneNode(true)
  //   this.shadowRoot.append(content)
  // }

  // addEventListeners() {
  //   this.button = this.shadowRoot.querySelector('button')
  //   this.button.addEventListener('click', (event) => {
  //     this.handleClick.call(this, event) 
  //   })
  // }

  // connectedCallback() {
  //   this.constructor.registerInstance(this)
  //   this.addContent()
  //   this.addEventListeners()
  // }

  // disconnectedCallback() {
  //   this.constructor.removeInstance(this)
  // }

  // handleClick(event) {
  //   this.constructor.increment(this)
  // }

  // update(value) {
  //   this.button.innerHTML = value
  // }

  //
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
  }

  addEventListeners() {
    this.button = this.shadowRoot.querySelector('button')
    this.button.addEventListener('click', (event) => {
      this.handleClick.call(this, event) 
    })
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.register(this)
    // this.constructor.registerInstance(this)
    this.addContent()
    this.addEventListeners()
  }

  disconnectedCallback() {
    this.constructor.removeInstance(this)
  }

  handleClick(event) {
    this.constructor.increment(this)
  }

  update(value) {
    this.button.innerHTML = value
  }
}

customElements.define('alfa-component', AlfaComponent)

