import { setupApp } from "../../helpers/testapp";
import { readFile, writeFile } from 'fs/promises';
import { LocRequestController } from "../../../src/logion/controllers/locrequest.controller";
import { Container } from "inversify";
import request, { Response } from "supertest";
import { ALICE, BOB } from "../../helpers/addresses";
import { Mock, It } from "moq.ts";
import {
    LocRequestRepository,
    LocRequestFactory,
    LocRequestAggregateRoot,
    NewLocRequestParameters,
    LocRequestStatus, FileDescription, LinkDescription, MetadataItemDescription,
} from "../../../src/logion/model/locrequest.model";
import moment, { Moment } from "moment";
import {
    ProtectionRequestRepository,
    ProtectionRequestAggregateRoot
} from "../../../src/logion/model/protectionrequest.model";
import { FileDbService } from "../../../src/logion/services/filedb.service";

const testUserIdentity = {
    firstName: "Scott",
    lastName: "Tiger",
    email: "scott.tiger@logion.network",
    phoneNumber: "+6789"
}

const IDENTITY_LOC_ID = "6b00b9f2-4439-4c4a-843e-2ea3ce2016fd";
const SUBMITTER = "5DDGQertEH5qvKVXUmpT3KNGViCX582Qa2WWb8nGbkmkRHvw";

const identityInIdentityLoc = {
    firstName: "Felix",
    lastName: "the Cat",
    email: "felix@logion.network",
    phoneNumber: "+0101"
}

const testData = {
    requesterAddress: "5CXLTF2PFBE89tTYsrofGPkSfGTdmW4ciw4vAfgcKhjggRgZ",
    description: "I want to open a case",
    locType: "Transaction"
};

const identityLoc = {
    description: "Identity LOC",
    locType: "Identity",
    userIdentity: identityInIdentityLoc
}

const transactionLoc = {
    requesterIdentityLoc: IDENTITY_LOC_ID,
    description: "I want to open a case",
    locType: "Transaction"
};

const testFile:FileDescription = {
    name: "test-file",
    nature: "file-nature",
    contentType: "application/pdf",
    hash: "0x9383cd5dfeb5870027088289c665c3bae2d339281840473f35311954e984dea9",
    oid: 123,
    addedOn: moment()
}

const testLink:LinkDescription = {
    target: "507a00a1-7387-44b8-ac4d-fa57ccbf6da5",
    nature: "link-nature"
}

const testMetadataItem:MetadataItemDescription = {
    name: "test-data",
    value: "test-data-value"
}

const testDataWithUserIdentity = {
    ...testData,
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@logion.network",
        phoneNumber: "+1234"
    }
};

const REJECT_REASON = "Illegal";
const REQUEST_ID = "3e67427a-d80f-41d7-9c86-75a63b8563a1"
const VOID_REASON = "Expired";

