/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-19 14:16:09
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-12 00:19:12
 * @FilePath: \to-be-immortal\assets\script\mainMenu\SkillBookLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Prefab, find, instantiate, Label, Sprite, Color, NodePool, UITransform, ColorKey, SpriteFrame, Animation, Tween, tween, Vec3 } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('SkillBookLayer')
export class SkillBookLayer extends Component {
    @property([SpriteFrame])
    typeSFs;
    @property(Node)
    guideFinger;
    @property([SpriteFrame])
    skillBg = [];


    _loadingList = {
        _skillBookClass: false,
        _skillBook: false,
    }
    _skillBookClass: Prefab;
    _skillBook: Prefab;
    _bookContent: Node;
    _curSelectBook: string;
    _finishBookList = [];
    _bookPrefabList = {};
    _usingBookList = {
        "身法": "",
        "心法": "",
        "武技": "",
        "绝技": "",
        "神通": "",
    };

    _guideRewardBookName: string;
    _guideRewardBookType: string;
    onLoad() {
        let prefab = find("switchBook/bookPrefab", this.node);
        plm.addPoolToPools("SBLBookPrefab", new NodePool(), prefab);
        this._bookContent = find("ScrollView/view/content", this.node);
    }
    onEnable() {
        if (!em.dispatch("getGuideData").SkillBookLayer) {
            this.startSkillBookLayerGuide();
        }
        this.updateBookListView();
    }
    start() {
        this.dynamicLoadPrefabs();
        this.initData();
        this.initUsingBook();

    }
    // 初始化数据
    initData() {
        let all = em.dispatch("getTempData", "SkillBookLayer");
        if (all) {
            this._finishBookList = all.finishBookList;
            this._usingBookList = all.usingBookList;
        };
    }
    // 动态加载预制件 注：或许需要添加loading...
    dynamicLoadPrefabs() {
        let dir1 = "prefabs/mainMenu/skillBookClass";
        let dir2 = "prefabs/mainMenu/skillBook";
        em.dispatch("loadTheDirResources", dir1, (assets) => {
            this._skillBookClass = assets;
            this._loadingList._skillBookClass = true;
            this.initBookListView();
        });
        em.dispatch("loadTheDirResources", dir2, (assets) => {
            this._skillBook = assets;
            this._loadingList._skillBook = true;
            this.initBookListView();
        });
    }
    //初始化秘籍列表显示
    initBookListView() {
        if (!this.isCompleteLoading()) return;
        let list = this.getSkillBookClassList();
        for (const key in list) {
            if (Object.prototype.hasOwnProperty.call(list, key)) {
                const arr = list[key];
                let bookClass = instantiate(this._skillBookClass);
                bookClass.parent = this._bookContent;
                // bookClass.getChildByName("Label").getComponent(Label).string = key;
                switch (key) {
                    case "绝技":
                        bookClass.getChildByName("type").getComponent(Sprite).spriteFrame = this.typeSFs[0];
                        break;
                    case "秘法":
                        bookClass.getChildByName("type").getComponent(Sprite).spriteFrame = this.typeSFs[1];
                        break;
                    case "身法":
                        bookClass.getChildByName("type").getComponent(Sprite).spriteFrame = this.typeSFs[2];
                        break;
                    case "神通":
                        bookClass.getChildByName("type").getComponent(Sprite).spriteFrame = this.typeSFs[3];
                        break;
                    case "武技":
                        bookClass.getChildByName("type").getComponent(Sprite).spriteFrame = this.typeSFs[4];
                        break;
                    case "心法":
                        bookClass.getChildByName("type").getComponent(Sprite).spriteFrame = this.typeSFs[5];
                        break;
                    default:
                        break;
                }

                arr.forEach(data => {
                    let book = instantiate(this._skillBook);
                    let loadUrl = "images/icons/icon_" + data.name2 + "/spriteFrame";
                    em.dispatch("loadTheDirResources", loadUrl, (assets) => book.getChildByName("Sprite").getComponent(Sprite).spriteFrame = assets);
                    if (this._finishBookList.indexOf(data.name) < 0) {//未学习的功法
                        book.getComponent(Sprite).spriteFrame = this.skillBg[0];
                        book.getChildByName("Label").getComponent(Label).color = new Color(30, 30, 30, 255);
                        // book.getChildByName("Label").getComponent(Label).color = new Color(255, 255, 255, 255);
                        if (em.dispatch("getItemTotalByIdOrName", data.name) > 0) {
                            let anim = book.getComponent(Animation);
                            this.scheduleOnce(() => {
                                anim.play();
                            }, 0);
                        }
                    } else {
                        book.getComponent(Sprite).spriteFrame = this.skillBg[1];
                        // book.getChildByName("Label").getComponent(Label).color = new Color(255, 204, 0, 255);
                        book.getChildByName("Label").getComponent(Label).color = new Color(255, 255, 255, 255);
                        //判断功法是否可以学习 可以学习且没有学的情况下播放动画
                    }
                    book.getChildByName("Label").getComponent(Label).string = data.name;
                    book.parent = find("/type/content", bookClass);
                    glf.createButton(this.node, book, "SkillBookLayer", "onBtnShowBookDetail", data.name);
                    this._bookPrefabList[data.name] = book;
                });
                // let total = Math.ceil(arr.length / 4);//4为适配结果，具体根据效果展示
                let total = Math.ceil(arr.length/5);//5为适配结果，具体根据效果展示
                // let height = find("/type/content", bookClass).getComponent(UITransform).contentSize.y * total + find("/type", bookClass).getComponent(UITransform).contentSize.y;
                let height = 280 * total + find("/type", bookClass).getComponent(UITransform).contentSize.y;//120 skillBook 预制件的高度
                bookClass.getComponent(UITransform).setContentSize(bookClass.getComponent(UITransform).contentSize.width, height);
                console.log("height", height);
                console.log("contentSize.y", find("/type/content", bookClass).getComponent(UITransform).contentSize.y);
            }
        }
        if (!em.dispatch("getGuideData").SkillBookLayer) {
            let book = this._bookPrefabList[this._guideRewardBookName];
            Tween.stopAllByTag(4);
            let guide = this.guideFinger;
            guide.active = true;
            guide.parent = book;
            guide.setPosition(0, 150, 0);
            let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
            let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
            let action = tween(guide).sequence(a1, a2);
            action = tween(guide).repeatForever(action);
            action.tag(4);
            action.start();
        }
    }
    // 刷新秘籍列表显示
    updateBookListView() {
        for (const key in this._bookPrefabList) {
            if (Object.prototype.hasOwnProperty.call(this._bookPrefabList, key)) {
                const book = this._bookPrefabList[key];
                if (em.dispatch("getItemTotalByIdOrName", key) > 0 && this._finishBookList.indexOf(key) < 0) {
                    let anim = book.getComponent(Animation);
                    anim.play();
                }
            }
        }
    }
    // 是否完成加载
    isCompleteLoading() {
        for (const key in this._loadingList) {
            if (Object.prototype.hasOwnProperty.call(this._loadingList, key)) {
                const isEnd = this._loadingList[key];
                if (!isEnd) return false;
            }
        }
        return true;
    }
    /**
     * @description: 对获取的功法秘籍进行分类
     * @returns {object} 返回分类结果
     */
    getSkillBookClassList() {
        let all = em.dispatch("usingHeroBasePropertyFun", "getAllAboutSkillBook");
        // console.log("all", all);
        let list = {};
        all.forEach(book => {
            if (list.hasOwnProperty(book.type)) {
                list[book.type].push(book);
            } else {
                list[book.type] = [book];
            }
        });
        return list;
    }
    //显示功法秘籍详情
    onBtnShowBookDetail(e, p) {
        let node = find("bookDetail", this.node);
        let label = find("/bookDetail/study/Label", this.node).getComponent(Label);
        label.string = "领悟";
        node.active = true;
        this._curSelectBook = p;
        if (this._finishBookList.indexOf(this._curSelectBook) > -1) {
            label.string = "已掌握";
        }
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", p);
        console.log("onBtnShowBookDetail", data);
        node.getChildByName("bookName").getComponent(Label).string = data.name + "\n" + data.lv + "阶功法";
        // node.getChildByName("bookDescription").getComponent(Label).string = data.description + "\n\n" + data.description2;
        node.getChildByName("bookDescription").getComponent(Label).string = "\n\n" + data.description;
    }
    closeBookDetail() {
        find("bookDetail", this.node).active = false;
    }
    // 学习秘籍
    onBtnStudyBook() {
        //判断秘籍是否已经学习
        if (this._finishBookList.indexOf(this._curSelectBook) > -1) {
            // em.dispatch("tipsViewShow", "已掌握该功法", 3);
            return;
        }
        // let flag = true;
        let flag = em.dispatch("reduceItemFromSS", this._curSelectBook, 1);
        if (flag) {
            this._finishBookList.push(this._curSelectBook);
            find("/bookDetail/study/Label", this.node).getComponent(Label).string = "已掌握";
            let book = this._bookPrefabList[this._curSelectBook];
            let anim = book.getComponent(Animation);
            anim.stop();
            book.getComponent(Sprite).spriteFrame = this.skillBg[1];
            // book.getChildByName("Label").getComponent(Label).color = new Color(255, 204, 0, 255);
            book.getChildByName("Label").getComponent(Label).color = new Color(255, 255, 255, 255);
            this.savingFinishBookData();
            if (!em.dispatch("getGuideData").SkillBookLayer) {
                this.startGuideSetSkill();
            }
        } else {
            em.dispatch("tipsViewShow", "缺少秘籍:" + this._curSelectBook, 3);
        }
        console.log(this._finishBookList);
    }
    //记录已学习的功法
    savingFinishBookData() {
        let data = {
            finishBookList: this._finishBookList,
            usingBookList: this._usingBookList
        }
        em.dispatch("savingToTempData", "SkillBookLayer", data);
    }
    // 初始化携带功法
    initUsingBook() {
        // let node = find("usingBook",this.node);
        for (const type in this._usingBookList) {
            if (Object.prototype.hasOwnProperty.call(this._usingBookList, type)) {
                const skillName = this._usingBookList[type];
                if ("" !== skillName) {
                    let sprite = find("usingBook/" + type, this.node).getChildByName("sprite").getComponent(Sprite);
                    let loadUrl = "images/icons/icon_" + skillName + "/spriteFrame";
                    em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
                }
            }
        }
    }
    //点击切换携带功法按钮
    onBtnSwitchBook(e, type) {
        console.log("切换" + type);
        find("switchBook", this.node).active = true;
        find("switchBook/bg/title", this.node).getComponent(Label).string = type;
        // let list = this.getSkillBookClassList()[p];
        this.initSwitchBook(type);
    }
    // 初始化切换秘籍界面
    initSwitchBook(type) {
        let par = find("switchBook/bg/content", this.node);
        this._finishBookList;
        this._finishBookList.forEach(bookName => {
            let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", bookName);
            if (data.type == type) {
                // console.log(data);
                let prefab = plm.getFromPool("SBLBookPrefab");
                let sprite = prefab.getComponent(Sprite);
                prefab.parent = par;
                prefab.getChildByName("name").getComponent(Label).string = data.name;
                let loadUrl = "images/icons/icon_" + data.name2 + "/spriteFrame";
                em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
                glf.createButton(this.node, prefab, "SkillBookLayer", "switchBook", type + "@" + data.name2);
            };
        });
    }
    // 切换携带功法
    switchBook(e, p) {
        console.log("p", p);
        if (!em.dispatch("getGuideData").SkillBookLayer) {
            this.guideFinger.active = false;
            em.dispatch("setGuideData", "SkillBookLayer", true);
            em.dispatch("initMainMenuByGuideData");
        }
        let ps = p.split("@");
        let type = ps[0];
        let skillName = ps[1]
        let sprite = find("usingBook/" + type, this.node).getChildByName("sprite").getComponent(Sprite);
        let loadUrl = "images/icons/icon_" + skillName + "/spriteFrame";
        em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
        this._usingBookList[type] = skillName;
        console.log("this._usingBookList", this._usingBookList);
        this.closeSwitchBook();
        this.savingFinishBookData();
    }
    closeSwitchBook() {
        find("switchBook", this.node).active = false;
        let par = find("switchBook/bg/content", this.node);
        while (par.children.length) {
            let child = par.children[0];
            child.removeFromParent();
            plm.putToPool("SBLBookPrefab", child);
        }
    }
    startSkillBookLayerGuide() {
        let guideTips = "首次进入，随机获取一本一阶功法（剑雨术、一剑隔世和万剑归冢）。每次进入功法界面，如果看到不断闪烁的功法，则表明此功法可以掌握，请赶快领悟并使用。"
        em.dispatch("openGuideTips", guideTips);

        find("Canvas/menuLayer/guideFinger").active = false;
        let random = Math.random();
        let tips: string;
        if (random > 0.7) {
            em.dispatch("addItemToSS", "万剑归冢", 1);
            tips = "获得一阶功法：万剑归冢x1";
            this._guideRewardBookName = "万剑归冢";
            this._guideRewardBookType = "神通";

        } else if (random > 0.3) {
            em.dispatch("addItemToSS", "一剑隔世", 1);
            tips = "获得一阶功法：一剑隔世x1";
            this._guideRewardBookName = "一剑隔世";
            this._guideRewardBookType = "绝技";
        } else {
            em.dispatch("addItemToSS", "剑雨术", 1);
            tips = "获得一阶功法：剑雨术x1";
            this._guideRewardBookName = "剑雨术"
            this._guideRewardBookType = "武技";
        }
        em.dispatch("tipsViewShow", tips);
    }
    // 开始引导设置技能
    startGuideSetSkill() {
        let par = find("Canvas/menuLayer/SkillBookLayer/usingBook/" + this._guideRewardBookType);
        Tween.stopAllByTag(4);
        let guide = this.guideFinger;
        guide.active = true;
        guide.parent = par;
        guide.setPosition(0, 150, 0);
        let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
        let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
        let action = tween(guide).sequence(a1, a2);
        action = tween(guide).repeatForever(action);
        action.tag(4);
        action.start();
    }
}

