import json
import tweepy
import configparser
import random
import subprocess
from kafka import SimpleProducer, KafkaClient
from geopy.geocoders import Nominatim
from sentiment import sentiment_score

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
			    if twitterFilterJSON["lang"].startswith("en"):
			    	sentscore = sentiment_score(twitterFilterJSON['text'].encode('utf-8'))
			    	if sentscore > 0.5:
				    sentiment = 'Pos'
			    	else:
				    sentiment = 'Neg'
			    else:
				sentiment = 'Pos'
                            #sentiment = "Pos"#subprocess.check_output('python', '~/nn/twitter-sentiment-cnn', '--load', 'run20170423-124859', '--custom_input', twitterFilterJSON['text'].encode('utf-8'))
                            
                            if toLocationCoordinates != None and fromLocationCoordinates != None:
                                tweetJSON = "{\"text\": \"" + twitterFilterJSON['text'].encode('utf-8').strip('\\') + "\", \"language\": \"" + twitterFilterJSON['lang'].encode('utf-8') + "\", \"sentiment\": \"" + sentiment.encode('utf-8') + "\", \"fromLocation\": \"" + twitterFilterJSON['place']['full_name'].encode('utf-8') + "\", \"fromLocationLat\": \"" + str(fromLocationCoordinates.latitude) + "\", \"fromLocationLong\": \"" + str(fromLocationCoordinates.longitude) + "\", \"toLocation\": \"" + toUserId_filter_JSON["profile_location"]['name'].encode('utf-8') + "\", \"toLocationLat\": \"" + str(toLocationCoordinates.latitude) + "\", \"toLocationLong\": \"" + str(toLocationCoordinates.longitude) + "\" }".encode('utf-8')
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
    consumerKey = ['z7mSIufiB7Lom9dJyvQ3blEDR', '3nU7p7BSVMGJi5MQFM6o1bYQy', 'VMV0HV4fmFvqHKnIQ9lVEkSRC', 'eFdG5OTmYaG6dajkCyIkzVgDN', 'dMbHUg2mwSfdWtLmr1c3fAlLk', 'XxN8LsbSVl7X3fLVfVSX4OwRK']
    consumerSecret = ['V3Xq4WxpJAo6LWjRLipThKC10wMZHDHfhZQNzDYl6Kg0CIBlgA',  'RDaA1vcB5DaBwCfVJ3wBuLW94LzZ3I1lWjQYf2bGzxEvOX8kii', 'WWCmy3VdQkZlhR5OF9FSSWWxevxyUmBidFsVJgJ3pnqZTBgTyk', 'GKD3VJJSuIhrxGwlUV6bZkzQAMgbtVLIMisWklpcmN1KvdSgQN', '2XzEortaoQVeqZLRdV4pMhy5urWbVY8mZOfmBohlJttcAoqF3I', 'fgI6A5Ts63AveKaZbiRrZ1dFqEGi7vk3YbFyqZGVGNxuz49LI2']
    accessKey = ['717173546-jgCRHCgVeW9ShqRxRPUko1eEX0dW8v0VM0UrNiLS', '820303078486327296-baaGtIVl3rHf6kp0AKKP95XEQBHptmw', '2466981529-Q3Ij2PBoVsNlenDNfHEQgYqC6pRl9ibieyvqn1u', '2466981529-oFHUwqGSreeHafFYjs2jgZdqHo9VKyp5FqLlfTf', '2466981529-akosgWxjGbZrh3WoSY2JCZXG41VNcZSxhmRM8P6', '2466981529-47NKtvo3pkwX0M2c0NCz16e4HKrrfsMnYOygED8']
    accessSecret = ['kM2ENz91HTDVuC2NajwE1cD7rZVa52hPSgAQP7Y9lEfLZ', 'qBqzk9G75uxwS068ZRrB9uIil5kVHTZefnvffWB6ASoVT', 'S2G1LOZMNVcT92Vs7rQXRJw5aZcF3j1dWmlSfm4DValX5', 'AlO5qh4HglK8QgYQ0MJZqjooiJ9vOnzqo7JyQFbV7MUOP', 'I5dPFLT44ePKuoMcRNXYdVi5m6PxB8O6ITKjYvcrtlDnj', 'lXpiVdLAepRnqLdvj2IlgA0stJP7sLyEPe23Zr64xhIol']

    keyNumber = random.randint(0,5)

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
