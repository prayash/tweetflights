import json
import tweepy
import configparser
import random
import subprocess
from kafka import SimpleProducer, KafkaClient
from geopy.geocoders import Nominatim
from data_helpers import batch_iter, load_data, string_to_int
import tensorflow as tf
import os
import time
import numpy as np
from random import randint
from generic_helpers import *
class sentimentAI():
    def __init__(self):
        tf.flags.DEFINE_boolean('train', False,
                        'Should the network perform training? (default: False)')
        tf.flags.DEFINE_boolean('save', False,
                        'Save session checkpoints (default: False)')
        tf.flags.DEFINE_boolean('save_protobuf', False,
                        'Save session as binary protobuf (default: False)')
        tf.flags.DEFINE_boolean('evaluate_batch', False,
                        'Print the network output on a batch from the dataset '
                        '(for debugging/educational purposes')
        tf.flags.DEFINE_string('load', '',
                       'Restore the given session if it exists (Pass the name '
                       'of the session folder: runYYYMMDD-hhmmss)')
        tf.flags.DEFINE_string('custom_input', '',
                       'The program will print the network output for the '
                       'given input string.')
        tf.flags.DEFINE_string('filter_sizes', '3,4,5',
                       'Comma-separated filter sizes for the convolution layer '
                       '(default: \'3,4,5\')')
        tf.flags.DEFINE_integer('reduced_dataset', 1,
                        'Use 1/[REDUCED_DATASET]-th of the dataset to reduce '
                        'memory usage (default: 1; uses all dataset)')
        tf.flags.DEFINE_integer('embedding_size', 128,
                        'Size of character embedding (default: 128)')
        tf.flags.DEFINE_integer('num_filters', 128,
                        'Number of filters per filter size (default: 128)')
        tf.flags.DEFINE_integer('batch_size', 100, 'Batch Size (default: 100)')
        tf.flags.DEFINE_integer('epochs', 3, 'Number of training epochs (default: 3)')
        tf.flags.DEFINE_integer('valid_freq', 1,
                        'Check model accuracy on validation set '
                        '[VALIDATION_FREQ] times per epoch (default: 1)')
        tf.flags.DEFINE_integer('checkpoint_freq', 1,
                        'Save model [CHECKPOINT_FREQ] times per epoch '
                        '(default: 1)')
        tf.flags.DEFINE_integer('test_data_ratio', 10,
                        'Percentual of the dataset to be used for validation '
                        '(default: 10)')

        FLAGS = tf.flags.FLAGS

        x, y, self.vocabulary, vocabulary_inv = load_data()
        # Randomly shuffle data
        np.random.seed(123)
        shuffle_indices = np.random.permutation(np.arange(len(y)))
        x_shuffled = x[shuffle_indices]
        y_shuffled = y[shuffle_indices]
        # Split train/test set
        text_percent = FLAGS.test_data_ratio / 100.0
        test_index = int(len(x) * text_percent)
        x_train, x_test = x_shuffled[:-test_index], x_shuffled[-test_index:]
        y_train, y_test = y_shuffled[:-test_index], y_shuffled[-test_index:]
        
        self.sess = tf.InteractiveSession()
        # Network
        # Placeholders
        data_in = tf.placeholder(tf.int32, [None, sequence_length], name='data_in')
        data_out = tf.placeholder(tf.float32, [None, num_classes], name='data_out')
        dropout_keep_prob = tf.placeholder(tf.float32, name='dropout_keep_prob')
        # Stores the accuracy of the model for each batch of the validation testing
        valid_accuracies = tf.placeholder(tf.float32)
        # Stores the loss of the model for each batch of the validation testing
        valid_losses = tf.placeholder(tf.float32)

        # Embedding layer
        with tf.name_scope('embedding'):
            W = tf.Variable(tf.random_uniform([vocab_size, FLAGS.embedding_size],
                                      -1.0, 1.0),
                    name='embedding_matrix')
            embedded_chars = tf.nn.embedding_lookup(W, data_in)
            embedded_chars_expanded = tf.expand_dims(embedded_chars, -1)

        # Convolution + ReLU + Pooling layer 
        pooled_outputs = []
        for i, filter_size in enumerate(filter_sizes):
            with tf.name_scope('conv-maxpool-%s' % filter_size):
                # Convolution Layer
                filter_shape = [filter_size, FLAGS.embedding_size, 1, FLAGS.num_filters]
                W = weight_variable(filter_shape, name='W_conv')
                b = bias_variable([FLAGS.num_filters], name='b_conv')
                conv = tf.nn.conv2d(embedded_chars_expanded,
                            W,
                            strides=[1, 1, 1, 1],
                            padding='VALID',
                            name='conv')
                # Activation function
                h = tf.nn.relu(tf.nn.bias_add(conv, b), name='relu')
                # Maxpooling layer
                ksize = [1, sequence_length - filter_size + 1, 1, 1]
                pooled = tf.nn.max_pool(h,
                                ksize=ksize,
                                strides=[1, 1, 1, 1],
                                padding='VALID',
                                name='pool')
            pooled_outputs.append(pooled)

        # Combine the pooled feature tensors
        num_filters_total = FLAGS.num_filters * len(filter_sizes)
        h_pool = tf.concat(pooled_outputs, 3)
        h_pool_flat = tf.reshape(h_pool, [-1, num_filters_total])

        # Dropout
        with tf.name_scope('dropout'):
            h_drop = tf.nn.dropout(h_pool_flat, dropout_keep_prob)

        # Output layer
        with tf.name_scope('output'):
            W_out = weight_variable([num_filters_total, num_classes], name='W_out')
            b_out = bias_variable([num_classes], name='b_out')
            network_out = tf.nn.softmax(tf.matmul(h_drop, W_out) + b_out)
        # Loss function
        cross_entropy = -tf.reduce_sum(data_out * tf.log(network_out))
        saver = tf.train.Saver()
        saver.Restore(self.sess, '~/nn/output/run20170423/checkpoint.ckpt')

    def weight_variable(shape, name):
        """
        Creates a new Tf weight variable with the given shape and name.
        Returns the new variable.
        """
        var = tf.truncated_normal(shape, stddev=0.1)
        return tf.Variable(var, name=name)

    def bias_variable(shape, name):
        """
        Creates a new Tf bias variable with the given shape and name.
        Returns the new variable.
        """
        var = tf.constant(0.1, shape=shape)
        return tf.Variable(var, name=name)

    def save_protobuf():
        """
        Save protobuf
        """
        minimal_graph = convert_variables_to_constants(sess, sess.graph_def,
                                                   ['output'])
        tf.train.write_graph(minimal_graph, '.', 'minimal_graph.proto',
                         as_text=False)
        tf.train.write_graph(minimal_graph, '.', 'minimal_graph.txt', as_text=True)
        
    def evaluate_sentence(self, sentence):
        """
        Translates a string to its equivalent in the integer vocabulary and feeds it
        to the network.
        Outputs result to stdout.
        """
        x_to_eval = string_to_int(sentence, self.vocabulary, max(len(i) for i in x))
        result = self.sess.run(tf.argmax(network_out, 1),
                      feed_dict={data_in: x_to_eval, dropout_keep_prob: 1.0})
        unnorm_result = sess.run(network_out, feed_dict={data_in: x_to_eval,
                                                     dropout_keep_prob: 1.0})
        network_sentiment = 'POS' if result == 1 else 'NEG'
        return network_sentiment



