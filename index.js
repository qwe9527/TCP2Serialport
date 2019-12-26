const SerialPort = require("serialport");
const net = require('net');

let com = 'COM3';
let localPort = undefined;
let host = '192.168.31.136';
let port = '8080';

const client = new net.Socket();
let timer;

const parseArgv = (argv) => {
  argv.forEach(value => {
    if (/com=(\S+)/g.test(value)) {
      com = RegExp.$1;
    } else if (/port=(\d+)/g.test(value)) {
      port = RegExp.$1;
    } else if (/localPort=(\d+)/g.test(value)) {
      localPort = parseInt(RegExp.$1);
    } else if (/host=(\S+)/g.test(value)) {
      host = RegExp.$1;
    }
  });
};

parseArgv(process.argv.slice(2));

console.log("localPort: ", localPort);
console.log('Server ip: ' + host + ' port: ' + port);

// 时间格式化
const formatDate = (dateOrg) => {
  const date = dateOrg || (new Date());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const serialPort = new SerialPort(com, {
  autoOpen: false
});

serialPort.open(function (error) {
  if (error) {
    console.log('failed to open serial: ' + error);
  }
  else {
    console.log('open serial success,' + com);
  }
});

const connectTcp = () => {
  client.connect({
    port,
    host,
    localPort
  });
};

connectTcp();

// data是串口返回的数据
serialPort.on('data', function (data) {
  console.log('\n' + formatDate() + 'serialport data：' + '\n' + data.toString('hex'));
  client.write(data);
});

// tcp连接事件
client.on('connect', () => {
  console.log('Connected to: ' + host + ':' + port);
});

// 为tcp客户端添加“data”事件处理函数
// data是服务器发回的数据
client.on('data', function (data) {
  let hexstr = new Buffer(data);
  hexstr = hexstr.toString("hex");
  console.log('\n ' + formatDate() + 'tcp data: ' + '\n' + hexstr);
  serialPort.write(data, () => { });
});

// 为tcp客户端添加“close”事件处理函数
client.on('close', function () {
  console.log('Remote Connection closed');
  client.destroy();
  console.log('try connect TCP aggin after 10s');
  clearTimeout(timer);
  timer = setTimeout(() => {
    connectTcp();
  }, 10000);
});

//捕获异常，防止崩溃
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:' + err);
});