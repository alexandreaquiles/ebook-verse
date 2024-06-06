const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: "cde7da05ccfa90",
        pass: "12478209814bd8"
    }
});

const mailOptions = {
    from: remetente,
    to: destinatario,
    subject: assunto,
    text: corpo
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Email enviado: ' + info.response);
});
