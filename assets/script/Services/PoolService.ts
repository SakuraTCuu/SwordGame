import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";
import { Component, error, instantiate, log, Node, NodePool, Prefab, resources, warn } from "cc";

/**
 * 全局的对象池服务
 *
 * @class PoolService
 */
@Singleton
class PoolService implements IService {

    public static readonly instance: PoolService

    //历史遗留
    public plm = new PoolService.PoolManager();

    private list = new Map<string, PoolService.Pool>();

    private readonly perfabPath = "prefabs"
    // private readonly perfabPath = "prefabs/hero/weapon"

    public async initialize() {
        // await this.loadFolder();
    }

    public async lazyInitialize() {
        await this.loadFolder();
    }

    /**
    * 从目录加载预制体
    */
    public loadFolder() {
        return new Promise<void>((resolve, reject) => {
            resources.loadDir(this.perfabPath, (err, resource) => {
                for (let index = 0; index < resource.length; index++) {
                    const prefab = (resource as Prefab[])[index];
                    this.register(prefab.name, prefab, 10);
                }
                this.info();
                resolve()
            });
        })
    }



    async register(
        name: string,
        prefab: Prefab,
        length: number,
        component?: { prototype: Component }
    ) {
        if (!this.list.has(name)) {
            this.list.set(name, new PoolService.Pool(prefab, length, component));
        }
    }

    async unregister(name: string) {
        if (this.list.has(name)) {
            this.list.get(name).clear();
            this.list.delete(name);
        }
    }

    /**
     * 回收指定对象
     * @param name 
     * @param node 
     */
    put(name: string, node: Node) {
        if (this.list.has(name)) {
            this.list.get(name).put(node);
        } else {
            error("没有注册预制体");
            node.destroy();
        }
    }

    /**
     * 获取指定对象
     * @param name 
     */
    get(name: string) {
        if (this.list.has(name)) {
            return this.list.get(name).get();
        } else {
            error("没有注册预制体");
        }
    }

    /**
    * 打印信息
    * @param name
    */
    info(name?: string) {
        if (name) {
            if (this.list.has(name)) {
                log(name + ":", this.list.get(name).progress());
            } else {
                log(`没有注册${name}预制体`);
            }
        } else {
            let info = "对象池信息:\n"
            if (this.list.size > 0) {
                this.list.forEach(
                    (value: PoolService.Pool, key: string, map: Map<string, PoolService.Pool>) => {
                        info += "   " + key + "    " + value.progress() + "\n";
                    }
                );
            } else {
                info += "   没有注册对象池对象";
            }
            log(info)
        }
    }
}

namespace PoolService {

    /**
     * 对象池
     *
     * @export
     * @class Pool
     */
    export class Pool {
        private template: Prefab = null;
        private list: NodePool = null;
        private tail: number = 0;
        constructor(
            template: Prefab,
            length: number,
            component?: string | { prototype: Component }
        ) {
            this.list = new NodePool(component as any);
            this.template = template;
            for (let index = 0; index < length; index++) {
                let node = instantiate(this.template);
                (<any>node).prefab = template;
                node.active = false;
                this.list.put(node);
            }
            this.tail = length;
        }

        put(node: Node) {
            if ((<any>node).prefab == this.template) {
                node.active = false;
                this.list.put(node);
            } else {
                throw new Error("该节点不是该对象池的对象");
            }
        }

        get() {
            let node: Node;
            if (this.list.size() > 0) {
                node = this.list.get();
            } else {
                node = instantiate(this.template);
                (<any>node).prefab = this.template;
                warn("对象池预设不足");
                this.tail += 1;
            }
            node.active = true;
            return node;
        }

        clear() {
            this.list.clear();
        }

        progress() {
            return `${this.list.size()}/${this.tail}`;
        }
    }
}

namespace PoolService {

    /**
     * 从老项目中挪过来
     * 暂时保留
     */
    export class PoolManager {
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
        getFromPool(string: string, isNotice: boolean = false): Node {
            let pool = this.pools[string];
            let prefab = this.prefabs[string];
            // if (!pool && !prefab) return console.log("对象池或预制件不存在");
            if (!pool) {
                console.warn("对象池" + string + "不存在");
                return null;
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
}


export default PoolService;
