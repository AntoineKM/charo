import InstagramController from "../../../controllers/instagram";

const instagramUserHandler = async (req) => {
  const { token } = req.body;
  const { username } = req.params;
  const user = await InstagramController.getUser(token || "", username);
  return { user };
};

instagramUserHandler.method = "POST";
export default instagramUserHandler;
