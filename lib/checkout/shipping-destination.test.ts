import { describe, expect, it } from "vitest";
import { addressDestinationQueries, bestDestination } from "./shipping-destination";

const address = { village: "Dago", district: "Coblong", city: "Kota Bandung", province: "Jawa Barat", postalCode: "40135" };

describe("checkout shipping destination resolver", () => {
  it("searches postal code before progressively broader address fields", () => {
    expect(addressDestinationQueries(address)).toEqual(["40135", "Dago, Coblong", "Coblong, Kota Bandung"]);
  });

  it("prefers matching postal code, village, district, and city", () => {
    const selected = bestDestination(address, [
      { id: 1, label: "Coblong, Bandung 40132", province: "Jawa Barat", city: "Bandung", district: "Coblong", subdistrict: "Lebak Gede", postalCode: "40132" },
      { id: 2, label: "Dago, Coblong, Bandung 40135", province: "Jawa Barat", city: "Bandung", district: "Coblong", subdistrict: "Dago", postalCode: "40135" },
    ]);
    expect(selected?.id).toBe(2);
  });
});
