# Filter
# Returns a new RDD containing only the elements that satisfy a predicate

from pyspark.context import SparkContext

sc = SparkContext('local[2]', 'filter_example')

rdd = sc.parallelize([1, 2, 3, 4, 5])
rdd.filter(lambda x: x % 2 == 0).collect()

