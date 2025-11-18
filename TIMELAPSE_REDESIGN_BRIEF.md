# Timelapse Page Redesign Brief

## Current Problems Identified

### 1. **CRITICAL SECURITY ISSUE**
- Zoom reveals residential addresses - major privacy/security risk
- Individual location pins show exact theft locations
- Need to aggregate data to prevent address exposure

### 2. **Poor Usability**
- Timelapse not easy to follow
- Unclear what's being shown or how to interpret the data
- Small circles hard to see and understand
- No clear narrative or insights from the data

### 3. **Limited Analytics**
- Only shows circle sizes = theft counts
- No additional context or insights
- Missing useful analytics that would help viewers
- No way to compare boroughs or see trends clearly

## Requirements for Redesign

### Privacy & Security (CRITICAL)
- ✅ Must NOT show residential addresses when zooming
- ✅ Aggregate data at borough/area level only
- ✅ No individual theft locations
- ✅ Borough boundaries instead of pins
- ✅ Prevent zoom beyond borough level

### Improved Visualization
- ✅ Make temporal patterns obvious and easy to follow
- ✅ Clear visual indicators of high/low theft areas
- ✅ Better color coding and legends
- ✅ Heatmap or choropleth (colored areas) instead of circles
- ✅ Clear month/time indicator
- ✅ Smooth animations

### Enhanced Analytics
- ✅ Show multiple data dimensions:
  - Theft count trends over time
  - Peak hours/days analysis
  - Borough comparisons
  - Month-over-month changes
  - Year-over-year comparisons
- ✅ Interactive charts alongside map
- ✅ Top 5 boroughs ranking
- ✅ Trend indicators (↑ ↓)
- ✅ Contextual insights

### User Experience
- ✅ Clear instructions on how to use the tool
- ✅ Easy-to-follow timelapse narrative
- ✅ Pause to explore specific months
- ✅ Jump to specific time periods
- ✅ Mobile responsive
- ✅ Accessible (keyboard nav, screen readers)

## Target Users

1. **General Public** - Want to understand risk in their area
2. **Potential Victims** - Need to see patterns to stay safe
3. **Researchers/Journalists** - Need data for analysis
4. **Policy Makers** - Want to see trends for decision making

## Design Goals

1. **Security First** - No residential addresses exposed
2. **Insight Driven** - Help users understand patterns
3. **Actionable** - Help users make safety decisions
4. **Engaging** - Make data exploration interesting
5. **Accessible** - Work for all users on all devices

## Proposed Approach

### Map Visualization
- Switch from point markers to **borough-level choropleth**
- Color intensity = theft density
- Borough boundaries clearly defined
- Hover shows borough name + stats
- Click opens detailed analytics panel

### Analytics Dashboard
- **Timeline Chart** - Line graph showing total thefts over time
- **Top 5 Boroughs** - Ranked list with trend indicators
- **Time of Day** - Bar chart showing peak hours
- **Month Comparison** - Compare current month to previous
- **Heat Calendar** - Grid showing high/low theft days

### Timelapse Controls
- Large play/pause button
- Speed control (0.5x, 1x, 2x, 4x)
- Month picker/scrubber
- Year selector
- Auto-play with narrative captions

### Layout
```
┌─────────────────────────────────────────────────┐
│ Title + Current Period (Large)                  │
├─────────────────────────────┬───────────────────┤
│                             │                   │
│  MAP (Choropleth)           │  ANALYTICS        │
│  - Borough boundaries       │  - Timeline       │
│  - Color = theft density    │  - Top 5          │
│  - Hover = stats            │  - Peak hours     │
│                             │  - Insights       │
│                             │                   │
├─────────────────────────────┴───────────────────┤
│  TIMELAPSE CONTROLS                             │
│  [◄◄] [◄] [▶/❙❙] [►] [►►]  Timeline Slider     │
└─────────────────────────────────────────────────┘
```

## Next Steps

1. **UI/UX Designer** - Create detailed mockups and design system
2. **Full-Stack Dev** - Implement borough-level aggregation and new visualization
3. **Test** - Verify no addresses shown at any zoom level
4. **Deploy** - Replace current timelapse

---

**Priority: HIGH** - Security issue must be resolved
**Timeline: ASAP**
