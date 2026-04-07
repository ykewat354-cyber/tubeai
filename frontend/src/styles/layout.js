export default function RootLayout({ children }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <title>TubeAI - AI YouTube Idea & Script Generator</title>
      </head>
      <body>{children}</body>
    </html>
  `;
}
