Moon.component('cho-info', {
  props: [
    'title',
    'line1',
    'line2',
    'descr',
    'price',
  ],
  template: '<div class="cho__info">' +
  '<div m-if="{{title}}" class="info__title">{{title}}</div>' +
  '<div m-if="{{line1}}" class="info__line">{{line1}}</div>' +
  '<div m-if="{{line2}}" class="info__line">{{line2}}</div>' +
  '<div m-if="{{descr}}" class="info__descr">{{descr}}</div>' +
  '<div m-if="{{price}}" class="info__price">{{price}}</div>' +
  '</div>'
});

var cho = new Moon({
  el: '#checkout',
  data: {
    shipping: {
      path: 'closed', // 'pickup', 'address', 'location', 'open'
      values: [],
      currentValue: false,
      currentPoint: {
        id: 0
      },
      action: 'Add',
      location: {
        city: 'Bamenda',
        country: 'Cameroon'
        // city: 'Lagos',
        // country: 'Nigeria'
      },
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
      }]
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
        this.set('shipping.path', 'list');
      } else {
        this.set('shipping.path', 'closed');
      }
    },
    selectShippingValue: function(id) {
      var value = this.get('shipping').values.filter(function(value) {
        return value.id === id
      })[0];
      this.set('shipping.currentValue', value);
      console.log(this.get('shipping').currentValue);
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
      this.set('shipping.path', 'list');
    },
    cancelAddingAddress: function() {
      this.set('shipping.path', 'closed');
    },
    cancelChangingLocation: function() {
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
        return s.values.length && s.path === 'list';
      }
    },
    showShippingValue: {
      get: function() {
        var s = this.get('shipping');
        return s.currentValue && s.path === 'closed';
      }
    },
    shippingLocation: {
      get: function() {
        var l = this.get('shipping').location;
        return l.city + ', ' + l.country
      }
    },
    shippingFilteredPoints: {
      get: function() {
        var s = this.get('shipping');
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
          return point.city.toLowerCase() === s.location.city.toLowerCase();
        });
        if (byCity.length) {
          return byCity;
        } else {
          var byCountry = notSelectedPoints.filter(function(point) {
            return point.country.toLowerCase() === s.location.country.toLowerCase()
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
