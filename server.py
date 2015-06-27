from flask import Flask, render_template, jsonify, request, redirect, url_for
import requests

from helpers import get_battle_datas, get_active_battles

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
def battle_list():
    battle_id = request.args.get("battle_id")
    if battle_id:
        return redirect(url_for("battle", battle_id=battle_id))

    battles = get_active_battles()
    return render_template("battle_list.html",
                           active=battles['active_battles'],
                           latest=battles['latest_battles'])


@app.route("/battle/<int:battle_id>")
def battle(battle_id):
    bd = get_battle_datas(battle_id)
    return render_template("battle.html", chart_data=bd['chart'],
                           battle=bd['battle'], toplist=bd['toplist'])


API_URL = "http://api.vpopulus.net/v1/feeds/"


def query_api(url):
    re = requests.get("%s%s" % (API_URL, url))
    if re.status_code != 200:
        return {'message': "API is down."}
    else:
        return re.json()


@app.route("/api/top/<order_by>")
def api_top(order_by):
    data = query_api("all-citizens.json?order-by=%s" % order_by)
    return jsonify(data)


@app.route("/api/citizen/<string:citizen_name>")
def api_citizen(citizen_name):
    data = query_api("citizen.json?name=%s" % citizen_name)
    return jsonify(data)


@app.route("/api/company/<query_type>/<int:company_id>")
def api_company(query_type, company_id):
    if query_type == "employees":
        link = "company/employees.json?id=%d"
    else:
        link = "company.json?id=%d"
    data = query_api(link % company_id)
    return jsonify(data)


@app.route("/api/market/<int:country>/<int:industry>/<int:quality>")
def api_market(country, industry, quality):
    link = API_URL + "market.json?country=%d&industry=%d&quality=%d"
    re = requests.get(link % (country, industry, quality))
    return jsonify(re.json())


if __name__ == "__main__":
    app.run(debug=True)
