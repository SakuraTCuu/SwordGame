import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";
import { JsonAsset, log, resources } from "cc";


/**
 * 全局的配置服务
 *
 * @class ConfigService
 */
@Singleton
class ConfigService implements IService {

    public static readonly instance: ConfigService

    private list = new Map<string, ConfigService.ConfigInfo>();

    private configPath = "Config"

    private __Cache__:any = {};


    public async initialize() {
        await this.loadFolder();
    }

    public async lazyInitialize() {
    }



    /**
    * 从目录加载配置
    */
    public loadFolder() {
        new Promise<void>((resolve, reject) => {
            resources.loadDir(this.configPath, (err, resource) => {
                for (let index = 0; index < resource.length; index++) {
                    const json = (resource as JsonAsset[])[index];
                    this.register(json.name, json);
                }

                this.info();

                resolve();
            });
        })
    }

    async register(
        name: string,
        jsonAsset: JsonAsset
    ) {
        if (!this.list.has(name)) {
            this.list.set(name, { jsonAsset: jsonAsset, data: null });
        }
    }

    async unregister(name: string) {
        if (this.list.has(name)) {
            this.list.delete(name);
        }
    }

    /**
     * 获取指定的配置
     * @param name 
     */
    public get<T>(name: string): T {
        if (this.list.has(name)) {
            let info = this.list.get(name);
            if (info.data) {
                return info.data
            } else {
                return info.data = this.build(info.jsonAsset.json)
            }
        }
    }

    /**
     * [getDatasForKey 更具某个类型的具体值 exm: ("Task" , "_type" , 4)  取出task表里所有 _type 为 4 的data]
     * @param  {[string]} configName [@CONFIGS]
     * @param  {[string]} mkey       [key name]
     * @param  {[jsValue]} mkv        [key 值]
     * @return {[Array]}            [返回数组]
     */
    public getForKey<T> (configName:string, mkey:string|number, mkv:any):T[] {
        var temp = null;
        var serchKey = configName + "_" + mkey + "_" + mkv;
        temp = this.__Cache__[serchKey];
        if (temp) {
            return temp;
        }

        temp = [];

        var dat:T = this.get(configName);

        for (var k in dat) {
            var item = dat[k];
            if (typeof (item) != "object") continue;

            var kv = item[mkey + ""];

            if (mkv === kv) {
                temp.push(item);
            }
        }

        this.__Cache__[serchKey] = temp;
        return temp;
    }


    private build<T>(obj: any): T {
        const key: string[] = obj["keys"]
        const data: any[] = obj["data"]
        const index = obj["index"]
        let result

        if (index == null) {
            // 数组
            result = []
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                let obj = {};
                for (let j = 0; j < item.length; j++) {
                    obj[key[j]] = item[j];
                }
                result.push(obj);
            }
        } else {
            result = {}
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                let obj = {};
                for (let j = 0; j < item.length; j++) {
                    if (key[j] != index) {
                        obj[key[j]] = item[j];
                    } else {
                        result[item[j]] = obj;
                    }
                }
            }
        }

        return result;
    }


    /**
     * 打印信息
     * @param name 
     */
    info(name?: string) {
        if (name) {
            if (this.list.has(name)) {
                log(name + ":", this.list.get(name).jsonAsset);
            } else {
                log(`没有${name}配置文件`);
            }
        } else {
            let info = "配置信息:\n"
            if (this.list.size > 0) {
                this.list.forEach(
                    (value: ConfigService.ConfigInfo, key: string, map: Map<string, ConfigService.ConfigInfo>) => {
                        info += "   " + key + "    ✔" + "\n";
                    }
                );
            } else {
                info += "   没有注册配置";
            }
            log(info)
        }
    }
}

namespace ConfigService {
    export interface ConfigInfo {
        data: any,
        jsonAsset: JsonAsset
    }
}


export default ConfigService;
