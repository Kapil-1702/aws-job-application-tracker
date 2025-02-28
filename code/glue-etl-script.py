import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
# Initialize the job
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)
try:
    # Read directly from DynamoDB
    dyf = glueContext.create_dynamic_frame_from_options(
        connection_type="dynamodb",
        connection_options={
            "dynamodb.input.tableName": "JobApplications",
            "dynamodb.throughput.read.percent": "0.5",
            "dynamodb.endpoint": "https://dynamodb.us-east-2.amazonaws.com"
        }
    )

    # Convert to DataFrame
    df = dyf.toDF()

    # Write to S3
    df.write \
        .mode("overwrite") \
        .format("parquet") \
        .save("s3://job-applications-analytics/data/")
except Exception as e:
    print("Error occurred:", str(e))
    raise e
finally:
    job.commit()