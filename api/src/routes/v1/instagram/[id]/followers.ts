import InstagramController from "../../../../controllers/instagram";

const instagramUserFollowersHandler = async (req) => {
  const { token, count } = req.body;
  const { id } = req.params;
  const followers = await InstagramController.getUserFollowers(
    token || "",
    id,
    count
  );
  return { ...followers };
};

instagramUserFollowersHandler.method = "POST";
export default instagramUserFollowersHandler;
