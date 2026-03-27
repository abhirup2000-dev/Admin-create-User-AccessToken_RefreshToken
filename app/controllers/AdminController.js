const Admin = require("../models/admin");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const StatusCode = require("../utils/StatusCode");

const genPass = require("../utils/genPassword");

class AdminController {
  async AdminCheckAuth(req, res, next) {
    try {
      if (req.admin) {
        next();
      } else {
        res.redirect("/admin/login");
      }
    } catch (error) {
      req.flash("error:", error.message);
    }
  }

  adminLoginPage(req, res) {
    res.render("admin/admin_login", {
      title: "Admin Login Page",
    });
  }

  adminDashboardPage(req, res) {
    res.render("admin/admin_login", {
      title: "Admin Login Page",
    });
  }

  signupUser(req, res) {
    res.render("admin/create_employee_register", {
      title: "Create Employee Page",
    });
  }


  // dashboard page
  async adminDashboard(req, res) {
    try {
      const data = await Admin.find();

      res.render("admin/admin_dashboard", {
        title: "Admin Dashboard Page",
        data: data,
      });
    } catch (error) {
      req.flash("error", "Error loading dashboard");

      res.status(500).send("Error loading dashboard");
    }
  }

  
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "All input is required");
        return res.redirect("/admin/login");
      }

      const user = await Admin.findOne({ email });

      if (
        !user ||
        user.role !== "admin" ||
        !(await bcrypt.compare(password, user.password))
      ) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/admin/login");
      }

      //  ACCESS TOKEN (short)
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1m" },
      );

      //  REFRESH TOKEN (long)
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET_KEY,
        { expiresIn: "7d" },
      );

      //  Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      //  Cookies
      res.cookie("adminAccessToken", accessToken, {
        httpOnly: true,
        maxAge: 1 * 60 * 1000,
      });

      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      return res.redirect("/admin/login");
    }
  }


  async editAdminProfile(req, res) {
    try {
      const id = req.admin.userId;

      const user = await Admin.findById(id);

      if (!user) {
        return res.redirect("/admin/dashboard");
      }

      return res.render("admin/admin_profile", {
        title: "Admin Profile",
        data: user,
      });
    } catch (err) {
      console.log(err);
      return res.redirect("/admin/dashboard");
    }
  }

  async updateAdminData(req, res) {
    try {
      const user = await Admin.findById(req.params.id);

      if (!user) {
        return res.redirect("/admin/login");
      }

      // Handle password update
      if (req.body.password && req.body.password.trim() !== "") {
        if (req.body.password.length < 6) {
          return res.redirect(`/admin/edit/${req.admin._id}`);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      // Remove password from req.body to prevent overwrite
      delete req.body.password;

      // Update other fields
      Object.assign(user, req.body);

      // Save updated user
      await user.save();

      res.redirect("/admin/dashboard");
    } catch (error) {
      req.flash(error, "Error in edit record");
    }
  }


  //user actions(createuser && blockuser && deleteuser)
  async createUser(req, res) {
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
  
        return res.redirect("/admin/dashboard");
      } catch (error) {
        req.flash("error", error.message);
  
        return res.redirect("/signup/view");
      }
    }


  async deactivateUser(req, res) {
    try {
      const user = await Admin.findById(req.params.id);

      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/admin/dashboard");
      }

      //Toggle between Active & Inactive
      user.isActive = user.isActive === "Active" ? "Inactive" : "Active";

      await user.save();

      req.flash("success", `User is now ${user.isActive}`);

      return res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error);
      req.flash("error", "Error updating user status");
      return res.redirect("/admin/dashboard");
    }
  }

  async deleteUser(req, res) {
    try {
      const id = req.params.id;

      //  Only admin allowed
      if (req.admin?.role !== "admin") {
        req.flash("error", "Unauthorized access");
        return res.redirect("/admin/login");
      }

      //  Prevent self delete
      if (req.admin.userId === id) {
        req.flash("error", "You cannot delete yourself");
        return res.redirect("/admin/dashboard");
      }

      const user = await Admin.findById(id);

      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/admin/dashboard");
      }

      // Optional: prevent deleting another admin
      if (user.is_admin === "admin") {
        req.flash("error", "Cannot delete another admin");
        return res.redirect("/admin/dashboard");
      }

      //Hard delete
      await Admin.findByIdAndDelete(id);

      req.flash("success", "Employee deleted successfully");
      return res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Delete Error:", error);
      req.flash("error", "Something went wrong");
      return res.redirect("/admin/dashboard");
    }
  }

  // logout user
  async logout(req, res) {
    const refreshToken = req.cookies?.adminRefreshToken;

    if (refreshToken) {
      const user = await Admin.findOne({ refreshToken });

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.clearCookie("adminAccessToken");
    res.clearCookie("adminRefreshToken");

    return res.redirect("/admin/login");
  }
}

module.exports = new AdminController();
