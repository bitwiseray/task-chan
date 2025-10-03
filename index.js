const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const Shift = require('./utility/shift-handle');
const moment = require('moment');

client.commands = new Collection();

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	// Slash commands
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			const reply = { content: 'There was an error while executing this command!', ephemeral: true };
			if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
			else await interaction.reply(reply);
		}
	}

	else if (interaction.isButton()) {
		try {
			const [action, id] = interaction.customId.split(":");
			const shift = await Shift.get(id);
			if (action === "acceptShift") {
				Shift.start(id, interaction.member);
				const embed = new EmbedBuilder()
							.setColor('Green')
							.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
							.setTitle(`${shift.title} Shift started!`)
							.setDescription(`👤 Assigned to: ${interaction.user}\n⏱️ Deadline: Before **${moment(shift.deadline).format('MMMM Do YYYY, h:mm A')}**\n📑 Details: ${shift.details}`)
							.setTimestamp()
				await interaction.message.edit({ content: '', embeds: [embed], components: [] });
				await interaction.reply({ content: `Shift **${shift.title}** started!`, flags: MessageFlags.Ephemeral });
			}
			else if (action === "declineShift") {
				Shift.rejected(id, interaction.user);
				const embed = new EmbedBuilder()
							.setColor('Red')
							.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
							.setTitle(`${shift.title} Shift rejected!`)
							.setDescription(`👤 Assigned to: ${interaction.user}\n⏱️ Deadline: Before **${moment(shift.deadline).format('MMMM Do YYYY, h:mm A')}**\n📑 Details: ${shift.details}`)
							.setTimestamp()
				await interaction.message.edit({ content: '', embeds: [embed], components: [] });
				await interaction.reply({ content: `Shift **${id}** has been rejected and HR has been notifed!`, flags: MessageFlags.Ephemeral });
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "Button error!", flags: MessageFlags.Ephemeral });
		}
	}
});


client.login(process.env.token);