/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-10-27 14:48:15
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-23 16:37:04
 * @FilePath: \to-be-immortal\assets\script\mainMenu\PrizeHallLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, find, instantiate, Sprite, Label, NodePool } from 'cc';
import { em } from '../global/EventManager';
import { gUrl } from '../global/GameUrl';
import { hr } from '../global/HttpRequest';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('PrizeHallLayer')
export class PrizeHallLayer extends Component {

    _curCdkeySting: string;
    _itemPrefab: Node;
    _itemContent: Node;

    onLoad() {
        this._itemPrefab = find("item", this.node);
        this._itemContent = find("ScrollView/view/content", this.node);
        let pool = new NodePool();
        plm.addPoolToPools("PrizeHallItem", pool, this._itemPrefab);
    }
    onDisable() {
        this.clearContent();
    }

    inputCdkey(box) {
        this._curCdkeySting = box.string;
        // console.log("this._curCdkeySting", this._curCdkeySting);
    }
    //发送奖励请求
    sendPrizeRequest() {
        let url = gUrl.list.getPrize;
        hr.get(url, { cdk: this._curCdkeySting }, (response) => {
            console.log("response", response);
            if (response.successful) {
                console.log("添加领取奖励效果 还没写");
                em.dispatch("tipsViewShow", "领取奖励成功");
                this.distributePrizes(response.data);
            } else {
                em.dispatch("tipsViewShow", "cdk错误或已失效，领取失败。");
            }
        });
    }

    //分发奖励
    distributePrizes(data) {
        this.clearContent();
        console.log("get prizes", data);
        for (let i = 0; i < data.prize.length; i++) {
            let prize = data.prize[i];
            let total = data.total[i];
            let prizeData = em.dispatch("getItemDataByIdOrName", prize);
            em.dispatch("addItemToSS", prize, total);
            let item = plm.getFromPool("PrizeHallItem");
            item.parent = this._itemContent;
            let sprite = item.getChildByName("Sprite").getComponent(Sprite);
            let loadUrl = "images/items/" + prizeData.loadUrl + "/spriteFrame";
            em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
            item.getChildByName("Label").getComponent(Label).string = prizeData.name + "\n" + "X" + total;
            item.active = true;
            item.parent = this._itemContent;
        }
    }
    // 清除content
    clearContent() {
        console.log("清除content");
        let content = find("ScrollView/view/content", this.node);
        while (content.children.length) {
            let child = this._itemContent.children[0];
            child.removeFromParent();
            plm.putToPool("PrizeHallItem", child);
        };
    }

}

