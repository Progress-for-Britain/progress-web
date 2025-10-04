const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Send email for form submission acknowledgment
const sendFormSubmissionEmail = async (email, firstName) => {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: [email],
      subject: 'Thanks for your interest in Progress',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Progress - Application Received</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              color: #1e293b;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              padding: 48px 40px;
              text-align: center;
              position: relative;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: -0.025em;
            }
            
            .content {
              padding: 48px 40px;
            }
            
            .content h2 {
              margin: 0 0 16px 0;
              font-size: 24px;
              font-weight: 600;
              color: #1e293b;
            }
            
            .content p {
              margin: 0 0 20px 0;
              font-size: 16px;
              color: #64748b;
              line-height: 1.7;
            }
            
            .highlight {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            
            .highlight p {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #92400e;
            }
            
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 32px 0;
              box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
              transition: all 0.2s ease;
            }
            
            .button:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
            }
            
            .footer {
              background: #f8fafc;
              padding: 32px 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
              margin: 0;
              font-size: 14px;
              color: #64748b;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 12px;
              }
              
              .header {
                padding: 32px 24px;
              }
              
              .header h1 {
                font-size: 24px;
              }
              
              .content {
                padding: 32px 24px;
              }
              
              .content h2 {
                font-size: 20px;
              }
              
              .highlight {
                padding: 20px;
              }
              
              .button {
                padding: 14px 28px;
                font-size: 15px;
              }
              
              .footer {
                padding: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Progress</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              <p>Thank you for your interest in Progress. We truly appreciate your support and enthusiasm for helping us build something meaningful.</p>
              <p>A member of our team will be in touch with you soon to discuss next steps.</p>
              <div class="highlight">
                <p>If you have any questions in the meantime, feel free to reach out to us at <strong>team@progress.org</strong></p>
              </div>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Progress Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Form submission email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending form submission email:', error);
    return { success: false, error: error.message };
  }
};

// Send email for application acceptance
const sendAcceptanceEmail = async (email, firstName, accessCode) => {
  try {
    // Generate single-use Discord invite
    const inviteLink = await generateDiscordInvite();
    const discordLink = inviteLink || 'https://discord.gg/progress'; // Fallback to static link

    const data = await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: [email],
      subject: 'Congratulations on making Progress!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Progress - Application Approved</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              color: #1e293b;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              padding: 48px 40px;
              text-align: center;
              position: relative;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: -0.025em;
            }
            
            .content {
              padding: 48px 40px;
            }
            
            .content h2 {
              margin: 0 0 16px 0;
              font-size: 24px;
              font-weight: 600;
              color: #1e293b;
            }
            
            .content p {
              margin: 0 0 20px 0;
              font-size: 16px;
              color: #64748b;
              line-height: 1.7;
            }
            
            .access-code {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            
            .access-code .code {
              font-size: 32px;
              font-weight: 700;
              color: #92400e;
              letter-spacing: 2px;
              margin: 8px 0;
            }
            
            .access-code .label {
              font-size: 14px;
              color: #92400e;
              font-weight: 500;
            }
            
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 16px 8px;
              box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
              transition: all 0.2s ease;
            }
            
            .button:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
            }
            
            .highlight {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border: 1px solid #3b82f6;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            
            .highlight p {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #1e40af;
            }
            
            .footer {
              background: #f8fafc;
              padding: 32px 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
              margin: 0;
              font-size: 14px;
              color: #64748b;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 12px;
              }
              
              .header {
                padding: 32px 24px;
              }
              
              .header h1 {
                font-size: 24px;
              }
              
              .content {
                padding: 32px 24px;
              }
              
              .content h2 {
                font-size: 20px;
              }
              
              .access-code {
                padding: 20px;
              }
              
              .access-code .code {
                font-size: 28px;
              }
              
              .button {
                padding: 14px 28px;
                font-size: 15px;
                margin: 8px 4px;
              }
              
              .highlight {
                padding: 20px;
              }
              
              .footer {
                padding: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Progress</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${firstName}!</h2>
              <p>Your application has been approved! We're excited to have you join our community.</p>
              <p>To complete your registration, please visit our registration page and use the following access code:</p>
              
              <div class="access-code">
                <p class="label">Your Access Code</p>
                <p class="code">${accessCode}</p>
                <p class="label">Expires in 30 days</p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://progressforbritain.org/register" class="button">Register Now</a>
              </div>
              
              <p>Once registered, we'd love for you to join our Discord community:</p>
              
              <div style="text-align: center; margin: 16px 0;">
                <a href="${discordLink}" class="button">Join Discord</a>
              </div>
              
              <div class="highlight">
                <p>When you arrive, please introduce yourself in the intro channel. A team member will be in touch soon!</p>
              </div>
            </div>
            <div class="footer">
              <p>Welcome to the team,<br>The Progress Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Acceptance email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending acceptance email:', error);
    return { success: false, error: error.message };
  }
};

