const transporter = require("../config/emailConfig");

const sendEmail = async (user,password) => {
  try {

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your Account Password",
      text: ``,
      html: `
      <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px;">
        
        <tr>
          <td style="background:#4f46e5; padding:20px; text-align:center; color:#fff;">
            <h1>Your Login Password</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:30px;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p>Your account is ready. Use this password to login:</p>

            <div style="text-align:center; margin:20px;">
              <span style="background:#4f46e5; color:#fff; padding:10px 20px; font-size:20px; border-radius:6px;">
                ${password}
              </span>
            </div>

            <p style="font-size:12px; color:gray;">
              Change this password after login.
            </p>
          </td>
        </tr>

      </table>
      `,
    });

    return password;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = sendEmail;
