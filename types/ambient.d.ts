declare function _(id: string): string;
declare function print(args: string): void;
declare function log(obj: object, others?: object[]): void;
declare function log(msg: string, subsitutions?: any[]): void;

declare const pkg: {
    version: string;
    name: string;
};

declare module console {
    export function error(obj: object, others?: object[]): void;
    export function error(msg: string, subsitutions?: any[]): void;
    export function warn(obj: object, others?: object[]): void;
    export function warn(msg: string, subsitutions?: any[]): void;
    export function info(obj: object, others?: object[]): void;
    export function info(msg: string, subsitutions?: any[]): void;
    export function debug(obj: object, others?: object[]): void;
    export function debug(msg: string, subsitutions?: any[]): void;
    export function log(obj: any, others?: object[]): void;
    export function log(msg: string, subsitutions?: any[]): void;
}

declare interface String {
    format(...replacements: string[]): string;
    format(...replacements: number[]): string;
}
declare interface Number {
    toFixed(digits: number): number;
}
