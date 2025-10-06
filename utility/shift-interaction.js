const { QuickDB } = require("quick.db");
const { shiftUpdatesChannel, shiftBroadcastChannel } = require('../config.json');
const ShiftDb = new QuickDB();
const Shift = require('./shift-handle');
const { EmbedBuilder, MessageFlags } = require('discord.js');
const { UserError, NotFoundError, PermissionError, InternalError } = require('./HandleError');


class ShiftInteraction {
  constructor(interaction, shift, broadcastMessage) {
    this.interaction = interaction;
    this.shift = shift;
    this.broadcastMessage = broadcastMessage;
  }

  async handleError(error) {
    if (error instanceof UserError || error instanceof NotFoundError || error instanceof PermissionError) {
      await this.interaction.reply({ content: `❌ ${error.message}`, flags: MessageFlags.Ephemeral });
    } else {
      console.error(error);
      await this.interaction.reply({ content: `⚠️ Something went wrong. Please try again later.`, flags: MessageFlags.Ephemeral });
    }
  }

  // async pause() {
  //   try {
  //     const embed = new EmbedBuilder()
  //       .setColor('Yellow')
  //       .setAuthor({ name: this.interaction.user.displayName, iconURL: this.interaction.user.avatarURL() })
  //       .setTitle(`${this.shift.title} task on pause!`)
  //       .setDescription(`👤 Assigned to: ${this.interaction.user}\n⏱️ Deadline: <t:${Math.floor(this.shift.deadline / 1000)}:f>\n📑 Details: ${this.shift.details}`)
  //       .setTimestamp()
      
       
  //     await Shift.pause(this.interaction.user)
  //     await this.broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
  //     await this.interaction.editReply()
  //   } catch (error) {
  //     await this.handleError(error);
  //   }
  // }

  async abandon() {
    try {
      const embed = new EmbedBuilder()
        .setColor('Aqua')
        .setAuthor({ name: this.interaction.user.displayName, iconURL: this.interaction.user.avatarURL() })
        .setTitle(`${this.shift.title} task completed!`)
        .setDescription(`👤 Assigned to: ${this.interaction.user}\n⏱️ Deadline: <t:${Math.floor(this.shift.deadline / 1000)}:f>\n📑 Details: ${this.shift.details}\n✅ Completed at: <t:${Math.floor(Date.now() / 1000)}:f>`)
        .setTimestamp()
      await Shift.end(this.shift.id, this.interaction.user);
      await this.broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
      await this.interaction.reply({ content: `Task **${this.shift.title}** has been completed!`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      await this.handleError(error);
    }
  }

  async complete() {
    try {
      const embed = new EmbedBuilder()
        .setColor('Aqua')
        .setAuthor({ name: this.interaction.user.displayName, iconURL: this.interaction.user.avatarURL() })
        .setTitle(`${this.shift.title} task completed!`)
        .setDescription(`👤 Assigned to: ${this.interaction.user}\n⏱️ Deadline: <t:${Math.floor(this.shift.deadline / 1000)}:f>\n📑 Details: ${this.shift.details}\n✅ Completed at: <t:${Math.floor(Date.now() / 1000)}:R>`)
        .setTimestamp()

      await Shift.completed(this.interaction.user);
      await this.broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
      await this.interaction.reply({ content: `Task **${this.shift.title}** has been completed!`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      await this.handleError(error);
    }
  }

  async reject() {
    try {
      await Shift.reject(this.shift.id, this.interaction.user);
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setAuthor({ name: this.interaction.user.displayName, iconURL: this.interaction.user.avatarURL() })
        .setTitle(`${this.shift.title} task rejected!`)
        .setDescription(`👤 Assigned to: ${this.interaction.user}\n⏱️ Deadline: <t:${Math.floor(this.shift.deadline / 1000)}:f>\n📑 Details: ${this.shift.details}`)
        .setTimestamp()

      await this.broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
      const channel = await this.interaction.guild.channels.cache.get(shiftBroadcastChannel)
      if (!channel) {
        await this.interaction.reply({ content: '❌ Task broadcast channel not found!', flags: MessageFlags.Ephemeral });
        return;
      }
      let alert = await channel.send({ content: `${this.interaction.user} has rejected task **${this.shift.title}**, please reply to this message to log reason.` });
      await this.interaction.reply({ content: `Task **${this.shift.title}** has been rejected, please log a reason for rejecting this task at ${alert.url}`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      await this.handleError(error);
    }
  }


  async accept() {
    try {
      await Shift.start(this.shift.id, this.interaction.member);
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setAuthor({ name: this.interaction.user.displayName, iconURL: this.interaction.user.avatarURL() })
        .setTitle(`${this.shift.title} task started!`)
        .setDescription(`👤 Assigned to: ${this.interaction.user}\n⏱️ Deadline: <t:${Math.floor(this.shift.deadline / 1000)}:f>\n🏁 Started: <t:${Math.floor(Date.now() / 1000)}:R>\n📑 Details: ${this.shift.details}`)
        .setTimestamp()

      await this.broadcastMessage.edit({ content: '', embeds: [embed], components: [] });
      await this.interaction.reply({ content: `Task **${this.shift.title}** started!`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      await this.handleError(error);
    }
  }
}

module.exports = ShiftInteraction;