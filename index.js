'use strict';

// Imports dependencies and set up http server
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

//Allow us to process the data
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// routes

app.get('/', function(req, res) {
	//res.send("EZPZ");
	res.sendFile('/index.html', {root: __dirname });
});

let token = "EAAbIskuk8dIBAJYXg4nlKFpnY28a9vxcTbuzPxFn2jk7QCCTTAa7UV29o9MybSl1rQWSs4jzpZAZAPZCdZCYYT1cTZC4DYySZCZAi8OzSRj4aN8EaDh6ZBk30YFbBCrg9bqfWaic1RH431UJCBGhNOtUgZBxGZBnm3yX8ablp7FvyChiDGvmTpVhwNkMMIzlJQ7hMZD";
// facebook
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === "edpchallenge") {
		res.send(req.query['hub.challenge']);
	}
	res.send("wrong token");
});

app.post('/webhook/', function(req, res){
	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i];
		let sender = event.sender.id;
		if (event.message && event.message.text) {
			let text = event.message.text;
			decideMessage(sender, text);
			sendText(sender, "Escreveu isto: " + text.substring(0,100));
		}

		if(event.postback) {
			let text = JSON.stringify(event.postback);
			decideMessage(sender, text);
			return;
		}
	}
	res.sendStatus(200);
});

function decideMessage(sender, text1) {
	let text = text1.toLowerCase();
	if ( text.includes("summer")) {

	} else if (text.includes("ajuda")) {
		sendGenericMessage(sender);
	} else{
		sendText(sender, "QUEM E MAIS FIXE?");
		sendButtonMessage(sender, "SERA QUE ISTO E FIXE?");
	}
}
function sendText(sender, text) {
	let messageData = {text: text};
	sendRequest(sender, messageData);
}
function sendButtonMessage(sender, text){
	let messageData = {
	    "attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"button",
	        "text": text,
	        "buttons":[
	          {
	            "type":"postback",
	            "title":"EPAH E FIXE",
	            "payload":"epah e fixe"
	          },
	          {
	            "type":"postback",
	            "title":"NAO E FIXE",
	            "payload":"NAO e fixe"
	          }
	        ]
	      }
	    }
 	};

 	sendRequest(sender, messageData);
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"generic",
	        "elements":[
	           {
	            "title":"Bem-vindo!",
	            "image_url":"https://www.dinheirovivo.pt/wp-content/uploads/2015/10/ng3314379.jpg",
	            "subtitle":"edp e muito fixe",
	            "buttons":[
	              {
	                "type":"web_url",
	                "url":"https://www.edp.pt/particulares/apoio-cliente/",
	                "title":"Apoio ao cliente!"
	              }
	            ]
	          }
	        ]
	      }
	    }
	};
	sendRequest(sender, messageData);
}

function sendRequest(sender, messageData) {
	//let messageData = {text:text};
	request({
		url: "https://graph.facebook.com/v3.0/me/messages",
		qs : {access_token: token},
		method : "POST",
		json: {
			recipient: {id: sender},
			message: messageData
		}
	}, function(error, response, body) {
		if(error) {
			console.log("sending error");
		} else if (response.body.error) {
			console.log("response body error");
		}
	});
}

app.listen(app.get('port'), function() {
	console.log("running: port");
});
