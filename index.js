import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

import verify from './commands/verify.js';

// init dotenv
dotenv.config();

// init discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'verify') {
    verify(interaction);
	}
});


// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);