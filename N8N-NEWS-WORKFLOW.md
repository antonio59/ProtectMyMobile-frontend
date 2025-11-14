# n8n Workflow for Automated News Discovery

## Overview

This workflow automatically searches for UK mobile theft news and creates draft news posts for admin approval.

## Workflow Design

### Trigger: Schedule
- **Frequency**: Daily at 9:00 AM
- **Purpose**: Check for new articles about UK mobile thefts

### Node 1: Search Google News API
- **Service**: SerpAPI or Google Custom Search API
- **Query**: "UK mobile phone theft" OR "London phone stolen" OR "phone robbery UK" OR "mobile theft arrest"
- **Date Filter**: Last 24 hours
- **Sources**: Focus on reputable UK news (BBC, Guardian, Independent, Evening Standard, etc.)

### Node 2: Filter Results
- **Remove duplicates** (check against existing news_posts by source_url)
- **Filter by keywords**:
  - Arrest: "arrested", "charged", "jailed", "sentenced"
  - Seizure: "seized", "recovered", "confiscated"
  - Law Change: "law", "legislation", "policy", "government"
  - Statistics: "statistics", "data", "report", "numbers"
- **Exclude**: Ads, paywalled content

### Node 3: Extract Article Content
- **Use**: Web scraping or Article Extractor API
- **Extract**:
  - Title
  - Publication date
  - Full content
  - Image URL
  - Source name

### Node 4: Generate Post with AI (Optional)
- **Service**: OpenAI GPT-4 or Claude API
- **Prompt**:
  ```
  Summarize this UK mobile theft news article for a security-focused audience:
  
  Title: {title}
  Source: {source}
  Content: {content}
  
  Create:
  1. A compelling title (60 chars max)
  2. An excerpt (150 chars)
  3. A formatted blog post (markdown)
  4. Categorize: arrest/seizure/law_change/statistics/prevention_tip/other
  ```

### Node 5: Create Slug
- **Function**: Convert title to URL-friendly slug
- **Example**: "Robber Jailed for Phone Thefts" → "robber-jailed-for-phone-thefts"

### Node 6: Insert into Supabase
- **Table**: news_posts
- **Fields**:
  - title (from AI or original)
  - slug (generated)
  - excerpt (from AI or first 150 chars)
  - content (from AI or scraped)
  - author_name: "Automated News Bot"
  - category (detected/AI-generated)
  - source_url (original article)
  - source_name (e.g., "Evening Standard")
  - featured_image_url (if available)
  - published: **false** (requires admin approval)

### Node 7: Notify Admin
- **Send**: Email or Slack notification
- **Message**: "New draft article ready for review: {title}"
- **Link**: Admin panel URL

## Setup Instructions

### 1. Install n8n
```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or npm
npm install n8n -g
n8n start
```

### 2. Required API Keys

**Google Custom Search API** (or SerpAPI):
1. Go to: https://console.cloud.google.com
2. Enable Custom Search API
3. Create API key
4. Set up Custom Search Engine for UK news sites

**OpenAI API** (optional, for content generation):
1. Go to: https://platform.openai.com
2. Create API key
3. Add to n8n credentials

**Supabase**:
- URL: https://cusemqzwingcxipbcobe.supabase.co
- Service Role Key: (get from Supabase dashboard → Settings → API)

### 3. Create Workflow in n8n

1. **Schedule Trigger**:
   - Add "Schedule Trigger" node
   - Set: Daily at 09:00

2. **HTTP Request - Google Search**:
   ```json
   {
     "method": "GET",
     "url": "https://www.googleapis.com/customsearch/v1",
     "qs": {
       "key": "{{$credentials.googleApiKey}}",
       "cx": "{{$credentials.searchEngineId}}",
       "q": "UK mobile phone theft OR London phone stolen",
       "dateRestrict": "d1",
       "num": 10
     }
   }
   ```

3. **Function - Process Results**:
   ```javascript
   const items = $input.all();
   const results = [];
   
   for (const item of items) {
     if (item.json.items) {
       for (const article of item.json.items) {
         results.push({
           json: {
             title: article.title,
             url: article.link,
             snippet: article.snippet,
             source: article.displayLink
           }
         });
       }
     }
   }
   
   return results;
   ```

4. **Supabase - Check Existing**:
   ```sql
   SELECT id FROM news_posts WHERE source_url = $json.url LIMIT 1
   ```

