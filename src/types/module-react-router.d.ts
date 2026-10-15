import { NavigateFunction as RRNavigateFunction } from 'react-router';

declare module 'react-router' {
    export interface NavigateFunction extends RRNavigateFunction {
        (to: To, options?: NavigateOptions): void;
        (delta: number): void;
    }
}
