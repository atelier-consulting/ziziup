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
      selectorTabs:           '.tabbar__tab',
      selectorContents:       '.auth__tab',
      classNameActiveTab:     'tabbar__tab--active',
      classNameActiveContent: 'auth__tab--active',
      targetSelectorAttr:     'rel'
    }
    var cfg = $.extend(defaults, options);

    var $root = this;
    var $tabs = $root.find(cfg.selectorTabs);
    var $contents = $root.find(cfg.selectorContents);

    $tabs.on('click', function() {
      var $tab = $(this);
      var $targetContent = $('#' + $tab.attr(cfg.targetSelectorAttr));

      $tabs.removeClass(cfg.classNameActiveTab);
      $contents.removeClass(cfg.classNameActiveContent);
      $tab.addClass(cfg.classNameActiveTab);
      $targetContent.addClass(cfg.classNameActiveContent);
    });
  }

  $.fn.ziziSpoilers = function(options) {
    var defaults = {
      classNameOpen: 'spoiler--open'
    }
    var cfg = $.extend(defaults, options);

    var $spoilers = this;

    $spoilers.on('click', function() {
      var $spoiler = $(this);

      if ($spoiler.hasClass(cfg.classNameOpen)) {
        $spoiler.removeClass(cfg.classNameOpen)
      } else {
        $spoilers.removeClass(cfg.classNameOpen);
        $spoiler.addClass(cfg.classNameOpen);
      }
    })
  }

  $.fn.ziziReviews = function(options) {
    var defaults = {
      range:  '..',
      part:   '&nbsp;of&nbsp;'
    }
    var cfg = $.extend(defaults, options);

    var $root = this;
    var $list = $root.find('.reviews__list');
    var $legend = $root.find('.reviews__legend');
    var $btnPrev = $root.find('.reviews__button--prev');
    var $btnNext = $root.find('.reviews__button--next');
    var updateLegend = function(current, showed, total) {
      $legend.html((current + 1) + cfg.range + (current + showed) + cfg.part + total);

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
      updateLegend(0, slick.options.slidesToShow, slick.slideCount);
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
      updateLegend(currentSlide, slick.options.slidesToShow, slick.slideCount);
    });
  }

  $.fn.ziziSale = function() {
    this.on('click', function() {
      $(this)
        .next('.sale__info')
        .toggleClass('sale__info--open')
        .on('click', function() {
          $(this)
            .toggleClass('sale__info--open')
            .off('click')
          ;
        })
      ;
    });
  }

  $.fn.ziziWebMobile = function(options) {
    var defaults = {
      selectorButtonWeb:    '.landing__button--web',
      selectorButtonMobile: '.landing__button--mobile',
      classNameButtonOff:   'landing__button--off',
      classNameRootMobile:  'hiw--mobile'
    }
    var cfg = $.extend(defaults, options);

    var $root = this;
    var $btnWeb = $root.find(cfg.selectorButtonWeb);
    var $btnMobile = $root.find(cfg.selectorButtonMobile);

    $btnWeb.on('click', function() {
      if ($btnWeb.hasClass(cfg.classNameButtonOff)) {
        $btnWeb.removeClass(cfg.classNameButtonOff);
        $btnMobile.addClass(cfg.classNameButtonOff);
        $root.removeClass(cfg.classNameRootMobile);
      }
    });

    $btnMobile.on('click', function() {
      if ($btnMobile.hasClass(cfg.classNameButtonOff)) {
        $btnMobile.removeClass(cfg.classNameButtonOff);
        $btnWeb.addClass(cfg.classNameButtonOff);
        $root.addClass(cfg.classNameRootMobile);
      }
    });
  }

  $.fn.ziziLists = function(options) {
    var defaults = {
      selectorList:       '.list--expandable',
      selectorItem:       '.list__item',
      selectorExpander:   '.list__link',
      ancestry:           '>',
      classNameExpanded:  'list__item--expanded'
    }
    var cfg = $.extend(defaults, options);

    var $expanders = this.find(
      cfg.selectorList +
      cfg.ancestry +
      cfg.selectorItem +
      cfg.ancestry +
      cfg.selectorExpander
    );

    $expanders.on('click', function() {
      var $expander = $(this);
      var $listItem = $expander.closest(cfg.selectorItem);

      if ($listItem.hasClass(cfg.classNameExpanded)) {
        $listItem.removeClass(cfg.classNameExpanded);
      } else {
        $expander
          .closest(cfg.selectorList)
          .children('.' + cfg.classNameExpanded)
          .removeClass(cfg.classNameExpanded)
        ;
        $listItem.addClass(cfg.classNameExpanded);
      }
    });
  }

  $.fn.ziziToggleSelf = function(options) {
    var defaults = {
      classNamesArray: [
        'account__title--expanded',
        'account__title--collapsed'
      ]
    }
    var cfg = $.extend(defaults, options);

    var $self = this;

    $self.on('click', function() {
      $self.toggleClass(cfg.classNamesArray.join(' '));
    });
  }

  $.fn.ziziToggleClosest = function(options) {
    var defaults = {
      selectorClosest:              '.account__link--expandable',
      classNameToToggle:            'account__link--open',
      selectorToggleInClickable:    false,
      classNameToToggleInClickable: false
    }
    var cfg = $.extend(defaults, options);

    var $clickables = this;

    $clickables.on('click', function(e) {
      $(this).closest(cfg.selectorClosest).toggleClass(cfg.classNameToToggle);
      if(cfg.selectorToggleInClickable && cfg.classNameToToggleInClickable) {
        $(this)
          .find(cfg.selectorToggleInClickable)
          .toggleClass(cfg.classNameToToggleInClickable)
        ;
      }
    });
  }

  $.fn.ziziCardInput = function() {
    var $inputs = $('.form__cell--card-number > input:not(:last-child)');

    $inputs.on('keyup', function(e) {
      e.target.value.length > 3 &&
      e.target.nextElementSibling.value.length === 0
        ? event.target.nextElementSibling.focus()
        : null
        ;
    });
  }

  $.fn.ziziCalendar = function(orderDatesArray) {
    if(!$.fn.datepicker) return;

    var hasOrder = function(currentDate, type) {
      if (type !== 'day') return;

      for (var i = 0; i < orderDatesArray.length; i++) {
        var orderDate = new Date(orderDatesArray[i]);
        if (
          orderDate.getFullYear() === currentDate.getFullYear() &&
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getDate() === currentDate.getDate()
        ) {
          return {
            classes: 'has-order'
          }
        }
      }
    }

    $.fn.datepicker.language['en'] = {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      today: 'Today',
      clear: 'Clear',
      dateFormat: 'mm/dd/yyyy',
      timeFormat: 'hh:ii aa',
      firstDay: 0
    };

    this.datepicker({
      language: 'en',
      inline: true,
      onRenderCell: hasOrder
    });

  }
}(jQuery));