import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyProvider, useProperty } from "@/context/PropertyContext";

jest.mock("@/lib/firebase", () => ({ db: {} }));

const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
}));

const defaultProperty = {
  id: "default",
  name: "Property Name",
  type: "hotel",
  address: "123 Main Street, City, Country",
  phone: "+1 (555) 000-0000",
  emergencyContacts: [
    { name: "Main Office", phone: "+1 (555) 000-0001", role: "Reception" },
  ],
  latitude: 0,
  longitude: 0,
};

const testProperty = {
  id: "main",
  name: "Test Hotel",
  type: "hotel",
  address: "1 Test Road",
  phone: "+9876543210",
  emergencyContacts: [],
};

function TestConsumer() {
  const { property, loading, updateProperty } = useProperty();
  if (loading) return <span data-testid="loading">loading</span>;
  return (
    <div>
      <span data-testid="name">{property?.name ?? "none"}</span>
      <button onClick={() => updateProperty({ name: "Updated Hotel" })}>
        Update
      </button>
    </div>
  );
}

describe("PropertyContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue("docRef");
  });

  it("shows loading initially then renders fetched property", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => testProperty,
    });

    render(
      <PropertyProvider>
        <TestConsumer />
      </PropertyProvider>
    );

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("name")).toHaveTextContent("Test Hotel");
  });

  it("seeds default property when Firestore document does not exist", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockResolvedValue(undefined);

    render(
      <PropertyProvider>
        <TestConsumer />
      </PropertyProvider>
    );

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(mockSetDoc).toHaveBeenCalledWith("docRef", defaultProperty);
    expect(screen.getByTestId("name")).toHaveTextContent("Property Name");
  });

  it("falls back to default property when Firestore fetch fails", async () => {
    mockGetDoc.mockRejectedValue(new Error("Network error"));

    render(
      <PropertyProvider>
        <TestConsumer />
      </PropertyProvider>
    );

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("name")).toHaveTextContent("Property Name");
  });

  it("updateProperty updates state optimistically and writes to Firestore", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => testProperty,
    });
    mockUpdateDoc.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <PropertyProvider>
        <TestConsumer />
      </PropertyProvider>
    );

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(screen.getByTestId("name")).toHaveTextContent("Updated Hotel");
    expect(mockUpdateDoc).toHaveBeenCalledWith("docRef", { name: "Updated Hotel" });
  });

  it("throws when useProperty is called outside PropertyProvider", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    function Broken() {
      useProperty();
      return null;
    }
    expect(() => render(<Broken />)).toThrow(
      "useProperty must be used within PropertyProvider"
    );
    errorSpy.mockRestore();
  });
});
