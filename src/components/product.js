import merge from '../utils/merge';
import Component from '../component';
import Template from '../template';
import Checkout from './checkout';
import windowUtils from '../utils/window-utils';
import formatMoney from '../utils/money';

const pollInterval = 200;

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function isMedia(key) {
  return key.charAt(0) === '@';
}

const MAX_WIDTH = '950px';

const ENTER_KEY = 13;

const propertiesWhitelist = [
  'background',
  'background-color',
  'border',
  'border-radius',
  'color',
  'border-color',
  'border-width',
  'border-style',
  'transition',
  'text-transform',
  'text-shadow',
  'box-shadow',
  'font-size',
  'font-family',
];

function whitelistedProperties(selectorStyles) {
  return Object.keys(selectorStyles).reduce((filteredStyles, propertyName) => {
    if (isPseudoSelector(propertyName) || isMedia(propertyName)) {
      filteredStyles[propertyName] = whitelistedProperties(selectorStyles[propertyName]);
      return filteredStyles;
    }
    if (propertiesWhitelist.indexOf(propertyName) > -1) {
      filteredStyles[propertyName] = selectorStyles[propertyName];
    }
    return filteredStyles;
  }, {});
}

/**
 * Renders and fetches data for product embed.
 * @extends Component.
 */

export default class Product extends Component {

