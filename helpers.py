from datetime import datetime
import requests

fight_url = "http://api.vpopulus.net/v1/feeds/battle/fights.json?id=%d&page=%d"
battle_url = "http://api.vpopulus.net/v1/feeds/battle.json?id=%d"


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
    print "szio"
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


def create_stats(battle, battle_id):
    stats = {}
    fights = get_fights(battle_id)
    for f in fights:
        citizen_id = f['citizen']['id']
        if citizen_id not in stats:
            stats[citizen_id] = {
                'citizen': f['citizen'],
                'fights': [],
                'side_%d' % battle['attacker']['id']: 0,
                'side_%d' % battle['defender']['id']: 0,
            }

        tmp = f
        del tmp['citizen']
        stats[citizen_id]['fights'].append(tmp)
        stats[citizen_id]['side_%d' % f['side-id']] += float(f['damage'])

    return stats


def get_chart_data(battle, battle_id):
    fights = get_fights(battle_id)
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
