// boardController.js
const Post = require("../models/Post");
const User = require("../models/User");

exports.getCategories = (req, res) => {
  Post.getCategories((err, result) => {
    if (err) return res.status(500).send("서버 오류가 발생했습니다.");
    res.json(result);
  });
};

exports.getPosts = (req, res) => {
  Post.getPosts((err, result) => {
    if (err) return res.status(500).send("서버 오류가 발생했습니다.");
    res.json(result);
  });
};

exports.createPost = (req, res) => {
  Post.createPost(req.body, (err) => {
    if (err) return res.status(500).send("서버 오류가 발생했습니다.");
    res.status(201).send("게시물이 성공적으로 생성되었습니다.");
  });
};

exports.getPostById = (req, res) => {
  Post.getPostById(req.params.post_id, (err, result) => {
    if (err) return res.status(500).send("서버 오류가 발생했습니다.");
    if (result.length === 0)
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    res.json(result[0]);
  });
};

exports.updatePost = (req, res) => {
  Post.updatePost({ ...req.body, post_id: req.params.post_id }, (err) => {
    if (err) return res.status(500).send("서버 오류가 발생했습니다.");
    res.send("게시물이 성공적으로 수정되었습니다.");
  });
};

exports.deletePost = (req, res) => {
  Post.deletePost(req.params.post_id, (err) => {
    if (err) return res.status(500).send("서버 오류가 발생했습니다.");
    res.send("게시물이 성공적으로 삭제되었습니다.");
  });
};

exports.createComment = (req, res) => {
  Post.createComment({ ...req.body, post_id: req.params.post_id }, (err) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.sendStatus(200);
  });
};

exports.checkRecommendationStatus = (req, res) => {
  const commentId = req.params.comment_id;
  const userId = req.user.id; // 로그인한 유저의 ID, 세션 또는 토큰에서 가져옵니다.

  Post.checkRecommendationStatus(userId, commentId, (err, result) => {
    if (err) {
      console.error("Error checking recommendation status:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const recommended = result[0].recommended > 0;
    res.json({ recommended });
  });
};

exports.recommendComment = (req, res) => {
  const commentId = req.params.comment_id;
  const userId = req.user.id; // 로그인한 유저의 ID, 세션 또는 토큰에서 가져옵니다.

  Post.recommendComment(userId, commentId, (err) => {
    if (err) {
      console.error("Error recommending comment:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    userModel.updateUserPoints(userId, 500, (err) => {
      if (err) {
        console.error("Error updating user points:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.sendStatus(200);
    });
  });
};
