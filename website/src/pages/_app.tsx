import { KitchenProvider } from "@tonightpass/kitchen";
import { AppProps } from "next/app";

import "@tonightpass/kitchen/fonts.css";
import Head from "next/head";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <KitchenProvider>
      
      <Head>
        <title>Charo</title>
        <meta name="description" content="Stop buying followers, get real prospects!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </KitchenProvider>
  );
};

export default App;
