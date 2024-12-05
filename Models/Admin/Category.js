import mongoose from "mongoose";
// Define the schema for the Cat
const catSchema = new mongoose.Schema({
  Cat_Name: {
    type: String,
    required: true,
    default:"",
    
    
  },
  Cat_Image: {
    type: String, // URL or file path for the image
    required: true,
      default:""
  },
  Cat_Status: {
    type: String,
    enum: ['Active', 'Inactive', 'Adopted'], // Example statuses
    default: 'Active',
  },
  Cat_Date: {
    type: Date,
    default: Date.now,
  },
});

// Create the model using the schema
const CategoryDetails = mongoose.model("category", catSchema);
export default CategoryDetails;
