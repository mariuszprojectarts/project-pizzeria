/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  // const classNames = {
  //   menuProduct: {
  //     wrapperActive: 'active',
  //     imageVisible: 'active',
  //   },
  // };

  // const settings = {
  //   amountWidget: {
  //     defaultValue: 1,
  //     defaultMin: 1,
  //     defaultMax: 9,
  //   }
  // };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

      // console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      //generate HTML based on template

      const generatedHTML = templates.menuProduct(thisProduct.data);
      // console.log('generatedHTML:', generatedHTML);

      //create element using unlits.createElementFromHTML

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      // console.log('thisProduct:', thisProduct);


      // find menu container   -> <div id="product-list" class="product-list container"></div>

      const menuContainer = document.querySelector(select.containerOf.menu);

      console.log('menuContainer:', menuContainer);

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
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      const clickableTigger = thisProduct.accordionTrigger; /// ???? do weryfikacji czy dobrze

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
      });
    }

    processOrder() {
      const thisProduct = this;

      //read all data from the form utils.serializeFormToObject      
      const formData = utils.serializeFormToObject(thisProduct.form);

      // save in variable price 
      let price = thisProduct.data.price;

      //create const with all params
      const params = thisProduct.data.params; /// undefined ?????
      console.log(params);

      //start loop for each elements params 
      for (paramId of params) {

        // save in const each param
        const param = paramId;

        // start second loop for each option
        for (let optionId of param.option) {

          //save each option
          const option = optionId;

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          // start IF option is selected & option is not default
          if (!option.default && optionSelected) {

            //add option price to let price
            price += option.price;

            // end first IF and start second IF option was not select and option is default
          } else if (option.default && !optionSelected) {

            //reduce price option from let price 
            price -= option.price;
          }
        }
      }
      // set this productc price with variable price 
      thisProduct.priceElem = price;
    }

  }

  const app = {

    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }

      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);

    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
