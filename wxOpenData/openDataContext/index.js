const Cache = require("./Cache");

const imgCache = new Cache((img) => img.src = "");
const canvasCache = new Cache((canv) => canv.destroy());  //todo:canvas destroy销毁不了

const ITEM_WIDTH = 750;
const ITEM_HEIGHT = 116;
const ITEM_SPACINGY = 6;
const MAX_ITEM_NUM = 100; //排行榜显示最大排名
const DESC_CONFIG = {
    "1": "新手竞技场",
    "2": "青铜竞技场",
    "3": "白银竞技场",
    "4": "黄金竞技场",
    "5": "铂金竞技场",
    "6": "钻石竞技场",
    "7": "大师竞技场",
    "8": "宗师竞技场",
    "9": "王者竞技场",
    "10": "巅峰竞技场",
    "99": "第*关",
    "100": "未上榜"
};
const IMG_RES = [
    'ui/rankList/bar_black.png',
    'ui/rankList/bar_class.png',
    'ui/rankList/bar_player_my_bottom.png',
    'ui/rankList/bar_player_my.png',
    'ui/rankList/bar_player.png',
    'ui/rankList/head_portrait_small.png',
    'ui/rankList/icon_cup.png',
    'ui/rankList/icon_rank_1.png',
    'ui/rankList/icon_rank_2.png',
    'ui/rankList/icon_rank_3.png',
    'ui/rankList/icon_star.png',
    'ui/rankList/iconFemale.png',
    'ui/rankList/iconmale.png',
    'ui/rankList/frame_pve.png'
];
var dataPath;

class Item {

    //itemType: 0-排行榜item 1-排行榜底部item 2-pveItem
    constructor(info, itemType) {
        this.itemType = itemType;
        this.initCanvas(info);
        this.context = this.canvas.getContext("2d");
        this.context.baseLine = "middle";
        this.info = info;
        this.rendered = false;
        this.loadAvatar().then((img) => this.draw(img)).catch(err => console.warn(err));
    }

    initCanvas(info) {
        switch (this.itemType) {
            case 0:
                this.canvas = canvasCache.get(info.rank - 1)
                this.canvas.width = ITEM_WIDTH;
                this.canvas.height = ITEM_HEIGHT;
                break;
            case 1:
                this.canvas = canvasCache.get(100)
                this.canvas.width = ITEM_WIDTH;
                this.canvas.height = 120;
                break;
            case 2:
                this.canvas = canvasCache.get(info.rank - 1)
                this.canvas.width = 72;
                this.canvas.height = 78;
                break;
        }
    }

    refresh(info, itemType) {
        this.itemType = itemType;
        this.info = info;
        this.loadAvatar().then((img) => this.draw(img)).catch(err => console.warn(err));
    }

    getImg(index) {
        let key = dataPath + IMG_RES[index]
        return imgCache.get(key)
    }

    //背景
    drawBg() {
        if (this.itemType == 1) {
            this.context.drawImage(this.getImg(2), 0, 0, 706, 120);
        } else if (this.info.isOwn) {
            this.context.drawImage(this.getImg(3), 0, 0, 718, 116);
        } else {
            this.context.drawImage(this.getImg(4), 0, 0, 718, 116);
        }
    }

    //名次
    drawRank() {
        if (this.itemType == 1) {
            if (this.info.rank == 0) {
                this.drawText(DESC_CONFIG['100'], 75, 30 + 40, 32, '#ffffff');
            } else if (this.info.rank >= 1 && this.info.rank <= 3) {
                let imgIndex = this.info.rank + 6
                this.context.drawImage(this.getImg(imgIndex), 22, 12, 104, 86);
            } else {
                this.drawText(this.info.rank, 75, 30 + 40, 50, '#ffffff');
            }
        } else {
            if (this.info.rank <= 3) {
                let imgIndex = this.info.rank + 6
                this.context.drawImage(this.getImg(imgIndex), 22, 12, 104, 86);
            } else {
                this.drawText(this.info.rank, 75, 30 + 40, 50, '#000000');
            }
        }
    }

