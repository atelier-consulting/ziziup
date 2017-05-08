(function(){

/**
 * Generates unique string
 * @param  {object} data Data object
 * @return {string}      Unique string
 */
function uid(data) {
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

function isEmail(str) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(str);
}

function fromMoney(amount) {
  var amt = amount.replace('-', '');
  var arr = amt.split('.');
  var str = '';

  switch (arr.length) {
    case 1:
      str += amt + '00';
      break;
    default:
      str += arr.join('');
      break;
  }

  return parseInt(str, 10);
}

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

Moon.config.silent = true;

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

      path: 'pplogin',
      // 'closed', 'open', 'add',
      // 'zcedit', 'zcdeposit', 'zccard', 'zcpp',
      // 'ccedit',
      // 'pplogin', 'ppedit'

      selectedMethod: '',
      selectedCreditCard: false,
      zaction: 'Activate', // 'Activate', 'Edit'

      caction: 'Add Credit Card',
      // 'Add Credit Card', 'Edit Credit Card', 'Add Card to Load with'

      ppaction: 'Login to PayPal',
      // 'Login to PayPal', 'Edit PayPal', 'Login to PayPal to Load with'
      pp: {
        login: '',
        pass: '',
        currentCard: false,
        cards: false,
        loggedIn: false
      },

      creditFromCard: '',
      currentValue: {
        id: 'fe6ac9',
        num1: '1212',
        num2: '1212',
        num3: '1231',
        num4: '2312',
        expM: '02',
        expY: '19',
        name: 'ZIZIUP Elite Card',
        cvv: '1234',
        primary: false,
        type: 'zcard',
        credit: '2000'
      },
      values: [{
        id: 'fe6ac9',
        num1: '1212',
        num2: '1212',
        num3: '1231',
        num4: '2312',
        expM: '02',
        expY: '19',
        name: 'ZIZIUP Elite Card',
        cvv: '1234',
        primary: false,
        type: 'zcard',
        credit: '2000'
      },{
        id: 'sd81udas',
        num1: '8787',
        num2: '9898',
        num3: '4646',
        num4: '1010',
        expM: '11',
        expY: '20',
        name: 'Roland Omene',
        cvv: '123',
        primary: false,
        type: 'visa',
        credit: ''
      }],
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
      path: 'closed', // 'closed', 'open'
      currentValue: '0',
      values: ['0', '1', '2', '5', '10']
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

    // PAYMENT
    changeSelectedMethod: function(method) {
      this.set('payment.selectedMethod', method);
    },
    unselectPaymentMethod: function() {
      var path = this.get('payment').values.length
        ? 'open'
        : 'closed'
      ;
      this.set('payment.selectedMethod', '');
      this.set('payment.path', path);
    },
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
    cancelEditingZcard: function() {
      var p = this.get('payment');
      this.set('payment.editableCard', p.emptyCard);
      if (p.zaction === 'Activate') {
        this.set('payment.path', 'add');
      } else {
        this.set('payment.path', 'open');
      }
    },
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
        p.values.push(p.editableCard);
      }

      this.set('payment.path', 'open');
      this.set('payment.zaction', 'Add');
      this.set('payment.currentValue', p.editableCard);
      this.set('payment.editableCard', p.emptyCard);
    },
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

        p.values.push(p.editableCard);
      }

      this.set('payment.path', dest);
      this.set('payment.caction', 'Add Credit Card');
      this.set('payment.editableCard', p.emptyCard);
    },
    selectPaymentValue: function(id) {
      var p = this.get('payment');

      var value = p.values.filter(function(val) {
        return val.id === id;
      })[0];

      this.set('payment.currentValue', value);
    },
    loadCurrentZcard: function() {
      this.set('payment.path', 'zcdeposit');
    },
    editPaymentValue: function() {
      var p = this.get('payment');
      var dest;

      switch (p.currentValue.type) {
        case 'paypal':
          dest = 'ppedit';
          break;
        case 'visa':
        case 'mastercard':
          dest = 'ccedit';
        case 'zcard':
          dest = 'zcedit';
          break;
      }

      this.set('payment.path', dest);

    },
    selectCreditCard: function(id) {
      var card = this.get('payment').values.filter(function(val) {
        return val.id === id;
      })[0];
      this.set('payment.selectedCreditCard', card);
    },
    addCardToLoadFrom: function() {
      this.set('payment.caction', 'Add Card to Load with');
      this.set('payment.path', 'ccedit');
    },
    cancelEditingCreditCard: function() {
      var dest;
      switch(this.get('payment').caction) {
        case 'Add Credit Card':
          dest = 'add';
          break;
        case 'Add Card to Load with':
          dest = 'zccard';
          break;
        case 'Edit Credit Card':
          dest = 'open';
          break;
      }

      this.set('payment.path', dest);
    },
    addCreditFromCard: function() {
      var p = this.get('payment');
      var type = p.selectedCreditCard.type.charAt(0).toUpperCase() +
      p.selectedCreditCard.type.slice(1)
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
    cancelPaypalLogin: function() {
      var p = this.get('payment');

      switch (p.ppaction) {
        case 'Login to PayPal':
          this.set('payment.pp.pass', '');
          this.set('payment.path', 'add');
          break;
        case 'Login to PayPal to Load with':
          break;
        case 'Edit PayPal':
          break;
      }
    },
    submitPaypalLogin: function() {
      var p = this.get('payment');
      var cards = [{
        id: 'NDUzMjk3MDEx',
        num4: '1613',
        credit: '50',
        name: p.pp.login,
        type: 'paypal'
      }, {
        id: 'LTEwMDM1NjgyMTg',
        num4: '4140',
        credit: '7450',
        name: p.pp.login,
        type: 'paypal'
      }];


      this.set('payment.pp.pass', '');
      this.set('payment.pp.loggedIn', true);
      this.set('payment.path', 'ppedit');

      this.set('payment.pp.cards', cards);
      this.set('payment.pp.currentCard', cards[0]);

      p.values.push(cards[0]);
      this.set('payment.currentValue', cards[0]);
    },
    submitPaypalLogout: function() {
      var p = this.get('payment');
      var filtered = p.values.filter(function(val) {
        return val.type !== 'paypal';
      });

      this.set('payment.pp.loggedIn', 'false');
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
        this.set('payment.currentValue', selected);
      }
    },



    // CART
    increment: function(id) {
      var value = this.get('cart').values.filter(function(val) {
        return val.id === id;
      })[0];
      value.quantity++;
      this.set('cart.trigger', false);
    },

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

    deleteCartItem: function(id) {
      var filtered = this.get('cart').values.filter(function(val) {
        return val.id !== id;
      });
      this.set('cart.values', filtered);
    },

    editCart: function() {
      this.set('cart.action', 'Edit');
    },

    doneEditingCart: function() {
      this.set('cart.action', 'View');
    },


    // SHIPPING


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
      var a = this.get('shipping').editableAddress;
      var all = this.get('shipping').values;
      if(a.id) {
        var existing = all.filter(function(addr) {
          return a.id === addr.id;
        })[0];
        Moon.util.extend(existing, a);
      } else {
        a.id = uid(a);
        this.get('shipping').values.push(a);
      }

      this.set('shipping.editableAddress', this.get('shipping').emptyAddress);
      this.set('shipping.path', 'open');
      this.set('shipping.action', 'Add');
      this.set('shipping.currentValue', a);
    },

    /**
     * Deletes current address
     * @return {void}
     */
    deleteShippingAddress: function() {
      var current = this.get('shipping').currentValue;
      var filteredValues = this.get('shipping').values.filter(function(val) {
        return val.id !== current.id;
      });

      this.set('shipping.editableAddress', this.get('shipping').emptyAddress);
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

    // DONATION
    selectDonationValue: function(val) {
      this.set('donation.currentValue', val);
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
    showPaymentActivate: {
      get: function() {
        var card = this.get('payment').editableCard;
        var numberIsValid = this.get('editableCardNumberValid');
        return numberIsValid && card.cvv.length > 2;
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
    }
  }
});

})();
