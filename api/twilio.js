const accountSid = "ACc94a07aa30f93afbd05e3399dd39bcd8";
const authToken = "6b297cce6c7e861211525ded56368611";
// TWILIO_ACCOUNT_SID=ACc94a07aa30f93afbd05e3399dd39bcd8
// TWILIO_AUTH_TOKEN=6b297cce6c7e861211525ded56368611
// TWILIO_SERVICE_SID=VAd8d9ccbff6ac508038d13814af75d72d
const client = require("twilio")(accountSid, authToken);

module.exports = {
  sendOtp: (mobile) => {
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services("VAd8d9ccbff6ac508038d13814af75d72d")
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
        .v2.services("VAd8d9ccbff6ac508038d13814af75d72d")
        .verificationChecks
        .create({
          to: `+91${mobileNo}`,
          code: otp
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
