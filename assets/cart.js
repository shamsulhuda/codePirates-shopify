class RemoveFromCart extends HTMLElement {
  constructor(){
    super();
    this.addEventListener('click',(e)=>{
      e.preventDefault();
      this.closest('cart-items').updateQuantity(this.dataset.index,0);
    })
  }
}
customElements.define('cart-remove',RemoveFromCart);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender(){
    return [
      {
        id: 'main-cart-section',
        section: document.getElementById('main-cart-section').dataset.id,
        selector: '.js-contents'
      },
      {
        id: 'cart_counter',
        section: 'cart-counter',
        selector: '.shopify-section'
      },
      {
        id: 'cart-footer',
        section: document.getElementById('cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ]
  }

  updateQuantity(line, quantity, name){
    // Enable loading...
    console.log(name);
    this.loadingEnabled(line);
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state)=>{
        // debugger;
        const parsedState = JSON.parse(state);
        this.classList.toggle('is-empty', parsedState.item_count === 0);
        document.getElementById('cart-footer')?.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section=>{
          const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }))
        
        this.updateLiveRegions(line, parsedState.item_count);
        document.getElementById(`CartItem-${line}`)?.querySelector(`[name="${name}"]`)?.focus();
        this.loadingDisabled();
      }).catch((error)=>{
        console.log('ERROR:',error.message);
        this.loadingDisabled();
      })    
  }

  updateLiveRegions(line,itemCount){
    if (this.currentItemCount === itemCount) {
      document.getElementById(`Line-item-error-${line}`)
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          document.getElementById(`quantity-${line}`).value
        );
    }

    this.currentItemCount = itemCount;
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  loadingEnabled(line){
    console.log('The line:',line);
    document.getElementById('main-cart-section').classList.add('area--disabled');
    this.querySelectorAll('.loading-overlay')[line - 1].classList.remove('hidden');
    document.activeElement.blur();
  }
  loadingDisabled(){
    document.getElementById('main-cart-section').classList.remove('area--disabled');
  }
  
}

customElements.define('cart-items', CartItems);
