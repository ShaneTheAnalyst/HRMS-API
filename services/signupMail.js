const nodemailer = require("nodemailer");

const mailContent = (fullName, email, username, roles) => `
<style>

</style>

<p>Hello ${fullName},</p>
  <p class="welcome">Your account has successfully been created! You now have access to our HR Management System, where you can easily manage your HR-related tasks and stay updated on company policies.</p>

  <p>Login Details:</p>

  <p>Username: ${username}</p>
  <p>Email: ${email}</p>
  <p>Password: Test123.</p>
  <p>Roles: ${roles}</p>

  <p>If you have any questions, feel free to reach out to our HR team.</p>

  <p>Welcome aboard!</p>
  <p>HR Management System</p>
`;

const signupMail = async (fullName, email, username, roles) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Welcome to HR Management System",
    html: mailContent(fullName, email, username, roles),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email successfully sent:", info.response);
  } catch (err) {
    console.log("Error sending email:", err);
  }
};

module.exports = signupMail;
