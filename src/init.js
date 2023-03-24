const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const hummus = require('muhammara');

function init() {
    console.log(chalk.cyan('\nStoryTeller Post Processing'));
    console.log('This script will create a copy of the input PDF, find a string within that copy and replace it with the requested value. The modified copy can be found at the requested output location\n');

    const { inputFile, outputFile, find, replace, enableLogs } = getArgs();
    const pdfReader = createPdfReader({ inputFile });
    const pdfWriter = createPdfWriter({ inputFile, outputFile });

    if (enableLogs) {
        console.log(chalk.cyan('\nInput arguments:'));
        console.log(`\tInput file: ${inputFile} (${pdfReader.getPagesCount()} pages)`);
        console.log(`\tOutput file: ${outputFile}`);
        console.log(`\tFind string: ${find}`);
        console.log(`\tReplace string: ${replace}`);
    }

    return {
        pdfReader,
        pdfWriter,
        findString: find,
        replaceString: replace,
        enableLogs,
        outputFile,
    };
}

function getArgs() {
    const args = yargs(hideBin(process.argv)).argv;
    let invalidArgs = false;

    if (!args.input) {
        invalidArgs = true;
        console.log(chalk.red('Missing required --input argument. Example: --input=example.pdf'));
    }

    if (!args.output) {
        invalidArgs = true;
        console.log(chalk.red('Missing required --output argument. Example: --output=example.pdf'));
    }

    if (!args.find) {
        invalidArgs = true;
        console.log(chalk.red('Missing required --find argument. Example: --find={name}'));
    }

    if (!args.replace) {
        invalidArgs = true;
        console.log(chalk.red('Missing required --replace argument. Example: --replace=MyName'));
    }

    if (invalidArgs) {
        process.exit();
    }

    return {
        inputFile: args.input,
        outputFile: args.output,
        find: args.find,
        replace: args.replace,
        enableLogs: args.logs === 'true'
    };
}

function createPdfReader({
    inputFile
}) {
    let pdfReader;
    try {
        pdfReader = hummus.createReader(inputFile);
        console.log(`Valid input pdf containing ${pdfReader.getPagesCount()} page(s).`);
    } catch (ex) {
        console.log(chalk.red('Unable to create PDF reader. Invalid PDF or file path? Please check the --input argument.'));
        console.log(chalk.red(`ErrorMessage: ${ex}`));
        process.exit();
    }

    return pdfReader;
}

function createPdfWriter({
    inputFile,
    outputFile,
}) {
    let readStream;
    let writeStream;
    try {
        readStream = new hummus.PDFRStreamForFile(inputFile);
        writeStream = new hummus.PDFWStreamForFile(outputFile);
    } catch (ex) {
        console.log(chalk.red('Unable to create PDF writer. Invalid PDF or file path? Please check the --input and --output arguments.'));
        console.log(chalk.red(`ErrorMessage: ${ex}`));
        process.exit();
    }

    return hummus.createWriterToModify(
        readStream,
        writeStream, {
        compress: false
    });
}

module.exports = {
    init,
};