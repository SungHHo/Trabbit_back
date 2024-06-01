// /models/User.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const db = require('../config/database.js'); // 데이터베이스 설정 파일

let pool; // pool 변수를 전역으로 선언

// 데이터베이스 연결을 위한 Pool 생성
const connectToDatabase = async () => {
  try {
    pool = await db.init(); // init 함수 호출 후 프로미스 풀 객체 받기
    console.log("데이터베이스가 연결되었습니다.");
  } catch (err) {
    console.error('Failed to connect to the database:', err);
  }
};

connectToDatabase();

class User {
  // 사용자 이름으로 사용자 찾기
  static async findByUsername(username) {
    try {
      console.log('SELECT * FROM users WHERE username = (?)', [username]);
      const [rows] = await pool.query('SELECT * FROM users WHERE username = (?)', [username]);
      console.log(rows);
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error('Database Error:', err);
      throw err;
    }
  }


    // 사용자 이름으로 사용자 찾기 (중복확인용)
    static async findByUsername2(username) {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows;
    }
  
  // 이메일로 사용자 찾기
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // 사용자 ID로 사용자 찾기
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ username, password, name, gender, nickname, phone, region, birthdate, email }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (username, password, name, gender, nickname, phone, region, birthdate, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, hashedPassword, name, gender, nickname, phone, region, birthdate, email]);
    return result.insertId;
  }

  // 사용자 정보 업데이트 (예: 비밀번호 재설정)
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  }

  // 사용자 삭제
  static async deleteById(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;
