const confirmEmailMessage = (email, confirm_link) => {
    mail_subject = 'Twelvepics blog - Please confirm your email address';

    const confirm_html = `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>${mail_subject}</title>
            <style>
            </style>
        </head>
        <body>
            <div>
            <p>
            Hi ${email},
            </p>
            <p>
            Thank you for your subscription to twelvepics blog.<br>
            <b>Please click the link below to confirm your email address:</b>
            <br>
            <a href="${confirm_link}" target="_blank">Confirm email</a>
            </p>
            <p>
            Best regards,
            <br>
            Alain
            </p>
            </div>
        </body>
        </html> 
        `;

    const confirm_text = `
    Hi ${email}\n\n
    Thank you for your registration with twelvepics.\n
    Please click or copy/paste the link below to confirm you email address:\n
    ${confirm_link}\n\n
    Best regards,\n
    Alain
    `;

    return {
        from: process.env.MAIL_EMAIL,
        to: email,
        subject: mail_subject,
        text: confirm_text,
        html: confirm_html,
    };
};

const newSubscriberMessage = (email) => {
    mail_subject = 'Twelvepics blog - New subscriber';

    const new_subscriber_html = `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>${mail_subject}</title>
            <style>
            </style>
        </head>
        <body>
            <div>
            <p>
                New subscriber: ${email}
            </p>
            </div>
        </body>
        </html> 
        `;

    const new_subscriber_text = `Yo my man. New subscriber: ${email}`;

    return {
        from: process.env.MAIL_EMAIL,
        to: process.env.MAIL_EMAIL,
        subject: mail_subject,
        text: new_subscriber_text,
        html: new_subscriber_html,
    };
};

const errorMessage = (error) => {
    mail_subject = 'Twelvepics blog - Api Error';

    const error_text = `
    Yo my man. An api error happened\n\n
    ${error.stack.toString()}
    `;

    return {
        from: process.env.MAIL_EMAIL,
        to: process.env.MAIL_EMAIL,
        subject: mail_subject,
        text: error_text,
    };
};

module.exports = {
    confirmEmailMessage, newSubscriberMessage, errorMessage
};
