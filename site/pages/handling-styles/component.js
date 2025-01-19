class AlansWebComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `<div>Ping</div>`
    const contents = 
      template.content.cloneNode(true)
    this.shadowRoot.append(contents)
  }

  connectedCallback() {
    this.getAttributes()
    this.getColors()
    this.generateStyles()
    this.addContent()
  }

  generateStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host { 
        display: inline-block;
        background: ${this.colors['bg-color']};
        color: ${this.colors['text-color']};
        padding: 0.3rem;
      }`
    );
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }

  getAttributes() {
    this.attrs = {}
    const attrs = this.getAttributeNames()
    attrs.forEach((attr) => {
      if (attr.startsWith(':') === true) {
        this.attrs[attr.substring(1)] = 
          this.getAttribute(attr)
      }
    })
  }

  getColors() {
    this.colors = {
      'bg-color': 'blue',
      'text-color': 'inherit'
    }
    for (const color in this.colors) {
      if (this.attrs[color] !== undefined) {
        this.colors[color] = this.attrs[color]
      }
    }
  }
}

customElements.define('alans-wc', AlansWebComponent)