class TStreamListener(tweepy.StreamListener):
    """ A class to read the twitter stream via tweepy and push it to a Kafka producer.
    We attach the tweepy.StreamListener instance to this class in order to publish
    live tweets to our Kafka producer.
    Attributes:
        api: An instance of StreamListener from the tweepy API.
        producer: A Kafka Producer to send messages to a consumer
    """

    def __init__(self, api):
        self.geolocator = Nominatim()
        self.api = api
        self.ai = sentimentAI()
        super(tweepy.StreamListener, self).__init__()

        # Instantiate a KafkaClient on local machine.
        client = KafkaClient("127.0.0.1:9092")
        self.producer = SimpleProducer(client, async = True,
                          batch_send_every_n = 1000,
                          batch_send_every_t = 10)

    def on_status(self, status):
        """ This method is called whenever new data arrives from the live stream.
        We asynchronously push this data to Kafka queue.
        """
        # msg = status.text.encode('utf-8')
        
        try:
            twitter_json = json.dumps(status._json).encode('utf-8')
            twitterFilterJSON = json.loads(twitter_json)

            if twitterFilterJSON["entities"]['user_mentions'] is not None and len(twitterFilterJSON["entities"]['user_mentions']) > 0:
                if twitterFilterJSON['place'] is not None:
                    if not twitterFilterJSON['text'].startswith('RT'):

                        toUser_id = twitterFilterJSON["entities"]['user_mentions'][0]["id_str"]

                        twitter_id_json = json.dumps(api.get_user(toUser_id)._json).encode('utf-8')
                        toUserId_filter_JSON = json.loads(twitter_id_json)
                        # print toUserId_filter_JSON

                        if toUserId_filter_JSON["profile_location"] is not None:
                            # print (twitterFilterJSON['text'])
                            # print "TO:" + toUserId_filter_JSON["profile_location"]['name']
                            # print "From:" + str(twitterFilterJSON['place']['full_name'])

                            toLocationCoordinates = self.geolocator.geocode(toUserId_filter_JSON["profile_location"]['name'].encode('utf-8'))
                            fromLocationCoordinates = self.geolocator.geocode(twitterFilterJSON['place']['full_name'].encode('utf-8'))

                            sentiment = self.ai.evaluate_sentence(twitterFilterJSON['text'].encode('utf-8'))

                            if toLocationCoordinates != None and fromLocationCoordinates != None:
                                tweetJSON = "{\"text\": \"" + twitterFilterJSON['text'].encode('utf-8') + "\", \"language\": \"" + twitterFilterJSON['lang'].encode('utf-8') + "\", \"sentiment\": \"" + sentiment.encode('utf-8') + "\", \"fromLocation\": \"" + twitterFilterJSON['place']['full_name'].encode('utf-8') + "\", \"fromLocationLat\": \"" + str(fromLocationCoordinates.latitude) + "\", \"fromLocationLong\": \"" + str(fromLocationCoordinates.longitude) + "\", \"toLocation\": \"" + toUserId_filter_JSON["profile_location"]['name'].encode('utf-8') + "\", \"toLocationLat\": \"" + str(toLocationCoordinates.latitude) + "\", \"toLocationLong\": \"" + str(toLocationCoordinates.longitude) + "\" }".encode('utf-8')
                                print tweetJSON
                                self.producer.send_messages('twitterstream', tweetJSON)


        except Exception as e:
            # Catch any unicode errors while printing to console
            # and just ignore them to avoid breaking application.
            pass
            print(e)
            return False

        return True

    def on_error(self, status_code):
        """ This method is called when a new error is encountered.
        The status code should give enough indication as to why the
        error has occured.
        """

        print(status_code)
        print("An error occured in the Kafka producer.")

        # Don't kill the stream.
        return True

    def on_timeout(self):
        """ This method is called when a the stream has timed out."""

        print("The stream listener has timed out.")

        # Don't kill the stream.
        return True


