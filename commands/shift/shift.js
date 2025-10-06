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
            .setDescription(`**${shift.details}**

                • Status: ${statusEmojis[shift.status] || '❔'} ${shift.status}
                • Assigned to: <@${shift.assignedId}>
                • Started: ${shift.startedAt ? `<t:${Math.floor(shift.startedAt / 1000)}:R>` : 'Not started'}
                • Deadline:<t:${Math.floor(shift.deadline / 1000)}:R>
                • Task ID: ${shift.id}
                `)                
            .setTimestamp()
            .setFooter({ text: interaction.guild.name });
        
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`completeShift:${key}`)
                    .setLabel('Complete')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`pauseShift:${key}`)
                    .setLabel('Pause')
                    .setEmoji('⏳')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`endShift:${key}`)
                    .setLabel('End')
                    .setEmoji('⛔')
                    .setStyle(ButtonStyle.Secondary)
            );

        interaction.reply({ embeds: [embed], components: [row] });
    },
};
