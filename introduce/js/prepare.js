var PrepareManager = function(id){
    this.el = $("#" + id);
    this.el.html('<div class="music"></div>' +
    '<section class="content">' +
    '<div class="ball-wrap">' +
    '<div class="left-ball"></div>' +
    '<div class="center-ball-in"></div>' +
    '<div class="center-ball-out"></div>' +
    '<div class="right-ball"></div>' +
    '</div>' +
    '<h1 id="loadingText"><span>L</span><span>o</span><span>a</span><span>d</span><span>i</span><span>n</span><span>g</span><span>.</span><span>.</span><span>.</span></h1>' +
    '<p id="loadingTip" class="ta-c">0%</p>' +
    '</section>');
};

PrepareManager.prototype.prepare = function(downloadQueue, bgmId, callback){
    var $loadingText = $("#loadingText");
    var $loadingTip = $("#loadingTip");
    var $bgm = $("#" + bgmId)[0];
    var that = this;
    function AssetManager(downloadQueue) {
        this.successCount = 0;
        this.errorCount = 0;
        this.downloadQueue = downloadQueue;
    }

    AssetManager.prototype.downloadAll = function(downloadCallback) {
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var path = this.downloadQueue[i];
            var img = new Image();
            var that = this;
            img.addEventListener("load", function() {
                that.successCount += 1;
                if (that.isDone()) {
                    $loadingText.text("Success!");
                    downloadCallback();
                }else{
                    var index = Math.ceil(that.getProcess() / 0.1);
                    for(var i = 0; i < index; i++){
                        $loadingText.find("span").eq(i).css("color", "#0098dd");
                    }
                    $loadingTip.html(Math.ceil(that.getProcess()* 100) + "%");
                }
            }, false);
            img.addEventListener("error", function() {
                that.errorCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }else{
                    $loadingTip.html(Math.ceil(that.getProcess()) * 100 / 100);
                }
                console.log("error");
            }, false);
            img.src = path;
        }
    };
    AssetManager.prototype.isDone = function() {
        return (this.downloadQueue.length == this.successCount + this.errorCount);
    };
    AssetManager.prototype.getProcess = function() {
        return (this.successCount + this.errorCount)/this.downloadQueue.length;
    };

    //音乐
    var $music = $(".music");
    $music.on("click", function(){
        if($music.hasClass("off")){
            //播放
            $bgm.play();
            $music.removeClass("off");
        }else{
            //暂停
            $bgm.pause();
            $music.addClass("off");
        }
    });

    var manager = new AssetManager(downloadQueue);
    manager.downloadAll(function(){
        //开始按钮
        $loadingTip.html("点击开始").addClass("success").on("click", function(){
            //播放
            if(!$music.hasClass("off")){
                $bgm.play();
            }
            that.el.remove();
            if(callback){
                callback();
            }
        });
    });
};

