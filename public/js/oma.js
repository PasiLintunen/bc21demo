function searchMovies() {
    var st = $("#searchterm").val();
    if (st === "" || st === null) {
        return false;
    }
    console.log(st);

// Generates, gets movie datas from backend and injects HTML-table to #app in index.html
    $("#app").empty();
    parameter = "?title=" + st;
    $.get("http://127.0.0.1:3000/search" + parameter, function (mvdata, status) {
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
        console.log(mvdata)
        for (var i = 0; i < mvdata.results.length; i++) {
            tblbody = tblbody + '<tr>'
                + '<td id="a'+i+'">' + mvdata.results[i].original_title + '</td>'
                + '<td>' + mvdata.results[i].release_date + '</td>'
                + '<td>' + mvdata.results[i].original_language + '</td>'
                + '<td>' + mvdata.results[i].overview + '</td>'
                + '<td><button type=\"button\" class=\"btn-lg btn-warning\" onclick=\"addFunction('
                + i + ')\">Add</button></td></tr>'
        }
         
        tblfoot = `</tbody></table>`
                $(document).ready(function () {
                    $("#app").append(tblhead + tblbody + tblfoot);
                });
        
    });
};

// Add movie to collection
function addFunction(j) {
   $(document).ready(function () {
       var ftitle = $('#a' + j).text();
     //  alert(ttt);
       $.get("http://127.0.0.1:3000/addtitle?title=" +ftitle + "&collection=" + window.localStorage.getItem('selectedCollection'),
            function(data, status){
               console.log("Add title data: " + data + "\nStatus: " + status);
            });
    });
};

// Gets collections from backend and generates dropdown-menu items
function getCollections() {
    localstoragetest()
    $.get("http://127.0.0.1:3000/getcollections",
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
    console.log("searchCol: null");
    }
    console.log("searchCol: ok");
    // Generates, gets collection movie datas from backend and injects HTML-table to #app in index.html
    $("#app").empty();
    parameter = "?collection=" + st;
    $.get("http://127.0.0.1:3000/searchCollection" + parameter, function (mvdata, status) {
        console.log(mvdata);
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
        for (var i = 0; i < mvdata.length; i++) {
            console.log(mvdata.length);
            tblbody = tblbody + '<tr>'
                + '<td id="a'+i+'">' + mvdata.Collection[1].title + '</td>'
                + '<td>' + mvdata.results[i].release_date + '</td>'
                + '<td>' + mvdata.results[i].original_language + '</td>'
                + '<td>' + mvdata.results[i].overview + '</td>'
                + '<td><button type=\"button\" class=\"btn-lg btn-warning\" onclick=\"addFunction('
                + i + ')\">Add</button></td></tr>'
        }
         
        tblfoot = `</tbody></table>`
                $(document).ready(function () {
                    $("#app").append(tblhead + tblbody + tblfoot);
                });
        
    });
};

