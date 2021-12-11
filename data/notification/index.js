const nodemailer = require("nodemailer");

async function notification(email) {
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
    subject: "Hello", // Subject line
    text: 'Hello world?', // plain text body
    html: `<h1>Hello world</h1>`, // html body
  });
  
}catch(e){
    console.log(e)
}
}

module.exports = {notification};