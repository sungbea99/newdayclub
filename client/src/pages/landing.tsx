import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CategoryIcon } from "@/components/category-icon";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  Users, 
  Shield, 
  Heart, 
  MessageCircle, 
  ArrowRight,
  CheckCircle,
  Star,
  MapPin,
  Music,
  Mountain,
  Utensils,
  Rocket,
  UserPlus,
  Sparkles,
  Zap,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { INTEREST_CATEGORIES } from "@shared/schema";
import stockTravelImage from "@assets/stock_images/senior_adults_travel_9db88506.jpg";
import stockSocialImage from "@assets/stock_images/senior_friends_laugh_6efa6349.jpg";
import stockHobbyImage from "@assets/stock_images/senior_adults_hobby__ff19c9fa.jpg";
import stockExerciseImage from "@assets/stock_images/active_seniors_exerc_0804e126.jpg";
import stockCommunityImage from "@assets/stock_images/senior_community_gro_c21774e8.jpg";
import stockMentorImage from "@assets/stock_images/senior_mentor_teachi_39f70c6f.jpg";

import stockHikingImage from "@assets/stock_images/senior_adults_hiking_02d01d60.jpg";
import stockConcertImage from "@assets/stock_images/senior_people_concer_2d83f980.jpg";
import stockDiningImage from "@assets/stock_images/senior_friends_dinin_f3c99a0c.jpg";
import stockGolfImage from "@assets/stock_images/seniors_golf_outdoor_6fc01691.jpg";
import stockCookingImage from "@assets/stock_images/seniors_cooking_clas_78c8311b.jpg";
import stockBeachImage from "@assets/stock_images/senior_friends_beach_81b9adef.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

