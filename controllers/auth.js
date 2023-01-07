const { verify, sign } = require('jsonwebtoken');
const { findUser, createUser, saveToken, updateUser } = require("../promises/auth")
const { validationResult } = require("express-validator")
const { hash, genSalt, compare } = require("bcryptjs");
const { sendRefreshToken, sendAccessToken } = require("../helper/sendTokens");

const signInUser = async (req, res) => {
    let errors = validationResult(req),
        {username, password, email} = req.body;
       
    //checking for errors in email and password
    if(!errors.isEmpty()) return res.json({
        success: true,
        payload: {
            errors: errors.array(),
            status: 500
        }
    })

    try {
        //check if the user exists
        const sqlFindUser = 'SELECT * FROM user WHERE email = ?;'
        const user = await findUser(sqlFindUser, email)

        if(user.length) return res.json({
            success: true, 
            payload: {
                msg: 'User already exists',
                status: 300
            }
        })
    
        //hash password
        const salt = await genSalt()
        password = await hash(password, salt)

        //create new user
        const sqlCreateUser = 'INSERT INTO user(username, email, password, token) VALUES(?,?,?,?);',
            createdUser = await createUser(sqlCreateUser, email, password, username);
        
        res.status(201).json({
            success: true, 
            payload: {
                createdUser,
                status: 201 
            }
        })

    } catch(error) {
        res.status(500).json({
            success: false, 
            payload: {
                error
            }
        });
    }
}

const logInUser = async (req, res) => {
    let errors = validationResult(req),
        {password, email} = req.body;
       
    //checking for errors in email and password
    if(!errors.isEmpty()) return res.json({
        success: true,
        payload: {
            errors: errors.array(),
            status: 500
        }
    })

    try {
        //find user and compare hash password
        const sqlFindUser = 'SELECT * FROM user WHERE email = ?;'
        const user = await findUser(sqlFindUser, email)
        
        if(!user.length) return res.json({
            success: true, 
            payload: {
                msg: 'Incorrect email or password',
                status: 404
            }
        })
    
        const {password: hashPassword, id, username} = user[0],
            verified = await compare(password, hashPassword);

        if(!verified) return res.json({
            success: true,
            payload: {
                msg: 'Incorrect email or password',
                status: 404
            }
        })
    
        //create access and refresh tokens
        const accessToken = sign({id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'}),
            refreshToken = sign({id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
     
        //save refreshToken in database 
        const sqlSaveToken = 'UPDATE user SET token = ? WHERE id = ?;'
        await saveToken(sqlSaveToken, refreshToken, id)
    
        //send tokens
        sendRefreshToken(res, refreshToken)
        sendAccessToken(res, id, username, email, accessToken)
        
    } catch(error) {
        res.status(500).json({
            success: false, 
            payload: {
                error
            }
        });
    }

    

}

const checkToken = async (req, res) => {
    const token = req.cookies.refreshtoken
    console.log(token)
  
    //validate if token exists
    if(!token) return res.json({
        success: true, 
        payload: {
            status: 404,
            msg: 'You need to log in.'
        }
    })

    //verify token
    try {
        const payload = verify(token, process.env.REFRESH_TOKEN_SECRET)

        //validate user
        const sqlFindUser = 'SELECT * FROM user WHERE id = ?;',
            user = await findUser(sqlFindUser, payload.id);

        if(!user) return res.json({
            success: true, 
            payload: {
                status: 404,
                msg: 'You need to log in.'
            }
        })

        const {id, username, email, token: dbToken} = user[0];

        if(dbToken !== token) return res.json({
            success: true, 
            payload: {
                status: 404,
                msg: 'You need to log in.'
            }
        })

        //create access and refresh tokens
        const accessToken = sign({id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'}),
            refreshToken = sign({id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})

        //save refreshToken in database 
        const sqlSaveToken = 'UPDATE user SET token = ? WHERE id = ?;',
            {changedRows} = await saveToken(sqlSaveToken, refreshToken, id)

        if(!changedRows) return res.json({
            success: true, 
            payload: {
                status: 404,
                msg: 'No token'
            }
        })

        //send tokens
        sendRefreshToken(res, refreshToken)
        res.json({
            success: true, 
            payload: {
                status: 200,
                user : {
                    id,
                    email,
                    username,
                    token: accessToken
                }
            }
        })

    } catch(error) {
        return res.json({
            success: false, 
            payload: {
                error
            }
        })
    }
}

const logOut = async (req, res) => {
    const token = req.cookies.refreshtoken;

    if(!token) return res.json({
        success: true, 
        payload: {
            msg: 'You need to log in.'
        }
    })

    //find user, i need the _id
    try {
        const payload = verify(token, process.env.REFRESH_TOKEN_SECRET)

        //delete token in db
        const sqlDeleteToken = 'UPDATE user SET token = ? WHERE id = ?;',
            {changedRows} = await updateUser(sqlDeleteToken, "", payload.id)

        if(!changedRows) return res.json({
            success: true, 
            payload: {
                msg: 'No token'
            }
        })

        //delete cookie
        res.clearCookie('refreshtoken')
        return res.json({
            success: true, 
            payload: {
                msg: 'Logged out'
            } 
        })

    } catch (error) {
        return res.json({
            success: false, 
            payload: {
                error
            }
        })
    }

    
}

module.exports = {
    signInUser,
    logInUser,
    checkToken,
    logOut
}