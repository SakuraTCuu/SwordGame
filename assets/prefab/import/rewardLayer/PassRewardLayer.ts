/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-26 15:22:55
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-28 13:17:50
 * @FilePath: \to-be-immortal\assets\prefab\import\rewardLayer\PassRewardLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Sprite, find, SpriteFrame, instantiate, Label, director } from 'cc';
import { em } from '../../../script/global/EventManager';
import { ggd } from '../../../script/global/globalData';
const { ccclass, property } = _decorator;

@ccclass('PassRewardLayer')
export class PassRewardLayer extends Component {
    @property(Label)
    descriptionLabel;
    @property(Label)
    killCountLabel;
    @property(Label)
    curStageLabel;
    @property(Node)
    doubleTips;


    _prefab: Node = null;
    _rContent: Node = null;
    _killLeaderRewardConfig;
    _isPass: boolean = false;
    _notNoticeKillReward: boolean = false;//不在提示击杀击杀精英怪奖励
    onLoad() {
        em.add("openRewardLayer", this.openLayer.bind(this));
        em.add("showKillLeaderReward", this.showKillLeaderReward.bind(this));
        em.add("showPassReward", this.showPassReward.bind(this));
        this.initNode();
        this.initLeaderRewardConfig();
    }
    onDestroy() {
        em.remove("openRewardLayer");
        em.remove("showKillLeaderReward");
        em.remove("showPassReward");
    }
    initNode() {
        this._prefab = find("prefab", this.node);
        this._rContent = find("bg/ScrollView/view/content", this.node);
    }

    initLeaderRewardConfig() {
        this._killLeaderRewardConfig = {
            0: "strengthBlood1",
            1: "strengthBlood2",
            2: "strengthBlood3",
            3: "strengthBlood4",
            4: "strengthBlood5",
            5: "strengthDamage1",
            6: "strengthDamage2",
            7: "strengthDamage3",
            8: "strengthDamage4",
            9: "strengthDamage5",
            10: "strengthMoveSpeed1",
            11: "strengthMoveSpeed2",
            12: "strengthMoveSpeed3",
            13: "strengthMoveSpeed4",
            14: "strengthMoveSpeed5",
        }
    }
    onDisable() {
        ggd.stopAll = find("passRewardLayer", this.node.parent).active;
        // ggd.stopAll = false;

    }
    showKillLeaderReward(strengthType) {
        let index = Math.random() * 5 | 0;
        let result = em.dispatch("usingHeroControlFun", "updateBonusValue", strengthType, index + 1);
        em.dispatch("createTipsTex", result);
    }

    showPassReward(all, string,isDouble=false) {
        // console.log("showPassReward",all);
        all.forEach(data => {
            console.log(data);
            if (data.total > 0) {
                let prefab = instantiate(this._prefab);
                let itemData = em.dispatch("getItemDataByIdOrName", data.id);
                prefab.parent = this._rContent;
                prefab.getChildByName("name").getComponent(Label).string = itemData.name + "x" + data.total;
                let sprite = prefab.getChildByName("sprite").getComponent(Sprite);
                let loadUrl = "images/items/" + itemData.loadUrl + "/spriteFrame";
                em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
                prefab.active = true;
            }
        });
        this.descriptionLabel.string = string;
        this.killCountLabel.string = em.dispatch("geCurStageKillInfo");
        this.curStageLabel.string = "第" + ggd.curStage + "关";
        if(isDouble) this.doubleTips.active = true;
        else this.doubleTips.active = false;
        ggd.stopAll = true;
        this.node.active = true;
        this._isPass = true;
    }
    closeLayer() {
        if (this._isPass) {
            // 跳出加载
            this.node.getChildByName("loading").active = true;
            this.enterMainMenu();
        }
        else {
            this.node.active = false;
            find("Toggle", this.node).active = false;
            em.dispatch("usingMonsterManagerFun", "resumeAllAnim");
            em.dispatch("usingHeroControlFun", "resumeGame");
        }

    }
    enterMainMenu() {
        let total = em.dispatch("getMonsterTotal");
        if (total <= 0) {
            console.log("跳转到菜单界面");
            director.loadScene("mainMenu", () => {
                em.dispatch("switchMainBgm", "/audio/music/刀剑如梦");
            });
        } else this.scheduleOnce(() => {
            this.enterMainMenu();
        }, 0.1);
    }
    openLayer() {
        this.node.active = true;
    }
    //不在提示
    onBtnNotNotice() {
        this._notNoticeKillReward = !this._notNoticeKillReward;
    }
}

