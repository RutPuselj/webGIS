const express = require('express');
const router = express.Router();

//* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg");

// Database setup connection
var username = 'postgres'; // sandbox username
var password = 'postgres'; // read only privileges on our table
var host = 'localhost';
var database = 'hr_2po_4pgr'; // database name
var databaseConnection = "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

var names = 'select row_to_json(points) from (select id, name, st_x(geom),st_y(geom) from mlin_points) as points';
var mlin_all_roads = 'select row_to_json(hrv) from (SELECT st_x(st_startpoint(rd.geom)) as src_x, st_y(st_startpoint(rd.geom)) as src_y, st_x(st_endpoint(rd.geom)) as tg_x, st_y(st_endpoint(rd.geom)) as tg_y from mlin_lines as rd) hrv';


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

    var client = new pg.Client(databaseConnection);
    client.connect();
    var query = client.query(names);
    var query2 = client.query(mlin_all_roads);
    query.on("row", function (row, result) {
        result.addRow(row);
    });

    query2.on("row", function(row2, result2) {
        result2.addRow(row2);
    });

    query.on("end", function (result) {
        query2.on("end", function (result2) {
            res.render('map', {
                title: 'GIS App',
                jsonData: result,
                allRoads: result2
            });
        });
    });

    /*
        var data = result.rows[0].row_to_json; // Save the JSON as variable data
    */
});

router.post('/getData', function (req, res) {
    var dataFromClient = req.body;

    var source_id = dataFromClient.data.idSource;
    var destination_id = dataFromClient.data.idDestination;
    var algorithm = dataFromClient.data.path;

    var mlin_query_shortest = 'select row_to_json(hrv) from (SELECT pt.seq, pt.node, pt.edge, pt.cost, pt.agg_cost, st_x(st_startpoint(rd.geom)) as src_x, st_y(st_startpoint(rd.geom)) as src_y, st_x(st_endpoint(rd.geom)) as tg_x, st_y(st_endpoint(rd.geom)) as tg_y FROM pgr_dijkstra(\'SELECT id, source, target, km as cost FROM mlin_lines\', ' + source_id + ' , ' + destination_id + ') as pt JOIN mlin_lines rd ON pt.edge = rd.id) hrv';
    var mlin_query_fastest = 'select row_to_json(hrv) from (SELECT pt.seq, pt.node, pt.edge, pt.cost, pt.agg_cost, st_x(st_startpoint(rd.geom)) as src_x, st_y(st_startpoint(rd.geom)) as src_y, st_x(st_endpoint(rd.geom)) as tg_x, st_y(st_endpoint(rd.geom)) as tg_y FROM pgr_dijkstra(\'SELECT id, source, target, km/kmh as cost FROM mlin_lines\', ' + source_id + ' , ' + destination_id + ') as pt JOIN mlin_lines rd ON pt.edge = rd.id) hrv';

    /*var source_lat = dataFromClient.data.source_lat;
    var source_lng = dataFromClient.data.source_lng;
    var dest_lat = dataFromClient.data.dest_lat;
    var dest_lng = dataFromClient.data.dest_lng;*/

    //var croatia_roads = 'select row_to_json(hrv) from (SELECT pt.seq, pt.node, pt.edge, pt.cost, pt.agg_cost, rd.km, rd.kmh, rd.km/rd.kmh as vrijeme, rd.x1 as x1, rd.x2 as x2, rd.y1 as y1, rd.y2 as y2, rd.geom_way as geom FROM pgr_dijkstra(\'SELECT id, source, target, cost FROM croatia_roads\',(SELECT source FROM croatia_roads ORDER BY ST_Distance(ST_StartPoint(geom_way),ST_SetSRID(ST_MakePoint(' + source_lng + ',' + source_lat + '), 4326),true) ASC LIMIT 1),(SELECT source FROM croatia_roads ORDER BY ST_Distance(ST_StartPoint(geom_way),ST_SetSRID(ST_MakePoint(' + dest_lng + ',' + dest_lat + '), 4326),true) ASC LIMIT 1)) as pt JOIN croatia_roads rd ON pt.edge = rd.id) hrv';
    if (algorithm === 'shortestPath') {
        var client = new pg.Client(databaseConnection);
        client.connect();
        var query = client.query(mlin_query_shortest);

        query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            //var data = result.rows[0].row_to_json;
            res.status(200).send(result);
        });
    }
    if (algorithm === 'fastestPath') {
        var client = new pg.Client(databaseConnection);
        client.connect();
        var query = client.query(mlin_query_fastest);

        query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            //var data = result.rows[0].row_to_json;
            res.status(200).send(result);
        });
    }

});

module.exports = router;