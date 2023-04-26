declare module "cc" {
    interface Asset {
        resetTrace?: () => void;
        traceMap?: Map<string, number>;
    }
}