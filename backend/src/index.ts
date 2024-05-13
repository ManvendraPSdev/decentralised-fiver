import express from "express" ;
import userRouter from "./routers/user" ;
import workerRouter from "./routers/worker"
import dotenv from 'dotenv' ; 

dotenv.config() ;
const PORT = process.env.PORT||8005

const app = express() ;

app.use(express.json()) ;

export const JWT_SECRET = '1234';

app.use("/v1/user" , userRouter) ;
app.use("/v1/worker" , workerRouter) ;

app.listen(PORT , ()=>{
    console.log(`server is running on the port : ${PORT}`) ;
})
