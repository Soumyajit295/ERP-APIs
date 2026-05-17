import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { User } from "src/entities/user.entity";

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  public async signToken(
    userId: string,
    expiresIn: string,
    payload?: any
  ) {
    try {
      return await this.jwtService.signAsync(
        {
          sub: userId,
          ...payload,
        },
        { expiresIn: expiresIn as any }
      );
    } catch (error) {
      console.log("error : ",error)
      throw new InternalServerErrorException(
        "Failed to generate token"
      );
    }
  }

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(
        user.id,
        this.configService.get<string>("ACCESS_TOKEN_TTL") as string,
        {
          tenantId: user.tenantId,
          role: user.roleId,
          email: user.email,
        }
      ),

      this.signToken(
        user.id,
        this.configService.get<string>("REFRESH_TOKEN_TTL")!
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
