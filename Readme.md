# Readme

微信小游戏开发数据域原生写法示例，提供基本的渲染和滑动指令。

使用方法：将openData目录作为开发数据域目录，根据需要修改数据集合以及Item类的渲染方法。上层调用和渲染参考[RankList.js](./sample/RankList.js)



新增Laya原生微信排行榜

注意：主域使用Texture2D来渲染
        this.texture2D.loadImageSource(this.sharedCanvas, true);
        if (this.textureDraw) {
            this.textureDraw.destroy();
        }
        this.textureDraw = new Laya.Texture(this.texture2D);
        this.sharedSprite.graphics.drawTexture(this.textureDraw, 0, 0, this.textureDraw.width, this.textureDraw.height);



