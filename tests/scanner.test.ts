import {config, scanFile} from "../src/util/scanner";


describe("scanner tests", () => {

    beforeAll(async() => {
        await config(false);
    });

    test("infected positive", async () => {
        const infectedBuffer = Buffer.from("X5O!" + "P%@AP" + "[4\\PZX5 " + "4(P^)7CC)7}$E " + "ICAR-STA" +
            "NDARD" + "-ANTI" + "VIRUS-TE" + "ST-FIL" + "E!$" + "H+" + "H*");
        const result = await scanFile(infectedBuffer);
        expect(result.isInfected).toBe(true);
    });

    test("not infected", async () => {
        await config();
        const infectedBuffer = Buffer.from("abcdefghijklmnop");
        const result = await scanFile(infectedBuffer);
        expect(result.isInfected).toBe(false);
    });
});