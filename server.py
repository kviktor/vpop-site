from flask import Flask, render_template, jsonify
import requests

from helpers import get_battle_info, get_chart_data

app = Flask(__name__)


@app.route("/battle/<int:battle_id>")
def index(battle_id):
    b = get_battle_info(battle_id)
    chart_data = get_chart_data(b, battle_id)
    return render_template("battle.html", chart_data=chart_data, battle=b)


API_URL = "http://api.vpopulus.net/v1/feeds/"


@app.route("/api/top/<order_by>")
def api_top(order_by):
    re = requests.get(API_URL + "all-citizens.json?order-by=%s" % order_by)
    return jsonify(re.json())


@app.route("/api/citizen/<int:citizen_id>")
def api_citizen(citizen_id):
    re = requests.get(API_URL + "citizen.json?id=%d" % citizen_id)
    return jsonify(re.json())


@app.route("/api/company/<query_type>/<int:company_id>")
def api_company(query_type, company_id):
    if query_type == "employees":
        link = API_URL + "company/employees.json?id=%d"
    else:
        link = API_URL + "company.json?id=%d"
    re = requests.get(link % company_id)
    return jsonify(re.json())


@app.route("/api/market/<int:country>/<int:industry>/<int:quality>")
def api_market(country, industry, quality):
    link = API_URL + "market.json?country=%d&industry=%d&quality=%d"
    re = requests.get(link % (country, industry, quality))
    return jsonify(re.json())


if __name__ == "__main__":
    app.run(debug=True)
