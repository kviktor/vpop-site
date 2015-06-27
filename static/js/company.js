var company;
var workers;
var company_id;
var fixed;

$(function() {
  $("#company-id-submit").click(function() {
    var company_id = $("#company-id").val();
    if(Number.isInteger(parseInt(company_id))) {
      getCompanyDatas(company_id);
    } else {
      setAlertMessage('"' + company_id + '" is not a number.');
    }

    window.location.hash = company_id;
    return false;
  });

  $("#unit-price, #raw-price").bind("input", function() {
    reCalculateTable();
  });

  $("#company-list table tbody").on("input", ".worker-salary",function() {
    reCalculateTable();
  });
  
  $("#company-list table tbody").on("input", ".worker-skill",function() {
    reCalculateProduction();
    reCalculateTable();
  });

  $("#company-list table tbody").on("input", ".worker-wellness",function() {
    reCalculateProduction();
    reCalculateTable();
  });

  $("#construction_select").change(function() {
    reCalculateProduction();
    reCalculateTable();
  });

  $("#add-worker").click(function() {
    addDefaultWorker();
    reCalculateProduction();
    reCalculateTable();
    return false;
  });

  hash = window.location.hash;
  if(hash) {
    $("#company-id").val(hash.substr(1)); 
    $("#company-id-submit").click();
  }

});



function getCompanyDatas(company_id) {
  // company data
  getAPI("company/best_api_ever/" + company_id, createCompanyProfile);
}

function createCompanyProfile(data) {
  company = data;
  // create better way to identify the company
  company_type_id = company['type']['id'];
  if([1, 3, 5, 7, 9].indexOf(company_type_id) != -1)
    company['skill_type'] = "land";
  else if([2, 4, 6, 8].indexOf(company_type_id) != -1)
    company['skill_type'] = "manu";
  else
    company['skill_type'] = "cons";

  // 
  if(company['skill_type'] === "cons") {
    $("#construction_select").show();
    fixed = 5;
  } else {
    $("#construction_select").hide();
    fixed = 3;
  }

  // workaround for type.name being null
  if(!company['type']['name'])
    company['type']['name'] = "cons";

  // create the profile
  createProfile();
  $("#company-profile").show();

  // workers data
  getAPI("company/employees/" + company.id, createCompanyWorkers);
}

function createCompanyWorkers(data) {
  workers = data.employees 
  // create the table
  createTable();

  // display/hide raws column
  if(company['skill_type'] == "land") {
    $(".column-raws").hide();
  } else {
    $(".column-raws").show();
  }

  $("#company-list").show();

  reCalculateProduction();
  reCalculateTable();

  // get the current price from market
  api_url = "market/" + company['location']['country']['id'] +
            "/" + company['type']['id'] + "/" + company['quality'];

  getAPI(api_url, createUnitMinPrice);
}

function createUnitMinPrice(data) {
  var min_price;
  try {
    min_price = data.offers[0]['price'];
  } catch(err) {
    min_price = 0;
  }
  $("#unit-price").val(min_price).trigger("input");

  // get the current price of the raw from the market if need
  if(company['skill_type'] != "land") {
    var raw_id;
    switch(company['type']['id']) {
      case 2: raw_id = 1; break;
      case 4: raw_id = 3; break;
      case 6: raw_id = 5; break;
      case 8: raw_id = 7; break;
      default: raw_id = 9;
    }

    api_url = "market/" + company['location']['country']['id'] +
              "/" + raw_id + "/" + 1;

    getAPI(api_url, createRawMinPrice);
  }
}

function createRawMinPrice(data) {
  var min_price;
  try {
    min_price = data.offers[0]['price'];
  } catch(err) {
    min_price = 0;
  }
  $("#raw-price").val(min_price).trigger("input");
}


function createProfile() {
  $("#company-profile-left img").prop("src", company['avatar-link']);
  var html = '<p><a href="http://vpopulus.net/company/' + company['id'] + '">' + company['name'] + "</a>";
  html += ", Q" + company['quality'] + " " + makeTitle(company['type']['name']) +
              " (" + makeTitle(company['skill_type']) + ")";
  html += "</p><p>";
  html += '<a href="http://vpopulus.net/region/' + company['location']['region']['id'] + '">' + company['location']['region']['name'] + "</a>"
  html += " / ";
  html += '<a href="http://vpopulus.net/country/' + company['location']['country']['id'] + '">' + company['location']['country']['name'] + "</a>"
  html += ' <img class="country-logo" src="' + flagURL(company['location']['country']['name']) + '"/>';
  html += "</p>";

  $("#company-profile-right").html(html);
}


function createTable() {
  var html = "";
  for(w in workers) {
    html += createTableRow(workers[w]);
  }
  $("#company-list table tbody").html(html);
}


