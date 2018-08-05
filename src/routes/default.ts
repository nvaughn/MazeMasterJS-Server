import express from 'express';
export const defaultRouter = express.Router();

defaultRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'default route' });
});

export default defaultRouter;
