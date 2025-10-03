const { InteractionContextType, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder } = require('discord.js');
const { shiftBroadcastChannel, shiftAdminRole, devUser, onShiftRole, onBreakRole } = require('../../config.json');
const Shift = require('../../utility/shift-handle');
const { nanoid } = require('nanoid');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shift-broadcast')
		.setDescription('Broadcast shift for the day')
        .addStringOption(option =>
			option
				.setName('title')
				.setDescription('Title of the shift')
				.setRequired(true))
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('Who is the shift for')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('detail')
				.setDescription('short detail of the shift')
				.setRequired(true))
        .addStringOption(option =>
			option
				.setName('deadline')
				.setDescription('Enter deadline date in DD/MM/YYYY HH:mm format, i.e 2/10/2025 12:00')
				.setRequired(true))
		.setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const broadcastChannel = interaction.guild.channels.cache.get(shiftBroadcastChannel);
        if (!interaction.member.roles.cache.has(shiftAdminRole) && interaction.user.id !== devUser) {
            return interaction.reply({ content: '⚠️ You do not have permission to use this command!', flags: MessageFlags.Ephemeral });
        }
        if (!broadcastChannel) {
            return interaction.reply({ content: '❌ Shift broadcast channel not found!', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getUser('target');
        const title = interaction.options.getString('title');
        const detail = interaction.options.getString('detail');
        const deadlineInput = interaction.options.getString('deadline');
        const shiftTitle = interaction.options.getString('title');
        const deadline = moment(deadlineInput, 'DD/MM/YYYY HH:mm');
        if (!deadline.isValid()) {
            return interaction.reply({ content: '❌ Invalid deadline format! Please enter date in **DD/MM/YYY HH:mm** format.', flags: MessageFlags.Ephemeral });
        }
        const key = nanoid(10);
        const shiftObject = {
            title: title,
            assignedId: target.id,
            details: detail,
            deadline: deadline.valueOf(),
            status: 'PENDING',
            createdAt: moment().valueOf(),
            startedAt: null
        }

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: target.displayName, iconURL: target.avatarURL() })
            .setTitle(`${shiftTitle} Shift!`)
            .setDescription(`👤 Assigned to: ${target}\n⏱️ Deadline: Before **${deadline.format('MMMM Do YYYY, h:mm A')}**\n📑 Details: ${detail}`)
            .setTimestamp()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`acceptShift:${key}`)
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`declineShift_${key}`)
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
            );

        await broadcastChannel.send({ content: `New shift notice for ${target}!`, embeds: [embed], components: [row] });
        await Shift.post(key, shiftObject);
        interaction.reply({ content: '✅ Shift broadcast sent!', flags: MessageFlags.Ephemeral });
    },
};