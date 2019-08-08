import sqlite3
from flask import Flask
from flask import g, request


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


@app.route('/update')
def update():
    cur = get_db().cursor()
    cur.execute(
        'INSERT OR UPDATE INTO users (name, red, green, blue, code) VALUES (?, ?, ?, ?, ?)', (
            request.args.get('name'),
            request.args.get('red'),
            request.args.get('green'),
            request.args.get('blue'),
            request.args.get('code')
        )
    )

    