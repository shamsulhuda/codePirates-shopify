class CollectionFiltersForm extends HTMLElement {
  constructor(){
    super();
    this.filterData = [];
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
    window.addEventListener('popstate', this.onHistoryChange.bind(this));

    this.bindActiveFacetButtonEvents();
  }

  renderProductGrid(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('CollectionProductGrid').innerHTML;

    document.getElementById('CollectionProductGrid').innerHTML = innerHTML;
  }
  // Get collection grid section
  getSections(){
    return [
      {
        id: 'main-collection-grid',
        section: document.getElementById('main-collection-grid').dataset.id,
      }
    ]
  }  
}
// End of class
customElements.define('collection-filters-form', CollectionFiltersForm);