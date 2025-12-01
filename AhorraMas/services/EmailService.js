
export const EmailService = {
    SERVICE_ID: 'service_eeftgja',
    TEMPLATE_ID: 'template_itfjb55',
    PUBLIC_KEY: 'FJm62UjxixYap-7UW',
    PRIVATE_KEY: 'eQxxh_Mg4eTZw5Gzkr1iv',
    async sendPasswordRecovery(email, name, tempPassword) {
        const data = {
            service_id: this.SERVICE_ID,
            template_id: this.TEMPLATE_ID,
            user_id: this.PUBLIC_KEY,
            accessToken: this.PRIVATE_KEY,
            template_params: {
                to_email: email,
                to_name: name,
                passcode: tempPassword,
                time: '15 minutos',
                email: email
            }
        };

        try {
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorText = await response.text();
                console.error('EmailJS Error:', errorText);
                return { success: false, error: errorText };
            }
        } catch (error) {
            console.error('Network Error:', error);
            return { success: false, error: error.message };
        }
    }
};

export default EmailService;
