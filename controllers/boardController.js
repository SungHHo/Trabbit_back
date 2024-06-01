// boardController.js
const Post = require('../models/Post');

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
    if (result.length === 0) return res.status(404).send("게시물을 찾을 수 없습니다.");
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

exports.getRecommendationStatus = (req, res) => {
  Post.getRecommendationStatus({ postId: req.params.post_id, userId: req.user.id }, (err, result) => {
    if (err) return res.status(500).send("Internal Server Error");
    const recommended = result[0].count > 0;
    res.json({ recommended });
  });
};

exports.recommendPost = (req, res) => {
  Post.recommendPost({ postId: req.params.post_id, userId: req.user.id }, (err) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.sendStatus(200);
  });
};
