# StoryTeller Post Processing
The goal of the script is to edit a StoryTeller PDF post-generation in order to change a string on the cover page of that PDF.

The script will first create a copy of a PDF, then find a string on the cover page of that copied PDF, and replace that string with the requested value. The modified copy can be found at the requested output location.

## How to use

`stpdf --input="./path-to-pdf/report.pdf" --output="./path-to-output-folder/report.pdf" --find="{client_name}" --replace="My Name"`

When using a released version `stpdf` should be replaced with the path to the executable.

## Input Parameters

| Parameter | Description |
| ----------- | ----------- |
| --input* | Path to the input PDF file |
| --output* | Path to the desired output location for the modified PDF |
| --find* | A string that should be replaced within the PDF (note: The script will only replace the first occurrence, see *limitations*.) |
| --replace* | The replacement string, the --find value will be replaced with this.  |
| --debug (optional) | If set to "true", this will enable more detailed logs of the replacement process. Useful for debugging. |

## Limitations
- **This script is designed to replace the "addressing" string on the cover page of the StoryTeller PDF.** It is not designed to work on other PDF documents or other elements within the StoryTeller PDF.
- **Only characters in the latin 1 character set can be used.** PDF creates subsets of fonts and only includes characters that are required to render the PDF. Meaning all characters in the --replace string need to be included in the PDF already, this will be handled by the StoryTeller PDF renderer.
- **The replace value must be unique, since the first occurence of a text element gets replaced.**

## Releases
The latest executable version of the script can be found under [releases](https://github.com/investsuite/storyteller-pdf-post-processing/releases). It is built using [pkg](https://github.com/vercel/pkg) so you don't need to install node on your machine. It contains a version for Windows, Mac and Linux. If you want to build your own executable you clone this repo and run `npm run build` yourself.
