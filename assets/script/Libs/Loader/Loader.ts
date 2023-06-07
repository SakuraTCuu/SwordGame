import { Asset, resources } from "cc";
import { from, of } from "../Rxjs";
import ResCacheAssets from "./ResCacheAssets";
import { ResLeakChecker } from "./ResLeakChecker";
import ResLoader, { AssetType, CompleteCallback, IRemoteOptions, ProgressCallback } from "./ResLoader";

export default class Loader {
    private static _mainInstance: Loader = null
    public static MainLoader(): Loader {
        if (!this._mainInstance) {
            this._mainInstance = new Loader()
        }
        return this._mainInstance
    }

    public static get Instance() {
        return Loader.MainLoader();
    }
    // 父管理器
    private parentLoader: Loader = null;
    // 子管理器       
    private subLoaders: Loader[] = null;
    // 资源加载实例 
    private resLoader: ResLoader = null;

    constructor() {

        this.subLoaders = []
        this.resLoader = new ResLoader();
        this.resLoader.resCacheAssets = new ResCacheAssets();

    }

    /**
     * 获取到根管理器
     */
    get rootLoader(): Loader {
        let root: Loader = this
        while (root.parentLoader) {
            root = root.parentLoader
        }
        return root
    }
    /**
     * 创建子管理器
     */
    createSubLoader(): Loader {
        let loader = new Loader()
        loader.parentLoader = this
        if (this.resLoader?.resLeakChecker) {
            loader.resLoader.resLeakChecker = this.resLoader?.resLeakChecker;
        }
        this.subLoaders.push(loader)
        return loader
    }
    /**
     * 释放资源
     */
    public release() {
        //释放控制
        of(...this.subLoaders)
            .subscribe((v) => {
                v.release();
            });

        this.resLoader.resCacheAssets.releaseAssets();

        //从父控制器移除自己
        this.parentLoader.removeSub(this);
    }

    /**
     * 移除子管理器
     * @param loader  需移除的子管理器
     */
    private removeSub(loader: Loader) {
        let index: number = this.subLoaders.indexOf(loader)
        if (index >= 0) {
            this.subLoaders.splice(index, 1);
        }
    }
    /**
     * 设置资源追踪
     * @param checker 
     */
    public setLeakChecker(checker: ResLeakChecker) {
        if (!this.resLoader) return;
        //释放控制
        of(...this.subLoaders)
            .subscribe((v) => {
                v.setLeakChecker(checker);
            });
        if (this.resLoader.resLeakChecker) {
            this.resLoader.resLeakChecker.reset();
        }

        this.resLoader.resLeakChecker = checker;
    }

    /**
     * 开始加载资源
     * @param bundle        assetbundle的路径
     * @param url           资源url或url数组
     * @param type          资源类型，默认为null
     * @param onProgess     加载进度回调
     * @param onCompleted   加载完成回调
     */
    public load<T extends Asset>(bundleName: string, paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;
    public load(...args: any) {
        // 调用加载接口
        this.resLoader.load.apply(this.resLoader, args);
    }
    public async loadAsync<T extends Asset>(path: string, type: AssetType<T>, onProgress: ProgressCallback | null) {
        return new Promise<T>((resolve, reject) => {
            this.load(path, type, onProgress, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset as any);
            });
        });
    }

    public loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(bundleName: string, dir: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(bundleName: string, dir: string, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T> | null, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(dir: string, type: AssetType<T> | null, onComplete?: CompleteCallback<T[]> | null): void;
    public loadDir<T extends Asset>(...args: any) {
        // 调用加载接口
        this.resLoader.loadDir.apply(this.resLoader, args);
    }

    public async loadDirAsync<T extends Asset>(bundle: string, dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete?: CompleteCallback<T[]> | null) {
        return new Promise<T>((resolve, reject) => {
            this.loadDir(bundle, dir, type, onProgress, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset as any);
            });
        });
    }

    public loadRemote<T extends Asset>(url: string, options: IRemoteOptions | null, onComplete?: CompleteCallback<T> | null): void;
    public loadRemote<T extends Asset>(url: string, onComplete?: CompleteCallback<T> | null): void;
    public loadRemote<T extends Asset>(...args): void {
        // 调用加载接口
        this.resLoader.loadRemote.apply(this.resLoader, args);
    }

    public async loadRemoteAsync<T extends Asset>(dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null) {
        return new Promise<T>((resolve, reject) => {
            this.loadRemote(dir, type, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset as any);
            });
        });
    }

    public get<T extends Asset>(path: string, type?: AssetType<T>) {
        this.resLoader.getRes(path, type);
    }
}