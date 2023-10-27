import { Injectable }   from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as process     from "process";

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy }     from '@nestjs/passport';
import { AuthService }          from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        ConfigModule.forRoot();

        super({
            jwtFromRequest      : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration    : false,
            secretOrKey         : process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return this.authService.getPayload(payload)
    }
}
