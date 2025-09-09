// filepath: /Users/tristanhill/Documents/git/progress-web/backend/utils/discordBot.js
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const prisma = require('./prisma');
const { sendDiscordVerificationEmail } = require('./email');
const crypto = require('crypto');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Generate 4-digit verification code
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Handle DM messages
client.on('messageCreate', async (message) => {
  // Ignore messages from bots and messages not in DMs
  if (message.author.bot || message.guild) return;

  const content = message.content.toLowerCase().trim();

  if (content === 'link') {
    await handleLinkCommand(message);
  } else if (content === 'unlink') {
    await handleUnlinkCommand(message);
  } else if (content.length === 4 && /^\d{4}$/.test(content)) {
    await handleVerificationCode(message);
  } else {
    await sendHelpMessage(message);
  }
});

// Handle 'link' command
async function handleLinkCommand(message) {
  try {
    // Check if user is already linked
    const existingUser = await prisma.user.findUnique({
      where: { discordUsername: message.author.username }
    });

    if (existingUser) {
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Already Linked')
        .setDescription('Your Discord account is already linked to a Progress account.')
        .setFooter({ text: 'Use "unlink" to disconnect your account' });

      await message.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#4ECDC4')
      .setTitle('Link Your Account')
      .setDescription('Please reply with your email address associated with your Progress account.')
      .setFooter({ text: 'Type your email address below' });

    await message.reply({ embeds: [embed] });

    // Set up collector for email response
    const filter = (m) => m.author.id === message.author.id && !m.author.bot;
    const collector = message.channel.createMessageCollector({ filter, time: 300000 }); // 5 minutes

    collector.on('collect', async (emailMessage) => {
      const email = emailMessage.content.trim().toLowerCase();

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('Invalid Email')
          .setDescription('Please provide a valid email address.');

        await emailMessage.reply({ embeds: [errorEmbed] });
        return;
      }

      // Check if email exists in users table
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('Email Not Found')
          .setDescription('No Progress account found with this email address.');

        await emailMessage.reply({ embeds: [errorEmbed] });
        return;
      }

      // Check if email is already linked to another Discord account
      if (user.discordUsername) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('Email Already Linked')
          .setDescription('This email is already linked to another Discord account.');

        await emailMessage.reply({ embeds: [errorEmbed] });
        return;
      }

      // Generate verification code
      const code = generateVerificationCode();

      // Store verification code
      await prisma.discordVerificationCode.create({
        data: {
          code,
          email,
          discordUserId: message.author.id,
          discordUsername: message.author.username,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        }
      });

      // Send verification email
      const emailResult = await sendDiscordVerificationEmail(email, code);

      if (emailResult.success) {
        const successEmbed = new EmbedBuilder()
          .setColor('#4ECDC4')
          .setTitle('Verification Code Sent')
          .setDescription('I\'ve sent a verification code to your email. Please reply with the 4-digit code to complete the linking process.')
          .setFooter({ text: 'The code expires in 10 minutes' });

        await emailMessage.reply({ embeds: [successEmbed] });
      } else {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('Email Error')
          .setDescription('Failed to send verification email. Please try again later.');

        await emailMessage.reply({ embeds: [errorEmbed] });
      }

      collector.stop();
    });

  } catch (error) {
    console.error('Error handling link command:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('Error')
      .setDescription('An error occurred. Please try again later.');

    await message.reply({ embeds: [errorEmbed] });
  }
}

