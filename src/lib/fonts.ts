import { Archivo, Archivo_Black, JetBrains_Mono } from 'next/font/google';

export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

export const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const fontsClassName = [
  archivo.variable,
  archivoBlack.variable,
  jetbrainsMono.variable,
].join(' ');
