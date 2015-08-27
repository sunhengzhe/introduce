$(function () {
    document.body.addEventListener("touchmove", function (e) {
        e.preventDefault();
    })
    var $window = $(window);
    var score = 0;
    var $resultPanel = $("#resultPanel");
    var downloadQueue = ["images/cat.png", "images/rabbit.png", "images/bullet.png", "images/bulletFish.png", "images/heart.png", "images/tip.png"];
    var heart = new Image();
    heart.src = downloadQueue[4];

    //舞台
    var Stage = (function () {
        var stage;

        var canvas = document.getElementById("stage");
        canvas.width = $window.width();
        canvas.height = $window.height();
        var cxt = canvas.getContext("2d");
        //页面元素
        var enemys = [];
        var hero = null;
        var deads = [];
        var enemyBullets = [];

        function Constructor() {
            this.width = canvas.width;
            this.height = canvas.height;

            //绘制
            this.draw = function () {
                var grd = cxt.createRadialGradient(stage.width / 2, stage.height / 2, 5, stage.width / 2, stage.height / 2, stage.width / 2);
                grd.addColorStop(0, "#2E4369");
                grd.addColorStop(1, "#142441");
                cxt.fillStyle = grd;
                cxt.fillRect(0, 0, stage.width, stage.height);

                //判断敌人飞机是否已死亡
                for (var i = 0; i < enemys.length; i++) {
                    var enemy = enemys[i];
                    //判断是否撞到我的飞机
                    var dis = Math.sqrt(Math.pow(enemy.x + enemy.width / 2 - hero.x - hero.width / 2, 2) + Math.pow(enemy.y + enemy.height / 2 - hero.y - hero.height / 2, 2));
                    if (dis < hero.width / 2) {
                        hero.life = 0;
                        //添加死亡效果
                        deads.push(new DeadRole(downloadQueue[1], hero.x, hero.y, 100, 100, 2, 7, 0));
                        game.over();
                    }
                    if (enemy.life <= 0) {
                        //添加死亡效果
                        var r = Math.floor(Math.random() * 2);
                        if(r == 0){
                            deads.push(new DeadRole(downloadQueue[0], enemy.x, enemy.y, 100, 100, 4, 5, 0));
                        }else{
                            deads.push(new DeadRole(downloadQueue[0], enemy.x, enemy.y, 100, 100, 4, 5, 2));
                        }
                        enemy = null;
                        //死掉了
                        enemys.splice(i, 1);
                        i -= 1;
                    } else if (enemy.y > stage.height || enemy.x < -enemy.width || enemy.x > stage.width) {
                        enemy.life = 0;
                        enemy = null;
                        //越界死掉了
                        enemys.splice(i, 1);
                        i -= 1;
                    } else {
                        //没有死
                        enemy.drawMe(cxt);
                        enemy.move()
                    }
                }

                //画出敌人的子弹
                for (var j = 0; j < enemyBullets.length; j++) {
                    var bullet = enemyBullets[j];
                    //判断是否打到我的飞机
                    bullet.hit(hero, function () {
                        //打死了我放飞机
                        //添加死亡效果
                        deads.push(new DeadRole(downloadQueue[1], hero.x, hero.y, 100, 100, 2, 7, 0));
                        game.over();
                    });
                    if (bullet.y < -bullet.height || bullet.y > stage.height || bullet.x < -bullet.width || bullet.x > stage.width || bullet.life <= 0) {
                        //死掉了
                        enemyBullets.splice(j, 1);
                        j -= 1;
                    } else {
                        //没有死
                        bullet.drawMe(cxt);
                        bullet.move();
                    }
                }

                //绘制我的飞机
                if (hero) {
                    if (hero.life > 0) {
                        hero.drawMe(cxt);
                        //绘制我的子弹
                        for (var j = 0; j < hero.bullets.length; j++) {
                            var bullet = hero.bullets[j];
                            //判断是否打到敌人飞机
                            for (var i = 0; i < enemys.length; i++) {
                                var enemy = enemys[i];
                                bullet.hit(enemy, function () {
                                    //被我的飞机打死了
                                    //得分
                                    score += enemy.score;
                                });
                            }
                            if (bullet.y < 0 || bullet.life <= 0) {
                                //死掉了
                                hero.bullets.splice(j, 1);
                                j -= 1;
                            } else {
                                //没有死
                                bullet.drawMe(cxt);
                                bullet.move();
                            }
                        }
                    }
                }

                //绘制死亡效果
                for (var i = 0; i < deads.length; i++) {
                    var dead = deads[i];
                    if (dead.life > 0) {
                        dead.drawMe(cxt);
                    } else {
                        //死掉了
                        deads.splice(i, 1);
                        i -= 1;
                    }
                }

                //得分
                cxt.strokeStyle = "#fff";
                cxt.font = "40px Arial";
                var str = score + "";
                cxt.strokeText(score, stage.width / 2 - str.length * 10, 40);

                //生命值
                for (var i = 0; i < hero.life; i++) {
                    cxt.drawImage(heart, 10 + 27 * i, 10);
                }
            };

            this.setHero = function (_hero) {
                hero = _hero;
            };

            this.getHero = function () {
                return hero;
            };

            this.addEnemy = function (ele) {
                enemys.push(ele);
            };

            this.addEnemyBullet = function (ele) {
                enemyBullets.push(ele);
            };

            this.reset = function () {
                hero = null;
                enemys.forEach(function (item, index, arr) {
                    arr[index].life = 0;
                    arr[index] = null;
                });
                enemys = [];
                enemyBullets = [];
                deads = [];
            }
        }

        return {
            getInstance: function () {
                if (!stage) {
                    stage = new Constructor();
                }
                return stage;
            }
        }
    })();

    //一切游戏角色
    var Role = function (options) {
        options = options || {};
        this.image = new Image();
        this.image.src = options.image || "";
        this.width = options.width || this.image.width;
        this.height = options.height || this.image.height;
        this.x = options.x - this.width / 2 || 0;
        this.y = options.y - this.height || 0;
        this.life = options.life || 100;
    };
    Role.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, this.x, this.y)
    };
    Role.prototype.move = function () {
        this.x += 0;
        this.y += this.speed;
    };

    //飞机
    var Plane = function (options) {
        options = options || {};
        Role.call(this, options);
        this.imgCount = 0;
        this.speed = options.speed || 5;
    };
    Plane.prototype = new Role();
    Plane.prototype.constructor = Plane;

    //我的飞机
    var MyPlane = function (options) {
        options.image = downloadQueue[1];
        options.life = 5;
        Plane.call(this, options);
        this.bullets = [];
        this.shot();
    };
    MyPlane.prototype = new Plane();
    MyPlane.prototype.constructor = MyPlane;
    MyPlane.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, Math.floor(this.imgCount / 10) * 100, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        if (++this.imgCount >= 20) {
            this.imgCount = 0
        }
    };
    MyPlane.prototype.move = function (dx, dy) {
        var lx = this.x + dx;
        var ly = this.y + dy;
        if (lx >= 0 && lx <= stage.width - this.width) {
            this.x += dx;
        }
        if (ly >= 0 && ly <= stage.height - this.height) {
            this.y += dy;
        }
    };
    MyPlane.prototype.shot = function () {
        var self = this;
        var bullet = new Bullet({
            image: downloadQueue[2],
            x: self.x + self.width / 2,
            y: self.y,
            power: 10,
            speed: 8
        });
        this.bullets.push(bullet);
        setTimeout(function () {
            if (self.life > 0) {
                self.shot();
            }
        }, 100);
    };

    //敌机（招手猫） 继承Plane
    var EnemyEasy = function (options) {
        options.image = downloadQueue[0];
        options.speed = 2;
        options.life = 100;
        Plane.call(this, options);
        this.score = 50;
    };
    EnemyEasy.prototype = new Plane();
    EnemyEasy.prototype.constructor = EnemyEasy;
    EnemyEasy.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, Math.floor(this.imgCount / 10) * 100, 0, 100, 100, this.x, this.y, 100, 100);
        if (++this.imgCount >= 40) {
            this.imgCount = 0;
        }
    };

    //敌机（抽烟猫） 继承Plane
    var EnemySmoke = function (options) {
        options.image = downloadQueue[0];
        options.life = 180;
        options.speed = 1;
        Plane.call(this, options);
        this.bullets = [];
        this.shot();
        this.score = 100;
    };
    EnemySmoke.prototype = new Plane();
    EnemySmoke.prototype.constructor = EnemySmoke;
    EnemySmoke.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, Math.floor(this.imgCount / 10) * 100, 100, 100, 100, this.x, this.y, 100, 100);
        if (++this.imgCount >= 30) {
            this.imgCount = 0;
        }
    };
    EnemySmoke.prototype.shot = function () {
        var self = this;
        var b0 = new Bullet({
            image: downloadQueue[3],
            x: self.x + self.width / 2,
            y: self.y,
            direction: 0
        });
        var b1 = new Bullet({
            image: downloadQueue[3],
            x: self.x + self.width,
            y: self.y,
            direction: 1,
            speed: 2.5
        });
        var b2 = new Bullet({
            image: downloadQueue[3],
            x: self.x + self.width,
            y: self.y + self.height / 2,
            direction: 2
        });
        var b3 = new Bullet({
            image: downloadQueue[3],
            x: self.x + self.width,
            y: self.y + self.height,
            direction: 3,
            speed: 2.5
        });
        var b4 = new Bullet({
            image: downloadQueue[3],
            x: self.x + self.width / 2,
            y: self.y + self.height,
            direction: 4
        });
        var b5 = new Bullet({
            image: downloadQueue[3],
            x: self.x,
            y: self.y + self.height,
            direction: 5,
            speed: 2.5
        });
        var b6 = new Bullet({
            image: downloadQueue[3],
            x: self.x,
            y: self.y + self.height / 2,
            direction: 6
        });
        var b7 = new Bullet({
            image: downloadQueue[3],
            x: self.x,
            y: self.y,
            direction: 7,
            speed: 2.5
        });
        var stage = Stage.getInstance();
        stage.addEnemyBullet(b0);
        stage.addEnemyBullet(b1);
        stage.addEnemyBullet(b2);
        stage.addEnemyBullet(b3);
        stage.addEnemyBullet(b4);
        stage.addEnemyBullet(b5);
        stage.addEnemyBullet(b6);
        stage.addEnemyBullet(b7);
        setTimeout(function () {
            if (self.life > 0) {
                self.shot();
            }
        }, 2000);
    };

    //敌机（愤怒猫） 继承Plane
    var EnemyAngry = function (options) {
        options.image = downloadQueue[0];
        options.life = 250;
        Plane.call(this, options);
        this.bullets = [];
        this.score = 150;
        this.speed = options.speed || 1;
        this.speedY = options.speedY || this.speed;
        this.enterFlag = false;
    };
    EnemyAngry.prototype = new Plane();
    EnemyAngry.prototype.constructor = EnemyAngry;
    EnemyAngry.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, Math.floor(this.imgCount / 10) * 100, 200, 100, 100, this.x, this.y, 100, 100);
        if (++this.imgCount >= 40) {
            this.imgCount = 0;
        }
    };
    EnemyAngry.prototype.move = function () {
        if (this.x == 0 || this.x == stage.width - this.width) {
            this.speed = -this.speed;
        } else if (this.y == 0 || this.y == stage.height - this.height) {
            if (!this.enterFlag) {
                this.enterFlag = true;
            } else {
                this.speedY = -this.speedY;
            }
        }
        this.x += this.speed;
        this.y += this.speedY;
    };

    var DeadRole = function (image, x, y, width, height, fromX, endX, fromY) {
        if (arguments.length != 8) {
            throw new Error("请给RoleDie构造函数传递7个参数！");
        }
        this.image = new Image();
        this.image.src = image;
        this.x = x;
        this.y = y;
        this.life = 1;
        this.width = width || image.width;
        this.height = height || image.height;
        this.fromX = fromX * 10;
        this.endX = (endX + 1)  * 10;
        this.fromY = fromY;
        this.repeatTime = 3;
        this.startX = this.fromX;
    };
    DeadRole.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, Math.floor(this.fromX / 10) * 100, this.fromY * 100, this.width, this.height, this.x, this.y, this.width, this.height);
        if (++this.fromX >= this.endX) {
            var srcArr = this.image.src.split("/");
            if(srcArr[srcArr.length - 1] == "cat.png" && this.repeatTime > 0){
                this.repeatTime--;
                this.fromX = this.startX;
            }else{
                this.life = 0;
            }
        }
    };

    //敌机工厂
    var EnemyFactory = {
        create: function (stage, type) {
            var r = Math.random();
            var rx = Math.floor(r * stage.width);
            if (type == 0) {
                stage.addEnemy(new EnemyEasy({
                    x: rx,
                    y: 0,
                    width: 100,
                    height: 100
                }));
            } else if (type == 1) {
                stage.addEnemy(new EnemySmoke({
                    x: rx,
                    y: 0,
                    width: 100,
                    height: 100
                }));
            } else if (type == 2) {
                var hero = Stage.getInstance().getHero();
                var speed = (hero.x - rx - 50) / hero.y;
                stage.addEnemy(new EnemyAngry({
                    x: rx,
                    y: 0,
                    width: 100,
                    height: 100,
                    speed: speed,
                    speedY: 1
                }));
            }
        }
    };

    //子弹
    var Bullet = function (options) {
        Role.call(this, options);
        this.power = options.power || 1;
        this.speed = options.speed || 5;
        this.speedY = options.speedY || this.speed;
        this.direction = options.direction || 0;
    };
    Bullet.prototype = new Role();
    Bullet.prototype.constructor = Bullet;
    Bullet.prototype.drawMe = function (cxt) {
        cxt.drawImage(this.image, this.x, this.y);
    };
    Bullet.prototype.move = function () {
        switch (this.direction) {
            case 0://向上
                this.y -= this.speed;
                break;
            case 1://向右上
                this.x += this.speed;
                this.y -= this.speedY;
                break;
            case 2://向右
                this.x += this.speed;
                break;
            case 3://向右下
                this.x += this.speed;
                this.y += this.speedY;
                break;
            case 4://向下
                this.y += this.speedY;
                break;
            case 5://向左下
                this.x -= this.speed;
                this.y += this.speedY;
                break;
            case 6://向左
                this.x -= this.speed;
                break;
            case 7: //向左上
                this.x -= this.speed;
                this.y -= this.speedY;
                break;
        }
    };
    Bullet.prototype.hit = function (target, callback) {
        if (this.x > target.x && this.x < target.x + target.width - this.width
            && this.y > target.y && this.y < target.y + target.height - this.height) {
            //打到了
            target.life -= this.power;
            //子弹销毁
            this.life = 0;
            if (callback && target.life <= 0) {
                callback();
            }
        }
    };

    //游戏初始化
    function init() {
        //创建舞台
        var stage = Stage.getInstance();
        //提示
        $("#tipPanel").show();
        setTimeout(function(){
            $("#tipPanel").addClass("hide");
        }, 3000);
        game.start();

        //舞台重绘
        (function animation() {
            stage.draw();
            requestAnimationFrame(animation);
        })();
    }

    var game = (function () {
        var stage = Stage.getInstance();
        AV.initialize("wpw0y2o6o7b2p0p10gm1vvugxfhngq7esb9zv72y8xo49npc", "95sucb4dj54p27w6io1qm5zkhfoj7ain7snz0chvmiip6w9v");
        var Player = AV.Object.extend("Player");
        var player = new Player();
        //创建我的飞机
        var myPlane = new MyPlane({
            x: stage.width / 2,
            y: stage.height,
            width: 100,
            height: 100
        });
        var scoreNum;
        var createEasyInterval;
        var createSmokeInterval;
        var createAngryInterval;

        var scoreTimeout;
        var createEasyTimeout;
        var createSomkeTimeout;
        var createAngryTimeout;

        var stageTimeout1;
        var stageTimeout2;
        var stageTimeout3;
        return {
            start: function () {
                $resultPanel.find(".item").removeClass("isMe");
                stage.reset();
                scoreNum = 1;
                createEasyInterval = 3000;
                createSmokeInterval = 7000;
                createAngryInterval = 15000;

                clearTimeout(createEasyTimeout);
                clearTimeout(createSomkeTimeout);
                clearTimeout(createAngryTimeout);

                score = 0;
                myPlane = new MyPlane({
                    x: stage.width / 2,
                    y: stage.height,
                    width: 100,
                    height: 100
                });

                stage.setHero(myPlane);

                //记分器
                scoreTimeout = setTimeout(function () {
                    score += scoreNum;
                    scoreTimeout = setTimeout(arguments.callee, 1000);
                }, 1000);

                //开始产生敌机
                createEasyTimeout = setTimeout(function () {
                    EnemyFactory.create(Stage.getInstance(), 0);
                    createEasyTimeout = setTimeout(arguments.callee, createEasyInterval);
                }, createEasyInterval);

                //产生抽烟猫
                createSomkeTimeout = setTimeout(function () {
                    EnemyFactory.create(Stage.getInstance(), 1);
                    createSomkeTimeout = setTimeout(arguments.callee, createSmokeInterval);
                }, createSmokeInterval);

                //产生愤怒猫
                createAngryTimeout = setTimeout(function () {
                    EnemyFactory.create(Stage.getInstance(), 2);
                    createAngryTimeout = setTimeout(arguments.callee, createAngryInterval);
                }, createAngryInterval);

                //20秒之后时间减少
                stageTimeout1 = setTimeout(function () {
                    createEasyInterval = 2000;
                    scoreNum = 2;
                }, 20000);

                //30秒之后时间减少
                stageTimeout2 = setTimeout(function () {
                    createSmokeInterval = 5000;
                    scoreNum = 5;
                }, 30000);

                //40秒之后时间减少
                stageTimeout3 = setTimeout(function () {
                    createAngryInterval = 7000;
                    scoreNum = 7;
                }, 40000);

                //添加监听
                window.addEventListener("devicemotion", this.devicemotionHandler);
                $window.on("mousemove", function(e){
                    myPlane.x = e.pageX;
                    myPlane.y = e.pageY;
                })
            },
            over: function () {
                //停止计分
                clearTimeout(scoreTimeout);
                //取消难度梯度
                clearTimeout(stageTimeout1);
                clearTimeout(stageTimeout2);
                clearTimeout(stageTimeout3);
                //移除监听
                window.removeEventListener("devicemotion", this.devicemotionHandler);
                stage.setHero({});

                var name = prompt("啊哦，真遗憾。留下你的大名吧：");
                if(!name || name.trim() == ""){
                    this.showPlayer();
                }else{
                    this.savePlayer(name, score);
                }
            },
            savePlayer: function(name, score){
                var self = this;
                //进行存储
                player.save({
                    name: name,
                    score: score
                }, {
                    success: function (post) {
                        self.showPlayer(name, score);
                    },
                    error: function (post, error) {
                        // 失败了.
                        alert("抱歉，由于网络原因上传失败！");
                        $resultPanel.show();
                    }
                });
            },
            showPlayer: function(name, score){
                // 实例已经成功保存.
                $resultPanel.show();
                var query = new AV.Query(Player);
                query.descending("score");
                //如果没有上传分数
                if(!name){
                    //只显示前五名
                    query.find({
                        success: function (results) {
                            // 处理返回的结果数据
                            for (var i = 0; i < 5; i++) {
                                var object = results[i];
                                var $item = $resultPanel.find(".item").eq(i);
                                var oName = object.get('name').length > 4 ? object.get('name').slice(0, 4) + ".." : object.get('name');
                                var oScore = object.get('score');
                                $item.find(".left").html(oName).attr("ranking", i + 1 < 10 ? "0" + (i + 1) : i + 1);
                                $item.find(".right").html(oScore);
                            }
                        },
                        error: function (error) {
                            alert("抱歉，由于网络原因获取失败！");
                        }
                    });
                    return;
                }
                query.find({
                    success: function (results) {
                        // 处理返回的结果数据
                        for (var i = 0; i < results.length; i++) {
                            var object = results[i];
                            if (object.get('name') == name && object.get('score') == score) {
                                break;
                            }
                        }
                        //前五：
                        if (i < 5) {
                            for (var i = 0; i < results.length; i++) {
                                var object = results[i];
                                var $item = $resultPanel.find(".item").eq(i);
                                var oName = object.get('name');
                                var oScore = object.get('score');
                                if (oName == name && oScore == score) {
                                    $item.addClass("isMe");
                                }
                                $item.find(".left").html(oName.length > 4 ? oName.slice(0, 4) + ".." : oName).attr("ranking", i + 1 < 10 ? "0" + (i + 1) : i + 1);
                                $item.find(".right").html(oScore);
                            }
                        } else {
                            var $items = $resultPanel.find(".item");
                            for (var k = 0; k < 5; k++) {
                                $items.eq(k).find(".left").html("").attr("ranking", "none");
                            }
                            $items.eq(2).addClass("isMe");
                            for (var j = i - 2, k = 0; j < i + 3; j++, k++) {
                                var object = results[j];
                                var oName = object.get('name').length > 4 ? object.get('name').slice(0, 4) + ".." : object.get('name');
                                var oScore = object.get('score');
                                $items.eq(k).find(".left").html(oName).attr("ranking", j + 1 < 10 ? "0" + (j + 1) : j + 1);
                                $items.eq(k).find(".right").html(oScore);
                            }
                        }
                    },
                    error: function (error) {
                        alert("抱歉，由于网络原因获取失败！");
                    }
                });
            },

            devicemotionHandler: function (e) {
                var acc = e.accelerationIncludingGravity;
                if (/android/i.test(navigator.userAgent)){
                    // todo : android
                    myPlane.move(-acc.x * 2, acc.y * 2);
                }

                if (/ipad|iphone|mac/i.test(navigator.userAgent)){
                    // todo : ios
                    myPlane.move(acc.x * 2, -acc.y * 2);
                }

            }
        };
    })();

    //图片加载
    var pm = new PrepareManager("preSection");
    pm.prepare(downloadQueue, "bgm", function(){
        init();
    });

    //重新开始按钮
    $resultPanel.delegate(".replay", "click", function(){
        $resultPanel.hide();
        game.start();
    }).delegate(".back", "click", function(){
       location.href = "../../index.html";
    });
});