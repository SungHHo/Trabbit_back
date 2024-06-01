// app.js
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const tempBoardRoutes = require('./routes/tempBoardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cors = require('cors');
const { init } = require('./config/database');

const app = express();

// 데이터베이스 연결
init();

// 미들웨어 설정
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// 라우팅 설정
app.use('/auth', authRoutes);
app.use('/board', boardRoutes);
app.use('/temp-board', tempBoardRoutes);
app.use('/ai', aiRoutes);

module.exports = app;
