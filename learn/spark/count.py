# Count
# Returns the number of elements in this RDd

from pyspark.context import SparkContext

sc = SparkContext('local[2]', 'count_example')

file = sc.textFile("README.md")
file.flatMap(lambda line: line.split()).count()

