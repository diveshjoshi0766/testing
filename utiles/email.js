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
        from: process.env.EMAIL_USER,    
        to: data.to,                     
        subject: data.subject,                  
        text: data.text                  
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
};
