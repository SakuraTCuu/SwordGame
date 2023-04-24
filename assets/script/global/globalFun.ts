import { Button, Component, Contact2DType, EventHandler, native, Node, PhysicsSystem2D } from "cc";
import { em } from "./EventManager";
import { gUrl } from "./GameUrl";
import { ggd } from "./globalData";
import { hr } from "./HttpRequest";

export { glf }


const glf = {
    //创建组件提供的按钮 或 修改内部调用 
    createButton: (scriptNode: Node, buttonNode: Node, scriptName: string, callbackName: string, param: string = '') => {
        let flag = scriptNode && buttonNode && scriptName && callbackName;
        // console.log("scriptNode", scriptNode);
        // console.log("buttonNode", buttonNode);
        // console.log("scriptName", scriptName);
        // console.log("callbackName", callbackName);
        if (!flag) {
            console.log("参数错误 无法生成按钮 请重新设置");
            return;
        }
        let buttonHandler = new EventHandler();
        buttonHandler.target = scriptNode;
        buttonHandler.component = scriptName;
        buttonHandler.handler = callbackName;
        buttonHandler.customEventData = param;
        // console.log(buttonHandler);
        let button = buttonNode.getComponent(Button);
        if (!button) button = buttonNode.addComponent(Button);
        button.clickEvents[0] = buttonHandler;//替换原先的
        // console.log("button", button);
        // button.clickEvents.push(buttonHandler);
        // console.log("创建成功");
    },
    /**
     * @description: 获取圆四周的点 
     * @param {number} r 圆的半径
     * @param {number} total 圆的总数
     * @注 圆的总数必须是四的倍数
     */
    getCirclePos(r: number, total: number) {
        if (total < 4) throw "圆上点数过少 请输入大于4的数字"
        if (total % 4 !== 0) throw "生成的在圆上的点的总数错误，不是4的倍数" + total;
        let quarter = total / 4;
        let arr = [];
        for (let i = 1; i < quarter; i++) {//第一象限
            let y = r * Math.sin(Math.PI / 180 * i / quarter * 90);
            let x = Math.sqrt(r * r - y * y);
            arr.push([x, y], [x, -y], [-x, y], [-x, -y]);
        };
        arr.push([0, r], [0, -r], [r, 0], [-r, 0]);
        return arr;
    },
    /**
     * @description: 获取时间详情
     * 
     */
    getTimeDetail() {
        var newDate = new Date();
        //保留两位有效数字
        let getTimeData = function (time) {
            return (Array(2).join("0") + time).slice(-2);
        };
        return newDate.getFullYear() + "." + (newDate.getMonth() + 1) + "." + newDate.getDate() + "  " +
            getTimeData(newDate.getHours()) + ":" + getTimeData(newDate.getMinutes()) +
            ":" + getTimeData(newDate.getSeconds());
    },
    //获得三角形队列
    getTriangleRow(rowTotal) {
        let initPos = { x: 0, y: 0 };
        let arr = [];
        let unitGap = 50;
        for (let i = 0; i < rowTotal; i++) {
            let total = i + 1;
            arr[i] = [];
            for (let j = 0; j < total; j++) {
                if (total % 2 == 0) {//偶数层 2 4 6
                    arr[i].push([initPos.x + j * unitGap - Math.floor(total / 2) * unitGap + unitGap / 2, initPos.y]);
                } else {  //奇数层  1 3 5 整体作揖unitGap/2 个单位
                    arr[i].push([initPos.x + j * unitGap - Math.floor(total / 2) * unitGap, initPos.y]);
                }
            }
        }
        return arr;
    },
    playAd() {
        switch (ggd.platform) {
            case "GooglePlay":
                native.reflection.callStaticMethod("com/cocos/game/AppActivity", "createAds", "()V");
                break;
            case "wxGame":
                em.dispatch("showWxVideoAd");
                break;
            default:
                break;
        }
    },
    // 广告播放成功后的回调
    afterPlayAdComplete() {
        switch (ggd.curAdRewardType) {
            case "getItems":
                em.dispatch("getItemsRewardByAds");
                break;
            case "rebirthHero":
                em.dispatch("rebirthHero");
                break;
            case "getDoubleReward":
                em.dispatch("getDoubleReward");
                break;
            case "getAllUpgradeReward":
                em.dispatch("usingWeaponManagerFun", "getAllUpgradeRewardComplete");
                break;
            case "updateUpgradeReward":
                em.dispatch("usingWeaponManagerFun", "updateUpgradeRewardComplete");
                break;

            case "getEquBox":
                console.log("领取装备箱子");
                let random = Math.random();
                if (random > 0.995) {
                    em.dispatch("addItemToSS", "史诗装备箱", 1);
                    em.dispatch("showGets", { "史诗装备箱": 1 });
                } else if (random > 0.98) {
                    em.dispatch("addItemToSS", "传说装备箱", 1);
                    em.dispatch("showGets", { "传说装备箱": 1 });
                } else if (random > 0.8) {
                    em.dispatch("addItemToSS", "稀有装备箱", 1);
                    em.dispatch("showGets", { "稀有装备箱": 1 });
                } else {
                    em.dispatch("addItemToSS", "实用装备箱", 1);
                    em.dispatch("showGets", { "实用装备箱": 1 });
                }
                em.dispatch("usingGameRewardFun", "afterPlayEquVideo");
                em.dispatch("usingHeroInfoLayerFun", "isShowAdBtn");
                break;
            default:
                em.dispatch("tipsViewShow", "参数类型错误：" + ggd.curAdRewardType);
                break;
        }

        // let url = gUrl.list.adClickCount;
        // let data = null;
        // hr.post(url, data, () => { });
    },
    // 广告播放失败后的回调
    afterPlayAdError() {
        switch (ggd.curAdRewardType) {
            case "getItems":
                em.dispatch("tipsViewShow", "获取奖励失败");
                break;
            case "rebirthHero":
                em.dispatch("closeRebirthAd");
                break;
            case "getDoubleReward":
                em.dispatch("closeGetDoubleRewardAd");
                break;
            case "getEquBox":
                em.dispatch("tipsViewShow", "获取奖励失败");
                break;
            case "getAllUpgradeReward":
                em.dispatch("tipsViewShow", "获取奖励失败");
                break;
            case "updateUpgradeReward":
                em.dispatch("tipsViewShow", "刷新奖励失败");
                break;
            default:
                em.dispatch("tipsViewShow", "参数类型错误：" + ggd.curAdRewardType);
                break;
        }
    },
    //获取两点间的飞行方向
    getTwoPointFlyDir(p1, p2) {
        // console.log("p1",p1);
        // console.log("p2",p2);
        let x = p1.x - p2.x;
        let y = p1.y - p2.y;
        let dir = { x: 0, y: 0 }
        if (x === 0 && y === 0) {
            dir.x = 1;
            dir.y = 0;
        } else if (x === 0) {
            dir.x = 0;
            dir.y = Math.abs(y) / y;
        } else if (y === 0) {
            dir.x = Math.abs(x) / x;
            dir.y = 0;
        } else if (Math.abs(x) >= Math.abs(y)) {
            dir.x = Math.abs(x) / x;
            dir.y = y / Math.abs(x);
        } else {
            dir.x = x / Math.abs(y);
            dir.y = Math.abs(y) / y;
        }
        return dir;
    },
    //两点间的距离是否大于某值
    towPointDisGreaterThanValue(p1, p2, v) {
        let x = p1.x - p2.x;
        let y = p1.y - p2.y;
        return x * x + y * y > v;
    },
}




