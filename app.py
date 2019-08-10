import sqlite3
from flask import Flask
from flask import g, request
import json
from random import randrange


app = Flask(__name__)
DATABASE = 'database.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/update', methods=['POST'])
def update():
    db = get_db()
    cur = db.cursor()
    data = request.get_json()
    name = data.get('name')[:25]
    _code = data.get('code').split("\n")
    code = ""
    for i in range(len(_code)):
        code += _code[i][:40] + "\n"
        if i > 25:
            break

    if 'red' in data:
        cur.execute(
            'UPDATE users SET red = ? , green = ? , blue = ? , code = ? WHERE name = ?', (
                data.get('red'),
                data.get('green'),
                data.get('blue'),
                code,
                name,
            )
        ).fetchall()
    else:
        cur.execute(
            'UPDATE users SET code = ? WHERE name = ?', (
                code,
                name,
            )
        )
    return json.dumps(db.commit())


@app.route('/login', methods=['POST'])
def login():
    cur = get_db().cursor()
    data = request.get_json()
    name = data.get('name')[:25]
    print(name)
    ret = cur.execute(
        'SELECT red, green, blue, code FROM users WHERE name = ?', (name, )
    ).fetchone()
    if ret:
        return json.dumps(ret)
    # Create new user

    ret = cur.execute(
        'INSERT INTO users (name, red, green, blue) VALUES (?, ?, ?, ?) ', (
            name,
            randrange(255),
            randrange(255),
            randrange(255)
        )
    )
    get_db().commit()
    ret = cur.execute(
        'SELECT red, green, blue, code FROM users WHERE name = ?', (name, )
    ).fetchone()
    return json.dumps(ret)

    return "{}"
