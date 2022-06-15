const jwt = require("jsonwebtoken")

const authentication = function (req, res, next) {
    try {
        const token = req.headers["x-api-key"]
        if (!token)
            return res.status(403).send({ status: false, msg: "Token is required in Header" })

        const decodedToken = jwt.verify(token, "loginProject")
       if (!decodedToken){
           res.status(403).send({status:false,msg:"invalid token present"})
           return
       }
       //authorisation part
       req.userId = decodedToken.userId;
       next()
    }catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.authentication=authentication