// Send email for Discord account verification
const sendDiscordVerificationEmail = async (email, code) => {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: [email],
      subject: 'Discord Account Verification Code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Progress - Discord Verification</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              color: #1e293b;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              padding: 48px 40px;
              text-align: center;
              position: relative;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: -0.025em;
            }
            
            .content {
              padding: 48px 40px;
            }
            
            .content h2 {
              margin: 0 0 16px 0;
              font-size: 24px;
              font-weight: 600;
              color: #1e293b;
            }
            
            .content p {
              margin: 0 0 20px 0;
              font-size: 16px;
              color: #64748b;
              line-height: 1.7;
            }
            
            .verification-code {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            
            .verification-code .code {
              font-size: 32px;
              font-weight: 700;
              color: #92400e;
              letter-spacing: 2px;
              margin: 8px 0;
            }
            
            .verification-code .label {
              font-size: 14px;
              color: #92400e;
              font-weight: 500;
            }
            
            .warning {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              border: 1px solid #dc2626;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            
            .warning p {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #991b1b;
            }
            
            .footer {
              background: #f8fafc;
              padding: 32px 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
              margin: 0;
              font-size: 14px;
              color: #64748b;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 12px;
              }
              
              .header {
                padding: 32px 24px;
              }
              
              .header h1 {
                font-size: 24px;
              }
              
              .content {
                padding: 32px 24px;
              }
              
              .content h2 {
                font-size: 20px;
              }
              
              .verification-code {
                padding: 20px;
              }
              
              .verification-code .code {
                font-size: 28px;
              }
              
              .warning {
                padding: 20px;
              }
              
              .footer {
                padding: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Progress</h1>
            </div>
            <div class="content">
              <h2>Discord Account Verification</h2>
              <p>You have requested to link your Discord account to your Progress account.</p>
              <p>Please reply to the Discord bot with the following verification code:</p>
              
              <div class="verification-code">
                <p class="label">Your Verification Code</p>
                <p class="code">${code}</p>
                <p class="label">Expires in 10 minutes</p>
              </div>
              
              <div class="warning">
                <p>This code will expire in 10 minutes. Please use it promptly.</p>
              </div>
              
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Progress Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Discord verification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending Discord verification email:', error);
    return { success: false, error: error.message };
  }
};

// Generate single-use Discord invite link
const generateDiscordInvite = async () => {
  try {
    const { Client, GatewayIntentBits } = require('discord.js');
    
    // Create a temporary client for invite generation
    const tempClient = new Client({
      intents: [GatewayIntentBits.Guilds]
    });

    await tempClient.login(process.env.DISCORD_BOT_TOKEN);
    
    const guild = await tempClient.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const channel = guild.channels.cache.find(ch => ch.type === 0); // Text channel
    
    if (!channel) {
      throw new Error('No suitable channel found for invite');
    }

    const invite = await channel.createInvite({
      maxUses: 1,
      maxAge: 86400, // 24 hours
      unique: true
    });

    await tempClient.destroy();
    
    return `https://discord.gg/${invite.code}`;
  } catch (error) {
    console.error('Error generating Discord invite:', error);
    return null;
  }
};

// Test function to send sample emails
const sendTestEmails = async (testEmail) => {
  try {
    console.log('Sending test emails to:', testEmail);
    
    // Test form submission email
    const formResult = await sendFormSubmissionEmail(testEmail, 'Test User');
    console.log('Form submission email result:', formResult);
    
    // Test acceptance email with sample access code
    const acceptanceResult = await sendAcceptanceEmail(testEmail, 'Test User', 'ABCD1234');
    console.log('Acceptance email result:', acceptanceResult);
    
    // Test Discord verification email
    const discordResult = await sendDiscordVerificationEmail(testEmail, '123456');
    console.log('Discord verification email result:', discordResult);
    
    return { success: true, message: 'Test emails sent successfully' };
  } catch (error) {
    console.error('Error sending test emails:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendFormSubmissionEmail,
  sendAcceptanceEmail,
  sendDiscordVerificationEmail,
  generateDiscordInvite,
  sendTestEmails,
};