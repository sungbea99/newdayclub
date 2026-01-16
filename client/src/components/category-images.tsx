import concertImage from "@assets/generated_images/concert_performance_illustration.png";
import outdoorImage from "@assets/generated_images/outdoor_hiking_illustration.png";
import sportsImage from "@assets/generated_images/sports_activity_illustration.png";
import cultureImage from "@assets/generated_images/cultural_activities_illustration.png";
import educationImage from "@assets/generated_images/education_learning_illustration.png";
import foodImage from "@assets/generated_images/food_dining_illustration.png";
import travelImage from "@assets/generated_images/travel_tourism_illustration.png";
import socialImage from "@assets/generated_images/social_gathering_illustration.png";

const categoryImages: Record<string, string> = {
  "공연/전시": concertImage,
  "아웃도어": outdoorImage,
  "스포츠": sportsImage,
  "문화생활": cultureImage,
  "교육/자기계발": educationImage,
  "맛집/카페": foodImage,
  "여행": travelImage,
  "소모임": socialImage,
};

export function getCategoryImage(category: string): string {
  return categoryImages[category] || socialImage;
}

export function CategoryImage({ 
  category, 
  userImage,
  className = "" 
}: { 
  category: string; 
  userImage?: string | null;
  className?: string;
}) {
  const imageSrc = userImage || getCategoryImage(category);
  
  return (
    <img 
      src={imageSrc}
      alt={category}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
