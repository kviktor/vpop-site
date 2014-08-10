var origin_url = "http://localhost:5000/api/";

function getAPI(url) {
  var re;
  $.ajax({
    url: origin_url + url,
    async: false,
    success: function(result) {
      re = result;
    }
  });
  return re;
}

function makeTitle(string) {
  return string.charAt(0).toUpperCase() + string.substr(1);
}

function flagURL(country) {
  return "http://www.vpopulus.net/Resources/country_flags/S/" + country.replace(/ /g, '-') + ".png";
}
