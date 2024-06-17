const sql = require('mssql');
const AZURE_CONN_STRING = "Server=tcp:bus-server545000.database.windows.net,1433;Initial Catalog=bus-db;Persist Security Info=False;User ID=bus-admin;Password=App122331;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

module.exports = async function (context, req) {
    context.log('Function execution started.');

    const routeId = parseInt(req.query.rid);
    const geofenceId = parseInt(req.query.gid);

    context.log(`Received routeId: ${routeId}, geofenceId: ${geofenceId}`);

    if (isNaN(routeId) || isNaN(geofenceId)) {
        context.res = {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: 'Invalid routeId or geofenceId provided.'
        };
        context.log('Invalid routeId or geofenceId provided.');
        return;
    }

    try {
        context.log('Attempting to connect to the database...');
        const pool = await sql.connect(AZURE_CONN_STRING);
        context.log('Connected to the database.');

        context.log('Executing stored procedure...');
        const busData = await pool.request()
            .input("routeId", sql.Int, routeId)
            .input("geofenceId", sql.Int, geofenceId)
            .execute("web.GetMonitoredBusData");
        context.log('Stored procedure executed successfully.');

        if (busData.recordset.length === 0) {
            context.res = {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                body: 'No data found for the provided routeId and geofenceId.'
            };
            context.log('No data found for the provided routeId and geofenceId.');
            return;
        }

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.parse(busData.recordset[0]["locationData"])
        };
        context.log('Function executed successfully.');
    } catch (error) {
        context.log.error('An error occurred:', error.message);
        context.log.error('Stack trace:', error.stack);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS ',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: 'An error occurred. Please try again later.'
        };
    }
};
