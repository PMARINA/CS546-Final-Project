const express = require("express");
const User = require("../../data/User");
const middleware = require("../middleware");
const router = new express.Router();
const StatusCodes = require("http-status-codes");

router.use(middleware.auth.loggedInOnly);

router.get(
  "/",
  middleware.auth.onlyAllowRole.bind(undefined, "admin"),
  async (req, res) => {
    res.json("all reports");
  }
);

router.get("/new", async (req, res) => {
  res.render("newReport", { navbar: req.navbar });
});

function ensureFormParameters(submittedReport, req, res) {
  if (
    typeof submittedReport.building !== "string" ||
    typeof submittedReport.reportType !== "string" ||
    typeof submittedReport.severity !== "string" ||
    typeof submittedReport.complaint !== "string"
  ) {
    middleware.auth.sendError(
      req,
      res,
      StatusCodes.BAD_REQUEST,
      "The form is missing one of key attributes: building, report type, complaint, and/or severity"
    );
    return false;
  }
  if (
    submittedReport.reportType === "machine" &&
    (typeof submittedReport.machineType !== "string" ||
      typeof submittedReport.machineModel !== "string")
  ) {
    middleware.auth.sendError(
      req,
      res,
      StatusCodes.BAD_REQUEST,
      "The form was submitted regarding a machine but was missing the machine type and the specific machine that was the subject of the report"
    );
    return false;
  }
  return true;
}

async function validateForm(submittedReport, req, res) {
  const allowedBuildings = await User.getAllBuildingsForUser(req.userId);
  let buildingAccessApproved = false;
  for (const building of allowedBuildings) {
    if (building.toString() === submittedReport.building) {
      buildingAccessApproved = true;
      break;
    }
  }
  if (!buildingAccessApproved) {
    await middleware.auth.sendError(
      req,
      res,
      StatusCodes.FORBIDDEN,
      "You are not allowed to submit forms for buildings to which you do not have access."
    );
    return false;
  }
  return true;
}

router.post("/new", async (req, res) => {
  // {"building":"61ae5cdbacaa336b1a526711","reportType":"building","severity":"catastrophic"}
  // {"building":"61ae5cdbacaa336b1a526711","reportType":"machine","machineType":"drier","machineModel":"61ae5cdbacaa336b1a526713","severity":"inconvenient"}
  const submittedReport = req.body;
  if (!ensureFormParameters(submittedReport, req, res)) return;
  if (!(await validateForm(submittedReport, req, res))) return;
  // console.log("This is the posted thing...");
  // console.log(JSON.stringify(req.body));
  // res.json(req.body);
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
