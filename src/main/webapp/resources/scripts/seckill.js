//存放交互逻辑的JS
//js模块化
var seckill = {
    //封装秒杀相关ajax地址
    URL:{
        now:function(){
            return '/seckill/time/now';
        },
        exposer:function(seckillId){
            return '/seckill/'+seckillId+'/exposer';
        },
        execution:function(seckillId,md5){
            return '/seckill/'+seckillId+'/'+md5+'/execution';
        }

    },
    validatePhone:function(phone){
        if(phone && phone.length == 11 && !isNaN(phone)){
            return true;
        }else{
            return false;
        }
    },
    countdown:function(seckillId,nowTime,startTime,endTime){
        var seckillBox = $('#seckill-box');
        //时间判断
        if(nowTime > endTime){
            //秒杀结束
            seckillBox.html('秒杀结束!');
        }else if(nowTime < startTime){
            //秒杀未开始,计时时间绑定
            var killTime  = new Date(startTime+1000);
            seckillBox.countdown(killTime,function(event){
                var format = event.strftime('秒杀倒计时：%D天 %H时 %M分 %S秒');
                seckillBox.html(format);
            }).on('finish.countdown',function(){
                //计时完成后回调事件
                //获取秒杀地址，控制显示逻辑
                seckill.handleSeckill(seckillId,seckillBox);

            })
        }else{
            //秒杀开始
            seckill.handleSeckill(seckillId,seckillBox);
        }
    },
    handleSeckill:function(seckillId,node){
        //处理秒杀逻辑
        node.hide()
            .html('<button class="btn btn-primary btn-lg" id="killBtn">开始秒杀</button>');
        $.post(seckill.URL.exposer(seckillId),{},function(result){
            //在回调函数中执行交互流程
            if(result && result['success']){
                var exposer = result['data'];
                if(exposer['exposed']){
                    //开启秒杀
                    //获取秒杀地址
                    var md5 = exposer['md5'];
                    var killUrl = seckill.URL.execution(seckillId,md5);
                    console.log("killUrl:"+killUrl);
                    //绑定一次点击事件，防止重复点击
                    $('#killBtn').one('click',function(){
                        //执行秒杀请求操作
                        //1.先禁用按钮
                        $(this).addClass('diaable');
                        //2.发送秒杀请求
                        $.post(killUrl,{},function(rs){
                            if(rs && rs['success']){
                                var killResult = rs['data'];
                                var state = rs['state'];
                                var stateInfo = killResult['stateInfo'];

                                //3.显示秒杀结果
                                node.html('<span class="label label-success">stateInfo</span>');
                            }
                        })
                    })
                    node.show();
                }else{
                    //未开启时间
                    var now = exposer['now'];
                    var start = exposer['start'];
                    var end = exposer['end'];

                    //重新计算计时逻辑
                    seckill.countdown(seckillId,now,start,end);
                }

            }else{
                console.log("result:"+result);
            }
        })
    },
    //详情页秒杀逻辑
    detail: {
        init: function (params) {
            //手机验证和登录，计时交互

            //在cookie中查找手机号
            var killPhone = $.cookie('killPhone');


            //验证手机号
            if (!seckill.validatePhone(killPhone)) {
                //绑定phone
                var killPhoneModal = $("#killPhoneModal");
                killPhoneModal.modal({
                    //显示弹出层
                    show:true,
                    //禁止位置关闭
                    backdrop:'static',
                    //关闭键盘事件
                    keyboard:false
                });
                $("#killPhoneBtn").click(function(){
                    var inputPhone = $("#killPhone").val();
                    if(seckill.validatePhone(inputPhone)){
                        //写入电话到cookie
                        $.cookie('killPhone',inputPhone,{expires:7,path:'/seckill'});

                        //刷新页面
                        window.location.reload();
                    }else{
                        $('#killPhoneMessage').hide().html('<label class="label label-danger">手机号错误！</label>').show(300);
                    }
                });
            }
            //已经登录了

            //计时交互
            var startTime = params['startTime'];
            var endTime = params['endTime'];
            var seckillId = params['seckillId'];
            $.get(seckill.URL.now(),{},function(result){
                if(result && result['success']){
                    var nowtime = result['data'];

                    //时间判断
                    seckill.countdown(seckillId,nowtime,startTime,endTime);
                }else{

                }
            })
        }
    }



}