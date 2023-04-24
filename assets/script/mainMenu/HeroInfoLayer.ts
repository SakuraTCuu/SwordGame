/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-05 15:09:09
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-10 21:10:26
 * @FilePath: \to-be-immortal\assets\script\mainMenu\HeroInfoLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Prefab, SpriteFrame, instantiate, Sprite, Label, find, Color, tween, Vec3, NodePool, ProgressBar, Slider, Tween, Animation, RichText, color } from 'cc';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('HeroInfoLayer')
export class HeroInfoLayer extends Component {

    @property([SpriteFrame])
    selectBtnSF;
    @property(Prefab)
    HPPrefab;
    @property(Prefab)
    itemPrefab;
    @property(Node)
    HPPrefabPar;
    @property(Node)
    itemPrefabPar;
    @property(Node)
    maskPar;
    @property(Node)
    guideFinger;
    @property(Node)
    adGetBox;
    @property(Node)
    adGetEqu;
    @property([SpriteFrame])
    itemQBg: SpriteFrame[] = [];

    _curSelectItemData;
    _tipsViewNode: Node;
    _itemPrefabArr: any[] = [];
    _propertyPrefabArr: any[] = [];
    _btnArr = [];
    _HPNode: Node;//英雄属性
    _SSNode: Node;//仓库
    _eqBtnList = {};//装备按钮清单
    _equPrefab: Node;
    _layerNode = [];
    _config = ["percentageBlood", "percentageDamage", "moveSpeed",
        "criticalHitRate", "bonusBulletMoveSpeed", "bonusBulletAttackTimes",
        "recoveryHealthy", "expAddition", "divineStoneAddition"
    ];
    // _config = ["percentageBlood", "percentageDamage", "percentageMoveSpeed", "moveSpeed",
    //     "criticalHitRate", "bonusBulletTotal", "bonusBulletMoveSpeed", "bonusBulletAttackTimes",
    //     "recoveryHealthy", "expAddition", "divineStoneAddition"
    // ];
    _nameConfig = {
        percentageBlood: "血量百分比加成",
        percentageDamage: "伤害百分比加成",
        percentageMoveSpeed: "移速百分比加成",
        moveSpeed: "基础移速",
        criticalHitRate: "暴击率",
        bonusBulletTotal: "法宝额外数量",
        bonusBulletMoveSpeed: "法宝额外飞行速度",
        bonusBulletAttackTimes: "法宝穿透次数",
        recoveryHealthy: "基础生命恢复",
        expAddition: "游戏内经验加成",
        divineStoneAddition: "灵石加成"
    }
    _equProbabilityList = {
        1: [0.9, 0.99, 1],
        2: [0.4, 0.95, 0.99, 1],
        3: [0, 0.5, 0.95, 0.99, 1],
        4: [0, 0.2, 0.6, 0.95, 1],
        5: [0, 0, 0.2, 0.9, 1]
    };
    // _equList = ["巨剑", "长剑", "巨弩", "连弩", "巨斧", "旋转斧"];
    _equList = ["巨剑", "长剑", "巨弩", "连弩", "巨斧", "旋转斧","风火轮","筋斗云","重甲","法袍"];
    //Ratio数组均小于1的 默认只获得一个物品
    _rewardConfig: any;
    onDestroy() {
        em.remove("usingHeroInfoLayerFun");
    }
    onLoad() {
        em.add("usingHeroInfoLayerFun", this.usingHeroInfoLayerFun.bind(this));
        this._btnArr.push(find("selectBtnPar/btn1", this.node));
        this._btnArr.push(find("selectBtnPar/btn2", this.node));

        this._HPNode = find("/heroProperty", this.node);
        this._SSNode = find("/storageSpace", this.node);
        this._layerNode.push(this._HPNode, this._SSNode);

        this._tipsViewNode = find("/heroProperty/tipsViewShow", this.node);

        plm.addPoolToPools("SSLItemPrefab", new NodePool(), this.itemPrefab);

        this.initRewardConfig();
        // this.initEquipment();

    }


