$(function () {
    document.body.addEventListener("touchmove", function (e) {
        e.preventDefault();
    })

    var key = "f3e5d7a9c50edb31006de5ac0077ffa3";

    var $window = $(window);
    var $chatPanel = $("#chatPanel");
    var $messageInput = $("#messageInput");
    var $sendBtn = $("#sendBtn");
    var $setting = $("#setting");
    var $settingPanel = $("#settingPanel");

    var initUsername = "", initChatName = "", initRobotColor = "", initUserColor = "";

    $sendBtn.click(function () {
        sendHandler();
    });

    $messageInput.keypress(function(e) {
        // 回车键事件
        if(e.which == 13) {
            sendHandler();
        }
    });

    function sendHandler(){
        var message = $messageInput.val();
        if (message == "") {
            return;
        }
        $messageInput.val("");
        addMessage("user", message);
        sendMessage(message);
    }

    //显示设置面板
    $setting.click(function () {
        $settingPanel.addClass("show");
        $setting.addClass("show");
        //读取信息
        var username = localStorage.getItem("username");
        var chatName = localStorage.getItem("chatName");
        var robotColor = localStorage.getItem("robotColor");
        var userColor = localStorage.getItem("userColor");
        $("#username").val(username);
        $("#chatName").val(chatName);
        /*
         if(robotColor){
         $(".robotColor").find(".chooseColor").removeClass("cur").each(function(){
         if($(this).attr("data-color") == robotColor){
         $(this).addClass("cur");
         }
         });
         }
         if(userColor){
         $(".userColor").find(".chooseColor").removeClass("cur").each(function(){
         if($(this).attr("data-color") == userColor){
         $(this).addClass("cur");
         }
         });
         }
         */
    });

    //面板上事件的监听
    $settingPanel.click(function (e) {
        var $target = $(e.target);
        if ($target.hasClass("close")) {
            //关闭面板
            $settingPanel.removeClass("show");
            $setting.removeClass("show");
        } else if ($target.attr("id") == "saveSetting") {
            //保存设置
            var username = $("#username").val();
            var chatName = $("#chatName").val();
            //保存称呼
            if (chatName != initChatName && chatName != "") {
                localStorage.setItem("chatName", chatName);
                document.title = chatName;
                addMessage("robot", chatName + "吗，真好听的名字~");
                initChatName = chatName;
            } else if (username != initUsername && username != "") {
                localStorage.setItem("username", username);
                addMessage("robot", "好嘞，以后就叫你" + username + "拉！");
                initUsername = username;
            }

            //保存气泡颜色
            /*
             $(".robotColor").find(".chooseColor").each(function(){
             if($(this).hasClass("cur")){
             $(".robot").find(".message").css("background-color", $(this).attr("data-color"));
             $(".robot").find(".message:before").css("background-color", $(this).attr("data-color"));
             localStorage.setItem("robotColor", $(this).attr("data-color"));
             }
             });
             $(".userColor").find(".chooseColor").each(function(){
             if($(this).hasClass("cur")){
             $(".user").find(".message").css("background-color", $(this).attr("data-color"))
             $(".user").find(".message:before").css("background-color", $(this).attr("data-color"))
             localStorage.setItem("userColor", $(this).attr("data-color"));
             }
             });
             */

            //关闭面板
            $settingPanel.removeClass("show");
            $setting.removeClass("show");
        } else if ($target.hasClass("chooseColor")) {
            $target.addClass("cur").siblings().removeClass("cur");
        } else if ($target.attr("id") == "backHome") {
            location.href = "../../index.html";
        }
    });

    (function () {
        var startY = 0;
        $chatPanel.on("touchstart", function (e) {
            var touch = e.touches[0];
            startY = touch.clientY;
        }).on("touchmove", function (e) {
            var touch = e.touches[0];
            var moveY = touch.clientY;
            $chatPanel[0].scrollTop = startY - moveY + $chatPanel[0].scrollTop;
            startY = moveY;
        }).on("touchend", function (e) {

        });
    })();

    function addMessage(type, message) {
        var $messageWrap = $("<div class='messageWrap " + type + "'>");
        var $headIcon = $("<div class='headIcon'>");
        var $message = $("<div class='message'>");
        $message.html(message);
        $messageWrap.append($headIcon).append($message);
        $chatPanel.append($messageWrap);
        $message.css({
            "max-width": $window.width() - 150 + "px"
        });
        /*
         if($messageWrap.hasClass("robot")){
         $messageWrap.find(".message").css("background-color", initRobotColor);
         console.log($messageWrap.find(".message::before"))
         $messageWrap.find(".message:before").css("border-right-color", initRobotColor);
         }else if($messageWrap.hasClass("user")){
         $messageWrap.find(".message").css("background-color", initUserColor);
         $messageWrap.find(".message::before").css("border-left-color", initUserColor);
         }
         */

        //滚动条滑倒最底端
        $chatPanel[0].scrollTop = $chatPanel[0].scrollHeight;
    }

    function sendMessage(message) {
        $.ajax({
            url: "http://www.tuling123.com/openapi/api",
            type: "get",
            data: {
                key: key,
                info: message,
                userid: "sunhengzhe"
            },
            success: function (data) {
                var obj = JSON.parse(data);
                var code = obj.code;
                switch (code) {
                    case 100000:
                        addMessage("robot", obj.text);
                        break;
                    case 200000:
                        obj.url = decodeURIComponent(obj.url);
                        addMessage("robot", "你是说这些图片吗？");
                        addMessage("robot", "<a href='" + obj.url + "'>" + obj.url + "</a>");
                        break;
                    case 302000:
                        addMessage("robot", obj.text);
                        for (var i = 0; i < obj.list.length; i++) {
                            var item = obj.list[i];
                            var content = "<a href='" + item.detailurl + "'>" + item.article + " [来自" + item.source + "]</a>";
                            if (item.icon != "") {
                                content += "<br><img src='" + item.icon + "' width=150 style='margin-top:10px'>";
                            }
                            addMessage("robot", content);
                        }
                        break;
                    case 308000:
                        addMessage("robot", obj.text);
                        for (var i = 0; i < obj.list.length; i++) {
                            var item = obj.list[i];
                            var content = "菜名：" + item.name + "<br><a href='" + item.detailurl + "'>详情地址</a>";
                            if (item.icon != "") {
                                content += "<br><img src='" + item.icon + "' width=150 style='margin-top:10px'>";
                            }
                            addMessage("robot", content);
                        }
                        break;
                    default:
                        addMessage("robot", "完啦！出问题了！赶紧去联系我家主人！");
                        break;
                }
            }
        });
    }

    function init() {
        AV.initialize("dtx6ld55g8k8rk3bfk811mkp067d8a3wc5w6piaaasjscq3e", "sgsnm1wcw1m86j2a3qspcm6sepvy4txmllskboxswa587crs");
        var Player = AV.Object.extend("Player");
        var player = new Player();
        var username = "主人";
        var chatName = "小萝卜丝";
        /*
         initRobotColor = localStorage.getItem("robotColor") ? localStorage.getItem("robotColor") : "#b2e281";
         initUserColor = localStorage.getItem("userColor") ? localStorage.getItem("userColor") : "#fff";
         */
        if (!localStorage.getItem("firstIn")) {
            //第一次进入
            username = prompt("你好，第一次见你，还不知道你叫什么呢（只须在第一次进入本页面输入）");
            if (username == "" || !username) {
                username = "主人";
                chatName = prompt("好拉，不说就不说，那主人你给我取个名字吧");
            } else {
                chatName = prompt("好嘞，" + username + "，给我也取个名字吧（只须在第一次进入本页面输入）");
            }
        }
        if (!localStorage.getItem("firstIn")) {
            if (chatName == "" || !chatName) {
                chatName = "小萝卜丝";
            }
            addMessage("robot", "嘿嘿嘿（傻笑），" + username + "，以后" + chatName + "就是你的人了，请多关照");
            localStorage.setItem("firstIn", "enter");
            localStorage.setItem("username", username);
            localStorage.setItem("chatName", chatName);
            document.title = chatName;
            //进行存储
            player.save({
                username: username,
                chatName: chatName
            });
        } else {
            username = localStorage.getItem("username");
            chatName = localStorage.getItem("chatName");
            document.title = chatName;
            addMessage("robot", "哈喽！" + username + "，我们又见面拉！今天开心吗（开心~）");
        }

        initUsername = username;
        initChatName = chatName;

        var hour = new Date().getHours();
        if (hour > 0 && hour < 5) {
            addMessage("robot", "现在已经是凌晨" + hour + "点拉，你怎么还不睡呢");
        } else if (hour >= 5 && hour <= 7) {
            addMessage("robot", "这么早就醒拉，不睡个懒觉啥的？");
        } else if (hour > 7 && hour <= 9) {
            addMessage("robot", "早上好，一起迎接新的一天吧！");
        } else if (hour > 9 && hour <= 12) {
            addMessage("robot", "中午好呀，吃饭没？");
        } else if (hour > 12 && hour <= 15) {
            addMessage("robot", "睡午觉了没，听说中午睡一个小时抵得上晚上睡三个小时哦");
        } else if (hour > 15 && hour <= 17) {
            addMessage("robot", "时间过的真快，一下午又没了吧？");
        } else if (hour > 17 && hour <= 19) {
            addMessage("robot", "吃晚饭没？不吃晚饭晚上会饿想吃宵夜，然后会胖胖胖（嘘）");
        } else if (hour > 19 && hour <= 22) {
            addMessage("robot", "晚上就该出去约拉！（不会是单身狗吧啊哈哈）");
        } else if (hour > 22 && hour <= 23 || hour == 0) {
            addMessage("robot", "不早啦，还是尽量别玩手机了，早点睡吧~（不过如果你决定要熬夜我也会陪你的啦）");
        }
    }

    init();
});