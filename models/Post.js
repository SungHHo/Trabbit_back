// models/Post.js
const db = require("../config/database");

const connectToDatabase = async () => {
  try {
    const conn = await db.init(); // init 함수 호출
    // 데이터베이스 연결 후의 작업 수행
  } catch (err) {
    console.error("Failed to connect to the database:", err);
  }
};

connectToDatabase();
const Post = {
  getCategories: function (callback) {
    const sql = "SELECT * FROM categories";
    return conn.query(sql, callback);
  },

  getPosts: function (callback) {
    const sql = "SELECT * FROM posts";
    return conn.query(sql, callback);
  },

  createPost: function (title, content, author_id, category_id, callback) {
    const sql =
      "INSERT INTO posts (title, content, author_id, category_id, created_at) VALUES (?, ?, ?, ?, NOW())";
    return conn.query(sql, [title, content, author_id, category_id], callback);
  },

  getPostById: function (post_id, callback) {
    const sql = "SELECT * FROM posts WHERE post_id = ?";
    return conn.query(sql, [post_id], callback);
  },

  updatePost: function (post_id, author_id, title, content, callback) {
    const sql =
      "UPDATE posts SET author_id = ?, title = ?, content = ? WHERE post_id = ?";
    return conn.query(sql, [author_id, title, content, post_id], callback);
  },

  deletePost: function (post_id, callback) {
    const sql = "DELETE FROM posts WHERE post_id = ?";
    return conn.query(sql, [post_id], callback);
  },

  createComment: function (postId, content, author_id, callback) {
    const sql =
      "INSERT INTO comments (post_id, content, author_id, created_at) VALUES (?, ?, ?, NOW())";
    return conn.query(sql, [postId, content, author_id], callback);
  },

  checkRecommendationStatus: function (userId, commentId, callback) {
    const sql =
      "SELECT FIND_INT_SET(?, recommendations) AS recommended FROM comment WHERE id = ?";
    return conn.query(sql, [userId, commentId], callback);
  },

  recommendComment: function (userId, commentId, callback) {
    const sql =
      "UPDATE comment SET recommendations = IF(recommendations IS NULL OR recommendations = '', ?, CONCAT(recommendations, ',',?)) WHERE id = ?";
    return conn.query(sql, [userId, userId, commentId], callback);
  },
};

module.exports = Post;
