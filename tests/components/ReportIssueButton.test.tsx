/**
 * tests/components/ReportIssueButton.test.tsx
 *
 * Area: Report Issue — button behaviour, API call, error handling, loading state
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportIssueButton from "@/components/device/ReportIssueButton";

const DEFAULT_PROPS = {
  assetCode: "DEV-10025",
  model: "Dell XPS 15",
  assetId: "uuid-asset-001",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockFetch(response: object, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(response), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ReportIssueButton — initial render", () => {
  it("renders the Report Issue button", () => {
    render(<ReportIssueButton {...DEFAULT_PROPS} />);
    expect(screen.getByRole("button", { name: /report issue/i })).toBeInTheDocument();
  });

  it("dialog is closed by default", () => {
    render(<ReportIssueButton {...DEFAULT_PROPS} />);
    expect(screen.queryByText(/describe the problem/i)).not.toBeInTheDocument();
  });
});

describe("ReportIssueButton — dialog open/close", () => {
  it("opens the dialog when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));

    expect(screen.getByText(/Report Issue for DEV-10025/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issue description/i)).toBeInTheDocument();
  });

  it("closes the dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    // Dialog is open — title is visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // MUI Dialog uses CSS transitions; after close the dialog role disappears
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("ReportIssueButton — Submit Ticket is disabled until text is entered", () => {
  it("Submit Ticket button is disabled when description is empty", async () => {
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));

    expect(screen.getByRole("button", { name: /submit ticket/i })).toBeDisabled();
  });

  it("Submit Ticket becomes enabled after typing a description", async () => {
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    await user.type(screen.getByLabelText(/issue description/i), "Screen flickering");

    expect(screen.getByRole("button", { name: /submit ticket/i })).toBeEnabled();
  });
});

describe("ReportIssueButton — API call on submit", () => {
  it("calls POST /api/report-issue with correct payload", async () => {
    const fetchSpy = mockFetch({ success: true });
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    await user.type(screen.getByLabelText(/issue description/i), "Battery draining fast");
    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/report-issue",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: "uuid-asset-001",
            note: "Battery draining fast",
          }),
        })
      );
    });
  });

  it("shows success message after a successful API call", async () => {
    mockFetch({ success: true });
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    await user.type(screen.getByLabelText(/issue description/i), "OS crash");
    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/issue report successfully submitted/i)).toBeInTheDocument();
    });
  });
});

describe("ReportIssueButton — API error handling", () => {
  it("shows an error alert when the API returns a non-ok status", async () => {
    mockFetch({ success: false, error: "Internal Server Error" }, 500);
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    await user.type(screen.getByLabelText(/issue description/i), "Display broken");
    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
    });
  });

  it("shows an error alert when the API returns success: false", async () => {
    mockFetch({ success: false, error: "User not found in the system" }, 404);
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    await user.type(screen.getByLabelText(/issue description/i), "Keyboard broken");
    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/user not found in the system/i)).toBeInTheDocument();
    });
  });

  it("shows error when fetch itself throws (network failure)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<ReportIssueButton {...DEFAULT_PROPS} />);

    await user.click(screen.getByRole("button", { name: /report issue/i }));
    await user.type(screen.getByLabelText(/issue description/i), "Mouse not working");
    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
