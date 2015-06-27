var citizens;
var max_val;
var toplist_type;

$(function() {
  $("#show-submit").click(function() {
    toplist_type = $("#toplist-type :selected").val();
    getToplist(toplist_type);

    window.location.hash = toplist_type
    return false;
  });
  hash = window.location.hash;
  if(hash) {
    $('#toplist-type option[value="' + hash.substring(1) + '"]')
    .prop("selected", true);
    $("#show-submit").click();
  }
});


function getToplist(toplist_type) {
  getAPI("top/"  + toplist_type, createToplist);
}

function createToplist(data) {
  citizens = data.citizens;
  max_val = getCitizenData(citizens[0]);
  createToplistTable();
  $("#toplist").show();
}

function createBar(citizen) {
  var data = getCitizenData(citizen);
  var percentage = data/max_val * 100;
  html = '<div class="progress progress-striped">';
  html += '<div class="progress-bar progress-bar success" role="progressbar" style="width: ' + percentage + '%">';
  html += "</div></div>" + data;
  return html;
}

function createToplistRow(citizen, num) {
  row = "<tr>";
  row += "<td>" + num + "</td>";
  row += '<td><img src="' + citizen['avatar-link'] + '"/></td>';
  row += '<td><img src="' + flagURL(citizen['citizenship']['country']['name']) + '"/> ';
  row += '<a href="http://vpopulus.net/citizen/' + citizen['id'] + '">' + citizen['name'] + '</a></td>';
  row += "<td>" + createBar(citizen) + "</td>";
  row += "</tr>";
  return row;
}


function createToplistTable() {
  var html = "";
  var num = 1;
  for(c in citizens) {
    html += createToplistRow(citizens[c], num);
    num++;
  }
  $("#toplist table tbody").html(html);
}

function getCitizenData(citizen) {
  switch(toplist_type) {
    case "experience.points": return citizen['experience']['points'];
    case "military.strength": return citizen['military']['strength'];
    case "military.rank-points": return citizen['military']['rank-points'];
    case "skills.manu": return citizen['skills']['manu'];
    case "skills.land": return citizen['skills']['land'];
    case "skills.cons": return citizen['skills']['cons'];
  }
}
