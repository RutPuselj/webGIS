const express = require('express');
const router = express.Router();

//* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); 

// Database setup connection
var username = 'postgres'; // sandbox username
var password = 'postgres'; // read only privileges on our table
var host = 'localhost';
var database = 'test_db'; // database name
var databaseConnection = "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection


// Set up your database query to display GeoJSON
var coffee_query1 = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, name)) As properties FROM cambridge_neighborhoods As lg) As f) As fc";
var city_source = 'Zagreb';
var city_dest = 'Rijeka';

// osm_id od line
var get_line_id_source = 'SELECT ml.id FROM my_line ml, my_point mp where mp.name = \'' + city_source + '\' ORDER BY ST_Distance(mp.way, ST_StartPoint(ml.way)) ASC LIMIT 1';
var get_line_id_dest = 'SELECT ml.id FROM my_line ml, my_point mp where mp.name = \'' + city_dest + '\' ORDER BY ST_Distance(mp.way, ST_StartPoint(ml.way)) ASC LIMIT 1';

// predajem osm_id i zelim dobit source i target integer
var get_line_source = "select source from my_line where id = ";
var get_line_dest = "select target from my_line where id = ";

var bjelovar_query = "SELECT row_to_json(bj) from (SELECT id, seq, node, edge, cost as cost, agg_cost, st_x(st_startpoint(way)), st_y(st_startpoint(way)), st_x(st_endpoint(way)), st_y(st_endpoint(way)) FROM pgr_dijkstra('SELECT id, source, target, st_length(way, true) as cost FROM bjelovar_line',10,266) as pt JOIN bjelovar_line rd ON pt.edge = rd.id) bj";
var city_names_query = 'SELECT...';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'GIS WebApp'
    });
});

/* GET Postgres JSON data */
router.get('/data', function (req, res) {
    var result_array = {
        line_id_source: '',
        source: '',
        line_id_dest: '',
        dest: ''
    };

    var client = new pg.Client(databaseConnection);
    client.connect();

    var query1 = client.query(get_line_id_source);
    query1.on("end", function (result1) {
        var query2 = client.query(get_line_source + new Number(result1.rows[0].id));
        query2.on("end", function (result2) {
            result_array.line_id_source = result1;
            result_array.source = result2;
        });
    });

    var query3 = client.query(get_line_id_dest);
    query3.on("end", function (result3) {
        var query4 = client.query(get_line_dest + new Number(result3.rows[0].id));
        query4.on("end", function (result4) {
            result_array.line_id_dest = result3;
            result_array.dest = result4;
            res.send(result_array);
            res.end();
        });
    });

});
/*var query = client.query(coffee_query);
query.on("row", function (row, result) {
    result.addRow(row);
});
query.on("end", function (result) {
    res.send(result.rows[0].row_to_json);
    res.end();
});*/

/* GET the map page */
router.get('/map', function (req, res) {

    var client = new pg.Client(databaseConnection); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(city_names_query); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json; // Save the JSON as variable data
        res.render('map', {
            title: "GIS App", // Give a title to our page
            jsonDataCityNames: result // Pass data to the View
        });
    });
});

router.post('/getData', function (req, res) {
    var dataFromClient = req.body;
    var clientQuery = '';
    var city_source = dataFromClient.data.source;
    var city_dest = dataFromClient.data.destination;
    var algorithm = dataFromClient.data.algorithm;
    var optional = dataFromClient.data.optional;

    var client_query = 'SELECT....';

    var client = new pg.Client(databaseConnection);
    client.connect();
    var query = client.query(client_query);

    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json;
        res.render('map', {
            jsonData: data
        });
    });
});

module.exports = router;