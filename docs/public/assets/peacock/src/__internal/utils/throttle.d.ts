export declare function throttle(func: Function, delay: number, options?: {
    leading: boolean;
    trailing: boolean;
}): (...args: any[]) => void;
