const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const validate = require('../validators/login').validate;
const User = require('../models/user');
const _ = require('lodash');
const {Op} = require('sequelize');

router
    .route('/')
    .post(async(req,res) => {
        try{
            const {error} = await validate(req.body);
            if (error) return res.status(400).send(error);
            let user = await User.findOne({where: {
                [Op.or] : [
                    {email: req.body.email || null},
                    {number: req.body.number || null}
                ]
            }
        });
            if (!user) return res.status(404).send("User not found");

            const validPass = await bcrypt.compare(req.body.password,user.password);
            if(!validPass) return res.status(400).send("Invalid Email or password");

            const token = await user.generateToken();
            res.header('x-auth-token',token).send(_.pick(user,['id','companyName']));
    }catch(err){
        return res.status(500).send('An error has occured during login');
    }
    })  

module.exports = router;