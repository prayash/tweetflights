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

## Resources

#### Spark
- [Spark Programming Guide](https://spark.apache.org/docs/latest/programming-guide.html#overview)
- [Python + Spark Lightning Fast Cluster Computing](https://www.youtube.com/watch?v=1KuqWuuAazM&app=desktop)
- [PySpark: Python API for Spark](https://www.youtube.com/watch?v=xc7Lc8RA8wE&app=desktop)
- [Analyzing Big Data with Twitter: Spark by Matei Zaharia](https://www.youtube.com/watch?v=rpXxsp1vSEs)
- [AWS EMR Spark Launch](http://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-spark-launch.html)
- [Apache Spark -- Basic Cluster Configuration and Concepts](https://www.youtube.com/watch?v=w1Cj2wqQYwQ)
- [How To: Apache Spark Cluster On Amazon EC2 Tutorial](https://www.supergloo.com/fieldnotes/apache-spark-cluster-amazon-ec2-tutorial/)
- [APACHE SPARK STREAMING WITH KAFKA AND CASSANDRA](http://www.bogotobogo.com/Hadoop/BigData_hadoop_Apache_Spark_Streaming_Kafka_Cassandra.php)
- [Spark Streaming, Kafka and Cassandra Tutorial](https://support.instaclustr.com/hc/en-us/articles/213663858-Spark-Streaming-Kafka-and-Cassandra-Tutorial)
- [Spark Streaming w/ Kafka, Part 1](https://www.youtube.com/watch?v=6xM0BJuwdQk)
- [Spark Tutorial: Learning Apache Spark](http://nbviewer.jupyter.org/github/spark-mooc/mooc-setup/blob/master/spark_tutorial_student.ipynb)
- [Spark Streaming and Twitter Sentiment Analysis](https://medium.com/@anicolaspp/spark-streaming-and-twitter-sentiment-analysis-c860938d484)
- [Spark-MLlib-Twitter-Sentiment-Analysis](https://devpost.com/software/spark-mllib-twitter-sentiment-analysis)

#### Kafka
- [Installing Kafka on Amazon EC2](http://edbaker.weebly.com/blog/installing-kafka-on-amazons-ec2)
- [MultiNode - MultiBroker Cluster for Kafka on AWS](https://gist.github.com/mkanchwala/fbfdd5ef866a58a77f6e)
- [Sample Programs for Kafka (Github)](https://github.com/mapr-demos/kafka-sample-programs) | [(video)](https://www.youtube.com/watch?v=1Og9n9FJteM)
- [Kafka + Spark Streaming + Cassandra](https://github.com/Yannael/kafka-sparkstreaming-cassandra)
- [Quickly Get Started with Kafka](http://www.bigendiandata.com/2016-09-30-Kafka-Quickstart/)
- [How to Code for the Apache Kafka 0.9 API](https://www.youtube.com/watch?v=0ARmhmkQ9B8)
- [Streaming Twitter Data using Kafka](https://acadgild.com/blog/streaming-twitter-data-using-kafka/)
- [Processing Tweets with Kafka Streams](https://www.madewithtea.com/processing-tweets-with-kafka-streams.html)
- [Streaming API request parameters](https://dev.twitter.com/streaming/overview/request-parameters)
- [JSON encoder and decoder](https://docs.python.org/2/library/json.html)
- [JSON Formatter](https://jsonformatter.org/)
- [Tweepy API Reference](http://docs.tweepy.org/en/v3.5.0/api.html?highlight=location)
- [Twitter Dev Docs - Public Streams](https://dev.twitter.com/streaming/public)
- [Processing Twitter Data with Kafka Streams](http://www.opencore.com/blog/2016/7/kafka-streams-demo/)


#### Cassandra
