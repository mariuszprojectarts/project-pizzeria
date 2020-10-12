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

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      thisProduct.getElements();

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

      const menuContainer = document.querySelector(select.containerOf.menu);   // ?????? do wyjaśnienia co właściwie szuka

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

      const clickableTigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */

      clickableTigger.addEventListener('click', function (event) {

        /* prevent default action for event */

        event.preventDefault();

        /* toggle active class on element of thisProduct */

        thisProduct.element.classList.toggle('active');

        /* find all active products */

        const activeProducts = document.querySelectorAll('.product .active');


        /* START LOOP: for each active product */

        for (let activeProduct of activeProducts) {

          /* START: if the active product isn't the element of thisProduct */

          if (activeProduct != thisProduct.element) {

            /* remove class active for the active product */

            activeProduct.classList.remove('active')

            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */

        }

        /* END: click event listener to trigger */

      });


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