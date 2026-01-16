# 뉴데이클럽 Design Guidelines

## Design Approach

**Reference-Based Hybrid Approach**
Drawing inspiration from Meetup's activity-focused interface, Bumble's card-based matching system, and Facebook's familiar social patterns, adapted specifically for 50-60 year old users with emphasis on accessibility and trust-building.

**Core Principles:**
- Trust & Safety First: Visual verification badges, clear profile information
- Senior-Friendly Accessibility: Larger touch targets, high contrast, simplified navigation
- Social Discovery: Card-based browsing with rich imagery
- Community Connection: Instagram-inspired feed for activity sharing

## Typography

**Font System:**
- Primary: Noto Sans KR (via Google Fonts CDN)
- Use weights: 400 (Regular), 500 (Medium), 700 (Bold)

**Hierarchy:**
- Hero Headlines: text-4xl md:text-5xl lg:text-6xl, font-bold
- Section Headers: text-3xl md:text-4xl, font-bold
- Card Titles: text-xl md:text-2xl, font-medium
- Body Text: text-base md:text-lg (larger for readability)
- Captions/Meta: text-sm md:text-base
- Button Text: text-base md:text-lg, font-medium

## Layout System

**Spacing Primitives:**
Use Tailwind units of 3, 4, 6, 8, 12, 16 for consistent rhythm
- Tight spacing: p-3, gap-4
- Standard spacing: p-6, gap-6
- Generous spacing: p-8, gap-8, p-12
- Section spacing: py-16, py-20, py-24

**Container Strategy:**
- Full-width sections: w-full with inner max-w-7xl mx-auto px-4 md:px-6
- Content sections: max-w-6xl
- Form containers: max-w-2xl
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Component Library

### Navigation
- Sticky top navigation with clear section labels
- Large touch targets (min-h-16)
- Bottom navigation for mobile (fixed icons + labels)
- Simplified 4-5 main sections maximum

### Profile Cards
- Large avatar images (minimum 120px mobile, 160px desktop)
- Prominent verification badges (top-right corner)
- Activity count and rating displayed clearly
- Interest tags as rounded pills with generous padding
- Shadow: shadow-lg for depth

### Activity Posts (Matching Cards)
- Card-based layout with large cover image (aspect-ratio-4/3)
- Title: text-xl font-bold
- Clear date/time/location with icons
- Participant avatars shown (overlapping circles)
- Status badges (모집중, 마감임박) in top-left
- Large CTA button at bottom

### Feed/Community Posts
- Instagram-style grid for photos (aspect-square)
- 2-column grid on mobile, 3-column on desktop
- Hover overlay showing engagement metrics
- Single-column detail view with large images

### Chat Interface
- Large message bubbles with generous padding (p-4)
- Clear timestamp formatting
- Avatar shown for each message
- Input area: min-h-16 with large send button

### Forms & Inputs
- All inputs: min-h-12 md:min-h-14
- Large labels: text-base md:text-lg
- Helper text: text-sm
- Clear error states with icons
- Multi-step forms with progress indicators (large dots, not thin lines)

### Buttons
Primary CTA: px-8 py-4, text-lg, rounded-lg, shadow-md
Secondary: px-6 py-3, text-base, rounded-lg, border-2
Icon buttons: w-12 h-12 minimum

### Badges & Tags
- Verification badges: Prominent icons with checkmarks
- Category tags: px-4 py-2, text-base, rounded-full
- Status indicators: bold, contrasting

## Images

**Hero Section:**
Use authentic senior lifestyle imagery - active seniors hiking, attending concerts, socializing. Show diversity and genuine joy. Image should be high-quality, warm, aspirational. Aspect ratio 16:9 on desktop, cropped to 4:3 on mobile.

**Profile Photos:**
Circular avatars throughout. Allow up to 5 photos in profile gallery (grid display).

**Activity Posts:**
Cover images required - show the activity venue or type. Use 4:3 aspect ratio for consistency.

**Community Feed:**
Square images (1:1) for grid consistency. Support up to 10 images per post in carousel format.

**Placeholder Strategy:**
Use scenic Korean landscapes, cultural venues, outdoor activities as placeholders. Never use generic stock photos of random people.

## Page-Specific Guidelines

### Landing Page
- Hero: Full-width with background image, centered content, large headline about finding like-minded companions, primary CTA (가입하기)
- Trust section: Large verification badges showcase, 3-column grid
- How It Works: 4-step process with large icons and clear descriptions
- Activity Categories: 6-8 category cards in grid with representative images
- Testimonials: 2-column layout with senior user photos and quotes
- CTA section: Warm background with centered signup prompt

### Profile Page
- Large avatar and cover photo area
- Verification badges prominently displayed
- Interest tags in wrapped grid
- Activity history in timeline format
- Photo gallery in masonry or grid

### Activity Discovery
- Filter sidebar (collapsible on mobile)
- Card grid: 1-2-3 column responsive
- Sticky filter bar on scroll

### Chat
- Conversation list with large avatars and preview text
- Detail view: full-height with fixed input at bottom
- Group chat: Show participant count and avatars

### Community Feed
- Top tabs for different feed types (팔로잉, 추천, 인기)
- Masonry or grid layout for posts
- Infinite scroll