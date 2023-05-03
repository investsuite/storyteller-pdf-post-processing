
🚧 **This project is still in development and not ready to be used.**

# StoryTeller Post Processing
This repository contains a script to replace text on the cover of a StoryTeller PDF.

The script will create a copy of a PDF, find a string on the cover page of that copy and replace it with the requested value. The modified copy can be found at the requested output location.

## Example

`stpdf --input="./path-to-pdf/report.pdf" --output="./path-to-output-folder/report.pdf" --find="string to replace" --replace="anything" --logs=true`

## Input Parameters

| Parameter | Description |
| ----------- | ----------- |
| --input* | Path to the input PDF file |
| --output* | Path to the desired output location for the modified PDF |
| --find* | A string that should be replaced within the PDF (note: The script will only replace the first occurrence, see *limitations*.) |
| --replace* | The replacement string, the --find value will be replaced with this.  |
| --logs (optional) | If set to "true", this will enable more detailed logs of the replacement process. Useful for debugging. |

## Limitations
- This script only replaces text on the cover page of the pdf.
- This project is designed to work for StoryTeller reports and will likely not work on other PDFs, because of the various ways a PDF can include text.
- All characters in the --replace string need to be included in the PDF already. Since PDF creates subsets of fonts and only includes characters that are required to render the PDF. This will be handled by the StoryTeller PDF, but you could encounter issues when trying to use uncommon characters.
- The script **can only find and replace the first occurence of a text element**. Please make sure the requested --find value is unique in the PDF and only occurs once.
- The PDF needs to be constructed in a specific way (to be further documented). currently not all StoryTeller reports will be able to use this functionality out of the box.