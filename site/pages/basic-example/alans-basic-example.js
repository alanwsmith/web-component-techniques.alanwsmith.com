const componentStyles = document.createElement('style')
componentStyles.innerHTML = `
alans-basic-example {
  display: block;
  border: 1px solid red;
}`

document.head.appendChild(componentStyles)

class AlansBasicExample extends HTMLElement {
  constructor() {
    console.log("constructor")
    super()
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    console.log("connected")
    this.getColors()
    const contents = this.template().content.cloneNode(true)
    this.shadowRoot.append(this.styles())
    this.shadowRoot.append(contents)
  }

  getColors() {
    this.color = this.getAttribute('color') ? this.getAttribute('color') : 'purple'
  }

  template() {
    const template = this.ownerDocument.createElement('template')
    template.innerHTML = `<div>Ping</div>`
    return template 
  }

  styles() {
    const styles = document.createElement('style')
    styles.innerHTML = `div {
    background: blue;
    color: ${this.color};
}`
    return styles 
  }
}

customElements.define('alans-basic-example', AlansBasicExample)

