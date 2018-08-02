"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
exports.defaultRouter = express_1.default.Router();
exports.defaultRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Default Route!' });
});
exports.default = exports.defaultRouter;
//# sourceMappingURL=default.js.map