    loadAvatar() {
        return new Promise((resolve, reject) => {
            let iurl = this.info.avatarUrl;
            if (!this.info.avatarUrl.startsWith('http')) {
                iurl = dataPath + "ui/rankList/" + iurl;
            }
            if (imgCache.get(iurl)) {
                resolve(imgCache.get(iurl));
                return;
            }
            const img = wx.createImage();
            img.src = iurl;
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject(`${iurl}加载失败`);
            };
            imgCache.put(iurl, img);
        });
    }

    //头像
    drawHead(avatarImg) {
        this.context.drawImage(avatarImg, 171, 21, 72, 72);
        this.context.drawImage(this.getImg(5), 166, 16, 80, 80);
    }

    //性别
    drawSex() {
        //性别
        if (this.info.sex == 0) {
            this.context.drawImage(this.getImg(11), 170, 20, 22, 22);
        } else {
            this.context.drawImage(this.getImg(12), 170, 20, 22, 22);
        }
    }

    //等级背景
    drawLevelBg() {
        this.context.drawImage(this.getImg(1), 219, 69, 30, 30);
    }

    //星数 或者 杯数
    drawStarOrCup() {
        this.context.drawImage(this.getImg(0), 504, 36, 176, 40);
        if (renderer.tabIndex == 0) {
            this.context.drawImage(this.getImg(10), 512, 30, 46, 46);
        } else {
            this.context.drawImage(this.getImg(6), 512, 26, 52, 52);
        }
    }

    drawTexts() {
        this.drawText(this.info.level, 234, 75 + 15, 18, '#000000');
        if (this.itemType == 1) {
            this.drawText(this.info.name, 266, 18 + 20, 28, '#ffffff', 'left');
        } else {
            this.drawText(this.info.name, 266, 18 + 20, 28, '#000000', 'left');
        }
        this.drawText(this.info.desc, 266, 60 + 20, 22, '#979797', 'left');
        this.drawText(this.info.score, 608, 41 + 25, 28, '#FFFFFF', undefined, false);
    }

    drawText(text, x, y, fontSize, color, align, isBold = true) {
        if (isBold) {
            this.context.font = `bold ${fontSize}px Arial`;
        } else {
            this.context.font = `${fontSize}px Arial`;
        }
        this.context.fillStyle = color || "000000";
        this.context.textAlign = align || "center";
        this.context.fillText(text, x, y, 210);
    }

    draw(avatarImg) {
        this.clear();
        if (this.itemType == 2) {
            this.context.drawImage(avatarImg, 5, 5, 62, 62);
            this.context.drawImage(this.getImg(13), 0, 0, 72, 78);
        } else {
            this.drawBg();
            this.drawRank();
            this.drawHead(avatarImg);
            this.drawSex();
            this.drawLevelBg();
            this.drawStarOrCup();
            this.drawTexts();
        }
        this.rendered = true;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

class RankListRenderer {

    constructor() {
        this.init();
    }

    init() {
        this.canvas = wx.getSharedCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    initRes() {
        //生成item canvas缓存池
        for (var i = 0; i < 101; i++) {
            let canvas = wx.createCanvas();
            canvasCache.add(canvas);
        }
        this.resReadyPromise(IMG_RES).then((imgs) => this.promiseDone(imgs)).catch(err => console.warn(err));
    }

    initUI(rankType) {
        this.clear();
        this.rankType = rankType;//0:好友排行 1:pve排行
        this.mouseStartY = 0;
        this.mouseMoveY = 0;
        this.deltaY = 0;
        this.lastDeltaY = 0;
        this.ownInfo = undefined;
        this.ownItem = undefined;
        this.isRefresh = false; //拖动的时候刷新显示
        this.tabIndex = 0;      //0:星数排行 1:杯数排行
        this.bottomMax = 0;     //拖动下限

        this.initData();
        this.startRender();
    }

    initData() {
        wx.getFriendCloudStorage({
            keyList: [
                "exp",      //当前关卡
                "curArena", //当前竞技场
                "cups",     //杯数
                "curLevel", //当前关卡
                "stars",    //星数
                "sex"       //性别
            ],
            success: (res) => {
                this.details = [];
                for (const info of res.data) {
                    const detailItem = {};
                    detailItem.playerID = info.openid;
                    detailItem.avatar = info.avatarUrl;
                    detailItem.name = info.nickname;
                    let kvList = info.KVDataList;
                    detailItem.exp = +kvList[0]["value"];
                    detailItem.curArena = +kvList[1]["value"];
                    detailItem.cups = +kvList[2]["value"];
                    detailItem.curLevel = +kvList[3]["value"];
                    detailItem.stars = +kvList[4]["value"];
                    detailItem.sex = +kvList[5]["value"];
                    this.details.push(detailItem);
                }
                if (this.rankType == 0) {
                    this.refreshItems0();
                } else {
                    this.refreshItems1();
                }
            },
            fail: (err) => {
                console.log('获取排行榜失败：', err);
            }
        });
    }

    promiseDone(imgs) {
        //背景设置
        //this.ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        //this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }

    //等待所有资源就绪
    resReadyPromise(imgs) {
        return Promise.all(imgs.map(path => this.imgReadyPromise(path)));
    }

    imgReadyPromise(imgUrl) {
        return new Promise((resolve, reject) => {
            let iurl = dataPath + imgUrl
            if (imgCache.get(iurl)) {
                resolve(imgCache.get(iurl));
                return;
            }
            const img = wx.createImage();
            img.src = iurl;
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject(`${iurl}加载失败`);
            };
            imgCache.put(iurl, img);
        });
    }

    hide() {
        this.mouseStartY = 0;
        this.mouseMoveY = 0;
        this.deltaY = 0;
        this.lastDeltaY = 0;
        this.ownInfo = undefined;
        this.isRefresh = false;
        this.tabIndex = 0;
        this.details = undefined;

        if (this.ownItem != undefined) {
            this.ownItem.clear();
            this.ownItem = undefined;
        }
        if (this.items != undefined) {
            for (const item of this.items) {
                item.clear();
            }
            this.items = undefined;
        }

        this.stopRender();
        this.clear();
    }

    destroy() {
        this.hide();
        //todo:不销毁，常驻
        //imgCache.clear();
        //canvasCache.clear();
    }

    startRender() {
        this.stopRender();
        //开启每帧回调
        const fn = () => {
            if (this.isRender()) {
                this.render();
            }
            this._updateHandler = requestAnimationFrame(fn)
        }
        this._updateHandler = requestAnimationFrame(fn);
    }

    stopRender() {
        if (this._updateHandler) {
            cancelAnimationFrame(this._updateHandler);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    scroll(mouseY) {
        this.mouseMoveY = mouseY - this.mouseStartY;
        if ((this.lastDeltaY + this.mouseMoveY) > 0) {
            this.mouseMoveY = 0;
            this.lastDeltaY = 0;
        }
        if (this.lastDeltaY + this.mouseMoveY < this.bottomMax) {
            this.mouseMoveY = 0;
        }
        this.deltaY = this.mouseMoveY + this.lastDeltaY;
    }

    scrollPve(deltaY) {
        this.deltaY = deltaY;
    }

    isRender() {
        return this.isRefresh && this.items && this.render
    }

    render() {
        this.clear();
        if (this.rankType == 0) {
            let i = 0;
            for (const item of this.items) {
                item.setPosition(10, this.deltaY + i * (ITEM_HEIGHT + ITEM_SPACINGY));
                i++;
            }
            this.items.forEach((item) => this.renderItem(item));
        } else {
            let i = 0;
            for (const item of this.items) {
                i = item.info.curLevel - 1;
                item.setPosition(122 + 175 * (i % 4), 60 + 208 * Math.floor((i / 4)) - this.deltaY);
            }
            this.items.forEach((item) => this.renderItemPve(item));
        }
    }

    renderItem(item) {
        if (!this.isItemVisible(item)) {
            return;
        }
        this.ctx.drawImage(item.canvas, item.x + 7, item.y);
        //渲染底部自己
        if (this.ownItem != undefined) {
            this.ctx.drawImage(this.ownItem.canvas, 22, this.canvas.height - 120);
        }
    }

    renderItemPve(item) {
        if (!this.isItemVisible(item)) {
            return;
        }
        this.ctx.drawImage(item.canvas, item.x, item.y);
    }

    isItemVisible(item) {
        if (!item.rendered) {
            return false;
        }
        if (item.y >= this.canvas.height || item.y <= -ITEM_HEIGHT) {
            return false;
        } else {
            return true;
        }
    }

    getDesc(info) {
        if (this.tabIndex == 0) {
            return DESC_CONFIG["99"].replace("*", info.curLevel.toString());
        } else {
            let key = (info.curArena > 0 ? info.curArena : 1).toString()
            return DESC_CONFIG[key];
        }
    }

    //界面排行显示信息
    getRankInfo(info, rank) {
        return {
            id: info.playerID,
            name: info.name,
            score: (this.tabIndex == 0 ? info.stars : info.cups),
            avatarUrl: info.avatar,
            rank: rank,
            level: info.exp,
            desc: this.getDesc(info),
        };
    }

    refreshItems0() {
        if (this.details == undefined) return;

        this.items = [];
        //分类排序信息
        if (this.tabIndex == 0) {
            this.details.sort((a, b) => b.stars - a.stars);
        } else {
            this.details.sort((a, b) => b.cups - a.cups);
        }
        let sliceNum = this.details.length;
        if (sliceNum > MAX_ITEM_NUM) {
            sliceNum = MAX_ITEM_NUM;
        }
        let infos = this.details.slice(0, sliceNum);
        //排行信息
        let rank = 0;
        for (const info of infos) {
            ++rank;
            let newInfo = this.getRankInfo(info, rank);
            //设置自己的排名
            if (this.ownInfo && this.ownInfo.avatar === newInfo.avatarUrl) {
                newInfo.isOwn = true;
                this.ownInfo = newInfo;
            }
            if (this.items[rank - 1]) {
                this.items[rank - 1].refresh(newInfo, 0);
            } else {
                const item = new Item(newInfo, 0);
                this.items.push(item);
            }
        }
        //底部自己信息
        if (this.ownInfo != undefined) {
            if (this.ownItem == undefined) {
                this.ownItem = new Item(this.ownInfo, 1)
            } else {
                this.ownItem.refresh(this.ownInfo, 1);
            }
        }
        this.bottomMax = -(this.items.length - 5) * (ITEM_HEIGHT + ITEM_SPACINGY)
        //刷新
        this.isRefresh = true;
        setTimeout(() => {
            this.isRefresh = false;
        }, 400);
    }

    refreshItems1() {
        if (this.details == undefined) return;

        this.items = [];
        this.details.sort((a, b) => b.exp - a.exp);
        let levels = [];
        let rank = 0;
        for (const info of this.details) {
            //相同关卡有多个人，剔除等级低的
            if (levels.indexOf(info.curLevel) == -1) {
                levels.push(info.curLevel);
                ++rank;
                const item = new Item({
                    avatarUrl: info.avatar,
                    rank: rank,
                    curLevel: info.curLevel
                }, 2);
                this.items.push(item);
            }
        }
        //刷新
        this.isRefresh = true;
    }

    listen() {
        wx.onMessage(data => {
            switch (data.command) {
                case 'Init':
                    dataPath = data.dataPath;
                    this.tabIndex = data.tabIndex;
                    this.initRes();
                    break;
                case 'RankInit':
                    dataPath = data.dataPath;
                    this.tabIndex = data.tabIndex;
                    this.initUI(0);
                    break;
                case 'TabChange':
                    this.tabIndex = data.tabIndex;
                    this.ownInfo = data.ownInfo;
                    this.refreshItems0();
                    break;
                case 'TouchDown':
                    this.mouseStartY = data.mouseY;
                    this.isRefresh = true;
                    break;
                case 'TouchUp':
                    this.lastDeltaY = this.lastDeltaY + this.mouseMoveY;
                    this.isRefresh = false;
                    break;
                case 'TouchMove':
                    this.scroll(data.mouseY);
                    break;
                case 'Hide':
                    this.hide();
                    break;
                case 'Destroy':
                    this.destroy();
                    break;
                case 'PVEInit':
                    this.initUI(1);
                    break;
                case 'PVEHide':
                    this.hide();
                    this.isRefresh = false;
                    break;
                case 'PVEMove':
                    this.scrollPve(data.yPos);
                    break;
            }
        });
    }
}

const renderer = new RankListRenderer();
renderer.listen();