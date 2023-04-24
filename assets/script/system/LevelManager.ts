/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-11 17:57:36
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-25 17:34:04
 * @FilePath: \to-be-immortal\assets\script\system\LevelManager.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
export { LevelManager };

/**
 * 类说明  等级管理类
 * @class LevelManager
 * @constructor {Object}  obj 初始化数据对象
 * @property {Number} level 当前技能等级
 * @property {Number} maxLevel 当前技能最大等级
 * @property {Number} curExp 当前技能最大等级
 * @property {Object} levelMappingExpList 当前技能等级经验映射表
 * @property {Number} maxExp 当前技能满级经验
 */
class LevelManager {
    level: number;
    maxLevel: number;
    curExp: number;
    maxExp: number;
    levelMappingExpList: object;
    constructor(obj:{level:number,maxLevel:number,curExp:number,levelMappingExpList:any}) {
        this.level = obj.level;
        this.maxLevel = obj.maxLevel;
        this.curExp = obj.curExp;
        this.levelMappingExpList = obj.levelMappingExpList; //可以单独拿出来
        this.maxExp = this.levelMappingExpList[this.maxLevel - 1].exp;
        console.log("levelManager",this);
        
    }
    /**
     * @method addExp 增加经验
     * @return {boolean} 是否升级；
     */
    addExp(num:number) {
        // console.log("this.curExp ",this.curExp );
        // console.log("this.maxExp  ",this.maxExp  );
        // console.log("num",num);
        
        
        //新增 最大等级限制
        if (this.curExp >= this.maxExp || this.level >= this.maxLevel) return console.log("经验已满");
        this.curExp += num;
        // console.log("经验+" + num);
        if (this.curExp >= this.maxExp) this.curExp = this.maxExp;
        // console.log("this.curExp",this.curExp);
        // console.log("this.maxExp",this.maxExp);
        if (this.isUpgrade()) {
            this.upgrade();
            return true;
        };
    }
    // 是否能够升级
    isUpgrade() {
        return this.curExp >= this.levelMappingExpList[this.level].exp;
    }
    // 升级
    upgrade() {
        let len = this.maxLevel;
        let start = this.level + 1;
        let afterLv:number;
        for (let i = start; i < len; i++) {
            // let exp = this.levelMappingExpList[i].exp;
            let exp = this.levelMappingExpList[i - 1].exp;
            if (exp > this.curExp) {
                afterLv = i - 1;
                break;
            }
            if (i == len - 1 && exp <= this.curExp) afterLv = this.maxLevel;
        }
        let addNum = afterLv - this.level;
        this.level = afterLv;
        console.log("等级+" + addNum);
    }
    //获取经验进度
    getExpProgress() {
        if (this.level == 1) return this.curExp / this.levelMappingExpList[this.level ].exp;
        else {
            let fontLvExp = this.levelMappingExpList[this.level - 1].exp;
            let curLvExp = this.levelMappingExpList[this.level -0].exp;
            // console.log("fontLvExp",fontLvExp);
            // console.log("curLvExp",curLvExp);
            // console.log("this.curExp - fontLvExp",this.curExp - fontLvExp);
            // console.log("curLvExp - fontLvExp",curLvExp - fontLvExp);
            return (this.curExp - fontLvExp)/(curLvExp - fontLvExp);
        };
    }
    // 返回当前等级
}

