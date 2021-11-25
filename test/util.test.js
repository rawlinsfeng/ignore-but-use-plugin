// import { dateForm } from './date.test.js'

export const route = [{
  path: '/route',
  router: [{
    path: '/child',
    component: 'test.vue'
  }]
}]
const fn = () => {
  console.log('fn')
}
// console.log('dateForm', dateForm)