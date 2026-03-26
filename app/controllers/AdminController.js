const Admin = require("../models/admin");

const bcrypt = require("bcryptjs");

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

  async editAdminProfile(req, res) {
    try {
      console.log(req.admin);
      const id = req.admin._id;
      const user = await Admin.findById(id);

      return res.render("edit_data", {
        title: "Admin profile page",
        data: user,
      });
    } catch (err) {
      return res.redirect("/admin/dashboard");
    }
  }

  //update admin
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
      const { id } = req.params;

      // 🔒 Only admin allowed
      if (req.admin?.is_admin !== "admin") {
        req.flash("error", "Unauthorized access");
        return res.redirect("/admin/login");
      }

      // 🚫 Prevent self delete
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
