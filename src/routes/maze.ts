import express from 'express';
import DataAccessObject_TingoDB from '../lib/DAO_TingoDB';
export const mazeRouter = express.Router();

mazeRouter.get('/listAll', (req, res) => {
    let dao = DataAccessObject_TingoDB.getInstance();
    res.status(200).json({ message: '/maze default route' });
});

mazeRouter.get('/', (req, res) => {
    res.status(200).json({ message: '/maze default route' });
});

export default mazeRouter;
