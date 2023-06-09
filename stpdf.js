/**
 * Parts of this script are based on the following example: https://github.com/galkahana/HummusJSSamples/blob/master/text-extraction/lib/text-extraction.js
 * A useful article explaining its workings can be found here: https://www.pdfhummus.com/post/156548561656/extracting-text-from-pdf-files
 * This script modernizes some parts of the example that are relevant for our usecase and
 * extends its functionality by adding replacement logic to replace the extracted text within the PDF.
 */

const chalk = require('chalk');
const { logTextElements } = require('./src/debug');
const { init } = require('./src/init');
const { getResources } = require('./src/resources');
const { replaceText } = require('./src/text-replace');

findAndReplaceInPdf();

function findAndReplaceInPdf() {
    // Initialize a PDF reader & writer based on the input
    const { pdfReader, pdfWriter, findString, replaceString, enableDebugLogs, outputFile } = init();

    // Only parse the first page of the PDF (the cover page of the report)
    // as it is the only page where we will be replacing text
    const pageDictionary = pdfReader.parsePageDictionary(0);

    // Get the font data from the first page of the PDF
    const resources = getResources({ pageDictionary, pdfReader });

    if (enableDebugLogs) {
        console.log(chalk.cyan('\nAll resources on the first page:'));
        console.log(resources);
        logTextElements({ pageDictionary, pdfReader, resources });
    }

    const { success, error } = replaceText({
        pdfReader,
        pdfWriter,
        resources,
        findString,
        replaceString
    });

    if (success) {
        console.log(chalk.green(`\nSuccesfully replaced "${findString}" with "${replaceString}". The modified PDF can be found at: ${outputFile}\n`));
        return;
    } else {
        console.log(chalk.red('Something went wrong while attempting to replace the text.'));
        console.log(chalk.red(error));
    }
}
