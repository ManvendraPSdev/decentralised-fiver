import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = '1234';

const prismaClient = new PrismaClient();


router.post("/signin", async (req, res) => {
    // Todo => Add a sign verification logic 
    const hardcodedWalletAddress = '6F1AFk5kzs9Dttmk2jbDruBMWKbjATQpv9SytGxFHp1i';
    //If user verification is done server will return a jwt to the user for the Authentication 

    // IF the user dont exist create one and if it is exist give the jwt to the user , so for that we are using upsert 
    // const user = prismaClient.user.upsert()

    // or we can use the if satement 
    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: hardcodedWalletAddress
        }
    });
    // If userExist then return the jwt 
    if (existingUser) {
        const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET);
        res.json({
            token: token
        })
    }
    //else we create the new user
    else {
        const user = await prismaClient.user.create({
            data: {
                address: hardcodedWalletAddress
            }
        })
        //Once the user is creates then we create the jwt token for that user 
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({
            token: token
        })
    }
})
export default router;