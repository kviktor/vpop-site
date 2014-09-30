var origin_url = "/api/";

function getAPI(url) {
  var re;
  $.ajax({
    url: origin_url + url,
    async: false,
    success: function(result) {
      re = result;
    }
  });

  if(re && 'message' in re) {
    if('message' in re) {
      setAlertMessage(re.message);
    } else {
      setAlertMessage("Unknown error.");
    }
  }

  return re;
}

function makeTitle(string) {
  return string.charAt(0).toUpperCase() + string.substr(1);
}

function flagURL(country) {
  return "http://www.vpopulus.net/assets/img/fla/S/" + country.replace(/ /g, '-') + ".png";
}

function getDefaultUserAvatar() {
  return "http://www.vpopulus.net/assets/others/avatars/citizen/def.gif";
}

function setAlertMessage(message) {
  $("#alert").html('<div class="alert alert-danger">' + message + '</div>');
  var div = $("#alert div");
  setTimeout(function() {
    $(div).slideUp();
  }, 5000);
}
