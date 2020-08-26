const session = require('koa-generic-session');
const koaRedis = require('koa-redis');
const redis = require('redis')
const Koa = require('koa');

// 注意: client默认是异步callback方式调用;
// store.client是经过了co-redis包装,返回Promise, 在koa里面用yield异步编程比较方便
const client = redis.createClient(6379,'192.168.9.131');
const app = new Koa();

let server = app.listen(5000);

let options = {client: client, db: 1}
var store = koaRedis(options);
app.use(session({
  store
}));

app.use(function *(params) {
  console.log('this.query:',this.query)
   switch (this.path) {
      case '/get':
        get.call(this);
        break;

      case '/testKV':
        // 保存key value
        if (this.query.adminId) {
          yield store.client.set("test1", this.query.adminId);
        }
        //同步读取key value
        this.body = yield store.client.get("test1");
        break;

      case '/testHM':
      //操作hashmap
      var result = yield store.client.hmset("hosts", "mjr", "123", "another", "23", "home", "1234");
      console.log(result);

      var obj = yield store.client.hgetall("hosts")
      console.dir(obj);
      //获取hashmap key的值
      this.body = yield store.client.hget("hosts", "home");

      //保存hashmap,使用默认的callback方式
      // client.hset("hash key", "hashtest 1", "some value", redis.print);
      // client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
      // client.hmset("hosts", "mjr", "1", "another", "23", "home", "1234");
      // client.hmset(["key", "test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res) {
      // console.log(res);
      // });

      break;
      case '/testSet':
        //保存set
        var key = "key1";
        store.client.sadd("key1", "v1");
        store.client.sadd("key1", "v2");
        store.client.sadd("key1", "v3");

        //读取set
        store.client.multi()
          .sismember(key, 'v1')
          .smembers(key)
          .exec(function (err, replies) {
          console.log("MULTI got " + replies.length + " replies");
          replies.forEach(function (reply, index) {
            console.log("Reply " + index + ": " + reply.toString());
          });
        })
        //读取set
        this.body = yield store.client.smembers("key1");
        break;
      case '/testList':
        //保存list
        store.client.rpush("mylist", "bbb")
        store.client.rpush("mylist", "ccc")
        store.client.lpush("mylist", "aaa")

        this.body = yield store.client.rpop("mylist");
        break;
        case '/remove':
        remove.call(this);
        break;
        case '/regenerate':
        yield regenerate.call(this);
        break;
   }
})


function get() {
  var session = this.session;
  session.count = session.count || 0;
  session.count++;
  var test = store.client.get("test");
  console.log(111,test);
  this.body = session.count;
}

function remove() {
  this.session = null;
  this.body = 0;
}

function *regenerate() {
  get.call(this);
  yield this.regenerateSession();
  get.call(this);
}
  

