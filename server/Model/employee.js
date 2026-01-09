import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
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
    },
    department: {
      type: String,
    },
    joiningDate: {
      type: Date,
    },
    currentDailyRequiredHours: {
      type: Number,
      default: 8,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    machineId: {
      type: Number,
      unique: true,
      sparse: true, // Allows null/undefined to not clash
    },
    role: {
      type: String,
      default: "employee",
    },
  },
  { timestamps: true }
);

// ----------------- PASSWORD HASHING -----------------
employeeSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// ----------------- COMPARE PASSWORD METHOD -----------------
employeeSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