function FloatingCard({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground tracking-tight">뉴데이클럽</span>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-6">
              {["기능소개", "카테고리", "이용방법"].map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${["features", "categories", "how-it-works"][i]}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button size="sm" asChild data-testid="button-login">
                <a href="/api/login">시작하기</a>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>
      <section ref={heroRef} className="relative pt-24 pb-8 md:pt-32 md:pb-16 px-4 md:px-6 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="max-w-7xl mx-auto w-full relative z-10"
        >
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-medium"
              >
                <Star className="w-3.5 h-3.5" />
                대표 5060 여가생활 커뮤니티
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              >
                <span className="font-semibold text-[#4d4946cc]">매일을 새롭게</span><br />
                <span className="text-primary">뉴데이클럽</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed"
              >
                공연, 트레킹, 스포츠 등 다양한 여가활동을 함께할 
                취향이 맞는 동행자를 찾고, 새로운 인연을 만들어보세요.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="text-lg px-10 py-7 h-auto" asChild data-testid="button-cta-main">
                    <a href="/api/login">
                      무료로 시작하기
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-7 h-auto" asChild>
                    <a href="#how-it-works">이용 방법 보기</a>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                {[
                  "본인 인증된 회원만",
                  "안전한 만남 환경", 
                  "무료 가입"
                ].map((text, i) => (
                  <motion.div 
                    key={text}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <CheckCircle className="w-4 h-4 text-accent" />
                    {text}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <div className="relative hidden lg:block">
              <motion.div 
                className="relative aspect-square max-w-lg mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl"
                  animate={{ rotate: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-4 bg-card rounded-2xl shadow-xl overflow-hidden">
                  <motion.img 
                    src={stockHikingImage} 
                    alt="함께 여가생활을 즐기는 5060 시니어" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-6 text-white"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="text-2xl font-bold mb-1">함께하는 즐거움</h3>
                    <p className="text-white/80">새로운 친구들과 함께 여가생활을 즐겨보세요</p>
                  </motion.div>
                </div>
                
                <FloatingCard 
                  className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border border-border"
                  delay={0.5}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">북한산 등산</p>
                      <p className="text-xs text-muted-foreground">이번 주말</p>
                    </div>
                  </div>
                </FloatingCard>
                
                <FloatingCard 
                  className="absolute bottom-2/3 -left-4 bg-card rounded-xl shadow-lg p-4 border border-border"
                  delay={0.8}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">뮤지컬 관람</p>
                      <p className="text-xs text-muted-foreground">3명 참여중</p>
                    </div>
                  </div>
                </FloatingCard>

                <FloatingCard 
                  className="absolute top-1/2 -right-8 bg-card rounded-xl shadow-lg p-3 border border-border"
                  delay={1.1}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-xs font-medium">맛집 탐방</p>
                  </div>
                </FloatingCard>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>
      <section className="py-16 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex gap-4 overflow-hidden">
              <motion.div 
                className="flex gap-4 min-w-max"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {[stockConcertImage, stockHikingImage, stockDiningImage, stockTravelImage, stockGolfImage, stockCookingImage, stockBeachImage, stockSocialImage].map((img, i) => (
                  <div 
                    key={i} 
                    className="w-72 h-48 rounded-2xl overflow-hidden shadow-lg"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              뉴데이클럽에서 만들어가는 <span className="text-primary">특별한 경험</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              혼자서는 경험하기 어려웠던 것들, 이제 함께라면 가능합니다
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { 
                title: "망설이던 버킷리스트 실현", 
                desc: "혼자 가기 망설여졌던 해외여행, 스카이다이빙, 등산... 함께할 동행자가 있다면 도전할 용기가 생깁니다.",
                icon: Rocket,
                image: stockTravelImage,
                color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              },
              { 
                title: "진정한 또래 친구 만들기", 
                desc: "같은 시대를 살아온 또래와 공감대를 나누고, 인생 후반전을 함께할 진정한 친구를 만들어보세요.",
                icon: UserPlus,
                image: stockSocialImage,
                color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
              },
              { 
                title: "새로운 취미 발견", 
                desc: "관심은 있었지만 시작하지 못했던 새로운 취미. 경험자와 함께라면 쉽게 시작할 수 있습니다.",
                icon: Sparkles,
                image: stockHobbyImage,
                color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              },
              { 
                title: "활력 넘치는 일상", 
                desc: "매주 새로운 활동 일정이 생기고, 기다려지는 약속이 생깁니다. 활기찬 하루하루를 경험하세요.",
                icon: Zap,
                image: stockExerciseImage,
                color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
              },
              { 
                title: "안전하고 건강한 사회생활", 
                desc: "검증된 회원들과 건강한 관계를 맺고, 서로 응원하며 성장하는 커뮤니티에 함께하세요.",
                icon: ShieldCheck,
                image: stockCommunityImage,
                color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              },
              { 
                title: "풍부한 인생 경험 공유", 
                desc: "각자의 전문 분야와 인생 경험을 나누며, 배움과 가르침이 있는 뜻깊은 만남을 가져보세요.",
                icon: BookOpen,
                image: stockMentorImage,
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="rounded-2xl bg-card border border-border overflow-hidden"
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className={`absolute bottom-3 left-4 w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  이런 분들께 <span className="text-primary">추천</span>합니다
                </h2>
                <p className="text-lg text-muted-foreground">
                  뉴데이클럽은 다음과 같은 분들을 위해 만들어졌습니다
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  "은퇴 후 새로운 사회적 관계를 원하시는 분",
                  "혼자서는 시작하기 어려운 취미활동을 하고 싶은 분",
                  "같은 관심사를 가진 또래 친구를 만나고 싶은 분",
                  "주말마다 의미 있는 활동으로 채우고 싶은 분",
                  "건강하고 활력 있는 시니어 라이프를 원하시는 분"
                ].map((text, i) => (
                  <motion.div 
                    key={text}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={stockSocialImage} 
                  alt="함께하는 즐거움" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-lg font-medium">새로운 인연, 새로운 경험</p>
                  <p className="text-white/80 text-sm">뉴데이클럽에서 시작하세요</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              왜 뉴데이클럽인가요?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              50-60대에게 최적화된 안전하고 신뢰할 수 있는 동행 매칭 플랫폼
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: Shield, color: "primary", title: "안전한 인증 시스템", desc: "전화번호, 사진 인증을 통해 신뢰할 수 있는 회원만 참여합니다." },
              { icon: Heart, color: "accent", title: "취향 기반 매칭", desc: "관심사, 활동 스타일을 분석해 딱 맞는 동행자를 추천해 드립니다." },
              { icon: MessageCircle, color: "blue", title: "편리한 소통", desc: "1:1 채팅과 그룹 채팅으로 동행 전 충분히 소통할 수 있습니다." }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <motion.div 
                      className={`w-12 h-12 ${item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : item.color === 'accent' ? 'bg-accent/20' : 'bg-primary/10'} rounded-xl flex items-center justify-center mb-4`}
                      whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                    >
                      <item.icon className={`w-6 h-6 ${item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : item.color === 'accent' ? 'text-accent' : 'text-primary'}`} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section id="categories" className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              다양한 활동 카테고리
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              관심 있는 분야에서 함께할 동행자를 찾아보세요
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {INTEREST_CATEGORIES.map((category, i) => (
              <motion.div 
                key={category}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-3 p-4 rounded-xl hover-elevate cursor-pointer"
              >
                <CategoryIcon category={category} size="lg" />
                <span className="text-sm font-medium text-center">{category}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="rounded-2xl overflow-hidden shadow-xl"
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={stockConcertImage} alt="공연 관람" className="w-full h-48 object-cover" />
                </motion.div>
                <motion.div 
                  className="rounded-2xl overflow-hidden shadow-xl mt-8"
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={stockHikingImage} alt="트레킹" className="w-full h-48 object-cover" />
                </motion.div>
                <motion.div 
                  className="rounded-2xl overflow-hidden shadow-xl"
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={stockDiningImage} alt="맛집 탐방" className="w-full h-48 object-cover" />
                </motion.div>
                <motion.div 
                  className="rounded-2xl overflow-hidden shadow-xl mt-8"
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={stockTravelImage} alt="여행" className="w-full h-48 object-cover" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                다양한 활동,<br />
                <span className="text-primary">함께하면 더 즐거워요</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                혼자서는 망설여지던 활동도 함께라면 용기가 납니다.
                새로운 취미를 시작하고, 같은 관심사를 가진 친구들과 
                특별한 추억을 만들어보세요.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Music, text: "공연/전시 - 문화생활을 함께" },
                  { icon: Mountain, text: "트레킹/여행 - 자연 속에서" },
                  { icon: Utensils, text: "맛집/카페 - 미식 탐험" }
                ].map((item, i) => (
                  <motion.div 
                    key={item.text}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              이용 방법
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              간단한 4단계로 새로운 동행자를 만나보세요
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "프로필 작성", desc: "취향과 관심사를 입력해주세요" },
              { step: 2, title: "활동 탐색", desc: "관심 있는 동행 모집글을 찾아보세요" },
              { step: 3, title: "참여 신청", desc: "마음에 드는 활동에 참여를 신청하세요" },
              { step: 4, title: "함께 즐기기", desc: "새로운 친구들과 즐거운 시간을 보내세요" },
            ].map((item, i) => (
              <motion.div 
                key={item.step} 
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            지금 바로 시작하세요
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg opacity-90 mb-8"
          >
            취향이 맞는 동행자와 함께하는 즐거운 여가생활이 기다리고 있습니다.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8"
                asChild
                data-testid="button-cta-footer"
              >
                <a href="/api/login">
                  무료로 가입하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      <footer className="py-8 px-4 md:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">뉴데이클럽</span>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            © 2025 뉴데이클럽. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
