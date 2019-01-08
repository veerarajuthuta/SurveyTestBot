
var express = require('express')

var http = require('http');
var bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://localhost:27017/serveyBot';
var app = express()
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
var request = require('request');

MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
});
var restify = require('restify');
var builder = require('botbuilder');


var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978,
    function () {
        console.log('%s listening to %s', server.name, server.url);
    });

// var connector = new builder.ConsoleConnector().listen();
 var connector = new builder.ChatConnector({
     appId: 'eccc3104-d137-4c6f-8060-8408913222df',
     appPassword: 'ckngcVUQTK2}{%-xqXF1990'
 });
 server.post('/api/messages', connector.listen());
var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("hello there.." + session.message.text);
    session.beginDialog('sessionAppoint');
}).set('storage', inMemoryStorage);

var insertDocument = function(db, data, callback) {
    var collection = db.collection('botusers');
    collection.insertOne(data, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            assert.equal(1, result.ops.length);
        }
    )

}

bot.dialog('sessionAppoint', [
    function (session) {
        builder.Prompts.text(session, "What is your name");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "What is your age");
    },
    function (session, results) {
        session.userData.age = results.response;
        builder.Prompts.choice(session, "What is your gender", ["Male", "FeMale"]);
    },
    function (session, results) {
        session.userData.gender = results.response.entity;
        builder.Prompts.time(session, "Please provide a reservation date and time (e.g.: June 6th at 5pm)");
    },
    function (session, results) {
        session.userData.datetime = builder.EntityRecognizer.resolveTime([results.response]);
        var data = session.userData;
        session.send('thanks for provide a date and time' + session.userData.datetime)
        session.send('Your Details: \nName:' + data.name + '\nAge:' + data.age + '\nGender:' + data.gender + '\nDateTime:' + data.datetime);
        var msg = 'your reservation is done';
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            insertDocument(db,data,function(){
                db.close();
            });

        });

        session.endConversation(msg);

}

]);
