import dotEnv from "dotenv";
import express from 'express';
dotEnv.config();
import cors from 'cors';
import connectDB from "./Config/connectDB.js";
import routes from "./Routes/routes.js";

const app = express()
app.use(cors())
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
connectDB(DATABASE_URL)
app.use(express.json())

app.use('/api/v1/admin', routes)

app.listen((port), () => {

   console.log("App is Running ")
})

