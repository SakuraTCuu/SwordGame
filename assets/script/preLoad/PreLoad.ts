import { _decorator, Component, director, Sprite, Label, Game, game, find, sys, Settings, profiler, EditBox, Node, Asset, AnimationClip, AssetManager, JsonAsset, Prefab, SpriteFrame } from 'cc';

import IView from '../Interfaces/IView';
import { Constant } from '../Common/Constant';

const { ccclass, property } = _decorator;

@ccclass('PreLoad')
export class PreLoad extends IView {

    @property({
        type: Label,
        displayName: "进度条背景图"
    })
    fillSprite: Sprite = null;

    @property({
        type: Label,
        displayName: "进度"
    })
    progressLabel = null;

    @property({
        type: Label,
        displayName: "版本号"
    })
    versionCode: Label = null;

    @property({
        type: Node,
        displayName: "游戏名Label"
    })
    gameName: Node = null;

    @property({
        type: Node,
        displayName: "进度条节点"
    })
    progressNode: Node = null;

    @property({
        type: Label,
        displayName: "进度条文本描述"
    })
    descLabel: Label = null;

    _resList = Constant.Res.ResourcesList;

    protected onRegister?(...r: any[]): void {

        this.gameName.active = true;
        this.progressNode.active = true;
        this.versionCode.string = Constant.GlobalGameData.versionCode;

        app.scene.preloadScene("mainMenu");
        // director.preloadScene("mainMenu");
    }

    protected onUnRegister?(...r: any[]): void {
        this.dispatch(Constant.EventId.hideBanner);
    }

    onTick(delta: number): void { }

    protected start(): void {
        this.loadRes();
        app.audio.playBGM(Constant.Audio.HOME_BGM);
    }

    async loadRes() {
        for (let i = 0; i < this._resList.length; i++) {
            let resItem = this._resList[i];

            console.log(`开始加载: ${resItem.path}`);

            this.descLabel.string = `正在加载${resItem.desc}...`;

            await app.loader.loadDirAsync(
                Constant.Res.ResBundleName,
                resItem.path,
                resItem.type,
                this.updateLoadingProgress.bind(this)
            );
            console.log(`${resItem.path} 加载完成`);
        }

        console.log("所有资源加载完成");

        this.gameName.active = false;
        this.progressNode.active = false;

        //打开登录界面
        this.dispatch(Constant.EventId.loadingComplete);
    }

    /**
     * 加载进度
     */
    updateLoadingProgress(finished: number, total: number, item: AssetManager.RequestItem | any) {
        let fillRange = finished / total;
        // if (fillRange <= this.fillSprite.fillRange) return;
        this.fillSprite.fillRange = fillRange;
        this.progressLabel.string = (fillRange * 100).toFixed(2) + "%";
    }
}

