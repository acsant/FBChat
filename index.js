var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var app = express()

  app.set('port', (process.env.PORT || 5000))

  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())
  
  var token = "CAACZClHELlZCIBAJZB9gT66Ca9TP6h4BuOWdp4frFeI4sQMJIqqXMNoeMLli2GNXO5GQGKRcFzZB3G9132hHdJgpKLWgX8JjR9O2kcauuHaXd5ncJBKhEtLEnsBOSxl2usYoIyFiRgazKEx3hXEQbfvN7bcSkAea2jycN9RNuX3lLSU96pXqO2X8ZAT2g4mAZD"
  var apikey = "43073ca8eccde3bb5744d4df7cc9dec3"
  var openapi = require('uwapi')(apikey)
  var matchGT = (^|\s)(greater)(\s|)
  var matchLT = (^|\s)(less)(\s|)
  var matchEQ = (^|\s)(equal)(\s|)

  //Index Route
  app.get('/', function (req, res) {
    res.send('Hello, I am Akash\'s chat bot!')
  })

  // Facebook verficication
  app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
      res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
  })

  // Spin the server up
  app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
  })

  //API Endpoint
  app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
      event = req.body.entry[0].messaging[i]
      sender = event.sender.id
      if (event.message && event.message.text) {
        text = event.message.text
        var match = text.match(/\d+/)
        var GT = text.match(matchGT)
        var LT = text.match(matchLT)
        var EQ = text.match(matchEQ)
        if (match) {
          sendTextMessage(sender, "AkashBot suggests: ")
          if (EQ) {
            findFoodWithCaloriesLessThan(match, sender, EQ)
          } else if (GT) {
            findFoodWithCaloriesLessThan(match, sender, GT)
          } else {
            findFoodWithCaloriesLessThan(match, sender, LT)
          }
          //sendTextMessage(sender, "Text received, echo: " + match)
        }
      }
    }
    res.sendStatus(200)
  })

  // calories endpiint
  function findFoodWithCaloriesLessThan (calories, sender, oper) {
    var param = ''
    if (oper == 'equal') {
      param = 'calories.eq'
    } else if (oper == 'greater') {
      param = 'calories.gt'
    } else {
      param = 'calories.lt'
    }
    openapi.foodservicesSearch({}, {param: calories}).then(function(foods) {
      var len = foods.length
      if (len > 10)
        len = 10
      for (var i = 0; i < len; i++) {
        var foodInfo = "\nFood: " + JSON.stringify(foods[i].product_name)
                      + "\nCalories: " + JSON.stringify(foods[i].calories)
                      + "\nType: " + JSON.stringify(foods[i].diet_type);
        console.log('Found results for: ', foodInfo)
        sendTextMessage(sender, foodInfo)
      }
    }, function (err) {
      console.log('Error: ', err)
    })
  }

  //Echo message function
  function sendTextMessage (sender, text) {
    messageData = {
      text:text
    }
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: messageData,
      }, function (error, response, body) {
        if (error) {
          console.log('Error sending messages: ', error)
        } else if (response.body.error) {
          console.log('Error', response.body.error)
        }
      }
    })
  }

  function sendGenericMessage(sender) {
    messageData = {
      "attachment": {
        "type":"template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "First Card",
            "subtitle": "Element #1 of an hscrol",
            "image_url":"http://www.macmillandictionaryblog.com/wp-content/uploads/2011/07/Small-Talk-image.jpg",
            "buttons": [{
              "type": "web_url",
              "url": "https://www.messenger.com",
              "title": "web url"
            }],
          }]
        }
      }
    }
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: messageData,
      }, function (error, response, body) {
        if (error) {
          console.log('Error sending messages: ', error)
        } else if (response.body.error) {
          console.log('Error: ', response.body.error)
        }
      }
    })
  }
