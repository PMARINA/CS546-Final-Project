const cron = require('node-cron');
const mailer = require('nodemailer');
const user=require('../User/index')
console.log(document.cookie)
/// database goes here 
var users = [
    {
        'id' : 000,
        'name' : 'user1',
        'appointment':"",
        'email' : 'user1@exapmle.com'
    },
    {
        'id' : 001,
        'name' : 'user2',
        'dob' : '15-6-2003',
        'email' : 'user2@exapmle.com'
    },
    {
        'id' : 002,
        'name' : 'user3',
        'dob' : '17-4-2004',
        'email' : 'user3@exapmle.com'
    },
    {
        'id' : 003,
        'name' : 'user4',
        'dob' : '6-0-1999',
        'email' : 'user4@exapmle.com'
    }
]

//// credentials for your Mail
var transporter = mailer.createTransport({
    host: 'YOUR STMP SERVER',
    port: 465,
    secure: true,
    auth: {
        user: 'YOUR EMAIL',
        pass: 'YOUR PASSWORD'
    }
});
//Cron Job to run around 7am Server Time 
cron.schedule('* * 07 * * *', () => {
    const mailOptions = {
        from: 'YOUR EMAIL',
        to: element.email,
        subject: `Appointment successful`,
        html: ``                       
    }
    transporter.sendMail(mailOptions, (error, data) => {
        if (error) {
            console.log(error)
            return
        }
    });
});
