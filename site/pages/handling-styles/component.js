const componentStyles = document.createElement('style')
componentStyles.innerHTML = `
  aws-wc {
    display: inline-block;
  }
`

document.head.appendChild(componentStyles)

class AlansWebComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this.getColors()
    const contents = this.template().content.cloneNode(true)
    this.shadowRoot.append(this.styles())
    this.shadowRoot.append(contents)
  }

  getColors() {
    this.textColor = this.getAttribute('textColor') 
      ? this.getAttribute('textColor') 
      : 'inherit'
    this.backgroundColor = this.getAttribute('backgroundColor') 
      ? this.getAttribute('backgroundColor') 
      : 'blue'
  }

  template() {
    const template = this.ownerDocument.createElement('template')
    template.innerHTML = `<div>Ping</div>`
    return template 
  }

  styles() {
    const styles = document.createElement('style')
    styles.innerHTML = `
      div {
        background: ${this.backgroundColor};
        border-radius: 0.4rem;
        padding: 0.3rem;
        color: ${this.textColor};
      }
    `
    return styles 
  }
}

customElements.define('aws-wc', AlansWebComponent)

