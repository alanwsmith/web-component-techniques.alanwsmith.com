class PageControllerComponent extends HTMLElement {
  constructor() {
    super()
    this.elements = {}
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
}
customElements.define('page-controller', PageControllerComponent)


class TitleListComponent extends HTMLElement {
  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `<div class="titles"></div>`
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    this.list = this.shadowRoot.querySelector(".titles")
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.registerEl(this)
    this.addContent()
    this.getTitles()
  }

  disconnectedCallback() {
    this.controller.removeEl(this)
  }

  async getTitles() {
    let response = await fetch("data.json")
    if (!response.ok) {
      throw new Error('There was a problem getting the data')
    } else {
      let json = await response.json()
      json.titles.forEach((title) => {
        const detailEl = document.createElement("title-detail")
        detailEl.setAttribute("title", title.title)
        this.list.appendChild(detailEl)
        // console.log(title)
      })
      // TODO: Figure out error handling here
      // console.log(json)
    }
  }

  handleClick(event) {
    this.controller.increment(this)
  }

  update(value) {
    this.button.innerHTML = value
  }
}
customElements.define('title-list', TitleListComponent)

class TitleDetailComponent extends HTMLElement {
  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    // this.alfaCount = this.shadowRoot.querySelector('.alfa-count')
    // this.bravoCount = this.shadowRoot.querySelector('.bravo-count')
    // this.totalCount = this.shadowRoot.querySelector('.total-count')
  }

  addStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host { 
        background: maroon;
        display: inline-block;
        padding: 0.3rem;
        margin: 0.3rem;
      }`
    );
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.registerEl(this)
    this.addContent()
    this.addStyles()
    this.update()
  }

  disconnectedCallback() {
    this.controller.removeEl(this)
  }

  handleClick(event) {
    // this.controller.increment(this)
  }

  update() {
    this.shadowRoot.innerHTML = this.getAttribute("title")
    // this.alfaCount.innerHTML = this.controller.counters['alfa-component']
    // this.bravoCount.innerHTML = this.controller.counters['bravo-component']
    // this.totalCount.innerHTML = this.controller.totalCount()
  }
}
customElements.define('title-detail', TitleDetailComponent)

