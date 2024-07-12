const otpGenerator = require("otp-generator");

function generateOtp(){
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        alphabets: false,
      });
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 2);
    return {otp,expirationTime};
}

module.exports = generateOtp;