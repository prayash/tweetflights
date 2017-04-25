# A Bit of Big Data

## Installation

```
- cd client && npm install
- cd server && npm install
- npm start
```

## Connecting to EC2 Instance

Store all your keys in ~/aws.

```
./scripts/app to SSH into server machine
./scripts/kafka to SSH into Kafka broker
```

## Running

```
- (terminal 1) -> ~/kafka/bin/zookeeper-server-start.sh ~/kafka/config/zookeeper.properties
- (terminal 2) -> ~/kafka/bin/kafka-server-start.sh ~/kafkaconfig/server.properties
- (terminal 3) -> python2.7 app/app.py
- (terminal 4) -> ~/spark/bin/spark-submit --packages org.apache.spark:spark-streaming-kafka-0-8_2.11:2.1.0 stream.py localhost:9092 -> twitterstream
- (terminal 5) -> ~/kafka/bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic twitterstream --from-beginning
```