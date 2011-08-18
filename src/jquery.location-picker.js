/*!!
 * jQuery.locationPicker() plugin.
 *
 * @author Lupo Montero <lupo@e-noise.com>
 */

/*jslint browser: true */
/*global jQuery: false */

(function ($) {

var defSettings = {
  proxy_url: 'proxy.php',
  flags_path: 'img/flags'
};

var buildSuggestions = function (settings, results, cb) {
  var i, len, j, len2, k, len3, suggestions = [], result, loc, address_comps, iso, pn = '';

  if (!results || !results.length) {
    return;
  }

  for (i = 0, len = results.length; i < len; i++) {
    result = results[i];
    loc = {
      value: '',
      title: '',
      subtitle: null,
      img: '',
      data: { raw: result }
    };

    address_comps = result.address_components || [];
    for (j = 0, len2 = address_comps.length; j < len2; j++) {
      for (k = 0, len3 = address_comps[j].types.length; k < len3; k++) {
        if (address_comps[j].types[k] === 'country') {
          loc.data.country = {
            short_name: address_comps[j].short_name,
            long_name: address_comps[j].long_name
          };
        } else if (address_comps[j].types[k] === 'locality') {
          loc.data.locality = {
            short_name: address_comps[j].short_name,
            long_name: address_comps[j].long_name
          };
        } else if (address_comps[j].types[k] === 'administrative_area_level_1') {
          loc.data.state = {
            short_name: address_comps[j].short_name,
            long_name: address_comps[j].long_name
          };
        }
      }
    }

    pn = '';

    if (loc.data.locality) { pn += loc.data.locality.short_name; }
    if (loc.data.state && loc.data.state.short_name && (!loc.data.locality || loc.data.state.short_name !== loc.data.locality.short_nameshort_name)) {
      if (pn.length > 0) { pn += ', '; }
      pn += loc.data.state.short_name;
    }

    if (loc.data.country) {
      pn += ', ' + loc.data.country.short_name;

      iso = loc.data.country.short_name.toLowerCase();
      if (settings.flags_path) {
        loc.img = iso + '.png';
      }
    }

    loc.value = pn.replace(/, /g, ',');
    loc.title = pn;
    suggestions.push(loc);
  }

  cb(suggestions);
};

var createLocationPicker = function (settings, node) {
  var xhr;

  node.suggest({
    img_path: settings.flags_path,
    search: function (s, cb) {
      // abort previously triggered xhr
      if (xhr) {
        xhr.abort();
      }

      xhr = $.ajax({
        url: settings.proxy_url + '?s=' + encodeURIComponent(s),
        dataType: 'json',
        success: function (data) {
          if (!data || !data.status || data.status !== 'OK') {
            // handle error
          }

          buildSuggestions(settings, data.results, cb);
        }
      });
    },
    select: function (e, val) {
      settings.select && settings.select(e, val);
    },
    clear: function () {
      if (xhr) { xhr.abort(); }
      settings.clear && settings.clear();
    }
  });
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
