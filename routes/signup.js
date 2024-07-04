const express = require('express')
const router = express.Router();
const validate = require('../validators/signup').validate;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const _ = require('lodash');

router
    .route('/')
    .post(async(req,res) => {
        const {error} = await validate(req.body);
        if (error) return res.status(400).send(error);

        const {email,password,confirmPassword, ...otherData} = req.body;

        try{
            const checkUser = await User.findOne({where: {email}});
            if (checkUser) return res.status(400).send('User already registered');
            
            if(password !== confirmPassword) return res.status(400).send("Password does not match");

            const salt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(password,salt);
            const user = await User.create({email,password: hashedpassword,...otherData});

            return res.status(201).send(_.pick(user,['id','fullName','email']));
        }catch(err){
            res.status(500).send(err.message);
        }
    })

module.exports = router