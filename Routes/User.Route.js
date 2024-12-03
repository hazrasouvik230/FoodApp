const express = require('express');
const router = express.Router();
const UserModel = require("../models/User.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

// SignUp
router.post("/signup", async (req, res) => {
    const {name, phone, email, password} = req.body;

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long!" });
    }

    const phoneRegex = /^[0-9]{10,15}$/; // Example: 10-15 digits
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid phone number format!" });
    }

    try {
        const isExist = await UserModel.findOne({email});
        if(isExist) {
            return res.status(400).json({message: "User already exist!"})
        }   
        const hashedPassword = bcrypt.hashSync(password, 10)  ;
        const newUser = new UserModel({name, phone, email, password: hashedPassword});
        await newUser.save();
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({message: "User created successfully!", id: newUser._id, token})
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Signin
router.post("/signin", async (req, res) => {
    const {email, password} = req.body;
    try {
        const isExist = await UserModel.findOne({email});
        if(!isExist) {
            return res.status(400).json({message: "Invalid user"})
        }
        const checkPassword = await bcrypt.compare(password, isExist.password);
        if(!checkPassword) {
            return res.status(400).json({message: "Invalid password"})
        }
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({message: "User login done successfully!", id: isExist._id, name: isExist.name, email: isExist.email, token});
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
})

// Middleware to verify token and extract user info
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details (e.g., email or id) to req
    next();
} catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
}
};

// Updating all fields
router.put("/profile", verifyToken, async (req, res) => {
  const { name, gender, country } = req.body;
  const { email: userEmail } = req.user; // Extract email from token

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { name, gender, country },
      { new: true } // Return updated document
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// Forgot Password Route
router.post("/update-password", async (req, res) => {
    const { email, newPassword } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email and new password are required!" });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long!" });
    }
  
    try {
      const hashedPassword = bcrypt.hashSync(newPassword, 10); // Hash the new password
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });


// Network issue
router.post("/payment", async (req, res) => {
  try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
          return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
          return res.status(403).json({ message: "Invalid token" });
      }

      // Simulate payment logic
      const paymentSuccess = true; // Replace with actual payment processing logic
      if (!paymentSuccess) {
          return res.status(400).json({ message: "Payment processing failed" });
      }

      res.status(200).json({ message: "Payment successful" });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



module.exports = router;
