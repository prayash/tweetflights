# A 'Bit' of Big Data - TweetFlights

#### ATLS 4214 - Big Data Architecture - Final Project
#### Contributors: Prayash Thapa, Tamim Shaban, Ashna Guliani, Mikhail Chowdhury

![](https://github.com/CUBigDataClass/A-Bit-of-Big-Data/blob/master/main/Screenshot_20170424-180325.png)

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

**Note: script must be killed manually**
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

6. Start Node-Kafka Stream
```
(terminal 5)
cd bin/
./4_node.sh
```

7. Start Node Server
```
(terminal 6)
node server/index.js
```