# Map
# Returns a new RDD by applying a function to each element of this RDD

from pyspark import SparkContext

sc = SparkContext("local[2]", "map_example")

rdd = sc.parallelize(["banana", "apple", "watermelon"])
sorted(rdd.map(lambda x: (x, len(x))).collect())
