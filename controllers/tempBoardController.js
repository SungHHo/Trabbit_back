const TempPost = require('../models/TempPost');

exports.saveTempPost = async (req, res) => {
  try {
    const tempPost = await TempPost.create(req.body);
    res.status(201).json(tempPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTempPosts = async (req, res) => {
  try {
    const tempPosts = await TempPost.findAll();
    res.status(200).json(tempPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTempPost = async (req, res) => {
  try {
    const tempPost = await TempPost.findById(req.params.id);
    if (tempPost) {
      res.status(200).json(tempPost);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTempPost = async (req, res) => {
  try {
    const tempPost = await TempPost.findById(req.params.id);
    if (tempPost) {
      tempPost.title = req.body.title;
      tempPost.content = req.body.content;
      tempPost.author = req.body.author;
      await tempPost.save();
      res.status(200).json(tempPost);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTempPost = async (req, res) => {
  try {
    const success = await TempPost.deleteById(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
