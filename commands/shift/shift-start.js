const { InteractionContextType, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder } = require('discord.js');
const { shiftBroadcastChannel, shiftAdminRole, onShiftRole, onBreakRole } = require('../../config.json');

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
				.setDescription('Enter deadline date in DD/MM/YYYY format')
				.setRequired(true))
		.setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        // Start a new thread
        const target = interaction.options.getUser('target');
        const detail = interaction.options.getString('detail');
        const deadline = interaction.options.getString('deadline');
        const shiftTitle = interaction.options.getString('title');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: target.displayName, iconURL: target.avatarURL() })
            .setTitle(`${shiftTitle} Shift!`)
            .setDescription(`👤 Assigned to: ${target}\n⏱️ Deadline: Before **${deadline}**\n📑 Detail: ${detail}`)
            .setTimestamp()

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept_shift")
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("decline_shift")
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
            );

        interaction.channel.send({ content: `New shift notice for ${target}!`, embeds: [embed], components: [row] });
        interaction.reply({ content: 'Sent!', flags: MessageFlags.Ephemeral });
    },
};