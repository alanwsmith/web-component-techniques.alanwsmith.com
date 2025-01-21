class PageControllerComponent extends HTMLElement {
  constructor() {
    super()
    this.elements = {}
  }

  choose(el) {
    let elType = el.tagName.toLowerCase();
    let year = this.elements[elType][el.uuid].getAttribute('year')
    for (const uuid in this.elements[elType]) {
      const el = this.elements[elType][uuid]
      if (el.getAttribute('year') === year) {
        el.turnOn()
      } else {
        el.turnOff()
      }
    }
    // console.log(elType)
    // console.log(this.elements[elType])
    // let year = this.elements[elType][el.uuid]
    // console.log(year)
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
        if (this.release_year !== "") {
          detailEl.setAttribute("title", title.title)
          detailEl.setAttribute("year", title.release_year)
          this.list.appendChild(detailEl)
        }
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
    template.innerHTML = `<div class="wrapper">
      <button>${this.getAttribute('year')}</button>
      ${this.getAttribute('title')}
    </div>`
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    this.button = this.shadowRoot.querySelector("button")
    this.button.addEventListener('click', (event) => { 
      this.handleClick.call(this, event)
    })
    // this.button.
    // this.alfaCount = this.shadowRoot.querySelector('.alfa-count')
    // this.bravoCount = this.shadowRoot.querySelector('.bravo-count')
    // this.totalCount = this.shadowRoot.querySelector('.total-count')
  }

  addStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host { 
        display: inline-block;
        padding: 0.3rem;
        margin: 0.3rem;
      }
      .red {
        color: maroon;
      }`
    );
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }

  connectedCallback() {
    this.controller = document.querySelector('page-controller')
    this.controller.registerEl(this)
    this.addContent()
    this.wrapper = this.shadowRoot.querySelector('.wrapper')
    this.t = this.shadowRoot.querySelector('.title')
    this.year = this.shadowRoot.querySelector('.year')
    this.addStyles()
    this.update()
  }

  disconnectedCallback() {
    this.controller.removeEl(this)
  }

  handleClick(event) {
    this.controller.choose(this)
  }

  turnOff() {
    this.wrapper.classList.add("gray")
    this.wrapper.classList.remove("red")
  }

  turnOn() {
    this.wrapper.classList.add("red")
    this.wrapper.classList.remove("gray")
  }
}
customElements.define('title-detail', TitleDetailComponent)

