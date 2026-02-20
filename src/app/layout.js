import "./globals.css";

export const metadata = {
  title: "Grid Iron | Fantasy Football Rankings & Draft Tools",
  description: "The ultimate fantasy football platform. Real-time rankings, mock draft simulator, auction tools, dynasty rankings and more.",
  keywords: "fantasy football, rankings, draft, auction, dynasty, PPR, mock draft",
  openGraph: {
    title: "Grid Iron | Fantasy Football Rankings & Draft Tools",
    description: "The ultimate fantasy football platform.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0,padding:0}}>
        {children}
      </body>
    </html>
  );
}