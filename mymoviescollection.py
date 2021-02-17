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
import time
import hashlib
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()


THEMOVIEDB_URL = os.environ['THEMOVIEDB_URL']
POSTREGSDB_URL = os.environ['POSTGRESDB_URL']
CLOUDYAPISECRET = os.environ['CLOUDYAPISECRET']
CLOUDYAPIKEY = os.environ['CLOUDYAPIKEY']

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

    stmpstr = '{"page":1,"collection":[' + stmpstr[:-1] + \
        ']}'
    print(stmpstr)
    return (jsonify(json.loads(stmpstr)))


@ app.route('/addtitle/', methods=['GET'])
def addtitle():
    if 'title' in request.args:
        title = request.args['title']
        collection = request.args['collection']
#        print("Add collection: " + collection + ' ' + title)

    dataa = jsonify(get_movie_data(title))

    title = dataa["results"][0]["original_title"]
    overview = dataa["results"][0]["overview"]
    posterpath = dataa["results"][0]["poster_path"]
    releasedate = dataa["results"][0]["release_date"]
    backdroppath = dataa["results"][0]["backdrop_path"]
    language = dataa["results"][0]["original_language"]

    print('add: ' + dataa["poster_path"][0])
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


def uploadtocloud(imgfile):
    '''------------Generate cloudy signature and POST to cloud ----------'''
    ''' Usage: uploadtocloud( /mgX9sExDcdwRx8YxPjL8ngfSTmn.jpg )
    '''
    imgpath = ('https://www.themoviedb.org/'
               't/p/w600_and_h900_bestv2')

    timestamp = str(int(time.time()))

    payload = 'public_id=' + imgfile[1:] + \
        '&timestamp=' + timestamp + CLOUDYAPISECRET

    signature = hashlib.sha1(payload.encode('utf-8')).hexdigest()

    tmp = imgfile[1:]

    data = {}
    data['file'] = imgpath + imgfile
    data['public_id'] = tmp
    data['api_key'] = CLOUDYAPIKEY  # data['eager'] = ""
    data['timestamp'] = timestamp
    data['signature'] = signature

    url = 'https://api.cloudinary.com/v1_1/http-ppl-1fi/image/upload'
    status = requests.post(url, data=data)
    return(status)


if __name__ == '__main__':
    app.run(threaded=True, port=3000)
