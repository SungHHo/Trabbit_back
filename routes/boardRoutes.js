// routes/boardRoutes.js

const express = require("express");
const router = express.Router();
const boardController = require(" ../controllers/boardController");
const commentController = require("../controllers/commentController");

router.get("/categories", boardController.getCategories);
router.get("/posts", boardController.getPosts);
router.post("/post", boardController.createPost);
router.get("/post/:post_id", boardController.getPostById);
router.put("/post/:post_id", boardController.updatePost);
router.delete("/post/:post_id", boardController.deletePost);
router.post("/post/:post_id/comment", boardController.createComment);

//댓글 관련 라우트
router.get(
  "/comment/:comment_id/recommendation-status",
  commentController.checkRecommendationStatus
);
router.post(
  "/comment/:comment_id/recommend",
  commentController.recommendComment
);

module.exports = router;
