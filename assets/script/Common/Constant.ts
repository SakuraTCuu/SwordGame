import { AnimationClip, JsonAsset, Prefab, SpriteFrame } from "cc";

export namespace Constant {

    export class Audio {
        static HOME_BGM = "刀剑如梦"; //主页bgm
        static LEVEL_BGM = "不谓侠"; //关卡bgm
        static FROZEN_SFX = "frozen"; //冰冻音效
        static SPELL_SFX = "frozen"; //冰冻音效
        static HIT_GROUND_SFX = "砸地"; //砸地音效
        static CLICK_SFX = "通用按键"; //通用按键音效
        static INTO_PROVING_GROUND_SFX = "进入试炼场"; //进入试炼场音效
        static CLICK_FIGURE_SFX = "点击人物界面"; //点击人物界面音效
        static CLICK_PRACTICE_SFX = "点击修行界面"; //点击修行界面音效
        static CLICK_ALCHEMY_SFX = "点击炼丹界面"; //点击炼丹界面音效
        static CLICK_CHEATS_SFX = "点击秘籍界面"; //点击秘籍界面音效

        static REFINING_ELIXIR = "炼制丹药"; //炼制丹药音效
        static TAKE_PILLS = "吃药"; //吃药音效
        static BREAKTHROUGH = "突破"; //突破音效
    }

    export const enum EventId {
        tipsViewShow = "tipsViewShow",
        hideBanner = "hideBanner",
        showWxVideoAd = "showWxVideoAd",
        showBanner = "showBanner",
        loadRes = "loadRes",
        loadDir = "loadDir",
        switchMainMenuLayer = "switchMainMenuLayer",
        updateLoadingProgress = 'updateLoadingProgress',
        loadingComplete = 'loadingComplete',
    }

    export class Res {
        static ResBundleName: "resources";

        static ResourcesList = [
            { id: 0, path: "anim", desc: "动画资源", type: AnimationClip },
            // { id: 1, path: "audio", desc: "音频资源", type: AudioClip },
            { id: 2, path: "data", desc: "配表资源", type: JsonAsset },
            { id: 3, path: "images", desc: "图片资源", type: SpriteFrame },
            { id: 4, path: "prefabs", desc: "预制资源", type: Prefab },
        ];
    }

    export class Path {
        //道具表
        static ItemPath = "data/others/item";
        //英雄属性表
        static HeroPropertyDataJson = "data/others/英雄属性表";
        //修仙境界表
        static TrainingLvListJson = "data/others/修仙境界表";
        //功法秘籍表
        static SkillBookListJson = "data/others/功法秘籍表";
        //boss属性配置
        static BossDataListJson = "data/stageConfig/boss属性配置";
        //装备品级属性表
        static EquQualityListJson = "data/equSystem/装备品级属性表";
        //法器词条
        static EquEffectListJson = "data/equSystem/法器词条";
        //法器等级属性表
        static EquEffectLevelListJson = "data/equSystem/法器等级属性表";
        //防具等级属性表
        static EquArmorListJson = "data/equSystem/防具等级属性表";
        //鞋等级属性表
        static EquShoeListJson = "data/equSystem/鞋等级属性表";
    }
}