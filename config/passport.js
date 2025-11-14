const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { User, Organization, Admin } = require("../model/model");
const { where } = require("sequelize");

module.exports = function (passport) {
  //user login strategy using passport
  passport.use(
    "users",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        // console.log("email:  ", email);
        // console.log("password:  ", password);

        await User.findOne({ where: { email: email } })
          .then((user) => {
            if (!user) {
              let err = "user does not exist";
              return done(err);
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) console.log(err);
              if (!isMatch) {
                let err = "Password Incorrect";
                return done(err);
              }
              //everything all right
              return done(null, user);
            });
          })
          .catch((error) => {
            console.log("HELLLLOO ERRORRR");
            return done(error);
          });
      }
    )
  );

  //organization login
  passport.use(
    "user-login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        console.log("email:  ", email);
        console.log("password:  ", password);

        await Organization.findOne({ where: { email: email } })
          .then((organization) => {
            if (!organization) {
              let err = "Organization does not exist";
              return done(err);
            }

            bcrypt.compare(password, organization.password, (err, isMatch) => {
              if (err) console.log(err);
              if (!isMatch) {
                let err = "Password Incorrect";
                return done(err);
              }
              //everything all right
              return done(null, organization);
            });
          })
          .catch((error) => {
            console.log("HELLLLOO ERRORRR");
            return done(error);
          });
      }
    )
  );

  //admin login strategy with checking role
  passport.use(
    "admin",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        console.log("ADDDMINNNNN"); //debugging
        console.log("EMAIL ADMIN: ", email);
        console.log("PASSWORD ADMIN:", password);
        await Admin.findOne({ where: { email: email, role: "admin" } })
          .then((admin) => {
            if (!admin) {
              let err = "Admin with this credentials does not exist";
              return done(err);
            }
            if (admin.role != "admin") {
              let err = "Role incorrect";
              return done(err);
            }
            bcrypt.compare(password, admin.password, (err, isMatch) => {
              if (err) {
                console.log("Error admin:: ", err);
                return done(err);
              }
              if (!isMatch) {
                let error = "password doesnot match";
                return done(error);
              }

              return done(null, admin);
            });
          })
          .catch((error) => {
            console.log("CATCH ADMIN ERROR", error);
            return done(error);
          });
      }
    )
  );

  //serelization and deserelization
  passport.serializeUser(function (user, done) {
    return done(null, user);
  });

  passport.deserializeUser(async function (user, done) {
    try {
      const desereuser = await User.findByPk(user.user_id);
      if (desereuser) {
        return done(null, desereuser);
      }

      const desereorg = await Organization.findByPk(user.id);
      if (desereorg) {
        return done(null, desereorg);
      }

      const desereadmin = await Admin.findByPk(user.id);
      if (desereadmin) {
        return done(null, desereadmin);
      }

      return done(new Error("User not found"));
    } catch (error) {
      console.log("deserelization error", error);
      return done(error);
    }
  });
};
