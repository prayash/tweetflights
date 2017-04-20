# Reduce
# Reduces the elements of the RDD using the specified commutative and 
# associative binary operator. Currently reduces partitions locally.

from operator import add
from pyspark.context import SparkContext

sc = SparkContext('local[2]', 'reduce_example')

num_list = [num for num in range(1000000)]
sc.parallelize(num_list).reduce(add)

