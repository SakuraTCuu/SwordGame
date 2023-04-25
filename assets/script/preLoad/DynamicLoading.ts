import { _decorator, resources, AssetManager } from 'cc';
import { em } from '../global/EventManager';
import { EventId } from '../global/GameEvent';
import { Asset } from 'cc';

export class DynamicLoading {

    constructor() {
    }

    lazyInitialize() {
        em.add(EventId.loadRes, this.loadRes.bind(this));
        em.add(EventId.loadDir, this.loadDir.bind(this));
        this.preLoadAllResources();
    }

    // 加载所有资源
    preLoadAllResources() {
        console.log("preLoadAllResources");
        //加载resources目录下所有文件
        resources.loadDir("", (finished: number, total: number, item: AssetManager.RequestItem) => {
            //进度
            em.dispatchs(EventId.updateLoadingProgress, finished / total);
        }, (err, assets) => {

            if (err) {
                console.log(err);
                return;
            } else {
                // this.preLoadScript.enterMainMenuScene();
                em.dispatchs(EventId.loadingComplete);
            }
        });
    }

    // 加载文件夹 assets 为数组
    loadDir(dir, callback = null) {

        resources.loadDir(dir, (err, assets) => {
            if (err) {
                console.log(err);
                return;
            } else {
                // console.log(EventId.loadDir,assets);
                if (callback) callback(assets);
            }
        });
    }

    //加载具体路径资源 asset为单个资源
    loadRes(dir, callback = null, errCallback = null) {
        resources.load(dir, (err, assets) => {
            if (err) {
                if (errCallback) errCallback();
                else console.log(err);
                return;
            } else {
                // console.log(EventId.loadRes,assets);
                if (callback) callback(assets);
            }

        })
    }

    getRes(path: string): Asset {
        return resources.get(path);
    }
}

