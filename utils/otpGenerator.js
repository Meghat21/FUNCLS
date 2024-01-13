const otpGenerator = ()=>{
    const otp = Math.floor(Math.random() * 899999 + 100000);
    return otp;
};
module.exports = otpGenerator;