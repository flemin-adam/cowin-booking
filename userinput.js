const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, (input) => resolve(input));
    });
}

module.exports = ask;