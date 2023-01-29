// Mini cart code start
class MiniCart extends HTMLElement {
  constructor() {
    super();
    this.qtyCount = Array.from(document.querySelectorAll("[name='updates[]']"))
    .reduce((total,qtyInput) => total + parseInt(qtyInput.value),0);
    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);
    this.addEventListener('change',this.debouncedOnChange.bind(this))
  }
  onChange(event){
    this.qtyUpdate(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSections(){
    return [
      {
        id: 'header-cart',
        section: 'mini-cart',
        selector: '.js-contents',
      },
      {
        id: 'cart_counter',
        section: 'cart-counter',
        selector: '.shopify-section'
      }
    ]
  }

  qtyUpdate(line,qty,name){
    console.log(line,qty,name)
    const body = JSON.stringify({
      line,
      qty,
      name,
      sections: this.getSections().map((section)=> section.section),
      sections_url: window.location.pathname
    })

    fetch(`${routes.cart_change_url}`,{...fetchConfig(),...{body}})
    .then((response)=>{
      return response.text();
    })
    .then((state)=>{
      const parsedState = JSON.parse(state);
      this.classList.toggle('is-empty', parsedState.item_count === 0)
      this.getSections().forEach((section)=>{
        const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        console.log('Fatched Element::',elementToReplace);
        elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
      })      
    }).catch((error)=>{
      console.log('ERROR:',error.message);
    })  
  }

  updateLiveRegions(line,itemCount){    
    this.currentItemCount = itemCount;
  }
  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }
 
}
customElements.define('mini-cart', MiniCart);
// End of Mini cart code

(function ($) {  
  'use strict';

  /*----------- Quick view ---------- */
  $(document).on('click','.quick-view', function(){
    let handle = $(this).data('pro-handle');
    $(document).find('#quickview-inner').html('');
    jQuery.getJSON('/products/'+handle+'.js',function(product){
      console.log(product);
      let price;
      if(product.compare_at_price != null){
        price = `<s id="ComparePrice-product-template"><span class="money">${Shopify.formatMoney(product.compare_at_price)}</span></s>
        <span class="product-price__price product-price__price-product-template product-price__sale product-price__sale--single">
                <span id="ProductPrice-product-template"><span class="money">${Shopify.formatMoney(product.price)}</span></span>
              </span>`
      }else{
        price = `<span class="product-price__price product-price__price-product-template product-price__sale product-price__sale--single">
                <span id="ProductPrice-product-template"><span class="money">${Shopify.formatMoney(product.price)}</span></span>
              </span>`
      }
      let description = product.description

      description = jQuery.trim(description).substring(0, 1000)
            .split(" ").slice(0, -1).join(" ") + "...";
      
      const quickMarkup = `
      <div class="col-lg-6 col-md-6 col-sm-12 col-12">
        <div class="product-details-img">
            <div class="pl-20">
                <img class="blur-up lazyload" src="${product.featured_image}" alt="${product.title}"/>
            </div>
        </div>
    </div>
    <div class="col-lg-6 col-md-6 col-sm-12 col-12">
        <div class="product-single__meta">
          <h2 class="product-single__title">${product.title}</h2>
          <div class="prInfoRow">
            <div class="product-stock">${product.available == true ? '<span class="instock">In Stock</span>':'<span class="outstock">Unavailable</span>'} </div>
          </div>
          <p class="product-single__price product-single__price-product-template">
              <span class="visually-hidden">Regular price</span>
              ${price}
          </p>
          <div class="product-single__description rte">
             ${description}
          </div>
          <div class="product-form">
            <div class="swatch clearfix swatch-0 option1" data-option-index="0">
              <div class="product-form__item">                     
              ${product.options.map((option,index) =>
              `<label class="header ${option.name == 'Title' ? 'hide':''}">${option.name}: <span class="slVariant"></span></label>
              ${option.values.map((value, index) =>
                `<div data-value="${value}" class="swatch-element color ${value != 'Default Title' ? value+' available':'hide'}">
                  <input class="swatchInput" id="swatch-0-${value}" type="radio" name="option-${option.name}" value="${value}" ${index == 0 ? 'checked':''}>
                  <label class="${option.name == 'Color' ? 'swatchLbl color small':'swatchLbl medium rectangle'}" for="swatch-0-${value}" style="${option.name == 'Color' ? 'background-color:'+value:''}" title="${value}">${option.name == 'Color' ? '':value}</label>
                </div>`
                ).join('')}`
                ).join('')}
              </div>
            </div>
          </div>
          
          <form method="post" action="/cart/add" id="product_form_submit" accept-charset="UTF-8" class="product-form product-form-product-template hidedropdown" enctype="multipart/form-data">
            <!-- Product Action -->
            <div class="product-action clearfix">
                <select class="variant-selector" name="id">
                  ${product.variants.map((variant,index)=>
                    `<option value="${variant.id}">${variant.title}</option>`
                  ).join('')}
                </select>
                <div class="product-form__item--quantity">
                  <div class="wrapQtyBtn">
                    <div class="qtyField">
                      <a class="qtyBtn minus" href="javascript:void(0);"><i class="bi bi-dash" aria-hidden="true"></i></a>
                      <input type="text" id="Quantity" name="quantity" value="1" class="product-form__input qty">
                      <a class="qtyBtn plus" href="javascript:void(0);"><i class="bi bi-plus" aria-hidden="true"></i></a>
                    </div>
                  </div>
                </div>                                
                <div class="product-form__item--submit">
                  <button type="button" name="add" class="btn product-form__cart-submit">
                    <span>Add to cart</span>
                  </button>
                </div>
            </div>
            <!-- End Product Action -->
          </form>
        </div>
      </div>
      `;
      $(document).find('#quickview-inner').html(quickMarkup);
      $('#content_quickview').modal('show');
    });
  });

  //========================
  // variant picker
  //========================
  
  // $('.variant__selector').on('click', function(){
  //   let varId = $(this).attr('data-pr-id');
  //   console.log(varId);
  //   let addToCartBtn = $('.addToCartBtn');
  //   let btnId = $('.addToCartBtn').attr('data-product-id');
  //   // let available = $('#variant-inventory span');
  //   let pickedOptions = [];
  //   setTimeout(function(){
  //     $('.single_product-form__input-'+varId).each(function(index,item){
  //       let checkedOption = $(this).find('.variant__selector input:checked');
  //       if(checkedOption){
  //         pickedOptions.push(checkedOption.val());
  //       }
  //     })
      
  //     console.log(pickedOptions);

  //     let variantSelector = $('.single_product-form__variants option');    
  //       variantSelector.each(function(i){      
  //         if($(this).text().trim() == pickedOptions.join(" / ").trim()){        
  //           $(this).prop('selected', true);
  //           // console.log('Selected option: '+$(this).text().trim()+' : '+pickedOptions.join(" / ").trim()); 
  //           addToCartBtn.prop('disabled', false);
  //         }
  //       });
        
  //       if($('.single_product-form__variants').find(":selected").attr('sold-out') && btnId == varId){      
  //         addToCartBtn.prop('disabled', true);
  //       }else{
  //         addToCartBtn.prop('disabled', false);
  //       }

      
  //   }, 100)
  // });


})(jQuery);


