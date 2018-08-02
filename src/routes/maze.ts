import express from 'express';
export const mazeRouter = express.Router();

mazeRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Default Mazes Route!' });
});

export default mazeRouter;
