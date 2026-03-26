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
      const id = req.admin.userId;

      const user = await Admin.findById(id);

      if (!user) {
        return res.redirect("/admin/dashboard");
      }

      return res.render("edit_data", {
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
