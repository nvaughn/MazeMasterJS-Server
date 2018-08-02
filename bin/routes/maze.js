"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
exports.mazeRouter = express_1.default.Router();
exports.mazeRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Default Mazes Route!' });
});
exports.default = exports.mazeRouter;
//# sourceMappingURL=maze.js.map