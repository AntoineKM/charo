import { fetcher, routes } from "@services/api";
import useLocalStorage from "use-local-storage";
import useSWR from 'swr';

const InstagramPage = () => {
  const [tokens] = useLocalStorage<string>("tokens", JSON.stringify({}));
  // swr post with body.token = tokens.instagram
  console.log(JSON.parse(tokens).instagram);
  const { data } = useSWR(routes.v1.instagram.me, url => fetcher(url, { 
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: JSON.parse(tokens).instagram })
  }));

  if (!data) {
    return <div>Loading...</div>;
  }
  console.log(data);

  return (
    <div>
      <h1>Instagram</h1>
      <p>You are connected as {data.user.username}</p>
      <img src={data.user.profile_pic_url} alt="profile" />
    </div>
  );
};

export default InstagramPage;