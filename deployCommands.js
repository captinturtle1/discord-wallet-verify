import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
    new SlashCommandBuilder()
        .setName('verify')
        .setDescription('verify your wallet')
		.addStringOption(option =>
		    option.setName('hash')
		    	.setDescription('The signed hash you got from the verification site')
		    	.setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);


(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
            Routes.applicationCommands(process.env.APP_ID),
            { body: commands },
        );
        

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();