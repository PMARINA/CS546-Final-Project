const express = require("express");
const User = require("../../data/User");
const middleware = require("../middleware");
const router = new express.Router();

router.use(middleware.auth.loggedInOnly);

router.get(
  "/",
  middleware.auth.onlyAllowRole.bind(undefined, "admin"),
  async (req, res) => {
    res.json("all reports");
  }
);

router.get("/new", async (req, res) => {
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo["_id"];
    if (await User.exists(userId)) {
      // Continue onto creating the report for them
      res.render("newReport", { navbar: req.navbar });
    } else {
      // res.json({'redirect': '/logout'});
      res.redirect("/logout");
      // Something funky is going on... let them logout and redirect back home
    }
  } else {
    res.redirect("/"); // They can't access the page...
  }
});

router.delete("/:id", async (req, res) => {
  const reportId = req.params.id;
  res.json(`deleted the report with id: ${reportId}`);
});

router.patch("/:id", async (req, res) => {
  const reportId = req.params.id;
  res.json(`updated the report with id: ${reportId}`);
});

module.exports = router;
