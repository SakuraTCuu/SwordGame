import { AnimationClip, Asset, AssetManager, AudioClip, ImageAsset, JsonAsset, Prefab, SpriteFrame, animation } from "cc";
import Loader from "../Libs/Loader/Loader";
import { PreLoad } from "./PreLoad";

interface ResItem {
    id: number,
    path: string;
    desc: string;
    type: Asset | any,
}

export default class PreLoadRes {

    _bundleName: string = "resources";

    _resList: Array<ResItem> = [
        { id: 0, path: "anim", desc: "动画资源", type: AnimationClip },
        // { id: 1, path: "audio", desc: "音频资源", type: AudioClip },
        { id: 2, path: "data", desc: "配表资源", type: JsonAsset },
        { id: 3, path: "images", desc: "图片资源", type: SpriteFrame },
        { id: 4, path: "prefabs", desc: "预制资源", type: Prefab },
    ];

    _ref: PreLoad = null;

    _loader: Loader = null;

    constructor(ref: PreLoad) {
        this._ref = ref;
        this._loader = ref.MainLoader;
    }

    async load() {
        for (let i = 0; i < this._resList.length; i++) {
            let resItem = this._resList[i];

            console.log(`开始加载: ${resItem.path}`);

            this._ref.showDescLabel(`正在加载${resItem.desc}...`);

            await this._loader.loadDirAsync(
                this._bundleName,
                resItem.path,
                resItem.type,
                this.loadProgress.bind(this)
            );
            console.log(`${resItem.path} 加载完成`);
        }

        console.log("所有资源加载完成");
        this._ref.showLoginLayer();
    }

    /**
     * 加载进度
     */
    loadProgress(finished: number, total: number, item: AssetManager.RequestItem | any) {
        // this._ref.showDescLabel(item?.info?.path || item?.url || "");
        //进度
        this._ref.updateLoadingProgress(finished / total);
    }
}