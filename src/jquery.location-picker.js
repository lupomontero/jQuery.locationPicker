/*!!
 * jQuery.locationPicker() plugin.
 *
 * @author Lupo Montero <lupo@e-noise.com>
 */

/*jslint browser: true */
/*global jQuery: false */

(function ($) {

var defSettings = {
  flags_path: 'img/flags'
};

var makeListClickHandler = function (ui) {
  return function () {
    var a = $(this), title = a.attr('title');

    ui.node.val(title.replace(/, /g, ','));
    ui.node.data('loc', a.data('loc'));
    ui.node.data('geo', a.data('geo'));
    ui.locInput.val(title).hide();
    ui.selHolder.html(title);
    ui.selHolderWrapper.show();

    // have to set display to inline-block because .show() changes it to block
    ui.selHolderWrapper.css('display', 'inline-block');

    ui.locList.hide();
  };
};

var buildSuggestions = function (settings, ui, results) {
  var i, len, j, len2, k, len3, li, a, result, address_comps, iso, pn = '';

  if (!results || !results.length) {
    return;
  }

  ui.locList.hide().html('');

  for (i = 0, len = results.length; i < len; i++) {
    result = results[i];
    loc = {};
    li = $('<li>');
    a = $('<a>');
    a.attr('href', '#');
    a.html(result.formatted_address);

    address_comps = result.address_components || [];
    for (j = 0, len2 = address_comps.length; j < len2; j++) {
      for (k = 0, len3 = address_comps[j].types.length; k < len3; k++) {
        if (address_comps[j].types[k] === 'country') {
          loc.country = {
            short_name: address_comps[j].short_name,
            long_name: address_comps[j].long_name
          };
        } else if (address_comps[j].types[k] === 'locality') {
          loc.locality = {
            short_name: address_comps[j].short_name,
            long_name: address_comps[j].long_name
          };
        } else if (address_comps[j].types[k] === 'administrative_area_level_1') {
          loc.state = {
            short_name: address_comps[j].short_name,
            long_name: address_comps[j].long_name
          };
        }
      }
    }

    pn = '';

    if (loc.locality) { pn += loc.locality.short_name; }
    if (loc.state && loc.state.short_name && (!loc.locality || loc.state.short_name !== loc.locality.short_nameshort_name)) {
      if (pn.length > 0) { pn += ', '; }
      pn += loc.state.short_name;
    }

    if (loc.country) {
      pn += ', ' + loc.country.short_name;

      iso = loc.country.short_name.toLowerCase();
      a.addClass(iso);
      if (settings.flags_path) {
        a.css('background-image', 'url(' + settings.flags_path +'/' + iso + '.png)');
      }
    }

    a.attr('title', pn);

    // store data objects so they can be assigned to original node on click
    a.data('loc', loc);
    a.data('geo', result);

    a.click(makeListClickHandler(ui));

    li.append(a);
    ui.locList.append(li);
  }

  ui.locList.show();
};

var createLocationPicker = function (settings, node) {
  var
    ui = {
      node: node,
      wrapper: $('<div class="location-picker" style="position: relative; display: inline;">'),
      locInput: $('<input size="30">'),
      locList: $('<ul>').hide(),
      selHolderWrapper: $('<div class="placeholder">').hide(), // selected placeholder wrapper
      selHolder: $('<div>'), // selected placeholder,
      selHolderCloseBtn: $('<a href="#">X</a>')
    },
    wrapper = ui.wrapper,
    locInput = ui.locInput,
    locList = ui.locList,
    selHolderWrapper = ui.selHolderWrapper,
    selHolder = ui.selHolder,
    selHolderCloseBtn = ui.selHolderCloseBtn,
    timeoutId,
    searchterm = '',
    xhr;

  locInput.keydown(function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  locInput.keyup(function () {
    var val = locInput.val();

    if (val === searchterm) { return; }
    searchterm = val;

    if (val.length < 3) {
      if (xhr) { xhr.abort(); }
      node.val('');
      node.removeData();
      locList.hide();
      locInput.removeClass('location-picker-loading');
      return;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    locInput.addClass('location-picker-loading');

    timeoutId = setTimeout(function () {
      var i, len;

      // abort all other previously triggered xhrs
      if (xhr) {
        xhr.abort();
      }

      xhr = $.ajax({
        url: 'proxy.php?s=' + encodeURIComponent(val),
        dataType: 'json',
        success: function (data) {
          if (!data || !data.status || data.status !== 'OK') {
            // handle error
          }

          locInput.removeClass('location-picker-loading');
          buildSuggestions(settings, ui, data.results);
        }
      });
    }, 500);
  });

  selHolderCloseBtn.click(function () {
    selHolderWrapper.hide();
    locInput.show();
    locList.show();
  });

  selHolderWrapper.append(selHolder);
  selHolderWrapper.append(selHolderCloseBtn);
  wrapper.append(locInput);
  wrapper.append(selHolderWrapper);
  wrapper.append(locList);
  node.hide().before(wrapper);
};

// export plugin
$.fn.locationPicker = function (options) {
  var settings = $.extend(defSettings, options || {});

  // Add behaviour to each selected input node
  $(this).each(function (i) {
    createLocationPicker(settings, $(this));
  });
};

})(jQuery);
