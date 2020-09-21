const { atlasConnectionString, token } = require('./config.json');
let { prefix } = require('./config.json');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const Character = require('./characterSchema.js');
const classSchema = require('./classSchema.js');

const Class = mongoose.model("Class", classSchema);

mongoose.connect(atlasConnectionString, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }, err => {
    if (err) throw err;
    console.log("Connected to MongoDB!");
});
mongoose.set('returnOriginal', false);

const client = new Discord.Client();

client.once("ready", () => {
    console.log("Ready!");
})

let pruneCharsPrimed = false;
let pruneClassesPrimed = false;

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

        case 'create-char':
        case 'create-character':
            if (args[0]) {
                let name = args[0];
                character = new Character({
                    name
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

        case 'create-class':
            if (args[0]) {
                let name = args[0];
                charClass = new Class({
                    name
                });
                charClass.save((err, dbClass) => {
                    if (err) { dbMessage = "Error creating Class..."; throw err; }
                    else dbMessage = `Successfully created Class: ${dbClass.name}`;

                    message.channel.send(dbMessage);
                    console.log(dbMessage);
                });

            break;

            } else {
                message.channel.send(`Usage \`${prefix}create <class name>\``);
            }

            break;

        case 'find-char':
        case 'find-character':
            if (args[0]) {
                let name = args[0];
                Character.findOne({ name }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else if (character) {
                        dbMessage = `\`\`\`Name: ${character.name}\nRace: ${character.race}\nClasses:\n`;

                        character.classes.forEach(charClass => {
                            dbMessage += `-${charClass.name}\n  Level: ${charClass.level}\n`;
                        });

                        dbMessage += `Background: ${character.background}\nHP: ${character.hp}\nAC: ${character.ac}\nCreated: ${character.created}\`\`\``;

                    } else dbMessage = `No Character "${name}"" found...`;

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });

            } else {
                message.channel.send(`Usage \`${prefix}find <character name>\``);
            }

            break;

        case 'list-characters':
        case 'list-chars':
            Character.find({}, 'name').sort('created').exec((err, characters) => {
                if (err) dbMessage = "Error connecting to DB...";
                else if (Array.isArray(characters) && characters.length)
                    characters.forEach(character => {dbMessage += character.name + "\n"});
                else dbMessage = "No Characters in DB...";

                console.log(dbMessage);
                message.channel.send(dbMessage);

            });

            break;
       case 'list-classes':
            Class.find({}, 'name').sort('created').exec((err, charClasses) => {
                if (err) dbMessage = "Error connecting to DB...";
                else if (Array.isArray(charClasses) && charClasses.length)
                    charClasses.forEach(charClass => {dbMessage += charClass.name + "\n"});
                else dbMessage = "No Classes in DB...";

                console.log(dbMessage);
                message.channel.send(dbMessage);

            });

            break;

        case 'del-char':
        case 'del-character':
        case 'delete-char':
        case 'delete-character':
            if (args[0]) {
                let name = args[0];
                Character.findOneAndDelete({ name }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = character ? `Deleted Character: ${name}` : `Character ${name} not found...`;

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });

            } else {
                message.channel.send(`Usage \`${prefix}delete-char <character name>\``);
            }

            break;

        case 'del-class':
        case 'delete-class':
            if (args[0]) {
                let name = args[0];
                Class.findOneAndDelete({ name }, (err, charClass) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = charClass ? `Deleted Class: ${name}` : `Class ${name} not found...`;

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });

            } else {
                message.channel.send(`Usage \`${prefix}delete-class <class name>\``);
            }

            break;


        case 'prune':
            message.channel.send(`Use \`${prefix}prune-chars\` to prune the characters database, \`${prefix}prune-classes\` to prune the classes database, or \`${prefix}prune-all\` to prune \*\*ALL\*\* databases.`)
        case 'prune-all':
        case 'prune-chars':
        case 'prune-characters':
        case 'prune-classes':
        case 'prune-confirm':
            break;

        case 'update-char':

            if (args[0] && args[1] && args[2]) {

                let name = args[0];
                let field = args[1].toLowerCase();
                let newValue = args[2];

                intFields = ["hp", "ac", "experience"];

                if (intFields.includes(field) && !parseInt(newValue)) {
                    message.channel.send(`${field} must be an Integer.`);
                    break;
                }

                Character.findOneAndUpdate({ name }, {[field]: newValue}, (err, character) => {
                    if (err) dbMessage = "Error updating character...";

                    dbMessage = character ? `${character.name}'s ${field} changed to ${newValue}` : `No character ${name} found...`;

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });

            } else {
                message.channel.send(`Usage: \`${prefix}update-char <character name> <field to update> <new value>\``);
            }

            break;

        default:
            message.channel.send("Unknown command...");
            break;
    }

    switch (command) {
        case 'prune-chars':
        case 'prune-characters':
            message.channel.send(`WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN THE CHARACTERS DATABASE! THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            pruneCharsPrimed = true;
            pruneClassesPrimed = false;
            break;
        case 'prune-classes':
            message.channel.send(`WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN THE CLASSES DATABASE! THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            pruneClassesPrimed = true;
            pruneCharsPrimed = false;
            break;
        case 'prune-all':
            message.channel.send(`WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN ALL OF THE DATABASES! THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            pruneCharsPrimed = true;
            pruneClassesPrimed = true;
            break;
        case 'prune-confirm':
            if (pruneCharsPrimed)
                Character.deleteMany({}, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = "YOU KILLED THEM ALL! OH THE HUMANITY!";

                    console.log(dbMessage);
                    message.channel.send(dbMessage);
                });
             if (pruneClassesPrimed)
                Class.deleteMany({}, (err, charClass) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = "No more classes... What are you, a communist?";

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
