import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { JWT_SECRET } from '..';
import { authMiddleware } from "../Middleware";

const s3Client = new S3Client({
    credentials: {
        accessKeyId: "YOUR_ACCESS_KEY_ID",
        secretAccessKey: "YOUR_SECRET_ACCESS_KEY"
    }
});


const router = Router();

const prismaClient = new PrismaClient();

// This code sets up a route handler for generating a presigned URL for uploading an object to Amazon S3.
//  When a request is made to the /presignedUrl endpoint, it performs authentication checks,
//  creates an S3 client, constructs a command object for uploading the object,
//  and generates a presigned URL for the upload operation
router.get('/presignedUrl',authMiddleware , async (req, res) => {

    // @ts-ignore
    const userId = req.userId ;

    const command = new PutObjectCommand({
        Bucket: "Your-bucket-name",
        Key: `/fiver/${userId}/${Math.random()}/img.jpg` ,
        ContentType : "img/jpg"
    })
    const preSignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
    })

    console.log(preSignedUrl);
    res.json({
        preSignedUrl 
    })

})


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