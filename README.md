<p align="center">
   <br>
   <img width="100" src="https://gitee.com/coco-central/boxy/raw/master/src/icon/logo/boxy.svg" alt="Boxy-logo"/>
</p>

<h1 align="center">
   Boxy
</h1>

<div align="center">

<!-- [![star](https://gitee.com/coco-central/boxy/badge/star.svg?theme=dark)](https://gitee.com/coco-central/boxy/stargazers)
[![fork](https://gitee.com/coco-central/boxy/badge/fork.svg?theme=dark)](https://gitee.com/coco-central/boxy/members) -->

</div>

#### 介绍

Boxy 是 Google Blockly 的一个应用实例，
对 Blockly 进行了基本的配置，
你可以用它快速地进行 Blockly 开发。

#### 安装

1. **环境检查： 确保你的电脑已经安装了最新版本的 Node.js。**
   Boxy 是纯客户端 Web 应用，
   仅使用 Node.js 进行自动化处理。

2. **克隆仓库：将本仓库克隆到本地。**

   ```
   git clone https://gitee.com/coco-central/boxy.git
   ```

3. **环境配置：配置本地开发环境。**

   ```
   cd boxy
   ```

   ```
   npm install
   ```

4. **构建：WebPack 项目构建。**

   ```
   npm run build
   ```

#### 开发

- **运行：搭建本地服务。**
如果你的开发工具没有能力建立本地服务，请使用此命令。

   ```
   npm run start
   ```

- **守候：自动检测文件更改，并重新编译。**
如果你的开发工具可以建立本地服务，请使用此命令。
生成的内容在 `http://localhost:8000/dist/index.html` 中。

   ```
   npm run watch
   ```