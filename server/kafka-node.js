// ********************************************************************************
// A basic node.js consumer for Kafka queue that uses web sockets to emit real time
// data into the client via a TCP connection. Hurrah!

const KAFKA_PORT = '127.0.0.1:2181';
const SERVER_PORT = 1337;

const chalk = require('chalk');
const Kafka = require('kafka-node');
const Consumer = Kafka.Consumer;
const Offset = Kafka.Offset;
const Client = Kafka.Client;

let topic = 'twitterstream';
let kClient = new Client(KAFKA_PORT);
let topics = [{ topic: 'twitterstream', partition: 0, offset: 0 }];
let offset = new Offset(kClient);
let consumer = new Consumer(kClient, topics, {
  fromOffset: true,
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

let bunk = [
  {
    "text": "Hey @MarcosFlores85 we will be over to see you play borneo fc on the 14th of may",
    "from": {
      'lat': "-32.926696",
      'lon': "151.778892"
    },
    "to": {
      'lat': "-32.9468200", 
      'lon': "-60.6393200"
    },
    'sentiment': 'neg'
  },
  {
    "text": "Hey @MarcosFlores85 we will be over to see you play borneo fc on the 14th of may",
    'from': {
      'lat': '40.014984',
      'lon': '-105.270546'
    },
    'to': {
      'lat': '27.700769',
      'lon': '85.300140'
    },
    'sentiment': 'pos'
  },
  {
    "text": "Hey @MarcosFlores85 we will be over to see you play borneo fc on the 14th of may",
    'from': {
      'lat': '51.2538',
      'lon': '-85.3232'
    },
    'to': {
      'lat': '47.6574',
      'lon': '-117.2399'
    },
    'sentiment': 'neg'
  },
  {
    "text": "Hey @MarcosFlores85 we will be over to see you play borneo fc on the 14th of may",
    'from': {
      'lat': '-24.7821',
      'lon': '-65.4232'
    },
    'to': {
      'lat': '9.1450',
      'lon': '40.4897'
    },
    'sentiment': 'pos'
  }
];

let i = 0;

io.on('connection', (socket) => {
  console.log(chalk.green("Client connected!"));

  socket.on('disconnect', () => {
    console.log('Client disconnected!');
  });

  socket.emit('tweet', bunk[i++]);

  socket.on('ack', () => {
    socket.emit('tweet', bunk[i++]);
  });

  consumer.on('message', (message) => {
    console.log(chalk.blue('.'));
    // socket.emit('tweet', message);
    console.log(message);
  });

  consumer.on('error', (err) => {
    console.log('error', err);
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