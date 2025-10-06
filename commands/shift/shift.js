const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Shift = require('../../utility/shift-handle');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shift')
        .setDescription('Display your current shift details.'),
    async execute(interaction) {
        const shift = await Shift.getShiftByUser(interaction.user.id);
        if (!shift) {
            await interaction.reply({ content: 'You are not currently on a shift.', flags: MessageFlags.Ephemeral });
            return;
        }

        const key = shift.id;
        const statusEmojis = {
            STARTED: '🏁',
            REJECTED: '❌',
            PENDING: '🟡',
            PAUSED: '🍹',
            COMPLETED: '✅'
        };
        const color = {
            STARTED: '#43B581',
            REJECTED: '#F04747',
            PENDING: '#FAA61A',
            PAUSED: '#FFA559',
            COMPLETED: '#43B581'
        }
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
            .setColor(color[shift.status])
            .setTitle(`📋 Current Task: ${shift.title}`)
            .setDescription(
                `**${shift.details}**\n\n` +
                `- Status: ${statusEmojis[shift.status] || '❔'} ${shift.status}\n` +
                `- Assigned to: <@${shift.assignedId}>\n` +
                `- Started: ${shift.startedAt ? `<t:${Math.floor(shift.startedAt / 1000)}:R>` : 'Not started'}\n` +
                `- Deadline: <t:${Math.floor(shift.deadline / 1000)}:R>\n` +
                `- Task ID: \`${shift.id}\``
              )                
            .setTimestamp()
            .setFooter({ text: interaction.guild.name });
        interaction.reply({ embeds: [embed] });
    },
};
