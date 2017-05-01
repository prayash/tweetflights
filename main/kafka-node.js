'use strict';

// ********************************************************************************
// A basic node.js consumer for Kafka queue that uses web sockets to emit real time
// data into the client via a TCP connection. Hurrah!

const KAFKA_PORT = '127.0.0.1:2181';
const SERVER_PORT = 1337;

const chalk = require('chalk');
const utf8 = require('utf8');
const stripAnsi = require('strip-ansi');
const Kafka = require('kafka-node');
const Consumer = Kafka.Consumer;
const Offset = Kafka.Offset;
const Client = Kafka.Client;

let topic = 'twitterstream';
let kClient = new Client(KAFKA_PORT);
let topics = [{ topic: 'twitterstream', partition: 0, offset: 20 }];
let offset = new Offset(kClient);
let consumer = new Consumer(kClient, topics, {
  fromOffset: false,
  autoCommit: false,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024
});

// ********************************************************************************
// * Server + Socket emissions with client

let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);

server.listen(SERVER_PORT, () => {
  console.log(chalk.green('Node-Kafka stream online! \nListening on port: ' + SERVER_PORT));
});

let bunk = { topic: 'twitterstream',
  value: '{"text": "@alexiscorbiere Mr Je viens d entendre Mr Bourdin dire que les INSOUMIS VONT VOTER LE PEN CEST UNE HONTE JE NE VOTERAI JAMAIS HITLER =LE PEN", "language": "fr", "sentiment": "Pos", "fromLocation": "Challans, France", "fromLocationLat": "46.847943", "fromLocationLong": "-1.8773786", "toLocation": "Paris, France", "toLocationLat": "48.8566101", "toLocationLong": "2.3514992" }',
  offset: 62234,
  partition: 0,
  highWaterOffset: 62235,
  key: -1
};

let data = {
  text: '@TomandSteveHost you got to hear this. https://t.co/HnHtHxYkyY',
  language: 'en',
  sentiment: 'Pos',
  fromLocation: 'Denver, CO',
  fromLocationLat: '39.7392',
  fromLocationLong: '-104.9903',
  toLocation: 'Coeur d\'Alene, ID',
  toLocationLat: '47.6776832',
  toLocationLong: '-116.7804663'
};

io.on('connection', (socket) => {
  console.log(chalk.green("Client connected!"));
  
  socket.emit('init');
  socket.on('disconnect', () => {
    console.log('Client disconnected!');
  });

  consumer.on('message', (message) => {
    console.log(chalk.blue('----------------'));
    // console.log(message);

    try {
      data = JSON.parse(message.value);
    } catch (error) {
      console.log('Skipped due to parse error.');
      return;
    }

    console.log(data);
  });

  consumer.on('error', (err) => {
    console.log('error', err);
  });

  socket.on('ack', () => {
    if (data.fromLocation !== data.toLocation) {
      socket.emit('tweet', data);
    }
  });
});

// ********************************************************************************
// Kafka emissions



// If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
// consumer.on('offsetOutOfRange', (topic) => {
//   topic.maxNum = 2;
//   offset.fetch([topic], (err, offsets) => {
//     if (err) {
//       return console.error(err);
//     }
//     let min = Math.min(offsets[topic.topic][topic.partition]);
//     consumer.setOffset(topic.topic, topic.partition, min);
//   });
// });
