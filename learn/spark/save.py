# SaveAsTextFile
# Save this RDD as a text file, using string representations of elements

from pyspark.context import SparkContext

sc = SparkContext('local[2]', 'save_example')

file = sc.textFile("README.md")

file.flatMap(lambda line: line.split()).saveAsTextFile("output_dir")
