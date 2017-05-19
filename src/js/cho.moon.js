(function(){

/**
 * Generates unique string
 * @param  {object} data Data object
 * @return {string}      Unique string
 */
function uid(data) {
  if (!data) {
    console.error('uid: no data provided');
    return false;
  }
  var d = new Date();
  var str = window.btoa(JSON.stringify(data)+(Math.random() * d.valueOf() + ''));
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return window.btoa(hash).split('=').join('');
}

/**
 * Tests string on being valid email
 * @param  {string}  str String to test
 * @return {Boolean}
 */
function isEmail(str) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(str);
}

/**
 * Converts money string into operable integer in cents
 * @param  {string} amount Money string
 * @return {integer} Cents
 */
function fromMoney(amount) {
  var amt = amount.replace('-', '');
  var arr = amt.split('.');
  var str = '';

  switch (arr.length) {
    case 1:
      str += amt + '00';
      break;
    case 2:
      if (arr[1].length < 2) {
        arr[1] = arr[1] + '0';
      } else {
        arr[1] = arr[1].slice(0, 2);
      }
      str += arr.join('');
      break;
    default:
      console.error('fromMoney: too many dots.')
      break;
  }

  return parseInt(str, 10);
}

/**
 * Converts cents integer into money string
 * @param  {integer} amount Cents
 * @return {string} Money string
 */
function toMoney(amount) {
  var str = '' + amount;
  switch (str.length) {
    case 0:
      console.error('toMoney: wrong amount');
      return false;
      break;
    case 1:
      return '0.0' + str;
      break;
    case 2:
      return '0.' + str;
      break;
    default:
      return str.slice(0, -2) + '.' + str.slice(-2);
      break;
  }
}

/**
 * Calculates specified percentage of provided value
 * @param  {number} percents
 * @param  {number} ofValue
 * @return {integer}
 */
function percentage(percents, ofValue) {
  var result = ( ofValue / 100 ) * percents;
  return  result.toFixed();
}

Moon.config.silent = true;

/**
 * Moon compiled templates
 * @type {Object}
 */
var compiled = {
  choAddress: Moon.compile(
    document
      .querySelector('#tpl-cho-address')
      .innerHTML
      .trim()
  ),
  choDetails: Moon.compile(
    document
      .querySelector('#tpl-cho-details')
      .innerHTML
      .trim()
  ),
  choPicture: Moon.compile(
    document
      .querySelector('#tpl-cho-picture')
      .innerHTML
      .trim()
  ),
  choMethod: Moon.compile(
    document
      .querySelector('#tpl-cho-method')
      .innerHTML
      .trim()
  ),
  choPaymentDetails: Moon.compile(
    document
      .querySelector('#tpl-cho-payment-details')
      .innerHTML
      .trim()
  )
}

Moon.component('cho-address', {
  props: ['value'],
  render: compiled.choAddress,
});
Moon.component('cho-details', {
  props: ['value'],
  render: compiled.choDetails,
});
Moon.component('cho-picture', {
  props: ['picture', 'title'],
  render: compiled.choPicture,
});
Moon.component('cho-method', {
  props: ['method'],
  render: compiled.choMethod,
});
Moon.component('cho-payment-details', {
  props: ['value', 'display'],
  render: compiled.choPaymentDetails,
  computed: {
    isExpired: {
      get: function() {
        var v = this.get('value');
        var now = new Date();
        return now.getFullYear() > parseInt('20'+v.expY, 10) &&
          now.getMonth() > parseInt(v.expM, 10)
        ;
      }
    },
    paypalShortLogin: {
      get: function() {
        var v = this.get('value');
        if (!v.name.length) return 'Not logged in';
        if (v.name.length < 18) {
          return v.name;
        } else {
          return v.name.slice(0, 15) + '...';
        }
      }
    },
    displayValue: {
      get: function() {
        var v = this.get('value');
        var d = this.get('display');
        return v.type === 'paypal' & d === 'inline'
      }
    }
  }
});

var cho = new Moon({
  hooks: {
    init: function() {
      var self = this;

      window.callback = function(data) {
        var location = {
          city: data.city,
          country: data.country_name
        };
        self.set('shipping.currentLocation', location);
        self.set('geoData', data);
        delete window.callback;
      }
      var dataScript = document.createElement('script');
      dataScript.type = 'text/javascript';
      dataScript.src = 'https://geoip-db.com/jsonp';
      var firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(dataScript, firstScript);

      var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
      var years = ['17','18','19','20','21','22','23','24'];
      self.set('months', months);
      self.set('years', years);
    }
  },
  el: '#checkout',
  data: {
    geoData: false,
    allCountries: ['Cameroon', 'Canada', 'Ghana', 'France', 'United States', 'Ukraine'],
    allCodes: ['+237', '+1', '+233', '+33', '+38'],
    cart: {
      trigger: false,
      path: 'closed', // 'closed', 'open'
      action: 'View',
      values: [{
        id: 1,
        title: 'Galaxy S7',
        params: {
          size: 'S',
          color: 'Black'
        },
        price: '450.75',
        picture: '../img/product-3.jpg',
        quantity: 1
      }]
    },
    shipping: {
      path: 'closed', // 'closed', 'pickup', 'address', 'location', 'open'
      action: 'Add', // 'Add', 'Edit'
      values: [],
      currentValue: false,
      currentPoint: {id: 0},
      editableLocation: {
        country: '',
        city: ''
      },
      editableAddress: {
        country: '',
        city: '',
        fullName: '',
        line1: '',
        line2: '',
        code: '',
        phone: '',
        zip: '',
        isPrimary: false,
        type: 'address',
        id: ''
      },
      emptyAddress: {
        country: '',
        city: '',
        fullName: '',
        line1: '',
        line2: '',
        code: '',
        phone: '',
        zip: '',
        isPrimary: false,
        type: 'address',
        id: ''
      },
      currentLocation: false,
      points: [{
        id: 1,
        type: 'pickup',
        city: 'Bamenda',
        country: 'Cameroon',
        title: 'Niki Mash International',
        line1: '4200 Quiet Str',
        line2: 'Small Mankon, NWR'
      },{
        id: 2,
        type: 'pickup',
        city: 'Bamenda',
        country: 'Cameroon',
        title: 'Post Office',
        line1: ' 249 Ngwafang Street, NWR'
      },{
        id: 11,
        type: 'pickup',
        city: 'Yaounde',
        country: 'Cameroon',
        title: 'Happy Mall',
        line1: '18 Main Street'
      },{
        id: 101,
        type: 'pickup',
        city: 'Accra',
        country: 'Ghana',
        title: 'Stop Point',
        line1: '5 Fifth Ave'
      },{
        id: 121,
        type: 'pickup',
        fullName: '',
        city: 'Ternopil',
        country: 'Ukraine',
        title: 'Podolyany Mall',
        line1: '28 Podil\'ska Street'
      },{
        id: 141,
        type: 'pickup',
        city: 'Fort Worth',
        country: 'United States',
        title: 'La Gran Plaza',
        line1: '4200 South Fwy'
      }],
    },

    payment: {
      path: 'closed',
      // 'closed', 'open', 'add',
      // 'zcedit', 'zcdeposit', 'zccard', 'zcpp',
      // 'ccedit',
      // 'pplogin', 'ppedit'

      selectedMethod: '',
      // '', 'zcedit', 'ccedit', 'ppedit'

      selectedCreditCard: false,

      zaction: 'Activate',
      // 'Activate', 'Edit'

      caction: 'Add Credit Card',
      // 'Add Credit Card', 'Edit Credit Card', 'Add Card to Load with'

      ppaction: 'Login to PayPal',
      // 'Login to PayPal', 'Login to PayPal to Load with'
      // 'Edit PayPal', 'Edit PayPal to Load with'

      pp: {
        login: '',
        pass: '',
        currentCard: false,
        cards: false,
        loggedIn: false
      },

      creditFromCard: '',
      creditFromPaypal: '',

      currentValue: false,
      // currentValue: {
      //   id: 'fe6ac9',
      //   num1: '1212',
      //   num2: '1212',
      //   num3: '1231',
      //   num4: '2312',
      //   expM: '02',
      //   expY: '19',
      //   name: 'ZIZIUP Elite Card',
      //   cvv: '1234',
      //   primary: false,
      //   type: 'zcard',
      //   credit: '2000.00'
      // },

      values: [],
      // values: [{
      //   id: 'fe6ac9',
      //   num1: '1212',
      //   num2: '1212',
      //   num3: '1231',
      //   num4: '2312',
      //   expM: '02',
      //   expY: '19',
      //   name: 'ZIZIUP Elite Card',
      //   cvv: '1234',
      //   primary: false,
      //   type: 'zcard',
      //   credit: '2000.00'
      // },{
      //   id: 'sd81udas',
      //   num1: '8787',
      //   num2: '9898',
      //   num3: '4646',
      //   num4: '1010',
      //   expM: '11',
      //   expY: '20',
      //   name: 'Roland Omene',
      //   cvv: '123',
      //   primary: false,
      //   type: 'visa',
      //   credit: ''
      // }],

      editableCard: {
        id: '',
        num1: '',
        num2: '',
        num3: '',
        num4: '',
        expM: '',
        expY: '',
        name: '',
        cvv: '',
        primary: false,
        type: '',
        credit: ''
      },
      emptyCard: {
        id: '',
        num1: '',
        num2: '',
        num3: '',
        num4: '',
        expM: '',
        expY: '',
        name: '',
        cvv: '',
        primary: false,
        type: '', // '','cc','zcard','visa','mastercard', 'paypal'
        credit: ''
      }
    },

    donation: {
      path: 'closed', // 'closed', 'open', 'list'
      currentValue: '0.00',
      values: ['0.00', '1.00', '2.50', '5.00', '10.00'],
      currentCharity: {
        id: 1,
        title: 'The Red Cross'
      },
      charities: [{
        id: 1,
        title: 'The Red Cross'
      },{
        id: 2,
        title: 'Bill & Melinda Gates Foundation'
      },{
        id: 3,
        title: 'The Salvation Army'
      }]
    }
  },





  methods: {

    /**
     * Navigates to specific screen
     * @param  {string} module      Module to navigate
     * @param  {string} destination Screen to switch to
     * @return {void}
     */
    navigate: function(module, destination) {
      this.set(module + '.path', destination);
    },

    //
    // PAYMENT
    //

    /**
     * Changes selected payment method
     * @param  {string} method [description]
     * @return {[type]}        [description]
     */
    changeSelectedMethod: function(method) {
      this.set('payment.selectedMethod', method);
    },

    /**
     * Deselects previously selected payment method
     * @return {void}
     */
    unselectPaymentMethod: function() {
      var path = this.get('payment').values.length
        ? 'open'
        : 'closed'
      ;
      this.set('payment.selectedMethod', '');
      this.set('payment.path', path);
    },

    /**
     * Moves focus onto next CC number input
     * @param  {InputEvent} e Event
     * @return {void}
     */
    limitCardLength: function(e) {
      var el = e.target;
      if (el.nextElementSibling &&
          el.value.length === 4 &&
          el.nextElementSibling.value.length === 0) {
        e.target.nextElementSibling.focus()
      }
      if (el.value.length > 4) {
        el.value = el.value.slice(0, 4);
      }
    },

    /**
     * Cancels editing ZCard
     * @return {void}
     */
    cancelEditingZcard: function() {
      var p = this.get('payment');
      this.set('payment.editableCard', Moon.util.extend({}, p.emptyCard));
      if (p.zaction === 'Activate') {
        this.set('payment.path', 'add');
      } else {
        this.set('payment.path', 'open');
      }
    },

    /**
     * Either adds or edits current ZCard
     * @return {void}
     */
    submitZcard: function() {
      var p = this.get('payment');
      if (p.editableCard.id) {
        var existing = p.values.filter(function(val) {
          return p.editableCard.id === val.id;
        })[0];
        Moon.util.extend(existing, p.editableCard);
      } else {
        p.editableCard.id = uid(p.editableCard);
        p.editableCard.type = 'zcard';
        // TODO: Determine card name here (elite, gold, platinum)
        p.editableCard.name = 'ZIZIUP Elite Card';
        p.editableCard.credit = '0.00';
        p.values.push(p.editableCard);
      }
      this.set('payment.path', 'open');
      this.set('payment.zaction', 'Add');
      this.set('payment.currentValue', p.editableCard);
      this.set('payment.editableCard', Moon.util.extend({}, p.emptyCard));
    },

    /**
     * Either adds or edits curent CC
     * @return {void}
     */
    submitCreditCard: function() {
      var p = this.get('payment');
      var type, dest;
      if (p.editableCard.id) {
        var existing = p.values.filter(function(val) {
          return p.editableCard.id === val.id;
        })[0];
        Moon.util.extend(existing, p.editableCard);
      } else {
        p.editableCard.id = uid(p.editableCard);
        // TODO: Determine card type
        if (p.editableCard.num1[0] === '4') {
          type = 'mastercard'
        } else {
          type = 'visa';
        }
        p.editableCard.type = type;
        p.values.push(p.editableCard);
      }
      switch (p.caction) {
        case 'Add Credit Card':
        case 'Edit Credit Card':
          dest = 'open';
          this.set('payment.currentValue', p.editableCard);
          break;
        case 'Add Card to Load with':
          dest = 'zccard';
          this.set('payment.selectedCreditCard', p.editableCard);
          break;
      }
      this.set('payment.path', dest);
      this.set('payment.caction', 'Add Credit Card');
      this.set('payment.editableCard', Moon.util.extend({}, p.emptyCard));
      this.set('payment.selectedMethod', '');
    },

    /**
     * Selects specific value as current payment option
     * @param  {string} id Value ID
     * @return {void}
     */
    selectPaymentValue: function(id) {
      var p = this.get('payment');
      var value = p.values.filter(function(val) {
        return val.id === id;
      })[0];
      this.set('payment.currentValue', value);
    },

    /**
     * Shows appropriate editing screen for selected payment option
     * @return {void}
     */
    editPaymentValue: function() {
      var p = this.get('payment');
      var dest;
      switch (p.currentValue.type) {
        case 'paypal':
          dest = 'ppedit';
          break;
        case 'visa':
        case 'mastercard':
          this.set('payment.editableCard', p.currentValue);
          this.set('payment.caction', 'Edit Credit Card');
          dest = 'ccedit';
          break;
        case 'zcard':
          this.set('payment.zaction', 'Edit');
          this.set('payment.editableCard', p.currentValue);
          dest = 'zcedit';
          break;
      }
      this.set('payment.path', dest);
    },

    /**
     * Selects desired PayPal CC as payment source
     * @param  {string} id Card ID
     * @return {void}
     */
    selectPaypalCreditCard: function(id) {
      var card = this.get('payment').values.filter(function(val) {
        return val.id === id;
      })[0];
      this.set('payment.selectedCreditCard', card);
    },

    /**
     * Shows 'Add CC' screen, telling that it's for loading ZCard
     * @return {void}
     */
    addCardToLoadWith: function() {
      console.log(this.get('payment').editableCard);
      this.set('payment.caction', 'Add Card to Load with');
      this.set('payment.path', 'ccedit');
    },

    /**
     * Cancels editing CC
     * @return {void}
     */
    cancelEditingCreditCard: function() {
      var p = this.get('payment');
      var dest;
      switch(p.caction) {
        case 'Add Credit Card':
          dest = 'add';
          break;
        case 'Add Card to Load with':
          dest = 'zccard';
          break;
        case 'Edit Credit Card':
          dest = 'open';
          this.set('payment.editableCard', Moon.util.extend({}, p.emptyCard));
          this.set('payment.caction', 'Add Credit Card');
          break;
      }
      this.set('payment.path', dest);
    },

    /**
     * Loads funds from selected CC to ZCard
     * @return {void}
     */
    addCreditFromCard: function() {
      var p = this.get('payment');
      var type = p.selectedCreditCard.type.charAt(0).toUpperCase() + p.selectedCreditCard.type.slice(1);
      var zCard = p.values.filter(function(val) {
        return val.type === 'zcard';
      })[0];
      var updatedCredit = toMoney(fromMoney(zCard.credit) + fromMoney(p.creditFromCard));
      var amt = toMoney(fromMoney(p.creditFromCard));

      Moon.util.extend(zCard, {credit: updatedCredit});

      alert('Loaded $' + amt + ' to ZIZIUP Card with ' + type
      + '...' + p.selectedCreditCard.num4);

      this.set('payment.path', 'open');
      this.set('payment.creditFromCard', '');
    },

    /**
     * Loads funds from selected PayPal CC to ZCard
     * @return {void}
     */
    addCreditFromPaypal: function() {
      var p = this.get('payment');

      var amt = fromMoney(p.creditFromPaypal);
      var ppCredit = fromMoney(p.pp.currentCard.credit);
      if (amt <= ppCredit) {
        var zCard = p.values.filter(function(val) {
          return val.type === 'zcard';
        })[0];

        var updatedZcredit = toMoney(fromMoney(zCard.credit) + fromMoney(p.creditFromPaypal));
        Moon.util.extend(zCard, {credit: updatedZcredit});

        var updatedPcredit = toMoney(fromMoney(p.pp.currentCard.credit) - fromMoney(p.creditFromPaypal));
        Moon.util.extend(p.pp.currentCard, {credit: updatedPcredit});

        alert('Loaded $' + toMoney(amt) + ' to ZIZIUP Card with PayPal ' + p.pp.login);

        this.set('payment.path', 'open');
        this.set('payment.ppaction', 'Edit PayPal');
      } else {
        alert('Insufficient funds.');
      }

      this.set('payment.creditFromPaypal', '');

    },

    /**
     * Cancels loadind ZCard
     * @return {void}
     */
    cancelLoadingZcard: function() {
      this.set('payment.selectedCreditCard', false);
      if (!this.get('payment').pp.loggedIn) {
        this.set('payment.pp.login', '');
      }
      this.set('payment.pp.pass', '');
      this.set('payment.path', 'open');
    },

    /**
     * Cancels PayPal login
     * @return {void}
     */
    cancelPaypalLogin: function() {
      var p = this.get('payment');
      var dest;
      if (p.path === 'zcpp') {
        dest = 'open';
      } else {
        dest = 'add';
      }
      this.set('payment.pp.login', '');
      this.set('payment.pp.pass', '');
      this.set('payment.path', dest);
    },

    /**
     * Submits PayPal login
     * @return {void}
     */
    submitPaypalLogin: function() {
      var p = this.get('payment');
      var dest;

      // Assuming PayPal API responded with cards like this
      var cards = [{
        id: 'NDUzMjk3MDEx',
        num4: '1613',
        credit: '52.50',
        name: p.pp.login,
        type: 'paypal'
      }, {
        id: 'LTEwMDM1NjgyMTg',
        num4: '4140',
        credit: '7450.00',
        name: p.pp.login,
        type: 'paypal'
      }];

      this.set('payment.pp.pass', '');
      this.set('payment.pp.loggedIn', true);

      this.set('payment.pp.cards', cards);
      this.set('payment.pp.currentCard', cards[0]);

      p.values.push(cards[0]);

      if (p.path === 'zcpp') {
        this.set('payment.ppaction', 'Edit PayPal to Load with');
      } else {
        this.set('payment.ppaction', 'Edit PayPal');
        this.set('payment.currentValue', cards[0]);
      }

      this.set('payment.path', 'ppedit');
    },

    /**
     * Shows 'Edit PayPal' screen, telling it's for loading ZCard
     * @return {void}
     */
    editPaypalSettings: function() {
      this.set('payment.ppaction', 'Edit PayPal to Load with');
      this.set('payment.path', 'ppedit');
    },

    /**
     * Logs out of PayPal
     * @return {void}
     */
    submitPaypalLogout: function() {
      var p = this.get('payment');
      var filtered = p.values.filter(function(val) {
        return val.type !== 'paypal';
      });
      this.set('payment.pp.loggedIn', false);
      this.set('payment.pp.login', '');
      this.set('payment.pp.currentCard', false);
      this.set('payment.pp.cards', false);
      this.set('payment.values', filtered);
      if(filtered.length > 0) {
        this.set('payment.currentValue', filtered[0]);
        this.set('payment.path', 'open');
      } else {
        this.set('payment.currentValue', false)
        this.set('payment.path', 'closed');
      }
    },

    /**
     * Selects PayPal CC as current
     * @param  {string} id PayPal CC ID
     * @return {void}
     */
    selectCurrentPPCard: function(id) {
      var p = this.get('payment');
      if(p.pp.currentCard.id !== id) {
        var selected = p.pp.cards.filter(function(val) {
          return val.id === id;
        })[0];

        var filtered = p.values.filter(function(val) {
          return val.type !== 'paypal';
        });
        filtered.push(selected);

        this.set('payment.pp.currentCard', selected);
        this.set('payment.values', filtered);
        if (p.ppaction !== 'Edit PayPal to Load with') {
          this.set('payment.currentValue', selected);
        }
      }
    },

    /**
     * Shows appropriate screen after saving PayPal settings
     * @return {void}
     */
    savePaypalSettings: function() {
      var p = this.get('payment');
      var dest;
      switch (p.ppaction) {
        case 'Edit PayPal':
          dest = 'open';
          break;
        case 'Edit PayPal to Load with':
          dest = 'zcpp'
          break;
      }
      this.set('payment.path', dest);
    },


    //
    // CART
    //

    /**
     * Inceases specific product quantity by 1
     * @param  {string} id Product ID
     * @return {void}
     */
    increment: function(id) {
      var value = this.get('cart').values.filter(function(val) {
        return val.id === id;
      })[0];
      value.quantity++;
      this.set('cart.trigger', false);
    },

    /**
     * Decreases specific product quantity by 1
     * @param  {string} id Product Id
     * @return {void}
     */
    decrement: function(id) {
      var value = this.get('cart').values.filter(function(val) {
        return val.id === id;
      })[0];
      value.quantity > 1
        ? value.quantity--
        : null
      ;
      this.set('cart.trigger', false);
    },

    /**
     * Deleted specific cart item
     * @param  {string} id Product ID
     * @return {void}
     */
    deleteCartItem: function(id) {
      var filtered = this.get('cart').values.filter(function(val) {
        return val.id !== id;
      });
      this.set('cart.values', filtered);
    },

    /**
     * Enables cart editing mode
     * @return {void}
     */
    editCart: function() {
      this.set('cart.action', 'Edit');
    },

    /**
     * Disables cart editing mode
     * @return {void}
     */
    doneEditingCart: function() {
      this.set('cart.action', 'View');
    },


    //
    // SHIPPING
    //

    /**
     * Selects pickup point as current
     * @param  {string} id Point ID
     * @return {void}
     */
    selectShippingPoint: function(id) {
      var point = this.get('shipping').points.filter(function(point) {
        return point.id === id;
      })[0];
      this.set('shipping.currentPoint', point);
    },

    /**
     * Deselects previously selected pickup point
     * @return {void}
     */
    unselectShippingPoint: function() {
      this.set('shipping.currentPoint', {id:0});
      if (this.get('shipping').values.length) {
        this.set('shipping.path', 'open');
      } else {
        this.set('shipping.path', 'closed');
      }
    },

    /**
     * Removes current pickup point
     * @return {void}
     */
    removeShippingValue: function() {
      var values = this.get('shipping').values;
      var current = this.get('shipping').currentValue;

      var filtered = values.filter(function(value) {
        return value.id !== current.id;
      });

      this.set('shipping.values', filtered);
      if(filtered.length > 0) {
        this.set('shipping.currentValue', filtered[0]);
      } else {
        this.set('shipping.currentValue', false);
        this.set('shipping.path', 'closed');
      }
    },

    /**
     * Sets editing mode for current address
     * @return {void}
     */
    editShippingValue: function() {
      var current = this.get('shipping').currentValue;
      this.set('shipping.editableAddress', current);
      this.set('shipping.path', 'address');
      this.set('shipping.action', 'Edit');
    },

    /**
     * Selects point or address as current shipping destination
     * @param  {string} id Value ID
     * @return {void}
     */
    selectShippingValue: function(id) {
      var value = this.get('shipping').values.filter(function(val) {
        return val.id === id
      })[0];
      this.set('shipping.currentValue', value);
    },

    /**
     * Sets point as shipping destination choice
     * @param  {string} id Point ID
     * @return {void}
     */
    submitShippingPoint: function(id) {
      var values = this.get('shipping').values;
      var newPoint = this.get('shipping').points.filter(function(point) {
        return point.id === id;
      })[0];
      if(values.filter(function(value) {
        return value.id === newPoint.id;
      }).length < 1) {
        values.push(newPoint);
      };
      this.set('shipping.values', values);
      this.set('shipping.currentPoint', {id:0});
      this.set('shipping.currentValue', newPoint);
      this.set('shipping.path', 'open');
    },

    /**
     * Changes current location
     * @return {void}
     */
    submitShippingLocation: function() {
      var l = this.get('shipping').editableLocation;
      if(!this.get('shipping').currentLocation) {
        this.set('shipping.currentLocation', {city:'',country:''});
      }
      this.set('shipping.currentLocation.city', l.city);
      this.set('shipping.currentLocation.country', l.country);
      this.set('shipping.editableLocation.country', '');
      this.set('shipping.editableLocation.city', '');
      this.set('shipping.currentPoint', {id:0});
      this.set('shipping.path', 'pickup');
    },

    /**
     * Saves edited or creates new address
     * @return {void}
     */
    submitShippingAddress: function() {
      var s = this.get('shipping');
      var a = s.editableAddress;
      if(s.editableAddress.id) {
        var existing = s.values.filter(function(addr) {
          return a.id === addr.id;
        })[0];
        Moon.util.extend(existing, a);
      } else {
        a.id = uid(a);
        s.values.push(a);
      }

      this.set('shipping.editableAddress', Moon.util.extend({}, s.emptyAddress));
      this.set('shipping.path', 'open');
      this.set('shipping.action', 'Add');
      this.set('shipping.currentValue', a);
    },

    /**
     * Deletes current address
     * @return {void}
     */
    deleteShippingAddress: function() {
      var s = this.get('shipping');
      var current = s.currentValue;
      var filteredValues = s.values.filter(function(val) {
        return val.id !== current.id;
      });

      this.set('shipping.editableAddress', Moon.util.extend({}, s.emptyAddress));
      this.set('shipping.values', filteredValues);
      this.set('shipping.action', 'Add');
      if(filteredValues.length > 0) {
        this.set('shipping.path', 'open');
        this.set('shipping.currentValue', filteredValues[0]);
      } else {
        this.set('shipping.path', 'closed');
        this.set('shipping.currentValue', false);
      }
    },

    /**
     * Cancels adding or editing address
     * @return {void}
     */
    cancelAddingShippingAddress: function() {
      var destination = this.get('shipping').values.length
        ? 'open'
        : 'closed'
      ;
      this.set('shipping.path', destination);
      this.set('shipping.action', 'Add');
      this.set('shipping.editableAddress', this.get('shipping').emptyAddress);
    },

    /**
     * Cancels editing location
     * @return {void}
     */
    cancelChangingShippingLocation: function() {
      this.set('shipping.editableLocation.country', '');
      this.set('shipping.editableLocation.city', '');
      this.set('shipping.path', 'pickup');
    },


    //
    // DONATION
    //

    /**
     * Selects specific donation amount
     * @param  {string} val Money string
     * @return {void}
     */
    selectDonationValue: function(val) {
      this.set('donation.currentValue', val);
    },

    /**
     * Selects specific charity as current
     * @param  {integer|any} id Charity ID
     * @return {void}
     */
    selectCurrentCharity: function(id) {
      var d = this.get('donation');
      var selected = d.charities.filter(function(charity) {
        return charity.id === id;
      })[0];

      this.set('donation.currentCharity', selected);
    }
  },





  computed: {

    cartTotal: {
      get: function() {
        var total = this.get('cart').values.reduce(function(memo, val) {
          return memo + (fromMoney(val.price) * val.quantity);
        }, 0);
        return toMoney(total);
      }
    },


    showPaymentAdd: {
      get: function() {
        var p = this.get('payment');
        return p.values.length === 0 && p.path === 'closed'
      }
    },
    showPaymentChange: {
      get: function() {
        var p = this.get('payment');
        return p.values.length > 0 && p.path === 'closed'
      }
    },
    showZcardAdder: {
      get: function() {
        return this.get('payment').values.filter(function(val) {
          return val.type === 'zcard';
        }).length <= 0;
      }
    },
    showPaypalAdder: {
      get: function() {
        return this.get('payment').values.filter(function(val) {
          return val.type === 'paypal';
        }).length <= 0;
      }
    },
    editableCardNumberValid: {
      get: function() {
        var card = this.get('payment').editableCard;
        var pattern = /^\d{4}$/;
        return pattern.test(card.num1) &&
          pattern.test(card.num2) &&
          pattern.test(card.num3) &&
          pattern.test(card.num4)
        ;
      }
    },
    showPaymentZCSubmit: {
      get: function() {
        var p = this.get('payment');
        var card = p.editableCard;
        var numberIsValid = this.get('editableCardNumberValid');

        if (p.zaction === 'Activate') {
          if (numberIsValid && card.cvv.length > 2) {
            return 'activate-enabled';
          } else {
            return 'activate-disabled';
          }
        } else {
          if (numberIsValid && card.cvv.length > 2) {
            return 'save-enabled';
          } else {
            return 'save-disabled';
          }
        }
      }
    },
    showPaymentCCSubmit: {
      get: function() {
        var card = this.get('payment').editableCard;
        var numberIsValid = this.get('editableCardNumberValid');
        return numberIsValid &&
          card.cvv.length > 2 &&
          card.name.length > 3 &&
          card.expM.length > 0 &&
          card.expY.length > 0
        ;
      }
    },
    showPaymentValue: {
      get: function() {
        var p = this.get('payment');
        return p.currentValue && p.path === 'closed';
      }
    },
    creditCards: {
      get: function() {
        return this.get('payment').values.filter(function(val) {
          return val.type === 'visa' || val.type === 'mastercard';
        });
      }
    },
    showPaymentPPSubmit: {
      get: function() {
        var p = this.get('payment');
        return isEmail(p.pp.login) > 0 &&
          p.pp.pass.length > 2
        ;
      }
    },


    showShippingAdd: {
      get: function() {
        var s = this.get('shipping');
        return !s.values.length && !s.currentValue && s.path === 'closed';
      }
    },
    showShippingChange: {
      get: function() {
        var s = this.get('shipping');
        return s.values.length && s.path === 'closed';
      }
    },
    showShippingClose: {
      get: function() {
        var s = this.get('shipping');
        return s.values.length && s.path === 'open';
      }
    },
    showShippingValue: {
      get: function() {
        var s = this.get('shipping');
        return s.currentValue && s.path === 'closed';
      }
    },
    yieldShippingLocation: {
      get: function() {
        var l = this.get('shipping').currentLocation;
        return l
          ? l.city + ', ' + l.country
          : 'Locating...'
        ;
      }
    },
    showShippingLocationSubmit: {
      get: function() {
        var l = this.get('shipping').editableLocation;
        return l.city !== '' && l.country !== '';
      }
    },
    showShippingAddressSubmit: {
      get: function() {
        var a = this.get('shipping').editableAddress;
        // TODO: Determine proper valid conditions
        return !!a.country.length &&
          !!a.city.length &&
          !!a.fullName.length &&
          !!a.line1.length
        ;
      }
    },
    shippingCountries: {
      get: function() {
        var pts = this.get('shipping').points;
        var countries = pts
          .map(function(point) { return point.country; })
          .sort()
          .filter(function(country, i, arr) {
            return !i || country !== arr[i-1];
          });
        return countries;
      },
    },
    shippingCities: {
      get: function() {
        var country = this.get('shipping').editableLocation.country;
        if (country === '') return [];
        var pts = this.get('shipping').points;
        var cities = pts
          .reduce(function(memo, point) {
            if(point.country === country) {
              memo.push(point.city);
            }
            return memo;
          }, [])
          .sort()
          .filter(function(city, i, arr) {
            return !i || city !== arr[i-1];
          });
        return cities;
      }
    },
    shippingFilteredPoints: {
      get: function() {
        var s = this.get('shipping');
        if(!s.currentLocation) return false;
        var selectedIds = s.values.map(function(value){
          return value.id;
        });
        var notSelectedPoints = s.points.filter(function(point) {
          var match = selectedIds.filter(function(id){
            return id === point.id;
          });
          return match.length < 1;
        });
        var byCity = notSelectedPoints.filter(function(point) {
          return point.city.toLowerCase() === s.currentLocation.city.toLowerCase();
        });
        if (byCity.length) {
          return byCity;
        } else {
          var byCountry = notSelectedPoints.filter(function(point) {
            return point.country.toLowerCase() === s.currentLocation.country.toLowerCase()
          });
          if (byCountry.length) {
            return byCountry;
          } else {
            return false;
          }
        }
      }
    },
    shippingTotal: {
      get: function() {
        var s = this.get('shipping');
        if (!s.currentValue) {
          return '0.00'
        }

        if(s.currentValue.type === 'address') {
          return '20.00'
        }

        if(s.currentValue.type === 'pickup') {
          return '7.50'
        }

      }
    },
    subTotal: {
      get: function() {
        var cart = fromMoney(this.get('cartTotal'));
        var shipping = fromMoney(this.get('shippingTotal'));
        return toMoney(cart + shipping);
      }
    },
    feesZizi: {
      get: function() {
        var subTotal = fromMoney(this.get('subTotal'));
        if (subTotal < 100000) {
          return '20.00'
        } else {
          return toMoney(percentage(2, subTotal));
        }
      }
    },
    feesVat: {
      get: function() {
        var subTotal = fromMoney(this.get('subTotal'));
        var feesZizi = fromMoney(this.get('feesZizi'));
        return toMoney(percentage(5, subTotal + feesZizi));
      }
    },
    grandTotal: {
      get: function() {
        var subTotal = fromMoney(this.get('subTotal'));
        var feesZizi = fromMoney(this.get('feesZizi'));
        var feesVat = fromMoney(this.get('feesVat'));
        var charity = fromMoney(this.get('donation').currentValue);
        return toMoney(subTotal+feesZizi+feesVat+charity);
      }
    },
    shouldLoadZcard: {
      get: function() {
        var p = this.get('payment').currentValue;
        return p.type === 'zcard' &&
          fromMoney(p.credit) < fromMoney(this.get('grandTotal'))
        ;
      }
    },
    shouldEditPaypal: {
      get: function() {
        var p = this.get('payment').currentValue;
        return p.type === 'paypal' &&
          fromMoney(p.credit) < fromMoney(this.get('grandTotal'))
        ;
      }
    },
    showConfirmAndPay: {
      get: function() {
        var p = this.get('payment').currentValue;
        var isNotEmptyCart = this.get('cart').values.length > 0;
        var isNotEmptyShipping = !!this.get('shipping').currentValue;
        var isNotEmptyPayment = !!p;
        var isEnoughCredit = (p.type !== 'paypal' && p.type !== 'zcard') ||
          fromMoney(p.credit) >= fromMoney(this.get('grandTotal'));
        return isNotEmptyCart &&
          isNotEmptyPayment &&
          isNotEmptyShipping &&
          isEnoughCredit
        ;
      }
    }
  }
});

})();
