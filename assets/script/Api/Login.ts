import { Constant } from '../Common/Constant'
import request from './Request'

export function test(id) {
  return request({
    url: '/v1/reports',
    method: 'get',
    params: {
      report_id: id
    }
  })
}

export function loginByUsername(username, password) {
  return request({
    url: Constant.URL.Login,
    method: 'post',
    params: {
      username,
      password,
    }
  })
}

export function registerByUserName(username, password) {
  return request({
    url: Constant.URL.Register,
    method: 'post',
    params: {
      username,
      password,
    }
  })
}