import { describe, expect, it } from "vitest";
import { inspectImage } from "./image-validation";
describe("consignment image validation", () => { it("menolak signature palsu", () => { expect(() => inspectImage(new Uint8Array([1, 2, 3]), "image/png")).toThrow(); }); it("menolak MIME non-image", () => { expect(() => inspectImage(new Uint8Array(100), "application/pdf")).toThrow("IMAGE_TYPE_NOT_ALLOWED"); }); });
