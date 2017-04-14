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

function fromMoney(amount) {
  var arr = amount.split('.');
  var str = '';

  switch (arr.length) {
    case 1:
      str += amount + '00';
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
      action: 'View', // 'View', 'Edit'
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
    }
  },
  methods: {
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
     * Navigates to specific screen
     * @param  {string} module      Module to navigate
     * @param  {string} destination Screen to switch to
     * @return {void}
     */
    navigate: function(module, destination) {
      this.set(module + '.path', destination);
    },

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
