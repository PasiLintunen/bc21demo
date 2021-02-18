function searchMovies() {
    var st = $("#searchterm").val();
    if (st === "" || st === null) {
        return false;
    }
//    console.log(st);

// Generates, gets movie datas from backend and injects HTML-table to #app in index.html
    $("#app").empty();
    parameter = "?title=" + st;
    $.get("https://bc21demo.herokuapp.com/search" + parameter, function (mvdata, status) {
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
         
     //   tblfoot = `</tbody></table>`
                $(document).ready(function () {
                    $("#app").append(tblhead + tblbody);
                });
        
    });
};

// Add movie to collection
function addFunction(j) {
   $(document).ready(function () {
       var ftitle = $('#a' + j).text();
       $.get("https://bc21demo.herokuapp.com/addtitle?title=" + ftitle + "&collection=" + window.localStorage.getItem('selectedCollection'),
            function(data, status){
               console.log("Add title data: " + data + "\nStatus: " + status);
            });
    });
};

// Gets collections from backend and generates dropdown-menu items
function getCollections() {
    localstoragetest()
    $.get("https://bc21demo.herokuapp.com/getcollections",
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
        console.log("localStorage available, all good to go!");
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
}

//Show table of movies in selected collection
function searchCollection() {
    //Tests is there any selection
    var st = window.localStorage.getItem('selectedCollection');
    if (st === "" || st === null) {
        return false;
    }
    
    // Generates, gets collection movie datas from backend and injects HTML-table to #app in index.html
    $("#app").empty();
    parameter = "?collection=" + st;
    $.get("https://bc21demo.herokuapp.com/searchCollection" + parameter, function (cmvdata, status) {
        console.log("collec: " + cmvdata);
        tblhead = `<table id="tbl" class="table table-hover">
                    <thead id="tblh">
                        <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Released</th>
                        <th scope="col">Language</th>
                        <th scope="col">Overview</th>
                        </tr>
                    </thead>
                  <tbody>`
        tblbody = "";   
        for (var i = 0; i < cmvdata.length; i++) {
            tblbody = tblbody + '<tr>'
                + '<td id="a'+i+'">' + cmvdata.collection[i].title + '</td>'
                + '<td>' + cmvdata.collection[i].release_date + '</td>'
                + '<td>' + cmvdata.collection[i].original_language + '</td>'
                + '<td>' + cmvdata.collection[i].overview + '</td>'
                + '<td><button type=\"button\" class=\"btn-lg btn-warning\" onclick=\"addFunction('
                + i + ')\">Add</button></td></tr>'
        }
        console.log(tblbody);
        tblfoot = `</tbody></table>`
                $(document).ready(function () {
                    $("#app").append(tblhead + tblbody + tblfoot);
                });
        
    });
};

