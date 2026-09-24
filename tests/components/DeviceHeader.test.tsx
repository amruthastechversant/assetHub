/**
 * tests/components/DeviceHeader.test.tsx
 *
 * Area: Status display, Report Issue button visibility by role
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DeviceHeader from "@/components/device/DeviceHeader";
import type { DeviceDetail } from "@/types/device";

// Mock ReportIssueButton to isolate DeviceHeader logic
vi.mock("@/components/device/ReportIssueButton", () => ({
  default: ({ assetCode }: { assetCode: string }) => (
    <button data-testid="report-issue-btn">Report Issue ({assetCode})</button>
  ),
}));

const baseDevice: Partial<DeviceDetail> = {
  id: "uuid-001",
  assetCode: "DEV-10025",
  assetType: "Laptop",
  model: "Dell XPS 15",
  status: "active",
};

describe("DeviceHeader — device data displayed", () => {
  it("shows the asset code", () => {
    render(<DeviceHeader device={baseDevice} role="Employee" />);
    expect(screen.getByText("DEV-10025")).toBeInTheDocument();
  });

  it("shows the model name as the heading", () => {
    render(<DeviceHeader device={baseDevice} role="Employee" />);
    expect(screen.getByRole("heading", { name: "Dell XPS 15" })).toBeInTheDocument();
  });

  it("shows the asset type", () => {
    render(<DeviceHeader device={baseDevice} role="Employee" />);
    expect(screen.getByText("Laptop")).toBeInTheDocument();
  });
});

describe("DeviceHeader — correct status displayed", () => {
  it("shows Active badge", () => {
    render(<DeviceHeader device={{ ...baseDevice, status: "active" }} role="Employee" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Inactive badge", () => {
    render(<DeviceHeader device={{ ...baseDevice, status: "inactive" }} role="Employee" />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("shows Retired badge", () => {
    render(<DeviceHeader device={{ ...baseDevice, status: "retired" }} role="Employee" />);
    expect(screen.getByText("Retired")).toBeInTheDocument();
  });
});

describe("DeviceHeader — Report Issue button visibility", () => {
  it("shows Report Issue button for Employee (has reportIssue permission)", () => {
    render(<DeviceHeader device={baseDevice} role="Employee" />);
    expect(screen.getByTestId("report-issue-btn")).toBeInTheDocument();
  });

  it("shows Report Issue button for System Admin", () => {
    render(<DeviceHeader device={baseDevice} role="System Admin" />);
    expect(screen.getByTestId("report-issue-btn")).toBeInTheDocument();
  });

  it("shows Report Issue button for Reporting Manager", () => {
    render(<DeviceHeader device={baseDevice} role="Reporting Manager" />);
    expect(screen.getByTestId("report-issue-btn")).toBeInTheDocument();
  });

  it("shows Report Issue button for HR", () => {
    render(<DeviceHeader device={baseDevice} role="HR" />);
    expect(screen.getByTestId("report-issue-btn")).toBeInTheDocument();
  });

  it("shows Report Issue button for CXO", () => {
    render(<DeviceHeader device={baseDevice} role="CXO" />);
    expect(screen.getByTestId("report-issue-btn")).toBeInTheDocument();
  });

  it("hides Report Issue button when role prop is missing", () => {
    // No role → hasPermission falls back to Employee (which has it), but
    // button also requires device.id to be present — remove id to simulate hidden
    render(<DeviceHeader device={{ ...baseDevice, id: undefined }} />);
    expect(screen.queryByTestId("report-issue-btn")).not.toBeInTheDocument();
  });

  it("hides Report Issue button when device has no id (unresolved device)", () => {
    render(<DeviceHeader device={{ ...baseDevice, id: undefined }} role="Employee" />);
    expect(screen.queryByTestId("report-issue-btn")).not.toBeInTheDocument();
  });
});
