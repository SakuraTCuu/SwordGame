import { Asset } from "cc";

export default class ResCacheAssets {
    // 是否被释放
    private released: boolean = false

    private resCache = new Set<Asset>();


    /**
     * 缓存资源
     * @param asset 
     */
    public cacheAsset(asset: Asset) {
        if (this.released) return;

        if (!this.resCache.has(asset)) {
            asset.addRef();
            this.resCache.add(asset);
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
}