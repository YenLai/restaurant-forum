### 餐廳評論網

此專案為全端開發專案，部署在Heroku，同時提供API供前端呼叫。
使用 express 框架搭配 express-handlebars 模板引擎渲染前端畫面。
:point_right: [全端開發專案](https://express-restaurant-forum.herokuapp.com/signin)
:point_right: [前後分離專案](https://github.com/YenLai/restaurant-forum-vue)（Vue）

### 專案畫面
![1](https://i.imgur.com/EB5ovTg.png)
![2](https://i.imgur.com/BCRoH3y.png)

### 安裝＆使用

**下載專案**
```
git clone https://github.com/YenLai/restaurant-forum.git 
```
**下載套件**
```
npm install
npm install nodemon
```
**建立 MySQL Connection(請在 WorkBench 裡操作 SQL 指令)**
**預設密碼為 password**
```
drop database if exists forum;
create database forum;
```
**建立 Table & Schema & 種子資料**
```
npm run seed
```
**修改環境變數 (請將 .env.example 檔案改為 .env)**
```
IMGUR_CLIENT_ID = 填入您的imgur client ID
```
**執行專案**
```
npm run dev
```
*The server is running on http://localhost:3000*

**測試帳號**
| name | email |  password |
| ------ | ----------- |  -------- |
| root  | `root@example.com` | 12345678 |
| user1 | `user1@example.com` | 12345678 |
| user2 | `user2@example.com` | 12345678 |

### User story
- 必須先註冊帳號才可使用此服務
- 使用者可以瀏覽所有餐廳
- 使用者可以瀏覽餐廳和留言的最新動態
- 使用者可以瀏覽人氣餐廳和使用者
- 使用者可以瀏覽個人或其他使用者頁面
- 使用者可以追蹤喜歡的用戶
- 使用者可以追蹤喜歡的餐廳
- 管理者可以瀏覽所有餐廳、餐廳種類、使用者清單
- 管理者可以刪除、修改餐廳
- 管理者可以刪除、修改餐廳種類
- 管理者可以調整使用者權限

### API
**API URL**
```
https://express-restaurant-forum.herokuapp.com/api
```
[API文件](https://hackmd.io/ZOcy9olYQd2oA_PhCnpALw?view)


### 環境
```
"bcryptjs": "^2.4.3",
"body-parser": "^1.19.0",
"connect-flash": "^0.1.1",
"cors": "^2.8.5",
"dotenv": "^8.2.0",
"express": "^4.17.1",
"express-handlebars": "^4.0.4",
"express-session": "^1.17.1",
"faker": "^4.1.0",
"imgur-node-api": "^0.1.0",
"jsonwebtoken": "^8.5.1",
"method-override": "^3.0.0",
"moment": "^2.27.0",
"multer": "^1.4.2",
"mysql2": "^2.1.0",
"passport": "^0.4.1",
"passport-jwt": "^4.0.0",
"passport-local": "^1.0.0",
"pg": "^8.2.1",
"sequelize": "^6.2.3",
"sequelize-cli": "^6.1.0"
```

