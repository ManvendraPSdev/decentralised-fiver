"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = '1234';
const prismaClient = new client_1.PrismaClient();
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Todo => Add a sign verification logic 
    const hardcodedWalletAddress = '6F1AFk5kzs9Dttmk2jbDruBMWKbjATQpv9SytGxFHp1i';
    //If user verification is done server will return a jwt to the user for the Authentication 
    // IF the user dont exist create one and if it is exist give the jwt to the user , so for that we are using upsert 
    // const user = prismaClient.user.upsert()
    // or we can use the if satement 
    const existingUser = yield prismaClient.user.findFirst({
        where: {
            address: hardcodedWalletAddress
        }
    });
    // If userExist then return the jwt 
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, JWT_SECRET);
        res.json({
            token: token
        });
    }
    //else we create the new user
    else {
        const user = yield prismaClient.user.create({
            data: {
                address: hardcodedWalletAddress
            }
        });
        //Once the user is creates then we create the jwt token for that user 
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        res.json({
            token: token
        });
    }
}));
exports.default = router;
