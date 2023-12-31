INSERT INTO collection_item(collection_loc_id, item_id, added_on)
VALUES ('2035224b-ef77-4a69-aac4-e74bd030675d', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '2022-02-16T18:28:42.000000');

INSERT INTO collection_item(collection_loc_id, item_id, added_on)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '2022-02-16T18:28:42.000000');

-- File 1
INSERT INTO collection_item_file(collection_loc_id, item_id, hash, cid)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x979ff1da4670561bf3f521a1a1d4aad097d617d2fa2c0e75d52efe90e7b7ce83', 123456);

-- Delivery 1 for File 1
INSERT INTO collection_item_file_delivered(collection_loc_id, item_id, hash, delivered_file_hash, generated_on, owner)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x979ff1da4670561bf3f521a1a1d4aad097d617d2fa2c0e75d52efe90e7b7ce83', '0x38c79034a97d8827559f883790d52a1527f6e7d37e66ac8e70bafda216fda6d7', '2022-08-17T10:53:42.000000', '0x900edc98db53508e6742723988B872dd08cd09c2');

-- Delivery 2 for File 1
INSERT INTO collection_item_file_delivered(collection_loc_id, item_id, hash, delivered_file_hash, generated_on, owner)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x979ff1da4670561bf3f521a1a1d4aad097d617d2fa2c0e75d52efe90e7b7ce83', '0xf35e4bcbc1b0ce85af90914e04350cce472a2f01f00c0f7f8bc5c7ba04da2bf2', '2022-08-23T10:53:42.000000', '0x900edc98db53508e6742723988B872dd08cd09c3');

-- File 2
INSERT INTO collection_item_file(collection_loc_id, item_id, hash, cid)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x8bd8548beac4ce719151dc2ae893f8edc658a566e5ff654104783e14fb44012e', 78910);

-- Terms and conditions
INSERT INTO collection_item_tc_element(collection_loc_id, item_id, element_index, type, details)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', 0, 'CC4.0', 'BY');

INSERT INTO collection_item(collection_loc_id, item_id, added_on)
VALUES ('296d3d8f-057f-445c-b4c8-59aa7d2d21de', '0xf35e4bcbc1b0ce85af90914e04350cce472a2f01f00c0f7f8bc5c7ba04da2bf2', '2022-02-17T18:28:42.000000');

INSERT INTO collection_item(collection_loc_id, item_id, added_on)
VALUES ('c38e5ab8-785f-4e26-91bd-f9cdef82f601', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '2022-02-16T18:28:42.000000');

-- File not uploaded yet
INSERT INTO collection_item_file(collection_loc_id, item_id, hash)
VALUES ('c38e5ab8-785f-4e26-91bd-f9cdef82f601', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x979ff1da4670561bf3f521a1a1d4aad097d617d2fa2c0e75d52efe90e7b7ce83');

-- Not yet synced
INSERT INTO collection_item(collection_loc_id, item_id)
VALUES ('52d29fe9-983f-44d2-9e23-c8cb542981a3', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee');

INSERT INTO collection_item_file(collection_loc_id, item_id, hash, cid)
VALUES ('52d29fe9-983f-44d2-9e23-c8cb542981a3', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x979ff1da4670561bf3f521a1a1d4aad097d617d2fa2c0e75d52efe90e7b7ce83', 123456);

INSERT INTO collection_item_file(collection_loc_id, item_id, hash, cid)
VALUES ('52d29fe9-983f-44d2-9e23-c8cb542981a3', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '0x8bd8548beac4ce719151dc2ae893f8edc658a566e5ff654104783e14fb44012e', 78910);

-- Synced but no files yet
INSERT INTO collection_item(collection_loc_id, item_id, added_on)
VALUES ('f14c0bd4-9ed1-4c46-9b42-47c63e09223f', '0x1307990e6ba5ca145eb35e99182a9bec46531bc54ddf656a602c780fa0240dee', '2022-01-01T18:28:42.000000');
