import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { JWT_SECRET } from '..';
import { authMiddleware } from "../middleware";
import { createTaskInput } from "../types";

const DEFAULT_TITLE = "Select the most clickable Thumbnail"

const s3Client = new S3Client({
    credentials: {
        accessKeyId: "YOUR_ACCESS_KEY_ID",
        secretAccessKey: "YOUR_SECRET_ACCESS_KEY"
    }
});


const router = Router();

const prismaClient = new PrismaClient();

//Let user Create the task 
router.post('/task' , authMiddleware , async (req , res)=>{

    //@ts-ignore
    const userId = req.userId ;

    //Validates the input from the user 
    const body  = req.body() ;
    const parseData = createTaskInput.safeParse(body) ;

    if(!parseData.success){
        return res.status(411).json({
            msg : "invalid input" 
        })
    }

    // Parse the signature here to ensure the person has paid the ammount 

    //else if everything is fine then we start storing data into the database

    //The prismaClient.$transaction function is used to execute multiple database operations within a single transaction.
    //  Here we are creating the task also and the options also 
    
    let response = await prismaClient.$transaction(async tx =>{
        const response = await tx.task.create({
            data : {
                title : parseData.data.title ?? DEFAULT_TITLE ,
                amount : "1" ,
                signature : parseData.data.signature ,
                user_id : userId
            }
        })
        await tx.option.createMany({
            data : parseData.data.options.map(x =>({
                image_url : x.imageUrl , 
                task_id : response.id 
            }))
        })
        return response ;
    })
    res.json({
        id : response.id
    })
})


// This code sets up a route handler for generating a presigned URL for uploading an object to Amazon S3.
//  When a request is made to the /presignedUrl endpoint, it performs authentication checks,
//  creates an S3 client, constructs a command object for uploading the object,
//  and generates a presigned URL for the upload operation
router.get('/presignedUrl',authMiddleware , async (req, res) => {

    // @ts-ignore
    const userId = req.userId ;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'Your-bucket-name',
        Key: `/fiver/${userId}/${Math.random()}/img.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Fields: {
            success_action_status: '201',
            'Content-Type': 'image/png',
        },
        Expires: 3600
      })

    //   console.log({ url, fields }) 
    res.json({
        preSignedUrl : url ,
        fields 
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

function createPresignedPost(s3Client: S3Client, arg1: { Bucket: string; Key: string; Conditions: (string | number)[][]; Fields: { success_action_status: string; 'Content-Type': string; }; Expires: number; }): { url: any; fields: any; } | PromiseLike<{ url: any; fields: any; }> {
    throw new Error("Function not implemented.");
}
