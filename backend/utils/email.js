// filepath: /Users/tristanhill/Documents/git/progress-web/backend/utils/email.js
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${firstName}!</h2>
          <p>Thanks for your interest in Progress.</p>
          <p>We appreciate your support and offer to help build and create. A member of our team will be in touch in due course.</p>
          <p>If you have any questions please email <a href="mailto:team@progress.org">team@progress.org</a></p>
          <br>
          <p>Best regards,<br>The Progress Team</p>
        </div>
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
const sendAcceptanceEmail = async (email, firstName) => {
  try {
    // Generate single-use Discord invite
    const inviteLink = await generateDiscordInvite();
    const discordLink = inviteLink || 'https://discord.gg/progress'; // Fallback to static link

    const data = await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: [email],
      subject: 'Congratulations on making Progress!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations on making Progress!</h2>
          <p>Hi ${firstName},</p>
          <p>We would like to invite you to join our Discord group here: <a href="${discordLink}">${discordLink}</a></p>
          <p>When you arrive, pop to the intro channel and take some time to introduce yourself.</p>
          <p>A member of the team will be in contact but feel free to dive straight in!</p>
          <br>
          <p>Welcome to the team,<br>The Progress Team</p>
        </div>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Discord Account Verification</h2>
          <p>You have requested to link your Discord account to your Progress account.</p>
          <p>Your verification code is: <strong style="font-size: 24px; color: #4ECDC4;">${code}</strong></p>
          <p>Please reply to the Discord bot with this code to complete the linking process.</p>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <br>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>The Progress Team</p>
        </div>
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

module.exports = {
  sendFormSubmissionEmail,
  sendAcceptanceEmail,
  sendDiscordVerificationEmail,
  generateDiscordInvite,
};