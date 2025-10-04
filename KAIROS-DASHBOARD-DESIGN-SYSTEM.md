# Kairos Dashboard Design System

*A comprehensive guide to the visual design elements and aesthetic principles implemented in the Kairos real estate dashboard*

---

## **Design Philosophy**

### **"Calm in the chaos"**
Every element should reduce cognitive load and create a sense of calm professionalism for real estate professionals handling high-value transactions.

### **Core Principles**
- Clean, minimal layouts with generous white space
- Focus on clarity and simplicity over visual complexity
- Professional appearance suitable for high-value transactions
- Intuitive workflows that don't require technical expertise
- Trustworthy tools for working professionals

---

## **Visual Design Elements**

### **Card Design**
```css
/* Pure white backgrounds */
background: var(--kairos-chalk); /* #FFFFFC */

/* Modern rounded corners */
border-radius: 1.5rem; /* rounded-3xl */

/* Subtle depth */
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
hover: box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* hover:shadow-md */

/* Clean borders */
border: 1px solid #e5e7eb; /* border-gray-200 */

/* Generous padding */
padding: 1.5rem; /* p-6 */
```

### **Typography Hierarchy**
```css
/* Metric values - large, readable */
.metric-value {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600;
  word-break: break-words; /* Handle long numbers */
}

/* Card titles - clear hierarchy */
.card-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600;
  color: #111827; /* text-gray-900 */
}

/* Metadata - subtle */
.metadata {
  font-size: 0.75rem; /* text-xs */
  color: #6b7280; /* text-gray-500 */
}
```

---

## **Color Palette**

### **Primary Colors**
| Color | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| Kairos Chalk | `#FFFFFC` | Pure white backgrounds | `--kairos-chalk` |
| Kairos Charcoal | `#2C2C2C` | Primary text | `--kairos-charcoal` |
| Kairos Soft Black | `#1A1A1A` | Button text, emphasis | `--kairos-soft-black` |
| Kairos White Porcelain | `#F8FBF8` | Light backgrounds | `--kairos-white-porcelain` |

### **Market Activity Progress Bars**
| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Active | Chambray | `#333f91` | Active property listings |
| Pending | Mandy | `#e1516c` | Pending transactions |
| Closed | Atlantis | `#62bd2d` | Completed sales |

### **Text Colors**
```css
/* Primary text */
color: #111827; /* text-gray-900 */

/* Secondary text */
color: #6b7280; /* text-gray-500 */

/* Muted text */
color: #9ca3af; /* text-gray-400 */

/* Error/Alert text */
color: #ef4444; /* text-red-500 */
```

---

## **Layout Structure**

### **Grid System**
```css
/* Container */
.dashboard-container {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 2rem; /* p-8 */
}

/* Level 1: Executive Summary */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* Mobile */
  gap: 1.5rem; /* gap-6 */
}

@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr); /* md:grid-cols-2 */
  }
}

@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr); /* lg:grid-cols-4 */
  }
}

/* Level 2: Detailed Analysis */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .analysis-grid {
    grid-template-columns: repeat(2, 1fr); /* lg:grid-cols-2 */
  }
}

/* Level 3: Historical Context */
.historical-section {
  grid-column: 1 / -1; /* Full width */
}
```

### **Component Hierarchy**
1. **Executive Summary** - Key metrics at a glance
2. **Detailed Analysis** - Property reports, CMA, market activity, neighborhoods
3. **Historical Context** - Trends and historical data

---

## **Interactive Elements**

### **Primary Buttons**
```css
.generate-reports-btn {
  background-color: #000000; /* bg-black */
  color: #ffffff;
  padding: 0.5rem 1rem; /* px-4 py-2 */
  border-radius: 0.75rem; /* rounded-xl */
  transition: all 0.2s;
}

.generate-reports-btn:hover {
  background-color: #1f2937; /* hover:bg-gray-800 */
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); /* hover:shadow-lg */
}
```

### **Ghost Buttons**
```css
.ghost-btn {
  background: transparent;
  color: #4b5563; /* text-gray-600 */
  padding: 0.5rem;
  border-radius: 0.375rem; /* rounded-md */
  transition: colors 0.2s;
}

.ghost-btn:hover {
  color: #111827; /* hover:text-gray-900 */
  background-color: #f3f4f6; /* hover:bg-accent */
}
```

