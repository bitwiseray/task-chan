const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { shiftBroadcastChannel, shiftAdminRole, devUser, onShiftRole, onBreakRole } = require('../../config.json');
const Shift = require('../../utility/shift-handle');
const { nanoid } = require('nanoid');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-shift')
        .setDescription('Delete an active shift')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('Id of the shift')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(shiftAdminRole) && interaction.user.id !== devUser) {
            return interaction.reply({ content: '⚠️ You do not have permission to use this command!', flags: MessageFlags.Ephemeral });
        }

        const id = interaction.options.getString('id');
        let title;
        const shift = await Shift.get(id);
        if (!shift) {
            return interaction.reply({ content: '❌ Shift not found!', flags: MessageFlags.Ephemeral });
        }
        title = shift.title;
        try {
            await Shift.delete(id);
            interaction.reply({ content: `✅ **${title}** shift deleted!`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            return interaction.reply({ content: '❌ Something went wrong, try again later...', flags: MessageFlags.Ephemeral });
        }
    },
};