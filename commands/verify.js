import { ethers } from 'ethers';
import { hashMessage } from '@ethersproject/hash';

const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA_API)
let nftContract = new ethers.Contract('0xc34cc9f3cf4e1f8dd3cde01bbe985003dcfc169f', abi, provider);


export default async function verify(interaction) {
    let user = interaction.user.id;
    let hash = interaction.options.getString('hash')
    if (/^0x[a-fA-F0-9]{130}$/.test(hash)) {
        let verifySigner = ethers.utils.verifyMessage(hashMessage(user + 128), hash)
        let passBalance = await nftContract.balanceOf(verifySigner);
        if (passBalance > 0) {
            await interaction.reply({ content: `${verifySigner} has ${passBalance}`, ephemeral: true});
            interaction.guild.roles.fetch('1035187570650398801')
                .then(role => {
                    try {
                        interaction.member.roles.add(role);
                    } catch (err) {
                        console.log(err);
                    }
                })
                .catch(console.error);
        } else {
            await interaction.reply({ content: `${verifySigner} is not an owner`, ephemeral: true});
        }
    } else {
        await interaction.reply({ content: 'invalid hash', ephemeral: true});
    }
};