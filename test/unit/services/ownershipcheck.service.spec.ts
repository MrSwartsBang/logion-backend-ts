import { CollectionItem } from "@logion/node-api/dist/Types";
import { Mock } from "moq.ts";

import { AlchemyService, Network } from "../../../src/logion/services/alchemy.service";
import { OwnershipCheckService } from "../../../src/logion/services/ownershipcheck.service";

describe("OwnershipCheckService", () => {
    it("detects ethereum_erc721 ownership", () => testDetectsOwnership(ethereumErc721Item, Network.ETH_MAINNET));
    it("detects no ethereum_erc721 ownership", () => testDetectsNoOwnership(ethereumErc721Item, Network.ETH_MAINNET));
    it("detects ethereum_erc1155 ownership", () => testDetectsOwnership(ethereumErc1155Item, Network.ETH_MAINNET));
    it("detects no ethereum_erc1155 ownership", () => testDetectsNoOwnership(ethereumErc1155Item, Network.ETH_MAINNET));

    it("detects goerli_erc721 ownership", () => testDetectsOwnership(goerliErc721Item, Network.ETH_GOERLI));
    it("detects no goerli_erc721 ownership", () => testDetectsNoOwnership(goerliErc721Item, Network.ETH_GOERLI));
    it("detects goerli_erc1155 ownership", () => testDetectsOwnership(goerliErc1155Item, Network.ETH_GOERLI));
    it("detects no goerli_erc1155 ownership", () => testDetectsNoOwnership(goerliErc1155Item, Network.ETH_GOERLI));

    it("detects owner ownership", () => testDetectsOwnership(ownerItem));
    it("detects no owner ownership", () => testDetectsNoOwnership(ownerItem));
});

async function testDetectsOwnership(item: CollectionItem, network?: Network) {
    const alchemyService = mockAlchemyService(network);
    const ownershipCheckService = new OwnershipCheckService(alchemyService);
    const result = await ownershipCheckService.isOwner(owner, item);
    expect(result).toBe(true);
}

function mockAlchemyService(network?: Network): AlchemyService {
    const service = new Mock<AlchemyService>();
    service.setup(instance => instance.getOwners).returns((_network: Network, _contractHash: string, _tokenId: string) => {
        if(network === _network && contractHash === _contractHash && tokenId === _tokenId) {
            return Promise.resolve([ owner ]);
        } else {
            return Promise.resolve([]);
        }
    });
    return service.object();
}

const owner = "0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84";

const contractHash = "0x765df6da33c1ec1f83be42db171d7ee334a46df5";

const tokenId = "4391";

async function testDetectsNoOwnership(item: CollectionItem, network?: Network) {
    const alchemyService = mockAlchemyService(network);
    const ownershipCheckService = new OwnershipCheckService(alchemyService);
    const result = await ownershipCheckService.isOwner(anotherOwner, item);
    expect(result).toBe(false);
}

const anotherOwner = "0xfbb0e166c6bd0dd29859a5191196a8b3fec48e1c";

const ethereumErc721Item: CollectionItem = {
    id: "0xf2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    description: "Some artwork",
    files: [{
        name: "image.png",
        contentType: "image/png",
        hash: "0x7d6fd7774f0d87624da6dcf16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0f",
        size: 1234n
    }],
    token: {
        type: "ethereum_erc721",
        id: `{"contract":"${contractHash}","id":"${tokenId}"}`
    },
    restrictedDelivery: true,
    termsAndConditions: [],
};

const ethereumErc1155Item: CollectionItem = {
    id: "0xf2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    description: "Some artwork",
    files: [{
        name: "image.png",
        contentType: "image/png",
        hash: "0x7d6fd7774f0d87624da6dcf16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0f",
        size: 1234n
    }],
    token: {
        type: "ethereum_erc1155",
        id: `{"contract":"${contractHash}","id":"${tokenId}"}`
    },
    restrictedDelivery: true,
    termsAndConditions: [],
};

const goerliErc721Item: CollectionItem = {
    id: "0xf2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    description: "Some artwork",
    files: [{
        name: "image.png",
        contentType: "image/png",
        hash: "0x7d6fd7774f0d87624da6dcf16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0f",
        size: 1234n
    }],
    token: {
        type: "goerli_erc721",
        id: `{"contract":"${contractHash}","id":"${tokenId}"}`
    },
    restrictedDelivery: true,
    termsAndConditions: [],
};

const goerliErc1155Item: CollectionItem = {
    id: "0xf2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    description: "Some artwork",
    files: [{
        name: "image.png",
        contentType: "image/png",
        hash: "0x7d6fd7774f0d87624da6dcf16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0f",
        size: 1234n
    }],
    token: {
        type: "goerli_erc1155",
        id: `{"contract":"${contractHash}","id":"${tokenId}"}`
    },
    restrictedDelivery: true,
    termsAndConditions: [],
};

const ownerItem: CollectionItem = {
    id: "0xf2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    description: "Some artwork",
    files: [{
        name: "image.png",
        contentType: "image/png",
        hash: "0x7D6fd7774f0d87624da6dCF16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0F",
        size: 1234n
    }],
    token: {
        type: "owner",
        id: `${owner}`
    },
    restrictedDelivery: true,
    termsAndConditions: [],
};
