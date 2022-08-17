import moment from "moment";
import { RestrictedDeliveryMetadata, RestrictedDeliveryMetadataCodec, RestrictedDeliveryMetadataUpdater } from "../../../src/logion/services/RestrictedDeliveryMetadata";

const owner = "0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84";

const otherOwner = "0xfbb0e166c6bd0dd29859a5191196a8b3fec48e1c";

const yetAnotherOwner = "0xfbb0e166c6bd0dd29859a5191196a8b3fec48e1d";

const generatedOn = "2022-08-17T10:27:00.000Z";

describe("RestrictedDeliveryMetadataCodec", () => {

    it("encodes metadata", () => {
        const metadata: RestrictedDeliveryMetadata = {
            owner,
            generatedOn: moment(generatedOn),
        };
        const encodedMetadata = RestrictedDeliveryMetadataCodec.encode(metadata);
        expect(encodedMetadata).toBe(`-----BEGIN LOGION METADATA-----
owner=${owner}
generatedOn=${generatedOn}
-----END LOGION METADATA-----`);
    });

    it("decodes metadata", () => {
        const encodedMetadata = `-----BEGIN LOGION METADATA-----
owner=${owner}
generatedOn=${generatedOn}
-----END LOGION METADATA-----`;
        const metadata = RestrictedDeliveryMetadataCodec.decode(encodedMetadata);
        expect(metadata.owner).toBe(owner);
    });
});

function imageDescription(owner: string) {
    return `Some image description.
Another line of description.

-----BEGIN LOGION METADATA-----
owner=${owner}
generatedOn=${generatedOn}
-----END LOGION METADATA-----

Some last line coming after the encoded metadata.
`;
}

describe("RestrictedDeliveryMetadataUpdater", () => {

    it("finds metadata in plain text", () => {
        const description = imageDescription(owner);
        const updater = new RestrictedDeliveryMetadataUpdater(description);
        expect(updater.metadata).toBeDefined();
        expect(updater.metadata?.owner).toBe(owner);
    });

    it("does not find metadata in plain text when none", () => {
        const description = "Some random description without metadata.";
        const updater = new RestrictedDeliveryMetadataUpdater(description);
        expect(updater.metadata).not.toBeDefined();
    });

    it("adds metadata at the end of description if none", () => {
        const description = "Some random description without metadata.";
        const updater = new RestrictedDeliveryMetadataUpdater(description);
        updater.setMetadata({
            owner,
            generatedOn: moment(generatedOn),
        });
        const updatedText = updater.text;
        expect(updatedText).toBe(`${description}

-----BEGIN LOGION METADATA-----
owner=${owner}
generatedOn=${generatedOn}
-----END LOGION METADATA-----
`);
        expect(updater.metadata?.owner).toBe(owner);
    });

    it("updates metadata several times", () => {
        const description = "Some random description without metadata.";
        const updater = new RestrictedDeliveryMetadataUpdater(description);
        updater.setMetadata({
            owner,
            generatedOn: moment(generatedOn),
        });
        updater.setMetadata({
            owner: otherOwner,
            generatedOn: moment(generatedOn),
        });
        updater.setMetadata({
            owner: yetAnotherOwner,
            generatedOn: moment(generatedOn),
        });
        const updatedText = updater.text;
        expect(updatedText).toBe(`${description}

-----BEGIN LOGION METADATA-----
owner=${yetAnotherOwner}
generatedOn=${generatedOn}
-----END LOGION METADATA-----
`);
        expect(updater.metadata?.owner).toBe(yetAnotherOwner);
    });

    it("updates existing metadata", () => {
        const description = imageDescription(owner);
        const updater = new RestrictedDeliveryMetadataUpdater(description);
        updater.setMetadata({
            owner: otherOwner,
            generatedOn: moment(generatedOn),
        });
        const updatedText = updater.text;
        expect(updatedText).toBe(imageDescription(otherOwner));
        expect(updater.metadata?.owner).toBe(otherOwner);
    });

    it("sets metadata if empty description", () => {
        const updater = new RestrictedDeliveryMetadataUpdater("");
        const metadata: RestrictedDeliveryMetadata = {
            owner: otherOwner,
            generatedOn: moment(generatedOn),
        };
        updater.setMetadata(metadata);
        expect(updater.text).toBe(RestrictedDeliveryMetadataCodec.encode(metadata));
    });
});