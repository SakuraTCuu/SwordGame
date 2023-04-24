/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-08 17:30:34
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-12 21:27:02
 * @FilePath: \to-be-immortal\assets\script\mainMenu\MakePillsLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Prefab, find, SpriteFrame, instantiate, Sprite, Label, Color, NodePool, Material, tween, Vec3 } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('MakePillsLayer')
export class MakePillsLayer extends Component {
    @property(Prefab)
    pillPrefab;
    @property(Prefab)
    itemPrefab;
    @property([SpriteFrame])
    pillSF;
    @property(Node)
    itemPar;
    @property(Material)
    grayMaterial;
    @property(Material)
    defaultMaterial;
    @property(Node)
    guideFinger;
    @property(Prefab)
    tipsPrefab;

    _curPillData;
    _pillPar: Node;
    _pillPrefabArr: any[] = [];
    _itemPrefabArr: Node[] = [];//下方丹药数量显示
    _pillListConfig = [
        {
            "id": 4,
            "name": "炼气丹",
            "imageIndex": 0,
            "description": "提升修为，通过妖丹炼制",
            "consumeTotal": 10,
            "consumeItemName": "一阶妖丹",
            "consumeLingshi": 50,
        },
        {
            "id": 5,
            "name": "筑基丹",
            "imageIndex": 1,
            "description": "提升修为，通过妖丹炼制",
            "consumeTotal": 10,
            "consumeItemName": "二阶妖丹",
            "consumeLingshi": 500,
        },
        {
            "id": 6,
            "name": "金元丹",
            "imageIndex": 2,
            "description": "提升修为，通过妖丹炼制",
            "consumeTotal": 10,
            "consumeItemName": "三阶妖丹",
            "consumeLingshi": 5000,
        },
        {
            "id": 7,
            "name": "元婴丹",
            "imageIndex": 3,
            "description": "提升修为，通过妖丹炼制",
            "consumeTotal": 10,
            "consumeItemName": "四阶妖丹",
            "consumeLingshi": 50000,
        },
        {
            "id": 8,
            "name": "化神丹",
            "imageIndex": 4,
            "description": "提升修为，通过妖丹炼制",
            "consumeTotal": 10,
            "consumeItemName": "五阶妖丹",
            "consumeLingshi": 500000,
        },
    ];
    onLoad() {
        this._pillPar = find("/selectPill/sliding/content", this.node);
        // plm.addPoolToPools("MPLPillPrefab",new NodePool(),this.pillPrefab);//不需要回收 无需生成对象池
        plm.addPoolToPools("MPLItemPrefab", new NodePool(), this.itemPrefab);
        this.initPillList();
        this._curPillData = this._pillListConfig[0];
        this.updatePillState(this._pillPrefabArr[0]);
        // this.updateMaterialDemand();

        let tipsTexPool = new NodePool();
        plm.addPoolToPools("tipsTex", tipsTexPool, this.tipsPrefab);
        this.initStoveBtn();
    }
    // 初始化炼丹列表
    initPillList() {
        this._pillListConfig.forEach((data, index) => {
            let pill = instantiate(this.pillPrefab);
            // let pill = plm.getFromPool("MPLPillPrefab");
            pill.parent = this._pillPar;
            pill.getChildByName("sprite").getComponent(Sprite).spriteFrame = this.pillSF[data.imageIndex];
            pill.getChildByName("name").getComponent(Label).string = data.name;
            let total = em.dispatch("getItemTotalByIdOrName", data.name);
            pill.getChildByName("total").getComponent(Label).string = total;
            pill.data = data;//可以直接通过节点获取
            glf.createButton(this.node, pill, "MakePillsLayer", "onBtnPill");
            this._pillPrefabArr.push(pill);
        });
    }
    // 刷新炼丹列表丹药数量
    updatePillList() {
        for (const pill of this._pillPrefabArr) {
            let data = pill.data;
            let total = em.dispatch("getItemTotalByIdOrName", data.name);
            pill.getChildByName("total").getComponent(Label).string = total;
        }
    }
    // 初始化丹炉按钮
    initStoveBtn() {
        let btn = find("/stove", this.node);
        // btn.on("touchstart",this.onBtnMakePill,this);
        let callback = () => {
            this.onBtnMakePill();
        };
        btn.on(Node.EventType.TOUCH_START, () => {
            this.onBtnMakePill();
            this.schedule(callback, 0.1);
        }, this);
        btn.on(Node.EventType.TOUCH_END, () => {
            this.unschedule(callback);
        }, this);

    }
    onEnable() {
        // this.updatePillsContent();
        this.updateMaterialDemand();

        let guideData = em.dispatch("getGuideData");
        if (!guideData.MakePillsLayer) {
            this.startMakePillsLayerGuide();
        }
    }
    onBtnPill(e) {
        let node = e.target;
        this._curPillData = node.data;
        console.log("_curPillData", this._curPillData);
        em.dispatch("playOneShot", "common/通用按键");
        this.updatePillState(node);
        this.updateMaterialDemand();
    }
    //刷新丹药选择状态
    updatePillState(node) {
        this._pillPrefabArr.forEach(pill => {
            if (pill === node) {
                pill.getChildByName("name").getComponent(Label).color = new Color(255, 204, 0, 255);
            } else {
                // pill.getChildByName("name").getComponent(Label).color = new Color(0, 0, 0, 255);
                pill.getChildByName("name").getComponent(Label).color = new Color(255, 255, 255, 255);
            }
        });
    }
    // 刷新需要材料显示 妖丹和灵石
    updateMaterialDemand() {
        console.log("this._curPillData ", this._curPillData);
        let m1 = find("/stove/m1", this.node);
        let m2 = find("/stove/m2", this.node);
        let data1 = em.dispatch("getItemDataByIdOrName", this._curPillData.consumeItemName);
        let data2 = em.dispatch("getItemDataByIdOrName", "灵石");
        let t1 = em.dispatch("getItemTotalByIdOrName", this._curPillData.consumeItemName);
        let t2 = em.dispatch("getItemTotalByIdOrName", "灵石");
        let s1 = m1.getChildByName("sprite").getComponent(Sprite);
        let s2 = m2.getChildByName("sprite").getComponent(Sprite);
        em.dispatch("loadTheDirResources", "images/items/" + data1.loadUrl + "/spriteFrame", (assets) => s1.spriteFrame = assets);
        em.dispatch("loadTheDirResources", "images/items/" + data2.loadUrl + "/spriteFrame", (assets) => s2.spriteFrame = assets);
        let l1 = m1.getChildByName("Label").getComponent(Label);
        let l2 = m2.getChildByName("Label").getComponent(Label);
        let l12 = m1.getChildByName("Label2").getComponent(Label);
        let l22 = m2.getChildByName("Label2").getComponent(Label);
        m1.getChildByName("nameBg").getChildByName("Label").getComponent(Label).string = data1.name;
        m2.getChildByName("nameBg").getChildByName("Label").getComponent(Label).string = data2.name;
        l1.string = "x" + this._curPillData.consumeTotal;
        l2.string = "x" + this._curPillData.consumeLingshi;
        l12.string = t1;
        l22.string = t2;
        this.scheduleOnce(() => {
            if (t1 >= this._curPillData.consumeTotal) {
                s1.material = this.defaultMaterial;
            } else {
                s1.material = this.grayMaterial;
            }
            if (t2 >= this._curPillData.consumeLingshi) {
                s2.material = this.defaultMaterial;
            } else {
                s2.material = this.grayMaterial;
            }
        }, 0);

        // l1.string = data1.name + "\n需要：" + this._curPillData.consumeTotal + "\n拥有：" + t1;
        // l2.string = data2.name + "\n需要：" + this._curPillData.consumeLingshi + "\n拥有：" + t2;
    }
    onBtnMakePill() {
        this.guideFinger.active = false;
        if (!em.dispatch("getGuideData").MakePillsLayer) {
            em.dispatch("setGuideData", "MakePillsLayer", true);
            em.dispatch("initMainMenuByGuideData");
        }
        em.dispatch("playOneShot", "common/炼制丹药");
        let itemIsEnough = em.dispatch("itemIsEnough", this._curPillData.consumeItemName, this._curPillData.consumeTotal);
        let lingshiIsEnough = em.dispatch("itemIsEnough", "灵石", this._curPillData.consumeLingshi);
        if (itemIsEnough && lingshiIsEnough) {
            em.dispatch("reduceItemFromSS", this._curPillData.consumeItemName, this._curPillData.consumeTotal);
            em.dispatch("reduceItemFromSS", "灵石", this._curPillData.consumeLingshi);
            console.log(this._curPillData.name + "+1");
            em.dispatch("addItemToSS", this._curPillData.id, 1);
            this.updatePillList();
            this.updateMaterialDemand();
            this.createTipsTex(this._curPillData.name + "+1");
            let total = em.dispatch("getItemTotalByIdOrName", "灵石");
            find("Canvas/menuLayer/title/lingshiTotalBg/total").getComponent(Label).string = total;
        } else {
            let tips = "";
            if (!itemIsEnough && !lingshiIsEnough) tips = "妖丹和灵石不足，无法炼制。";
            else if (!itemIsEnough) tips = "妖丹不足，无法炼制。";
            else tips = "灵石不足，无法炼制。"
            em.dispatch("tipsViewShow", tips);
        }
    }