  /**
   * create Product.
   * @param {Object} config - configuration object.
   * @param {Object} props - data and utilities passed down from UI instance.
   */
  constructor(config, props) {
    super(config, props);
    this.defaultVariantId = config.variantId;
    this.cachedImage = null;
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, this.config.option.order);
    this.cart = null;
    this.modal = null;
    this.imgStyle = '';
    this.selectedQuantity = 1;
  }

  /**
   * get key for configuration object.
   * @return {String}
   */
  get typeKey() {
    return 'product';
  }

  /**
   * get class name for iframe element.
   * @return {String} iframe class.
   */
  get iframeClass() {
    return this.classes.product[this.options.layout];
  }

  /**
   * determines if product requries a cart component based on buttonDestination.
   * @return {Boolean}
   */
  get shouldCreateCart() {
    return this.options.buttonDestination === 'cart' || (this.options.buttonDestination === 'modal' && this.config.modalProduct.buttonDestination === 'cart');
  }

  /**
   * determines when image src should be updated
   * @return {Boolean}
   */
  get shouldUpdateImage() {
    return !this.cachedImage || (this.image && this.image.src && this.image.src !== this.cachedImage.src);
  }

  /**
   * get image for product and cache it. Return caches image if shouldUpdateImage is false.
   * @return {Object} image objcet.
   */
  get currentImage() {
    if (this.shouldUpdateImage) {
      this.cachedImage = this.image;
    }

    return this.cachedImage;
  }

  /**
   * get image for selected variant and size based on options or layout.
   * @return {Object} image object.
   */
  get image() {
    if (!this.model.selectedVariant || !this.model.selectedVariant.imageVariants) {
      return null;
    }

    if (this.options.imageSize) {
      return this.model.selectedVariant.imageVariants.filter((imageVariant) => imageVariant.name === this.options.imageSize)[0];
    }

    if (this.options.width && this.options.layout === 'vertical') {
      return this.model.selectedVariant.imageVariants.filter((image) => {
        const containerWidth = parseInt(this.options.width, 10);
        return parseInt(image.dimension, 10) >= containerWidth * 1.5;
      })[0];
    }

    return this.model.selectedVariant.imageVariants.filter((imageVariant) => imageVariant.name === 'grande')[0];
  }

  get shouldResizeX() {
    return false;
  }

  get shouldResizeY() {
    return true;
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedPrice() {
    if (!this.model.selectedVariant) {
      return '';
    }
    return formatMoney(this.model.selectedVariant.price, this.globalConfig.moneyFormat);
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedCompareAtPrice() {
    if (!this.model.selectedVariant) {
      return '';
    }
    return formatMoney(this.model.selectedVariant.compareAtPrice, this.globalConfig.moneyFormat);
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    return merge(this.model, this.options.viewData, {
      classes: this.classes,
      contents: this.options.contents,
      text: this.options.text,
      optionsHtml: this.optionsHtml,
      decoratedOptions: this.decoratedOptions,
      currentImage: this.currentImage,
      buttonClass: this.buttonClass,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.buttonEnabled,
      selectedQuantity: this.selectedQuantity,
      buttonText: this.buttonText,
      imgStyle: this.imgStyle,
      quantityClass: this.quantityClass,
      priceClass: this.priceClass,
      formattedPrice: this.formattedPrice,
      formattedCompareAtPrice: this.formattedCompareAtPrice,
    });
  }

  get buttonClass() {
    const disabledClass = this.buttonEnabled ? '' : this.classes.disabled;
    const quantityClass = this.options.contents.buttonWithQuantity ? this.classes.product.buttonBesideQty : '';
    return `${disabledClass} ${quantityClass}`;
  }

  get quantityClass() {
    return this.options.contents.quantityIncrement || this.options.contents.quantityDecrement ? this.classes.product.quantityWithButtons : '';
  }

  get buttonText() {
    if (!this.variantExists) {
      return this.options.text.unavailable;
    }
    if (!this.variantInStock) {
      return this.options.text.outOfStock;
    }
    return this.options.text.button;
  }

  get buttonEnabled() {
    return this.buttonActionAvailable && this.variantExists && this.variantInStock;
  }

  get variantExists() {
    return Boolean(this.model.selectedVariant);
  }

  get variantInStock() {
    return this.variantExists && this.model.selectedVariant.available;
  }

  get hasVariants() {
    return this.model.variants.length > 1;
  }

  get requiresCart() {
    return this.options.buttonDestination === 'cart';
  }

  get buttonActionAvailable() {
    return !this.requiresCart || Boolean(this.cart);
  }

  get hasQuantity() {
    return this.options.contents.quantityInput;
  }

  get priceClass() {
    return this.model.selectedVariant && this.model.selectedVariant.compareAtPrice ? this.classes.product.loweredPrice : '';
  }

  get wrapperClass() {
    return `${this.currentImage ? 'has-image' : 'no-image'} ${this.classes.product[this.options.layout]}`;
  }

  /**
   * get events to be bound to DOM.
   * @return {Object}
   */
  get DOMEvents() {
    return merge({}, {
      click: this.closeCartOnBgClick.bind(this),
      [`click ${this.selectors.option.select}`]: this.stopPropagation.bind(this),
      [`focus ${this.selectors.option.select}`]: this.stopPropagation.bind(this),
      [`click ${this.selectors.option.wrapper}`]: this.stopPropagation.bind(this),
      [`click ${this.selectors.product.quantityInput}`]: this.stopPropagation.bind(this),
      [`click ${this.selectors.product.quantityButton}`]: this.stopPropagation.bind(this),
      [`change ${this.selectors.option.select}`]: this.onOptionSelect.bind(this),
      [`click ${this.selectors.product.button}`]: this.onButtonClick.bind(this),
      [`click ${this.selectors.product.blockButton}`]: this.onButtonClick.bind(this),
      [`keyup ${this.selectors.product.blockButton}`]: this.onBlockButtonKeyup.bind(this),
      [`click ${this.selectors.product.quantityIncrement}`]: this.onQuantityIncrement.bind(this, 1),
      [`click ${this.selectors.product.quantityDecrement}`]: this.onQuantityIncrement.bind(this, -1),
      [`blur ${this.selectors.product.quantityInput}`]: this.onQuantityBlur.bind(this),
    }, this.options.DOMEvents);
  }

  /**
   * get HTML for product options selector.
   * @return {String} HTML
   */
  get optionsHtml() {
    if (!this.options.contents.options) {
      return '';
    }
    return this.decoratedOptions.reduce((acc, option) => {
      const data = merge(option, this.options.viewData);
      data.classes = this.classes;
      data.onlyOption = (this.model.options.length === 1);

      return acc + this.childTemplate.render({data});
    }, '');
  }

  /**
   * get product variants with embedded options
   * @return {Array} array of variants
   */
  get variantArray() {
    delete this.variantArrayMemo;
    this.variantArrayMemo = this.model.variants.map((variant) => {
      const betterVariant = {
        id: variant.id,
        available: variant.available,
        optionValues: {},
      };
      variant.optionValues.forEach((optionValue) => {
        betterVariant.optionValues[optionValue.name] = optionValue.value;
      });

      return betterVariant;
    });
    return this.variantArrayMemo;
  }

  /**
   * get selected values for options
   * @return {Object} object with option names as keys
   */
  get selections() {
    const selections = {};

    this.model.selections.forEach((selection, index) => {
      const option = this.model.options[index];
      selections[option.name] = selection;
    });

    return selections;
  }

  /**
   * determines whether an option can resolve to an available variant given current selections
   * @return {Boolean}
   */
  optionValueCanBeSelected(selections, name, value) {
    const variants = this.variantArray;
    const selectableValues = Object.assign({}, selections, {
      [name]: value,
    });

    const satisfactoryVariants = variants.filter((variant) => {
      const matchingOptions = Object.keys(selectableValues).filter((key) => {
        return variant.optionValues[key] === selectableValues[key];
      });
      return matchingOptions.length === Object.keys(selectableValues).length;
    });

    let variantSelectable = false;

    variantSelectable = satisfactoryVariants.reduce((variantExists, variant) => {
      const variantAvailable = variant.available;
      if (!variantExists) {
        return variantAvailable;
      }
      return variantExists;
    }, false);
    return variantSelectable;
  }

  /**
   * get options for product with selected value.
   * @return {Array}
   */
  get decoratedOptions() {
    const selections = this.selections;
    return this.model.options.map((option) => {
      return {
        name: option.name,
        values: option.values.map((value) => {
          return {
            name: value,
            selected: value === option.selected,
            disabled: !this.optionValueCanBeSelected(selections, option.name, value),
          };
        }),
      };
    });
  }

  /**
   * get info about variant to be sent to tracker
   * @return {Object}
   */
  get selectedVariantTrackingInfo() {
    const variant = this.model.selectedVariant;
    return {
      id: variant.id,
      name: variant.productTitle,
      quantity: this.model.selectedQuantity,
      sku: null,
      price: variant.price,
    };
  }

  /**
   * get configuration object for product details modal based on product config and modalProduct config.
   * @return {Object} configuration object.
   */
  get modalProductConfig() {
    let modalProductStyles;
    if (this.config.product.styles) {
      modalProductStyles = merge({}, Object.keys(this.config.product.styles).reduce((productStyles, selectorKey) => {
        productStyles[selectorKey] = whitelistedProperties(this.config.product.styles[selectorKey]);
        return productStyles;
      }, {}), this.config.modalProduct.styles);
    } else {
      modalProductStyles = {};
    }

    return Object.assign({}, this.config.modalProduct, {
      styles: modalProductStyles,
    });
  }

  /**
   * get params for online store URL.
   * @return {Object}
   */
  get onlineStoreParams() {
    return {
      channel: 'buy_button',
      referrer: encodeURIComponent(windowUtils.location()),
      variant: this.model.selectedVariant.id,
    };
  }

  /**
   * get query string for online store URL from params
   * @return {String}
   */
  get onlineStoreQueryString() {
    return Object.keys(this.onlineStoreParams).reduce((string, key) => {
      return `${string}${key}=${this.onlineStoreParams[key]}&`;
    }, '?');
  }

  /**
   * get URL to open online store page for product.
   * @return {String}
   */
  get onlineStoreURL() {
    const identifier = this.handle ? this.handle : this.id;
    return `https://${this.props.client.config.domain}/products/${identifier}${this.onlineStoreQueryString}`;
  }

  /**
   * open online store in new tab.
   */
  openOnlineStore() {
    this._userEvent('openOnlineStore');
    window.open(this.onlineStoreURL);
  }

  /**
   * initializes component by creating model and rendering view.
   * Creates and initalizes cart if necessary.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
  init(data) {
    return super.init.call(this, data).then((model) => (
      this.createCart().then((cart) => {
        this.cart = cart;
        if (model) {
          this.render();
        }
        return model;
      })
    ));
  }

  /**
   * renders string template using viewData to wrapper element.
   * Resizes iframe to match image size.
   */
  render() {
    super.render();
    if (this.iframe) {
      this.resizeUntilLoaded();
    }
  }

  /**
   * creates cart if necessary.
   * @return {Promise}
   */
  createCart() {
    const cartConfig = Object.assign({}, this.globalConfig, {
      node: this.globalConfig.cartNode,
      options: this.config,
    });

    if (this.shouldCreateCart) {
      return this.props.createCart(cartConfig);
    } else {
      return Promise.resolve(null);
    }
  }

  /**
   * fetches data if necessary.
   * Sets default variant for product.
   * @param {Object} [data] - data to initialize model with.
   */
  setupModel(data) {
    return super.setupModel(data).then((model) => {
      return this.setDefaultVariant(model);
    });
  }

  wrapTemplate(html) {
    let ariaLabel;
    switch (this.options.buttonDestination) {
    case 'modal':
      ariaLabel = 'View details';
      break;
    case 'cart':
      ariaLabel = 'Add to cart';
      break;
    default:
      ariaLabel = 'Buy Now';
    }

    if (this.options.isButton) {
      return `<div class="${this.wrapperClass} ${this.classes.product.product}"><div tabindex="0" role="button" aria-label="${ariaLabel}" class="${this.classes.product.blockButton}">${html}</div></div>`;
    } else {
      return `<div class="${this.wrapperClass} ${this.classes.product.product}">${html}</div>`;
    }
  }

  /**
   * fetch product data from API.
   * @return {Promise} promise resolving to model data.
   */
  sdkFetch() {
    if (this.id) {
      return this.props.client.fetchProduct(this.id);
    } else if (this.handle) {
      return this.props.client.fetchQueryProducts({handle: this.handle}).then((products) => products[0]);
    }
    return Promise.reject();
  }

  /**
   * call sdkFetch and set selected quantity to 0.
   * @throw 'Not Found' if model not returned.
   * @return {Promise} promise resolving to model data.
   */
  fetchData() {
    return this.sdkFetch().then((model) => {
      if (model) {
        model.selectedQuantity = 0;
        return model;
      }
      throw new Error('Not Found');
    });
  }

  /**
   * re-assign configuration and re-render component.
   * Resize iframe based on change in dimensions of product.
   * Update Cart or Modal components if necessary.
   * @param {Object} config - new configuration object.
   */
  updateConfig(config) {
    if (config.id || config.variantId) {
      this.id = config.id || this.id;
      this.defaultVariantId = config.variantId || this.defaultVariantId;
      this.init();
      return;
    }

    let layout = this.options.layout;

    if (config.options && config.options.product) {
      if (config.options.product.layout) {
        layout = config.options.product.layout;
      }

      if (layout === 'vertical' && this.iframe.width === MAX_WIDTH) {
        this.iframe.setWidth(this.options.width);
      }

      if (layout === 'horizontal' && this.iframe.width && this.iframe.width !== MAX_WIDTH) {
        this.iframe.setWidth(MAX_WIDTH);
      }

      if (config.options.product.width && layout === 'vertical') {
        this.iframe.setWidth(config.options.product.width);
      }

      if (config.options.product.layout) {
        this.iframe.el.style.width = '100%';
      }
    }

    if (this.iframe) {
      this.iframe.removeClass(this.classes.product.vertical);
      this.iframe.removeClass(this.classes.product.horizontal);
      this.iframe.addClass(this.classes.product[layout]);
      this.resizeUntilLoaded();
    }
    [...this.wrapper.querySelectorAll('img')].forEach((img) => {
      img.addEventListener('load', () => {
        this.resizeUntilLoaded();
      });
    });
    super.updateConfig(config);
    if (this.cart) {
      this.cart.updateConfig(config);
    }
    if (this.modal) {
      this.modal.updateConfig(Object.assign({}, config, {
        options: Object.assign({}, this.config, {
          product: this.modalProductConfig,
        }),
      }));
    }
  }

  /**
   * check size of image until it is resolved, then set height of iframe.
   */
  resizeUntilLoaded() {
    if (!this.iframe || !this.model.selectedVariantImage) {
      return;
    }
    const img = this.wrapper.getElementsByClassName(this.classes.product.img)[0];
    let intervals = 0;
    if (img) {
      const productResize = setInterval(() => {
        if (!img.naturalWidth && intervals < 30) {
          intervals++;
          return;
        }
        this.resize();
        clearInterval(productResize);
      }, pollInterval);
    }
  }

  /**
   * prevent events from bubbling if entire product is being treated as button.
   */
  stopPropagation(evt) {
    if (this.options.isButton) {
      evt.stopImmediatePropagation();
    }
  }

  onButtonClick(evt, target) {
    evt.stopPropagation();
    if (this.options.buttonDestination === 'cart') {
      this.props.closeModal();
      this._userEvent('addVariantToCart');
      this.props.tracker.trackMethod(this.cart.addVariantToCart.bind(this), 'CART_ADD', this.selectedVariantTrackingInfo)(this.model.selectedVariant, this.model.selectedQuantity);
      if (this.iframe) {
        this.props.setActiveEl(target);
      }
    } else if (this.options.buttonDestination === 'modal') {
      this.props.setActiveEl(target);
      this.openModal();
    } else if (this.options.buttonDestination === 'onlineStore') {
      this.openOnlineStore();
    } else {
      this._userEvent('openCheckout');
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(this.selectedQuantity));
    }
  }

  onBlockButtonKeyup(evt, target) {
    if (evt.keyCode === ENTER_KEY) {
      this.onButtonClick(evt, target);
    }
  }

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.updateVariant(name, value);
  }

  onQuantityBlur(evt, target) {
    this.updateQuantity(() => target.value);
  }

  onQuantityIncrement(qty) {
    this.updateQuantity((prevQty) => prevQty + qty);
  }

  closeCartOnBgClick() {
    if (this.cart && this.cart.isVisible) {
      this.cart.close();
    }
  }

  /**
   * create modal instance and initialize.
   * @return {Promise} promise resolving to modal instance
   */
  openModal() {
    if (!this.modal) {
      const modalConfig = Object.assign({}, this.globalConfig, {
        node: this.globalConfig.modalNode,
        options: Object.assign({}, this.config, {
          product: this.modalProductConfig,
          modal: Object.assign({}, this.config.modal, {
            googleFonts: this.options.googleFonts,
          }),
        }),
      });
      this.modal = this.props.createModal(modalConfig, this.props);
    }
    this._userEvent('openModal');
    return this.modal.init(this.model);
  }

  /**
   * update quantity of selected variant and rerender.
   * @param {Function} fn - function which returns new quantity given current quantity.
   */
  updateQuantity(fn) {
    let quantity = fn(this.selectedQuantity);
    if (quantity < 0) {
      quantity = 0;
    }
    this.selectedQuantity = quantity;
    this._userEvent('updateQuantity');
    this.render();
  }

  /**
   * Update variant based on option value.
   * @param {String} optionName - name of option being modified.
   * @param {String} value - value of selected option.
   * @return {Object} updated option object.
   */
  updateVariant(optionName, value) {
    const updatedOption = this.model.options.filter((option) => option.name === optionName)[0];
    updatedOption.selected = value;
    if (this.variantExists) {
      this.cachedImage = this.model.selectedVariantImage;
    }
    this.render();
    this._userEvent('updateVariant');
    return updatedOption;
  }

  /**
   * set default variant to be selected on initialization.
   * @param {Object} model - model to be modified.
   */
  setDefaultVariant(model) {
    if (!this.defaultVariantId) {
      return model;
    }

    const selectedVariant = model.variants.filter((variant) => variant.id === this.defaultVariantId)[0];
    if (selectedVariant) {
      model.options.forEach((option) => {
        option.selected = selectedVariant.optionValues.filter((optionValue) => optionValue.name === option.name)[0].value;
      });
    } else {

      // eslint-disable-next-line
      console.error('invalid variant ID');
    }
    return model;
  }
}
