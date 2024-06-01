const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 회원가입
exports.register = async (req, res) => {
  const { username, password, name, gender, nickname, phone, region, birthdate, email } = req.body;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: '이미 등록된 이메일의 사용자입니다.' });
    }

    // 비밀번호 해시화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await User.create({ username, password: hashedPassword, name, gender, nickname, phone, region, birthdate, email });

    if (userId) {
      return res.status(201).json({ msg: '회원가입이 성공적으로 완료되었습니다.' });
    } else {
      throw new Error('사용자 생성 실패');
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: '서버 오류가 발생했습니다.' });
  }
};


// 로그인 컨트롤러
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, message: '로그인 실패: 아이디가 존재하지 않습니다.' });
    }

    // 입력된 비밀번호와 데이터베이스에 저장된 해시 값 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ success: true, token });
      });
    } else {
      res.status(401).json({ success: false, message: '로그인 실패: 비밀번호가 틀렸습니다.' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};


// 비밀번호 재설정 요청 (이메일 발송)
exports.resetPasswordRequest = async (req, res) => {
  const { name, userId, email } = req.body;

  try {
    // 사용자 정보를 이름, 아이디, 이메일로 조회
    const user = await User.findByUserIdAndEmail(userId, email);
    if (!user || user.name !== name) {
      return res.status(400).json({ msg: '입력된 정보와 일치하는 사용자가 없습니다.' });
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 이메일 발송 설정
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '비밀번호 재설정 요청',
      text: `다음 링크를 통해 비밀번호를 재설정하세요: ${process.env.CLIENT_URL}/reset/${resetToken}`,
    };

    // 이메일 발송
    await transporter.sendMail(mailOptions);

    res.json({ msg: '비밀번호 재설정 이메일이 발송되었습니다.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};

// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.updatePassword(decoded.id, newPassword);
    res.json({ msg: '비밀번호가 성공적으로 재설정되었습니다.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};

// 회원 탈퇴
exports.deleteAccount = async (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: '인증 토큰이 없습니다. 액세스가 거부되었습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.deleteById(decoded.user.id);
    res.json({ msg: '회원탈퇴가 성공적으로 완료되었습니다.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};

// 아이디 찾기
exports.findUsername = async (req, res) => {
    const { name, email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ msg: '등록된 이메일이 아닙니다.' });
      }
  
      if (user.name !== name) {
        return res.status(400).json({ msg: '이름이 일치하지 않습니다.' });
      }
  
      res.json({ username: user.username });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('서버 오류가 발생했습니다.');
    }
  };
  
  
exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.body;
        const rows = await User.findByUsername2(username);
        if (rows.length > 0) {
            console.log("이미 중복된 아이디가 존재");
            return res.json({ exists: true });
        } else {
            console.log("중복된 아이디가 없음");
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking username:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const rows = await User.findByEmail(email);

        if (rows.length > 0) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        // authMiddleware를 통해 검증된 사용자 정보를 사용
        const user = req.user;

        // User 모델을 사용하여 사용자 정보 조회
        const userInfo = await User.findById(user.id);

        // 조회된 사용자 정보 반환
        res.json(userInfo);
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: '인증 실패' });
    }
};