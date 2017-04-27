# A Bit of Big Data

## Summary

## Installation

```
cd client && npm install
cd server && npm install

Extract Kafka install folder to /kafka folder in root or repo
```

## Build Front End

```
cd client && npm run build
```

## Connecting to EC2 Instance & Running

1. SSH into EC2 Instace with screen

2. If Zookeeper is not already running
```
(terminal 1)
cd bin/
./1_zk.sh
```

3. Start Kafka
```
(terminal 2)
cd bin/
./2_kafka.sh
```

4. Start Python Tweet Producer Script
**Note must be killed manually**
```
(terminal 3)
cd bin/
./3_app.sh
```

5. (Optional) View Tweets/messages in Kafka topic
```
(terminal 4)
cd kafka/
bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic twitterstream --from-beginning
```

6. Start Node Client
```
(terminal 5)
cd bin/
./5_client.sh
```

7. Start Node Server
```
(terminal 5)
node server/index.js
```