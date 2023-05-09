
🚧 **This project is still in development and not ready to be used.**

# StoryTeller Post Processing
This repository contains a script to replace text on the cover of a StoryTeller PDF.

The script will create a copy of a PDF, find a string on the cover page of that copy and replace it with the requested value. The modified copy can be found at the requested output location.

## Example

`stpdf --input="./path-to-pdf/report.pdf" --output="./path-to-output-folder/report.pdf" --find="{name}" --replace="My Name"`

## Input Parameters

| Parameter | Description |
| ----------- | ----------- |
| --input* | Path to the input PDF file |
| --output* | Path to the desired output location for the modified PDF |
| --find* | A string that should be replaced within the PDF (note: The script will only replace the first occurrence, see *limitations*.) |
| --replace* | The replacement string, the --find value will be replaced with this.  |
| --debug (optional) | If set to "true", this will enable more detailed logs of the replacement process. Useful for debugging. |

## Limitations
- **This script is designed to replace the addressing string on the cover page of the StoryTeller PDF.** It will likely not work on other PDF documents or other elements within the StoryTeller PDF.
- **Only characters in the latin 1 character set can be used.** PDF creates subsets of fonts and only includes characters that are required to render the PDF. Meaning all characters in the --replace string need to be included in the PDF already, this will be handled by the StoryTeller PDF renderer.
- **The replace value must be unique, since the first occurence of a text element gets replaced.**