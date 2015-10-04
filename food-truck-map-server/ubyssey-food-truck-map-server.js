/* MODULES */

var http = require('http');
var express = require('express');
var request = require('request');
var path = require('path');

/* CONSTANTS */

var ALT_PORT = 4500;

/* GLOBAL VARIABLES */

var lastCheckedMinutes;
var foodTrucks = [
	{
		name: "Hungry Nomad",
		url: "http://www.food.ubc.ca/place/hungry-nomad/",
		image: "/images/logo_hungrynomad.jpg",
		blurb: "UBC’s original food truck serves hearty lunch fare like mac and cheese, poutine, pulled pork and short ribs."
	},
	{
		name: "It's About Thai",
		url: "http://www.food.ubc.ca/place/its-about-thai/",
		image: "/images/logo_thai.jpg",
		blurb: "The only place at UBC to get authentic Pad Thai! Our food truck menu also has sweet mango salad, fresh curries and chicken coconut soup. Vegetarian options available."
	},
	{
		name: "Roaming Bowl",
		url: "http://www.food.ubc.ca/place/roaming-bowl/",
		image: "/images/logo_roaming.jpg",
		blurb: "Want something spicy? Roam our way! We have Asian-inspired chicken, beef and vegetarian noodle and rice bowls made-to-order. Joseph Thomas, head chef of food trucks, incorporates local, seasonal ingredients into the menu to keep things healthy and fresh."
	},
	{
		name: "School of Fish",
		url: "http://www.food.ubc.ca/place/school-of-fish/",
		image: "/images/logo_sof.jpg",
		blurb: "Find our food truck and dive right in! We have 100% Ocean Wise™ certified seafood entrées like fish tacos, beer battered fish and chips, and UBC’eviche salad."
	},
	{
		name: "The Dog House",
		url: "http://www.food.ubc.ca/place/the-dog-house/",
		image: "/images/logo_doghouse.jpg",
		blurb: "We’ve taken the classic hot dog to a new level by adding crispy bacon, grilled pineapple, Asian slaw, cream cheese, and other non-traditional toppings that you won’t find on any other dogs. In the mood for DIY? Order a naked dog and create your own culinary experience with our awesome array of condiments."
	}
];

/* INITIALIZATION */

updateLatLongInfo();

var app = express();
app.use(function(req, res, next) {
	// Necessary to accept AJAX requests
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

var server = http.createServer(app).listen(process.env.PORT || process.argv[2] || ALT_PORT);

/* ROUTING */

app.get('/', function(req, res) {
	if(minutesSince1970() - lastCheckedMinutes > 15) {
		updateLatLongInfo();
	}
	res.writeHead(200, {"Content-type": "text/json"});
	res.write(JSON.stringify(foodTrucks, null, ' '));
	res.end();
});

app.get('/images/:image', function(req, res) {
	res.sendFile(path.join(__dirname + '/images/' + req.params.image));
});

/* HELPERS */

function updateLatLongInfo() {
	for(index in foodTrucks) {
		// Minutes since Jan. 1, 1970
		lastCheckedMinute = minutesSince1970();
		request(foodTrucks[index].url, function(err, response, body) {
			var resIndex = getIndexFromURL('http://' + response.client._host + response.client._httpMessage.path);
			if(response.statusCode === 200 && !err) {
				var lat = Number(body.match(/data-lat=\"(.*?)\"/)[1]);
				var lng = Number(body.match(/data-lng=\"(.*?)\"/)[1]);
				
				foodTrucks[resIndex].lat = lat;
				foodTrucks[resIndex].lng = lng;
				console.log('Updated ' + foodTrucks[resIndex].name + '\t' + 'Lat: ' + lat +'\tLng: ' + lng);
			}
			else {
				console.log('Failed to retrieve data for ' + foodTrucks[resIndex].name);
			}
		});
	}
}

function getIndexFromURL(url) {
	for(index in foodTrucks) {
		if(foodTrucks[index].url == url) {
			return index;
		}
	}
	return -1;
}

function minutesSince1970() {
	return Date.now() / 1000 / 60;
}