// db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "database-1.c7m0w0yeu45p.ap-southeast-2.rds.amazonaws.com", // RDS 엔드포인트
  user: "admin", // RDS 사용자 이름
  password: "12345678", // RDS 비밀번호
  database: "userdb", // RDS 데이터베이스 이름
  port: 3306, // 기본 포트는 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  init: function () {
    return pool.promise();
  },
};
