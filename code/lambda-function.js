const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        // For HTTP API, method is in event.requestContext.http.method
        const httpMethod = event.requestContext?.http?.method || event.httpMethod;

        switch (httpMethod) {
            case 'POST':
                return await addJobApplication(event);
            case 'GET':
                return await getJobApplications();
            default:
                return {
                    statusCode: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "GET,POST"
                    },
                    body: JSON.stringify({ error: 'Unsupported HTTP method' })
                };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET,POST"
            },
            body: JSON.stringify({ error: 'Operation failed' })
        };
    }
};

async function addJobApplication(event) {
    const data = JSON.parse(event.body);
    const applicationID = Date.now().toString();

    const command = new PutCommand({
        TableName: 'JobApplications',
        Item: {
            ApplicationID: applicationID,
            CompanyName: data.CompanyName,
            Role: data.Role,
            DateApplied: data.DateApplied,
            Status: data.Status
        }
    });

    await dynamoDB.send(command);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST"
        },
        body: JSON.stringify({
            message: 'Application added successfully!',
            ApplicationID: applicationID
        })
    };
}

async function getJobApplications() {
    const command = new ScanCommand({
        TableName: 'JobApplications'
    });

    const response = await dynamoDB.send(command);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST"
        },
        body: JSON.stringify({
            message: 'Applications retrieved successfully',
            items: response.Items
        })
    };
}