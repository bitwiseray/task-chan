const { QuickDB } = require("quick.db");
const ShiftDb = new QuickDB();
const { EmbedBuilder } = require('discord.js');


class ShiftInteraction {
  constructor() {
    this.db = ShiftDb;
  }

  async pause(interaction, shift, broadcastMessage) { 
    const embed = new EmbedBuilder()
					.setColor('Yellow')
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
					.setTitle(`${shift.title} task on pause!`)
					.setDescription(`👤 Assigned to: ${user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}`)
					.setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
  }

  async end(interaction, shift, broadcastMessage) { 
    const embed = new EmbedBuilder()
					.setColor('Aqua')
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
					.setTitle(`${shift.title} task completed!`)
					.setDescription(`👤 Assigned to: ${interaction.user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}\n✅ Completed at: <t:${Math.floor(Date.now() / 1000)}:f>`)
					.setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
  }

  async complete(interaction, shift, broadcastMessage) { 
    const embed = new EmbedBuilder()
					.setColor('Aqua')
					.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
					.setTitle(`${shift.title} task completed!`)
					.setDescription(`👤 Assigned to: ${interaction.user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}\n✅ Completed at: <t:${Math.floor(Date.now() / 1000)}:f>`)
					.setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
  }

  async reject(shift, user, broadcastMessage) {
    const embed = new EmbedBuilder()
					.setColor('Red')
					.setAuthor({ name: user.displayName, iconURL: user.avatarURL() })
					.setTitle(`${shift.title} task rejected!`)
					.setDescription(`👤 Assigned to: ${user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}`)
					.setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
  }
}

module.exports = new ShiftInteraction();