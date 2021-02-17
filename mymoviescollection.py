from flask import Flask
from flask import request, jsonify
from flask_cors import CORS

from sqlalchemy import text
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import distinct, func, true

import requests
import json
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()


THEMOVIEDB_URL = os.environ['THEMOVIEDB_URL']
POSTREGSDB_URL = os.environ['POSTGRESDB_URL']

# ''' Postregs db connection '''
engine = create_engine(POSTREGSDB_URL)

metadata = MetaData()

# Reflect db to local class
metadata.reflect(engine, schema='moviecollections')

Base = automap_base(metadata=metadata)

Base.prepare()

Session = sessionmaker(bind=engine)
session = Session()

Films = Base.classes.collections

film = session.query(Films).all()
# print("postgres: " + film[1].overview)

# Movies searched by title, from themoviedb.org API


@ app.route('/search', methods=['GET'])
def search():
    if 'title' in request.args:
        title = request.args['title']

    dataa = get_movie_data(title)

    return (jsonify(dataa))


@ app.route('/searchCollection', methods=['GET'])
def searchCollection():

    coll = ""
    if 'collection' in request.args:
        coll = request.args['collection'] + ""
        print("search collection: " + coll)
        tmpstr = ""
        stmpstr = ""
        i = 0
        print(film[1].collection)
        aaa = bbb = ccc = ddd = ""
# distinct films by collection name
        while i < len(film):
            if film[i].collection == coll:
                tmpstr = ""
                aaa = str(film[i].title)
                bbb = str(film[i].overview)
                ccc = str(film[i].releasedate)
                ddd = str(film[i].language)
                tmpstr = '{"title":"' + aaa + '",' + \
                    '"overview":"' + bbb + '",' + \
                    '"releasedate":"' + ccc + '",' + \
                    '"language":"' + ddd + '"}'
#                dict(x.split('=') for x in tmpstr.split(','))
                stmpstr = tmpstr + ',' + stmpstr
            i = i+1


#    print(stmpstr)
#    films_in_collectionList = []
#    qry = session.query(distinct(Films).all())
#    result = session.execute(qry)
#   film = session.query(Films).all()
#   print("postgres: " + film[1].overview)
#    for row in result:
#        films_in_collectionList.append(, row[2], row[3], row[4])
#    print(result[1].title + result[1].overview)
#    result = session.execute(qry)
#   searchCollectionList = tuple(stmpstr)
#        dict(map(lambda x: x.split('='), stmpstr.split(';')))
    stmpstr = '{"Collection":[' + stmpstr[:-1] + \
        ']}'
    return (jsonify(stmpstr))


@ app.route('/addtitle/', methods=['GET'])
def addtitle():
    if 'title' in request.args:
        title = request.args['title']
        collection = request.args['collection']
        print("Add collection: " + collection + ' ' + title)

    dataa = get_movie_data(title)

    title = dataa['results'][0]['original_title']
    overview = dataa['results'][0]['overview']
    posterpath = dataa['results'][0]['poster_path']
    releasedate = dataa['results'][0]['release_date']
    backdroppath = dataa['results'][0]['backdrop_path']
    language = dataa['results'][0]['original_language']
# insert to DB
# push images to cloud
    return ("success")

# Get all collection-names


@ app.route('/getcollections', methods=['GET'])
def getcollections():

    qry = session.query(distinct(Films.collection))
    print(qry)
    result = session.execute(qry)

    collectionList = []

    for row in result:
        collectionList.append(row[0])

#    print(collectionList)
    return (jsonify(collectionList))


def get_movie_data(value):
    url = THEMOVIEDB_URL + value
    response = requests.request("GET", url)
    data = json.loads(response.text)
    return data


if __name__ == '__main__':
    app.run(threaded=True, port=3000)
