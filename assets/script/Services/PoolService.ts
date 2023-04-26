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

    private list = new Map<string, PoolService.Pool>();

    private readonly perfabPath = "Prefabs/Pools"

    public async initialize() {
      await  this.loadFolder();
    }

    public async lazyInitialize() {
    }

    /**
    * 从目录加载预制体
    */
    public loadFolder() {
        return new Promise<void>((resolve,reject)=>{
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


export default PoolService;
