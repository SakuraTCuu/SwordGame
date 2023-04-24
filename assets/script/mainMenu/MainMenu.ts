/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-05 10:16:04
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-10 20:49:10
 * @FilePath: \to-be-immortal\assets\script\mainMenu\MainMenu.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, SpriteFrame, find, Sprite, Label, Color, Layers, director, sys, JsonAsset, native } from 'cc';
import { JSB } from 'cc/env';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
import { glf } from '../global/globalFun';
const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {

    @property([SpriteFrame])
    selectBtnSF;
    @property([Node])
    btnArr
    @property([SpriteFrame])
    menuBtnSF;
    @property(JsonAsset)
    trainingLvListJson;
    @property(Node)
    versionNotice;
    @property(Node)
    gets;
    @property(Node)
    upgradeEquLvLayer;

    _layerNode = [];

    _SSLNode: Node;
    _HILNode: Node;
    _TLNode: Node;
    _MPNode: Node;
    _SBNode: Node;
    _PHNode: Node;
    _AINode: Node;
    onDestroy() {
        em.remove("switchMainMenuLayer");
    }
    onLoad() {
        em.add("switchMainMenuLayer", this.onSelectBtn.bind(this));

        this._SSLNode = find("Canvas/menuLayer/SelectStageLayer");
        this._HILNode = find("Canvas/menuLayer/HeroInfoLayer");
        this._TLNode = find("Canvas/menuLayer/TrainingLayer");
        this._MPNode = find("Canvas/menuLayer/MakePillsLayer");
        this._SBNode = find("Canvas/menuLayer/SkillBookLayer");
        this._PHNode = find("Canvas/menuLayer/PrizeHallLayer");
        this._AINode = find("Canvas/menuLayer/AddItemsLayer");

        this._layerNode.push(this._SSLNode, this._HILNode, this._TLNode, this._MPNode, this._SBNode, this._PHNode, this._AINode);
        this.onSelectBtn(null, "1");
        director.preloadScene("game");
        // 激活节点 注册事件
        this.versionNotice.active = true;
        this.versionNotice.active = false;
        this.gets.active = true;
        this.gets.active = false;

        // em.dispatch("directPlayAD","GameMonetize");
    }
    start() {
        this.initAccountInfo();
        this.initLvInfo();
        this.initLingshiTotal();
        // let lvData = this.trainingLvListJson.json;
    }
    initAccountInfo() {
        let accountData: any = sys.localStorage.getItem("loginInfo");
        if (accountData) {
            accountData = JSON.parse(accountData);
            find("Canvas/menuLayer/title/heroBaseInfoBg/nickname").getComponent(Label).string = accountData.account;
        } else {
            find("Canvas/menuLayer/title/heroBaseInfoBg/nickname").getComponent(Label).string = "游客";
        }
    }
    initLvInfo() {
        let data = em.dispatch("getTempData", "training");//读取缓存
        if (null === data) {
            find("Canvas/menuLayer/title/heroBaseInfoBg/curLv").getComponent(Label).string = "江湖好手";
        } else {
            let des = this.trainingLvListJson.json[data.curLv].name;
            find("Canvas/menuLayer/title/heroBaseInfoBg/curLv").getComponent(Label).string = des;
        }
    }
    initLingshiTotal() {
        let total = em.dispatch("getItemTotalByIdOrName","灵石");
        find("Canvas/menuLayer/title/lingshiTotalBg/total").getComponent(Label).string = total;
    }



    onSelectBtn(e, p) {
        this.updateBtnSF(parseInt(p) - 1);
        switch (p) {
            case "1":
                if (e !== null) em.dispatch("playOneShot", "common/进入试炼场");
                this.openLayer(this._SSLNode);
                break;
            case "2":
                if (e !== null) em.dispatch("playOneShot", "common/点击人物界面");
                this.openLayer(this._HILNode);
                break;
            case "3":
                if (e !== null) em.dispatch("playOneShot", "common/点击修行界面");
                this.openLayer(this._TLNode);
                break;
            case "4":
                if (e !== null) em.dispatch("playOneShot", "common/点击炼丹界面");
                this.openLayer(this._MPNode);
                break;
            case "5":
                if (e !== null) em.dispatch("playOneShot", "common/点击秘籍界面");
                this.openLayer(this._SBNode);
                break;
            case "6":
                // if (e !== null) em.dispatch("playOneShot", "common/点击秘籍界面");
                this.openLayer(this._PHNode);
                break;
            case "7":
                // if (e !== null) em.dispatch("playOneShot", "common/点击秘籍界面");
                this.openLayer(this._AINode);
                break;

            default:
                throw "p is err,current p is " + p;
        }
    }
    updateBtnSF(index) {
        this.btnArr.forEach((btn, i) => {
            if (i == index) {
                btn.getComponent(Sprite).spriteFrame = this.menuBtnSF[i * 2 + 1];
            } else {
                btn.getComponent(Sprite).spriteFrame = this.menuBtnSF[i * 2];
            }
        });
    }
    openLayer(node: Node) {
        this._layerNode.forEach(layer => {
            if (node == layer) layer.active = true;
            else layer.active = false;
        });
    }
    onBtnAds(e,p) {
        ggd.curAdRewardType = p;
        glf.playAd();
        // native.reflection.callStaticMethod("com/cocos/game/AppActivity", "createAds", "()V");
        // em.dispatch("getItemsRewardByAds");
    }
    // 打开装备升阶界面
    onBtnOpenUpgradeEquLvLayer(){
        this.upgradeEquLvLayer.active = true;
    }
    // 今日签到
    onBtnSignInToday(){
        em.dispatch("usingGameRewardFun","signInToday");
    }
}

