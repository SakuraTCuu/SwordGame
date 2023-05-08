import { _decorator, Component, Node, find, instantiate, Sprite, Label, NodePool } from 'cc';
import { plm } from '../../global/PoolManager';
import { Api } from '../../Api';
;
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
    async sendPrizeRequest() {
        // let url = Constant.URL.GetPrize;

        // hr.get(url, { cdk: this._curCdkeySting }, (response) => {
        //     console.log("response", response);
        //     if (response.successful) {
        //         console.log("添加领取奖励效果 还没写");
        //         em.dispatch("tipsViewShow", "领取奖励成功");
        //         this.distributePrizes(response.data);
        //     } else {
        //         em.dispatch("tipsViewShow", "cdk错误或已失效，领取失败。");
        //     }
        // });

        let result = await Api.cdkExchange(this._curCdkeySting);
        console.log("sendPrizeRequest: ", result);

        //TODO: 后续逻辑处理
    }

    //分发奖励
    distributePrizes(data) {
        this.clearContent();
        console.log("get prizes", data);
        for (let i = 0; i < data.prize.length; i++) {
            let prize = data.prize[i];
            let total = data.total[i];
            let prizeData = app.bag.getItemDataByIdOrName(prize);

            app.bag.addItemToBag(prize, total);

            let item = plm.getFromPool("PrizeHallItem");
            item.parent = this._itemContent;
            let sprite = item.getChildByName("Sprite").getComponent(Sprite);

            let loadUrl = "images/items/" + prizeData.loadUrl + "/spriteFrame";

            app.loader.load('resources', loadUrl, (err, assets) => {
                if (err) {
                    console.log(err);
                    return;
                }
                sprite.spriteFrame = assets
            });

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

