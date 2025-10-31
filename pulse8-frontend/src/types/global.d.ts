// Declarações de tipos globais para resolver erros TypeScript

declare module 'prop-types' {
  export interface Validator<T> {
    (props: any, propName: string, componentName: string, location: string, propFullName: string): Error | null;
  }
  
  export const any: Validator<any>;
  export const array: Validator<any[]>;
  export const bool: Validator<boolean>;
  export const func: Validator<Function>;
  export const number: Validator<number>;
  export const object: Validator<object>;
  export const string: Validator<string>;
  export const node: Validator<React.ReactNode>;
  export const element: Validator<React.ReactElement>;
  export const elementType: Validator<React.ComponentType>;
  export const instanceOf: <T>(expectedClass: new (...args: any[]) => T) => Validator<T>;
  export const oneOf: <T>(values: T[]) => Validator<T>;
  export const oneOfType: <T>(validators: Validator<T>[]) => Validator<T>;
  export const arrayOf: <T>(validator: Validator<T>) => Validator<T[]>;
  export const objectOf: <T>(validator: Validator<T>) => Validator<{ [key: string]: T }>;
  export const shape: <T>(shape: { [K in keyof T]: Validator<T[K]> }) => Validator<T>;
  export const exact: <T>(shape: { [K in keyof T]: Validator<T[K]> }) => Validator<T>;
  export const isRequired: <T>(validator: Validator<T>) => Validator<T>;
}

declare module 'scheduler' {
  export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;
  
  export const NoPriority = 0;
  export const ImmediatePriority = 1;
  export const UserBlockingPriority = 2;
  export const NormalPriority = 3;
  export const LowPriority = 4;
  export const IdlePriority = 5;
  
  export interface CallbackNode {
    callback: (() => void) | null;
    priorityLevel: PriorityLevel;
    expirationTime: number;
    next: CallbackNode | null;
    prev: CallbackNode | null;
  }
  
  export function unstable_scheduleCallback(
    priorityLevel: PriorityLevel,
    callback: () => void,
    options?: { delay?: number; timeout?: number }
  ): CallbackNode;
  
  export function unstable_cancelCallback(callbackNode: CallbackNode): void;
  export function unstable_shouldYield(): boolean;
  export function unstable_requestPaint(): void;
  export function unstable_now(): number;
  export function unstable_getCurrentPriorityLevel(): PriorityLevel;
  export function unstable_continueExecution(): void;
  export function unstable_pauseExecution(): void;
  export function unstable_flushExpired(): void;
  export function unstable_flushWithoutYielding(): void;
  export function unstable_flushNumberOfYields(): number;
  export function unstable_flushLength(): number;
  export function unstable_clearYields(): void;
  export function unstable_flushUntilNextPaint(): void;
  export function unstable_flushAll(): void;
  export function unstable_yieldValue(value: any): any;
  export function unstable_advanceTime(ms: number): void;
  export function unstable_setDiscreteUpdatesPriority(priorityLevel: PriorityLevel): void;
  export function unstable_clearDiscreteUpdatesPriority(): void;
  export function unstable_runWithPriority<T>(priorityLevel: PriorityLevel, callback: () => T): T;
  export function unstable_wrapCallback(callback: () => void): () => void;
  export function unstable_getCurrentPriorityLevel(): PriorityLevel;
  export function unstable_shouldYield(): boolean;
  export function unstable_requestPaint(): void;
  export function unstable_now(): number;
  export function unstable_continueExecution(): void;
  export function unstable_pauseExecution(): void;
  export function unstable_flushExpired(): void;
  export function unstable_flushWithoutYielding(): void;
  export function unstable_flushNumberOfYields(): number;
  export function unstable_flushLength(): number;
  export function unstable_clearYields(): void;
  export function unstable_flushUntilNextPaint(): void;
  export function unstable_flushAll(): void;
  export function unstable_yieldValue(value: any): any;
  export function unstable_advanceTime(ms: number): void;
  export function unstable_setDiscreteUpdatesPriority(priorityLevel: PriorityLevel): void;
  export function unstable_clearDiscreteUpdatesPriority(): void;
  export function unstable_runWithPriority<T>(priorityLevel: PriorityLevel, callback: () => T): T;
  export function unstable_wrapCallback(callback: () => void): () => void;
}

