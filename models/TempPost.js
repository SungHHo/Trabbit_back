class TempPost {
    constructor(id, title, content, author) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.author = author;
    }
  
    static async create({ title, content, author }) {
      const [result] = await db.query(
        'INSERT INTO temp_posts (title, content, author) VALUES (?, ?, ?)',
        [title, content, author]
      );
      return new TempPost(result.insertId, title, content, author);
    }
  
    static async findById(id) {
      const [rows] = await db.query('SELECT * FROM temp_posts WHERE id = ?', [id]);
      if (rows.length > 0) {
        const { id, title, content, author } = rows[0];
        return new TempPost(id, title, content, author);
      } else {
        return null;
      }
    }
  
    static async findAll() {
      const [rows] = await db.query('SELECT * FROM temp_posts');
      return rows.map(row => new TempPost(row.id, row.title, row.content, row.author));
    }
  
    async save() {
      if (this.id) {
        await db.query(
          'UPDATE temp_posts SET title = ?, content = ?, author = ? WHERE id = ?',
          [this.title, this.content, this.author, this.id]
        );
      } else {
        const [result] = await db.query(
          'INSERT INTO temp_posts (title, content, author) VALUES (?, ?, ?)',
          [this.title, this.content, this.author]
        );
        this.id = result.insertId;
      }
    }
  
    static async deleteById(id) {
      const [result] = await db.query('DELETE FROM temp_posts WHERE id = ?', [id]);
      return result.affectedRows > 0;
    }
  }
  
  module.exports = TempPost;
  