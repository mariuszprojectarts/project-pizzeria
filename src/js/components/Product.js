import { templates, select, classNames } from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;

    //generate HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);

    //create element using unlits.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    // find menu container   -> <div id="product-list" class="product-list container"></div>
    const menuContainer = document.querySelector(select.containerOf.menu);

    // add element to menu
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTigger = thisProduct.accordionTrigger;

    /* START: click event listener to trigger */
    clickableTigger.addEventListener('click', function (event) {

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll('.product.active');

      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {

        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {

          /* remove class active for the active product */
          activeProduct.classList.remove('active');

          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    //read all data from the form utils.serializeFormToObject
    const formData = utils.serializeFormToObject(thisProduct.form);

    thisProduct.params = {};

    // save in variable price
    let price = thisProduct.data.price;

    //save const with all params
    const params = thisProduct.data.params;

    //start loop for each elements params
    for (let paramId in params) {

      const param = params[paramId];

      // save in const each param
      const options = params[paramId].options;

      // start second loop for each option
      for (let optionId in options) {

        //save each option
        const option = options[optionId];

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        // start IF option is selected & option is not default
        if (!option.default && optionSelected) {

          //add option price to let price
          price += options[optionId].price;

          // end first IF and start second IF option was not select and option is default
        } else if (option.default && !optionSelected) {

          //reduce price option from let price
          price -= options[optionId].price;
        }

        /* Img */

        const images = thisProduct.imageWrapper;

        const allImages = images.querySelectorAll(`.${paramId}-${optionId}`);

        if (optionSelected) {

          if (!thisProduct.params[paramId]) {

            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }

          thisProduct.params[paramId].options[optionId] = option.label;

          for (let image of allImages) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let image of allImages) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    //multiply price by ammount
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    // set this productc price with variable price
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget() {

    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', () => {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;