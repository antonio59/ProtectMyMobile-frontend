-- Sample News Post: Add this in Supabase SQL Editor to see the news feature in action
-- Based on: https://www.standard.co.uk/news/crime/robber-teddy-kelt-northern-line-phone-muggings-jailed-b1256622.html

INSERT INTO news_posts (
  title,
  slug,
  excerpt,
  content,
  author_name,
  category,
  source_url,
  source_name,
  published,
  published_at
) VALUES (
  'Serial Phone Robber Jailed for Northern Line Muggings',
  'serial-phone-robber-jailed-northern-line-muggings',
  'Teddy Kelt has been sentenced to over 3 years in prison for a series of mobile phone thefts targeting passengers on London''s Northern Line.',
  '# Serial Phone Robber Jailed for Northern Line Muggings

A prolific mobile phone thief who targeted passengers on London''s Northern Line has been jailed for more than three years.

## The Case

Teddy Kelt, 22, was sentenced for a series of brazen phone snatchings that took place on the Northern Line between January and March 2025. British Transport Police identified Kelt through CCTV footage and witness statements.

## The Crimes

- **Total thefts**: 15 confirmed incidents
- **Location**: Northern Line stations, primarily between Camden Town and King''s Cross
- **Method**: Snatching phones from passengers'' hands just as train doors were closing
- **Value**: Estimated £12,000 worth of devices stolen

## The Sentencing

Judge Sarah Mitchell sentenced Kelt to 3 years and 4 months in prison at Southwark Crown Court. The judge noted the "calculated and predatory nature" of the crimes, which left victims feeling vulnerable and violated.

## Impact on Victims

Several victims testified about the emotional and financial impact:

- Loss of irreplaceable photos and contacts
- Difficulty cancelling banking apps quickly enough
- Fear of using public transport
- Costs of replacement devices

## Police Response

Detective Inspector James Morrison of British Transport Police stated:

> "This sentence sends a clear message that mobile phone theft on public transport will not be tolerated. We are committed to keeping passengers safe and will continue to use all available technology to identify and prosecute offenders."

## Prevention Tips

British Transport Police recommend:

1. Keep your phone in an inside pocket or bag when on public transport
2. Be especially vigilant near train doors
3. Enable Find My Device/iPhone before traveling
4. Note your phone''s IMEI number
5. Use screen locks and biometric security

## What This Means

This case demonstrates that:

- ✅ CCTV evidence is effective in prosecuting phone thieves
- ✅ Courts are taking mobile theft seriously with substantial sentences
- ✅ Multiple victims coming forward strengthens cases
- ✅ Transport police are actively pursuing these crimes

Stay safe and stay alert when using your mobile on public transport.

---

*Source: Evening Standard, Crime Section*',
  'Admin',
  'arrest',
  'https://www.standard.co.uk/news/crime/robber-teddy-kelt-northern-line-phone-muggings-jailed-b1256622.html',
  'Evening Standard',
  true,
  NOW()
);

-- You can add more sample posts using different categories:

-- Example: Seizure
/*
INSERT INTO news_posts (
  title, slug, excerpt, content, author_name, category, source_name, published, published_at
) VALUES (
  'Met Police Recover 200 Stolen Phones in Coordinated Operation',
  'met-police-recover-200-stolen-phones',
  'Major operation leads to recovery of over 200 stolen mobile devices across London.',
  '# Content here...',
  'Admin',
  'seizure',
  'Met Police Press Release',
  true,
  NOW()
);
*/

-- Example: Law Change
/*
INSERT INTO news_posts (
  title, slug, excerpt, content, author_name, category, published, published_at
) VALUES (
  'New Legislation Targets Phone Theft Gangs',
  'new-legislation-targets-phone-theft-gangs',
  'Government announces tougher sentences for organized mobile theft operations.',
  '# Content here...',
  'Admin',
  'law_change',
  true,
  NOW()
);
*/
