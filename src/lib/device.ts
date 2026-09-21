export type Device = {
  id: string;
  name: string;
  assetType: string;
  serialNumber: string;
  status: "active" | "inactive" | "retired" | "restricted";
  assignedUser?: string;
  assignedUserEmail?: string;
};

const SAMPLE_DEVICES: Device[] = [
  {
    id: "device-001",
    name: "Edge Sensor A1",
    assetType: "Sensor",
    serialNumber: "SN-A1-0001",
    status: "active",
    assignedUser: "Alice Johnson",
    assignedUserEmail: "alice@example.com",
  },
  {
    id: "device-002",
    name: "Camera B2",
    assetType: "Camera",
    serialNumber: "SN-B2-0042",
    status: "restricted",
    assignedUser: "Bob Smith",
    assignedUserEmail: "bob@example.com",
  },
];

export async function getDeviceById(id: string): Promise<Device | null> {
  // In a real app this would query your database or an external API.
  const found = SAMPLE_DEVICES.find((d) => d.id === id || d.serialNumber === id);
  return found ? found : null;
}
