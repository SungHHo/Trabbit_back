const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


// 회원가입 라우트
router.post('/register', authController.register);

// 로그인 라우트
router.post('/login', authController.login);

// 비밀번호 재설정 요청 라우트 (이메일 발송)
router.post('/reset-password-request', authController.resetPasswordRequest);

// 비밀번호 재설정 라우트
router.post('/reset-password', authController.resetPassword);

// 회원 탈퇴 라우트
router.delete('/delete-account', authController.deleteAccount);

// 아이디 찾기 라우트
router.post('/find-username', authController.findUsername);

// 아이디 중복 확인
router.post('/check-username', authController.checkUsername);

// 이메일 중복 확인
router.post('/check-email', authController.checkEmail);

// 사용자 정보 조회
router.get('/userinfo', authMiddleware, authController.getUserInfo);

module.exports = router;
