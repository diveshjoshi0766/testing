const nodemailer = require('nodemailer');

module.exports.sendEmail = (data) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: 'your-email@gmail.com',     
        to: 'recipient-email@example.com', 
        subject: 'Automated Email',     
        text: data                      
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
};
