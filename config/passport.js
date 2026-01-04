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
    "organizationn",
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
        // console.log("PASSWORD ADMIN:", password);
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
    console.log("serelize userss");
    const userInfo = {
      id: user.id || user.user_id,
      role: user.role,
      type: user.constructor.name, // 'User', 'Organization', or 'Admin'
    };
    return done(null, userInfo);
  });

  passport.deserializeUser(async function (user, done) {
    try {
      // If no user data exists, return false (no error)
      if (!user) {
        return done(null, false);
      }

      // Try to find user in each table
      let foundUser = await User.findByPk(user.id || user.user_id);
      if (foundUser) {
        return done(null, foundUser);
      }

      foundUser = await Organization.findByPk(user.id || user.org_id);
      if (foundUser) {
        return done(null, foundUser);
      }

      foundUser = await Admin.findByPk(user.id || user.admin_id);
      if (foundUser) {
        return done(null, foundUser);
      }

      // If no user found in any table, return false (not an error)
      console.log(
        "No user found during deserialization, but this is normal for unauthenticated users"
      );
      return done(null, false);
    } catch (error) {
      console.log("Deserialization error:", error);
      return done(error);
    }
  });
};
