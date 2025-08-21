/**
 * @fileOverview A mock email sending service.
 * In a real application, this would be replaced with a real email provider like SendGrid, Resend, etc.
 */

type EmailPayload = {
    to: string;
    subject: string;
    body: string;
};

/**
 * Sends an email.
 * This is a mock implementation that logs the email to the console.
 * @param payload - The email payload.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
    console.log('====================================');
    console.log('📧 Sending Email (Mock)...');
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log('------------------------------------');
    console.log(`Body:\n${payload.body}`);
    console.log('====================================');
    // In a real implementation, you would use an email sending library here.
    // For example, using Nodemailer, SendGrid, or AWS SES.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
}
