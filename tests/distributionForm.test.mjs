import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyEoItem, countEoVehiclePairs, hasDuplicateVehicles, isValidVehicleName, isDistributionFormValid, toCreateDistributionInput } from "../src/utils/distributionForm.ts";
import { routingIssueLabel } from "../src/utils/distributionErrors.ts";

const item = (vehicles = ["SX3(XK)"]) => ({ ...createEmptyEoItem(), vehicles, eoNo: "EO123", itemName: "부품", issueDate: "2026-09-21T09:30", requirement: "", reason: "" });
const values = (items) => ({ title: "", message: "", items });

test("one EO submits multiple normalized vehicle names without legacy vehicle or recipient fields", () => {
  const input = values([item([" SX3(XK) ", "가".normalize("NFD")])]);
  assert.equal(isDistributionFormValid(input), true);
  const result = toCreateDistributionInput(input);
  assert.deepEqual(result.items[0].vehicles, ["SX3(XK)", "가"]);
  assert.equal("vehicle" in result.items[0], false);
  assert.equal("companyCode" in result.items[0], false);
  assert.match(result.items[0].issueDate, /T\d{2}:\d{2}:\d{2}\.000Z$/);
});

test("empty vehicle arrays, invalid names and NFC/whitespace duplicates are rejected", () => {
  for (const vehicles of [[], [""], [" "], ["."], [".."], ["HMC/MX5"], ["HMC\\MX5"], ["MX5\0"], ["A".repeat(256)], [" MX5 ", "MX5"], ["가", "가".normalize("NFD")]]) {
    assert.equal(isDistributionFormValid(values([item(vehicles)])), false, JSON.stringify(vehicles));
  }
  assert.equal(hasDuplicateVehicles(["MX5", "MX5-CAR"]), false);
  assert.equal(isValidVehicleName("TM PE"), true);
});

test("100-pair limit applies across all EO rows, not just per row", () => {
  const fifty = Array.from({ length: 50 }, (_, index) => `CAR-${index}`);
  const exactly100 = [item(fifty), item(fifty)];
  assert.equal(countEoVehiclePairs(exactly100), 100);
  assert.equal(isDistributionFormValid(values(exactly100)), true);
  assert.equal(isDistributionFormValid(values([...exactly100, item()])), false);
  assert.equal(isDistributionFormValid(values([item(Array.from({ length: 101 }, (_, index) => `CAR-${index}`))])), false);
});

test("same vehicle across different EO rows remains a distinct EO item", () => {
  const input = values([item(), item()]);
  assert.equal(isDistributionFormValid(input), true);
  assert.equal(toCreateDistributionInput(input).items.length, 2);
});

test("single-vehicle and empty optional text remain supported", () => {
  const result = toCreateDistributionInput(values([item()]));
  assert.deepEqual(result.items[0].vehicles, ["SX3(XK)"]);
  assert.equal(result.items[0].requirement, "");
  assert.equal(result.items[0].reason, "");
  assert.equal(isDistributionFormValid(values([])), false);
  assert.equal(isDistributionFormValid(values([{ ...item(), itemName: "\0" }])), false);
});

test("current routing codes have actionable labels and future codes preserve server detail", () => {
  for (const code of ["VEHICLE_COMPANY_NOT_CONFIGURED", "VEHICLE_NOT_FOUND", "EO_NOT_FOUND", "COMPANY_NOT_FOUND", "AMBIGUOUS_COMPANY", "PART_PATH_INVALID"]) {
    assert.match(routingIssueLabel(code, "message"), /[가-힣]/);
    assert.doesNotMatch(routingIssueLabel(code, "message"), /동기화|승인/);
  }
  assert.equal(routingIssueLabel("FUTURE_CODE", "future detail"), "future detail");
  assert.equal(routingIssueLabel("toString", "unknown"), "unknown");
});
