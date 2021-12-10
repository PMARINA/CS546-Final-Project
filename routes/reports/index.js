const express = require("express");
const User = require("../../data/User");
const Building = require("../../models/building");
const middleware = require("../middleware");
const Report = require("../../data/Report");
const router = new express.Router();
const ObjectId = require("mongoose").Types.ObjectId;
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
  console.log(allowedBuildings);
  let buildingAccessApproved = false;
  for (const building of allowedBuildings) {
    if (building._id.toString() === submittedReport.building) {
      buildingAccessApproved = true;
      break;
    } else {
      console.log(
        `BuildingId: ${building._id.toString()}; submittedId: ${
          submittedReport.building
        }`
      );
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
  if (
    submittedReport.reportType !== "building" &&
    submittedReport.reportType !== "machine"
  ) {
    await middleware.auth.sendError(
      req,
      res,
      StatusCodes.BAD_REQUEST,
      "The report type must be one of building or machine"
    );
    return false;
  }
  if (submittedReport.reportType === "machine") {
    const validMachineTypes = ["drier", "washer"];
    if (!validMachineTypes.includes(submittedReport.machineType)) {
      await middleware.auth.sendError(
        req,
        res,
        StatusCodes.BAD_REQUEST,
        `The selected type of laundry machine is not valid (expected ${validMachineTypes.toString()})`
      );
      return false;
    }
    const buildingSearchFilter = {
      _id: new ObjectId(submittedReport.building),
    };
    buildingSearchFilter[submittedReport.machineType + "s._id"] = new ObjectId(
      submittedReport.machineModel
    );
    console.log(
      `Building search filter: ${JSON.stringify(buildingSearchFilter)}`
    );
    if (!(await Building.exists(buildingSearchFilter))) {
      await middleware.auth.sendError(
        req,
        res,
        StatusCodes.BAD_REQUEST,
        "The machine is either not of the type you specified (washer/drier), or does not exist in the specified building"
      );
      return false;
    }
  }
  const validSeverities = ["minor", "inconvenient", "catastrophic"];
  if (!validSeverities.includes(submittedReport.severity)) {
    await middleware.auth.sendError(
      req,
      res,
      StatusCodes.BAD_REQUEST,
      `The report severity must be one of ${validSeverities.toString()}`
    );
    return false;
  }
  if (submittedReport.complaint.trim() === "") {
    await middleware.auth.sendError(
      req,
      res,
      StatusCodes.BAD_REQUEST,
      `The report must have a complaint attached to it`
    );
    return false;
  }
  return true;
}

/**
 * There are two main types of complaints that can be received:
 * 1. Without a specific machine
 * 2. With a specific machine
 *
 * Their corresponding reports are given below:
 * 1. {"building":"61ae5cdbacaa336b1a526711","reportType":"building","severity":"catastrophic","complaint":"bad floor"}
 * 2. {"building":"61ae5cdbacaa336b1a526711","reportType":"machine","machineType":"drier","machineModel":"61ae5cdbacaa336b1a526713","severity":"inconvenient","complaint":"Bad floor"}
 */
router.post("/new", async (req, res) => {
  const submittedReport = req.body;
  if (!ensureFormParameters(submittedReport, req, res)) return;
  if (!(await validateForm(submittedReport, req, res))) return;
  await Report.create(
    submittedReport.reportType,
    req.userId.toString(),
    submittedReport.reportType === "machine"
      ? submittedReport.machineModel
      : submittedReport.building,
    submittedReport.complaint,
    submittedReport.severity
  );
  res.render("reportReceived", {
    navbar: req.navbar,
    priority: submittedReport.severity,
    building: (await Building.findById(submittedReport.building)).name,
  });
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
