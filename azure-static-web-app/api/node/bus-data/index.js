const sql = require('mssql');

const AZURE_CONN_STRING = "Server=tcp:bus-server545000.database.windows.net,1433;Initial Catalog=bus-db;Persist Security Info=False;User ID=bus-admin;Password=App122331;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

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
            body: JSON.parse(busData.recordset[0]["locationData"])
        };
    } catch (error) {
        context.log.error('An error occurred:', error.message);
        context.res = {
            status: 500,
            body: 'An error occurred. Please try again later.'
        };
    }
};
