//models/post.js

const db = require("../config/database");

let conn;

const connectToDatabase = async () => {
  try {
    conn = await db.init(); // init 함수 호출
    console.log("Database connected successfully");
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

  createPost: function (data, callback) {
    const { title, content, author_id, category_id } = data;
    const sql =
      "INSERT INTO posts (title, content, author_id, category_id, created_at) VALUES (?, ?, ?, ?, NOW())";
    return conn.query(sql, [title, content, author_id, category_id], callback);
  },

  getPostById: function (post_id, callback) {
    const sql = "SELECT * FROM posts WHERE post_id = ?";
    return conn.query(sql, [post_id], callback);
  },

  updatePost: function (data, callback) {
    const { post_id, author_id, title, content } = data;
    const sql =
      "UPDATE posts SET author_id = ?, title = ?, content = ? WHERE post_id = ?";
    return conn.query(sql, [author_id, title, content, post_id], callback);
  },

  deletePost: function (post_id, callback) {
    const sql = "DELETE FROM posts WHERE post_id = ?";
    return conn.query(sql, [post_id], callback);
  },

  createComment: function (data, callback) {
    const { post_id, content, author_id } = data;
    const sql =
      "INSERT INTO comments (post_id, content, author_id, created_at) VALUES (?, ?, ?, NOW())";
    return conn.query(sql, [post_id, content, author_id], callback);
  },

  checkRecommendationStatus: function (data, callback) {
    const { userId, commentId } = data;
    const sql =
      "SELECT FIND_IN_SET(?, recommendations) AS recommended FROM comments WHERE id = ?";
    return conn.query(sql, [userId, commentId], callback);
  },

  recommendComment: function (data, callback) {
    const { userId, commentId } = data;
    const sql =
      "UPDATE comments SET recommendations = IF(recommendations IS NULL OR recommendations = '', ?, CONCAT(recommendations, ',',?)) WHERE id = ?";
    return conn.query(sql, [userId, userId, commentId], callback);
  },
};

module.exports = Post;
