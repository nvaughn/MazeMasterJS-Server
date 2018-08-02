import express from 'express';
export const defaultRouter = express.Router();

defaultRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Default Route!' });
});

export default defaultRouter;
