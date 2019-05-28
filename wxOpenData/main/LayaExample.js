//参考主域代码。example.js
    private sharedSprite: Laya.Sprite;// 画布容器
    private texture2D: Laya.Texture2D;
    private textureDraw: Laya.Texture;
    private sharedCanvas: any;
    //624 = 160 （270） + 136 （216） + 92 + 120 + 116
    private topOffset: number = 160 + 92 + 8;
    private bottomOffset: number = 22 + 120 + 136;
    private isPveVisible: boolean = false;

    initWxOpen(): void {
        if (!Laya.Browser.window.wx) return;

        this.btnFriend.visible = true;
        var openDataContext = Laya.Browser.window.wx.getOpenDataContext();
        this.sharedCanvas = openDataContext.canvas;
        if (!(this.sharedCanvas.hasOwnProperty('_addReference'))) {
            this.sharedCanvas['_addReference'] = function () { };
        }

        if (!this.sharedSprite) {
            this.sharedSprite = new Laya.Sprite();
        }
        this.sharedSprite.visible = false;
        Laya.stage.addChild(this.sharedSprite);

        if (!this.texture2D) {
            this.texture2D = new Laya.Texture2D();
        }
        this.postMsg({
            command: 'Init',
            dataPath: Laya.Browser.window.wx.env.USER_DATA_PATH + "/cache/",
            tabIndex: this.leftTabIndex
        });
    }

    showWxOpen(): void {
        if (!Laya.Browser.window.wx) return;
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.postMsg({
            command: 'RankInit',
            dataPath: Laya.Browser.window.wx.env.USER_DATA_PATH + "/cache/",
            tabIndex: this.leftTabIndex
        });
        setTimeout(() => {
            this.updateWxOpen();
            this.sharedSprite.visible = true;
        }, 500);
    }

    hideWxOpen(): void {
        this.sharedSprite.visible = false;
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.postMsg({
            command: 'Hide'
        });
    }

    updateWxOpen(): void {
        this.texture2D.loadImageSource(this.sharedCanvas, true);
        if (this.textureDraw) {
            this.textureDraw.destroy();
        }
        this.textureDraw = new Laya.Texture(this.texture2D);
        this.sharedSprite.graphics.drawTexture(this.textureDraw, 0, 0, this.textureDraw.width, this.textureDraw.height);
    }

    /**按下事件处理*/
    onMouseDown(e: Event): void {
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        this.postMsg({
            command: 'TouchDown',
            mouseY: Laya.stage.mouseY,
        });
    }

    /**移到事件处理*/
    onMouseMove(e: Event): void {
        this.postMsg({
            command: 'TouchMove',
            mouseY: Laya.stage.mouseY,
        });
        this.updateWxOpen();
    }

    /**抬起事件处理*/
    onMouseUp(e: Event): void {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        this.postMsg({
            command: 'TouchUp',
            mouseY: Laya.stage.mouseY,
        });
    }

    /**向公开域发送消息*/
    postMsg(msg: any) {
        if (Laya.Browser.window.wx)
            Laya.Browser.window.wx.postMessage(msg);
    }

    refresh(isRankView: boolean): void {
        if (!isRankView && this.rightTabIndex == 0) {
            this.onRightBtnChangeTab(1);
        }
        this.setSharedCanvasSize(isRankView);
    }

    setSharedCanvasSize(isRankView: boolean): void {
        if (!this.sharedCanvas) return;
        if (isRankView) {
            this.sharedCanvas.width = Laya.stage.width;
            this.sharedCanvas.height = Laya.stage.height - this.topOffset - this.bottomOffset - (Global.isIPhoneX ? 190 : 0);
            this.sharedSprite.pos(0, this.topOffset + (Global.isIPhoneX ? 112 : 0));
            this.sharedSprite.size(this.sharedCanvas.width, this.sharedCanvas.height);
        } else {
            this.sharedCanvas.width = Laya.stage.width;
            this.sharedCanvas.height = Laya.stage.height - 160 - 136 - (Global.isIPhoneX ? 190 : 0);
            this.sharedSprite.pos(0, 160 + (Global.isIPhoneX ? 112 : 0));
            this.sharedSprite.size(this.sharedCanvas.width, this.sharedCanvas.height);
        }
    }

    setPveSharedSpriteState(isVisible: boolean): void {
        this.isPveVisible = isVisible;
        this.sharedSprite.visible = isVisible;
        this.updateWxOpen();
    }