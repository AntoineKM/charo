import { fetcher, routes } from '@services/api';
import { Button, Container, Input, Link, Text } from '@tonightpass/kitchen'
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import useLocalStorage from 'use-local-storage';

const HomePage: NextPage = () => {
  const router = useRouter();
  const [service, setService] = React.useState<string>("instagram");
  const [tokens, setTokens] = useLocalStorage<string>("tokens", JSON.stringify({}));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/dashboard/${service}`);
  }

  return (
      <Container align={"center"} justify={"center"} gap={"normal"} style={{ height: "100%"}}>
        <Text as={"h1"} size={"title"} weight={"bold"}>Charo</Text>
        <Text size={"medium"}>Stop buying followers, get real prospects!</Text>
        <Container
            as={"form"} 
            gap={"normal"}
            row
            align={"center"}
            flex={0}
            onSubmit={handleSubmit}
          >
          <Input 
            prefix={
              <select 
                style={{
                  color: "white",
                  fontSize: "12px",
                  background: "rgb(17,19,21)"
                }}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setService(event.target.value)}
              >
                <option value={"instagram"}>Instagram</option>
                <option value={"twitter"}>Twitter</option>
                <option value={"tiktok"}>TikTok</option>
              </select>
            } 
            suffix={<Button variant={"ghost"} 
            size={"small"}>Login</Button>} 
            prefixStyling={false}
            suffixStyling={false}
            placeholder={"token"}
            // tokens.instagram = value
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTokens(
              JSON.stringify({ ...JSON.parse(tokens), [service]: event.target.value })
            )}
            value={JSON.parse(tokens)[service]}
          />
        </Container>
      </Container>
  )
}

export default HomePage;