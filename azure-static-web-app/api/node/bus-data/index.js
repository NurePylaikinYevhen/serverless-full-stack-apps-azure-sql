const sql = require('mssql')

const AZURE_CONN_STRING = "Server=tcp:bus-server545000.database.windows.net,1433;Initial Catalog=bus-db;Persist Security Info=False;User ID=bus-admin;Password=App122331;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

module.exports = async function (context, req) {    
    const pool = await sql.connect(AZURE_CONN_STRING);    

    const busData = await pool.request()
        .input("routeId", sql.Int, parseInt(req.query.rid))
        .input("geofenceId", sql.Int, parseInt(req.query.gid))
        .execute("web.GetMonitoredBusData");        

    context.res = {        
        body: JSON.parse(busData.recordset[0]["locationData"])
    };
}

