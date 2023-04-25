import { _decorator, Component, Node, resources, SpriteFrame, game, AssetManager, director } from 'cc';
import { em } from '../global/EventManager';
import { PreLoad } from './PreLoad';
import { EventId } from '../global/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('DynamicLoading')
export class DynamicLoading extends Component {

    @property({
        type: PreLoad,
        displayName: "PreLoad"
    })
    preLoadScript: PreLoad = null;

    onDestroy() {
        em.remove(EventId.loadRes);
        em.remove(EventId.loadDir);
    }

    onLoad() {
        em.add(EventId.loadRes, this.loadRes.bind(this));
        em.add(EventId.loadDir, this.loadDir.bind(this));
        this.preLoadAllResources();
        // this.loadDir("anim/enemy/monster");
        director.addPersistRootNode(this.node);
    }

    // 加载所有资源
    preLoadAllResources() {
        console.log("preLoadAllResources");

        //加载resources目录下所有文件
        resources.loadDir("", (finished: number, total: number, item: AssetManager.RequestItem) => {
            this.preLoadScript.updateLoadingProgress(finished / total);
        }, (err, assets) => {

            if (err) {
                console.log(err);
                return;
            } else {
                // this.preLoadScript.enterMainMenuScene();
                this.preLoadScript.showLoginLayer();
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
}

