import { ethers } from 'ethers';

export default async function verify(interaction, ddb, nftContract, verifiedRoleId) {
    let user = interaction.user.id;
    let getParams = {
        Key: {
         "userId": {S: `${user}`}, 
        },
        TableName: "gurtsHolders"
    }

    ddb.getItem(getParams, async (err, data) => {
        if (err) {
          console.log("Error", err);
          await interaction.reply({ content: 'error', ephemeral: true });
        } else {
            let verifySigner = ethers.utils.verifyMessage(data.Item.userId.S, data.Item.signedHash.S)
            let passBalance = await nftContract.stakedBalanceOf(verifySigner);
            if (passBalance > 0) {
                await interaction.reply({ content: `${verifySigner} has ${passBalance}`, ephemeral: true});
                interaction.guild.roles.fetch(verifiedRoleId)
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
        }
    })
};