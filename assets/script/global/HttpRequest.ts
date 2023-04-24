import { sys } from "cc";
import { ggd } from "./globalData";


/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-10-27 15:38:10
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-27 17:14:25
 * @FilePath: \copy9train\assets\script\global\HttpRequest.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
export { hr }
class HttpRequest {
    constructor() {
        // console.log("创建http请求");
    }
    get(url, params, cb, eb = null, tb = null) {
        var xhr = new XMLHttpRequest();

        var data = params;
        let param = '?';
        for (var key in data) {
            var paramStr = key + "=" + data[key];
            // if (param == "") param += paramStr;
            if (param == "?") param += paramStr;
            else param += "&" + paramStr;
        };
        console.log("get:请求路径", url + param);
        xhr.open("GET", url + param);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        // xhr.setRequestHeader("Authorization", "Bearer "+token);
        this.xhrBindCallback(xhr, cb, eb, tb);
        xhr.send();
    };
    post(url, params, cb, eb = null, tb = null) {
        if (typeof (params) !== "object") {
            return console.log("参数不是对象 传输错误");
        };
        var xhr = new XMLHttpRequest();
        // console.log("post:请求路径", url);
        xhr.open("POST", url);
        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        this.setRequestHeader(xhr);

        this.xhrBindCallback(xhr, cb, eb, tb);
        // console.log(params);
        xhr.send(JSON.stringify(params));
    };
    setRequestHeader(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("version", 101);
        xhr.setRequestHeader("nonce", Date.now());
        let imei = ggd.phoneInfo.imei;
        if (imei) xhr.setRequestHeader("imei", imei);
        else {
            let imei = sys.localStorage.getItem("imei");
            if (imei) xhr.setRequestHeader("imei", imei);
            else {
                imei = this.randomCreateImei();
                sys.localStorage.setItem("imei", imei);
                xhr.setRequestHeader("imei", imei);
            }
        }

        if (sys.os == "Android") xhr.setRequestHeader("os", "ANDROID");
        else if (sys.os == "iOS") xhr.setRequestHeader("os", "IOS");
        else xhr.setRequestHeader("os", "PC");
        if (ggd.userInfo.token) xhr.setRequestHeader("Authorization", "Bearer " + ggd.userInfo.token);

    }
    //获取随机imei
    randomCreateImei() {
        var s = [];
        var randomImei;
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        randomImei = s.join("");
        return randomImei;
    }
    //xhr绑定回掉函数 
    xhrBindCallback(xhr, cpCb, errCb, toCb) {
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status >= 200 && xhr.status <= 207) {
                // console.log("xhr.responseText",xhr.responseText);
                let response = JSON.parse(xhr.responseText);
                if (cpCb) cpCb(response);
                else this.runDefaultCompleteCallback(response);
            } else {
                console.log("xhr.status", xhr.status);
            };
        };
        xhr.onerror = () => {
            if (xhr.readyState == 1 && xhr.status == 0) {
                if (errCb) errCb("断网");
                else this.runDefaultErrorCallback("断网"); // 断网
            } else {
                if (errCb) errCb("未知错误");
                else this.runDefaultErrorCallback("未知错误"); // 断网
            }
        };
        xhr.timeout = 60000;
        xhr.ontimeout = (e) => {
            if (toCb) toCb(e);
            else this.runDefaultTimeoutCallback(e);
        };
    };
    //运行默认 completeCallback
    runDefaultCompleteCallback(response) {
        console.log("run Default Complete Callback");
        console.log("response", response);
    };
    //运行默认 errorCallback
    runDefaultErrorCallback(string) {
        console.log("run Default Error Callback");
        console.log("string", string);
    };
    //运行默认 ontimeoutCallback
    runDefaultTimeoutCallback(e) {
        console.log("run default timeout callback");
        console.log("e", e);
    };
};

const hr = new HttpRequest();