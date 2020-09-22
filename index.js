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

const client = new Discord.Client();

client.once("ready", () => {
    console.log("Discord Bot Ready!");
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
                    name,
                    nameLower: name.toLowerCase()
                });
                character.save((err, dbCharacter) => {
                    if (err) { dbMessage = "Error creating character..."; throw err; }
                    else dbMessage = `Successfully created character: ${dbCharacter.name}`;

                    message.channel.send(dbMessage);
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
                    name,
                    nameLower: name.toLowerCase()
                });
                charClass.save((err, dbClass) => {
                    if (err) { dbMessage = "Error creating Class..."; throw err; }
                    else dbMessage = `Successfully created Class: ${dbClass.name}`;

                    message.channel.send(dbMessage);
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
                let nameLower = name.toLowerCase();
                Character.findOne({ nameLower }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else if (character) {
                        dbMessage = `\`\`\`Name: ${character.name}\nRace: ${character.race}\nClasses:\n`;

                        character.classes.forEach(charClass => {
                            dbMessage += `-${charClass.name}\n  Level: ${charClass.level}\n`;
                        });

                        dbMessage += `Background: ${character.background}\nHP: ${character.hp}\nAC: ${character.ac}\nCreated: ${character.created}\`\`\``;

                    } else dbMessage = `No Character "${name}"" found...`;

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

                message.channel.send(dbMessage);

            });

            break;
       case 'list-classes':
            Class.find({}, 'name').sort('created').exec((err, charClasses) => {
                if (err) dbMessage = "Error connecting to DB...";
                else if (Array.isArray(charClasses) && charClasses.length)
                    charClasses.forEach(charClass => {dbMessage += charClass.name + "\n"});
                else dbMessage = "No Classes in DB...";

                message.channel.send(dbMessage);

            });

            break;

        case 'del-char':
        case 'del-character':
        case 'delete-char':
        case 'delete-character':
            if (args[0]) {
                let name = args[0];
                let nameLower = name.toLowerCase();
                Character.findOneAndDelete({ nameLower }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = character ? `Deleted Character: ${name}` : `Character ${name} not found...`;

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
                let nameLower = name.toLowerCase();
                Class.findOneAndDelete({ nameLower }, (err, charClass) => {
                    if (err) dbMessage = "Error connecting to DB...";
                    else dbMessage = charClass ? `Deleted Class: ${name}` : `Class ${name} not found...`;

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
                let nameLower = name.toLowerCase();
                let field = args[1].toLowerCase();
                let newValue = args[2];

                intFields = ["hp", "ac", "experience", "level"];

                if (field != "class") {
                    if (intFields.includes(field) && !parseInt(newValue)) {
                        message.channel.send(`${field} must be an Integer.`);
                        break;
                    }

                    Character.findOneAndUpdate({ nameLower }, {[field]: newValue}, (err, character) => {
                        if (err) dbMessage = "Error updating character...";

                        dbMessage = character ? `${character.name}'s ${field} changed to ${newValue}` : `No character ${name} found...`;

                        message.channel.send(dbMessage);
                    });
                } else {

                    let operation = args[2].toLowerCase();
                    let className = args[3];
                    let classNameLower = className.toLowerCase();

                    switch (operation) {

                        case "add":
                            Class.findOne({nameLower: classNameLower}, (err, charClass) => {
                            if (err) {
                                dbMessage = "Error connecting to DB...";
                                message.channel.send(dbMessage);
                            } else if (!charClass) {
                                dbMessage = `Class ${className} does not exist. please add it with \`${prefix}create-class\`.`;
                                message.channel.send(dbMessage);
                            }

                            if (charClass)
                                Character.findOneAndUpdate({ nameLower }, {$push: {classes: charClass}}, (err, character) => {
                                    if (err) dbMessage = "Error updating character...";

                                    dbMessage = character ? `Successfully added Class ${className} to Character ${name}` : `No character ${name} found...`;

                                    message.channel.send(dbMessage);
                                });
                            });

                            break;

                        case "remove":
                            Character.findOneAndUpdate({ nameLower }, {$pull: {classes: {nameLower: classNameLower}}}, (err, character) => {
                                if (err) dbMessage = "Error updating character...";
                                    dbMessage = character ? `Successfully removed Class ${className} from Character ${name}` : `No character ${name} found...`;
                                message.channel.send(dbMessage);
                            });

                            break;


                        case "set":
                                    // field = args[4].toLowerCase();
                                    // newValue = args[5].toLowerCase();
                        default:
                            break;
                    }

                }

//uodate-char Lis class set Rogue level 2

            } else {
                message.channel.send(`Usage: \`${prefix}update-char <character name> <field to update> <new value>\``);
            }

            break;

        case "dev-char":
        case "dev-class":
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
            let error = false;

            if (pruneCharsPrimed || pruneClassesPrimed) {
                if (pruneCharsPrimed)
                    Character.deleteMany({}, (err, character) => {
                        if (err) error = true;
                        else dbMessage = "YOU KILLED THEM ALL! OH THE HUMANITY!";
                    });
                if (pruneClassesPrimed)
                    Class.deleteMany({}, (err, charClass) => {
                        if (err) error = true;
                        else dbMessage = "No more classes... What are you, a communist?";
                });

                if (pruneCharsPrimed && pruneClassesPrimed)
                    if (error) dbMessage = "Error connecting to the DB...";
                    else dbMessage = "Deleting everything!";
            } else dbMessage = `Type \`${prefix}prune if you wish to prune the database\``;

            message.channel.send(dbMessage);

        default:
            prunePrimed = false;
            break;
    }

    switch (command) {
        case "dev-char":
            if (args[0]) {
                let nameLower = args[0].toLowerCase();
                Character.findOne({ nameLower }, (err, character) => {
                    if (err) dbMessage = "Error connecting to DB...";

                    console.log(character);
                    message.channel.send(`${character}`);
                });

            }

            break;

        case "dev-class":
            if (args[0]) {
                let nameLower = args[0].toLowerCase;
                Class.findOne({ nameLower }, (err, dbClass) => {
                    if (err) dbMessage = "Error connecting to DB...";

                    console.log(dbClass);
                    message.channel.send(dbClass);
                });

            }

            break;
    }
});


client.login(token);
