// ZIZIUP jQuery plugins

console.log('test');

(function($) {
  $.fn.ziziAuth = function() {
    var $root = this;
    var $btn = $root.find('.dropdown__button');
    var closer = function(e) {
      if(!$(e.target).closest('.auth__popup').length) {
        $root.removeClass('auth--open');
        $('body').off('click', closer);
      }
    }

    $btn.on('click', function(e) {
      if(!$root.is('.auth--open')){
        $root.addClass('auth--open');
        setTimeout(function(){
          $('body').on('click', closer);
        }, 100);
      }
    });
  }

  $.fn.ziziTabs = function(options) {
    var defaults = {
      tabs: '.tabbar__tab',
      contents: '.auth__tab',
      activeTab: 'tabbar__tab--active',
      activeContent: 'auth__tab--active'
    }
    var config = $.extend(defaults, options);

    var $root = this;
    var $tabs = $root.find(config.tabs);
    var $contents = $root.find(config.contents);

    $tabs.on('click', function() {
      var $tab = $(this);

      $tabs.removeClass(config.activeTab);
      $contents.removeClass(config.activeContent);
      $tab.addClass(config.activeTab);
      $('#' + $tab.attr('rel')).addClass(config.activeContent);
    });
  }

  $.fn.ziziSpoilers = function(options) {
    var defaults = {
      openSpoiler: 'spoiler--open'
    }
    var config = $.extend(defaults, options);

    var $spoilers = this;

    $spoilers.on('click', function() {
      var $spoiler = $(this);

      if ($spoiler.is('.' + config.openSpoiler)) {
        $spoiler.removeClass(config.openSpoiler)
      } else {
        $spoilers.removeClass(config.openSpoiler);
        $spoiler.addClass(config.openSpoiler);
      }
    })
  }

  $.fn.ziziReviews = function(options) {
    var defaults = {
      range: '..',
      part: '&nbsp;of&nbsp;'
    }
    var config = $.extend(defaults, options);

    var $root = this;
    var $list = $root.find('.reviews__list');
    var $legend = $root.find('.reviews__legend');
    var $btnPrev = $root.find('.reviews__button--prev');
    var $btnNext = $root.find('.reviews__button--next');
    var updater = function(current, showed, total) {
      $legend.html((current + 1) + config.range + (current + showed) + config.part + total);

      current === 0
        ? $btnPrev.prop('disabled', true)
        : $btnPrev.prop('disabled', false)
      ;

      current + showed === total
        ? $btnNext.prop('disabled', true)
        : $btnNext.prop('disabled', false)
      ;
    }

    $list.on('init', function(event, slick) {
      updater(0, slick.options.slidesToShow, slick.slideCount);
    });

    $list.slick({
      arrows: false,
      dots: false,
      autoplay: false,
      slidesToShow: 2,
      slidesToScroll: 1,
      infinite: false,
      mobileFirst: true,
      responsive: [{
        breakpoint: 1023,
        settings: {
          slidesToShow: 3
        }
      },{
        breakpoint: 1365,
        settings: {
          slidesToShow: 4
        }
      },{
        breakpoint: 1599,
        settings: {
          slidesToShow: 5
        }
      }]
    });

    $btnNext.on('click', function() {
      $list.slick('slickNext');
    });

    $btnPrev.on('click', function() {
      $list.slick('slickPrev');
    });

    $list.on('afterChange', function(event, slick, currentSlide) {
      updater(currentSlide, slick.options.slidesToShow, slick.slideCount);
    });
  }

}(jQuery));
