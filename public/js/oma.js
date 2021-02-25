function searchMovies() {
    var st = $("#searchterm").val();
    if (st === "" || st === null) {
        return false;
    }

// Generates, gets movie datas from backend and injects Bootstrap-table to #app in index.html
    $("#app").empty();
    parameter = "?title=" + st;
    $.get("https://bcdemo2021.herokuapp.com/search" + parameter, function (mvdata, status) {
        tblhead = `  <div class="row">
                            <div class="col-sm-3"><h2>Poster</h2></div>
                            <div class="col-sm-2"><h2>Title</h2></div>
                            <div class="col-sm-3"><h2>Overview</h2></div>
                            <div class="col-sm-3"><h2>Back</h2></div>
                            <div class="col-sm-1"> </div>
                        </div>`
        tblbody = "";   
        console.log(mvdata)
        for (var i = 0; i < mvdata.results.length; i++) {
            tblbody = tblbody + '<div class="row">'
                + '<div class="col-sm-3"><img class="img-fluid" src="https://www.themoviedb.org/t/p/w600_and_h900_bestv2' + mvdata.results[i].poster_path + '"></img></div>'
                + '<div class="col-sm-2"><div id="a'+i+'">' + mvdata.results[i].original_title + '</div><br><br>'
                + 'Released: ' + mvdata.results[i].release_date + '<br><br>'
                + 'Language: ' + mvdata.results[i].original_language + '</div>'
                + '<div class="col-sm-3">' + mvdata.results[i].overview + '</div>'
                + '<div class="col-sm-3"><img class="img-fluid" src="https://www.themoviedb.org/t/p/w600_and_h900_bestv2' + mvdata.results[i].backdrop_path + '"></img></div>'
                + '<div class="col-sm-1"><button type=\"button\" class=\"btn-lg btn-warning\" onclick=\"addFunction('
                + i + ')\">Add</button></div></div>'
        }
         
                $(document).ready(function () {
                    $("#app").append(tblhead + tblbody);
                });
        
    });
};

// Add movie to collection
function addFunction(j) {
   $(document).ready(function () {
       var ftitle = $('#a' + j).text();
       $.get("https://bcdemo2021.herokuapp.com/addtitle?title=" + ftitle + "&collection=" + window.localStorage.getItem('selectedCollection'),
            function(data, status){
               console.log("Add title data: " + data + "\nStatus: " + status);
            });
    });
};

// Remove movie from collection
function removeFunction(j) { 
    //Code here
};

// Gets collections from backend and generates dropdown-menu items
function getCollections() {
    localstoragetest()
    $.get("https://bcdemo2021.herokuapp.com/getcollections",
            function(data, status){
                console.log("Collection data: " + data + "\nStatus: " + status);
                window.localStorage.setItem('collection', data);
                var ddmhtml = "";
                for (var n = 0; n < data.length; n++) {
                     ddmhtml = ddmhtml + '<button id="ddm' + n + '" type="button" class="btn btn-outline-success dropdown-item"' +
                        'onclick="selectCollection(' + n + ')">' +
                        data[n] + '</button>'           
                }                    
                      $("#ddmenu").append(ddmhtml);
                              
            });
}
// Tests is localstorage supported by the browser
function localstoragetest() {
    if (typeof (Storage) !== "undefined") {
        console.log("URL: " + window.location.href +" localStorage available, all good to go!");
    } else {
        alert("This app does not support your browser. You need browser with localStorage support!");
    }
}

//Selects movie collection for adding remove etc. movies
function selectCollection(k) {
    tmpcol = window.localStorage.getItem('collection').split(",");
    console.log("From storage: " + tmpcol[k]);
    window.localStorage.setItem('selectedCollection', tmpcol[k]);
    $("#selectedCollection").text(tmpcol[k]);
    searchCollection();
}

//Show table of movies from selected collection
function searchCollection() {
    //Tests is there any selection
    var st = window.localStorage.getItem('selectedCollection');
    if (st === "" || st === null) {
        return false;
    }
    
    // Generates, gets collection movie datas from backend and injects HTML-table to #app in index.html
    $("#app").empty();
    parameter = "?collection=" + st;
    $.get("https://bcdemo2021.herokuapp.com/searchCollection" + parameter, function (cmvdata, status) {
//        console.log("collection data: " + cmvdata);
        cmvdata = sqlalchemyJSONtoJSON(cmvdata);

        tblhead = `<div class="row">
                            <div class="col-sm-3"><h2>Poster</h2></div>
                            <div class="col-sm-2"><h2>Title</h2></div>
                            <div class="col-sm-3"><h2>Overview</h2></div>
                            <div class="col-sm-3"><h2>Back</h2></div>
                            <div class="col-sm-1"> </div>
                        </div>`
        tblbody = "";
       for (i = 0; i < cmvdata.movies.length; i++) {
           tblbody = tblbody + '<div class="row">'
                + '<div class="col-sm-3"><img class="img-fluid" src=' +'\"' + cmvdata.movies[i].posterurl +'.jpg' + '"></img></div>'
                + '<div class="col-sm-2"><div id="a'+i+'">' + cmvdata.movies[i].title + '</div><br><br>'
                + 'Released: ' + cmvdata.movies[i].releasedate + '<br><br>'
                + 'Language: ' + cmvdata.movies[i].language + '</div>'
                + '<div class="col-sm-3">' + cmvdata.movies[i].overview + '</div>'
                + '<div class="col-sm-3"><img class="img-fluid" src=' +'\"' + cmvdata.movies[i].backurl +'.jpg' + '"></img></div>'
                + '<div class="col-sm-1"><button type=\"button\" class=\"btn-lg btn-warning\" onclick=\"removeFunction('
                + i + ')\">Remove</button></div></div>'
        }
        console.log(tblbody);
                $(document).ready(function () {
                    $("#app").append(tblhead + tblbody);
                });
        
    });
};

