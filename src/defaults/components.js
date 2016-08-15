import productTemplates from '../templates/product';
import cartTemplates from '../templates/cart';
import optionTemplates from '../templates/option';
import toggleTemplates from '../templates/toggle';
import lineItemTemplates from '../templates/line-item';
import modalTemplates from '../templates/modal';

const defaults = {
  product: {
    iframe: true,
    buttonDestination: 'cart',
    manifest: ['product', 'option'],
    contents: {
      img: true,
      title: true,
      variantTitle: false,
      options: true,
      quantity: false,
      button: true,
      price: true,
      description: false,
    },
    templates: productTemplates,
    classes: {
      wrapper: 'product-wrapper',
      product: 'product',
      img: 'product__variant-image',
      imgButton: 'btn--img',
      button: 'btn',
      title: 'product__title',
      prices: 'product__price',
      price: 'product__actual-price',
      compareAt: 'product__compare-price',
      variantTitle: 'product__variant-title',
      description: 'product-description',
      options: 'product__variant-selectors',
      disabled: 'btn-disabled',
      quantity: 'quantity-container',
      quantityInput: 'quantity',
      quantityButton: 'btn--seamless',
    },
    text: {
      button: 'Add to cart',
    },
  },
  modalProduct: {
    iframe: false,
    contents: {
      img: true,
      title: true,
      variantTitle: true,
      price: true,
      options: true,
      quantity: false,
      button: true,
      description: true,
    },
    classes: {
      wrapper: 'modal-product-wrapper',
    },
    buttonDestination: 'cart',
  },
  modal: {
    iframe: true,
    manifest: ['modal', 'product', 'option'],
    classes: {
      modal: 'modal',
      contents: 'modal-contents',
      close: 'btn--close',
      wrapper: 'modal-wrapper',
      product: 'product-modal',
      img: 'modal-img',
      footer: 'modal-footer',
      scrollContents: 'modal-scroll-contents',
    },
    contents: {
      contents: true,
    },
    templates: modalTemplates,
  },
  productSet: {
    iframe: true,
    manifest: ['product', 'option', 'productSet'],
    contents: {
      title: false,
      products: true,
    },
    templates: {
      title: '<h2 class="{{data.classes.productSet.title}}">{{data.collection.attrs.title}}</h2>',
      products: '<div class="{{data.classes.productSet.products}}"></div>',
    },
    classes: {
      wrapper: 'collection-wrapper',
      productSet: 'collection',
      title: 'collection__title',
      collection: 'collection',
      products: 'collection-products',
      product: 'collection-product',
    },
  },
  option: {
    templates: optionTemplates,
    contents: {
      option: true,
    },
    classes: {
      option: 'option-select',
      wrapper: 'option-select-wrapper',
      select: 'option-select__select',
      label: 'option-select__label',
    },
  },
  cart: {
    iframe: true,
    templates: cartTemplates,
    manifest: ['cart', 'lineItem'],
    contents: {
      title: true,
      lineItems: true,
      footer: true,
    },
    classes: {
      wrapper: 'cart-wrapper',
      cart: 'cart',
      header: 'cart__header',
      title: 'cart__title',
      lineItems: 'cart-items',
      footer: 'cart-bottom',
      subtotalText: 'cart__subtotal__text',
      subtotal: 'cart__subtotal__price',
      notice: 'cart__notice',
      currency: 'cart__currency',
      button: 'btn btn--cart-checkout',
      close: 'btn--close',
      cartScroll: 'cart-scroll',
      emptyCart: 'cart-empty-text',
    },
    text: {
      title: 'Your cart',
      empty: 'Your cart is empty.',
      button: 'Checkout',
      total: 'Total',
      currency: 'CAD',
      notice: 'Shipping and discount codes are added at checkout.',
    },
  },
  lineItem: {
    templates: lineItemTemplates,
    contents: {
      image: true,
      variantTitle: true,
      title: true,
      price: true,
      quantity: true,
    },
    classes: {
      lineItem: 'cart-item',
      image: 'cart-item__image',
      variantTitle: 'cart-item__variant-title',
      itemTitle: 'cart-item__title',
      price: 'cart-item__price',
      quantity: 'quantity-container',
      quantityInput: 'quantity',
      quantityButton: 'btn--seamless',
    },
  },
  toggle: {
    templates: toggleTemplates,
    manifest: ['toggle'],
    iframe: true,
    contents: {
      count: true,
      icon: true,
      title: false,
    },
    classes: {
      wrapper: 'cart-toggle-wrapper',
      toggle: 'cart-toggle',
      title: 'cart-toggle__title',
      count: 'cart-toggle__count',
    },
    text: {
      title: 'cart',
    },
  },
  window: {
    height: 600,
    width: 600,
    toolbar: 0,
    scrollbars: 0,
    status: 0,
    resizable: 1,
    left: 0,
    top: 0,
    center: 0,
    createnew: 1,
    location: 0,
    menubar: 0,
    onUnload: null,
  },
};

export default defaults;
