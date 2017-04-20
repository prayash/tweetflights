# Word Count

import sys
from operator import add

from pyspark import SparkContext

# Initialize the Spark Context with the app name
sc = SparkContext(appName="WordCount")

# Get the lines from the text file
lines = sc.textFile("README.md")

# Filter out the lines which are empty
lines_nonempty = lines.filter(lambda x: len(x) > 0)

# Get all words and their frequencies and sort them
words = lines_nonempty.flatMap(lambda x: x.split())

wordcounts = words\
  .map(lambda x: (x, 1))\
  .reduceByKey(lambda x: (x[1], x[0]))\
  .sortByKey(False)

# Show the top 5 words by frequency
print(wordcounts.take(5))

sc.stop()
