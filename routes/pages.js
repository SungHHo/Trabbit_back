const authMiddleware = require('../middleware/authMiddleware');

router.get('/main', authMiddleware, (req, res) => {
  res.render('main', { user: req.user });
});
