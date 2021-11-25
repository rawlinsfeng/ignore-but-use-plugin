import { route } from './util.test'
import { testDemo } from './index.test'
import { demo111 } from './demo.test'

console.log('test8888', demo111)
console.log('test77777', testDemo)

let cc = route;
let ace = 'test-tool';
let a =1
console.log('6666', ace, a)
for (let index = 0; index < route.length; index++) {
  console.log('>>>>>>', route[index].path + demo111)
}
console.log('cc======', cc.length)