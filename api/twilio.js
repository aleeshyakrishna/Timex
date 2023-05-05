// const accountSid = "AC894e4a0e0d9112bcc872e2f9a6d26634";
// const authToken = "4330ecbc60a3ccfeb9921b86ec25c968";
// // TWILIO_ACCOUNT_SID=AC894e4a0e0d9112bcc872e2f9a6d26634
// // TWILIO_AUTH_TOKEN=4330ecbc60a3ccfeb9921b86ec25c968
// // TWILIO_SERVICE_SID=VA1dafb98e762b3849ac62dbffa3e453de
// const client = require("twilio")(accountSid, authToken);

require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceSid =process.env.TWILIO_SERVICE_SID
const client = require('twilio')(accountSid, authToken);

module.exports = {
  sendOtp: (mobile) => {
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms" })
        .then((verification) => {
          console.log(verification.sid);
          resolve(verification.sid);
        });
    });
  },
   verifyOtp : (mobileNo, otp) => {
    console.log("mobile and otp");
    console.log(mobileNo, otp);
    return new Promise((resolve, reject) => {
      client.verify
        .v2.services(serviceSid)
        .verificationChecks
        .create({
          to: `+91${mobileNo}`,
          code: `${otp}`
        })
        .then((verificationCheck) => {
          resolve(verificationCheck);
        })
        .catch((error) => {
          reject(error);
        });
    });
}
};
  
//   verifyOtp: (mobile, otp) => {
//     console.log(mobile,otp)
//     return new Promise((resolve, reject) => {
//       client.verify.v2
//         .services("VAd8d9ccbff6ac508038d13814af75d72d")
//         .verificationChecks.create({ to: `+91${mobile}`, code: `${otp}` })
//         .then((verification_check) => {
//           console.log(verification_check.status)
//           resolve(verification_check.status);
//         })
//         .catch((error) => {
//           console.log(error);
//           reject(error);
//         });
//     });
//   },
// };
