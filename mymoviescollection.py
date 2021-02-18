from flask import Flask
from flask import request, jsonify
from flask_cors import CORS

from sqlalchemy import text
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine, MetaData, Table, Column
from sqlalchemy.orm import Session, sessionmaker, Query
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

cloudyimgurl = str(
    'https://res.cloudinary.com/http-ppl-1fi/image/upload/v1612373660')

''' Postregs db connection '''
engine = create_engine(POSTREGSDB_URL)

metadata = MetaData()

'''# Reflect db to local class'''
metadata.reflect(engine, schema='moviecollections')

Base = automap_base(metadata=metadata)

Base.prepare()

Session = sessionmaker(bind=engine)
session = Session()

Films = Base.classes.collections

'''  Movies searched by title, from themoviedb.org via API '''


@app.route('/search', methods=['GET'])
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

        query = Query(Films).filter(Films.collection == coll)

    return (jsonify(json.loads(query)))


@ app.route('/addtitle/', methods=['GET'])
def addtitle():
    if 'title' in request.args:
        title = request.args['title']
        collection = request.args['collection']
        print("Add title: " + title)

    movietitle = get_movie_data(title)

    title = movietitle['results'][0]['original_title']
    overview = movietitle['results'][0]['overview']
    posterpath = movietitle['results'][0]['poster_path']
    releasedate = movietitle['results'][0]['release_date']
    backdroppath = movietitle['results'][0]['backdrop_path']
    language = movietitle['results'][0]['original_language']

    # insert to DB
    ntrow = Films(collection=collection, title=title,
                  overview=overview,
                  releasedate=releasedate, language=language,
                  posterurl=cloudyimgurl + posterpath,
                  backurl=cloudyimgurl + backdroppath)

    session.add(ntrow)
    session.commit()

    # push images to cloud
    uploadtocloud(cloudyimgurl + posterpath + '.jpg')
    uploadtocloud(cloudyimgurl + backdroppath + '.jpg')

    return ("added to collection")


''' # Get all collection-names '''


@app.route('/getcollections', methods=['GET'])
def getcollections():

    qry = session.query(distinct(Films.collection))
    print(qry)
    result = session.execute(qry)

    collectionList = []

    for row in result:
        collectionList.append(row[0])

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
