// ********************************************************************************
// A basic node.js consumer for Kafka queue that uses web sockets to emit real time
// data into the client via a TCP connection. Hurrah!

const KAFKA_PORT = '127.0.0.1:2181';
const SERVER_PORT = 3000;

const Kafka = require('kafka-node');
const Consumer = Kafka.Consumer;
const Offset = Kafka.Offset;
const Client = Kafka.Client;

let topic = 'twitterstream';
let kClient = new Client(KAFKA_PORT);
let topics = [{ topic: 'twitterstream', partition: 0, offset: 0 }];
let offset = new Offset(kClient);
let consumer = new Consumer(client, topics, { 
  fromOffset: true,
  autoCommit: false,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024
});

// ********************************************************************************
// * Server + Socket emissions with client

const server = require('http').createServer();
const io = require('socket.io')(server);
io.on((client) => {
  client.on('event', (data) => {

  });

  client.on('disconnect', () => {

  });
});

server.listen(SERVER_PORT);

// ********************************************************************************
// Kafka emissions

consumer.on('message', (message) => {
  console.log(message);
});

consumer.on('error', (err) => {
  console.log('error', err);
});

// If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
consumer.on('offsetOutOfRange', (topic) => {
  topic.maxNum = 2;
  offset.fetch([topic], (err, offsets) => {
    if (err) {
      return console.error(err);
    }
    let min = Math.min(offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});