    //初始化宝箱 和 功法卷奖励
    initRewardConfig() {
        //初始化宝箱
        this._rewardConfig = {
            "一阶宝箱": ["一阶妖丹", "一阶道法果", "一阶功法残卷", "灵石", "炼气丹", "一阶功法整卷"],
            "一阶宝箱Ratio": [30, 5, 5, 500, 5, 0.5],
            "二阶宝箱": ["二阶妖丹", "二阶道法果", "二阶功法残卷", "灵石", "筑基丹", "二阶功法整卷"],
            "二阶宝箱Ratio": [30, 5, 4, 5000, 5, 0.3],
            "三阶宝箱": ["三阶妖丹", "三阶道法果", "三阶功法残卷", "灵石", "金元丹", "三阶功法整卷"],
            "三阶宝箱Ratio": [30, 5, 3, 50000, 5, 0.1],
            "四阶宝箱": ["四阶妖丹", "四阶道法果", "四阶功法残卷", "灵石", "元婴丹", "四阶功法整卷"],
            "四阶宝箱Ratio": [30, 5, 1, 500000, 5, 0.1],
            "五阶宝箱": ["五阶妖丹", "五阶道法果", "五阶功法残卷", "灵石", "化神丹", "五阶功法整卷"],
            "五阶宝箱Ratio": [30, 5, 1, 5000000, 5, 0.1],
            "一阶功法整卷": [],
            "一阶功法整卷Ratio": [],
            "二阶功法整卷": [],
            "二阶功法整卷Ratio": [],
            "三阶功法整卷": [],
            "三阶功法整卷Ratio": [],
            "四阶功法整卷": [],
            "四阶功法整卷Ratio": [],
            "五阶功法整卷": [],
            "五阶功法整卷Ratio": [],
        };
        // 初始化功法卷奖励 
        let allSD = em.dispatch("usingHeroBasePropertyFun", "getAllAboutSkillBook");
        for (const key in allSD) {
            if (Object.prototype.hasOwnProperty.call(allSD, key)) {
                const data = allSD[key];
                switch (data.lv) {
                    case 1:
                        this._rewardConfig.一阶功法整卷.push(data.name);
                        this._rewardConfig.一阶功法整卷Ratio.push(data.rareRatio);
                        break;
                    case 2:
                        this._rewardConfig.二阶功法整卷.push(data.name);
                        this._rewardConfig.二阶功法整卷Ratio.push(data.rareRatio);
                        break;
                    case 3:
                        this._rewardConfig.三阶功法整卷.push(data.name);
                        this._rewardConfig.三阶功法整卷Ratio.push(data.rareRatio);
                        break;
                    case 4:
                        this._rewardConfig.四阶功法整卷.push(data.name);
                        this._rewardConfig.四阶功法整卷Ratio.push(data.rareRatio);
                        break;
                    case 5:
                        this._rewardConfig.五阶功法整卷.push(data.name);
                        this._rewardConfig.五阶功法整卷Ratio.push(data.rareRatio);
                        break;

                    default:
                        throw "暂未处理：" + data.lv + "阶功法。"
                }
            }
        }
        console.log("_rewardConfig", this._rewardConfig);
    }
    onEnable() {
        let guideData = em.dispatch("getGuideData");
        if (!guideData.HeroInfoLayer) {
            this.startHeroInfoLayerGuide();
        }
        this.onSelectBtn(null, "2");
        // this.onSelectBtn(null, "1");
        find("/itemDetail/ProgressBar", this.node).active = false;
        find("/itemDetail", this.node).active = false;
        this.initHeroCurEqu();
    }
    start() {
        this.isShowAdBtn();
        this.initHeroProperty();
    }
    //HeroInfoLayer 方法
    usingHeroInfoLayerFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    //是否展示广告按钮
    isShowAdBtn() {
        if (ggd.isOpenAd) {
            this.adGetBox.active = true;
        } else this.adGetBox.active = false;
        if (ggd.isOpenAd && !em.dispatch("usingGameRewardFun", "todayEquVideoIsCanShow")) this.adGetEqu.active = true;
        else this.adGetEqu.active = false;
    }
    // 初始化属性
    initHeroProperty() {
        for (let i = 0; i < this._config.length; i++) {
            let str = this._config[i];
            let curLv = em.dispatch("usingHeroBasePropertyFun", "getHeroBasePropertyCurLv", str);
            let prefab = instantiate(this.HPPrefab);
            prefab.parent = this.HPPrefabPar;
            let sprite = prefab.getChildByName("icon").getComponent(Sprite);
            // let loadUrl = "images/icons/icon_" + str + "/spriteFrame";
            let loadUrl = "images/icons/baseProperty/icon_" + str + "/spriteFrame";
            em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
            // prefab.getChildByName("description").getComponent(Label).string = this._nameConfig[str] + ":" + curLv;
            prefab.getChildByName("description").getComponent(Label).string = "Lv:" + curLv + "\n" + this._nameConfig[str];
            prefab.getChildByName("value").getComponent(Label).string = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", str);
            let upgrade = prefab.getChildByName("upgrade");
            glf.createButton(this.node, prefab.getChildByName("icon"), "HeroInfoLayer", "onBtnBaseProperty", str);
            glf.createButton(this.node, upgrade, "HeroInfoLayer", "onBtnUpgrade", str);
            this._propertyPrefabArr.push(prefab);
        }
    }
    onSelectBtn(e, p) {
        if (e !== null) em.dispatch("playOneShot", "common/通用按键");
        this.updateBtnSF(parseInt(p) - 1);

        switch (p) {
            case "1":
                this.onBtn1();
                break;
            case "2":
                this.onBtn2();
                break;

            default:
                throw "p is err,current p is " + p;
        }
    }
    updateBtnSF(index) {
        this._btnArr.forEach((btn, i) => {
            if (i == index) {
                btn.getComponent(Sprite).spriteFrame = this.selectBtnSF[2 * i + 1];
            } else {
                btn.getComponent(Sprite).spriteFrame = this.selectBtnSF[2 * i];
            }
        });
    }
    onBtn1() {
        this.openLayer(this._HPNode);
        let guideData = em.dispatch("getGuideData");
        if (!guideData.HeroInfoLayerProperty) this.startPropertyGuide();
    }
    onBtn2() {
        this.updateStorageSpace();
        this.openLayer(this._SSNode);
        let guideData = em.dispatch("getGuideData");
        if (!guideData.HeroInfoLayerSpace) this.startSpaceGuide();
    }
    openLayer(node: Node) {
        this._layerNode.forEach(layer => {
            if (node == layer) layer.active = true;
            else layer.active = false;
        });
    }
    //动态创建的按钮事件 
    onBtnBaseProperty(e, p) {
        console.log("p", p);
        let description = this.getUpgradeDescription(p);
        this.tipsViewShow(description, 3);
    }
    // 升级基础属性
    onBtnUpgrade(e, p) {
        this.guideFinger.active = false;
        if (!em.dispatch("getGuideData").TrainingLayer) {
            em.dispatch("initMainMenuByGuideData");//当前引导完毕且修炼未引导
        }
        //判断道法果是否足够升级
        let itemName = this.isCanUpgrade(p);
        if (itemName) {
            // console.log("可以升级");
            //更新等级 刷新显示
            em.dispatch("reduceItemFromSS", itemName, 1);
            em.dispatch("usingHeroBasePropertyFun", "upgradeBaseProperty", p);
            let pLv = em.dispatch("usingHeroBasePropertyFun", "getHeroBasePropertyCurLv", p);
            let pValue = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", p);
            let par = e.target.parent;
            par.getChildByName("description").getComponent(Label).string = "Lv:" + pLv + "\n" + this._nameConfig[p];
            let value = par.getChildByName("value");
            value.getComponent(Label).string = pValue;
            value.getComponent(Animation).play();
        }
        // let par = e.target
    }




