const sendRefreshToken = (res, token) => {
    res.cookie('refreshtoken', token, {
        httpOnly: true, 
        secure: true, 
        domain: '',
        path: '/'
    })
}

const sendAccessToken = (res, id, username, email, token) => {
    res.send({
        success: true,
        payload: {
            token, 
            id,
            username,
            email,
            status: 200
        }
    })
}

module.exports = {sendAccessToken, sendRefreshToken}