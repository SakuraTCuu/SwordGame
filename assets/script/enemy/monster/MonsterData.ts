//动态生成的怪物数据 无法配置
export { monsterData }
//怪物的队形间距 
const xGap = 100;
const yGap = 100;
//怪物生成地点的单位间隙
const xGap2 = 100;
const yGap2 = 100;
const createFun = {
    //生成 从左向右排列的坐标
    xLine: (p: number, offset: number = 0) => {
        if (p <= 0 || p % 1 != 0 || p % 2 == 0) throw new Error("参数错误 小于1 或为非整数 或为非偶数");
        //奇数
        let total = Math.floor(p / 2);
        let arr = [];
        for (let i = 0; i < p; i++) {
            arr.push([(-total + i) * xGap, offset]);
        };
        return arr;
    },
    // 生成 自下而上排列的坐标
    yLine: (p: number, offset: number = 0) => {
        if (p <= 0 || p % 1 != 0 || p % 2 == 0) throw new Error("参数错误 小于1 或为非整数 或为偶数");
        //奇数
        let total = Math.floor(p / 2);
        let arr = [];
        for (let i = 0; i < p; i++) {
            arr.push([offset, (-total + i) * yGap]);
        };
        return arr;
    },
    triR: (p: number) => {
        if (p <= 0 || p % 1 != 0 || p % 2 == 0) throw new Error("参数错误 小于1 或为非整数 或为非偶数");
        let total = Math.floor(p / 2);
        let arr = [];
        for (let i = 0; i < p; i++) {
            if (i <= total) arr.push([i * xGap, (total - i) * yGap]);
            else arr.push([(p - i - 1) * xGap, (total - i) * yGap]);
        };
        return arr;
    },
    triL: (p: number) => {
        if (p <= 0 || p % 1 != 0 || p % 2 == 0) throw new Error("参数错误 小于1 或为非整数 或为非偶数");
        let total = Math.floor(p / 2);
        let arr = [];
        for (let i = 0; i < p; i++) {
            if (i <= total) arr.push([(total - i) * xGap, (total - i) * yGap]);
            else arr.push([(i - total) * xGap, (total - i) * yGap]);
        };
        return arr;
    },
    triU: (p: number) => {
        if (p <= 0 || p % 1 != 0 || p % 2 == 0) throw new Error("参数错误 小于1 或为非整数 或为非偶数");
        let total = Math.floor(p / 2);
        let arr = [];
        for (let i = 0; i < p; i++) {
            if (i <= total) arr.push([(total - i) * xGap, (total - i) * yGap]);
            else arr.push([(total - i) * xGap, (i - total) * yGap]);
        };
        return arr;
    },

    triD: (p: number) => {
        if (p <= 0 || p % 1 != 0 || p % 2 == 0) throw new Error("参数错误 小于1 或为非整数 或为非偶数");
        let total = Math.floor(p / 2);
        let arr = [];
        for (let i = 0; i < p; i++) {
            if (i <= total) arr.push([(total - i) * xGap, -(total - i) * yGap]);
            else arr.push([(total - i) * xGap, -(i - total) * yGap]);
        };
        return arr;
    },
    circle: (r: number, total: number) => {
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
    circleMore(r, d, monsterTotal, circleTotal) {
        // 1000,100,28,5
        let count = 0;
        let arr = [];
        while (count <= circleTotal) {
            let curR = r + d * count;
            let circleArr = createFun.circle(curR, monsterTotal);
            circleArr.forEach(element => {
                arr.push(element);
            });
            count++;
        }
        // console.log("circleMore",arr);
        return arr;
    },
    heart: (r: number, total: number) => {
        if (total < 20) throw "total过小，无法生成心形方程";
        let unit = 2 * Math.PI / total;
        r /= 16;// X=16(sinθ)³ 推断 x 最大为16；所以对y缩放
        let arr = [];
        while (total) {
            let radian = unit * total;
            let x = 16 * (Math.sin(radian) ** 3);
            let y = 13 * Math.cos(radian) - 5 * Math.cos(2 * radian) - 2 * Math.cos(3 * radian) - Math.cos(4 * radian);
            x *= r;
            y *= r;
            arr.push([x, y]);
            total--;
        }
        return arr;
    },
    rect: (offset: number, total: number) => {
        if (total > 0 && total % 4 !== 0) throw "total 必须是大于0的4的倍数.";
        let singleT = total / 4;
        let arr = [];
        let arr1 = createFun.xLine(singleT, offset);
        let arr2 = createFun.xLine(singleT, -offset);
        let arr3 = createFun.yLine(singleT, offset);
        let arr4 = createFun.yLine(singleT, -offset);
        arr1.forEach(element => arr.push(element));
        arr2.forEach(element => arr.push(element));
        arr3.forEach(element => arr.push(element));
        arr4.forEach(element => arr.push(element));
        return arr;
    }
};
// "queue": [1,2,3,4,5],
// "ratio": [0.2,0.4,0.6,0.8,1]
const monsterData = {
    "monsterMaxTotal": 150,//怪物最大总数
    //x 为行 y 为列 tri 为三角形
    "minGapWithHero1": 150,
    "minGapWithHero2": 5,
    "queueMappingList": {
        "1": "one",
        // "1": "heartR500T40",
        "2": "xL3",
        "3": "xR3",
        "4": "yU3",
        "5": "yD3",

        "6": "xL5",
        "7": "xR5",
        "8": "yU5",
        "9": "yD5",

        "10": "triR5",
        "11": "triL5",
        "12": "circleR1000T20",
        "13": "heartR500T40",

        //怪物潮 队列 easy 9001 - 10000
        9001: "rectO500T12",
        9002: "rectO500T20",
        9003: "rectO500T28",
        9004: "rectO500T36",

        //怪物潮 队列 normal   10001~11000
        10001: "circleR1000T28",
        10002: "heartR500T28",
        10003: "circleR1000T36",
        10004: "heartR500T36",
        10005: "circleR1000T44",
        10006: "heartR500T44",
        10007: "circleR1000T52",
        10008: "heartR500T52",
        10009: "circleR1000T60",
        10010: "heartR500T60",
        //大批怪物来袭 11001~12000
        11001: "circleR1000D100T28X5",
        11002: "circleR1000D80T28X7",
        11003: "circleR1000D60T28X10",

    },
    //阵型
    "queue": {
        // "one": [[0, 0]],
        "one": createFun.xLine(1),
        "xL3": createFun.yLine(3),
        "xR3": createFun.yLine(3),
        "yU3": createFun.xLine(3),
        "yD3": createFun.xLine(3),

        "xL5": createFun.yLine(5),
        "xR5": createFun.yLine(5),
        "yU5": createFun.xLine(5),
        "yD5": createFun.xLine(5),

        "triR5": createFun.triR(5),
        "triL5": createFun.triL(5),
        "triU5": createFun.triU(5),
        "triD5": createFun.triD(5),
        "circleR1000T20": createFun.circle(1000, 20),
        "heartR500T20": createFun.heart(500, 20),

        //怪物潮队列 easy
        "rectO500T12": createFun.rect(500, 12),
        "rectO500T20": createFun.rect(500, 20),
        "rectO500T28": createFun.rect(500, 28),
        "rectO500T36": createFun.rect(500, 36),

        //怪物潮队列 normal
        "circleR1000T28": createFun.circle(1000, 28),
        "heartR500T28": createFun.heart(500, 28),
        "circleR1000T36": createFun.circle(1000, 36),
        "heartR500T36": createFun.heart(500, 36),
        "circleR1000T44": createFun.circle(1000, 44),
        "heartR500T44": createFun.heart(500, 44),
        "circleR1000T52": createFun.circle(1000, 52),
        "heartR500T52": createFun.heart(500, 52),
        "circleR1000T60": createFun.circle(1000, 60),
        "heartR500T60": createFun.heart(500, 60),

        //大批怪物来袭
        "circleR1000D100T28X5": createFun.circleMore(1000, 100, 28, 5),
        "circleR1000D80T28X7": createFun.circleMore(1000, 80, 28, 7),
        "circleR1000D60T28X10": createFun.circleMore(1000, 60, 28, 10),
    },
    // 阵型方向
    "queueDir": {
        "one": null,
        "xL3": { x: -8 * xGap2, y: 0 },
        "xR3": { x: 8 * xGap2, y: 0 },
        "yU3": { x: 0, y: 8 * xGap2 },
        "yD3": { x: 0, y: -8 * xGap2 },

        "xL5": { x: -8 * xGap2, y: 0 },
        "xR5": { x: 8 * xGap2, y: 0 },
        "yU5": { x: 0, y: 8 * yGap2 },
        "yD5": { x: 0, y: -8 * yGap2 },

        "triR5": { x: -8 * xGap2, y: 0 },
        "triL5": { x: 8 * xGap2, y: 0 },
        "triU5": { x: 0, y: 8 * yGap2 },
        "triD5": { x: 0, y: -8 * yGap2 },
        "circleR1000T20": { x: 0, y: 0 },
        "heartR500T40": { x: 0, y: 0 },
    },
    //移动系数 方便调试
    "MSCoefficient": 0.5,
};

