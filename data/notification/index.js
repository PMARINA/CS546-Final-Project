const nodemailer = require("nodemailer");

async function reset(email) {
  try{
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "stevens.DuckWash@gmail.com", 
      pass: "stevensduckwash", 
    },
  });
  await transporter.sendMail({
    from: "stevens.DuckWash@gmail.com", 
    to: email, 
    subject: "Reset Password", // Subject line
    //text: 'Hello world?', // plain text body
    html: `<p>Hello,</p>
    <p>You received this email because you requested to reset your password. If it is not your own operation, please contact the administrator as soon as possible. You can reset your password by clicking the link below.</p>
    <a href="http://localhost:3000/reset">Reset your password now.</a> `, // html body
  });
}catch(e){
    console.log(e)
}
}
async function notification(name,time,email) {
    try{
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "stevens.DuckWash@gmail.com", 
        pass: "stevensduckwash", 
      },
    });
    await transporter.sendMail({
      from: "stevens.DuckWash@gmail.com", 
      to: email, 
      subject: "Reset Password", // Subject line
      html: `<p>Hello,</p>
      <p>You successfully booked ${name} at ${time}`, // html body
    });
  }catch(e){
      console.log(e)
  }
}



module.exports = {reset,notification};