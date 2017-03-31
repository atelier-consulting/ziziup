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
      action: 'Add',
      location: {
        city: 'Bamenda',
        country: 'Cameroon'
      },
      points: [{
        id: 1,
        line1: 'Niki Mash International',
        line2: 'Small Mankon, Bamenda, NWR'
      }]
    }
  },
  methods: {
    navigate: function(module, destination) {
      this.set(module + '.path', destination);
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
    }
  }
});
