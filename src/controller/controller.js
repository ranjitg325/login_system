const userModel = require("../model/model.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const emailValidator = require('validator')
const mongoose = require("mongoose")
const isValidObjectId = (objectId) => mongoose.Types.ObjectId.isValid(objectId)



const isValidValue = (value) => {
    if (typeof value === "undefined" || value === null)
        return false;
    if (typeof value === "string" && value.trim().length === 0) 
        return false;
    return true;
};

const isValidDetails = (requestBody) => Object.keys(requestBody).length > 0;

//============================Creating a user=============================//


const createUser = async (req,res) =>{
    try{
        let data = req.body
        let {name,email,phone,password}= data


        //===============validations start================================//

        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, message: "please provide user data" })
        }
        if (!isValidValue(name)) {
            return res.status(400).send({ status: false, messege: "please provide name" })
        }

        //==============Email===========//

         if (!isValidValue(email)) {
            return res.status(400).send({ status: false, messege: "please provide email" })
        }
    
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
        }
    
        let isDuplicateEmail = await userModel.findOne({ email })
        if (isDuplicateEmail) {
            return res.status(400).send({ status: false, message: "email already exists" })
        }
        
          //====================Phone=============//

          if (!isValidValue(phone)) {
            return res.status(400).send({ status: false, messege: "please provide phone" })
        }
        let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
        if (!isValidPhone) {
            return res.status(400).send({ status: false, message: "please provide valid phone number" })
        }
        let isDuplicatePhone = await userModel.findOne({ phone })
        if (isDuplicatePhone) {
            return res.status(400).send({ status: false, message: "phone no. already exists" })
        }
        
        //======================Password==================//

        if (!isValidValue(password)) {
            return res.status(400).send({ status: false, messege: "please provide password" })
        }

        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }
  
      

        //==============Bcrypt password ======================//

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)


        //=========User is creating here=================//
        const finalDetails = {name,email,phone,password}
        let savedData = await userModel.create(finalDetails)
        return res.status(201).send({ status: true, msg: "user created successfully", data: savedData });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




//************  user login  ******************************** */

const userLogin = async function(req,res){
    try{
         let data =req.body;
         if(Object.keys(data).length==0){
             res.status(400).send({status:false,msg:"kindly pass Some Data"})
         }

         let {email, password} = data
         if(!email){
            return res.status(400).send({ status: false, msg: " Email is required" })
        }

        const isValidEmail = emailValidator.isEmail(email)
        if (!isValidEmail) {
         return res.status(400).send({ status: false, msg: " invalid email" })
    }

        
         if (!password){
        return res.status(400).send({ status: false, msg: "Password is required" })
         }

         let user = await userModel.findOne({email});
         if(!user)
             return res.status(404).send({
                status : false,
                msg:"Login failed! No user found with the provided email.",
             });
         //=============comparing the password==============//
        const isValidPassword = await bcrypt.compare(password, user.password)

       if (!isValidPassword) return res.status(404).send({status: false,msg: "Login failed! Wrong password.",});

    
         let token = jwt.sign({
              userId: user._id,
            },"loginProject",{expiresIn:"3600s"},
            );
            res.setHeader("x-api-key",token);
          return res.status(201).send({status: true,msg:'sucess', data: token})
          
    }
    catch (err) {
       res.status(500).send({ Error: err.message })
    }
}


//===================Get user Details by authorization===================//




const getUserHomePage = async (req,res) =>{
    try{
        const userIdFromParams = req.params.userId;
        const userIdfromToken = req.userId
    
    
    if(!isValidObjectId(userIdFromParams)){
        return res.status(400).send({status:false,messege:"UserId is invalid"})
    }
    
    const userByuserId = await userModel.findById(userIdFromParams)
    
    if (!userByuserId) {
        return res.status(404).send({ status: false, message: 'user not found.' });
    }
    
    //=========Authorization checking ==============//
    
    if (userIdfromToken != userIdFromParams) {
        return res.status(403).send({
          status: false,
          message: "Unauthorized access.",
        });
    }
    
    return res.status(200).send({ status: true, message: "User details", data: userByuserId });
    
    } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
    }
}

//===================update homePage===================//

const userUpdate = async function (req, res) {
    try {

    let userIdFromParams = req.params.userId;
    const userIdFromToken = req.userId

     if (!isValidObjectId(userIdFromParams)) {
        res.status(400).send( { status : false , message : `${userIdFromParams} is Not a Valid user id` } )
        return
     }

    if (!isValidObjectId(userIdFromToken)) {
        res.status(400).send( { status : false , message : `${userIdFromToken} is Not a Valid token id` } )
        return
    }
     const rightUser = await userModel.findOne( { _id: userIdFromParams } )

    if(!rightUser) {
        res.status(404).send({ status : false , message : "user Not Found" } )
        return
    }

    if (userIdFromToken != userIdFromParams) {
        return res.status(403).send({
          status: false,
          message: "Unauthorized access.",
        });
    }
    
    let userData = req.body
    if (Object.keys(userData).length == 0) {
        return res.status(400).send({ status: false, msg: "Please provide some data for update" })
    }
    let {name,email,phone,password}= userData

    if (!isValidValue(name)) {
        return res.status(400).send({ status: false, messege: "please provide name" })
    }

    if (!isValidValue(password)) {
        return res.status(400).send({ status: false, messege: "please provide password" })
    }

    if (password.length < 8 || password.length > 15) {
        return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt)

    //==============Email===========//

    if (!isValidValue(email)) {
        return res.status(400).send({ status: false, messege: "please provide email" })
    }

    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
        return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
    }

    let isDuplicateEmail = await userModel.findOne({ email })
    if (isDuplicateEmail) {
        return res.status(400).send({ status: false, message: "email already exists" })
    }

    if (!isValidValue(phone)) {
        return res.status(400).send({ status: false, messege: "please provide phone" })
    }
    let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
    if (!isValidPhone) {
        return res.status(400).send({ status: false, message: "please provide valid phone number" })
    }
    let isDuplicatePhone = await userModel.findOne({ phone })
    if (isDuplicatePhone) {
        return res.status(400).send({ status: false, message: "phone no. already exists" })
    }
   
    const finalDetails = {name,email,phone,password}

    let updateUser = await userModel.findOneAndUpdate({ _id: userIdFromParams },finalDetails, { new: true })
    res.status(200).send({ status: true, message: 'success', data: updateUser });

}
catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, msg: error.message })
}
}


module.exports.createUser = createUser
module.exports.userLogin = userLogin
module.exports.getUserHomePage = getUserHomePage
module.exports.userUpdate = userUpdate
