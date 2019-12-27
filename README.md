# quick start
```bash
git clone https://github.com/qwe9527/TCP2Serialport

npm install

npm start -- com=COM3
```
## params
- **com** : SerialPort comName
- **localPort** : TCP client localPort
- **host** : TCP Server host
- **port** : TCP Server port

## examples
```bash
npm start -- com=COM3 localPort=7101 host=192.168.31.231 port=8080
```