describe('LocRequestController', () => {

    it('succeeds to create loc request with embedded user identity', async () => {
        const app = setupApp(
            LocRequestController,
            mockModelForCreation,
            true,
            false
        )
        await request(app)
            .post('/api/loc-request')
            .send(testDataWithUserIdentity)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBeDefined();
                expect(response.body.status).toBe("REQUESTED");
                expect(response.body.locType).toBe("Transaction");
                const userIdentity = response.body.userIdentity;
                expect(userIdentity.firstName).toBe("John");
                expect(userIdentity.lastName).toBe("Doe");
                expect(userIdentity.email).toBe("john.doe@logion.network");
                expect(userIdentity.phoneNumber).toBe("+1234");
            });
    });

    it('succeeds to create open loc with existing protection request', async () => {
        const app = setupApp(
            LocRequestController,
            container => mockModelForCreation(container, true),
            true,
            true,
        )
        await request(app)
            .post('/api/loc-request')
            .send(testData)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBeDefined();
                expect(response.body.status).toBe("OPEN");
                expect(response.body.locType).toBe("Transaction");
                const userIdentity = response.body.userIdentity;
                expect(userIdentity.firstName).toBe("Scott");
                expect(userIdentity.lastName).toBe("Tiger");
                expect(userIdentity.email).toBe("scott.tiger@logion.network");
                expect(userIdentity.phoneNumber).toBe("+6789");
            });
    });

    it('succeeds to create open loc with embedded user identity', async () => {
        const app = setupApp(
            LocRequestController,
            mockModelForCreation,
            true,
            true,
        )
        await request(app)
            .post('/api/loc-request')
            .send(testDataWithUserIdentity)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBeDefined();
                expect(response.body.status).toBe("OPEN");
                expect(response.body.locType).toBe("Transaction");
                const userIdentity = response.body.userIdentity;
                expect(userIdentity.firstName).toBe("John");
                expect(userIdentity.lastName).toBe("Doe");
                expect(userIdentity.email).toBe("john.doe@logion.network");
                expect(userIdentity.phoneNumber).toBe("+1234");
            });
    });

    it('succeeds to create open loc with identity LOC', async () => {
        const app = setupApp(
            LocRequestController,
            mockModelForCreationWithIdentityLoc,
            true,
            true,
        )
        await request(app)
            .post('/api/loc-request')
            .send(transactionLoc)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBeDefined();
                expect(response.body.status).toBe("OPEN");
                expect(response.body.locType).toBe("Transaction");
                expect(response.body.requesterAddress).toBeUndefined();
                expect(response.body.requesterIdentityLoc).toBe(IDENTITY_LOC_ID);
                const userIdentity = response.body.userIdentity;
                expect(userIdentity.firstName).toBe("Felix");
                expect(userIdentity.lastName).toBe("the Cat");
                expect(userIdentity.email).toBe("felix@logion.network");
                expect(userIdentity.phoneNumber).toBe("+0101");
            });
    });

    it('succeeds to create loc request with existing protection request', async () => {
        const app = setupApp(
            LocRequestController,
            container => mockModelForCreation(container, true),
            true,
            false
        )
        await request(app)
            .post('/api/loc-request')
            .send(testData)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBeDefined();
                expect(response.body.status).toBe("REQUESTED");
                expect(response.body.locType).toBe("Transaction");
                const userIdentity = response.body.userIdentity;
                expect(userIdentity.firstName).toBe("Scott");
                expect(userIdentity.lastName).toBe("Tiger");
                expect(userIdentity.email).toBe("scott.tiger@logion.network");
                expect(userIdentity.phoneNumber).toBe("+6789");
            });
    });

    it('succeeds to fetch loc requests with embedded user identity', async () => {
        const app = setupApp(LocRequestController, mockModelForFetch)
        await request(app)
            .put('/api/loc-request')
            .send({
                requesterAddress: testDataWithUserIdentity.requesterAddress,
                statuses: [ "OPEN", "REJECTED" ]
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                checkResponse(response);
                const userIdentity = response.body.requests[0].userIdentity;
                expect(userIdentity.firstName).toBe("John");
                expect(userIdentity.lastName).toBe("Doe");
                expect(userIdentity.email).toBe("john.doe@logion.network");
                expect(userIdentity.phoneNumber).toBe("+1234");
            });
    });

    it('succeeds to fetch loc requests with existing protection request', async () => {
        const app = setupApp(LocRequestController, container => mockModelForFetch(container, true))
        await request(app)
            .put('/api/loc-request')
            .send({
                requesterAddress: testData.requesterAddress,
                statuses: [ "OPEN", "REJECTED" ]
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                checkResponse(response);
                const userIdentity = response.body.requests[0].userIdentity;
                expect(userIdentity.firstName).toBe("Scott");
                expect(userIdentity.lastName).toBe("Tiger");
                expect(userIdentity.email).toBe("scott.tiger@logion.network");
                expect(userIdentity.phoneNumber).toBe("+6789");
            });
    });

    it('fails to create loc request - authentication failure', async () => {
        const app = setupApp(LocRequestController, mockModelForCreation, false)
        await request(app)
            .post('/api/loc-request')
            .send(testData)
            .expect(401)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBeUndefined();
            });
    });

    function checkResponse(response: Response) {
        expect(response.body.requests.length).toBe(1);
        expect(response.body.requests[0].id).toBe(REQUEST_ID)
        expect(response.body.requests[0].requesterAddress).toBe(testData.requesterAddress)
        expect(response.body.requests[0].ownerAddress).toBe(ALICE)
        expect(response.body.requests[0].status).toBe("REJECTED")
        expect(response.body.requests[0].rejectReason).toBe(REJECT_REASON)
    }

    it('fails to fetch loc requests - authentication failure', async () => {
        const app = setupApp(LocRequestController, mockModelForFetch, false)
        await request(app)
            .put('/api/loc-request')
            .send({
                requesterAddress: testData.requesterAddress,
                statuses: [ "OPEN", "REJECTED" ]
            })
            .expect(401)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.requests).toBeUndefined();
            });
    });

    it('rejects a requested loc', async () => {
        const app = setupApp(LocRequestController, mockModelForReject)
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/reject`)
            .send({
                rejectReason: REJECT_REASON
            })
            .expect(200)
    })

    it('accepts a requested loc', async () => {
        const app = setupApp(LocRequestController, mockModelForAccept)
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/accept`)
            .expect(200)
    })

    it('adds file to loc', async () => {
        const app = setupApp(LocRequestController, mockModelForAddFile);
        const buffer = Buffer.from(SOME_DATA);
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/files`)
            .field({ nature: "some nature", submitter: SUBMITTER })
            .attach('file', buffer, {
                filename: FILE_NAME,
                contentType: 'text/plain',
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.hash).toBe(SOME_DATA_HASH);
            });
    })

    it('fails to add file to loc when not owner', async () => {
        const app = setupApp(LocRequestController, mockModelForAddFile, true, false);
        const buffer = Buffer.from(SOME_DATA);
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/files`)
            .field({ nature: "some nature" })
            .attach('file', buffer, {
                filename: FILE_NAME,
                contentType: 'text/plain',
            })
            .expect(401);
    })

    it('downloads existing file given its hash', async () => {
        const app = setupApp(LocRequestController, mockModelForDownloadFile);
        const filePath = "/tmp/download-" + REQUEST_ID + "-" + SOME_DATA_HASH;
        await writeFile(filePath, SOME_DATA);
        await request(app)
            .get(`/api/loc-request/${ REQUEST_ID }/files/${ SOME_DATA_HASH }`)
            .expect(200, SOME_DATA)
            .expect('Content-Type', /text\/plain/);
        let fileReallyExists = true;
        for(let i = 0; i < 10; ++i) {
            if(!await fileExists(filePath)) {
                fileReallyExists = false;
                break;
            }
        }
        if(fileReallyExists) {
            expect(true).toBe(false);
        }
    })

    it('succeeds to get single loc request', async () => {
        const app = setupApp(LocRequestController, mockModelForGetSingle)
        await request(app)
            .get(`/api/loc-request/${REQUEST_ID}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.id).toBe(REQUEST_ID);
                const file = response.body.files[0]
                expect(file.name).toBe(testFile.name)
                expect(file.nature).toBe(testFile.nature)
                expect(file.hash).toBe(testFile.hash)
                expect(file.addedOn).toBe(testFile.addedOn?.toISOString())
                expect(file.submitter).toBe(ALICE) // TODO Change me
                const link = response.body.links[0]
                expect(link.nature).toBe(testLink.nature)
                expect(link.target).toBe(testLink.target)
                expect(link.addedOn).toBe(testLink.addedOn?.toISOString())
                const metadataItem = response.body.metadata[0]
                expect(metadataItem.name).toBe(testMetadataItem.name)
                expect(metadataItem.value).toBe(testMetadataItem.value)
                expect(metadataItem.addedOn).toBe(testMetadataItem.addedOn?.toISOString())
                expect(metadataItem.submitter).toBe(ALICE) // TODO Change me
            });
    });

    it('deletes a file', async () => {
        const app = setupApp(LocRequestController, mockModelForDeleteFile)
        await request(app)
            .delete(`/api/loc-request/${REQUEST_ID}/files/${SOME_DATA_HASH}`)
            .expect(200);
    });

    it('confirms a file', async () => {
        const app = setupApp(LocRequestController, mockModelForConfirmFile)
        await request(app)
            .put(`/api/loc-request/${REQUEST_ID}/files/${SOME_DATA_HASH}/confirm`)
            .expect(204);
    });

    it('adds a metadata item', async () => {
        const locRequest = mockRequestForMetadata();
        const app = setupApp(LocRequestController, (container) => mockModelForAllItems(container, locRequest))
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/metadata`)
            .send({ name: SOME_DATA_NAME, value: SOME_DATA_VALUE, submitter: SUBMITTER })
            .expect(204)
        locRequest.verify(instance => instance.addMetadataItem(
            It.Is<MetadataItemDescription>(item => item.name == SOME_DATA_NAME && item.value == SOME_DATA_VALUE)))
    })

    it('fails to adds a metadata item when not owner', async () => {
        const locRequest = mockRequestForMetadata();
        const app = setupApp(LocRequestController, (container) => mockModelForAllItems(container, locRequest), true, false)
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/metadata`)
            .send({ name: SOME_DATA_NAME, value: SOME_DATA_VALUE })
            .expect(401)
    })

    it('deletes a metadata item', async () => {
        const locRequest = mockRequestForMetadata();
        const app = setupApp(LocRequestController, (container) => mockModelForAllItems(container, locRequest))
        const dataName = encodeURIComponent(SOME_DATA_NAME)
        await request(app)
            .delete(`/api/loc-request/${ REQUEST_ID }/metadata/${ dataName }`)
            .expect(200)
        locRequest.verify(instance => instance.removeMetadataItem(SOME_DATA_NAME))
    })

    it('confirms a metadata item', async () => {
        const locRequest = mockRequestForMetadata();
        const app = setupApp(LocRequestController, (container) => mockModelForAllItems(container, locRequest))
        const dataName = encodeURIComponent(SOME_DATA_NAME)
        await request(app)
            .put(`/api/loc-request/${ REQUEST_ID }/metadata/${ dataName }/confirm`)
            .expect(204)
        locRequest.verify(instance => instance.confirmMetadataItem(SOME_DATA_NAME))
    })


    it('adds a link', async () => {
        const locRequest = mockRequestForLink();
        const app = setupApp(LocRequestController, (container) => mockModelForAddLink(container, locRequest))
        await request(app)
            .post(`/api/loc-request/${ REQUEST_ID }/links`)
            .send({ target: SOME_LINK_TARGET, nature: SOME_LINK_NATURE })
            .expect(204)
        locRequest.verify(instance => instance.addLink(
            It.Is<LinkDescription>(item => item.target == SOME_LINK_TARGET && item.nature == SOME_LINK_NATURE)))
    })

    it('deletes a link', async () => {
        const locRequest = mockRequestForLink();
        const app = setupApp(LocRequestController, (container) => mockModelForAllItems(container, locRequest))
        await request(app)
            .delete(`/api/loc-request/${ REQUEST_ID }/links/${ SOME_LINK_TARGET }`)
            .expect(200)
        locRequest.verify(instance => instance.removeLink(SOME_LINK_TARGET))
    })

    it('confirms a link', async () => {
        const locRequest = mockRequestForLink();
        const app = setupApp(LocRequestController, (container) => mockModelForAllItems(container, locRequest))
        await request(app)
            .put(`/api/loc-request/${ REQUEST_ID }/links/${ SOME_LINK_TARGET }/confirm`)
            .expect(204)
        locRequest.verify(instance => instance.confirmLink(SOME_LINK_TARGET))
    })

    it('pre-closes', async () => {
        const app = setupApp(LocRequestController, mockModelForPreClose)
        await request(app)
            .post(`/api/loc-request/${REQUEST_ID}/close`)
            .expect(204);
    });

    it('pre-voids', async () => {
        const app = setupApp(LocRequestController, mockModelForPreVoid)
        await request(app)
            .post(`/api/loc-request/${REQUEST_ID}/void`)
            .send({
                reason: VOID_REASON
            })
            .expect(204);
    });
})

function mockModelForReject(container: Container): void {
    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    const request = mockRequest("REQUESTED", testData);
    request.setup(instance => instance.reject(It.Is<string>(reason => reason === REJECT_REASON), It.IsAny<Moment>()))
        .returns();
    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.save(It.IsAny<LocRequestAggregateRoot>()))
        .returns(Promise.resolve());
    repository.setup(instance => instance.findById(It.Is<string>(id => id === REQUEST_ID)))
        .returns(Promise.resolve(request.object()));
    container.bind(LocRequestRepository).toConstantValue(repository.object());
    const protectionRepository = new Mock<ProtectionRequestRepository>();
    container.bind(ProtectionRequestRepository).toConstantValue(protectionRepository.object());

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForAccept(container: Container): void {
    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    const request = mockRequest("REQUESTED", testData);
    request.setup(instance => instance.accept(It.Is<string>(It.IsAny<Moment>())))
        .returns();
    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.save(It.IsAny<LocRequestAggregateRoot>()))
        .returns(Promise.resolve());
    repository.setup(instance => instance.findById(It.Is<string>(id => id === REQUEST_ID)))
        .returns(Promise.resolve(request.object()));
    container.bind(LocRequestRepository).toConstantValue(repository.object());
    const protectionRepository = new Mock<ProtectionRequestRepository>();
    container.bind(ProtectionRequestRepository).toConstantValue(protectionRepository.object());

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForCreation(container: Container, hasProtection: boolean = false): void {

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.save)
        .returns(() => Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    const request = mockRequest("REQUESTED", hasProtection ? testData : testDataWithUserIdentity)
    factory.setup(instance => instance.newLocRequest(It.Is<NewLocRequestParameters>(params =>
        params.description.requesterAddress == testData.requesterAddress &&
        params.description.ownerAddress == ALICE &&
        params.description.description == testData.description
    )))
        .returns(Promise.resolve(request.object()))
    const openLoc = mockRequest("OPEN", hasProtection ? testData : testDataWithUserIdentity)
    factory.setup(instance => instance.newOpenLoc(It.Is<NewLocRequestParameters>(params =>
        params.description.requesterAddress == testData.requesterAddress &&
        params.description.ownerAddress == ALICE &&
        params.description.description == testData.description
    )))
        .returns(Promise.resolve(openLoc.object()))
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(hasProtection));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForCreationWithIdentityLoc(container: Container): void {

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.save)
        .returns(() => Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());
    const identityLocRequest = mockRequest("CLOSED", identityLoc)
    repository.setup(instance => instance.findById(IDENTITY_LOC_ID))
        .returns(Promise.resolve(identityLocRequest.object()))

    const factory = new Mock<LocRequestFactory>();
    const request = mockRequest("OPEN", transactionLoc)
    factory.setup(instance => instance.newOpenLoc(It.Is<NewLocRequestParameters>(params =>
        params.description.requesterIdentityLoc === IDENTITY_LOC_ID &&
        params.description.ownerAddress == ALICE
    )))
        .returns(Promise.resolve(request.object()))
    container.bind(LocRequestFactory).toConstantValue(factory.object());

    const protectionRepository = new Mock<ProtectionRequestRepository>();
    container.bind(ProtectionRequestRepository).toConstantValue(protectionRepository.object());

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockProtectionRepository(hasProtection: boolean): ProtectionRequestRepository {
    const protectionRepository = new Mock<ProtectionRequestRepository>();
    if (hasProtection) {
        const protection = new Mock<ProtectionRequestAggregateRoot>()
        protection.setup(instance => instance.getDescription()).returns({
            otherLegalOfficerAddress: BOB,
            userIdentity: testUserIdentity,
            userPostalAddress: {
                line1: "",
                line2: "",
                postalCode: "",
                city: "",
                country: "",
            },
            isRecovery: false,
            createdOn: "",
            requesterAddress: "5CSYdyGLF84KKvieonBoANeqPiUXZBn8CbnJFmpHiXzcG5Ft",
            addressToRecover: null
        })
        protectionRepository.setup(instance => instance.findBy(It.IsAny()))
            .returns(Promise.resolve([ protection.object() ]))
    } else {
        protectionRepository.setup(instance => instance.findBy(It.IsAny()))
            .returns(Promise.resolve([]))
    }
    return protectionRepository.object();
}

function mockRequest(status: LocRequestStatus,
                     data: any,
                     files: FileDescription[] = [],
                     metadataItems: MetadataItemDescription[] = [],
                     links: LinkDescription[] = [],
                     ): Mock<LocRequestAggregateRoot> {
    const request = new Mock<LocRequestAggregateRoot>();
    request.setup(instance => instance.status)
        .returns(status);
    request.setup(instance => instance.id)
        .returns(REQUEST_ID);
    request.setup(instance => instance.getDescription())
        .returns({
            ...data,
            createdOn: moment().toISOString(),
            ownerAddress: ALICE
        });
    request.setup(instance => instance.getFiles()).returns(files);
    request.setup(instance => instance.getMetadataItems()).returns(metadataItems);
    request.setup(instance => instance.getLinks()).returns(links);
    request.setup(instance => instance.getVoidInfo()).returns(null);
    return request;
}

function mockModelForFetch(container: Container, hasProtection: boolean = false): void {
    const request = mockRequest("REJECTED", hasProtection ? testData : testDataWithUserIdentity)
    request.setup(instance => instance.rejectReason)
        .returns(REJECT_REASON);
    const requests: LocRequestAggregateRoot[] = [ request.object() ]

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findBy)
        .returns(() => Promise.resolve(requests));
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(hasProtection));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

const SOME_DATA = 'some data';
const SOME_DATA_HASH = '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee';
const FILE_NAME = "'a-file.pdf'";

function mockModelForAddFile(container: Container): void {
    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.save(It.IsAny<LocRequestAggregateRoot>()))
        .returns(Promise.resolve());

    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.hasFile(SOME_DATA_HASH)).returns(false);
    request.setup(instance => instance.addFile).returns(() => {});

    repository.setup(instance => instance.findById(It.Is<string>(id => id === REQUEST_ID)))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const protectionRepository = new Mock<ProtectionRequestRepository>();
    container.bind(ProtectionRequestRepository).toConstantValue(protectionRepository.object());

    const fileDbService = new Mock<FileDbService>();
    fileDbService.setup(instance => instance.importFile(It.IsAny<string>(), SOME_DATA_HASH))
        .returns(Promise.resolve(42));
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForDownloadFile(container: Container): void {
    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.save(It.IsAny<LocRequestAggregateRoot>()))
        .returns(Promise.resolve());
    const request = mockRequest("OPEN", testData);
    const hash = SOME_DATA_HASH;
    request.setup(instance => instance.getFile(hash)).returns(SOME_FILE);
    repository.setup(instance => instance.findById(It.Is<string>(id => id === REQUEST_ID)))
        .returns(Promise.resolve(request.object()));
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const protectionRepository = new Mock<ProtectionRequestRepository>();
    container.bind(ProtectionRequestRepository).toConstantValue(protectionRepository.object());

    const fileDbService = new Mock<FileDbService>();
    const filePath = "/tmp/download-" + REQUEST_ID + "-" + hash;
    fileDbService.setup(instance => instance.exportFile(SOME_OID, filePath))
        .returns(Promise.resolve());
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

const SOME_OID = 123456;

const SOME_FILE = {
    name: "file-name",
    contentType: "text/plain",
    hash: SOME_DATA_HASH,
    oid: SOME_OID,
    nature: "file-nature",
    submitter: SUBMITTER
};

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await readFile(filePath);
        return true;
    } catch {
        return false;
    }
}

function mockModelForGetSingle(container: Container): void {
    const request = mockRequest("OPEN",
        testData,
        [ testFile ],
        [ testMetadataItem ],
        [ testLink ]
    );

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForDeleteFile(container: Container) {
    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.removeFile(SOME_DATA_HASH)).returns(SOME_FILE);

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    fileDbService.setup(instance => instance.deleteFile(SOME_OID)).returns(Promise.resolve());
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForConfirmFile(container: Container) {
    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.confirmFile(SOME_DATA_HASH)).returns(undefined);

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

const SOME_DATA_NAME = "data name with exotic char !é\"/&'"
const SOME_DATA_VALUE = "data value with exotic char !é\"/&'"

function mockRequestForMetadata(): Mock<LocRequestAggregateRoot> {
    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.removeMetadataItem(SOME_DATA_NAME))
        .returns()
    request.setup(instance => instance.confirmMetadataItem(SOME_DATA_NAME))
        .returns()
    request.setup(instance => instance.addMetadataItem({ name: SOME_DATA_NAME, value: SOME_DATA_VALUE}))
        .returns()
    return request;
}

const SOME_LINK_TARGET = '35bac9a0-1516-4f8d-ae9e-9b14abe87e25'
const SOME_LINK_NATURE = 'link_nature'

function mockRequestForLink(): Mock<LocRequestAggregateRoot> {
    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.removeLink(SOME_LINK_TARGET))
        .returns()
    request.setup(instance => instance.confirmLink(SOME_LINK_TARGET))
        .returns()
    request.setup(instance => instance.addLink({ target: SOME_LINK_TARGET, nature: SOME_LINK_NATURE}))
        .returns()
    return request;
}

function mockModelForAllItems(container: Container, request: Mock<LocRequestAggregateRoot>) {
    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForAddLink(container: Container, request: Mock<LocRequestAggregateRoot>) {
    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    const linkTargetRequest = mockRequest("OPEN", testData)
    linkTargetRequest.setup(instance => instance.id).returns(SOME_LINK_TARGET)
    repository.setup(instance => instance.findById(SOME_LINK_TARGET))
        .returns(Promise.resolve(linkTargetRequest.object()))

    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForPreClose(container: Container) {
    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.preClose()).returns(undefined);

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}

function mockModelForPreVoid(container: Container) {
    const request = mockRequest("OPEN", testData);
    request.setup(instance => instance.preVoid(VOID_REASON)).returns(undefined);

    const repository = new Mock<LocRequestRepository>();
    repository.setup(instance => instance.findById(REQUEST_ID))
        .returns(Promise.resolve(request.object()));
    repository.setup(instance => instance.save(request.object()))
        .returns(Promise.resolve());
    container.bind(LocRequestRepository).toConstantValue(repository.object());

    const factory = new Mock<LocRequestFactory>();
    container.bind(LocRequestFactory).toConstantValue(factory.object());
    container.bind(ProtectionRequestRepository).toConstantValue(mockProtectionRepository(false));

    const fileDbService = new Mock<FileDbService>();
    container.bind(FileDbService).toConstantValue(fileDbService.object());
}
