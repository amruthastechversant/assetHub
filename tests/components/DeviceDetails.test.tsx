/**
 * tests/components/DeviceDetails.test.tsx
 *
 * Area: Device Details — fields displayed, correct data, purchase/location hidden
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DeviceDetails from "@/components/device/DeviceDetails";
import type { DeviceDetail } from "@/types/device";

// ── Shared mock data ──────────────────────────────────────────────────────────
const fullDevice: Partial<DeviceDetail> = {
  id: "uuid-001",
  assetCode: "DEV-10025",
  assetType: "Laptop",
  model: "Dell XPS 15",
  status: "active",
  serialNumber: "SN-XPS-2024",
  processor: "Intel Core i7-12700H",
  ram: "16 GB",
  storage: "512 GB SSD",
  operatingSystem: "Windows 11 Pro",
  purchaseDate: "2024-01-15",
  purchaseAmount: 95000,
  location: "Chennai HQ",
};

/** Strip restricted keys to simulate filtered payload */
const employeeDevice: Partial<DeviceDetail> = (({ purchaseAmount, location, ...rest }) => rest)(
  fullDevice as DeviceDetail
);

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("DeviceDetails — fields displayed", () => {
  it("renders Asset Code", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("DEV-10025")).toBeInTheDocument();
  });

  it("renders Asset Type", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("Laptop")).toBeInTheDocument();
  });

  it("renders Model", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("Dell XPS 15")).toBeInTheDocument();
  });

  it("renders Processor", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("Intel Core i7-12700H")).toBeInTheDocument();
  });

  it("renders RAM", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("16 GB")).toBeInTheDocument();
  });

  it("renders Storage", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("512 GB SSD")).toBeInTheDocument();
  });

  it("renders Operating System", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("Windows 11 Pro")).toBeInTheDocument();
  });
});

describe("DeviceDetails — correct device status", () => {
  it("shows Active status badge for an active device", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Inactive status badge for an inactive device", () => {
    render(<DeviceDetails device={{ ...fullDevice, status: "inactive" }} />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("shows Retired status badge for a retired device", () => {
    render(<DeviceDetails device={{ ...fullDevice, status: "retired" }} />);
    expect(screen.getByText("Retired")).toBeInTheDocument();
  });
});

describe("DeviceDetails — Purchase Amount visibility", () => {
  it("shows Purchase Amount when the field is present (admin/CXO view)", () => {
    render(<DeviceDetails device={fullDevice} />);
    // formatCurrency produces a string containing ₹ and 95,000
    expect(screen.getByText(/₹/)).toBeInTheDocument();
  });

  it("hides Purchase Amount section when the field is absent (employee view)", () => {
    render(<DeviceDetails device={employeeDevice} />);
    expect(screen.queryByText(/₹/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Purchase Amount/i)).not.toBeInTheDocument();
  });
});

describe("DeviceDetails — Location visibility", () => {
  it("shows Location when the field is present", () => {
    render(<DeviceDetails device={fullDevice} />);
    expect(screen.getByText("Chennai HQ")).toBeInTheDocument();
  });

  it("hides Location section when the field is absent (employee view)", () => {
    render(<DeviceDetails device={employeeDevice} />);
    expect(screen.queryByText("Chennai HQ")).not.toBeInTheDocument();
    expect(screen.queryByText(/Office \/ Site/i)).not.toBeInTheDocument();
  });
});

describe("DeviceDetails — Purchase Date formatting", () => {
  it("formats purchase date in human-readable form", () => {
    render(<DeviceDetails device={fullDevice} />);
    // formatDate("2024-01-15") → "15 Jan 2024"
    expect(screen.getByText("15 Jan 2024")).toBeInTheDocument();
  });
});
