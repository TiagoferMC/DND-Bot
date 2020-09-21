const { atlasConnectionString, token } = require('./config.json');
let { prefix } = require('./config.json');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const Character = require('./characterSchema.js');

mongoose.connect(atlasConnectionString, {useNewUrlParser: true, useUnifiedTopology: true }, err => {
    if (err) throw err;
    console.log("Connected to MongoDB!");
});

const client = new Discord.Client();

client.once("ready", () => {
    console.log("Ready!");
})

let prunePrimed = false;

client.on("message", message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    let dbMessage = "";

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'prefix':
            if (args[0]) {
                prefix = args[0];
                message.channel.send(`Prefix changed to ${prefix}`);
            } else {
                message.channel.send(`Usage \`${prefix}prefix <new prefix>\``);
            }

            break;

        case 'create':
            if (args[0]) {
                let name = args[0];
                character = new Character({
                    name,
                    created: Date.now()
                });
                character.save((err, dbCharacter) => {
                    if (err) { dbMessage = "Error creating character..."; throw err; }
                    else dbMessage = `Successfully created character: ${dbCharacter.name}`;

                    message.channel.send(dbMessage);
                    console.log(dbMessage);
                });

            break;

            } else {
                message.channel.send(`Usage \`${prefix}create <character name>\``);
            }

            break;

        case 'find':
            if (args[0]) {
                let name = args[0];
                Character.findOne({ name }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = character ? `Name: ${character.name}\nCreated: ${character.created}` :  `No character ${name} found...`;

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });

            } else {
                message.channel.send(`Usage \`${prefix}find <character name>\``);
            }

            break;

        case 'list':
            Character.find({}, 'name').sort('created').exec((err, characters) => {
                if (err) dbMessage = "Error connecting to DB...";
                else if (Array.isArray(characters) && characters.length)
                    characters.forEach(character => {dbMessage += character.name + "\n"});
                else dbMessage = "No characters in DB...";

                console.log(dbMessage);
                message.channel.send(dbMessage);

            });

            break;

        case 'delete':
            if (args[0]) {
                let name = args[0];
                Character.findOneAndDelete({ name }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = character ? `Deleted Character ${name}` : `Character ${name} not found...`;

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });

            } else {
                message.channel.send(`Usage \`${prefix}find <character name>\``);
            }

            break;

        case 'prune':
        case 'prune-confirm':
            break;

        default:
            message.channel.send("Unknown command...");
            break;
    }

    switch (command) {
        case 'prune':
            message.channel.send(`WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN THE DATABASE. THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            prunePrimed = true;
            break;
        case 'prune-confirm':
            if (prunePrimed)
                Character.deleteMany({}, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = "Pruned the Database";

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });
            else message.channel.send(`Type \`${prefix}prune if you wish to prune the database\``)

        default:
            prunePrimed = false;
            break;
    }
});


client.login(token);
