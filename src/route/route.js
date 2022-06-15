const express = require("express")
const router = express.Router()


const UserController = require("../Controller/controller.js")
const middleware = require("../middleware/auth.js")

//========API===============//

router.post('/signup',UserController.createUser)
router.post('/loginUser' ,UserController.userLogin)
router.get("/homePage/:userId",middleware.authentication, UserController.getUserHomePage)
router.put("/update/:userId",middleware.authentication,UserController.userUpdate)
router.get('/logout',middleware.authentication, (req, res) => {
    const token = req.headers["x-api-key"]
    res.clearCookie('token');
    return res.status(200).send("logout successfully");
  });


module.exports = router;