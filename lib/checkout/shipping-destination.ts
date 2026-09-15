export type AddressDestinationInput = { village?: string | null; district: string; city: string; province: string; postalCode: string };
export type ShippingDestination = { id: number; label: string; province: string; city: string; district: string; subdistrict: string; postalCode: string };

export function addressDestinationQueries(address: AddressDestinationInput) {
  return [...new Set([
    address.postalCode,
    [address.village, address.district].filter(Boolean).join(", "),
    [address.district, address.city].filter(Boolean).join(", "),
  ].map((value) => value.trim()).filter((value) => value.length >= 3))];
}

export function bestDestination(address: AddressDestinationInput, destinations: ShippingDestination[]) {
  return [...destinations].sort((left, right) => destinationScore(address, right) - destinationScore(address, left))[0] ?? null;
}

function destinationScore(address: AddressDestinationInput, destination: ShippingDestination) {
  const postalCode = normalize(address.postalCode);
  const village = normalize(address.village ?? "");
  const district = normalize(address.district);
  const city = normalize(address.city);
  const province = normalize(address.province);
  const label = normalize(destination.label);
  return (
    (postalCode && normalize(destination.postalCode) === postalCode ? 100 : 0) +
    (village && (normalize(destination.subdistrict) === village || label.includes(village)) ? 50 : 0) +
    (district && (normalize(destination.district) === district || label.includes(district)) ? 30 : 0) +
    (city && (normalize(destination.city) === city || label.includes(city)) ? 20 : 0) +
    (province && normalize(destination.province) === province ? 10 : 0)
  );
}

function normalize(value: string) {
  return value.toLocaleLowerCase("id-ID").replace(/\b(kabupaten|kab\.?|kota|kecamatan|kec\.?|kelurahan|desa)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
