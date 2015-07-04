from collections import OrderedDict
from datetime import datetime

import requests

fight_url = "http://api.vpopulus.net/v1/feeds/battle/fights.json?id=%d&page=%d"
battle_url = "http://api.vpopulus.net/v1/feeds/battle.json?id=%d"
active_battles_url = "http://api.vpopulus.net/v1/feeds/active-battles.json"


def get_battle_info(battle_id):
    r = requests.get(battle_url % battle_id)
    b = r.json()
    b['is_resistance'] = b['is-resistance'] == "true"
    b['is_active'] = b['is-active'] == "true"
    b['defence_points'] = b['defence-points']
    b['att_side'] = b['fights']['att-side']
    b['def_side'] = b['fights']['def-side']
    return b


def get_fights(battle_id):
    fights = []
    current_page = 1
    pages = 2

    while current_page <= pages:
        r = requests.get(fight_url % (battle_id, current_page))
        json_data = r.json()
        fights.extend(json_data['fights'])

        pages = json_data['pages']
        current_page += 1

    return fights


def get_fighter_toplist(battle, fights):
    sides = {
        'side_a': OrderedDict(),
        'side_d': OrderedDict(),
    }
    for f in fights:
        if f['side-id'] == battle['attacker']['id']:
            side = "side_a"
        else:
            side = "side_d"

        citizen_id = str(f['citizen']['id'])  # for mongodb
        if citizen_id not in sides[side]:
            sides[side][citizen_id] = {
                'citizen': f['citizen'],
                'fights': [],
                'damage': 0,
                'num_of_fights': 0,
            }

        tmp = f
        del tmp['citizen']
        sides[side][citizen_id]['fights'].append(tmp)
        sides[side][citizen_id]['num_of_fights'] += 1
        sides[side][citizen_id]['damage'] += float(f['damage'])

    sides = {
        'side_a': OrderedDict(sorted(sides['side_a'].iteritems(), reverse=True,
                                     key=lambda x: x[1]['damage'])),
        'side_d': OrderedDict(sorted(sides['side_d'].iteritems(), reverse=True,
                                     key=lambda x: x[1]['damage']))
    }
    sides = {
        'side_a': [v for k, v in sides['side_a'].items()],
        'side_d': [v for k, v in sides['side_d'].items()],
    }
    return sides


def get_chart_data(battle, fights):
    chart_data = []
    wall = battle['objectives']['secure']
    attacker = battle['attacker']['id']

    for f in fights:
        damage = float(f['damage'])
        if f['side-id'] == attacker:
            damage *= -1

        wall += damage

        chart_data.append({
            'wall': wall,
            'damage': damage,
            'time': datetime.strptime(f['time'], "%Y-%m-%d %H:%M:%S"),
            'citizen': f['citizen']['name'],
        })

    return chart_data


def get_battle_datas(battle_id):
    from pymongo import MongoClient
    collection = MongoClient().vpop.battles
    result = collection.find_one({'battle_id': battle_id})
    if result:
        return result
    fights = get_fights(battle_id)
    battle = get_battle_info(battle_id)
    chart = get_chart_data(battle, fights)
    toplist = get_fighter_toplist(battle, fights)

    data = {
        'battle_id': battle_id,
        'fights': fights,
        'battle': battle,
        'chart': chart,
        'toplist': toplist,
    }

    if not battle['is_active']:
        collection.insert(data)

    return data


def get_active_battles(num=5):
    try:
        num = int(num)
        num = num if 0 < num < 21 else 5
    except:
        num = 5
    active_battles = requests.get(active_battles_url).json()['battles']
    latest_battle_id = int(active_battles[1]['id'])

    latest_battles = []
    for i in range(1, 1 + num):
        latest_battles.append(
            requests.get(battle_url % (latest_battle_id - i)).json()
        )

    return {
        'latest_battles': latest_battles,
        'active_battles': active_battles,
    }
