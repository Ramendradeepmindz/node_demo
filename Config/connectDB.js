import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {

        const DB_OPTION = {
            dbName: "EtoBuy"
        }

        await mongoose.connect(DATABASE_URL, DB_OPTION)

        console.log("Data base connected successfully")

    } catch (error) {

        console.log("Data base connected Fail" + error)



    }



}

export default connectDB