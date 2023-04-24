/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-07-05 23:35:56
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 10:41:52
 * @FilePath: \to-be-immortal\assets\script\global\PoolManager.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { instantiate, NodePool } from "cc";

export { plm }
class PoolManager {
    pools;
    prefabs;
    junkyard;
    constructor() {
        this.pools = {};
        this.prefabs = {};
        this.junkyard = new NodePool();
    }
    //添加对象池和相关预制件到pools
    addPoolToPools(string, pool, prefab) {
        if (this.pools[string]) {
            console.warn("对象池" + string + "已存在");
            return;
        }
        this.pools[string] = pool;
        this.prefabs[string] = prefab;
        console.log("成功添加对象池" + string);
    }
    // 获取对象池中的对象
    getFromPool(string: string, isNotice: boolean = false) {
        let pool = this.pools[string];
        let prefab = this.prefabs[string];
        // if (!pool && !prefab) return console.log("对象池或预制件不存在");
        if (!pool) {
            console.warn("对象池" + string + "不存在");
            return false;
        }
        if (!prefab) throw "预制件" + string + "不存在";
        let obj = null;
        if (pool.size() > 0) {
            obj = pool.get();
            if (isNotice) console.log("从对象池获取" + string + "成功");
        } else {
            obj = instantiate(prefab);
            if (isNotice) console.log("从对象池创建" + string + "成功");
        }
        return obj;
    }
    //将对象放入对象池
    putToPool(string: string, obj, isNotice: boolean = false) {
        let pool = this.pools[string];
        if (!pool) {
            console.warn(string + "对象池不存在,直接销毁");
            obj.destroy();
            return;
        }
        if (isNotice) console.log("将" + " " + obj.uuid + " 放入对象池" + string);
        pool.put(obj);
    }
    //放入垃圾场 待处理 等待场景切换时 统一处理
    putToJunkyard(obj, isNotice = false) {
        // if(isNotice) console.log("放入垃圾场"+obj.uuid);
        if (isNotice) console.log("放入垃圾场");
        this.junkyard.put(obj);
    }
    // 显示所有对象池和预制件
    showAllPoolsAndPrefab() {
        console.log("pools", this.pools);
        console.log("prefabs", this.prefabs);
    }
    //清空所有对象池 ---> 同时清理垃圾场
    clearAllNodePool() {
        this.clearJunkyard();
        for (const key in this.pools) {
            if (Object.prototype.hasOwnProperty.call(this.pools, key)) {
                const pool = this.pools[key];
                pool.clear();
                delete this.pools[key];
            }
        }
        for (const key in this.prefabs) {
            if (Object.prototype.hasOwnProperty.call(this.prefabs, key)) {
                delete this.prefabs[key];
            }
        }
        console.log("this.pools", this.pools);
        console.log("this.prefabs", this.prefabs);
    }
    // 清空垃圾场
    clearJunkyard() {
        this.junkyard.clear();
    }
}
const plm = new PoolManager();