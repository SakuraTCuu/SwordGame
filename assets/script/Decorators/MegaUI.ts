// import { Enum } from "cc";
import UIHelper from "../Helpers/UIHelper";

let DefStack = UIHelper.DefStack.create("prefab/public/uiPublic");
//记录所有被注册的动画
let ALLAni = {}
//只用于
let EnumIAni = 0;
//存储Ani对象
let ALLAniConstructor: Map<string, new (...args: any[]) => UIHelper.UIAniBase> = new Map<string, new (...args: any[]) => UIHelper.UIAniBase>();
/**
 * MegaUI装饰器
 * @param uiOptiton 
 */
function MegaUI(uiOptiton: UIHelper.IUIInfo) {
    return function (target: typeof UIHelper.IUIBase) {
        DefStack.add(uiOptiton);
    }
}

namespace MegaUI {
    /**
     * UI动画装饰器
     * @param uiAniName 
     */
    export function Ani(uiAniName: string) {
        return function (target: new (...args: any[]) => UIHelper.UIAniBase) {
            ALLAni[uiAniName] = EnumIAni++;
            ALLAniConstructor.set(uiAniName, target);
        }
    }
    /**
     * 返回所有动画键值对
     * @returns 
     */
    export const AniEnum = function () {
        return  ALLAni;
    }
    /**
     * 生成实例 
     * @param k 为AniEnum里个一个支
     */
    export const CreateUIAni = function (k) : UIHelper.UIAniBase {
        if(ALLAniConstructor.has(k)){
            let target = ALLAniConstructor.get(k);
            let ret = new target();
            return ret;
        }
        return null;
    }
}

export default MegaUI