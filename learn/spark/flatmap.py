# FlatMap 
# Returns a new RDD by first applying a function to all elements of this RDD
# and then flattening the results

from pyspark.context import SparkContext

sc = SparkContext('local[2]', 'flatmap_example')

rdd = sc.parallelize(["this is you", "you are here", "how do you feel about this"])
sorted(rdd.flatMap(lambda x: x.split()).collect())

