import moment, { Moment } from 'moment';
import { It, Mock } from 'moq.ts';
import { LocSynchronizer } from "../../../src/logion/services/locsynchronization.service";
import { ExtrinsicDataExtractor } from '../../../src/logion/services/extrinsic.data.extractor';
import {
    LinkDescription,
    LocRequestAggregateRoot,
    LocRequestRepository,
    MetadataItemDescription
} from '../../../src/logion/model/locrequest.model';
import { JsonExtrinsic } from '../../../src/logion/services/types/responses/Extrinsic';
import { JsonArgs } from '../../../src/logion/services/call';
import { decimalToUuid } from '../../../src/logion/lib/uuid';

describe("LocSynchronizer", () => {

    beforeEach(() => {
        extrinsicDataExtractor = new Mock<ExtrinsicDataExtractor>();
        locRequestRepository = new Mock<LocRequestRepository>();
    });

    it("sets LOC created date", async () => {
        givenLocExtrinsic("createLoc", { loc_id: locId });
        givenLocRequest();
        givenLocRequestExpectsLocCreationDate();
        await whenConsumingBlock();
        thenLocCreateDateSet();
        thenLocIsSaved();
    });

    it("adds metadata", async () => {
        givenLocExtrinsic("addMetadata", {
            loc_id: locId,
            item: {
                name: {
                    toUtf8: () => METADATA_ITEM_NAME
                },
                value: {
                    toUtf8: () => METADATA_ITEM_VALUE
                },
            }
        });
        givenLocRequest();
        givenLocRequestExpectsMetadata();
        await whenConsumingBlock();
        thenMetadataAdded();
        thenLocIsSaved();
    });

    it("closes LOC", async () => {
        givenLocExtrinsic("close", { loc_id: locId });
        givenLocRequest();
        givenLocRequestExpectsClose();
        await whenConsumingBlock();
        thenLocClosed();
        thenLocIsSaved();
    });

    it("adds link", async () => {
        givenLocExtrinsic("addLink", {
            loc_id: locId,
            link: {
                id: {
                    toString: () => LINK_TARGET
                },
                nature: {
                    toUtf8: () => LINK_NATURE
                },
            }
        });
        givenLocRequest();
        givenLocRequestExpectsLink();
        await whenConsumingBlock();
        thenLinkAdded();
        thenLocIsSaved();
    });

    it("voids LOC on makeVoid", async () => {
        givenLocExtrinsic("makeVoid", { loc_id: locId });
        givenLocRequest();
        givenLocRequestExpectsVoid();
        await whenConsumingBlock();
        thenLocVoided();
        thenLocIsSaved();
    });

    it("voids LOC on makeVoidAndReplace", async () => {
        givenLocExtrinsic("makeVoidAndReplace", { loc_id: locId });
        givenLocRequest();
        givenLocRequestExpectsVoid();
        await whenConsumingBlock();
        thenLocVoided();
        thenLocIsSaved();
    });
});

const locId = {
    toString: () => locDecimalUuid
};
const locDecimalUuid = "130084474896785895402627605545662412605";
const blockTimestamp = moment();
let extrinsicDataExtractor: Mock<ExtrinsicDataExtractor>;
let locRequestRepository: Mock<LocRequestRepository>;

function givenLocExtrinsic(method: string, args: JsonArgs) {
    locExtrinsic = new Mock<JsonExtrinsic>();
    locExtrinsic.setup(instance => instance.method).returns({
        pallet: "logionLoc",
        method,
    });
    locExtrinsic.setup(instance => instance.args).returns(args);
}

let locExtrinsic: Mock<JsonExtrinsic>;

function givenLocRequest() {
    locRequest = new Mock<LocRequestAggregateRoot>();
    locRequestRepository.setup(instance => instance.findById(decimalToUuid(locDecimalUuid))).returns(Promise.resolve(locRequest.object()));
    locRequestRepository.setup(instance => instance.save(locRequest.object())).returns(Promise.resolve());
}

let locRequest: Mock<LocRequestAggregateRoot>;

function givenLocRequestExpectsLocCreationDate() {
    locRequest.setup(instance => instance.setLocCreatedDate(IS_BLOCK_TIME))
        .returns(undefined);
}

const IS_BLOCK_TIME = It.Is<Moment>(time => time.isSame(blockTimestamp));

async function whenConsumingBlock() {
    await locSynchronizer().updateLocRequests(locExtrinsic.object(), blockTimestamp);
}

function locSynchronizer(): LocSynchronizer {
    return new LocSynchronizer(
        extrinsicDataExtractor.object(),
        locRequestRepository.object(),
    );
}

function thenLocCreateDateSet() {
    locRequest.verify(instance => instance.setLocCreatedDate(IS_BLOCK_TIME));
}

function thenLocIsSaved() {
    locRequestRepository.verify(instance => instance.save(locRequest.object()));
}

function givenLocRequestExpectsMetadata() {
    locRequest.setup(instance => instance.addMetadataItem(IS_EXPECTED_ITEM)).returns(undefined);
}

const IS_EXPECTED_ITEM = It.Is<MetadataItemDescription>(item =>
            item.name === METADATA_ITEM_NAME
            && item.value === METADATA_ITEM_VALUE
            && item.addedOn.isSame(blockTimestamp));

const METADATA_ITEM_NAME = "name";
const METADATA_ITEM_VALUE = "value";

function thenMetadataAdded() {
    locRequest.verify(instance => instance.addMetadataItem(IS_EXPECTED_ITEM));
}

function givenLocRequestExpectsClose() {
    locRequest.setup(instance => instance.close(IS_BLOCK_TIME)).returns(undefined);
}

function thenLocClosed() {
    locRequest.verify(instance => instance.close(IS_BLOCK_TIME));
}

const LINK_TARGET = "130084474896785895402627605545662412605";
const LINK_TARGET_UUID = decimalToUuid(LINK_TARGET);
const LINK_NATURE = "nature";
const IS_EXPECTED_LINK = It.Is<LinkDescription>(link =>
            link.target === LINK_TARGET_UUID
            && link.addedOn.isSame(blockTimestamp));

function givenLocRequestExpectsLink() {
    locRequest.setup(instance => instance.addLink(IS_EXPECTED_LINK)).returns(undefined);
}

function thenLinkAdded() {
    locRequest.verify(instance => instance.addLink(IS_EXPECTED_LINK));
}

function givenLocRequestExpectsVoid() {
    locRequest.setup(instance => instance.voidLoc(IS_BLOCK_TIME)).returns(undefined);
}

function thenLocVoided() {
    locRequest.verify(instance => instance.voidLoc(IS_BLOCK_TIME));
}
