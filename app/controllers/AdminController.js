const Admin = require("../models/admin");

const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");


class AdminController {
  async AdminCheckAuth(req, res, next) {
    try {
      if (req.admin) {
        next();
      } else {
        res.redirect("/admin/login");
      }
    } catch (error) {
      req.flash("error", error.message);
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

  // admin login
  async adminLogin(req, res) {
    try {
      console.log("BODY:", req.body);

      // Get user input
      const { email, password } = req.body;

      // Validate user input
      if (!email || !password) {
        console.log("All input is required");

        return res.redirect("/admin/login");
      }

      // Validate if user exist in our database
      const user = await Admin.findOne({ email });

      if (
        user &&
        user.role === "admin" &&
        (await bcrypt.compare(password, user.password))
      ) {
        // Create token
        const token = jwt.sign(
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1d",
          },
        );

        if (token) {
          res.cookie("admintoken", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          });

          return res.redirect("/admin/dashboard");
        } else {
          req.flash("error", "Login failed");

          return res.redirect("/admin/login");
        }
      }

      req.flash("error", "Invalid email or password");

      return res.redirect("/admin/login");
    } catch (error) {
      req.flash("error", "Something went wrong");

      return res.redirect("/admin/login");
    }
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

  // logout user
  async adminLogout(req, res) {

    try {
      // clear cookie
      res.clearCookie("admintoken");

      return res.redirect("/admin/login");

    } catch (error) {

      req.flash("error", error.message);
    }
  }
}



module.exports = new AdminController();