    //=================创建提示信息===============
    createTipsTex(content: string, initPos = { x: 0, y: 100 }) {
        let tex = plm.getFromPool("tipsTex");
        tex.getComponent(Label).string = content;
        tex.parent = find("Canvas/menuLayer/MakePillsLayer/tipsPar");
        tex.setPosition(initPos.x, initPos.y, 0);
        this.playTIPSTeXEffect(tex);
    }
    playTIPSTeXEffect(tex, color = new Color(255, 255, 255, 255)) {
        let a1 = tween().by(1, { position: new Vec3(0, 200, 0) }, {
            onUpdate: (target, ratio) => {
                // if(ratio>0.5) tex.getComponent(Label).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), (ratio -0.5)*2);
                tex.getComponent(Label).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let a2 = tween().to(0.5, { scale: new Vec3(1.2, 1.2, 1) });
        let action = tween(tex).parallel(a1, a2)
            .call(() => {
                tex.setScale(new Vec3(1, 1, 1));
                plm.putToPool("tipsTex", tex, true);
            });
        action.start();
    }
    startMakePillsLayerGuide() {
        this.guideFinger.active = true;
        find("Canvas/menuLayer/guideFinger").active = false;
        em.dispatch("addItemToSS", "一阶妖丹", 10);
        em.dispatch("addItemToSS", "灵石", 50);
        let tips = "获得物品一阶妖丹x10、灵石x50";
        em.dispatch("tipsViewShow", tips);
        this.updateMaterialDemand();
        let guideTips = "点击丹炉，炼制丹药，提升修为。当材料不足时，材料图片会置灰。可以通过修炼场获取材料。"
        em.dispatch("openGuideTips", guideTips);
    }

}

