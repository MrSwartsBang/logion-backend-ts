import { JsonCall, JsonObject, UUID, asBigInt } from "@logion/node-api";

export interface JsonExtrinsic {
    call: JsonCall;
    signer: string | null;
    tip: string | null;
    partialFee: () => Promise<string | undefined>;
    storageFee?: bigint;
    events: JsonEvent[];
    error: () => ExtrinsicError | null;
}

export function toString(extrinsic: JsonExtrinsic, error: ExtrinsicError | null): string {
    return `extrinsic ${ methodToString(extrinsic.call) } ${ errorToString(error) }`
}

export function toStringWithoutError(extrinsic: JsonExtrinsic): string {
    return `extrinsic ${ methodToString(extrinsic.call) }`
}

export interface JsonEvent {
    section: string;
    method: string;
    data: any[];
}

function methodToString(call: JsonCall): string {
    return `method [${call.section}.${call.method}]`
}

export interface ExtrinsicError {
    section: string
    name: string
    details: string
}

function errorToString(error: ExtrinsicError | null): string {
    if (error) {
        return `error [${ error.section }.${ error.name }]`
    } else {
        return "";
    }
}

export function extractUuid(argKey: string, args: JsonObject): string {
    return UUID.fromDecimalStringOrThrow(asBigInt(args[argKey]).toString()).toString();
}

export function findEventData(extrinsic: JsonExtrinsic, method: { pallet: string, method: string }): any[] | undefined {
    const event = extrinsic.events
        .find(event => {
            return event.section === method.pallet && event.method === method.method;

        });
    if (event === undefined) {
        return undefined;
    } else {
        return event.data;
    }
}