### **Input Design**
```css
.address-input {
  width: 100%;
  max-width: 56rem; /* max-w-4xl */
  height: 4rem; /* h-16 */
  padding: 0 1.5rem; /* px-6 */
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.125rem; /* text-lg */
  color: #2c2c2c; /* text-kairos-charcoal */
}

.address-input::placeholder {
  color: rgba(44, 44, 44, 0.4); /* placeholder:text-kairos-charcoal/40 */
}
```

---

## **Data Visualization**

### **Mock Data Labels**
```css
.mock-data-label {
  font-size: 0.75rem; /* text-xs */
  color: #ef4444; /* text-red-500 */
  margin-top: 0.25rem; /* mt-1 */
}
```

### **Progress Bars**
```css
.progress-bar-container {
  width: 100%;
  background-color: #f8fbf8; /* bg-kairos-white-porcelain */
  border-radius: 9999px; /* rounded-full */
  height: 0.5rem; /* h-2 */
}

.progress-bar-active {
  background-color: #333f91; /* bg-[#333f91] */
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-bar-pending {
  background-color: #e1516c; /* bg-[#e1516c] */
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-bar-closed {
  background-color: #62bd2d; /* bg-[#62bd2d] */
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}
```

---

## **Background & Atmosphere**

### **Clean Backgrounds**
```css
.dashboard-background {
  background-color: #fffffc; /* bg-kairos-chalk */
  min-height: 100vh;
}

/* Subtle grid pattern overlay */
.grid-pattern {
  background-image: 
    linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### **Spacing System**
```css
/* Section spacing */
.section-spacing {
  margin-bottom: 2rem; /* space-y-8 */
}

/* Card spacing */
.card-spacing {
  padding: 1.5rem; /* p-6 */
  margin-bottom: 1.5rem; /* gap-6 */
}

/* Element spacing */
.element-spacing {
  margin-bottom: 1rem; /* space-y-4 */
}
```

---

## **Component Specifications**

### **MetricCard**
- **Background**: Pure white (`kairos-chalk`)
- **Border**: `rounded-3xl`
- **Padding**: `p-6`
- **Typography**: `text-xl` for values, `text-xs` for labels
- **Shadow**: `shadow-sm hover:shadow-md`

### **PropertyReport**
- **Layout**: 2-column grid for property list
- **Status indicators**: Color-coded badges
- **Actions**: Ghost buttons for View/Download

### **CMASummary**
- **Price comparison**: Clear before/after values
- **Disclaimer**: Subtle text at bottom
- **Visual hierarchy**: Large price, smaller details

### **MarketActivity**
- **Progress bars**: Custom colors (Chambray, Mandy, Atlantis)
- **Count display**: Bold numbers with labels
- **Visual balance**: Equal spacing between items

### **Neighborhoods**
- **List format**: Clean, scannable layout
- **Price display**: Consistent formatting
- **Hover states**: Subtle interaction feedback

### **HistoricalTrends**
- **Chart area**: Clean background with subtle grid
- **Data points**: Clear markers
- **Trend lines**: Smooth, professional styling

---

## **Implementation Guidelines**

### **Tailwind Classes**
```css
/* Card base */
.card-base {
  @apply bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6;
}

/* Metric text */
.metric-text {
  @apply text-xl font-semibold text-gray-900 mb-1 break-words;
}

/* Label text */
.label-text {
  @apply text-xs text-gray-500 mb-2;
}

/* Mock data label */
.mock-label {
  @apply text-xs text-red-500 mt-1;
}
```

### **CSS Variables**
```css
:root {
  --kairos-chalk: #FFFFFC;
  --kairos-white-porcelain: #F8FBF8;
  --kairos-charcoal: #2C2C2C;
  --kairos-soft-black: #1A1A1A;
  --kairos-chambray: #333f91;
  --kairos-mandy: #e1516c;
  --kairos-atlantis: #62bd2d;
}
```

---

## **Quality Standards**

### **Accessibility**
- Minimum 16px font size for body text
- Proper contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader compatibility

### **Performance**
- Optimized images and icons
- Efficient CSS with minimal specificity
- Smooth transitions (200ms duration)
- Responsive design for all screen sizes

### **Consistency**
- Uniform spacing using design system tokens
- Consistent color usage across components
- Standardized interaction patterns
- Predictable layout behavior

---

*This design system ensures the Kairos dashboard maintains a professional, trustworthy appearance while providing clear, actionable information for real estate professionals.*
