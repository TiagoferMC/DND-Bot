const { mongoConnectionString, token } = require('./config.json');
let { prefix } = require('./config.json');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const Character = require('./characterSchema.js');
const classSchema = require('./classSchema.js');

const Class = mongoose.model("Class", classSchema);

mongoose.connect(mongoConnectionString, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }, err => {
   if (err) throw err;
    console.log("Connected to MongoDB!");
});

const client = new Discord.Client();

function sendMessage( message, content) {
    message.channel.send(content);
}


client.once("ready", () => {
    console.log("Discord Bot Ready!");
})

let pruneCharsPrimed = false;
let pruneClassesPrimed = false;

client.on("message", message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'prefix':
            if (args[0]) {
                prefix = args[0];
                sendMessage(message, `Prefix changed to ${prefix}`);
            } else {
                sendMessage(message, `Usage \`${prefix}prefix <new prefix>\``);
            }

            break;

        case 'create-char':
        case 'create-character':
            if (args[0]) {
                let name = args[0];
                let nameLower = name.toLowerCase();

                Character.findOne({ nameLower }).exec((err, matchedChar) => {
                    if (err) sendMessage(message, "Error creating Character...");
                    else if (matchedChar)
                            sendMessage(message, `There already exists a Character named ${matchedChar.name}. Character names must be unique.`);
                    else {
                        character = new Character({
                            name,
                            nameLower: name.toLowerCase()
                        });
                        character.save((err, dbCharacter) => {
                            if (err) sendMessage(message, "Error creating Character...");
                            else sendMessage(message, `Successfully created Character: ${dbCharacter.name}`);
                        });
                    }
                });

                break;
            } else {
                sendMessage(message, `Usage \`${prefix}create <character name>\``);
            }

            break;

        case 'create-class':
            if (args[0]) {
                let name = args[0];
                let nameLower = name.toLowerCase();

                Class.findOne({ nameLower }).exec((err, matchedClass) => {
                    if (err) sendMessage(message, "Error creating Class...");
                    else if (matchedClass)
                            sendMessage(message, `There already exists a ${matchedClass.name} Class.`);
                    else {
                        charClass = new Class({
                            name,
                            nameLower: name.toLowerCase()
                        });
                        charClass.save((err, dbClass) => {
                            if (err) sendMessage(message, "Error creating Class...");
                            else sendMessage(message, `Successfully created Class: ${dbClass.name}`);
                        });
                    }
                });

                break;

            } else {
                sendMessage(message, `Usage \`${prefix}create <class name>\``);
            }

            break;

        case 'find-char':
        case 'find-character':
            if (args[0]) {
                let name = args[0];
                let nameLower = name.toLowerCase();
                Character.findOne({ nameLower }, (err, character) => {
                    if (err) sendMessage(message, "Error finding Character...");
                    else if (character) {
                        let msgContent = `\`\`\`Name: ${character.name}\nRace: ${character.race}\nClasses:\n`;

                        character.classes.forEach(charClass => {
                            msgContent += `-${charClass.name}\n  Level: ${charClass.level}\n`;
                        });

                        msgContent += `Background: ${character.background}\nHP: ${character.hp}\nAC: ${character.ac}\nCreated: ${character.created}\`\`\``;

                        sendMessage(message, msgContent);
                    } else sendMessage(message, `No Character "${name}" found...`);

                });

            } else sendMessage(message, `Usage \`${prefix}find <character name>\``);

            break;

        case 'list-characters':
        case 'list-chars':
            Character.find({}, 'name').sort('created').exec((err, characters) => {
                if (err) sendMessage(message,  "Error listing Characters...");
                else if (Array.isArray(characters) && characters.length) {
                    let msgContent = "";
                    characters.forEach(character => {msgContent += character.name + "\n"});
                    sendMessage(message, msgContent);
                }
                else sendMessage(message, "No Characters in DB...");

            });

            break;
       case 'list-classes':
            Class.find({}, 'name').sort('created').exec((err, charClasses) => {
                if (err) sendMessage(message, "Error listing Classes...");
                else if (Array.isArray(charClasses) && charClasses.length) {
                    let msgContent = "";
                    charClasses.forEach(charClass => {msgContent += charClass.name + "\n"});
                    sendMessage(message, msgContent);
                }
                else sendMessage(message, "No Classes in DB...");
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
                    if (err) sendMessage(message, "Error deleting Character...");
                    else sendMessage(message, character ? `Deleted Character: ${name}` : `Character ${name} not found...`);
                });
            } else {
                sendMessage(message, `Usage \`${prefix}delete-char <character name>\``);
            }

            break;

        case 'del-class':
        case 'delete-class':
            if (args[0]) {
                let name = args[0];
                let nameLower = name.toLowerCase();
                Class.findOneAndDelete({ nameLower }, (err, charClass) => {
                    if (err) sendMessage(message, "Error deleting Class...");
                    else sendMessage(message,  charClass ? `Deleted Class: ${name}` : `Class ${name} not found...`);
                });
            } else {
                sendMessage(message, `Usage \`${prefix}delete-class <class name>\``);
            }

            break;

        case 'prune':
            sendMessage(message, `Use \`${prefix}prune-chars\` to prune the characters database, \`${prefix}prune-classes\` to prune the classes database, or \`${prefix}prune-all\` to prune \*\*ALL\*\* databases.`);
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

                if (field !== "class" && field !== "name") {
                    if (intFields.includes(field) && !parseInt(newValue)) {
                        sendMessage(message, `${field} must be an Integer.`);
                        break;
                    }
                    Character.findOneAndUpdate({ nameLower }, {[field]: newValue}, (err, character) => {
                        if (err) sendMessage(message, "Error updating Character...");
                        else  sendMessage(message, character ? `${character.name}'s ${field} changed to ${newValue}` : `No character ${name} found...`);
                    });

                } else if (field === "name") {
                    Character.findOne({ nameLower: newValue.toLowerCase()}, (err, matchedChar) => {
                        if (err) sendMessage(message, "Error updating Character...");
                        else if (matchedChar) sendMessage(message, `There already exists a Character named ${matchedChar.name}. Character names must be unique.`);
                        else {
                            Character.findOneAndUpdate({ nameLower }, {name: newValue, nameLower: newValue.toLowerCase()}, (err, character) => {
                                    if (err) sendMessage(message, "Error updating Character...");
                                    else  sendMessage(message, character ? `${character.name}'s name changed to ${newValue}` : `No character ${name} found...`);
                            });
                        }
                    });
                } else {
                    let operation = args[2].toLowerCase();
                    let className = args[3];
                    let classNameLower = className.toLowerCase();

                    switch (operation) {

                        case "add":
                            Class.findOne({nameLower: classNameLower}, (err, charClass) => {
                                if (err) sendMessage(message, "Error adding Class...");
                                else if (charClass)
                                    Character.findOne({ nameLower }, (err, character) => {
                                        if (err) sendMessage(message, "Error adding Class...");
                                        else if (character) {
                                            character.classes.forEach(characterClass => {
                                                if (characterClass.nameLower === classNameLower) {
                                                    sendMessage(message, `Character ${character.name} already has the ${charClass.name} class.`);
                                                }
                                            });

                                            character.classes.push(charClass);
                                            character.save((err, charObj) => {
                                                if (err) sendMessage(message, "Error adding Class...");
                                                else sendMessage(message, `Successfully added Class ${charClass.name} to Character ${charObj.name}`);
                                            });

                                        } else {
                                            sendMessage(message, `No character ${name} found...`);
                                        }
                                    });
                                else
                                    sendMessage(message, `Class ${className} does not exist. please add it with \`${prefix}create-class\`.`);
                            });

                            break;
                        case "remove":
                            Character.findOne({ nameLower }, (err, character) => {
                                if (err) sendMessage(message, "Error removing class...");
                                else if (character) {
                                    classObj = character.classes.filter(charClass => charClass.nameLower === classNameLower);

                                    if (classObj.length) {
                                        character.classes.pull(classObj[0]);
                                        character.save((err, charObj) => {
                                            if (err) sendMessage(message, "Error removing class...");
                                            else sendMessage(message, `Successfully removed Class ${classObj[0].name} from Character ${charObj.name}`);
                                        });
                                    } else sendMessage(message, `Character ${character.name} does not have the ${className} class.`);
                                } else sendMessage(message, `No character ${name} found...`);
                            });

                            break;
                        case "set":
                            if (args[4] && args[5]) {
                                field = args[4].toLowerCase();
                                newValue = args[5];

                                 if (intFields.includes(field) && !parseInt(newValue)) {
                                    sendMessage(message, `${field} must be an Integer.`);
                                    break;
                                 }

                                Character.findOne({ nameLower }, (err, character) => {
                                    if (err) sendMessage(message, "Error updating character...");
                                    else if (character) {
                                        index = character.classes.findIndex(charClass => charClass.nameLower === classNameLower);
                                        if (index !== -1) {
                                            character.classes[index][field] = newValue;
                                            character.save((err, charObj) => {
                                                if (err) sendMessage(message, "Error updating character...");
                                                else sendMessage(message, `${character.name}'s ${character.classes[index].name} ${field} changed to ${newValue}`);
                                            });
                                        } else sendMessage(message, `Character ${character.name} does not have the ${className} class.`);

                                    } else sendMessage(message, `No character ${name} found`);
                                });

                            } else {
                                sendMessage(message, `Usage: \`${prefix}update-char <character name> class set <class> <property> <value>\``);
                            }
                        default:
                            break;
                    }
                }
            } else {
                sendMessage(message, `Usage: \`${prefix}update-char <character name> <field to update> <new value>\``);
            }
            break;
        case "prune-juice":
            sendMessage(message, "https://shintadaniel.files.wordpress.com/2013/02/20130206-145956.jpg");
            break;
        case "dev-char":
        case "dev-class":
            break;
        default:
            sendMessage(message, "Unknown command...");
            break;
    }

    switch (command) {
        case 'prune-chars':
        case 'prune-characters':
            sendMessage(message, `WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN THE CHARACTERS DATABASE! THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            pruneCharsPrimed = true;
            pruneClassesPrimed = false;
            break;
        case 'prune-classes':
            sendMessage(message, `WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN THE CLASSES DATABASE! THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            pruneClassesPrimed = true;
            pruneCharsPrimed = false;
            break;
        case 'prune-all':
            sendMessage(message, `WARNING: YOU ARE ABOUT TO DELETE EVERY ENTRY IN ALL OF THE DATABASES! THIS ACTION CANNOT BE REVERTED! IF YOU'RE SURE ABOUT THIS, TYPE \`${prefix}prune-confirm\` TO PROCEED OR ANYTHING ELSE TO IGNORE`);
            pruneCharsPrimed = true;
            pruneClassesPrimed = true;
            break;
        case 'prune-confirm':

            if (pruneCharsPrimed || pruneClassesPrimed) {
                let error = false;
               // let msgContent = "";
                if (pruneCharsPrimed)
                    Character.deleteMany({}, (err, character) => {
                        if (err) error = true;
                        else sendMessage(message, "YOU KILLED THEM ALL! OH THE HUMANITY!");
                    });

                if (pruneClassesPrimed)
                    Class.deleteMany({}, (err, charClass) => {
                        if (err) error = true;
                        else sendMessage(message, "No more classes... What are you, a communist?");
                    });

                if (pruneCharsPrimed && pruneClassesPrimed)
                    if (error) sendMessage(message, "Error connecting to the DB...");
                   // else msgContent = "Deleting everything!";

            } else sendMessage(message, `Type \`${prefix}prune if you wish to prune the database\``);
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
                    sendMessage(message, `${character}`);
                });

            }

            break;

        case "dev-class":
            if (args[0]) {
                let nameLower = args[0].toLowerCase;
                Class.findOne({ nameLower }, (err, dbClass) => {
                    if (err) dbMessage = "Error connecting to DB...";

                    console.log(dbClass);
                    sendMessage(message, dbClass);
                });

            }

            break;
    }
});

client.login(token);
