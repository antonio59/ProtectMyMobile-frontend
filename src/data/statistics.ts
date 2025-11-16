export const theftStatistics = {
  keyFacts: [
    {
      value: "300,000+",
      label: "Phones stolen annually in the UK",
    },
    {
      value: "£350",
      label: "Average value of stolen device",
    },
    {
      value: "67%",
      label: "Of thefts occur in public places",
    },
    {
      value: "23%",
      label: "Of victims experience identity theft",
    },
  ],
  insightTimeOfDay: "Phone thefts peak between 5pm-9pm, particularly on weekdays in urban centres.",
  insightTargetedDevices: "High-end smartphones account for over 70% of all mobile thefts in the UK.",
  locations: [
    { city: "London", rate: 42 },
    { city: "Manchester", rate: 31 },
    { city: "Birmingham", rate: 29 },
    { city: "Liverpool", rate: 26 },
    { city: "Glasgow", rate: 24 },
    { city: "Leeds", rate: 22 },
    { city: "Edinburgh", rate: 19 },
    { city: "Bristol", rate: 18 },
    { city: "Cardiff", rate: 16 },
    { city: "Newcastle", rate: 15 },
  ],
  timeOfDay: [
    { time: "00:00-04:00", rate: 12 },
    { time: "04:00-08:00", rate: 8 },
    { time: "08:00-12:00", rate: 15 },
    { time: "12:00-16:00", rate: 22 },
    { time: "16:00-20:00", rate: 28 },
    { time: "20:00-00:00", rate: 15 },
  ],
  deviceTypes: [
    { type: "iPhone", percentage: 45 },
    { type: "Samsung", percentage: 30 },
    { type: "Google", percentage: 10 },
    { type: "Xiaomi", percentage: 8 },
    { type: "Other", percentage: 7 },
  ],
};

// Based on Met Police, BBC News, and Home Office data (2024)
export const keyStatistics = {
  // Met Police reported 80,588 phones stolen in London in 2024
  londonThefts2024: "80,588",
  
  // Up from 28,609 in 2020 (Met Police data)
  increaseFrom2020: "182%",
  
  // Met Police: Only 1% of phone thefts result in charge/conviction
  chargeRate: "1%",
  
  // 80,000 phones per year ÷ 365 days ÷ 24 hours ÷ 60 minutes ≈ 1 every 6.5 minutes
  theftFrequency: "1 every 6 minutes",
  
  // Estimated UK-wide based on London being 75% of national total
  ukEstimate: "107,000+",
  
  sources: [
    "Met Police Statistics (2024)",
    "BBC News Reports",
    "Home Office Crime Data"
  ]
};
