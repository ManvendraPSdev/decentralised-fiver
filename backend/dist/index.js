"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routers/user"));
const worker_1 = __importDefault(require("./routers/worker"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 8005;
const app = (0, express_1.default)();
app.use("/v1/user", user_1.default);
app.use("/v1/worker", worker_1.default);
app.listen(PORT, () => {
    console.log(`server is running on the port : ${PORT}`);
});
