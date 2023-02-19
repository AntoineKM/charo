import InstagramController from "../../../controllers/instagram";

const instagramMeHandler = async (req) => {
  const { token } = req.body;
  const user = await InstagramController.me(token || "");

  return { user };
};

instagramMeHandler.method = "POST";
export default instagramMeHandler;
