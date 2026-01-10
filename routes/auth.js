const express = require("express");
const router = express.Router();

router.post("/logout", async (req, res) => {
  console.log("post toute hittttttttttttttttttttt");
  req.logOut(function (err) {
    if (err) {
      console.log("logout error", err);
      return res.json({
        status: 500,
        title: "error",
        message: "Logout failed",
      });
    }
    console.log("hello");

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.json({
        title: "success",
        message: "Logged out successfully",
      });
    });
  });
});
module.exports = router;
