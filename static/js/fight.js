var citizen;
var fights;

$(function() {

  $("#citizen-name-submit").click(function() {
    var citizen_name = $("#citizen-name").val();
    getCitizenInfo(citizen_name);

    window.location.hash = citizen_name;
    return false;
  });


  $("#citizen-fights-list table tbody").on("input", ".fight-wellness", function() {
    reCalculateFightsTable();
  });

  $("#citizen-fights-list table tbody").on("change", ".fight-weapon", function() {
    reCalculateFightsTable();
  });

  $("#add-fight").click(function() {
    addFight();
    return false;
  });

  $("#daily-fight").click(function() {
    fights = 0;
    $("#citizen-fights-list table tbody").html("");

    for(var i=0; i<5; i++) {
      fights += 1;
      var row = createFightTableRow(100-i*10, 1);
      $("#citizen-fights-list table tbody").append(row);
    }
    reCalculateFightsTable();

    return false;
  });

  hash = window.location.hash;
  if(hash) {
    $("#citizen-name").val(hash.substring(1));
    $("#citizen-name-submit").click();
  }

});


function getCitizenInfo(citizen_name) {
  // company data
  citizen = getAPI("citizen/" + citizen_name, createFightPage);

  if(!(citizen && 'id' in citizen)) {
    return false;
  }
}

function createFightPage(data) {
  citizen = data;
  // create the profile
  createCitizenProfile();
  $("#citizen-profile").show();

  $("#citizen-fights-list table tbody").html("");
  fights = 0;
  addFight();
  reCalculateFightsTable();

  $("#citizen-fights-list").show();
}


function createCitizenProfile() {
  $("#citizen-profile-left img").prop("src", citizen['avatar-link']);
  var html = '<p><a href="http://vpopulus.net/citizen/' + citizen['id'] + '">' + citizen['name'] + "</a>";
  html += "</p><p>";
  html += '<a href="http://vpopulus.net/region/' + citizen['location']['region']['id'] + '">' + citizen['location']['region']['name'] + "</a>"
  html += " / ";
  html += '<a href="http://vpopulus.net/country/' + citizen['location']['country']['id'] + '">' + citizen['location']['country']['name'] + "</a>"
  html += ' <img class="country-logo" src="' + flagURL(citizen['location']['country']['name']) + '"/>';
  html += "</p>";
  html += "<p>Strength: " + citizen['military']['strength'] + "</p>";
  html += "<p>Rank: " + citizen['military']['rank-level'] + "</p>";
  html += '<img src="//www.vpopulus.net/assets/img/ico/rank/' + citizen['military']['rank-level'] + '.png" class="rank-icon"/>';

  $("#citizen-profile-right").html(html);
}


function createWeaponSelect(def) {
  var select = '<select class="fight-weapon form-control">';
  select += '<option value="0">No weapon</option>';
  for(var i=1; i<6; i++) {
    select += '<option ';
    if(i == def)
      select += 'selected="selected" ';
    select += 'value="' + i + '">Q' + i + '</option>';
  }
  select += "</select>";
  return select;
}


function createFightTableRow(wellness, weapon) {
  row = "<tr>";
  row += "<td>" + fights + "</td>";
  row += '<td><input type="number" min="0" max="100" class="form-control fight-wellness" value="' + wellness + '"/></td>';
  row += "<td>" + createWeaponSelect(weapon) + "</td>";
  row += '<td><div class="btn btn-warning fight-damage"></div></td>';
  row += "</tr>";
  return row;
}


function addFight() {
  fights += 1;
  var row_html = createFightTableRow(100, 1);
  $("#citizen-fights-list table tbody").append(row_html);
  reCalculateFightsTable();
}


function reCalculateFightsTable() {
  var sum_damage = 0;
  $("#citizen-fights-list table tbody tr").each(function() {
    weapon = $(".fight-weapon :selected", this).val();
    wellness = $(".fight-wellness", this).val();
    strength = citizen['military']['strength'];
    rank = citizen['military']['rank-level'];
    var damage = calculateDamage(weapon, rank, strength, wellness);
    $(".fight-damage", this).html(damage.toFixed(3));
    sum_damage += damage;
  });

  $("#sum-damage").html(sum_damage.toFixed(3));
}


function calculateDamage(weapon, rank, strength, wellness) {
  var weapon_bonus = 0.5; // if hand
  if(weapon > 0) {
    weapon_bonus = 1 + (weapon / 5.0);
  }

  return weapon_bonus * (1 + (rank / 5.0)) * strength * (1 + (wellness - 25) / 100.0) * 2.0;
}


function makeTitle(string) {
  return string.charAt(0).toUpperCase() + string.substr(1);
}
