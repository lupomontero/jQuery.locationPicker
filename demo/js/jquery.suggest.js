/*!!
 * jQuery.suggest() plugin.
 *
 * @author Lupo Montero <lupo@e-noise.com>
 */

/*jslint browser: true */
/*global jQuery: false */

(function ($) {

var defSettings = {
  def_value: '',
  def_image: 'default.png',
  img_path: ''
};

var makeListClickHandler = function (ui) {
  return function (e) {
    var a = $(this), result = a.data('suggest');

    e.preventDefault();

    ui.node.val(result.value);
    ui.node.data('suggest', result);
    ui.suggestInput.val(result.title).hide();
    ui.selHolder.html(result.title);

    ui.node.trigger('select', [ result ]);

    ui.selHolderWrapper.show();

    // have to set display to inline-block because .show() changes it to block
    ui.selHolderWrapper.css('display', 'inline-block');

    ui.suggestList.hide();
  };
};

var buildSuggestionsList = function (settings, ui, results) {
  var i, len, result, li, a, img;

  if (!results || !results.length) {
    return;
  }

  ui.suggestList.hide().html('');

  for (i = 0, len = results.length; i < len; i++) {
    result = results[i];
    li = $('<li>');
    a = $('<a>');
    a.attr('href', '#');

    if (result.img || settings.def_image) {
      img = $('<img>');
      if (!result.img) result.img = settings.def_image;
      img.attr('src', settings.img_path + '/' + result.img);
      a.append(img);
    }

    if (!result.title) {
      result.title = result.value;
    }

    a.append('<h4 class="suggest-title">' + result.title + '</h4>');

    if (result.subtitle) {
      a.append('<div class="suggest-subtitle">' + result.subtitle + '</div>');
    }

    a.attr('title', result.value);
    a.data('suggest', result);

    a.click(makeListClickHandler(ui));

    li.append(a);
    ui.suggestList.append(li);
  }

  ui.suggestList.show();
};

var createSuggestions = function (settings, node) {
  var
    ui = {
      node: node,
      wrapper: $('<div class="suggest" style="position: relative; display: inline;">'),
      suggestInput: $('<input size="30">'),
      suggestList: $('<ul>').hide(),
      selHolderWrapper: $('<div class="placeholder">').hide(), // selected placeholder wrapper
      selHolder: $('<div>'), // selected placeholder,
      selHolderCloseBtn: $('<a href="#">X</a>')
    },
    wrapper = ui.wrapper,
    suggestInput = ui.suggestInput,
    suggestList = ui.suggestList,
    selHolderWrapper = ui.selHolderWrapper,
    selHolder = ui.selHolder,
    selHolderCloseBtn = ui.selHolderCloseBtn,
    timeoutId,
    searchterm = '',
    xhr;

  if (settings.select) {
    node.bind('select', settings.select);
  }

  if (settings.clear) {
    node.bind('clear', settings.clear);
  }

  suggestInput.keydown(function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  suggestInput.keyup(function () {
    var val = suggestInput.val();

    if (val === searchterm) { return; }
    searchterm = val;

    if (val.length < 3) {
      node.val('');
      node.removeData();
      suggestList.hide();
      suggestInput.removeClass('suggest-loading');
      node.trigger('clear');
      return;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    suggestInput.addClass('suggest-loading');

    timeoutId = setTimeout(function () {
      var i, len;

      settings.search && settings.search(val, function (results) {
        suggestInput.removeClass('suggest-loading');
        buildSuggestionsList(settings, ui, results);
      });
    }, 500);
  });

  selHolderCloseBtn.click(function (e) {
    e.preventDefault();
    selHolderWrapper.hide();
    suggestInput.show();
    suggestList.show();
  });

  selHolderWrapper.append(selHolder);
  selHolderWrapper.append(selHolderCloseBtn);
  wrapper.append(suggestInput);
  wrapper.append(selHolderWrapper);
  wrapper.append(suggestList);
  node.hide().before(wrapper);
};

$.fn.suggest = function (options) {
  var settings = $.extend(defSettings, options || {});

  // Add behaviour to each selected input node
  $(this).each(function (i) {
    createSuggestions(settings, $(this));
  });
};

})(jQuery)
