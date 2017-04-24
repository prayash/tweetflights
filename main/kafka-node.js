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

// let topic = 'twitterstream';
// let kClient = new Client(KAFKA_PORT);
// let topics = [{ topic: 'twitterstream', partition: 0, offset: 0 }];
// let offset = new Offset(kClient);
// let consumer = new Consumer(kClient, topics, {
//   fromOffset: false,
//   autoCommit: false,
//   fetchMaxWaitMs: 1000,
//   fetchMaxBytes: 1024 * 1024
// });

// ********************************************************************************
// * Server + Socket emissions with client

let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);

server.listen(SERVER_PORT, () => {
  console.log(chalk.green('Node-Kafka stream online! \nListening on port: ' + SERVER_PORT));
});

let bunk = { topic: 'twitterstream',
  value: '{"text": "@moniboyce Oh Btw,I did the Syndicate Ra🙏dio Show on KLOS FM Station last night. Lmao\nI asked if u could hear it fro… https://t.co/slBjc1PLON", "language": "en", "sentiment": "positive", "fromLocation": "West Hollywood, CA", "fromLocationcoordinates": "34.0900091,-118.3617442", "toLocation": "Cape Town, South Africa", "toLocationcoordinates": "-33.9289919,18.417396" }',
  offset: 281,
  partition: 0,
  highWaterOffset: 282,
  key: -1
};

let n = stripAnsi(bunk.value);
let data = JSON.parse(n);
console.log(data);

let i = 0;

io.on('connection', (socket) => {
  console.log(chalk.green("Client connected!"));

  socket.on('disconnect', () => {
    console.log('Client disconnected!');
  });

  socket.emit('tweet', data);

  // consumer.on('message', (message) => {
  //   console.log(chalk.blue('.'));
  //   // socket.emit('tweet', message);
  //   console.log(message);
  // });

  // consumer.on('error', (err) => {
  //   console.log('error', err);
  // });

  socket.on('ack', () => {
    socket.emit('tweet', data);
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