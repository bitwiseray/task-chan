const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { shiftBroadcastChannel, shiftAdminRole, devUser, onShiftRole, onBreakRole } = require('../../config.json');
const Shift = require('../../utility/shift-handle');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-all')
    .setDescription('List ongoing shifts'),
  async execute(interaction) {
    const shiftList = await Shift.listAll();

    const statusEmojis = {
      STARTED: "✅",
      REJECTED: "❌",
      PENDING: "🟡"
    };

    const formattedList = shiftList.map((task, index) => {
      const statusEmoji = statusEmojis[task.status] || "❔"; 
      return `${index + 1}. **${task.title}**  
      - Status: ${statusEmoji} ${task.status}
      - Assigned: ${interaction.guild.members.cache.get(task.assignedId) ?? "None"}  
      - Posted: <t:${Math.floor(task.createdAt / 1000)}:f>  
      - Deadline: <t:${Math.floor(task.deadline / 1000)}:f>  
      - ID: ${task.id}`;
    });


    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTitle(`${interaction.guild.name} — Ongoing Shifts`)
      .setDescription(formattedList.join("\n") || 'No active shifts')
      .setTimestamp()

    await interaction.reply({ embeds: [embed] });
  },
};