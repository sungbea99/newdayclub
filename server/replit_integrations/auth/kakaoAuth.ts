import type { Express, RequestHandler } from "express";
import crypto from "crypto";
import { authStorage } from "./storage";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    email?: string;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
  };
}

export function setupKakaoAuth(app: Express) {
  app.get("/api/auth/kakao", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    (req.session as any).kakaoOAuthState = state;
    
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/kakao/callback`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    res.redirect(kakaoAuthUrl);
  });

  app.get("/api/auth/kakao/callback", async (req, res) => {
    const { code, error, error_description, state } = req.query;

    if (error) {
      console.error("Kakao auth error:", error, error_description);
      return res.redirect("/?error=kakao_auth_failed");
    }

    if (!code || typeof code !== "string") {
      return res.redirect("/?error=no_code");
    }

    const savedState = (req.session as any).kakaoOAuthState;
    if (!state || state !== savedState) {
      console.error("CSRF state mismatch");
      return res.redirect("/?error=invalid_state");
    }
    delete (req.session as any).kakaoOAuthState;

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/kakao/callback`;
      
      const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: KAKAO_REST_API_KEY!,
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token exchange failed:", errorText);
        return res.redirect("/?error=token_exchange_failed");
      }

      const tokens: KakaoTokenResponse = await tokenResponse.json();

      const userInfoResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      if (!userInfoResponse.ok) {
        console.error("Failed to get user info");
        return res.redirect("/?error=user_info_failed");
      }

      const userInfo: KakaoUserInfo = await userInfoResponse.json();

      const kakaoUserId = `kakao_${userInfo.id}`;
      const nickname = userInfo.properties?.nickname || 
                       userInfo.kakao_account?.profile?.nickname || 
                       "카카오 사용자";
      const profileImage = userInfo.properties?.profile_image || 
                           userInfo.kakao_account?.profile?.profile_image_url;
      const email = userInfo.kakao_account?.email;

      await authStorage.upsertUser({
        id: kakaoUserId,
        email: email || null,
        firstName: nickname,
        lastName: null,
        profileImageUrl: profileImage || null,
      });

      const expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

      (req as any).login(
        {
          claims: {
            sub: kakaoUserId,
            email: email,
            first_name: nickname,
            profile_image_url: profileImage,
          },
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
          provider: "kakao",
        },
        (err: any) => {
          if (err) {
            console.error("Login error:", err);
            return res.redirect("/?error=login_failed");
          }
          res.redirect("/");
        }
      );
    } catch (error) {
      console.error("Kakao callback error:", error);
      res.redirect("/?error=callback_error");
    }
  });
}
