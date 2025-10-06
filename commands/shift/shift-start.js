const { InteractionContextType, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { shiftBroadcastChannel } = require('../../config.json');
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
		.addStringOption(option =>
			option
				.setName('details')
				.setDescription('short detail of the shift')
				.setRequired(true))
        .addStringOption(option =>
			option
				.setName('deadline')
				.setDescription('Enter deadline date in DD/MM/YYYY HH:mm format, i.e 2/10/2025 12:00')
				.setRequired(true))
        .addUserOption(option =>
			option
				.setName('target')
				.setDescription('Who is the shift for')
				.setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const broadcastChannel = interaction.guild.channels.cache.get(shiftBroadcastChannel);
        if (!broadcastChannel) {
            return interaction.reply({ content: '❌ Task broadcast channel not found!', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getUser('target');
        const title = interaction.options.getString('title');
        const detail = interaction.options.getString('details');
        const deadlineInput = interaction.options.getString('deadline');
        const shiftTitle = interaction.options.getString('title');
        const deadline = moment(deadlineInput, 'DD/MM/YYYY HH:mm');
        if (!deadline.isValid()) return interaction.reply({ content: '❌ Invalid deadline format! Please enter date in **DD/MM/YYY HH:mm** format.', flags: MessageFlags.Ephemeral });
        const key = nanoid(5);
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: target.displayName, iconURL: target.avatarURL() })
            .setTitle(`${shiftTitle} Task!`)
            .setDescription(`👤 Assigned to: ${target}\n⏱️ Deadline: <t:${Math.floor(deadline.valueOf() / 1000)}:R>\n📑 Details: ${detail}`)
            .setTimestamp()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`acceptShift:${key}`)
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`declineShift:${key}`)
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
            );

        const message = await broadcastChannel.send({ content: `New task notice for ${target}!`, embeds: [embed], components: [row] });
        const shiftObject = {
            id: key,
            title: title,
            assignedId: target.id,
            broadcastMessageId: message.id,
            details: detail,
            deadline: deadline.valueOf(),
            status: 'PENDING',
            createdAt: moment().valueOf(),
            startedAt: null
        }
        await Shift.post(key, shiftObject);
        interaction.reply({ content: '✅ Task broadcast sent!', flags: MessageFlags.Ephemeral });
    },
};