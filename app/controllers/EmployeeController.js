const Admin = require("../models/admin");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const StatusCode = require("../utils/StatusCode");

const genPass = require("../utils/genPassword");

class EmployeeController {
  async UserCheckAuth(req, res, next) {
    try {
      if (req.user) {
        next();
      } else {
        res.redirect("/login/view");
      }
    } catch (error) {
      req.flash("error", error.message);
    }
  }

  //register view
  signupPage(req, res) {
    res.render("signup", {
      title: "Signup Page",
    });
  }

  // Login page
  async loginPage(req, res) {
    res.render("login", {
      title: "Login Page",
    });
  }

  // Password view page
  async passChange(req, res) {
    res.render("password_change", {
      title: "Password Change Page",
    });
  }

  async Signup(req, res) {
    try {
      const { name, email, phone, role } = req.body;

      if (!name || !email || !phone || !role) {
        req.flash("error", "All fields are required");

        return res.redirect("/signup/view");
      }

      const existUser = await Admin.findOne({ email });

      if (existUser) {
        return res.render("signup", {
          title: "Signup Page",
          message: "User already exists",
        });
      }

      // Generate password
      const password = genPass;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userdata = await Admin.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      });

      // Send email with credentials
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASS,
        },
      });

      const baseUrl = req.protocol + "://" + req.get("host");
      const loginUrl = baseUrl + "/login/view";

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Login Credentials",
        html: `
          <!-- Header --> <div style="background: linear-gradient(135deg, #4e73df, #224abe); color: #fff; padding: 20px; text-align: center;"> <h2 style="margin: 0;">Welcome 🎉</h2> <p style="margin: 5px 0 0; font-size: 14px;">Employee Management System</p> </div> <!-- Body --> <div style="padding: 25px;"> <p style="font-size: 15px; color: #333;">Hi,</p> <p style="font-size: 14px; color: #555;"> Your account has been successfully created. Use the credentials below to log in: </p> <!-- Credentials Box --> <div style="background: #f8f9fc; border: 1px solid #e3e6f0; border-radius: 8px; padding: 15px; margin: 20px 0;"> <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p> <p style="margin: 8px 0;"><strong>Password:</strong> ${password}</p> </div> <!-- Warning --> <p style="font-size: 13px; color: #e74a3b; margin-bottom: 15px;"> ⚠️ For security reasons, please change your password immediately after your first login. </p> <!-- CTA Button --> <div style="text-align: center; margin: 20px 0;"> <a href="${loginUrl}" style="background: #4e73df; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;"> Login Now </a> </div> <p style="font-size: 13px; color: #777;"> If you did not request this account, please contact your administrator. </p> </div> <!-- Footer --> <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;"> © 2026 Employee Management System. All rights reserved. </div>
        `,
      });

      return res.redirect("/login/view");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/signup/view");
    }
  }

  //login User
  async empLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "Email & Passwords are required");

        return res.redirect("/login/view");
      }

      const user = await Admin.findOne({ email });

      if (!user) {
        req.flash("error", "Invalid Credentials");

        return res.redirect("/login/view");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        req.flash("error", "Password does not match");

        return res.redirect("/login/view");
      }

      if (user.isActive === "Inactive") {
        req.flash("error", "Your account is blocked. Contact admin.");
        return res.redirect("/login/view");
      }

      const token = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" },
      );

      if (token) {
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
      }

      // 🔐 First login case
      if (user.firstLogin) {
        req.flash("success", "Login Successfull & Password change required");

        return res.redirect("/change-pass/view");
      }

      req.flash("success", "Welcome To Dashboard Successfully");

      return res.redirect("/dashboard");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/login/view");
    }
  }

  async EmpChangePassword(req, res) {
    try {
      const { password } = req.body;

      if (!password || password.length < 8) {
        req.flash("error", "Invalid Credentials");

        return res.redirect("/change-pass/view");
      }

      // 🔐 Get userId from token (NOT from body)
      const userId = req.user.userId;

      const user = await Admin.findById(userId);

      if (!user) {
        req.flash("error", "User not found");

        return res.redirect("/change-pass/view");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;

      user.firstLogin = false; //Disable first login flag

      await user.save();

      res.clearCookie("token");

      req.flash(
        "success",
        "Password updated successfully. Please login again.",
      );

      return res.redirect("/login/view");
    } catch (error) {
      console.error("Change Password Error:", error);

      req.flash("error", error.message);

      return res.redirect("/change-pass/view");
    }
  }

  // dashboard page
  async dashboard(req, res) {
    try {
      const data = await Admin.findById(req.user.userId);

      if (!data) {
        return res.render("dashboard", {
          title: "Employee Dashboard Not Found",
          data: null,
        });
      }

      res.render("dashboard", {
        title: "Employee Dashboard Page",
        data: data,
      });
    } catch (error) {
      req.flash("error", "Error loading dashboard");

      res.status(500).send("Error loading dashboard");
    }
  }

  // logout user
  async logoutUser(req, res) {
    try {
      // clear cookie
      res.clearCookie("token");

      return res.redirect("/login/view");
    } catch (error) {
      req.flash("error", error.message);
    }
  }
}

module.exports = new EmployeeController();
