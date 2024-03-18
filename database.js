const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "my-cinema-db.cpmigsseuzxk.eu-west-2.rds.amazonaws.com",
    user: "admin",
    database: "myCinemaDB",
    password: "password"
});

module.exports = pool.promise();