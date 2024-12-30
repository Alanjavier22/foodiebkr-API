import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

export default {
  Roboto: {
    normal: path.join(__dirname, "./fonts/Roboto/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "./fonts/Roboto/Roboto-Medium.ttf"),
    italics: path.join(__dirname, "./fonts/Roboto/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "./fonts/Roboto/Roboto-MediumItalic.ttf"),
  },
};
