import express from 'express';
let router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Default Mazes Route!' });
});

module.exports = router;
