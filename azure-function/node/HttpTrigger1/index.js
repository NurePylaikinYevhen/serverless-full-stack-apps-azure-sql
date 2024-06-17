const sql = require('mssql');

const AZURE_CONN_STRING = process.env["AzureSQLConnectionString"];

module.exports = async function (context, req) {
    context.log('Function execution started.');

    const routeId = parseInt(req.query.rid);
    const geofenceId = parseInt(req.query.gid);
    context.log(`Received routeId: ${routeId}, geofenceId: ${geofenceId}`);

    try {
        const pool = await sql.connect(AZURE_CONN_STRING);

        const busData = await pool.request()
            .input("routeId", sql.Int, routeId)
            .input("geofenceId", sql.Int, geofenceId)
            .execute("web.GetMonitoredBusData");

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Разрешить запросы со всех источников
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.parse(busData.recordset[0]["locationData"])
        };
    } catch (error) {
        context.log.error('An error occurred:', error.message);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Разрешить запросы со всех источников
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: 'An error occurred. Please try again later.'
        };
    }
};