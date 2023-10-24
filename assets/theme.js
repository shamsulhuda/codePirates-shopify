window.addEventListener("DOMContentLoaded",()=>{
  
    function currencyFormHandler(event){
      event.target.form.submit();
    }
    document.querySelectorAll('.shopify-currency-form').forEach((elm)=>{
      elm.addEventListener('change',currencyFormHandler);
    })
  })