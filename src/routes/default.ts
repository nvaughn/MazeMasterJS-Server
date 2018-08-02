//const routes = require('express').Router();
import express from 'express';
let router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Default Route!' });
});

module.exports = router;