5. **IF - Filter New Articles**:
   - Condition: `{{$node["Supabase"].json.length}} === 0`

6. **HTTP Request - Scrape Article**:
   - Use: https://extractorapi.com or jina.ai
   - Extract full content

7. **OpenAI - Generate Post** (optional):
   ```json
   {
     "model": "gpt-4",
     "messages": [
       {
         "role": "system",
         "content": "You are a security news writer. Summarize articles about UK mobile theft for a security-conscious audience."
       },
       {
         "role": "user",
         "content": "Summarize: {{$json.content}}"
       }
     ]
   }
   ```

8. **Function - Create Slug**:
   ```javascript
   const title = $json.title;
   const slug = title
     .toLowerCase()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/^-|-$/g, '');
   
   return {
     json: {
       ...$json,
       slug
     }
   };
   ```

9. **Supabase - Insert Post**:
   ```sql
   INSERT INTO news_posts (
     title,
     slug,
     excerpt,
     content,
     author_name,
     category,
     source_url,
     source_name,
     featured_image_url,
     published
   ) VALUES (
     $json.title,
     $json.slug,
     $json.excerpt,
     $json.content,
     'Automated News Bot',
     $json.category,
     $json.url,
     $json.source,
     $json.image,
     false
   )
   ```

10. **Send Email - Notify Admin**:
    ```
    Subject: New Draft News Post Ready
    
    A new article about UK mobile theft has been drafted:
    
    Title: {{$json.title}}
    Category: {{$json.category}}
    Source: {{$json.source}}
    
    Review at: https://protectmymobile.xyz/admin/news
    ```

## Manual Workflow Alternative

If you don't want to set up n8n immediately:

### Simple RSS Feed Monitor
1. Subscribe to RSS feeds:
   - https://news.google.com/rss/search?q=UK+mobile+phone+theft
   - UK news sites' crime sections

2. Use IFTTT or Zapier:
   - Trigger: New RSS item
   - Action: Create draft in Supabase

### Manual Process
1. Use Google Alerts:
   - Set up alert for "UK mobile phone theft"
   - Receive daily emails

2. Admin panel with "Quick Add" button:
   - Paste article URL
   - Auto-fetch content
   - Edit and publish

## Example News Sources to Monitor

**National News**:
- BBC News - Crime
- The Guardian - UK Crime
- The Independent
- Sky News

**London-Specific**:
- Evening Standard
- MyLondon
- Time Out London

**Police/Official**:
- Met Police News
- City of London Police
- Action Fraud

## Category Detection Keywords

```javascript
{
  "arrest": ["arrested", "charged", "jailed", "sentenced", "court", "guilty"],
  "seizure": ["seized", "recovered", "confiscated", "found"],
  "law_change": ["law", "legislation", "policy", "government", "parliament"],
  "statistics": ["statistics", "data", "report", "numbers", "increase", "decrease"],
  "prevention_tip": ["protect", "prevent", "avoid", "secure", "safety"]
}
```

## Testing the Workflow

1. **Test with a known article**:
   - URL: https://www.standard.co.uk/news/crime/robber-teddy-kelt-northern-line-phone-muggings-jailed-b1256622.html

2. **Expected result**:
   ```json
   {
     "title": "Robber Jailed for Northern Line Phone Muggings",
     "slug": "robber-jailed-for-northern-line-phone-muggings",
     "category": "arrest",
     "source_name": "Evening Standard",
     "published": false
   }
   ```

3. **Verify in Supabase**:
   - Check news_posts table
   - Should see new draft post

4. **Approve in admin panel**:
   - Review content
   - Click "Publish"
   - Post goes live

## Future Enhancements

1. **Sentiment Analysis**: Detect tone (positive/negative)
2. **Auto-tagging**: Extract locations, people, keywords
3. **Image Processing**: Auto-crop/resize images
4. **Social Media**: Auto-post to Twitter/LinkedIn
5. **Email Digest**: Weekly summary for subscribers
6. **Related Posts**: AI suggests related content

## Cost Estimate

- **n8n**: Self-hosted (free) or Cloud ($20/mo)
- **Google Custom Search**: 100 queries/day free
- **OpenAI API**: ~$0.002 per article (~$0.06/mo for 30 articles)
- **Web scraping API**: Free tier sufficient

**Total**: ~$0-20/month depending on volume
