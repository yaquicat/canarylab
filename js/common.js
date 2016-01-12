(function() {
  var rotatingSlider = function(selector, options) {

    function initSingleSlider($el, options) {
      var $slider, $rotaters,
        $handle, $handleItems,
        numOfItems,
        angle, currentAngle = 0,
        prefix = ".slider3d__",
        handlePrefix = prefix + "handle__",
        rotating = false;

      var defaultOptions = {
        xRotation: false,
        speed: 1100,
        dragSpeedCoef: 0.7,
        handleSpeedCoef: 6,
        easing: "ease",
        persMult: 1.6,
        handlePersMult: 3,
        scrollRotation: true,
        keysRotation: true,
        globalDragRotation: false,
        withControls: true,
        handleAndGlobalDrag: false,
        allowDragDuringAnim: false,
        allowScrollDuringAnim: false,
        allowKeysDuringAnim: false,
        allowControlsDuringAnim: false
      };

      var __opts = $.extend(defaultOptions, options);

      var axis = (__opts.xRotation) ? "Y" : "X";
      var angleMult = (__opts.xRotation) ? 1 : -1;

      function handleActiveItem() {
        if (!__opts.withControls) return;
        $handleItems.removeClass("active");
        var a = currentAngle % 360 / angle;
        if (a < 0) a = numOfItems + a;
        if (a > 0) a = a + 1;
        if (!a) a = 1;
        $handleItems.eq(a - 1).addClass("active");
      };

      function rotateSlider(delta) {
        var newAngle = currentAngle + delta * angle;

        $rotaters.css({
          "transform": "rotate" + axis + "(" + (newAngle * angleMult * -1) + "deg)",
          "transition": "transform " + __opts.speed / 1000 + "s " + __opts.easing
        });
        currentAngle = newAngle;

        setTimeout(function() {
          $rotaters.css("transition", "transform 0s");
          handleActiveItem();
          rotating = false;
        }, __opts.speed);
      };

      function navigateUp() {
        rotateSlider(-1);
      };

      function navigateDown() {
        rotateSlider(1);
      };

      function scrollHandler(e) {
        if (rotating && !__opts.allowScrolluringAnim) return;
        rotating = true;
        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        if (delta > 0) {
          navigateUp();
        } else if (delta < 0) {
          navigateDown();
        }
      };

      function keydownHandler(e) {
        if (rotating && !__opts.allowKeysDuringAnim) return;
        rotating = true;
        if (e.which === 38) {
          navigateUp();
        } else if (e.which === 40) {
          navigateDown();
        }
      }

      function dragRotationHandler(e) {
        if (rotating && !__opts.allowDragDuringAnim) return;
        rotating = true;
        $slider.addClass("no-select");

        var startVal;
        if (__opts.xRotation) {
          startVal = e.pageX || e.originalEvent.touches[0].pageX;
        } else {
          startVal = e.pageY || e.originalEvent.touches[0].pageY;
        }
        var sliderS = (__opts.xRotation) ? $slider.width() : $slider.height();
        var deltaVal = 0;
        var newAngle;
        var angleDelta;
        var isHandle = $(this).hasClass("js-handle");
        var rotationCoef;
        if (isHandle) {
          rotationCoef = __opts.handleSpeedCoef;
        } else {
          rotationCoef = __opts.dragSpeedCoef;
        }

        if (__opts.scrollRotation) {
          $slider.off("mousewheel DOMMouseScroll", scrollHandler);
        }

        $(document).on("mousemove touchmove", function(e) {
          var val;
          if (__opts.xRotation) {
            val = e.pageX || e.originalEvent.touches[0].pageX;
          } else {
            val = e.pageY || e.originalEvent.touches[0].pageY;
          }
          deltaVal = (startVal - val) / sliderS * rotationCoef;
          newAngle = currentAngle + deltaVal * angle;
          angleDelta = newAngle - currentAngle;

          $rotaters.css("transform", "rotate" + axis + "(" + (newAngle * angleMult * -1) + "deg)");
        });

        $(document).on("mouseup touchend", function(e) {
          $(document).off("mousemove touchmove mouseup touchend");
          $slider.removeClass("no-select");

          if (!deltaVal) {
            rotating = false;
            if (__opts.scrollRotation) {
              $slider.on("mousewheel DOMMouseScroll", scrollHandler);
            }
            return;
          }

          var slidesRotated = Math.round(angleDelta / angle);
          rotateSlider(slidesRotated);
          deltaVal = 0;

          setTimeout(function() {
            if (__opts.scrollRotation) {
              $slider.on("mousewheel DOMMouseScroll", scrollHandler);
            }
          }, __opts.speed);
        });

      };

      function initControls() {
        var $controls = $(prefix + "controls");
        $handle = $(prefix + "handle", $slider);
        var $handleInner = $(handlePrefix + "inner", $handle);
        $handleItems = $(handlePrefix + "item", $handle);
        var s = (__opts.xRotation) ? $handle.width() : $handle.height();
        var pers = s * __opts.handlePersMult;
        var depth = s / 2 / Math.tan(angle / 2 * Math.PI / 180);

        $slider.addClass("with-controls");
        $handle.css({
            "-webkit-perspective": pers + "px",
            "perspective": pers + "px"
          })
          .addClass("js-handle");
        $handleInner.css("transform", "translateZ(-" + depth + "px)");

        if (__opts.xRotation) $controls.addClass("m--xAxis");

        $handleItems.each(function(index) {
          $(this).css("transform", "rotate" + axis + "(" + (index * angle * angleMult) + "deg) translateZ(" + depth + "px)");
        });

        $rotaters = $(prefix + "rotater, " + handlePrefix + "rotater", $slider);

        $handle.on("mousedown touchstart", dragRotationHandler);

        $(document).on("click", ".slider3d__control", function() {
          if (rotating && !__opts.allowControlsDuringAnim) return;
          rotating = true;
          if ($(this).hasClass("m--up")) {
            navigateUp();
          } else {
            navigateDown();
          }
        });
      };

      function initSlider($el) {
        $slider = $el;
        var $wrapper = $(prefix + "wrapper", $slider);
        var $inner = $(prefix + "inner", $slider);
        var $items = $(prefix + "item", $slider);
        numOfItems = $items.length;
        angle = 360 / numOfItems;
        var s = (__opts.xRotation) ? $slider.width() : $slider.height();
        var pers = s * __opts.persMult;
        var depth = s / 2 / Math.tan(angle / 2 * Math.PI / 180);

        $wrapper.css({
          "-webkit-perspective": pers + "px",
          "perspective": pers + "px"
        });
        $inner.css("transform", "translateZ(-" + depth + "px)");

        $items.each(function(index) {
          $(this).css("transform", "rotate" + axis + "(" + (index * angle * angleMult) + "deg) translateZ(" + depth + "px)");
        });

        $slider.addClass("slider-ready");

        $rotaters = $(prefix + "rotater", $slider);

        if (__opts.scrollRotation) {
          $slider.on("mousewheel DOMMouseScroll", scrollHandler);
        }
        if (__opts.keysRotation) {
          if (!$slider.attr("tabindex")) {
            $slider.attr("tabindex", 1);
          }
          $slider.on("keydown", keydownHandler);
        }
        if (__opts.globalDragRotation) {
          $slider.on("mousedown touchstart", dragRotationHandler);
        }
        if (__opts.withControls) {
          initControls();
        }
      };

      initSlider($el);

    }

    function globalInit() {
      $(selector).each(function() {
        initSingleSlider($(this), options);
      });
    };

    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    var resizeFn = debounce(function() {
      globalInit();
    }, 100);

    $(window).on("resize", resizeFn);

    globalInit();

  };

  window.rotatingSlider = rotatingSlider;
}());

$(document).ready(function() {

  rotatingSlider(".slider3d", {
    xRotation: false,
    globalDragRotation: true
  });

});


$(document).ready(function() {
  
  $('.canary').addClass('animated zoomIn');

  $("input, select, textarea").jqBootstrapValidation();

});