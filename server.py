from flask import Flask, render_template, jsonify
import requests

from helpers import get_battle_datas

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/fight/")
def fight():
    return render_template("fight.html")


@app.route("/top/")
def top():
    return render_template("top.html")


@app.route("/company/")
def company():
    return render_template("company.html")


@app.route("/battle/")
def battle2():
    return render_template("battle.html")


@app.route("/battle/<int:battle_id>")
def battle(battle_id):
    bd = get_battle_datas(battle_id)
    return render_template("battle.html", chart_data=bd['chart'],
                           battle=bd['battle'], toplist=bd['toplist'])


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
