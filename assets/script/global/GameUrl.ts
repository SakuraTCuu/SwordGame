export { gUrl };

class GameUrl {
    // curUrl = "http://47.97.222.77:3001";
    // curUrl = "http://localhost:30001";
    // curUrl = "http://123.60.190.86";
    curUrl = "https://www.xiulegexian.com:8083";
    list: any = {};
    constructor() {
        this.initUrl(); //配置游戏访问具体路径
    }
    //配置游访问具体路径
    initUrl() {
        // this.list.login = this.curUrl + "/game/toBeImmortal/login"; //获取服务端记录
        // this.list.getPrize = this.curUrl + "/game/toBeImmortal/prize"; //推送记录到服务端

        this.list.register = this.curUrl + "/xiuXian/player/registry";
        this.list.login = this.curUrl + "/xiuXian/player/login";
        this.list.savingData = this.curUrl + "/xiuXian/player/syncAccountMetadata";
        this.list.adClickCount = this.curUrl + "/xiuXian/statistics/adClick";
    };
    //展示所有接口路径
    showAllUrl() {
        for (const key in this.list) {
            if (Object.hasOwnProperty.call(this.list, key)) {
                const url = this.list[key];
                console.log("key:", key);
                console.log("url:", url);
            };
        };
    };
};

const gUrl = new GameUrl();
