class AlansWebComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this.getAttributes()
    const contents = 
      this.template().content.cloneNode(true)
    this.shadowRoot.append(contents)
  }

  getAttributes() {
    this.attrs = {}
    const attrs = this.getAttributeNames()
    attrs.forEach((attr) => {
      if (attr.startsWith(':') === true) {
        this.attrs[attr.substring(1)] = this.getAttribute(attr)
      }
    })
  }

  template() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `
<div>ID: ${this.attrs.id}</div>
<div>Kebab Case Value: ${this.attrs['kebab-case-value']}</div>
`
    return template 
  }
}

customElements.define('aws-wc', AlansWebComponent)