    // 判断是否能够升级
    isCanUpgrade(pName) {
        let lv = em.dispatch("usingHeroBasePropertyFun", "getHeroBasePropertyCurLv", pName);
        if (lv >= 50) {
            em.dispatch("tipsViewShow", "已到达最大等级 无法升级");
            return false;
        };
        let itemName = "";
        let itemLv = Math.ceil(lv / 10);
        switch (itemLv) {
            case 1:
                itemName = "一阶道法果";
                break;
            case 2:
                itemName = "二阶道法果";
                break;
            case 3:
                itemName = "三阶道法果";
                break;
            case 4:
                itemName = "四阶道法果";
                break;
            case 5:
                itemName = "五阶道法果";
                break;

            default:
                console.warn("itemLv is " + itemLv);
                break;
        }
        let itemTotal = em.dispatch("getItemTotalByIdOrName", itemName);
        if (itemTotal > 0) {
            return itemName;
        } else {
            em.dispatch("tipsViewShow", itemName + "不足,无法升级");
            return false;
        }
    }
    // 获取升级详细信息
    getUpgradeDescription(pName) {
        let lv = em.dispatch("usingHeroBasePropertyFun", "getHeroBasePropertyCurLv", pName);
        let lvDetail = em.dispatch("usingHeroBasePropertyFun", "getHeroBasePropertyLvDetail", pName);
        console.log("lv", lv);
        console.log("lvDetail", lvDetail);
        let description = "";
        lvDetail.forEach((v, i) => {
            let str = (i + 1) + ":" + v + ", ";
            description += str;
        });
        return description;
    }
    //显示信息
    tipsViewShow(string: string = "请传参", time: number = 1) {
        this._tipsViewNode.children[0].getComponent(Label).string = string;
        let animT = .5;
        let t1 = tween().to(animT, { scale: new Vec3(1, 1, 1) }, {
            onUpdate: (target: any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 255), ratio);
            }
        });
        let t2 = tween().to(animT, { scale: new Vec3(1, 1, 1) }, {
            onUpdate: (target: any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let wait = tween().delay(time);
        let t = tween(this._tipsViewNode).sequence(t1, wait, t2);
        t.start();
    }

    // 刷新仓库
    updateStorageSpace() {
        while (this._itemPrefabArr.length > 0) {
            let prefab = this._itemPrefabArr.shift();
            plm.putToPool("SSLItemPrefab", prefab);
        }
        let list = em.dispatch("getItemList");
        for (const key in list) {
            let total = list[key];
            if (key == "灵石" || key == "3") continue;//不显示灵石
            let data = em.dispatch("getItemDataByIdOrName", key);
            let prefab = plm.getFromPool("SSLItemPrefab");
            prefab.parent = this.itemPrefabPar;
            prefab.getChildByName("itemBg").getComponent(Sprite).spriteFrame = this.itemQBg[data.quality - 1];
            this.initPrefabLv(prefab, data);
            let sprite = prefab.getChildByName("sprite").getComponent(Sprite);
            let loadUrl: string = data.loadUrl;
            if (!data.loadUrl) loadUrl = "item_default";
            loadUrl = "images/items/" + loadUrl + "/spriteFrame";
            em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets, () => {
                em.dispatch("loadTheDirResources", "images/items/item_default/spriteFrame", (assets) => sprite.spriteFrame = assets);
            });
            // prefab.getChildByName("total").getComponent(Label).string = "X" + total;
            prefab.getChildByName("total").getComponent(Label).string = total;
            // prefab.getChildByName("name").getComponent(Label).string = data.name;
            prefab.itemName = data.name;//用于索引
            this._itemPrefabArr.push(prefab);
            //创建按钮事件
            glf.createButton(this.node, prefab.getChildByName("itemBg"), "HeroInfoLayer", "onBtnItem", key);
        }
    }
    // 初始化物品等级
    initPrefabLv(prefab, data) {
        let label = prefab.getChildByName("lv").getComponent(Label);
        if (data.type == "装备" && data.lv) {
            console.log("初始化阶");
            let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
            label.string = list[data.lv];
        } else label.string = "";
    }
    //点击按钮 
    /**
     * @description:通过物品类型 判断按钮回调
     *              材料 卖出 获取
     *              功法 跳转 功法界面
     *              丹药 跳转 修行界面
     *              道法果 属性学习界面 
     *              消耗品 仓库界面直接使用 
     *              others 只显示描述         
     * @param {*} e
     * @param {*} p
     */
    onBtnItem(e, p) {
        console.log("onBtnItem", p);
        this.guideFinger.active = false;
        let data = em.dispatch("getItemDataByIdOrName", p);
        this._curSelectItemData = data;
        switch (data.type) {
            case "材料":
                this.showItemDetail([0]);
                break;
            case "消耗品":
                //新手引导，未引导时只出现使用
                if (data.type2 == "道法果" && em.dispatch("getGuideData").HeroInfoLayerProperty) this.showItemDetail([0, 1]);
                else this.showItemDetail([0, 1]);
                break;
            case "others":
                console.log("others 还没写");
                break;
            case "可合成材料":
                this.showItemDetail([0, 2]);
                break;
            case "装备":
                this.showItemDetail([0, 1]);
                break;
            default:
                console.warn("未处理的类型：" + data.type);
                break;
        }
    }
    // 查看装备信息
    viewEquDetail(e){
        let node = e.target;
        this._curSelectItemData = node.data;
        this.showItemDetail();
    }
    /**
     * @description: 展示物品细节
     * @param {number} showBtnArr 需要显示的按钮的索引  0:卖出；1:使用 2:合成 
     */
    showItemDetail(showBtnArr: number[]=[]) {
        console.log("showItemDetail", this._curSelectItemData);
        let colorStr = this.getColorStrByQuality(this._curSelectItemData.quality - 1);
        this.maskPar.getChildByName("name").getComponent(RichText).string = colorStr + this._curSelectItemData.name + "</color>";
        this.maskPar.getChildByName("description").getComponent(RichText).string = this._curSelectItemData.description;
        if (this._curSelectItemData.type == "装备") this.showEquDetail();
        let btnPar = this.maskPar.getChildByName("btnPar");
        btnPar.children.forEach((child, index) => {
            if (showBtnArr.indexOf(index) > -1) child.active = true;
            else child.active = false;
        });
        this.maskPar.active = true;
    }
    showEquDetail() {
        console.log("展示装备详情");
        let data = em.dispatch("usingHeroBasePropertyFun", "getEquDataByName", this._curSelectItemData.name);
        let effects = data.qData.effect;
        //根据quality 设置颜色 还没写
        let string = "";
        for (const id of effects) {
            let effect = em.dispatch("usingHeroBasePropertyFun", "getEquEffectData", id);
            console.log("effect", effect);
            // let colorStr = this.getColorStrByQuality(effect.quality - 1);
            let colorStr = this.getColorStrByType(effect.type - 1);
            string = string + colorStr + effect.name + ":" + effect.description + "</color>\n";
        }
        if (data.lData.baseDamage) string = string + "基础伤害:+" + data.lData.baseDamage + "\n";
        if (data.lData.damageTimes) string = string + "伤害加成倍数:+" + data.lData.damageTimes + "\n";
        if (data.lData.attackInterval) string = string + "攻击间隔:" + data.lData.attackInterval + "\n";
        if (data.lData.blood) string = string + "血量:+" + data.lData.blood + "\n";
        if (data.lData.CHR) string = string + "暴击率:+" + data.lData.CHR + "\n";
        if (data.lData.moveSpeed) string = string + "移动速度:+" + data.lData.moveSpeed + "\n";
        console.log("showEquDetail", string);
        this.maskPar.getChildByName("description").getComponent(RichText).string = string;
        // console.log("showEquDetail",string);
    } 
    // 通过物品品质 获得 物品颜色值
    getColorStrByType(index) {
        index > 2 ? 2 : index;
        return ["<color=#757575>", "<color=#A474CF>", "<color=#DDA75A>"][index];
    }
    getColorStrByQuality(index) {
        index > 4 ? 4 : index;
        return ["<color=#599A65>", "<color=#728CC7>", "<color=#A474CF>", "<color=#C65C37>", "<color=#DDA75A>"][index];
        // return ["<color=#7EFFA7>","<color=#7EEAFF>","<color=#837EFF>","<color=#FFB77E>","<color=#FFE000>"][index];
    }
    onBtnSell() {
        this.showProgressBar();
        this.showItemDetail([3, 4]);
    }
    // 确定卖出
    onBtnConfirmSell() {
        console.log("确定卖出");
        let progress = find("/itemDetail/ProgressBar", this.node).getComponent(ProgressBar).progress;
        let data = this._curSelectItemData;
        let total = em.dispatch("getItemTotalByIdOrName", data.name);
        total = Math.floor(total * progress);
        let totalPrice = data.price * total;
        // console.log("卖出物品总数：" + total);
        // console.log("卖出物品总价格：" + totalPrice);
        em.dispatch("reduceItemFromSS", data.name, total);//卖出物品
        em.dispatch("addItemToSS", "灵石", totalPrice);//获得灵石
        this.updateStorageSpace();
        this.maskPar.active = false;
        find("Canvas/menuLayer/title/lingshiTotalBg/total").getComponent(Label).string = em.dispatch("getItemTotalByIdOrName", "灵石");
        this.closeProgressBar();
    }
    // 取消卖出
    onBtnCancelSell() {
        // this.closeProgressBar();
        this.closeItemDetail();
    }
    //展示进度条
    showProgressBar() {
        let pb = find("/itemDetail/ProgressBar", this.node);
        pb.getComponent(ProgressBar).progress = 0;
        pb.getComponent(Slider).progress = 0;
        let total = em.dispatch("getItemTotalByIdOrName", this._curSelectItemData.name);
        pb.getChildByName("Label").getComponent(Label).string = "数量：" + 0 + "/" + total + "\n" + "价格：0";
        pb.active = true;
    }
    //关闭进度条
    closeProgressBar() {
        find("/itemDetail/ProgressBar", this.node).active = false;
    }
    // 滑动滑动器  进图条跟随滑动器刷新
    slideProgressBar(slider: Slider) {
        let pb = find("/itemDetail/ProgressBar", this.node);
        let progress = slider.progress;
        pb.getComponent(ProgressBar).progress = progress;
        let total = em.dispatch("getItemTotalByIdOrName", this._curSelectItemData.name);
        let sellTotal = Math.floor(total * progress);
        let totalPrice = sellTotal * this._curSelectItemData.price;
        pb.getChildByName("Label").getComponent(Label).string = "数量：" + sellTotal + "/" + total + "\n" + "价格：" + totalPrice;
    }
    //使用物品
    onBtnUsing() {

        if (this._curSelectItemData.type == "装备") {
            this.closeItemDetail();
            this.switchEqu();
            return;
        }
        switch (this._curSelectItemData.type2) {
            case "道法果":
                this.closeItemDetail();
                this.onSelectBtn(null, "1");
                break;;
            case "丹药":
                this.closeItemDetail();
                em.dispatch("switchMainMenuLayer", null, "3");
                break;;
            case "功法":
                this.closeItemDetail();
                em.dispatch("switchMainMenuLayer", null, "5");
                break;
            case "宝箱":
                this.openTreasureChest();
                break;
            case "装备箱":
                this.openEquBox();
                break;
            default:
                console.warn("未处理的类型" + this._curSelectItemData.type2);
                break;
        }

    }
    // 打开装备箱
    openEquBox() {
        em.dispatch("reduceItemFromSS", this._curSelectItemData.name, 1);
        this.maskPar.active = false;
        let gets = this.getEquByBoxType();
        em.dispatch("showGets", gets);
        for (const key in gets) {
            if (Object.prototype.hasOwnProperty.call(gets, key)) {
                // console.log("key", key);
                em.dispatch("addItemToSS", key, gets[key]);
            }
        };
        this.updateStorageSpace();
    }
    // 通过装备箱类型 获得装备
    getEquByBoxType() {
        let gets = {};
        let probabilityArray = this._equProbabilityList[this._curSelectItemData.quality];
        if (!probabilityArray) throw "probabilityArray is error";
        let qList = ["破旧", "实用", "稀有", "传说", "史诗"];
        let random = Math.random();
        let quality: string;
        for (let i = 0; i < probabilityArray.length; i++) {
            let probability = probabilityArray[i];
            if (probability > random) {
                quality = qList[i];
                break;
            }
        };
        if (!quality) throw "quality is error.";
        let weaponName = this._equList[Math.random() * this._equList.length | 0];
        let equ = quality + weaponName + "（一阶）";
        gets[equ] = 1;
        console.log("equ", equ);
        return gets;
    }
    // 打开宝箱
    openTreasureChest() {
        em.dispatch("reduceItemFromSS", this._curSelectItemData.name, 1);
        this.maskPar.active = false;
        let itemName = this._curSelectItemData.name;
        let rewardArr = this._rewardConfig[itemName];
        let ratioArr = this._rewardConfig[itemName + "Ratio"];
        // console.log("rewardArr", rewardArr);
        // console.log("ratioArr", ratioArr);
        let isSingle = ratioArr.every((ratio) => {
            return ratio <= 1;
        });
        let gets = {};
        if (isSingle) {
            let random = Math.random();
            let index: number;
            for (let i = 0; i < ratioArr.length; i++) {
                let ratio = ratioArr[i];
                if (ratio >= random) {
                    index = i;
                    break;
                };
            }
            gets[rewardArr[index]] = 1;
        } else {
            for (let i = 0; i < rewardArr.length; i++) {
                let reward = rewardArr[i];
                let ratio = ratioArr[i];
                if (ratio > 1) {//概率大于1  说明可能不止一个物品
                    let total = Math.random() * ratio | 0;
                    if (total > 0) gets[reward] = total;
                } else {//概率小于1 只有这个物品 且不一定获得
                    if (Math.random() < ratio) gets[reward] = 1;
                };
            };
        }
        console.log("gets", gets);
        em.dispatch("showGets", gets);
        //将获得的物品gets 添加到仓库
        for (const key in gets) {
            if (Object.prototype.hasOwnProperty.call(gets, key)) {
                console.log("key", key);
                em.dispatch("addItemToSS", key, gets[key]);
            }
        }
        this.updateStorageSpace();
        let total = em.dispatch("getItemTotalByIdOrName", "灵石");
        find("Canvas/menuLayer/title/lingshiTotalBg/total").getComponent(Label).string = total;
    }

    //合成
    onBtnMerge() {
        this.maskPar.active = false;
        let data = this._curSelectItemData;
        let curTotal = em.dispatch("getItemTotalByIdOrName", data.name);
        if (curTotal < data.mergeDemandTotal) {
            em.dispatch("tipsViewShow", data.name + "数量不足，无法合成");
        } else {
            let getTotal = Math.floor(curTotal / data.mergeDemandTotal);
            let consumeTotal = getTotal * data.mergeDemandTotal;
            em.dispatch("reduceItemFromSS", data.name, consumeTotal);
            em.dispatch("addItemToSS", data.mergeTarget, getTotal);
            let gets = {};
            gets[data.mergeTarget] = getTotal;
            em.dispatch("showGets", gets);
            this.updateStorageSpace();
        }
    }


    //关闭物品详情
    closeItemDetail() {
        this.closeProgressBar();
        this.maskPar.active = false;
    }

    //=====================装备栏=======================
    initHeroCurEqu() {
        let list = em.dispatch("usingHeroBasePropertyFun", "getAllEquData");
        // console.log("list", list);
        for (const key in list) {
            const equName = list[key];
            if (equName) {
                let data = em.dispatch("getItemDataByIdOrName", equName);
                // console.log("key", key);
                // console.log("data", data);
                this.takeEqu(key, data);
            }
        }
    }
    // 切换装备
    switchEqu() {
        let data = this._curSelectItemData;
        let type: string = data.type2;
        // 卸下装备
        let curEquName = em.dispatch("usingHeroBasePropertyFun", "getEquNameByType", type);
        if (curEquName) em.dispatch("addItemToSS", curEquName, 1);//装备存在 则卸下装备
        // 穿上装备
        this.takeEqu(type, data);

        em.dispatch("usingHeroBasePropertyFun", "switchEqu", type, data.name);
        em.dispatch("reduceItemFromSS", data.name, 1);//装备新装备 从仓库删除物品
        this.updateStorageSpace();// 刷新仓库
    }
    // 穿上装备
    takeEqu(type, data) {
        let loadUrl = data.loadUrl;
        if (!loadUrl) loadUrl = "item_default";
        loadUrl = "images/items/" + loadUrl + "/spriteFrame";
        find("heroInfoBg/" + type, this.node).getComponent(Sprite).spriteFrame = this.itemQBg[data.quality - 1];
        let sprite:any = find("heroInfoBg/" + type + "/sprite", this.node).getComponent(Sprite);
        sprite.node.data = data;
        glf.createButton(this.node,sprite.node,"HeroInfoLayer","viewEquDetail");
        em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
        let label = find("heroInfoBg/" + type + "/label", this.node).getComponent(Label);
        console.log("data.lv", data.lv);
        if (data.lv) {
            let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
            label.string = list[data.lv];
        } else label.string = "";
    }

    // 开始新手引导 设置角色引导完成
    startHeroInfoLayerGuide() {
        em.dispatch("setGuideData", "HeroInfoLayer", true);
        find("Canvas/menuLayer/guideFinger").active = false;
    }
    //开始仓库新手引导
    startSpaceGuide() {
        // 赠送物品道法果
        em.dispatch("addItemToSS", "一阶道法果", 1);
        let tips = "获得物品一阶道法果x1";
        em.dispatch("tipsViewShow", tips);
        this.updateStorageSpace();
        let item = null;
        console.log("this._itemPrefabArr", this._itemPrefabArr);
        for (const prefab of this._itemPrefabArr) {
            if (prefab.itemName == "一阶道法果") {
                item = prefab;
                break;
            }
        }
        if (item) {
            let guide = this.guideFinger;
            guide.active = true;
            guide.parent = item;
            guide.setPosition(0, 150, 0);
            let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
            let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
            let action = tween(guide).sequence(a1, a2);
            action = tween(guide).repeatForever(action);
            action.tag(2);
            action.start();
        }
        em.dispatch("setGuideData", "HeroInfoLayerSpace", true);
        // em.dispatch("initMainMenuByGuideData");
    }
    //开始属性引导
    startPropertyGuide() {
        Tween.stopAllByTag(2);
        em.dispatch("openGuideTips", "点击属性末端的按钮+，可以提升相应的属性。一阶道法果可以提升1到10级的基础属性。当等级到达一定程度后必须使用更高阶的道法果提升属性。");
        let firstProperty = this._propertyPrefabArr[1];
        let guide = this.guideFinger;
        guide.active = true;
        guide.parent = firstProperty.getChildByName("upgrade");
        guide.setPosition(0, 200, 0);
        let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
        let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
        let action = tween(guide).sequence(a1, a2);
        action = tween(guide).repeatForever(action);
        action.tag(2);
        action.start();
        em.dispatch("setGuideData", "HeroInfoLayerProperty", true);
    }
}



