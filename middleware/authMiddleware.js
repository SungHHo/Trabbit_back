// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 클라이언트에서 전송된 요청 헤더에서 토큰을 가져옵니다.
  const token = req.header('x-auth-token');

  // 토큰이 없는 경우 인증되지 않은 상태로 응답합니다.
  if (!token) {
    return res.status(401).json({ msg: '인증 토큰이 없습니다. 액세스가 거부되었습니다.' });
  }

  try {
    // 토큰을 검증하여 디코딩된 사용자 정보를 가져옵니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    // 토큰이 유효하지 않은 경우 응답합니다.
    res.status(401).json({ msg: '유효하지 않은 토큰입니다.' });
  }
};