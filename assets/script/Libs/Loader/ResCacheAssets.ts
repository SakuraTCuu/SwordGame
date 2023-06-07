import { Asset } from "cc";
import { AssetType } from "./ResLoader";

export default class ResCacheAssets {
    // 是否被释放
    private released: boolean = false

    // private resCache = new Set<Asset>();
    private resCache = new Map<string, Asset>();


    /**
     * 缓存资源
     * @param asset 
     */
    public cacheAsset(path: string, asset: Asset) {
        if (this.released) return;

        if (!this.resCache.has(path)) {
            asset.addRef();
            this.resCache.set(path, asset);
        }
    }

    /**
     * 释放资源
     */
    public releaseAssets() {
        this.released = true;
        this.resCache.forEach(element => {
            element.decRef();
        });
        this.resCache.clear();
    }

    public getAsset(path: string, type?: Asset) {
        if (this.resCache.has(path)) {
            return this.resCache.get(path);
        }
        console.log(`not find res, path = ${path} `);
        return null;
    }
}