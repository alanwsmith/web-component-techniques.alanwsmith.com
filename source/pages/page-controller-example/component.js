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
      let count = 0
      json.titles.forEach((title) => {
        const detailEl = document.createElement("title-detail")
        if (this.release_year !== "") {
          count += 1
          detailEl.setAttribute("title", title.title)
          detailEl.setAttribute("year", title.release_year)
          this.list.appendChild(detailEl)
        }
      })
      console.log(count)
      // TODO: Figure out error handling here
    }
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
      <button>${this.getAttribute('year')} 
      ${this.getAttribute('title')}</button>
    </div>`
    const content = 
      template.content.cloneNode(true)
    this.shadowRoot.append(content)
    this.button = this.shadowRoot.querySelector("button")
    this.button.addEventListener('click', (event) => { 
      this.handleClick.call(this, event)
    })
  }

  addStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host { 
        display: inline-block;
        padding: 0.3rem;
        margin: 0.3rem;
      }
      button {
        background: none;
        border: 1px solid #aaa; 
        color: inherit;
        padding-block: 0.5rem;
        padding-inline: 1rem;
      }
      .gray > button {
        border: 1px solid #333;
        color: #888;
      }
      .red > button {
        border: 1px solid maroon;
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
    this.addStyles()
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

