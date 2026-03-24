const User = require("../models/user");

const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

class UserController {
  async CreateUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existUser = await User.findOne({ email });

      if (existUser) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user already exist",
        });
      }

      const salt = await bcrypt.genSalt(10);

      const hasgpassword = await bcrypt.hash(password, salt);

      const userdata = new User({
        name,
        email,
        password: hasgpassword,
      });

      const data = await userdata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "user registered successfull!!",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  //login User
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user not found",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "password does not match",
        });
      }

      if (user) {
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" },
        );

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "user login successfull!!",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
          },
          token: token,
        });
      } else {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user not found",
        });
      }
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // create record
  async createData(req, res) {
    try {
      const user = req.user; // Get from auth middleware

      if (!user) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized. Please login.",
        });
      }

      const { name, email, password } = req.body;

      const data = new User({
        name,
        email,
        password,
      });

      const product = await data.save();

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Data created successfully.",
        data: product,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  //view record
  async viewData(req, res) {
    try {
      const data = await User.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "data listing is here",
        total: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // async update record
  async updateData(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      // Handle logic
      res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "data updated successfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // delete product
  async deleteData(req, res) {
    try {
      const id = req.params.id;

      const data = await User.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "data deleted succesfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}



module.exports = new UserController();