if __name__ == '__main__':

    # Read the auth keys from 'keys.txt' file - only store locally!
    config = configparser.ConfigParser()
    config.read('keys.txt')

    # consumer_key = config['DEFAULT']['consumerKey']
    # consumer_secret = config['DEFAULT']['consumerSecret']
    # access_key = config['DEFAULT']['accessToken']
    # access_secret = config['DEFAULT']['accessTokenSecret']

    # Twitter API key arrays
    consumerKey = ['z7mSIufiB7Lom9dJyvQ3blEDR', '3nU7p7BSVMGJi5MQFM6o1bYQy', 'VMV0HV4fmFvqHKnIQ9lVEkSRC']
    consumerSecret = ['V3Xq4WxpJAo6LWjRLipThKC10wMZHDHfhZQNzDYl6Kg0CIBlgA',  'RDaA1vcB5DaBwCfVJ3wBuLW94LzZ3I1lWjQYf2bGzxEvOX8kii', 'WWCmy3VdQkZlhR5OF9FSSWWxevxyUmBidFsVJgJ3pnqZTBgTyk']
    accessKey = ['717173546-jgCRHCgVeW9ShqRxRPUko1eEX0dW8v0VM0UrNiLS', '820303078486327296-baaGtIVl3rHf6kp0AKKP95XEQBHptmw', '2466981529-Q3Ij2PBoVsNlenDNfHEQgYqC6pRl9ibieyvqn1u']
    accessSecret = ['kM2ENz91HTDVuC2NajwE1cD7rZVa52hPSgAQP7Y9lEfLZ', 'qBqzk9G75uxwS068ZRrB9uIil5kVHTZefnvffWB6ASoVT', 'S2G1LOZMNVcT92Vs7rQXRJw5aZcF3j1dWmlSfm4DValX5']

    keyNumber = random.randint(0,2)

    consumer_key = consumerKey[keyNumber]
    consumer_secret = consumerSecret[keyNumber]
    access_key = accessKey[keyNumber]
    access_secret = accessSecret[keyNumber]

    # Create auth object to consume tweepy's API.
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_key, access_secret)
    api = tweepy.API(auth)

    # Create a tweepy stream and bind the listener to it.
    stream = tweepy.Stream(auth, listener = TStreamListener(api))

    # Custom filters!
    #stream.filter(track = ['love', 'hate'], languages = ['en'])

    try:
        stream.filter(languages = ['en','fr','ar', 'sp', 'sv', 'it', 'hi'], locations=[-180, -90, 180, 90])
    except Exception as e:
        print(e)
        pass
