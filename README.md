jQuery.locationPicker()
===

This plugin takes an input field and turns it into a "Facebook style" location
(town/city and country) picker. The "picker" suggests locations found searching
for what the use is typing using
[Google's Geocoding API](http://code.google.com/apis/maps/documentation/geocoding/).

So far it seems to work fine (meaning I've testes) on:

* Google Chrome 13.0.782.107
* Safari 5.1
* FireFox 5.0.1
* Opera 11.50
* iOS (tested on iOS Simulator both for iPhone and iPad)
* Internet Explorer 8

## Demo

[http://demos.e-noise.com/jQuery.locationPicker/](http://demos.e-noise.com/jQuery.locationPicker/)

## Example

    ...
    <input name="loc" id="loc">

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
    <script src="js/jquery.location-picker.js"></script>
    <script>
    jQuery(document).ready(function ($) {
      $('#loc').locationPicker();
    });
    </script>
    ...