function sqlalchemyJSONtoJSON(text) {
    var pre = "{\"movies\":[";
//    var text = "{'_sa_instance_state': <sqlalchemy.orm.state.InstanceState object at 0x7f989952d100>, 'collection': 'uudet', 'backurl': 'https://res.cloudinary.com/http-ppl-1fi/image/upload/v1612373660/lo70DEjfUOweEosuPPIlcIOhhBm.jpg', 'language': 'en', 'overview': \"All grown up in post-apocalyptic 2018, John Connor must lead the resistance of humans against the increasingly dominating militaristic robots. But when Marcus Wright appears, his existence confuses the mission as Connor tries to determine whether Wright has come from the future or the past -- and whether he's friend or foe.\", 'title': 'Terminator Salvation', 'id': 15, 'posterurl': 'https://res.cloudinary.com/http-ppl-1fi/image/upload/v1612373660/gw6JhlekZgtKUFlDTezq3j5JEPK.jpg', 'releasedate': datetime.date(2009, 5, 20)}{'_sa_instance_state': <sqlalchemy.orm.state.InstanceState object at 0x7f989952d1f0>, 'collection': 'uudet', 'backurl': 'https://res.cloudinary.com/http-ppl-1fi/image/upload/v1612373660/wFUkS5cnMf3I8ysIPWzIXpTsuR7.jpg', 'language': 'en', 'overview': 'Iconoclastic, take-no-prisoners cop John McClane, finds himself for the first time on foreign soil after traveling to Moscow to help his wayward son Jack - unaware that Jack is really a highly-trained CIA operative out to stop a nuclear weapons heist. With the Russian underworld in pursuit, and battling a countdown to war, the two McClanes discover that their opposing methods make them unstoppable heroes.', 'title': 'A Good Day to Die Hard', 'id': 18, 'posterurl': 'https://res.cloudinary.com/http-ppl-1fi/image/upload/v1612373660/evxtv4e8Amm436Y5rW16RkGu8pX.jpg', 'releasedate': datetime.date(2013, 2, 6)}";
    var end = "]}";

    text = text.replaceAll("<", "'");
    text = text.replaceAll(">", "'");
    text = text.replaceAll("}{", "},{");
    var n = 1;
    // Fix datetime.date(2020, 11, 11) to '2020-11-11'
    while (n < text.length) {
        n = text.indexOf("datetime.date(");
        text = text.replace("datetime.date(", "'");
    
        if (n == -1) { break; }
        while (text.charAt(n) != ')') {
            n = n + 1;
            if (text.charAt(n) == ',') { text = replaceAt(text, n, '-'); }
            if (text.charAt(n) == ' ') { text = replaceAt(text, n, ''); }
        }
        while (text.charAt(n) != ')') { n = n + 1; }
        text = replaceAt(text, n, '\'');
        n = n + 1;
    }

    // Fix 'id': 18,  to 'id': '18', 
    text = text.replaceAll("'id': ", "'id':'");
    text = text.replaceAll(", 'posterurl", "', 'posterurl");
     
    text = text.replaceAll("', '", "','");
    text = text.replaceAll("': ", "':");

    text = pre + text + end;
    text = text.replaceAll("', '", "\",\"");
    text = text.replaceAll("': ", "\":");
    text = text.replaceAll("':'", "\":\"");
    text = text.replaceAll("','", "\",\"");
    text = text.replaceAll("','", "\",\"");
    text = text.replaceAll("{'", "{\"");
    text = text.replaceAll("'}", "\"}");
    text = text.replaceAll(", '", ",\"");
    text = text.replaceAll("':", "\":");
    text = text.replaceAll("\u005C", "");
    text = text.replaceAll("[\"", "[");
    text = text.replaceAll("\"]", "]");

    obj = JSON.parse(text);

    return obj;
};
    
function replaceAt(string, index, replace) {
            return string.substring(0, index) + replace + string.substring(index + 1);
}