
/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-05 11:37:53
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-11 21:09:53
 * @FilePath: \to-be-immortal\assets\script\mainMenu\SelectStageLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Prefab, instantiate, Label, find, director, input, Input, JsonAsset, UITransform, utils, UI, Sprite, Material, ScrollView } from 'cc';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
import { glf } from '../global/globalFun';
const { ccclass, property } = _decorator;

@ccclass('SelectStageLayer')
export class SelectCheckpointLayer extends Component {
    @property(Prefab)
    SCPrefab;
    @property(Node)
    prefabPar;
    @property(JsonAsset)
    stageConfigJson;
    @property(JsonAsset)
    stageDesJson;
    @property(JsonAsset)
    stageStrongJson;
    @property(Material)
    grayMaterial;
    @property(Material)
    defaultMaterial;
    @property(Node)
    stageDetail;

    _isLoading = false;
    _mapName = {
        "1": "青青草原",
        "2": "暗黑大陆",
        "3": "晨星荒漠",
        "4": "绝命谷",
        "5": "寂静岭",
        "6": "灼烧大陆",
        "7": "无声荒漠",
        "8": "虚无之地",
        "9": "极寒之地",
        "10": "魔幻大陆"
    }
    _prefabArr = [];
    _initPos = {
        y: -300,
        gap: -400,
        changePos: 1000,
        changeRank: 5
    }
    _stageTotal = 0;
    onLoad() {
        this._stageTotal = this.getStageTotal();
        this.initPrefabs();
    }
    onEnable() {
        // this.updatePrefabs();
        //刷新材质
        this.scheduleOnce(() => {
            for (const prefab of this._prefabArr) {
                if (prefab.stageNum > ggd.stageProgress) {
                    prefab.getComponent(Sprite).material = this.grayMaterial;
                } else {
                    prefab.getComponent(Sprite).material = this.defaultMaterial;
                }
            }
        }, 0);
        let percentage = (ggd.stageProgress - 1) / ggd.totalStage;
        this.node.getChildByName("bg").getComponent(ScrollView).scrollToPercentVertical(1 - percentage, 0.1);
    }
    //获取关卡总数
    getStageTotal() {
        let all = this.stageConfigJson.json;
        let len = 0;
        for (const key in all) {
            if (Object.prototype.hasOwnProperty.call(all, key)) {
                len++;
            }
        } 
        return len;
        // return 60;
    }
    initPrefabs() {
        let total = 5;
        for (let i = 0; i < total; i++) {
            let prefab = instantiate(this.SCPrefab);
            prefab.parent = this.prefabPar;
            prefab.setPosition(0, this._initPos.y + i * this._initPos.gap);
            let stageNum = i + 1;
            prefab.stageNum = stageNum;

            if (prefab.stageNum > ggd.stageProgress) {
                prefab.getChildByName("btnBg").getChildByName("stageLock").active = true;
                prefab.getComponent(Sprite).material = this.grayMaterial;
            } else {
                prefab.getChildByName("btnBg").getChildByName("stageLock").active = false;
                prefab.getComponent(Sprite).material = this.defaultMaterial;
            }
            prefab.getChildByName("Label").getComponent(Label).string = "第" + stageNum + "关";
            let btNode = prefab.getChildByName("btnBg");
            glf.createButton(this.node, btNode, "SelectStageLayer", "onBtnEnter");
            this._prefabArr.push(prefab);
            // this.showStageDetail(stageNum);
            let detail = prefab.getChildByName("detail");
            glf.createButton(this.node, detail, "SelectStageLayer", "showStageDetail");
        };
        let UIT = this.prefabPar.getComponent(UITransform);
        let toBottom = 200;
        UIT.setContentSize(UIT.width, this._stageTotal * Math.abs(this._initPos.gap) + toBottom);
        // UIT.setContentSize(UIT.width, this._stageTotal * Math.abs(this._initPos.gap));
        // this.prefabPar.height = this._stageTotal * Math.abs(this._initPos.gap);
    }
    /**
     * @description 展示关卡详情
     * @param {Node} prefab 通过prefab.stageNum 属性 获取相应关卡详情
    */
    showStageDetail(e) {
        let prefab = e.target.parent;
        this.stageDetail.active = true;
        let stageNum = prefab.stageNum;
        let des: string = "";
        if (stageNum > ggd.stageProgress) des = "尚未可知。"
        else des = this.getStageDesByStageNum(stageNum);
        find("bg/title", this.stageDetail).getComponent(Label).string = "第" + stageNum + "关";
        find("bg/content", this.stageDetail).getComponent(Label).string = des;
    }
    getStageDesByStageNum(stageNum) {
        let des = "";
        let stageData = this.stageConfigJson.json["stage" + stageNum];
        des = "游戏时长：" + stageData[stageData.length - 1].time / 60 + "分钟";
        des += "\n";
        if (stageNum <= 5) des += "建议等级：炼气期\n通关奖励：一阶物品";
        else if (stageNum <= 10) des += "建议等级：筑基期\n通关奖励：二阶物品";
        else if (stageNum <= 20) des += "建议等级：结丹期\n通关奖励：三阶物品";
        else if (stageNum <= 40) des += "建议等级：元婴期\n通关奖励：四阶物品";
        else des += "通关奖励：五阶物品\n建议等级：化神期";
        if (this.stageDesJson.json["stage" + stageNum]) des = des + "\n关卡描述：" + this.stageDesJson.json["stage" + stageNum];
        let strongList = this.stageStrongJson.json["stage" + stageNum];
        if(strongList&&(strongList.blood||strongList.damage||strongList.moveSpeed)){
            des = des + "\n怪物属性强化：";
            if(strongList.blood) des = des + "\n血量增加"+strongList.blood*100 + "%";
            if(strongList.damage) des = des + "\n伤害增加"+strongList.damage*100 + "%";
            if(strongList.moveSpeed) des = des + "\n移速增加"+strongList.moveSpeed*100 + "%";
        } 
        return des;
    }
    // getStageDesByStageNum(stageNum) {
    //     let des = "";
    //     let stageData = this.stageConfigJson.json["stage" + stageNum];
    //     des = "游戏时长：" + stageData[stageData.length - 1].time / 60 + "分钟";
    //     des += "\n";
    //     if (stageNum <= 5) des += "通关奖励：一阶物品\n建议等级：炼气期";
    //     else if (stageNum <= 10) des += "通关奖励：二阶物品\n建议等级：筑基期";
    //     else if (stageNum <= 20) des += "通关奖励：三阶物品\n建议等级：结丹期";
    //     else if (stageNum <= 40) des += "通关奖励：四阶物品\n建议等级：元婴期";
    //     else des += "通关奖励：五阶物品\n建议等级：化神期";
    //     des = des + "\n关卡描述：" + this.stageDesJson.json["stage" + stageNum];;
    //     return des;
    // }
    onBtnCloseDetail() {
        this.stageDetail.active = false;
    }
    onBtnCheckpoint(e) {
        let prefab = e.target.parent;
        console.log("onBtnCheckpoint", prefab.stageNum);
        this.onBtnEnter(e,);
    }
    //循环使用预制件
    update(dt) {
        this.updatePrefabs();
    }
    updatePrefabs() {
        let wp = this.prefabPar.parent.getWorldPosition();
        for (let i = 0; i < this._prefabArr.length; i++) {
            let prefab = this._prefabArr[i];
            let pwp = prefab.getWorldPosition();
            if (pwp.y - wp.y > this._initPos.changePos && prefab.stageNum + this._initPos.changeRank <= this._stageTotal) {//下移
                let offset = this._initPos.changeRank * this._initPos.gap;
                prefab.setWorldPosition(pwp.x, pwp.y + offset, pwp.z);
                prefab.stageNum += this._initPos.changeRank;
                prefab.getChildByName("Label").getComponent(Label).string = "第" + prefab.stageNum + "关";
            } else if (pwp.y - wp.y < -this._initPos.changePos && prefab.stageNum - this._initPos.changeRank >= 1) {//上移
                let offset = this._initPos.changeRank * this._initPos.gap;
                prefab.setWorldPosition(pwp.x, pwp.y - offset, pwp.z);
                prefab.stageNum -= this._initPos.changeRank;
                prefab.getChildByName("Label").getComponent(Label).string = "第" + prefab.stageNum + "关";
            }
            //刷新材质
            if (prefab.stageNum > ggd.stageProgress) {
                prefab.getChildByName("btnBg").getChildByName("stageLock").active = true;
                prefab.getComponent(Sprite).material = this.grayMaterial;
            } else {
                prefab.getChildByName("btnBg").getChildByName("stageLock").active = false;
                prefab.getComponent(Sprite).material = this.defaultMaterial;
            }
        }
    }

    //点击进入关卡
    onBtnEnter(e) {
        let p = e.target.parent.stageNum;
        if (this._isLoading) return;
        this._isLoading = true;
        console.log("进入关卡" + p);
        if (p <= ggd.totalStage) {
            this.openLoading();
            ggd.curStage = parseInt(p);
            // director.loadScene("game");
            console.log("切换音效");

            director.loadScene("game", () => {
                // em.dispatch("switchMainBgm","/audio/music/风声");
                em.dispatch("switchMainBgm", "/audio/music/不谓侠");
            });
        }
        else {
            console.warn("current stage is  undefined");
            this._isLoading = false;
        }
    }
    openLoading() {
        find("Canvas/loading").active = true;
    }
    // 解锁下一关
    onBtnChangeStage() {
        ggd.stageProgress++;
        em.dispatch("savingGlobalDataToTempData");
    }
}

