
import { debug } from 'cc';
import axios from '../Libs/Axios/axios.js';

const request = axios.create({
    baseURL: "http://127.0.0.1:4523/m1/779001-0-default/api/pad/",
    timeout: 5000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
});

// 请求拦截
request.interceptors.request.use(
    config => {
        return config
    },
    error => {
        debug(error)
        Promise.reject(error)
    }
)


// 响应拦截预处理
request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.errno !== 0) {
            // 非5xx的错误属于业务错误，留给具体页面处理
            return Promise.reject(response)
        } else {
            return response
        }
    }, error => {
        console.log('err' + error)// for debug
        return Promise.reject(error)
    }
)

export default request;