// Handle verification code
async function handleVerificationCode(message) {
  try {
    const code = message.content.trim();

    // Find verification code
    const verificationCode = await prisma.discordVerificationCode.findUnique({
      where: { code }
    });

    if (!verificationCode) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Invalid Code')
        .setDescription('This verification code is invalid.');

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    // Check if code belongs to this Discord user
    if (verificationCode.discordUserId !== message.author.id) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Invalid Code')
        .setDescription('This verification code is not for your account.');

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    // Check if code is expired
    if (new Date() > verificationCode.expiresAt) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Code Expired')
        .setDescription('This verification code has expired. Please start the linking process again.');

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    // Check if code is already used
    if (verificationCode.used) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Code Already Used')
        .setDescription('This verification code has already been used.');

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    // Link the accounts
    await prisma.$transaction(async (tx) => {
      // Update user with Discord info
      await tx.user.update({
        where: { email: verificationCode.email },
        data: {
          discordUsername: verificationCode.discordUsername,
          discordLinkedAt: new Date(),
        }
      });

      // Mark verification code as used
      await tx.discordVerificationCode.update({
        where: { code },
        data: {
          used: true,
          usedAt: new Date(),
        }
      });
    });

    // Assign Discord roles based on app roles[]
    try {
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      if (guild) {
        const member = await guild.members.fetch(message.author.id);

        // Fetch user to get roles[]
        const user = await prisma.user.findUnique({
          where: { email: verificationCode.email },
          select: { roles: true }
        });

        if (!user) {
          throw new Error('User not found during Discord role sync');
        }

        const roleEnvMap = {
          ADMIN: process.env.DISCORD_ADMIN_ROLE_ID,
          ONBOARDING: process.env.DISCORD_ONBOARDING_ROLE_ID,
          EVENT_MANAGER: process.env.DISCORD_EVENT_MANAGER_ROLE_ID,
          WRITER: process.env.DISCORD_WRITER_ROLE_ID,
          VOLUNTEER: process.env.DISCORD_VOLUNTEER_ROLE_ID,
          MEMBER: process.env.DISCORD_MEMBER_ROLE_ID,
        };

        const mappedRoleIds = Object.values(roleEnvMap).filter(Boolean);
        const desiredRoleIds = (user.roles || [])
          .map(r => roleEnvMap[r])
          .filter(Boolean)
          .filter(roleId => guild.roles.cache.has(roleId));

        // Optionally add a general linked role if provided
        const linkedRoleId = process.env.DISCORD_LINKED_ROLE_ID;
        if (linkedRoleId && guild.roles.cache.has(linkedRoleId)) {
          desiredRoleIds.push(linkedRoleId);
        }

        const currentRoleIds = new Set(member.roles.cache.map(r => r.id));
        const desiredSet = new Set(desiredRoleIds);

        // Add missing desired roles
        for (const roleId of desiredSet) {
          if (!currentRoleIds.has(roleId)) {
            const role = guild.roles.cache.get(roleId);
            if (role) await member.roles.add(role);
          }
        }

        // Remove mapped roles the user should no longer have (keep non-mapped ones untouched)
        for (const roleId of mappedRoleIds) {
          if (currentRoleIds.has(roleId) && !desiredSet.has(roleId)) {
            const role = guild.roles.cache.get(roleId);
            if (role) await member.roles.remove(role);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing Discord roles:', error);
    }

    const successEmbed = new EmbedBuilder()
      .setColor('#4ECDC4')
      .setTitle('Account Linked Successfully!')
      .setDescription('Your Discord account has been successfully linked to your Progress account. You now have access to member-only channels!')
      .setFooter({ text: 'Welcome to the Progress community!' });

    await message.reply({ embeds: [successEmbed] });

  } catch (error) {
    console.error('Error handling verification code:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('Error')
      .setDescription('An error occurred. Please try again later.');

    await message.reply({ embeds: [errorEmbed] });
  }
}

// Handle 'unlink' command
async function handleUnlinkCommand(message) {
  try {
    // Find user by Discord username
    const user = await prisma.user.findUnique({
      where: { discordUsername: message.author.username }
    });

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Not Linked')
        .setDescription('Your Discord account is not linked to any Progress account.');

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    // Remove Discord link
    await prisma.user.update({
      where: { id: user.id },
      data: {
        discordUsername: null,
        discordLinkedAt: null,
      }
    });

    // Remove mapped roles (and linked role) from Discord
    try {
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      if (guild) {
        const member = await guild.members.fetch(message.author.id);
        const roleEnvMap = {
          ADMIN: process.env.DISCORD_ADMIN_ROLE_ID,
          ONBOARDING: process.env.DISCORD_ONBOARDING_ROLE_ID,
          EVENT_MANAGER: process.env.DISCORD_EVENT_MANAGER_ROLE_ID,
          WRITER: process.env.DISCORD_WRITER_ROLE_ID,
          VOLUNTEER: process.env.DISCORD_VOLUNTEER_ROLE_ID,
          MEMBER: process.env.DISCORD_MEMBER_ROLE_ID,
        };
        const allMapped = [
          ...Object.values(roleEnvMap).filter(Boolean),
          process.env.DISCORD_LINKED_ROLE_ID
        ].filter(Boolean);

        for (const roleId of allMapped) {
          const role = guild.roles.cache.get(roleId);
          if (role && member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
          }
        }
      }
    } catch (error) {
      console.error('Error removing Discord roles:', error);
    }

    const successEmbed = new EmbedBuilder()
      .setColor('#4ECDC4')
      .setTitle('Account Unlinked')
      .setDescription('Your Discord account has been unlinked from your Progress account.')
      .setFooter({ text: 'You can link it again anytime with "link"' });

    await message.reply({ embeds: [successEmbed] });

  } catch (error) {
    console.error('Error handling unlink command:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('Error')
      .setDescription('An error occurred. Please try again later.');

    await message.reply({ embeds: [errorEmbed] });
  }
}

// Send help message
async function sendHelpMessage(message) {
  const embed = new EmbedBuilder()
    .setColor('#4ECDC4')
    .setTitle('Progress Discord Bot')
    .setDescription('Available commands:')
    .addFields(
      { name: 'link', value: 'Link your Discord account to your Progress account', inline: true },
      { name: 'unlink', value: 'Unlink your Discord account from your Progress account', inline: true },
      { name: '4-digit code', value: 'Enter verification code sent to your email', inline: true }
    )
    .setFooter({ text: 'Send commands in a DM to this bot' });

  await message.reply({ embeds: [embed] });
}

// Login to Discord
client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

// Error handling
client.on('error', (error) => {
  console.error('Discord bot error:', error);
});

module.exports = client;
