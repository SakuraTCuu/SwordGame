/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-14 11:37:52
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-27 10:34:22
 * @FilePath: \copy9train\assets\script\preLoad\DynamicLoading.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, resources, SpriteFrame, game, AssetManager, director } from 'cc';
import { em } from '../global/EventManager';
import { PreLoad } from './PreLoad';
const { ccclass, property } = _decorator;

@ccclass('DynamicLoading')
export class DynamicLoading extends Component {
    @property(PreLoad)
    preLoadScript: PreLoad;

    onDestroy() {
        em.remove("loadTheDirResources");
        em.remove("loadTheDir");
    }
    onLoad() {
        em.add("loadTheDirResources", this.loadTheDirResources.bind(this));
        em.add("loadTheDir", this.loadTheDir.bind(this));
        this.preLoadAllResources();
        // this.loadTheDir("anim/enemy/monster");
        director.addPersistRootNode(this.node);
    }
    // 加载所有资源
    preLoadAllResources() {
        resources.loadDir("", (finished: number, total: number, item: AssetManager.RequestItem) => {
            // console.log("finished",finished);
            // console.log("total",total);
            // console.log("item",item);
            
            this.preLoadScript.updateLoadingProgress(finished / total);
        }, (err, assets) => {
            if (err) {
                console.log(err);
                return;
            } else {
                // console.log("assets",assets);
                // this.preLoadScript.enterMainMenuScene();
                this.preLoadScript.showLoginLayer();
            }
        });
    }
    // 加载文件夹 assets 为数组
    loadTheDir(dir, callback = null) {
        resources.loadDir(dir, (err, assets) => {
            if (err) {
                console.log(err);
                return;
            } else {
                // console.log("loadTheDir",assets);
                if (callback) callback(assets);
            }
        });
    }
    //加载具体路径资源 asset为单个资源
    loadTheDirResources(dir, callback = null,errCallback = null) {
        resources.load(dir, (err, assets) => {
            if (err) {
                if(errCallback) errCallback();
                else console.log(err);
                return;
            } else {
                // console.log("loadTheDirResources",assets);
                if (callback) callback(assets);
            }
        })
    }

}

