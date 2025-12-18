import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
    },
    employeeName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;