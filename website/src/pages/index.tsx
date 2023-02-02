import { Button, Container, Input, Link, Text } from '@tonightpass/kitchen'
import { NextPage } from 'next';

const HomePage: NextPage = () => {
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
            onSubmit={() => {console.log("sent")}}
          >
          <Input 
            prefix={
              <select 
                style={{
                  color: "white",
                  fontSize: "12px",
                  background: "rgb(17,19,21)"
                }}
              >
                <option>Instagram</option>
                <option>Twitter</option>
                <option>TikTok</option>
              </select>
            } 
            suffix={<Button variant={"ghost"} 
            size={"small"}>Login</Button>} 
            prefixStyling={false}
            suffixStyling={false}
            placeholder={"token"}
          />
        </Container>
      </Container>
  )
}

export default HomePage;