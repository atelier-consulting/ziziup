(function(){

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

Moon.config.silent = true;

var compiled = {
  choInfo: Moon.compile(
    document
      .querySelector('#tpl-cho-info')
      .innerHTML
      .trim()
  )
}

Moon.component('cho-info', {
  props: ['title', 'line1', 'line2', 'descr', 'price'],
  render: compiled.choInfo
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
    },
    updated: function() {
      // console.log(this.get('shipping').editableAddress);
    }
  },
  el: '#checkout',
  data: {
    geoData: false,
    allCountries: ['Cameroon', 'Canada', 'Ghana', 'France', 'United States', 'Ukraine'],
    allCodes: ['+237', '+1', '+233', '+33', '+38'],
    shipping: {
      path: 'address', // 'closed', 'pickup', 'address', 'location', 'open'
      values: [],
      currentValue: false,
      currentPoint: {id: 0},
      action: 'Add',
      editableLocation: {
        country: '',
        city: ''
      },
      editableAddress: {
        country: 'United States',
        city: 'Fort Worth',
        fullName: 'Roland Omene',
        line1: '3000 Some Road',
        line2: 'Fort Worth TX',
        code: '+1',
        phone: '98765432',
        zip: '10192',
        isPrimary: false
      },
      currentLocation: false,
      points: [{
        id: 1,
        type: 'pickup',
        city: 'Bamenda',
        country: 'Cameroon',
        line1: 'Niki Mash International',
        line2: 'Small Mankon, Bamenda, NWR'
      },{
        id: 2,
        type: 'pickup',
        city: 'Bamenda',
        country: 'Cameroon',
        line1: 'Post Office',
        line2: 'Ngwafang Street, Bamenda, NWR'
      },{
        id: 11,
        type: 'pickup',
        city: 'Yaounde',
        country: 'Cameroon',
        line1: 'Happy Mall',
        line2: 'Yaounde, Cameroon'
      },{
        id: 101,
        type: 'pickup',
        city: 'Accra',
        country: 'Ghana',
        line1: 'Stop Point',
        line2: 'Main Street 67, Accra, Ghana'
      },{
        id: 121,
        type: 'pickup',
        city: 'Ternopil',
        country: 'Ukraine',
        line1: 'Podolyany Mall',
        line2: '28 Podil\'ska Street, Ternopil, Ukraine'
      },{
        id: 141,
        type: 'pickup',
        city: 'Fort Worth',
        country: 'United States',
        line1: 'La Gran Plaza',
        line2: '4200 South Fwy, Fort Worth TX'
      }],
      addresses: []
    }
  },
  methods: {
    navigate: function(module, destination) {
      this.set(module + '.path', destination);
    },
    selectShippingPoint: function(id) {
      var point = this.get('shipping').points.filter(function(point) {
        return point.id === id;
      })[0];
      this.set('shipping.currentPoint', point);
    },
    unselectShippingPoint: function() {
      this.set('shipping.currentPoint', {id:0});
      if (this.get('shipping').values.length) {
        this.set('shipping.path', 'open');
      } else {
        this.set('shipping.path', 'closed');
      }
    },
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
    selectShippingValue: function(id) {
      var value = this.get('shipping').values.filter(function(value) {
        return value.id === id
      })[0];
      this.set('shipping.currentValue', value);
    },
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
    submitShippingLocation: function() {
      var l = this.get('shipping').editableLocation;
      this.set('shipping.currentLocation.city', l.city);
      this.set('shipping.currentLocation.country', l.country);
      this.set('shipping.editableLocation.country', '');
      this.set('shipping.editableLocation.city', '');
      this.set('shipping.currentPoint', {id:0});
      this.set('shipping.path', 'pickup');
    },
    submitShippingAddress: function() {
      var a = Moon.util.extend({}, this.get('shipping').editableAddress);
      a.uid = uid(a);
      console.log(a);
    },
    cancelAddingShippingAddress: function() {
      var destination = this.get('shipping').values.length
        ? 'open'
        : 'closed'
      ;
      this.set('shipping.path', destination);
    },
    cancelChangingShippingLocation: function() {
      this.set('shipping.editableLocation.country', '');
      this.set('shipping.editableLocation.city', '');
      this.set('shipping.path', 'pickup');
    }
  },
  computed: {
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
