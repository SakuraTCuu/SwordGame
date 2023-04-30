import { Asset } from "cc";
import IService from "../Interfaces/IService";
import Loader from "../Libs/Loader/Loader";
import { ResLeakChecker } from "../Libs/Loader/ResLeakChecker";
import { AssetType, ProgressCallback, CompleteCallback, IRemoteOptions } from "../Libs/Loader/ResLoader";
import Singleton from "../Decorators/Singleton";

@Singleton
export default class LoaderService implements IService {

    public static readonly instance: LoaderService;

    private loader: Loader = null;

    public async initialize(): Promise<void> {
        this.loader = Loader.Instance.createSubLoader();
    }

    public async lazyInitialize(): Promise<void> {

    }

    /**
     * 获取到根管理器
     */
    get rootLoader(): Loader {
        return this.loader.rootLoader;
    }
    /**
     * 创建子管理器
     */
    createSubLoader(): Loader {
        return this.loader.createSubLoader();
    }

    /**
     * 释放资源
     */
    public release() {
        this.loader.release();
    }

    /**
     * 设置资源追踪
     * @param checker 
     */
    public setLeakChecker(checker: ResLeakChecker) {
        this.loader.setLeakChecker(checker);
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
        this.loader.load.apply(this.loader, args);
    }
    public async loadAsync<T extends Asset>(path: string, type: AssetType<T>, onProgress?: ProgressCallback | null) {
        return this.loader.loadAsync(path, type, onProgress);
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

        this.loader.loadDir.apply(this.loader, args);
    }

    public async loadDirAsync<T extends Asset>(bundle: string, dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete?: CompleteCallback<T[]> | null) {
        return this.loader.loadDirAsync(bundle, dir, type, onProgress, onComplete);
    }

    public loadRemote<T extends Asset>(url: string, options: IRemoteOptions | null, onComplete?: CompleteCallback<T> | null): void;
    public loadRemote<T extends Asset>(url: string, onComplete?: CompleteCallback<T> | null): void;
    public loadRemote<T extends Asset>(...args: any): void {
        this.loader.loadRemote.apply(this.loader, args);
    }

    public async loadRemoteAsync<T extends Asset>(dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null) {
        return this.loader.loadAsync(dir, type, onProgress);
    }


    /**
    * resources load
    */
    public resLoad<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public resLoad<T extends Asset>(paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public resLoad<T extends Asset>(paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public resLoad<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;

    public resLoad(...args) {
        this.loader.load('reosurces', ...args);
        // this.loader.load.apply(this.loader, ['reosurces', ...args]);
    }

    public async resLoadAsync<T extends Asset>(path: string, type: AssetType<T>, onProgress?: ProgressCallback | null) {
        return this.loader.loadAsync(path, type, onProgress);
    }
 
}