import { Client, GatewayIntentBits } from 'discord.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';

import abi from './abi.json' assert { type: "json" };;
import verify from './commands/verify.js';


const verifiedRoleId = "1035187570650398801";
const discordServerId = "1001600098876276869";
const stakeContractAddress = "0x77a4dA1883AD559642dBb3c2319e75c6e4746014";
const network = "goerli";


// init ethers
const provider = new ethers.providers.InfuraProvider(network, process.env.INFURA_API)
let nftContract = new ethers.Contract(stakeContractAddress, abi, provider);

// init dotenv
dotenv.config();

// init aws
AWS.config.update({
	accessKeyId: process.env.aws_access_key_id,
	secretAccessKey: process.env.aws_secret_access_key,
	region: 'us-west-1'
});
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

// init discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);
client.once('ready', () => {
	console.log('Ready!');
});


// contract event listener
nftContract.on("Withdraw", (user) => {
	console.log(user, 'has unstaked');

	let scanParams = {
		FilterExpression: `address = :S`,
		ExpressionAttributeValues: {
			":S": {S: user}
		},
		TableName: "gurtsHolders"
	};
	
	// scans db for address to get userid of holder
	ddb.scan(scanParams, function (err, data) {
		if (err) {
			console.log("Error", err);
		} else {
			console.log("Success", data);
			// If address is in db
			if (data.Count > 0) {
				let user = data.Items[0].userId.S;
				console.log("removing", user);
				let deleteParams = {
					Key: {
					 "userId": {S: user},
					},
					TableName: "gurtsHolders"
				};
			
				// Call DynamoDB to delete the item from the table
				ddb.deleteItem(deleteParams, function(err, data) {
				  if (err) {
					console.log("Error", err);
				  } else {
					console.log("Success", data);
					client.guilds.fetch().then(value => {
						let guild = value.get(discordServerId);
						guild.fetch()
						.then(newGuild => {
							newGuild.members.fetch(user)
							.then(member => {
								newGuild.roles.fetch(verifiedRoleId)
								.then(role => {
									try {
										member.roles.remove(role);
									} catch (err) {
										console.log(err);
									}
								})
								.catch(console.error);
							}).catch(console.log);
						}).catch(console.log)
					});
				  }
				});
			} else {
				console.log("user not in db");
			}
			
		}
	})
})

// discord bot command listener
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'verify') {
    verify(interaction, ddb, nftContract, verifiedRoleId);
	}
});
