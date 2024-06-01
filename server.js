const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 3000;

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '1234', 
    database: 'userdb'
});

// 데이터베이스 연결
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL에 성공적으로 연결되었습니다.');
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'web_front')));

// 회원가입 API
app.post('/register', (req, res) => {
    const { username, password, name, nickname, phone, region, birthdate } = req.body;
    // 비밀번호 해시 생성
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error(err);
            return res.status(500).send('서버 오류가 발생했습니다.');
        }
        const sql = 'INSERT INTO users (username, password, name, nickname, phone, region, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?)';
        // 해시된 비밀번호를 DB에 저장
        db.query(sql, [username, hash, name, nickname, phone, region, birthdate], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('서버 오류가 발생했습니다.');
            } else {
                res.send('회원가입이 성공적으로 완료되었습니다.');
            }
        });
    });
});

// 아이디 중복 검사 API
app.post('/check-username', (req, res) => {
    const { username } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
        if (results.length > 0) {
            // 사용자명이 이미 존재하는 경우
            res.json({ isAvailable: false });
        } else {
            // 사용자명이 존재하지 않는 경우
            res.json({ isAvailable: true });
        }
    });
});


// 로그인 API
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
        if (results.length > 0) {
            // 데이터베이스에서 찾은 사용자의 비밀번호와 입력받은 비밀번호 비교
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success:false, message: '서버 오류가 발생했습니다.' });
                }
                if (isMatch) {
                    // 비밀번호를 제외한 사용자 정보 반환
                    const user = { ...results[0] };
                    delete user.password;
                    res.json({
                        success: true,
                        message: '로그인 성공!',
                        user: user
                    });
                } else {
                    res.status(401).json({ success:false, message: '로그인 실패: 비밀번호가 틀렸습니다.' });
                }
            });
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
    });
});

app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
