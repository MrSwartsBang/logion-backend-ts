import { TestApp } from "@logion/rest-api-core";
import { ConfigController } from "../../../src/logion/controllers/config.controller.js";
import request from "supertest";

const { setupApp } = TestApp;

describe("ConfigController", () => {

    it("provides config without iDenfy integration", async () => {
        const app = setupApp(ConfigController, () => {});
        delete process.env.IDENFY_API_KEY;
        delete process.env.IDENFY_API_SECRET;

        await request(app)
            .get(`/api/config`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.features.iDenfy).toBeFalse();
            });
    });

    it("provides config with iDenfy integration", async () => {
        const app = setupApp(ConfigController, () => {});
        process.env.IDENFY_API_KEY = "some-api-key";
        process.env.IDENFY_API_SECRET = "some-api-secret";

        await request(app)
            .get(`/api/config`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.features.iDenfy).toBeTrue();
            });
    });
    it("provides config without vote feature", async () => {
        const app = setupApp(ConfigController, () => {});
        delete process.env.FEATURE_VOTE;

        await request(app)
            .get(`/api/config`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.features.vote).toBeFalse();
            });
    });

    it("provides config with vote feature", async () => {
        const app = setupApp(ConfigController, () => {});
        process.env.FEATURE_VOTE = "true";

        await request(app)
            .get(`/api/config`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.features.vote).toBeTrue();
            });
    });
});
