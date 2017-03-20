from pyspark import SparkContext

sc = SparkContext("local", "sample")

# Some file on the system
log_file = "README.md"
log_data = sc.textFile(log_file).cache()

num_a = logData.filter(lambda s: 'a' in s).count()
num_b = logData.filter(lambda s: 'b' in s).count()

result = "Lines with a: {0}, lines with b: {0}".format(num_a, num_b)
print(result)

counts = log_data.flatMap(lambda line: line.split(" ")).map(lambda word: (word, 1)).reduceByKey(lambda a, b: a + b)
print(counts)
