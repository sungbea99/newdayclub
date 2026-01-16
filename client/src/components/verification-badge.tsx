import { CheckCircle, Phone, Camera, MapPin, Star, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  type: "phone" | "photo" | "location" | "trusted" | "active";
  verified?: boolean;
  size?: "sm" | "md";
}

const badgeConfig = {
  phone: {
    icon: Phone,
    label: "전화번호 인증",
    activeColor: "text-blue-500",
  },
  photo: {
    icon: Camera,
    label: "사진 인증",
    activeColor: "text-green-500",
  },
  location: {
    icon: MapPin,
    label: "거주지 인증",
    activeColor: "text-purple-500",
  },
  trusted: {
    icon: Star,
    label: "신뢰도 배지 (평점 4.5 이상)",
    activeColor: "text-yellow-500",
  },
  active: {
    icon: Activity,
    label: "활발한 활동자",
    activeColor: "text-primary",
  },
};

export function VerificationBadge({ type, verified = true, size = "md" }: VerificationBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  if (!verified) return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={`${config.activeColor} ${sizeClasses[size]}`}>
          <Icon className="w-full h-full" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function VerificationBadges({ 
  isPhoneVerified, 
  isPhotoVerified,
  activityCount = 0,
  averageRating = 0,
}: {
  isPhoneVerified?: boolean;
  isPhotoVerified?: boolean;
  activityCount?: number;
  averageRating?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {isPhoneVerified && <VerificationBadge type="phone" size="sm" />}
      {isPhotoVerified && <VerificationBadge type="photo" size="sm" />}
      {averageRating >= 45 && <VerificationBadge type="trusted" size="sm" />}
      {activityCount >= 3 && <VerificationBadge type="active" size="sm" />}
    </div>
  );
}
