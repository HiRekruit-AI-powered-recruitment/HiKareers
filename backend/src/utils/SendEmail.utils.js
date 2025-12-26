import { transporter } from "../config/mailer.js";

export const sendMail = async ({ to, subject, text, html }) => {
    const mailOptions = {   
        from: `"hireKruit" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    
    try {
        await transporter.verify();
    } catch (error) {
        console.error("Error verifying SMTP transporter:", error);
        throw error;
    }

    console.log("SMTP ready");
    await transporter.sendMail(mailOptions);
}

