package org.seckill.exception;

/**
 * 重复秒杀异常
 * Created by dengyul on 2017/8/20.
 */
public class RepeatKillException extends SeckillException {

    public RepeatKillException(String message) {
        super(message);
    }

    public RepeatKillException(String message, Throwable cause) {
        super(message, cause);
    }
}
