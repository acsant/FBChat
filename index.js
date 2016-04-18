var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var app = express()

  app.set('port', (process.env.PORT || 5000))

  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())

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
        if (match) {
          sendTextMessage(sender, "Text received, echo: " + match)
      
        }
      }
    }
    res.sendStatus(200)
  })

  var token = "CAACZClHELlZCIBAJZB9gT66Ca9TP6h4BuOWdp4frFeI4sQMJIqqXMNoeMLli2GNXO5GQGKRcFzZB3G9132hHdJgpKLWgX8JjR9O2kcauuHaXd5ncJBKhEtLEnsBOSxl2usYoIyFiRgazKEx3hXEQbfvN7bcSkAea2jycN9RNuX3lLSU96pXqO2X8ZAT2g4mAZD"

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
