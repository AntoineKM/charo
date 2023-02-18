import InstagramController from "../../../controllers/instagram";

const instagramSignInHandler = async (req) => {
  const { token } = req.body;
  const user = await InstagramController.signIn(token || "");

  return { user };
};

instagramSignInHandler.method = "POST";
export default instagramSignInHandler;