function createTableRow(worker) {
  var production = 0; //calculateProduction(worker['wellness'], worker['skills'][company['skill_type']]);
  var units = 0;
  row = "<tr><td>";
  row += '<img src="' + worker['avatar-link'] + '"/></td>';
  row += '<td><a href="http://vpopulus.net/citizen/' + worker['id'] + '">' + worker['name'] + "</a></td>";
  row += '<td><input type="number" min="0" max="100" class="form-control input-sm worker-wellness" value="'
          + worker['wellness'] + '"/></td>';
  row += '<td><input type="text" class="form-control worker-skill input-sm" value="' + 
          worker['skills'][company['skill_type']] + '"/></td>';
  row += '<td><input type="text" class="form-control worker-prod input-sm" value="' + 
          production + '" readonly/></td>';
  row += '<td><input type="text" class="form-control worker-units input-sm" value="' + 
          units + '" readonly/></td>';
  if(company['skill_type'] != "land") {
    row += '<td><input type="text" class="form-control worker-raws input-sm" value="" readonly></td>';
  }
  row += '<td><input type="text" class="form-control worker-salary input-sm" placeholder="Salary"/></td>';
  row += '<td><input type="text" class="form-control worker-sales input-sm" placeholder="Sales" readonly/></td>';
  if(company['skill_type'] != "land") {
    row += '<td><input type="text" class="form-control worker-raws-price input-sm" value="" readonly></td>';
  }
  row += '<td><input type="text" class="form-control worker-profit input-sm" placeholder="Profit" readonly/></td>';
  row += "</tr>";
  return row;
}

function addDefaultWorker() {
  fake_worker = {
    'avatar-link': getDefaultUserAvatar(),
    'name': "Default Worker",
    'id': 1,
    'wellness': 98,
    'skills': {
      'land': 6.5,
      'cons': 6.5,
      'manu': 6.5,
    }
  }

  var row_html = createTableRow(fake_worker);
  $("#company-list table tbody").append(row_html);
}

function calculateProduction(wellness, skill) {
  if(wellness == 0) return 0;
  var region_factor = 1.0;
  if(company['skill_type'] == "land") {
    type = company['type']['name'];
    resources = company['location']['region']['resources'];
    if(type in resources) {
      if(resources[type] == "high") {
        region_factor = 2.0;
      } else {
        region_factor = 1.0;
      }
    } else {
      region_factor = 0.1;
    }
  }
  var wellness_factor = (wellness / 100.0) + 1.0;
  var emp_factor = 2.0; // nooo

  return (skill * wellness_factor * region_factor * emp_factor) / company['quality'];
}


function reCalculateTable() {
  var unit_price = $("#unit-price").val();
  unit_price = parseFloat(unit_price);
  if(isNaN(unit_price)) unit_price = 0;
  
  // update table
  var sum_sales = 0;
  var sum_profit = 0;
  var sum_salary = 0;
  var sum_raws_price = 0;
  $("#company-list table tbody tr").each(function() {
    var sales = unit_price * $(".worker-units", this).val();
    var salary = $(".worker-salary", this).val();
    if(salary == "") salary = 0.0;
    else salary = parseFloat(salary);
    var profit = sales - salary;
 
    if(company['skill_type'] != "land") {
      var raws = $(".worker-raws", this).val();
      var raw_price = $("#raw-price").val();
      var raws_price = raws * raw_price;
      $(".worker-raws-price", this).prop("value", raws_price.toFixed(3));
      profit -= raws_price;
      
      sum_raws_price += raws_price;
    }
    
    $(".worker-sales", this).prop("value", sales.toFixed(3));
    $(".worker-profit", this).prop("value", profit.toFixed(3));
    
    // calculate sums
    sum_profit += profit;
    sum_sales += sales;
    sum_salary += salary;
  });

  // update sums
  $("#sum-profit").html(sum_profit.toFixed(3));
  $("#sum-sales").html(sum_sales.toFixed(3));
  $("#sum-salary").html(sum_salary.toFixed(3));
  $("#sum-raws-price").html(sum_raws_price.toFixed(3));
}

function reCalculateProduction() {
  var sum_prod = 0;
  var sum_units = 0;
  var sum_raws = 0;
  $("#company-list table tbody tr").each(function() {
    var skill = $(".worker-skill", this).val();
    var wellness = $(".worker-wellness", this).val();
    var production = calculateProduction(wellness, skill);
    var units = getUnitsFromProduction(production);
    $(".worker-prod", this).val(production.toFixed(fixed));
    $(".worker-units", this).val(units.toFixed(fixed));

    if(company['skill_type'] != "land") {
      var raws = production * company['quality'];
      $(".worker-raws", this).val(raws.toFixed(3));
      sum_raws += raws;
    }

    sum_prod += production;
    sum_units += units;
  });

  $("#sum-prod").html(sum_prod.toFixed(fixed));
  $("#sum-units").html(sum_units.toFixed(fixed));
  $("#sum-raws").html(sum_raws.toFixed(3));


  // update days
  $("#days_needed").html("~" + (1/sum_units).toFixed(2));
}

function getUnitsFromProduction(prod) {
  switch(company['type']['id']) {
    case 2: return prod/2.0; 
    case 4: return prod/4.0;
    case 6: return prod/5.0;
    case 8: return prod/8.0;
    case 10: return prod/200.0;
    case 11: return prod/2000.0;
    case 12: return prod/2000.0;
    case 14: return prod/$("#construction_select select").val();
    default: return prod;
  }
}

function makeTitle(string) {
  return string.charAt(0).toUpperCase() + string.substr(1);
}
