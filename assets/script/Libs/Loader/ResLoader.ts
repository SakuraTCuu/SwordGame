import { Asset, assetManager, AssetManager, js, resources } from "cc";
import { of } from "../Rxjs";
import ResCacheAssets from "./ResCacheAssets";
import { ResLeakChecker } from "./ResLeakChecker";
// import { AssetType, CompleteCallback, IRemoteOptions, ProgressCallback } from "./CCMResDef";
// import { CCMResLeakChecker } from "./CCMResLeakChecker";

export type ProgressCallback = (completedCount: number, totalCount: number, item: any) => void;
export type CompleteCallback<T = any> = (error: Error, resource: any | any[], urls?: string[]) => void;
export type IRemoteOptions = Record<string, any> | null;
export type AssetType<T = Asset> = typeof Asset;


interface CCMLoadResArgs<T extends Asset> {
    bundle?: string;
    dir?: string;
    paths: string | string[];
    type: AssetType<T> | null;
    onProgress: ProgressCallback | null;
    onComplete: CompleteCallback<T> | null;
}

export default class ResLoader {
    public resLeakChecker: ResLeakChecker = null;
    public resCacheAssets: ResCacheAssets = null;

    public parseLoadResArgs<T extends Asset>(
        paths: string | string[],
        type?: AssetType<T> | ProgressCallback | CompleteCallback | null,
        onProgress?: AssetType<T> | ProgressCallback | CompleteCallback | null,
        onComplete?: ProgressCallback | CompleteCallback | null
    ) {
        let pathsOut: any = paths;
        let typeOut: any = type;
        let onProgressOut: any = onProgress;
        let onCompleteOut: any = onComplete;
        if (onComplete === undefined) {
            const isValidType = js.isChildClassOf(type as AssetType, Asset);
            if (onProgress) {
                onCompleteOut = onProgress as CompleteCallback;
                if (isValidType) {
                    onProgressOut = null;
                }
            } else if (onProgress === undefined && !isValidType) {
                onCompleteOut = type as CompleteCallback;
                onProgressOut = null;
                typeOut = null;
            }
            if (onProgress !== undefined && !isValidType) {
                onProgressOut = type as ProgressCallback;
                typeOut = null;
            }
        }
        let finalComplete = (error: Error, resource: any | any[], urls?: string[]) => {
            if (this.resLeakChecker) {
                if (resource instanceof Array) {
                    resource.forEach(element => {
                        this.resLeakChecker.traceAsset(element);
                    });
                } else {
                    this.resLeakChecker.traceAsset(resource);
                }
            }

            if (this.resCacheAssets) {
                if (resource instanceof Array) {
                    resource.forEach(element => {
                        this.resCacheAssets.cacheAsset(element.nativeUrl || paths, element);
                    });
                } else {
                    this.resCacheAssets.cacheAsset(resource.path, resource);
                }
            }
            if (onCompleteOut) {
                onCompleteOut(error, resource, urls);
            }
        }
        return { paths: pathsOut, type: typeOut, onProgress: onProgressOut, onComplete: finalComplete };
    }

    private loadByBundleAndArgs<T extends Asset>(bundle: AssetManager.Bundle, args: CCMLoadResArgs<T>): void {
        if (args.dir || args.dir === "") { //空路劲, 加载bundle下所有资源
            bundle.loadDir(args.paths as string, args.type, args.onProgress, args.onComplete);
        } else {
            if (typeof args.paths == 'string') {
                bundle.load(args.paths, args.type, args.onProgress, args.onComplete);
            } else {
                bundle.load(args.paths, args.type, args.onProgress, args.onComplete);
            }
        }
    }

    private loadByArgs<T extends Asset>(args: CCMLoadResArgs<T>) {
        if (args.bundle) {
            if (assetManager.bundles.has(args.bundle)) {
                let bundle = assetManager.bundles.get(args.bundle);
                this.loadByBundleAndArgs(bundle!, args);
            } else {
                // 自动加载bundle
                assetManager.loadBundle(args.bundle, (err, bundle) => {
                    if (!err) {
                        this.loadByBundleAndArgs(bundle, args);
                    }
                })
            }
        } else {
            this.loadByBundleAndArgs(resources, args);
        }
    }

    public load<T extends Asset>(bundleName: string, paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(
        bundleName: string,
        paths?: string | string[] | AssetType<T> | ProgressCallback | CompleteCallback | null,
        type?: AssetType<T> | ProgressCallback | CompleteCallback | null,
        onProgress?: ProgressCallback | CompleteCallback | null,
        onComplete?: CompleteCallback | null,
    ) {
        let args: CCMLoadResArgs<T> | null = null;
        if (typeof paths === "string" || paths instanceof Array) {
            args = this.parseLoadResArgs(paths, type, onProgress, onComplete);
            args.bundle = bundleName;
        } else {
            args = this.parseLoadResArgs(bundleName, paths, type, onProgress);
        }
        this.loadByArgs(args);
    }

    public loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(bundleName: string, dir: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(bundleName: string, dir: string, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T> | null, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, type: AssetType<T> | null, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(
        bundleName: string,
        dir?: string | AssetType<T> | ProgressCallback | CompleteCallback | null,
        type?: AssetType<T> | ProgressCallback | CompleteCallback | null,
        onProgress?: ProgressCallback | CompleteCallback | null,
        onComplete?: CompleteCallback | null,
    ) {
        let args: CCMLoadResArgs<T> | null = null;
        if (typeof dir === "string") {
            args = this.parseLoadResArgs(dir, type, onProgress, onComplete);
            args.bundle = bundleName;
        } else {
            args = this.parseLoadResArgs(bundleName, dir, type, onProgress);
        }
        args.dir = args.paths as string;
        this.loadByArgs(args);
    }

    public loadRemote<T extends Asset>(url: string, options: IRemoteOptions | null, onComplete?: CompleteCallback<T> | null): void;
    public loadRemote<T extends Asset>(url: string, onComplete?: CompleteCallback<T> | null): void;
    public loadRemote<T extends Asset>(url: string, options: IRemoteOptions | CompleteCallback<T> | null, onComplete?: CompleteCallback<T> | null): void {
        assetManager.loadRemote(url, options, onComplete);
    }

    public getRes(path: string, type?) {
        this.resCacheAssets.getAsset(path, type);
    }
}