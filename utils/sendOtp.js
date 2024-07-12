
async function sendOtp(email, otp,res) {
    //logic to send by email
    return res.send({email,otp});
}

module.exports = sendOtp;