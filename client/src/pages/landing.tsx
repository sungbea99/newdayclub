import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CategoryIcon } from "@/components/category-icon";
import { 
  Users, 
  Shield, 
  Heart, 
  MessageCircle, 
  ArrowRight,
  CheckCircle,
  Star,
  MapPin
} from "lucide-react";
import { INTEREST_CATEGORIES } from "@shared/schema";
import activeSeniorsImage from "@assets/generated_images/active_seniors_hiking_together.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">뉴데이클럽</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">기능소개</a>
              <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors">카테고리</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">이용방법</a>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button asChild data-testid="button-login">
                <a href="/api/login">시작하기</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                대표 5060 여가생활 커뮤니티 뉴데이클럽
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-serif">
                취향이 맞는<br />
                <span className="text-primary">동행자</span>를 찾아<br />
                함께 즐기세요
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                공연, 트레킹, 스포츠 등 다양한 여가활동을 함께할 
                취향이 맞는 동행자를 찾고, 새로운 인연을 만들어보세요.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild data-testid="button-cta-main">
                  <a href="/api/login">
                    무료로 시작하기
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <a href="#how-it-works">이용 방법 보기</a>
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  본인 인증된 회원만
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  안전한 만남 환경
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  무료 가입
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl" />
                <div className="absolute inset-4 bg-card rounded-2xl shadow-xl overflow-hidden">
                  <img 
                    src={activeSeniorsImage} 
                    alt="함께 여가생활을 즐기는 5060 시니어" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">함께하는 즐거움</h3>
                    <p className="text-white/80">새로운 친구들과 함께 여가생활을 즐겨보세요</p>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">북한산 등산</p>
                      <p className="text-xs text-muted-foreground">이번 주말</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">뮤지컬 관람</p>
                      <p className="text-xs text-muted-foreground">3명 참여중</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 뉴데이클럽인가요?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              50-60대에게 최적화된 안전하고 신뢰할 수 있는 동행 매칭 플랫폼
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">안전한 인증 시스템</h3>
                <p className="text-muted-foreground">
                  전화번호, 사진 인증을 통해 신뢰할 수 있는 회원만 참여합니다.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">취향 기반 매칭</h3>
                <p className="text-muted-foreground">
                  관심사, 활동 스타일을 분석해 딱 맞는 동행자를 추천해 드립니다.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">편리한 소통</h3>
                <p className="text-muted-foreground">
                  1:1 채팅과 그룹 채팅으로 동행 전 충분히 소통할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="categories" className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">다양한 활동 카테고리</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              관심 있는 분야에서 함께할 동행자를 찾아보세요
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {INTEREST_CATEGORIES.map((category) => (
              <div 
                key={category} 
                className="flex flex-col items-center gap-3 p-4 rounded-xl hover-elevate cursor-pointer"
              >
                <CategoryIcon category={category} size="lg" />
                <span className="text-sm font-medium text-center">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">이용 방법</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              간단한 4단계로 새로운 동행자를 만나보세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "프로필 작성", desc: "취향과 관심사를 입력해주세요" },
              { step: 2, title: "활동 탐색", desc: "관심 있는 동행 모집글을 찾아보세요" },
              { step: 3, title: "참여 신청", desc: "마음에 드는 활동에 참여를 신청하세요" },
              { step: 4, title: "함께 즐기기", desc: "새로운 친구들과 즐거운 시간을 보내세요" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg opacity-90 mb-8">
            취향이 맞는 동행자와 함께하는 즐거운 여가생활이 기다리고 있습니다.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6"
            asChild
            data-testid="button-cta-footer"
          >
            <a href="/api/login">
              무료로 가입하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">뉴데이클럽</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 뉴데이클럽. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
