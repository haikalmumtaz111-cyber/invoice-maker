import { Font } from '@react-pdf/renderer';
import type { FontKey } from '../types';

import jakarta400 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff?url';
import jakarta700 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff?url';
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import plex400 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff?url';
import plex700 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff?url';
import grotesk400 from '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff?url';
import grotesk700 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff?url';
import lora400 from '@fontsource/lora/files/lora-latin-400-normal.woff?url';
import lora700 from '@fontsource/lora/files/lora-latin-700-normal.woff?url';
import playfair400 from '@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff?url';
import playfair700 from '@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff?url';
import mono400 from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff?url';
import mono700 from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff?url';
import poppins400 from '@fontsource/poppins/files/poppins-latin-400-normal.woff?url';
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff?url';
import montserrat400 from '@fontsource/montserrat/files/montserrat-latin-400-normal.woff?url';
import montserrat700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff?url';
import outfit400 from '@fontsource/outfit/files/outfit-latin-400-normal.woff?url';
import outfit700 from '@fontsource/outfit/files/outfit-latin-700-normal.woff?url';
import fraunces400 from '@fontsource/fraunces/files/fraunces-latin-400-normal.woff?url';
import fraunces700 from '@fontsource/fraunces/files/fraunces-latin-700-normal.woff?url';
import dmserif400 from '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff?url';
import spacemono400 from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff?url';
import spacemono700 from '@fontsource/space-mono/files/space-mono-latin-700-normal.woff?url';
import arimo400 from '@fontsource/arimo/files/arimo-latin-400-normal.woff?url';
import arimo700 from '@fontsource/arimo/files/arimo-latin-700-normal.woff?url';
import tinos400 from '@fontsource/tinos/files/tinos-latin-400-normal.woff?url';
import tinos700 from '@fontsource/tinos/files/tinos-latin-700-normal.woff?url';

const FILES: Partial<Record<FontKey, [string, string]>> = {
  jakarta: [jakarta400, jakarta700],
  inter: [inter400, inter700],
  plex: [plex400, plex700],
  grotesk: [grotesk400, grotesk700],
  lora: [lora400, lora700],
  playfair: [playfair400, playfair700],
  mono: [mono400, mono700],
  poppins: [poppins400, poppins700],
  montserrat: [montserrat400, montserrat700],
  outfit: [outfit400, outfit700],
  fraunces: [fraunces400, fraunces700],
  // DM Serif Display ships in one weight only; bold text reuses it instead of falling back to Helvetica.
  dmserif: [dmserif400, dmserif400],
  spacemono: [spacemono400, spacemono700],
  // react-pdf's built-in Helvetica/Times fail to load in this bundle ("unitsPerEm" error), so the
  // metric-compatible Arimo and Tinos stand in for them under the same keys.
  helvetica: [arimo400, arimo700],
  times: [tinos400, tinos700],
};

let registered = false;

export function registerFonts() {
  if (registered) return;
  registered = true;
  for (const [key, [regular, bold]] of Object.entries(FILES) as [FontKey, [string, string]][]) {
    Font.register({
      family: key,
      fonts: [
        { src: regular, fontWeight: 400 },
        { src: bold, fontWeight: 700 },
      ],
    });
  }
  // Default hyphenation splits Indonesian words at odd places; wrap on whole words only.
  Font.registerHyphenationCallback((word) => [word]);
}

export function family(key: FontKey): string {
  return FILES[key] ? key : 'helvetica';
}
