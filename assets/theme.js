window.addEventListener("DOMContentLoaded",()=>{  
  function onChangeSubmitHandler(event){
    event.target.form.submit();
  }
  document.querySelectorAll('.shopify-currency-form, .language_selector').forEach((elm)=>{
    elm.addEventListener('change',onChangeSubmitHandler);
  })
})