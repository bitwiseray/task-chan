const { InteractionContextType, ButtonStyle, SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { shiftBroadcastChannel, shiftAdminRole, devUser, onShiftRole, onBreakRole } = require('../../config.json');
const Shift = require('../../utility/shift-handle');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list-all')
		.setDescription('List ongoing/posted shifts'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(shiftAdminRole) && interaction.user.id !== devUser) {
            return interaction.reply({ content: 'You do not have permission to use this command!', flags: MessageFlags.Ephemeral });
        }
        const shiftList = await Shift.listAll();
        const formattedList = shiftList.map((task, index) => {
            return `${index + 1}. **${task.title}** (${task.id}) — **${task.status}**\nAssigned to ${interaction.guild.members.cache.get(task.assignedId) ?? "None"} | Posted at ${moment(task.createdAt).format('DD/MM/YYYY HH:mm')}`
          });    

        const embed = new EmbedBuilder()
            .setColor('White')
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTitle('Active Shifts')
            .setDescription(formattedList.join("\n"))
            .setTimestamp()

        await interaction.reply({ embeds: [embed] });
    },
};