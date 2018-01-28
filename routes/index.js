const express = require('express');
const router = express.Router();

//* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); // require Postgres module

// Setup connection
var username = 'postgres'; // sandbox username
var password = 'postgresrut'; // read only privileges on our table
var host = 'localhost';
var database = 'cambridge'; // database name
var databaseConnection = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection


// Set up your database query to display GeoJSON
var coffee_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, name)) As properties FROM cambridge_coffee_shops As lg) As f) As fc";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'GIS WebApp' });
});

/* GET Postgres JSON data */
router.get('/data', function (req, res) {
  var client = new pg.Client(databaseConnection);
  client.connect();
  var query = client.query(coffee_query);
  query.on("row", function (row, result) {
      result.addRow(row);
  });
  query.on("end", function (result) {
      res.send(result.rows[0].row_to_json);
      res.end();
  });
});

/* GET the map page */
router.get('/map', function(req, res) {
  var client = new pg.Client(databaseConnection); // Setup our Postgres Client
  client.connect(); // connect to the client
  var query = client.query(coffee_query); // Run our Query
  query.on("row", function (row, result) {
      result.addRow(row);
  });
  // Pass the result to the map page
  query.on("end", function (result) {
      var data = result.rows[0].row_to_json; // Save the JSON as variable data
      res.render('map', {
          title: "GIS App", // Give a title to our page
          jsonData: data // Pass data to the View
      });
  });
});

router.post('/getData', function(req, res) {
    var dataFromClient = req.body;
    var clientQuery = '';
    res.send({
        clientData: 'Neki super odgovor u stringu hehe',
        bodyy: dataFromClient
    });
    /*var client = new pg.Client(databaseConnection);
    client.connect();
    var query = client.query();
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json;
        res.render('map', {
            clientData: data
        });
    });*/
});

module.exports = router;
