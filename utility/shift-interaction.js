const { QuickDB } = require("quick.db");
const { shiftUpdatesChannel, shiftBroadcastChannel } = require('./config.json');
const ShiftDb = new QuickDB();
const Shift = require('./shift-handle');
const { EmbedBuilder } = require('discord.js');


class ShiftInteraction {
  constructor(interaction, shift, broadcastMessage) {
    this.interaction = interaction;
    this.shift = shift;
    this.broadcastMessage = broadcastMessage;
    this.shiftUpdatesChannel = this.interaction.guild.channels.cache.get(shiftBroadcastChannel);
  }

  async pause() { 
    const embed = new EmbedBuilder()
      .setColor('Yellow')
      .setAuthor({ name: this.interaction.user.displayName, iconURL: this.interaction.user.avatarURL() })
      .setTitle(`${shift.title} task on pause!`)
      .setDescription(`👤 Assigned to: ${this.interaction.user}\n⏱️ Deadline: <t:${Math.floor(this.shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}`)
      .setTimestamp()
		await broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
    Shift.pause(this.shift.id, interaction.user);
		await interaction.reply({ content: `Task **${shift.title}** has been paused!`, flags: MessageFlags.Ephemeral });
  }

  async end(interaction, shift, broadcastMessage) { 
    const embed = new EmbedBuilder()
      .setColor('Aqua')
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
      .setTitle(`${shift.title} task completed!`)
      .setDescription(`👤 Assigned to: ${interaction.user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}\n✅ Completed at: <t:${Math.floor(Date.now() / 1000)}:f>`)
      .setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
    Shift.end(this.shift.id, interaction.user);
		await interaction.reply({ content: `Task **${shift.title}** has been completed!`, flags: MessageFlags.Ephemeral });
  }

  async complete(interaction, shift, broadcastMessage) { 
    const embed = new EmbedBuilder()
      .setColor('Aqua')
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
      .setTitle(`${shift.title} task completed!`)
      .setDescription(`👤 Assigned to: ${interaction.user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}\n✅ Completed at: <t:${Math.floor(Date.now() / 1000)}:R>`)
      .setTimestamp()
		await broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
    Shift.completed(id, interaction.user);
		await interaction.reply({ content: `Task **${shift.title}** has been completed!`, flags: MessageFlags.Ephemeral });
  }

  async reject(shift, user, broadcastMessage) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({ name: user.displayName, iconURL: user.avatarURL() })
      .setTitle(`${shift.title} task rejected!`)
      .setDescription(`👤 Assigned to: ${user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n📑 Details: ${shift.details}`)
      .setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
    Shift.reject(id, interaction.user);
    if (!this.shiftUpdatesChannel) {
      return interaction.channel.send('❌ Task broadcast channel not found!');
    }
    let alert = await updatesChannel.send({ content: `${interaction.user} has rejected task **${shift.title}**, please reply to this message to log reason.` });
    await interaction.reply({ content: `Task **${shift.title}** has been rejected, please log a reason for rejecting this task at ${alert.url}`, flags: MessageFlags.Ephemeral });
  }
  
  async accept(interaction, shift, broadcastMessage) { 
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
      .setTitle(`${shift.title} task started!`)
      .setDescription(`👤 Assigned to: ${user}\n⏱️ Deadline: <t:${Math.floor(shift.deadline / 1000)}:f>\n🏁 Started: <t:${Math.floor(shift.startedAt / 1000)}:R>\n📑 Details: ${shift.details}`)
      .setTimestamp()
		broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
    Shift.start(this.shift.id, this.interaction.member);
		await interaction.reply({ content: `Task **${shift.title}** started!`, flags: MessageFlags.Ephemeral });
  }
}

module.exports = new ShiftInteraction();