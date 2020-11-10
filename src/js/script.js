/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      //console.log('new Product:', thisProduct);
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

      //console.log('menuContainer:', menuContainer);

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
      //console.log(price);


      //save const with all params
      const params = thisProduct.data.params;
      //console.log(params);



      //start loop for each elements params
      for (let paramId in params) {

        const param = params[paramId];

        //console.log(paramId);

        // save in const each param
        const options = params[paramId].options;
        //console.log(options);


        // start second loop for each option
        for (let optionId in options) {
          // debugger;
          //save each option
          const option = options[optionId];
          //console.log(optionId);


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

              // console.log('param', param);
              // console.log('params', params);
              // //console.log('paramlabel', param.label);
              //console.log('params[paramId]label', params[paramId].label);

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
      // console.log('params', thisProduct.params);

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

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue((thisWidget.input.value) ? thisWidget.input.value : settings.amountWidget.defaultValue);
      thisWidget.initActions();
      //console.log('AmountWidget:', thisWidget);
      //console.log('constuctor arguments:', element);
    }

    getElements(element) {

      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); // is not a function
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      // TODO: Add validatio
      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;

    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', (e) => {
        e.preventDefault();
        this.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', (e) => {
        e.preventDefault();
        this.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', (e) => {
        e.preventDefault();
        this.setValue(thisWidget.value + 1);
      });

    }

    announce() { // w metodzie do wyjaśnienia kwestia eventu "updated" - nie działało, funcjonalnośc działa na "click"

      const thisWidget = this;
      //debugger;
      const event = new CustomEvent('updated', {
        bubbles: true,
      });

      thisWidget.input.dispatchEvent(event);

      //console.log('event', event);

    }
  }

  class Cart {

    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;


    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

      for (let key of thisCart.renderTotalsKeys) {
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', () => {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('click', () => {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        console.log('thisCart.products', thisCart.products);

        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder(); // działa 
        console.log('click ORDER');


      });
    }

    add(menuProduct) {
      const thisCart = this;

      //generate HTML

      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log('generatedHTML', generatedHTML);

      // generate DOM element

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      // add dom element to the cart

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update() {

      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;


      for (const cartProduct of thisCart.products) {
        //console.log('product from thisCart.products :', cartProduct);
        thisCart.subtotalPrice += cartProduct.price;
        thisCart.totalNumber += cartProduct.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      // console.log('thisCart.totalNumber', thisCart.totalNumber);
      // console.log('thisCart.subtotalPrice', thisCart.subtotalPrice);
      // console.log('thisCart.totalPrice', thisCart.totalPrice);

      for (let key of thisCart.renderTotalsKeys) {
        for (let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }
    }

    remove(cartProduct) {

      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);
      console.log('index', index); // nie znajduje (-1)

      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();

      thisCart.update();

    }

    sendOrder() {

      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        adress: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        deliveryFee: thisCart.deliveryFee,
        totalPrice: thisCart.totalPrice,
        products: [],
      };

      const products = thisCart.products;

      for (let product of products) {
        payload.products.push(product.getData());

      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function (response) {
          return response.json();
        }).then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      // console.log('new CartProduct', thisCartProduct);
      // console.log('productData', menuProduct);

    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', () => {

        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.textContent = thisCartProduct.price;
      });
    }

    remove() {

      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('click remove');

    }

    initActions() {

      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', (event) => {
        event.preventDefault();

      });

      thisCartProduct.dom.remove.addEventListener('click', (event) => {

        event.preventDefault();

        thisCartProduct.remove();

      });
    }

    getData() {

      const thisCartProduct = this;

      return {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };
    }
  }


  const app = {

    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }

      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);

    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function (rawResponse) {
          return rawResponse.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);

          // save parsedResponse as thisApp.data.products

          thisApp.data.products = parsedResponse;

          // execute initMenu method

          thisApp.initMenu();

        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));

    },

    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();

      thisApp.initCart();
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}