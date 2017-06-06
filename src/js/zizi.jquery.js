// ZIZIUP jQuery plugins

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
      var $toggleInClickable;
      var $el = $(this);

      $(this).closest(cfg.selectorClosest).toggleClass(cfg.classNameToToggle);

      if(cfg.selectorToggleInClickable) {
        $toggleInClickable = $el.find(cfg.selectorToggleInClickable);
      } else {
        $toggleInClickable = $el;
      }

      if(cfg.classNameToToggleInClickable) {
        $toggleInClickable.toggleClass(cfg.classNameToToggleInClickable);
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

  $.fn.ziziDropdown = function(options) {
    var defaults = {
      selectorButton: '.dropdown__button',
      selectorPane: '.dropdown__scrollpane',
      selectorValue: '.dropdown__value',
      selectorOption: '.dropdown__option',
      selectorOptGroup: '.dropdown__optgroup',
      classNameOpen: 'dropdown--open',
      classNameSelected: 'dropdown__option--selected',
      classNameExpandable: 'dropdown__option--expandable',
      classNameExpanded: 'dropdown__option--expanded',
      classNameCollapsed: 'dropdown__option--collapsed',
      type: 'default',
      modifierValue: 'value',
      modifierCity: 'city',
      modifierCountry: 'country',
      separatorSelector: '--',
      separatorValue: ', ',
      searchable: false,
      selectorSearchBar: '.dropdown__searchbar',
      classNameNotSearchable: 'dropdown__searchbar--hidden',
      classNameNotMatched: 'dropdown__option--hidden',
      selectorFlag: '.icon--flag',
      rotateCaret: false,
      selectorCaret: '[class*=" icon--caret"]',
      classNameCaretRotated: 'icon--rotated'
    }
    var cfg = $.extend(defaults, options);

    var $root = this;
    var $btn = $root.find(cfg.selectorButton);
    var $options = $root.find(cfg.selectorOption);
    var $optgroups = $root.find(cfg.selectorOptGroup);
    var $searchBar = $root.find(cfg.selectorSearchBar);
    var $searchInput = $searchBar.find('input');
    if (cfg.rotateCaret) {
      var $caret = $root.find(cfg.selectorCaret);
    }

    var close = function(e) {
      if(!e || !$(e.target).closest(cfg.selectorPane).length) {
        $searchInput.val("").trigger('keyup').blur();
        $root.removeClass(cfg.classNameOpen);
        if (cfg.rotateCaret) {
          $caret.removeClass(cfg.classNameCaretRotated);
        }
        $('body').off('click', close);
      }
    }

    var open = function() {
      if(!$root.hasClass(cfg.classNameOpen)){
        $root.addClass(cfg.classNameOpen);
        $searchInput.focus();
        setTimeout(function(){
          $('body').on('click', close);
        }, 100);
        if (cfg.rotateCaret) {
          $caret.addClass(cfg.classNameCaretRotated);
        }
      }
    }

    var select = function(e) {
      var $target = $(e.target);
      if (!$target.hasClass(cfg.classNameSelected) &&
          !$target.hasClass(cfg.classNameExpandable)) {
        switch(cfg.type) {
          case 'location':
            $root
              .find(cfg.selectorValue+cfg.separatorSelector+cfg.modifierCity)
              .text($target.data('city'))
            ;
            $root
              .find(cfg.selectorValue+cfg.separatorSelector+cfg.modifierCountry)
              .text(cfg.separatorValue + $target.data('country'))
            ;
            // API call here
            // console.log($target.data('city'), $target.data('country'));
            break;

          case 'language':
            $root
              .find(cfg.selectorValue)
              .text($target.data('value'))
            ;
            $btn
              .find(cfg.selectorFlag)
              .removeClass(function(index, className) {
                return (className.match (/(^|\s)icon--flag-\S+/g) || []).join(' ');
              })
              .addClass('icon--flag-' + $target.data('value'));
            // API call here
            // console.log($target.data('value'));
            break;

          case 'filter':
            alert('Filtering by category ' + $target.text());
            break;

          default:
            $root
              .find(cfg.selectorValue)
              .text($target.data('value'))
            ;
            break;
        }

        $options.removeClass(cfg.classNameSelected);
        $target.addClass(cfg.classNameSelected);
        close();
      }

      if ($target.hasClass(cfg.classNameExpandable)) {
        $target.toggleClass(cfg.classNameExpanded+' '+cfg.classNameCollapsed);
      }
    }

    var matcher = function() {
      var $el = $(this);
      if (cfg.type === 'location') {
        var value = $el.data(cfg.modifierCity).toLowerCase();
      } else {
        var value = $el.data(cfg.modifierValue).toLowerCase();
      }
      return value.indexOf($searchInput.val().toLowerCase()) !== -1;
    }

    var search = function(e) {
      var query = $(e.target).val();
      if (query.length > 0) {
        $options
          .addClass(cfg.classNameNotMatched)
          .filter(matcher)
          .removeClass(cfg.classNameNotMatched)
        ;
        $optgroups.hide();
      } else {
        $options.removeClass(cfg.classNameNotMatched);
        $optgroups.show();
      }
    }

    $btn.on('click', open);
    $options.on('click', select);

    if(cfg.searchable) {
      $searchInput.on('keyup', search);
    } else {
      $searchBar.addClass(cfg.classNameNotSearchable);
    }
  }

  $.fn.ziziCategories = function(options) {
    var defaults = {
      selectorDropdown: '.dropdown--category',
      selectorHeader: 'h1',
      selectorIcon: '.icon--caret-white',
      selectorExpander: '.banner__expander'
    }
    var cfg = $.extend(defaults, options);

    var init = function() {
      var $root = $(this);

      var $expander = $root.find(cfg.selectorExpander);
      if (!$expander.length) return;

      var $header = $root.find(cfg.selectorHeader);
      var $dropdown = $root.find(cfg.selectorDropdown);
      var $icon = $root.find(cfg.selectorIcon);

      var toggleExpander = function() {
        $expander.toggle();
        $icon.toggleClass('icon--rotated');
      }

      var positionExpander = function() {
        $expander.css('top', $header.position().top + $header.height());
      }

      positionExpander();
      $(window).resize(positionExpander);

      $dropdown.on('click', toggleExpander);
      $header.on('click', toggleExpander);
    }

    this.each(init);
  }

  $.fn.ziziLikeStores = function() {
    var init = function() {
      var $root = $(this);
      if (!$root.is('.plate.store')) return;

      var $like = $root.find('.plate__like');

      var handleLikeClick = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var wasLiked = $root.is('.store--liked');
        var store = $root.attr('rel');

        $root.toggleClass('store--liked');

        // API call here
        console.log(store + ' is ' + (wasLiked ? 'not ' : '') + 'liked now');
      }

      $like.on('click', handleLikeClick)
    }

    this.each(init);
  }

  $.fn.ziziSearch = function() {
    var $root = this;
    if (!$root.is('#main-search')) {
      console.warning('ziziSearch: invalid element');
      return;
    }

    var keyListener = function(e) {
      var $input = $(e.target);
      if (e.which === 13) {
        // Enter key preses, API call here
        alert('Searching by term "' + $input.val() + '"');
        $input.val("");
        return;
      }
      if (e.which === 27) {
        // Esc key pressed, close
        $root.closest('.menu').removeClass('menu--search');
        $input.val("");
        return;
      }
    }

    $root.on('keydown', keyListener);
  }
}(jQuery));
